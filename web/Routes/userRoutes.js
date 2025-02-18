import express from "express";
import { GetUser, registerUser } from "../Controllers/userController.js";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", registerUser);
AuthRoutes.get("/getData", GetUser)

export default AuthRoutes;