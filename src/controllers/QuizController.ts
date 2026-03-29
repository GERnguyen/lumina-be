import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { QuizService, quizService } from "../services/QuizService";

interface QuizParams {
  quizId: string;
}

interface SubmitQuizBody {
  submittedAnswers: number[];
}

export class QuizController {
  constructor(private readonly service: QuizService) {}

  getQuizDetail = async (
    req: AuthenticatedRequest & { params: QuizParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const quizId = Number(req.params.quizId);
      if (Number.isNaN(quizId)) {
        res.status(400).json({ message: "Invalid quiz id." });
        return;
      }

      const quiz = await this.service.getQuizDetail(userId, quizId);
      res.status(200).json(quiz);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch quiz detail.";

      if (message === "FORBIDDEN_NOT_ENROLLED") {
        res.status(403).json({ message: "Ban chua mua khoa hoc nay!" });
        return;
      }

      const statusCode = message === "Quiz not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  submitQuiz = async (
    req: AuthenticatedRequest & { params: QuizParams; body: SubmitQuizBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const quizId = Number(req.params.quizId);
      if (Number.isNaN(quizId)) {
        res.status(400).json({ message: "Invalid quiz id." });
        return;
      }

      const submittedAnswers = Array.isArray(req.body?.submittedAnswers)
        ? req.body.submittedAnswers
        : [];

      const result = await this.service.submitQuiz(
        userId,
        quizId,
        submittedAnswers,
      );

      res.status(200).json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit quiz.";

      if (message === "FORBIDDEN_NOT_ENROLLED") {
        res.status(403).json({ message: "Ban chua mua khoa hoc nay!" });
        return;
      }

      const statusCode = message === "Quiz not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };
}

export const quizController = new QuizController(quizService);
