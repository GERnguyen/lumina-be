import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { User } from "../entities/User";
import { enrollmentRepository } from "../repositories/EnrollmentRepository";
import {
  CourseReviewItem,
  reviewRepository,
  ReviewRepository,
} from "../repositories/ReviewRepository";

export interface CreateOrUpdateReviewInput {
  courseId: number;
  rating: number;
  comment?: string;
}

export interface CourseReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: CourseReviewItem[];
}

export class ReviewService {
  constructor(private readonly repo: ReviewRepository) {}

  async createOrUpdateReview(
    userId: number,
    input: CreateOrUpdateReviewInput,
  ): Promise<CourseReviewItem> {
    const courseRepository = AppDataSource.getRepository(Course);

    const course = await courseRepository.findOne({
      where: { id: input.courseId },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const hasEnrollment = await enrollmentRepository.hasEnrollment(
      userId,
      input.courseId,
    );

    if (!hasEnrollment) {
      throw new Error("FORBIDDEN_NOT_ENROLLED");
    }

    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be an integer from 1 to 5");
    }

    const sanitizedComment = input.comment?.trim() || undefined;

    const existingReview = await this.repo.findByUserAndCourse(
      userId,
      input.courseId,
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = sanitizedComment;
      await this.repo.save(existingReview);
    } else {
      await this.repo.create({
        userId,
        courseId: input.courseId,
        rating,
        comment: sanitizedComment,
      });

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (user) {
        user.rewardPoints = (user.rewardPoints ?? 0) + 50;
        await userRepository.save(user);
      }
    }

    const refreshedReviews = await this.repo.findByCourseId(input.courseId);
    const ownReview = refreshedReviews.find(
      (review) => review.user.id === userId,
    );

    if (!ownReview) {
      throw new Error("Failed to save review");
    }

    return ownReview;
  }

  async getCourseReviews(courseId: number): Promise<CourseReviewSummary> {
    const reviews = await this.repo.findByCourseId(courseId);

    const totalReviews = reviews.length;
    const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating =
      totalReviews === 0
        ? 0
        : Math.round((ratingSum / totalReviews) * 100) / 100;

    return {
      averageRating,
      totalReviews,
      reviews,
    };
  }
}

export const reviewService = new ReviewService(reviewRepository);
