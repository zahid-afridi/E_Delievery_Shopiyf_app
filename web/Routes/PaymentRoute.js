import { CreatePayment, GetPayment } from "../Controllers/PaymentController.js";
import express from "express";

const PaymentRoutes = express.Router();



PaymentRoutes.post("/create-payment", CreatePayment);
PaymentRoutes.get("/get-payment", GetPayment);

export default PaymentRoutes;
