import { Router } from "express";
import { learningController } from "../controllers/LearningController";
import { authMiddleware } from "../middlewares/auth.middleware";

const learningRoutes = Router();

learningRoutes.use(authMiddleware);
learningRoutes.get("/my-courses", learningController.getMyCourses);
learningRoutes.get("/lectures/:lectureId", learningController.getLectureDetail);

export default learningRoutes;
