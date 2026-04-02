import { AppDataSource } from "../data-source";
import { Enrollment } from "../entities/Enrollment";
import { Lecture } from "../entities/Lecture";
import { lectureCompletionRepository } from "../repositories/LectureCompletionRepository";
import { lectureRepository } from "../repositories/LectureRepository";
import {
  enrollmentRepository,
  MyCourseItem,
} from "../repositories/EnrollmentRepository";

export interface LectureDetail {
  id: number;
  title: string;
  contentText?: string;
  videoUrl?: string;
  orderIndex: number;
  section: {
    id: number;
    title: string;
    orderIndex: number;
  };
}

export class LearningService {
  async getMyCourses(userId: number): Promise<MyCourseItem[]> {
    return enrollmentRepository.findMyCourses(userId);
  }

  async getLectureDetail(
    userId: number,
    lectureId: number,
  ): Promise<LectureDetail> {
    const lectureRepository = AppDataSource.getRepository(Lecture);

    const lectureWithCourse = await lectureRepository
      .createQueryBuilder("lecture")
      .innerJoin("lecture.section", "section")
      .innerJoin("section.course", "course")
      .where("lecture.id = :lectureId", { lectureId })
      .select(["lecture.id AS lectureId", "course.id AS courseId"])
      .getRawOne<{ lectureId: number | string; courseId: number | string }>();

    if (!lectureWithCourse) {
      throw new Error("Lecture not found");
    }

    const courseId = Number(lectureWithCourse.courseId);
    const hasAccess = await enrollmentRepository.hasEnrollment(
      userId,
      courseId,
    );

    if (!hasAccess) {
      throw new Error("FORBIDDEN_NOT_ENROLLED");
    }

    const lecture = await lectureRepository.findOne({
      where: { id: lectureId },
      relations: {
        section: true,
      },
      select: {
        id: true,
        title: true,
        contentText: true,
        videoUrl: true,
        orderIndex: true,
        section: {
          id: true,
          title: true,
          orderIndex: true,
        },
      },
    });

    if (!lecture) {
      throw new Error("Lecture not found");
    }

    return {
      id: lecture.id,
      title: lecture.title,
      contentText: lecture.contentText,
      videoUrl: lecture.videoUrl,
      orderIndex: lecture.orderIndex,
      section: {
        id: lecture.section.id,
        title: lecture.section.title,
        orderIndex: lecture.section.orderIndex,
      },
    };
  }

  async markLectureCompleted(
    userId: number,
    lectureId: number,
  ): Promise<Enrollment> {
    const enrollmentDataSourceRepository =
      AppDataSource.getRepository(Enrollment);

    const lectureWithCourse = await lectureRepository
      .createQueryBuilder("lecture")
      .innerJoin("lecture.section", "section")
      .innerJoin("section.course", "course")
      .where("lecture.id = :lectureId", { lectureId })
      .select(["lecture.id AS lectureId", "course.id AS courseId"])
      .getRawOne<{ lectureId: number | string; courseId: number | string }>();

    if (!lectureWithCourse) {
      throw new Error("Lecture not found");
    }

    const courseId = Number(lectureWithCourse.courseId);

    const hasAccess = await enrollmentRepository.hasEnrollment(
      userId,
      courseId,
    );
    if (!hasAccess) {
      throw new Error("FORBIDDEN_NOT_ENROLLED");
    }

    const enrollment = await enrollmentDataSourceRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
      relations: {
        user: true,
        course: true,
      },
    });

    if (!enrollment) {
      throw new Error("FORBIDDEN_NOT_ENROLLED");
    }

    const completion = await lectureCompletionRepository.findOne({
      where: {
        user: { id: userId },
        lecture: { id: lectureId },
      },
      select: {
        id: true,
      },
    });

    if (!completion) {
      const lectureCompletion = lectureCompletionRepository.create({
        user: { id: userId },
        lecture: { id: lectureId },
      });

      await lectureCompletionRepository.save(lectureCompletion);
    }

    const totalLectures = await lectureRepository
      .createQueryBuilder("lecture")
      .innerJoin("lecture.section", "section")
      .innerJoin("section.course", "course")
      .where("course.id = :courseId", { courseId })
      .getCount();

    const completedLectures = await lectureCompletionRepository
      .createQueryBuilder("completion")
      .innerJoin("completion.lecture", "lecture")
      .innerJoin("lecture.section", "section")
      .innerJoin("section.course", "course")
      .where("completion.userId = :userId", { userId })
      .andWhere("course.id = :courseId", { courseId })
      .getCount();

    const rawProgress =
      totalLectures === 0 ? 0 : (completedLectures / totalLectures) * 100;
    const progressPercent = Math.min(100, Math.round(rawProgress * 100) / 100);

    enrollment.progressPercent = progressPercent;

    if (progressPercent >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    return enrollmentDataSourceRepository.save(enrollment);
  }
}

export const learningService = new LearningService();
