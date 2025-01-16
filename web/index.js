// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import connectDB from "./Utils/db.js";
connectDB();

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import AuthRoutes from "./Routes/userRoutes.js";
import StoreModel from "./Models/Store.js";

import User from "./Models/user.Model.js";
import StripeRoutes from "./Routes/Stripe.js";

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
app.use("/customapi", StripeRoutes);
app.get('/customapi',async(req,res)=>{
  console.log('api hit successfully')
  res.send('hello')
})
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
//...........................ORDER_PLACE_API...............................................
app.post('/customapi/shopify_order_place', async (req, res) => {
  try {
    const {orderData}=req.body
    
    console.log('checkBodyReq', orderData);
    // Get the shop from the query parameters
    const shop = req.query.shop;

    // Find the session for the shop
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
      first_name: "Test",
      last_name: "User",
      address1: "Karachi sadar bazar",
      city: "Karachi",
      province: "Sindh",
      country: "PK",
      zip: "74200",
    };

    // Static billing address
    order.billing_address = {
      first_name: "Test",
      last_name: "Billing",
      address1: "123 Billing Street",
      city: "Billing City",
      province: "Sindh",
      country: "PK",
      zip: "74000",
    };

    // Static email
    order.email = "test@example.com";

    // Static note
    order.note = "This is a test order.";

    // Static customer (example - you might need to adjust this)
    order.customer = {
      first_name: "Test",
      last_name: "Customer",
      email: "testcustomer@example.com",
      //verified_email: true, // You might need to set this to true or false
      // You can add more customer details here if needed
      id: 6899567624476  // you can also add customer by id
    };

    await order.save({
      update: true,
    });
    console.log('Order placed successfully:', order.id);
    res.status(200).send({ success: true, message: 'Order placed successfully', orderId: order.id });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).send({ success: false, message: 'Failed to place order', error: error.message });
  }
});
//...........................ORDER_PLACE_API END...............................................
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

app.listen(PORT);
