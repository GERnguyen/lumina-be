import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Quiz } from "../entities/Quiz";

export const quizRepository = AppDataSource.getRepository(Quiz);

export interface QuizCourseContext {
  quizId: number;
  courseId: number;
}

export class QuizRepository {
  private readonly repository: Repository<Quiz>;

  constructor(repository: Repository<Quiz>) {
    this.repository = repository;
  }

  async findQuizCourseContext(
    quizId: number,
  ): Promise<QuizCourseContext | null> {
    const row = await this.repository
      .createQueryBuilder("quiz")
      .innerJoin("quiz.section", "section")
      .innerJoin("section.course", "course")
      .where("quiz.id = :quizId", { quizId })
      .select(["quiz.id AS quizId", "course.id AS courseId"])
      .getRawOne<{ quizId: number | string; courseId: number | string }>();

    if (!row) {
      return null;
    }

    return {
      quizId: Number(row.quizId),
      courseId: Number(row.courseId),
    };
  }

  async findQuizWithQuestionsAndAnswers(quizId: number): Promise<Quiz | null> {
    return this.repository
      .createQueryBuilder("quiz")
      .leftJoinAndSelect("quiz.questions", "question")
      .leftJoinAndSelect("question.answers", "answer")
      .where("quiz.id = :quizId", { quizId })
      .orderBy("question.orderIndex", "ASC")
      .addOrderBy("answer.orderIndex", "ASC")
      .getOne();
  }
}

export const quizReadRepository = new QuizRepository(quizRepository);
