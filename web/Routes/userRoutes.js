import express from "express";
import { getUser, registerUser } from "../Controllers/userController.js";

const AuthRoutes = express.Router();

AuthRoutes.post("/register", registerUser);
AuthRoutes.get("/get-user", getUser);

export default AuthRoutes;