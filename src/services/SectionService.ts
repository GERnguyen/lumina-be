import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Section } from "../entities/Section";
import { sectionRepository } from "../repositories/SectionRepository";

export class SectionService {
  async createSection(
    courseId: number,
    title: string,
    orderIndex: number,
  ): Promise<Section> {
    const courseRepository = AppDataSource.getRepository(Course);

    const course = await courseRepository.findOne({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const section = sectionRepository.create({
      title,
      orderIndex,
      course,
    });

    return sectionRepository.save(section);
  }

  async getSectionsByCourse(courseId: number): Promise<Section[]> {
    return sectionRepository.find({
      where: {
        course: { id: courseId },
      },
      order: {
        orderIndex: "ASC",
      },
    });
  }

  async updateSection(
    sectionId: number,
    title: string,
    orderIndex: number,
  ): Promise<Section> {
    const section = await sectionRepository.findOne({
      where: { id: sectionId },
      relations: {
        course: true,
      },
    });

    if (!section) {
      throw new Error("Section not found");
    }

    section.title = title;
    section.orderIndex = orderIndex;

    return sectionRepository.save(section);
  }

  async deleteSection(sectionId: number): Promise<void> {
    const deleteResult = await sectionRepository.delete({ id: sectionId });

    if (!deleteResult.affected) {
      throw new Error("Section not found");
    }
  }
}

export const sectionService = new SectionService();
