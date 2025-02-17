import mongoose from "mongoose";

const ShippingMethodSchema=new mongoose.Schema({
    ShipmentName:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true
    },
    Store_Id:{
        type:String,
        required:true
    },
    store_domain: {
      type: String,
      required: true,
    },
},{timestamps:true})

const ShippingModal= mongoose.model("ShippingMethod",ShippingMethodSchema)
export default ShippingModal


// for arry 
///
// import mongoose from "mongoose";

// const ShippingMethodSchema = new mongoose.Schema(
//   {
//     ShipmentNames: {
//       type: [String],  // Array of strings for Shipment Names
//       required: true,
//     },
//     Prices: {
//       type: [Number],  // Array of numbers for Prices
//       required: true,
//     },
//     Store_Id: {
//       type: String,
//       required: true,
//     },
//     store_domain: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const ShippingModal = mongoose.model("ShippingMethod", ShippingMethodSchema);
// export default ShippingModal;

