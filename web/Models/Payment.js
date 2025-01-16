import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  client_Id: {
    type: String,
    required: true,
  },
  client_secret: {
    type: String,
    required: true,
  },
  Payment_Type: {
    type: String,
    required: true,
    default: "stripe",
  },
  store_Id: {
    type: String,
    required: true,
  },
  store_domain: {
    type: String,
    required: true,
  },
  store_name: {
    type: String,
    required: true,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
