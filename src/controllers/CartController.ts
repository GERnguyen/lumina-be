import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  AddToCartInput,
  CartService,
  cartService,
} from "../services/CartService";

interface AddToCartBody {
  courseId: number;
}

interface RemoveFromCartParams {
  courseId: string;
}

export class CartController {
  constructor(private readonly service: CartService) {}

  getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const cart = await this.service.getCart(userId);
      res.status(200).json(cart);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch cart.";
      const statusCode = message === "User not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  addToCart = async (
    req: AuthenticatedRequest & { body: AddToCartBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const payload: AddToCartInput = {
        courseId: Number(req.body.courseId),
      };

      if (!payload.courseId || Number.isNaN(payload.courseId)) {
        res.status(400).json({ message: "courseId is required." });
        return;
      }

      const cart = await this.service.addToCart(userId, payload);
      res.status(200).json(cart);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add to cart.";
      const statusCode =
        message === "Course not found"
          ? 404
          : message === "You already purchased this course" ||
              message === "Course already exists in cart" ||
              message === "Course is not available"
            ? 400
            : 500;

      res.status(statusCode).json({ message });
    }
  };

  removeFromCart = async (
    req: AuthenticatedRequest & { params: RemoveFromCartParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courseId = Number(req.params.courseId);
      if (!courseId || Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      await this.service.removeFromCart(userId, courseId);
      res.status(200).json({ message: "Removed course from cart." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove from cart.";
      const statusCode = message === "User not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const cartController = new CartController(cartService);
