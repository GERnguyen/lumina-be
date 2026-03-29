import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Enrollment } from "../entities/Enrollment";

export interface MyCourseItem {
  courseId: number;
  title: string;
  image: string | null;
  progressPercentage: number;
}

export class EnrollmentRepository {
  private readonly repository: Repository<Enrollment>;

  constructor() {
    this.repository = AppDataSource.getRepository(Enrollment);
  }

  async findMyCourses(userId: number): Promise<MyCourseItem[]> {
    const rows = await this.repository
      .createQueryBuilder("enrollment")
      .innerJoin("enrollment.course", "course")
      .where("enrollment.userId = :userId", { userId })
      .select([
        "course.id AS courseId",
        "course.title AS title",
        "course.thumbnail_url AS image",
        "enrollment.progress_percent AS progressPercentage",
      ])
      .orderBy("enrollment.enrolled_at", "DESC")
      .getRawMany<{
        courseId: number | string;
        title: string;
        image: string | null;
        progressPercentage: number | string;
      }>();

    return rows.map((row) => ({
      courseId: Number(row.courseId),
      title: row.title,
      image: row.image,
      progressPercentage: Number(row.progressPercentage),
    }));
  }

  async hasEnrollment(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.repository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
      select: {
        id: true,
      },
    });

    return Boolean(enrollment);
  }
}

export const enrollmentRepository = new EnrollmentRepository();
