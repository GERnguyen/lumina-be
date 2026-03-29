import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { User } from "../entities/User";

export class WishlistService {
  async toggle(userId: number, courseId: number): Promise<{ liked: boolean }> {
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);

    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new Error("Course not found");
    }

    const user = await userRepository.findOne({
      where: { id: userId },
      relations: {
        favoriteCourses: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const alreadyLiked = user.favoriteCourses.some(
      (favoriteCourse) => favoriteCourse.id === courseId,
    );

    if (alreadyLiked) {
      user.favoriteCourses = user.favoriteCourses.filter(
        (favoriteCourse) => favoriteCourse.id !== courseId,
      );
      await userRepository.save(user);
      return { liked: false };
    }

    user.favoriteCourses.push(course);
    await userRepository.save(user);
    return { liked: true };
  }

  async getWishlist(userId: number): Promise<Course[]> {
    return AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .innerJoin("course.favoritedByUsers", "user")
      .leftJoinAndSelect("course.category", "category")
      .leftJoinAndSelect("course.instructor", "instructor")
      .leftJoinAndSelect("instructor.profile", "profile")
      .leftJoinAndSelect("course.tags", "tag")
      .select([
        "course.id",
        "course.title",
        "course.slug",
        "course.description",
        "course.thumbnailUrl",
        "course.price",
        "course.enrollmentCount",
        "course.discountPercent",
        "course.isActive",
        "course.publishedAt",
        "course.createdAt",
        "course.updatedAt",
        "category.id",
        "category.name",
        "category.description",
        "instructor.id",
        "instructor.email",
        "instructor.role",
        "profile.id",
        "profile.fullName",
        "profile.avatar",
        "tag.id",
        "tag.name",
      ])
      .where("user.id = :userId", { userId })
      .orderBy("course.createdAt", "DESC")
      .getMany();
  }
}

export const wishlistService = new WishlistService();
