// @ts-check
import path, { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import { fileURLToPath } from "url";

import connectDB from "./Utils/db.js";
connectDB();

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import AuthRoutes from "./Routes/userRoutes.js";
import StoreModel from "./Models/Store.js";

import User from "./Models/user.Model.js";
import StripeRoutes from "./Routes/Stripe.js";
import PaymentRoutes from "./Routes/PaymentRoute.js";
import Payment from "./Models/Payment.js";
import ShippingRoutes from "./Routes/ShippingRoutes.js";
import ShippingModal from "./Models/ShippingMehtods.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;


const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());

app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);
app.use(express.json());
// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());
app.use("/customapi/*", authenticateUser);

const __filename = fileURLToPath(import.meta.url); // Get the file name from import.meta.url
const __dirname = path.dirname(__filename); // Get the directory name

const PublicPaath = path.join(__dirname, "public"); // Resolve the path to the public folder

app.use(express.static(PublicPaath));
async function authenticateUser(req,res,next){
  let shop=req.query.shop
  let storeName= await shopify.config.sessionStorage.findSessionsByShop(shop)
  console.log('storename for view',storeName)
  if (shop === storeName[0].shop) {
    next()
  }else{
    res.send('user not authersiozed')
  }
}


app.use("/api", AuthRoutes);
app.use('/api',PaymentRoutes)
app.use("/api",ShippingRoutes);
app.use("/customapi", StripeRoutes);

// @ts-ignore
app.get('/customapi',async(req,res)=>{
  console.log('api hit successfully')
  res.send('hello')
})
app.use('/forPostman',ShippingRoutes)

// @ts-ignore
app.get('/forPostman',async(req,res)=>{
  res.send('working bro')
})
// weebokk try
///
// @ts-ignore
app.get('/api/store/info', async (req, res) => {
  try {
    const Store = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });
    // console.log("Storename",Store.data[0].domain)
      // console.log('Store Information',Store)
    if (Store && Store.data && Store.data.length > 0) {
      const storeName = Store.data[0].name;
      const domain = Store.data[0].domain;
      const country=Store.data[0].country;
      const Store_Id=Store.data[0].id
     

      // Check if storeName exists in the database
      const existingStore = await StoreModel.findOne({ storeName });
      const ExistUser = await User.findOne({ Store_Id });
    
      if (!existingStore) {
        // If it doesn't exist, save it
        const newStore = new StoreModel({ storeName,domain,country,Store_Id });
        await newStore.save();
    
      
      }

      // Send response with existingStore only
      res.status(200).json({StoreDetail:{
          Store:existingStore,
          User:ExistUser
      },User:ExistUser ? true : false}); // Send existingStore directly in the response
    } else {
      res.status(404).json({ message: 'Store not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
});

//...........................PAYMENT_GET_API...............................................

// @ts-ignore
app.get("/customapi/shopify_payment", async (req, res) => {
  try {
    const { store_domain } = req.query;

    // Validate store_Id
    if (!store_domain) {
      return res.status(400).json({
        status: 400,
        message: "store_domain is required",
      });
    }

    // Fetch payment and user details
    const payment = await Payment.findOne({ store_domain });
    const user = await User.findOne({ store_domain });

    // Check if both payment and user exist
    if (!payment || !user) {
      return res.status(404).json({
        status: 404,
        message: "Payment or User not found",
      });
    }

    // Return success response with payment and user details
    return res.status(200).json({
      status: 200,
      message: "Payment and User details fetched successfully",
      data: {
        payment,
        user,
      },
    });
  } catch (error) {
    console.error("Error getting payment:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

//...........................PAYMENT_GET_API...............................................

//...........................ORDER_PLACE_API...............................................
// @ts-ignore
app.post('/customapi/shopify_order_place', async (req, res) => {
  try {
    const {orderData,customerData}=req.body
    
    console.log('Customdata', customerData);
    // Get the shop from the query parameters
    const shop = req.query.shop;

    // Find the session for the shop
    // @ts-ignore
    const session = await shopify.config.sessionStorage.findSessionsByShop(shop);

    if (!session || session.length === 0) {
      return res.status(401).send({ success: false, message: 'Unauthorized: Shop session not found.' });
    }

    // Assuming you want to use the first session found
    const shopSession = session[0];

    // Create a new order object
    const order = new shopify.api.rest.Order({ session: shopSession });
    
    order.line_items = orderData.items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.final_price,
        tax_lines: [] // Add tax lines if applicable
    }));
    order.currency = orderData.currency; 
    order.total_price = orderData.total_price;

    // Static shipping address
    order.shipping_address = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      address1: customerData.streetAddress,
      city: customerData.city,
      
      country: customerData.country,

      zip: customerData.postalCode,
    };

    // Static billing address
    order.billing_address = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      address1: customerData.streetAddress,
      city: customerData.city,
      
      country: customerData.country,
      zip: customerData.postalCode,
    };

    // Static email
    order.email = customerData.email;

    // Static note
    order.note = "This is a test order.";

    // Static customer (example - you might need to adjust this)
    order.customer = {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      //verified_email: true, // You might need to set this to true or false
      // You can add more customer details here if needed
      id: 6899567624476  // you can also add customer by id
    };
    order.transactions = [
      {
        "kind": "sale",
        "status": "success",
        "amount": parseFloat(orderData.total_price) // Or calculate the correct amount
      }
    ];
    await order.save({
      update: true,
    });
    console.log('Order placed successfully with status url:', order.order_status_url);
    res.status(200).send({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send({ success: false, message: 'Failed to place order', error: error.message });
  }
});
//...........................ORDER_PLACE_API END...............................................

////################### Shipping Get for extension ###########################
// @ts-ignore
app.get('/customapi/shippingmethod',async(req,res)=>{
  const {store_domain}=req.query
  console.log('Store_Doamin shipping',store_domain)
try {
  const shipping=await ShippingModal.find({store_domain})
  if (!shipping) {
   return res.status(404).json({success:true,message:"No shipping Found"})
  }
  res.status(200).json({success:true, shipping})
} catch (error) {
  console.log('error',error)
  return res.status(500).json({success:false,error:error.message})
}

})

////################### Shipping Get for extension end ###########################
app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// @ts-ignore
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

console.log('port',PORT)
app.listen(PORT);
