import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Question } from "../entities/Question";

export class QuestionRepository {
  private readonly repository: Repository<Question>;

  constructor() {
    this.repository = AppDataSource.getRepository(Question);
  }

  async findByQuizId(quizId: number): Promise<Question[]> {
    return this.repository.find({
      where: { quiz: { id: quizId } },
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
}

export const questionRepository = new QuestionRepository();
