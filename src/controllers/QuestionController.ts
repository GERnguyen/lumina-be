import { Request, Response } from "express";
import {
  CreateAnswerInput,
  UpdateAnswerInput,
  QuestionService,
  questionService,
} from "../services/QuestionService";

interface QuizParams {
  quizId: string;
}

interface QuestionParams {
  questionId: string;
}

interface CreateQuestionBody {
  content: string;
  answers: CreateAnswerInput[];
}

interface UpdateQuestionBody {
  content: string;
  answers: UpdateAnswerInput[];
}

export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  createQuestionForInstructor = async (
    req: Request<QuizParams, unknown, CreateQuestionBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const quizId = Number(req.params.quizId);
      const content = req.body.content?.trim();
      const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

      if (Number.isNaN(quizId)) {
        res.status(400).json({ message: "Invalid quiz id." });
        return;
      }

      if (!content) {
        res.status(400).json({ message: "content is required." });
        return;
      }

      if (answers.length === 0) {
        res.status(400).json({ message: "answers must not be empty." });
        return;
      }

      const hasInvalidAnswer = answers.some(
        (answer) =>
          !answer.content?.trim() || typeof answer.isCorrect !== "boolean",
      );

      if (hasInvalidAnswer) {
        res.status(400).json({
          message: "Each answer must include content and isCorrect boolean.",
        });
        return;
      }

      const question = await this.service.createQuestionWithAnswers(
        quizId,
        content,
        answers.map((answer) => ({
          content: answer.content.trim(),
          isCorrect: answer.isCorrect,
        })),
      );

      res.status(201).json(question);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create question.";
      const statusCode = message === "Quiz not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  getQuestionsByQuizForInstructor = async (
    req: Request<QuizParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const quizId = Number(req.params.quizId);

      if (Number.isNaN(quizId)) {
        res.status(400).json({ message: "Invalid quiz id." });
        return;
      }

      const questions = await this.service.getQuestionsByQuiz(quizId);
      res.status(200).json(questions);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch questions." });
    }
  };

  updateQuestionForInstructor = async (
    req: Request<QuestionParams, unknown, UpdateQuestionBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const questionId = Number(req.params.questionId);
      const content = req.body.content?.trim();
      const answers = Array.isArray(req.body.answers) ? req.body.answers : [];

      if (Number.isNaN(questionId)) {
        res.status(400).json({ message: "Invalid question id." });
        return;
      }

      if (!content) {
        res.status(400).json({ message: "content is required." });
        return;
      }

      if (answers.length === 0) {
        res.status(400).json({ message: "answers must not be empty." });
        return;
      }

      const hasInvalidAnswer = answers.some(
        (answer) =>
          !answer.content?.trim() || typeof answer.isCorrect !== "boolean",
      );

      if (hasInvalidAnswer) {
        res.status(400).json({
          message: "Each answer must include content and isCorrect boolean.",
        });
        return;
      }

      const question = await this.service.updateQuestionWithAnswers(
        questionId,
        content,
        answers.map((answer) => ({
          content: answer.content.trim(),
          isCorrect: answer.isCorrect,
          id: answer.id,
        })),
      );

      res.status(200).json(question);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update question.";
      const statusCode = message === "Question not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  deleteQuestionForInstructor = async (
    req: Request<QuestionParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const questionId = Number(req.params.questionId);

      if (Number.isNaN(questionId)) {
        res.status(400).json({ message: "Invalid question id." });
        return;
      }

      await this.service.deleteQuestion(questionId);
      res.status(200).json({ message: "Question deleted successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete question.";
      const statusCode = message === "Question not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const questionController = new QuestionController(questionService);
