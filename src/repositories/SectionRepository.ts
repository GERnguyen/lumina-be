import { AppDataSource } from "../data-source";
import { Section } from "../entities/Section";

export const sectionRepository = AppDataSource.getRepository(Section);
