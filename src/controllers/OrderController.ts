import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { OrderService, orderService } from "../services/OrderService";

interface OrderParams {
  id: string;
}

interface CheckoutBody {
  useRewardPoints?: boolean;
}

interface ConfirmPaymentBody {
  useRewardPoints?: boolean;
}

export class OrderController {
  constructor(private readonly service: OrderService) {}

  getMyOrders = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const orders = await this.service.getMyOrders(userId);
      res.status(200).json(orders);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch orders.";
      const statusCode = message === "User not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  getById = async (
    req: AuthenticatedRequest & { params: OrderParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const orderId = Number(req.params.id);
      if (Number.isNaN(orderId)) {
        res.status(400).json({ message: "Invalid order id." });
        return;
      }

      const order = await this.service.getOrderById(userId, orderId);
      if (!order) {
        res.status(404).json({ message: "Order not found." });
        return;
      }

      res.status(200).json(order);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch order detail." });
    }
  };

  checkout = async (
    req: AuthenticatedRequest & { body: CheckoutBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const useRewardPoints = req.body?.useRewardPoints === true;
      const order = await this.service.checkout(userId, useRewardPoints);
      res.status(200).json(order);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed.";
      const statusCode =
        message === "User not found"
          ? 404
          : message === "Cart is empty" ||
              message ===
                "Ban dang co mot don hang cho thanh toan. Vui long hoan tat hoac huy don hang do truoc khi tao don moi."
            ? 400
            : 500;

      res.status(statusCode).json({ message });
    }
  };

  confirmPayment = async (
    req: AuthenticatedRequest & {
      params: OrderParams;
      body: ConfirmPaymentBody;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const orderId = Number(req.params.id);
      if (Number.isNaN(orderId)) {
        res.status(400).json({ message: "Invalid order id." });
        return;
      }

      const useRewardPoints = req.body?.useRewardPoints === true;
      const order = await this.service.confirmPayment(
        userId,
        orderId,
        useRewardPoints,
      );
      res.status(200).json(order);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Confirm payment failed.";
      const statusCode =
        message === "User not found" || message === "Order not found"
          ? 404
          : message === "Order is not in pending state" ||
              message === "Payment failed"
            ? 400
            : 500;

      res.status(statusCode).json({ message });
    }
  };

  cancelOrder = async (
    req: AuthenticatedRequest & { params: OrderParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const orderId = Number(req.params.id);
      if (Number.isNaN(orderId)) {
        res.status(400).json({ message: "Invalid order id." });
        return;
      }

      const order = await this.service.cancelOrder(userId, orderId);
      res.status(200).json(order);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cancel order failed.";
      const statusCode =
        message === "Order not found"
          ? 404
          : message === "Only pending orders can be cancelled"
            ? 400
            : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const orderController = new OrderController(orderService);
