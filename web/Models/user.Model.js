import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  customerId: { type: String, required: true },
  serviceId: { type: String, required: true },
  Store_Id:{
    type:String,
    required:true
},
store_domain: {
  type: String,
  required: true,
},
  
});

const User = mongoose.model("User", userSchema);

export default User;
