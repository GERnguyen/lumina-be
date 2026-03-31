import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  SubmitReviewInput,
  ReviewService,
  reviewService,
} from "../services/ReviewService";

interface CreateReviewBody {
  courseId: number;
  rating: number;
  comment?: string;
}

interface CourseParams {
  courseId: string;
}

export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  submitReview = async (
    req: AuthenticatedRequest & { body: CreateReviewBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const payload: SubmitReviewInput = {
        courseId: Number(req.body.courseId),
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };

      if (!payload.courseId || Number.isNaN(payload.courseId)) {
        res.status(400).json({ message: "courseId is required." });
        return;
      }

      if (Number.isNaN(payload.rating)) {
        res.status(400).json({ message: "rating is required." });
        return;
      }

      const result = await this.service.submitReview(userId, payload);
      res.status(201).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save review.";

      const statusCode =
        message === "Bạn cần hoàn thành mua khóa học để đánh giá"
          ? 403
          : message === "Bạn đã đánh giá khóa học này rồi" ||
              message === "Rating must be an integer from 1 to 5"
            ? 400
            : message === "Course not found" || message === "User not found"
              ? 404
              : 500;

      res.status(statusCode).json({ message });
    }
  };

  getCourseReviews = async (
    req: AuthenticatedRequest & { params: CourseParams },
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.courseId);

      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const result = await this.service.getCourseReviews(courseId);
      res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch reviews.";
      res.status(500).json({ message });
    }
  };
}

export const reviewController = new ReviewController(reviewService);
