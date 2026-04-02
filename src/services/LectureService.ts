import { Lecture } from "../entities/Lecture";
import { lectureRepository } from "../repositories/LectureRepository";
import { sectionRepository } from "../repositories/SectionRepository";

export class LectureService {
  async createLecture(
    sectionId: number,
    title: string,
    contentText: string,
    orderIndex: number,
  ): Promise<Lecture> {
    const section = await sectionRepository.findOne({
      where: { id: sectionId },
      select: { id: true },
    });

    if (!section) {
      throw new Error("Section not found");
    }

    const lecture = lectureRepository.create({
      title,
      contentText,
      orderIndex,
      section,
    });

    return lectureRepository.save(lecture);
  }

  async getLecturesBySection(sectionId: number): Promise<Lecture[]> {
    return lectureRepository.find({
      where: {
        section: { id: sectionId },
      },
      order: {
        orderIndex: "ASC",
      },
    });
  }

  async updateLecture(
    lectureId: number,
    title: string,
    contentText: string,
    orderIndex: number,
  ): Promise<Lecture> {
    const lecture = await lectureRepository.findOne({
      where: { id: lectureId },
      relations: {
        section: true,
      },
    });

    if (!lecture) {
      throw new Error("Lecture not found");
    }

    lecture.title = title;
    lecture.contentText = contentText;
    lecture.orderIndex = orderIndex;

    return lectureRepository.save(lecture);
  }

  async deleteLecture(lectureId: number): Promise<void> {
    const deleteResult = await lectureRepository.delete({ id: lectureId });

    if (!deleteResult.affected) {
      throw new Error("Lecture not found");
    }
  }
}

export const lectureService = new LectureService();
