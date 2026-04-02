import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { QuizService, quizService } from "../services/QuizService";

interface QuizParams {
  quizId: string;
}

interface SectionQuizParams {
  sectionId: string;
}

interface SubmitQuizBody {
  selectedAnswerIds: number[];
}

interface CreateUpdateQuizBody {
  title: string;
}

export class QuizController {
  constructor(private readonly service: QuizService) {}

  createQuizForInstructor = async (
    req: AuthenticatedRequest & {
      params: SectionQuizParams;
      body: CreateUpdateQuizBody;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const sectionId = Number(req.params.sectionId);
      const title = req.body.title?.trim();

      if (Number.isNaN(sectionId)) {
        res.status(400).json({ message: "Invalid section id." });
        return;
      }

      if (!title) {
        res.status(400).json({ message: "title is required." });
        return;
      }

      const quiz = await this.service.createQuiz(sectionId, title);
      res.status(201).json(quiz);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create quiz.";
      const statusCode = message === "Section not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  getQuizzesBySectionForInstructor = async (
    req: AuthenticatedRequest & { params: SectionQuizParams },
    res: Response,
  ): Promise<void> => {
    try {
      const sectionId = Number(req.params.sectionId);

      if (Number.isNaN(sectionId)) {
        res.status(400).json({ message: "Invalid section id." });
        return;
      }

      const quizzes = await this.service.getQuizzesBySection(sectionId);
      res.status(200).json(quizzes);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch quizzes." });
    }
  };

  updateQuizForInstructor = async (
    req: AuthenticatedRequest & {
      params: QuizParams;
      body: CreateUpdateQuizBody;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const quizId = Number(req.params.quizId);
      const title = req.body.title?.trim();

      if (Number.isNaN(quizId)) {
        res.status(400).json({ message: "Invalid quiz id." });
        return;
      }

      if (!title) {
        res.status(400).json({ message: "title is required." });
        return;
      }

      const quiz = await this.service.updateQuiz(quizId, title);
      res.status(200).json(quiz);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update quiz.";
      const statusCode = message === "Quiz not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  deleteQuizForInstructor = async (
    req: AuthenticatedRequest & { params: QuizParams },
    res: Response,
  ): Promise<void> => {
    try {
      const quizId = Number(req.params.quizId);

      if (Number.isNaN(quizId)) {
        res.status(400).json({ message: "Invalid quiz id." });
        return;
      }

      await this.service.deleteQuiz(quizId);
      res.status(200).json({ message: "Quiz deleted successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete quiz.";
      const statusCode = message === "Quiz not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

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

      const quiz = await this.service.getQuizForStudent(userId, quizId);
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

      const selectedAnswerIds = Array.isArray(req.body?.selectedAnswerIds)
        ? req.body.selectedAnswerIds
        : [];

      const result = await this.service.submitQuiz(
        userId,
        quizId,
        selectedAnswerIds,
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
