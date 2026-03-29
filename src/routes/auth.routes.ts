import { Router } from "express";
import { authController } from "../controllers/AuthController";

const authRoutes = Router();

authRoutes.post("/send-otp", authController.sendOtp);
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/reset-password", authController.resetPassword);

export default authRoutes;
