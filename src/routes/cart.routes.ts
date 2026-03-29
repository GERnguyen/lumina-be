import { Router } from "express";
import { cartController } from "../controllers/CartController";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRoutes = Router();

cartRoutes.get("/", authMiddleware, cartController.getCart);
cartRoutes.post("/", authMiddleware, cartController.addToCart);

export default cartRoutes;
