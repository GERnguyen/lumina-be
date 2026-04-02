import { enrollmentRepository } from "../repositories/EnrollmentRepository";
import { Quiz } from "../entities/Quiz";
import { quizAttemptRepository } from "../repositories/QuizAttemptRepository";
import {
  quizReadRepository,
  quizRepository,
} from "../repositories/QuizRepository";
import { sectionRepository } from "../repositories/SectionRepository";

export interface QuizAnswerView {
  id: number;
  content: string;
  orderIndex: number;
}

export interface QuizQuestionView {
  id: number;
  content: string;
  orderIndex: number;
  answers: QuizAnswerView[];
}

export interface QuizDetailView {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  questions: QuizQuestionView[];
}

export interface QuizSubmissionResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

export class QuizService {
  async createQuiz(sectionId: number, title: string): Promise<Quiz> {
    const section = await sectionRepository.findOne({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new Error("Section not found");
    }

    const quiz = quizRepository.create({
      title,
      section,
    });

    return quizRepository.save(quiz);
  }

  async getQuizzesBySection(sectionId: number): Promise<Quiz[]> {
    return quizRepository.find({
      where: {
        section: { id: sectionId },
      },
      order: {
        orderIndex: "ASC",
      },
    });
  }

  async updateQuiz(quizId: number, title: string): Promise<Quiz> {
    const quiz = await quizRepository.findOne({
      where: { id: quizId },
      relations: {
        section: true,
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    quiz.title = title;

    return quizRepository.save(quiz);
  }

  async deleteQuiz(quizId: number): Promise<void> {
    const deleteResult = await quizRepository.delete({ id: quizId });

    if (!deleteResult.affected) {
      throw new Error("Quiz not found");
    }
  }

  async getQuizForStudent(
    userId: number,
    quizId: number,
  ): Promise<QuizDetailView> {
    const quiz = await this.getAuthorizedQuiz(userId, quizId);

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      orderIndex: quiz.orderIndex,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        content: question.content,
        orderIndex: question.orderIndex,
        answers: question.answers.map((answer) => ({
          id: answer.id,
          content: answer.content,
          orderIndex: answer.orderIndex,
        })),
      })),
    };
  }

  async submitQuiz(
    userId: number,
    quizId: number,
    selectedAnswerIds: number[],
  ): Promise<QuizSubmissionResult> {
    const quiz = await this.getAuthorizedQuiz(userId, quizId);

    const sanitizedSubmittedAnswers = Array.from(
      new Set(
        selectedAnswerIds
          .map((answerId) => Number(answerId))
          .filter((answerId) => Number.isInteger(answerId) && answerId > 0),
      ),
    );
    const submittedSet = new Set(sanitizedSubmittedAnswers);

    const totalQuestions = quiz.questions.length;

    const correctAnswers = quiz.questions.reduce((count, question) => {
      const correctAnswer = question.answers.find((answer) => answer.isCorrect);
      const isQuestionCorrect =
        !!correctAnswer && submittedSet.has(correctAnswer.id);

      return isQuestionCorrect ? count + 1 : count;
    }, 0);

    const score =
      totalQuestions === 0
        ? 0
        : Math.round((correctAnswers / totalQuestions) * 10000) / 100;

    const attempt = quizAttemptRepository.create({
      user: { id: userId },
      quiz: { id: quizId },
      score,
      totalQuestions,
      correctAnswers,
    });

    await quizAttemptRepository.save(attempt);

    return {
      totalQuestions,
      correctAnswers,
      score,
    };
  }

  private async getAuthorizedQuiz(userId: number, quizId: number) {
    const context = await quizReadRepository.findQuizCourseContext(quizId);

    if (!context) {
      throw new Error("Quiz not found");
    }

    const hasEnrollment = await enrollmentRepository.hasEnrollment(
      userId,
      context.courseId,
    );

    if (!hasEnrollment) {
      throw new Error("FORBIDDEN_NOT_ENROLLED");
    }

    const quiz =
      await quizReadRepository.findQuizWithQuestionsAndAnswers(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return quiz;
  }
}

export const quizService = new QuizService();
