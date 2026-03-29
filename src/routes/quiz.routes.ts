import { Router } from "express";
import { quizController } from "../controllers/QuizController";
import { authMiddleware } from "../middlewares/auth.middleware";

const quizRoutes = Router();

quizRoutes.use(authMiddleware);
quizRoutes.get("/quizzes/:quizId", quizController.getQuizDetail);
quizRoutes.post("/quizzes/:quizId/submit", quizController.submitQuiz);

export default quizRoutes;
