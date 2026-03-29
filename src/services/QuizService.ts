import { enrollmentRepository } from "../repositories/EnrollmentRepository";
import { quizRepository } from "../repositories/QuizRepository";

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
  isPassed: boolean;
}

export class QuizService {
  async getQuizDetail(userId: number, quizId: number): Promise<QuizDetailView> {
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
    submittedAnswers: number[],
  ): Promise<QuizSubmissionResult> {
    const quiz = await this.getAuthorizedQuiz(userId, quizId);

    const sanitizedSubmittedAnswers = Array.from(
      new Set(
        submittedAnswers
          .map((answerId) => Number(answerId))
          .filter((answerId) => Number.isInteger(answerId) && answerId > 0),
      ),
    );
    const submittedSet = new Set(sanitizedSubmittedAnswers);

    const totalQuestions = quiz.questions.length;

    const correctAnswers = quiz.questions.reduce((count, question) => {
      const correctIds = question.answers
        .filter((answer) => answer.isCorrect)
        .map((answer) => answer.id);

      const submittedForQuestion = question.answers
        .map((answer) => answer.id)
        .filter((id) => submittedSet.has(id));

      const isQuestionCorrect =
        submittedForQuestion.length === correctIds.length &&
        correctIds.every((id) => submittedSet.has(id));

      return isQuestionCorrect ? count + 1 : count;
    }, 0);

    const score =
      totalQuestions === 0
        ? 0
        : Math.round((correctAnswers / totalQuestions) * 10000) / 100;

    return {
      totalQuestions,
      correctAnswers,
      score,
      isPassed: score >= 80,
    };
  }

  private async getAuthorizedQuiz(userId: number, quizId: number) {
    const context = await quizRepository.findQuizCourseContext(quizId);

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

    const quiz = await quizRepository.findQuizWithQuestionsAndAnswers(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return quiz;
  }
}

export const quizService = new QuizService();
