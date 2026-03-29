import { Router } from "express";
import { orderController } from "../controllers/OrderController";
import { authMiddleware } from "../middlewares/auth.middleware";

const orderRoutes = Router();

orderRoutes.get("/my-orders", authMiddleware, orderController.getMyOrders);
orderRoutes.get("/:id", authMiddleware, orderController.getById);
orderRoutes.post("/checkout", authMiddleware, orderController.checkout);
orderRoutes.post("/:id/cancel", authMiddleware, orderController.cancelOrder);
orderRoutes.post(
  "/:id/confirm-payment",
  authMiddleware,
  orderController.confirmPayment,
);

export default orderRoutes;
