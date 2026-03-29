import { In, Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Answer } from "../entities/Answer";

export class AnswerRepository {
  private readonly repository: Repository<Answer>;

  constructor() {
    this.repository = AppDataSource.getRepository(Answer);
  }

  async findByIds(answerIds: number[]): Promise<Answer[]> {
    if (answerIds.length === 0) {
      return [];
    }

    return this.repository.find({
      where: {
        id: In(answerIds),
      },
      relations: {
        question: true,
      },
    });
  }
}

export const answerRepository = new AnswerRepository();
