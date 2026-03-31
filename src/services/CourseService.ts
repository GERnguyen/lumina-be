import {
  CourseFilters,
  PaginatedCourseResult,
  CourseRepository,
  CreateCourseInput as CreateCourseRepositoryInput,
  courseRepository,
} from "../repositories/CourseRepository";
import {
  categoryRepository,
  CategoryRepository,
} from "../repositories/CategoryRepository";
import { tagRepository, TagRepository } from "../repositories/TagRepository";
import { userRepository, UserRepository } from "../repositories/UserRepository";

export interface CreateCourseInput {
  title: string;
  slug: string;
  description?: string;
  price?: number;
  categoryId?: number;
  instructorId: number;
  tags?: string[];
}

export class CourseService {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly userRepo: UserRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly tagRepo: TagRepository,
  ) {}

  async findAllCourses(filters: CourseFilters): Promise<PaginatedCourseResult> {
    return this.courseRepo.findAllCourses(filters);
  }

  async getAllCourses(filters: CourseFilters): Promise<PaginatedCourseResult> {
    return this.findAllCourses(filters);
  }

  async getBestSellers() {
    return this.courseRepo.getBestSellers();
  }

  async getTopDiscounted() {
    return this.courseRepo.getTopDiscounted();
  }

  async getSimilarCourses(courseId: number) {
    return this.courseRepo.getSimilarCourses(courseId);
  }

  async getCourseById(id: number) {
    return this.courseRepo.findCourseById(id);
  }

  async createCourse(input: CreateCourseInput) {
    const user = await this.userRepo.findById(input.instructorId);

    if (!user) {
      throw new Error("User not found");
    }

    const normalizedRole = user.role.trim().toUpperCase();

    if (normalizedRole !== "INSTRUCTOR" && normalizedRole !== "ADMIN") {
      throw new Error("Only Instructors or Admins can be assigned to a course");
    }

    const category = input.categoryId
      ? await this.categoryRepo.findById(input.categoryId)
      : undefined;

    const tagNames = Array.from(
      new Set(
        (input.tags ?? [])
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const existingTag = await this.tagRepo.findByName(name);
        if (existingTag) {
          return existingTag;
        }

        return this.tagRepo.createTag(name);
      }),
    );

    const createPayload: CreateCourseRepositoryInput = {
      title: input.title,
      slug: input.slug,
      description: input.description,
      price: input.price,
      instructor: user,
      category: category ?? undefined,
      tags,
    };

    return this.courseRepo.createCourse(createPayload);
  }
}

export const courseService = new CourseService(
  courseRepository,
  userRepository,
  categoryRepository,
  tagRepository,
);
