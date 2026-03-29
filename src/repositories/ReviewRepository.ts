import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Review } from "../entities/Review";

export interface CourseReviewItem {
  id: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    fullName: string | null;
    avatar: string | null;
  };
}

export interface UpsertReviewInput {
  userId: number;
  courseId: number;
  rating: number;
  comment?: string;
}

export class ReviewRepository {
  private readonly repository: Repository<Review>;

  constructor() {
    this.repository = AppDataSource.getRepository(Review);
  }

  async findByCourseId(courseId: number): Promise<CourseReviewItem[]> {
    const rows = await this.repository
      .createQueryBuilder("review")
      .innerJoin("review.user", "user")
      .leftJoin("user.profile", "profile")
      .where("review.courseId = :courseId", { courseId })
      .select([
        "review.id AS reviewId",
        "review.rating AS rating",
        "review.comment AS comment",
        "review.created_at AS createdAt",
        "review.updated_at AS updatedAt",
        "user.id AS userId",
        "profile.full_name AS fullName",
        "profile.avatar AS avatar",
      ])
      .orderBy("review.created_at", "DESC")
      .getRawMany<{
        reviewId: number | string;
        rating: number | string;
        comment: string | null;
        createdAt: Date | string;
        updatedAt: Date | string;
        userId: number | string;
        fullName: string | null;
        avatar: string | null;
      }>();

    return rows.map((row) => ({
      id: Number(row.reviewId),
      rating: Number(row.rating),
      comment: row.comment ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      user: {
        id: Number(row.userId),
        fullName: row.fullName,
        avatar: row.avatar,
      },
    }));
  }

  async findByUserAndCourse(
    userId: number,
    courseId: number,
  ): Promise<Review | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
      relations: {
        user: true,
        course: true,
      },
    });
  }

  async create(input: UpsertReviewInput): Promise<Review> {
    const review = this.repository.create({
      user: { id: input.userId },
      course: { id: input.courseId },
      rating: input.rating,
      comment: input.comment,
    });

    return this.repository.save(review);
  }

  async save(review: Review): Promise<Review> {
    return this.repository.save(review);
  }
}

export const reviewRepository = new ReviewRepository();
