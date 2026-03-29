import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { WishlistService, wishlistService } from "../services/WishlistService";

interface ToggleWishlistBody {
  courseId: number;
}

export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  toggle = async (
    req: AuthenticatedRequest & { body: ToggleWishlistBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courseId = Number(req.body.courseId);
      if (!courseId || Number.isNaN(courseId)) {
        res.status(400).json({ message: "courseId is required." });
        return;
      }

      const result = await this.service.toggle(userId, courseId);
      res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update wishlist.";
      const statusCode =
        message === "Course not found" || message === "User not found"
          ? 404
          : 500;

      res.status(statusCode).json({ message });
    }
  };

  getWishlist = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courses = await this.service.getWishlist(userId);
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch wishlist." });
    }
  };
}

export const wishlistController = new WishlistController(wishlistService);
