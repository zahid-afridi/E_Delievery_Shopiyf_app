import { DeliveryMethod } from "@shopify/shopify-api";

import User from "./Models/user.Model.js";

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log('customerdata',payload)
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },
  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      let AccessToken=null
      const payload = JSON.parse(body);
       const ExistUser= await User.findOne({ store_domain: shop });
      //  console.log('FindStore',ExistUser)
      if (payload.shipping_lines[0].source=='Ez Delivery') {
        const Token= await fetch('https://wrmx.manage.onro.app/api/v1/customer/auth/access-token',{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            "clientId": ExistUser.clientId,
            "clientSecret": ExistUser.clientSecret
          })
         })
         const tokendata=await Token.json()
         AccessToken=tokendata.data.accessToken
      }
      //  console.log('tokenData',tokendata)
      const data = {
        customerId: "ckgpMY0eIwXcsSoJJx09h",
        pickup: {
          address: "N/A",
          addressDetail: "N/A",
          completeAfter: 0,
          completeBefore: 0,
          coordinates: [0, 0],
          fullName: "N/A",
          phone: "N/A",
          email: "abcd@pickup.org",
          placeId: "N/A",
        },
        delivery: {
          address: payload.shipping_address?.address1 || "N/A",
          addressDetail: "N/A",
          completeAfter: 0,
          completeBefore: 0,
          coordinates: [
            payload.shipping_address?.latitude || 0,
            payload.shipping_address?.longitude || 0,
          ],
          fullName: `${payload.shipping_address?.first_name } ${payload.shipping_address?.last_name}  ` || "N/A",
          phone: payload.shipping_address?.phone || "N/A",
          email: payload.customer?.email || "abcd@delivery.org",
          placeId: "N/A",
        },
        service: {
          id: "1Vr4gyMBELnYNyXIpyYHE",
          options: [
            {
              id: "1Vr4gyMBELnYNyXIpyYHE",
              dataId: "QQNWe9WRid2y0mOA0bmt_",
            },
            {
              id: "JlI_Ez5wyNuXMHq4FCm_m",
              inputValue: "20 lbs",
            },
            {
              id: "ElGWocOJaKXTcjW782jbr",
              dataId: "N/A",
            },
          ],
        },
        paymentMethod: "Cash",
        paymentSide: "Sender",
        draft: false,
        codAmount: payload.total_price || 0,
        note: payload.note || "N/A",
        referenceId: payload.name || "N/A",
      };
    
      if (AccessToken) {
        const ez = await fetch(
          "https://wrmx.manage.onro.app/api/v1/customer/order/pickup-delivery",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${AccessToken}`,
            },
            body: JSON.stringify(data),
          }
        );
        const ezdata = await ez.json();
        console.log("ez data", ezdata);
      }else{
        console.log('token not found')
      
      }
      // console.log("Order created:", payload);
    },
  },
  APP_UNINSTALLED:{
     deliveryMethod:DeliveryMethod.Http,
     callbackUrl: "/api/webhooks",
     callback: async (topic, shop, body, webhookId) => {
       const payload = JSON.parse(body);
       // Handle order create event
       console.log("App uninstall successfully :", payload);
       // You can add your custom logic here to process the order data
     },
   }
};
