import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";
import { Course } from "../entities/Course";
import { Tag } from "../entities/Tag";
import { User } from "../entities/User";

export interface CourseFilters {
  categoryId?: number;
  keyword?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCourseResult {
  data: Course[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateCourseInput {
  title: string;
  slug: string;
  description?: string;
  price?: number;
  category?: Category;
  instructor: User;
  tags: Tag[];
}

export class CourseRepository {
  private readonly repository: Repository<Course>;

  constructor() {
    this.repository = AppDataSource.getRepository(Course);
  }

  async findAllCourses(filters: CourseFilters): Promise<PaginatedCourseResult> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;

    const queryBuilder = this.repository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.category", "category")
      .leftJoinAndSelect("course.instructor", "instructor")
      .leftJoinAndSelect("instructor.profile", "profile")
      .leftJoinAndSelect("course.tags", "tag")
      .distinct(true)
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
      .where("course.isActive = :isActive", { isActive: true });

    if (filters.categoryId) {
      queryBuilder.andWhere("category.id = :categoryId", {
        categoryId: filters.categoryId,
      });
    }

    if (filters.keyword) {
      queryBuilder.andWhere(
        "(course.title LIKE :keyword OR course.description LIKE :keyword)",
        { keyword: `%${filters.keyword}%` },
      );
    }

    if (filters.tag) {
      queryBuilder.andWhere("LOWER(tag.name) = :tag", {
        tag: filters.tag.trim().toLowerCase(),
      });
    }

    queryBuilder
      .orderBy("course.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      data: courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBestSellers(): Promise<Course[]> {
    return this.repository
      .createQueryBuilder("course")
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
      .where("course.isActive = :isActive", { isActive: true })
      .orderBy("course.enrollmentCount", "DESC")
      .addOrderBy("course.createdAt", "DESC")
      .take(10)
      .getMany();
  }

  async getTopDiscounted(): Promise<Course[]> {
    return this.repository
      .createQueryBuilder("course")
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
      .where("course.isActive = :isActive", { isActive: true })
      .orderBy("course.discountPercent", "DESC")
      .addOrderBy("course.createdAt", "DESC")
      .take(20)
      .getMany();
  }

  async getSimilarCourses(courseId: number): Promise<Course[]> {
    const baseCourse = await this.repository.findOne({
      where: { id: courseId },
      relations: {
        category: true,
      },
      select: {
        id: true,
        category: {
          id: true,
        },
      },
    });

    if (!baseCourse?.category?.id) {
      return [];
    }

    return this.repository
      .createQueryBuilder("course")
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
      .where("course.isActive = :isActive", { isActive: true })
      .andWhere("category.id = :categoryId", {
        categoryId: baseCourse.category.id,
      })
      .andWhere("course.id != :courseId", { courseId })
      .orderBy("course.enrollmentCount", "DESC")
      .addOrderBy("course.createdAt", "DESC")
      .take(5)
      .getMany();
  }

  async findCourseById(id: number): Promise<Course | null> {
    return this.repository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.category", "category")
      .leftJoinAndSelect("course.instructor", "instructor")
      .leftJoinAndSelect("instructor.profile", "profile")
      .leftJoinAndSelect("course.tags", "tag")
      .leftJoinAndSelect("course.sections", "section")
      .leftJoinAndSelect("section.lectures", "lecture")
      .select([
        "course.id",
        "course.title",
        "course.slug",
        "course.description",
        "course.thumbnailUrl",
        "course.price",
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
        "section.id",
        "section.title",
        "section.orderIndex",
        "lecture.id",
        "lecture.title",
        "lecture.contentText",
        "lecture.videoUrl",
        "lecture.orderIndex",
      ])
      .where("course.id = :id", { id })
      .orderBy("section.orderIndex", "ASC")
      .addOrderBy("lecture.orderIndex", "ASC")
      .getOne();
  }

  async createCourse(input: CreateCourseInput): Promise<Course> {
    const course = this.repository.create({
      title: input.title,
      slug: input.slug,
      description: input.description,
      price: input.price ?? 0,
      enrollmentCount: 0,
      discountPercent: 0,
      instructor: input.instructor,
      category: input.category,
      tags: input.tags,
      publishedAt: new Date(),
      isActive: true,
    });

    const savedCourse = await this.repository.save(course);
    const hydratedCourse = await this.findCourseById(savedCourse.id);

    if (!hydratedCourse) {
      throw new Error("Failed to load created course.");
    }

    return hydratedCourse;
  }
}

export const courseRepository = new CourseRepository();
