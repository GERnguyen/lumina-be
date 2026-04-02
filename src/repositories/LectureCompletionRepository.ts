import { AppDataSource } from "../data-source";
import { LectureCompletion } from "../entities/LectureCompletion";

export const lectureCompletionRepository =
  AppDataSource.getRepository(LectureCompletion);
