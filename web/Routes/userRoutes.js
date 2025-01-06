import express from "express";
import { registerUser } from "../Controllers/userController.js";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", registerUser);

export default AuthRoutes;