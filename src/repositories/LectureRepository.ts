import { AppDataSource } from "../data-source";
import { Lecture } from "../entities/Lecture";

export const lectureRepository = AppDataSource.getRepository(Lecture);
