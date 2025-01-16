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
