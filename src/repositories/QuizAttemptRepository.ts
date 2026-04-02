import { AppDataSource } from "../data-source";
import { QuizAttempt } from "../entities/QuizAttempt";

export const quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
