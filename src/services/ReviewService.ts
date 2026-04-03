import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Enrollment } from "../entities/Enrollment";
import { Review } from "../entities/Review";
import { User } from "../entities/User";
import {
  CourseReviewItem,
  reviewRepository,
  ReviewRepository,
} from "../repositories/ReviewRepository";

export interface SubmitReviewInput {
  courseId: number;
  rating: number;
  comment?: string;
}

export interface SubmitReviewResult {
  message: string;
  rewardPointsAdded: number;
  totalRewardPoints: number;
  review: {
    id: number;
    rating: number;
    comment?: string;
    createdAt: Date;
  };
  courseStats: {
    averageRating: number;
    reviewCount: number;
  };
}

export interface CourseReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: CourseReviewItem[];
}

export interface ReplyReviewInput {
  reviewId: number;
  replyComment: string;
}

export interface ReplyReviewResult {
  id: number;
  instructorReply?: string;
  instructorRepliedAt?: Date;
}

export class ReviewService {
  constructor(private readonly repo: ReviewRepository) {}

  async submitReview(
    userId: number,
    input: SubmitReviewInput,
  ): Promise<SubmitReviewResult> {
    const rating = Number(input.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be an integer from 1 to 5");
    }

    const sanitizedComment = input.comment?.trim() || undefined;

    return AppDataSource.manager.transaction(async (manager) => {
      const courseRepository = manager.getRepository(Course);
      const userRepository = manager.getRepository(User);
      const enrollmentRepository = manager.getRepository(Enrollment);
      const reviewRepository = manager.getRepository(Review);

      const course = await courseRepository.findOne({
        where: { id: input.courseId },
        select: {
          id: true,
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      const hasEnrollment = await enrollmentRepository.exist({
        where: {
          user: { id: userId },
          course: { id: input.courseId },
        },
      });

      if (!hasEnrollment) {
        throw new Error("Bạn cần hoàn thành mua khóa học để đánh giá");
      }

      const existingReview = await reviewRepository.findOne({
        where: {
          user: { id: userId },
          course: { id: input.courseId },
        },
      });

      if (existingReview) {
        throw new Error("Bạn đã đánh giá khóa học này rồi");
      }

      const createdReview = await reviewRepository.save(
        reviewRepository.create({
          user: { id: userId },
          course: { id: input.courseId },
          rating,
          comment: sanitizedComment,
        }),
      );

      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error("User not found");
      }

      const rewardPointsAdded = 50;
      user.rewardPoints = (user.rewardPoints ?? 0) + rewardPointsAdded;
      await userRepository.save(user);

      const ratingStats = await reviewRepository
        .createQueryBuilder("review")
        .select("COALESCE(AVG(review.rating), 0)", "averageRating")
        .addSelect("COUNT(review.id)", "reviewCount")
        .where("review.courseId = :courseId", { courseId: input.courseId })
        .getRawOne<{
          averageRating: string | number;
          reviewCount: string | number;
        }>();

      const averageRating = Number(ratingStats?.averageRating ?? 0);
      const reviewCount = Number(ratingStats?.reviewCount ?? 0);

      await courseRepository.update(
        { id: input.courseId },
        {
          averageRating,
          reviewCount,
        },
      );

      return {
        message: "Đánh giá thành công.",
        rewardPointsAdded,
        totalRewardPoints: user.rewardPoints,
        review: {
          id: createdReview.id,
          rating: createdReview.rating,
          comment: createdReview.comment ?? undefined,
          createdAt: createdReview.createdAt,
        },
        courseStats: {
          averageRating: Math.round(averageRating * 100) / 100,
          reviewCount,
        },
      };
    });
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

  async replyToReview(
    actorUserId: number,
    actorRole: string,
    input: ReplyReviewInput,
  ): Promise<ReplyReviewResult> {
    const normalizedRole = actorRole.trim().toLowerCase();
    if (normalizedRole !== "instructor" && normalizedRole !== "admin") {
      throw new Error("Unauthorized");
    }

    const sanitizedReply = input.replyComment?.trim();
    if (!sanitizedReply) {
      throw new Error("Reply content is required");
    }

    const review = await this.repo.findByIdWithCourseInstructor(input.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    const instructorId = review.course?.instructor?.id;
    if (normalizedRole === "instructor" && instructorId !== actorUserId) {
      throw new Error("Bạn không có quyền trả lời đánh giá này");
    }

    review.instructorReply = sanitizedReply;
    review.instructorRepliedAt = new Date();

    const savedReview = await this.repo.save(review);

    return {
      id: savedReview.id,
      instructorReply: savedReview.instructorReply,
      instructorRepliedAt: savedReview.instructorRepliedAt,
    };
  }
}

export const reviewService = new ReviewService(reviewRepository);
