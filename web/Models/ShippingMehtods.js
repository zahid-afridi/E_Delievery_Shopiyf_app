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
