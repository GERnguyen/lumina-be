import { AppDataSource } from "../data-source";
import { Question } from "../entities/Question";

export const questionRepository = AppDataSource.getRepository(Question);
