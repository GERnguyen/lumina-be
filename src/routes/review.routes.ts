import { Router } from "express";
import { reviewController } from "../controllers/ReviewController";
import { authMiddleware } from "../middlewares/auth.middleware";

const reviewRoutes = Router();

reviewRoutes.post("/", authMiddleware, reviewController.submitReview);
reviewRoutes.get("/course/:courseId", reviewController.getCourseReviews);

export default reviewRoutes;
