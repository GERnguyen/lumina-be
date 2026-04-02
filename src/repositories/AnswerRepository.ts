import { AppDataSource } from "../data-source";
import { Answer } from "../entities/Answer";

export const answerRepository = AppDataSource.getRepository(Answer);
