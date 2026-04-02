import { Answer } from "../entities/Answer";
import { Question } from "../entities/Question";
import { answerRepository } from "../repositories/AnswerRepository";
import { questionRepository } from "../repositories/QuestionRepository";
import { quizRepository } from "../repositories/QuizRepository";

export interface CreateAnswerInput {
  content: string;
  isCorrect: boolean;
}

export interface UpdateAnswerInput {
  id?: number;
  content: string;
  isCorrect: boolean;
}

export class QuestionService {
  async createQuestionWithAnswers(
    quizId: number,
    content: string,
    answers: CreateAnswerInput[],
  ): Promise<Question> {
    const quiz = await quizRepository.findOne({
      where: { id: quizId },
      select: { id: true },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const question = questionRepository.create({
      content,
      quiz,
    });

    const savedQuestion = await questionRepository.save(question);

    const answerEntities = answers.map((answer, index) =>
      answerRepository.create({
        content: answer.content,
        isCorrect: answer.isCorrect,
        orderIndex: index + 1,
        question: savedQuestion,
      }),
    );

    if (answerEntities.length > 0) {
      await answerRepository.save(answerEntities);
    }

    const questionWithAnswers = await questionRepository.findOne({
      where: { id: savedQuestion.id },
      relations: {
        answers: true,
      },
      order: {
        answers: {
          orderIndex: "ASC",
        },
      },
    });

    if (!questionWithAnswers) {
      throw new Error("Question not found");
    }

    return questionWithAnswers;
  }

  async getQuestionsByQuiz(quizId: number): Promise<Question[]> {
    return questionRepository.find({
      where: {
        quiz: { id: quizId },
      },
      relations: {
        answers: true,
      },
      order: {
        orderIndex: "ASC",
        answers: {
          orderIndex: "ASC",
        },
      },
    });
  }

  async updateQuestionWithAnswers(
    questionId: number,
    content: string,
    answers: UpdateAnswerInput[],
  ): Promise<Question> {
    const question = await questionRepository.findOne({
      where: { id: questionId },
      relations: {
        quiz: true,
      },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    question.content = content;
    await questionRepository.save(question);

    await answerRepository.delete({ question: { id: questionId } });

    const answerEntities = answers.map((answer, index) =>
      answerRepository.create({
        content: answer.content,
        isCorrect: answer.isCorrect,
        orderIndex: index + 1,
        question,
      }),
    );

    if (answerEntities.length > 0) {
      await answerRepository.save(answerEntities);
    }

    const questionWithAnswers = await questionRepository.findOne({
      where: { id: question.id },
      relations: {
        answers: true,
      },
      order: {
        answers: {
          orderIndex: "ASC",
        },
      },
    });

    if (!questionWithAnswers) {
      throw new Error("Question not found");
    }

    return questionWithAnswers;
  }

  async deleteQuestion(questionId: number): Promise<void> {
    const deleteResult = await questionRepository.delete({ id: questionId });

    if (!deleteResult.affected) {
      throw new Error("Question not found");
    }
  }
}

export const questionService = new QuestionService();
