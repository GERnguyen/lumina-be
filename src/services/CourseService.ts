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
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Enrollment } from "../entities/Enrollment";

export interface CreateCourseInput {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  categoryId?: number;
  instructorId: number;
  tags?: string[];
}

export interface UpdateCourseInput {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  categoryId?: number;
  tags?: string[];
}

export interface InstructorStudentProgressItem {
  enrollmentId: number;
  progressPercent: number;
  enrolledAt: Date;
  completedAt?: Date;
  student: {
    id: number;
    email: string;
    fullName: string | null;
    avatar: string | null;
  };
}

export type AdminUserRole = "student" | "instructor";

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

  async getPublicCourseById(id: number) {
    const course = await this.courseRepo.findCourseById(id);

    if (!course || !course.isActive) {
      return null;
    }

    return course;
  }

  async getCourseByIdForInstructorOrAdmin(
    userId: number,
    role: string,
    courseId: number,
  ) {
    const normalizedRole = role.trim().toLowerCase();

    if (normalizedRole === "admin") {
      return this.courseRepo.findCourseById(courseId);
    }

    return this.courseRepo.findCourseByIdForInstructor(courseId, userId);
  }

  async getInstructorCourses(instructorId: number) {
    return this.courseRepo.findCoursesByInstructor(instructorId);
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
      thumbnailUrl: input.thumbnailUrl,
      price: input.price,
      instructor: user,
      category: category ?? undefined,
      tags,
    };

    return this.courseRepo.createCourse(createPayload);
  }

  async updateCourseForInstructor(
    instructorId: number,
    courseId: number,
    input: UpdateCourseInput,
  ) {
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

    return this.courseRepo.updateCourseByInstructor(courseId, instructorId, {
      title: input.title,
      slug: input.slug,
      description: input.description,
      thumbnailUrl: input.thumbnailUrl,
      price: input.price,
      category: category ?? undefined,
      tags,
    });
  }

  async getStudentsForInstructor(
    instructorId: number,
    courseId: number,
  ): Promise<InstructorStudentProgressItem[]> {
    const dataSourceCourseRepository = AppDataSource.getRepository(Course);
    const enrollmentDataSourceRepository =
      AppDataSource.getRepository(Enrollment);

    const course = await dataSourceCourseRepository.findOne({
      where: { id: courseId },
      relations: {
        instructor: true,
      },
      select: {
        id: true,
        instructor: {
          id: true,
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.instructor.id !== instructorId) {
      throw new Error("FORBIDDEN_NOT_INSTRUCTOR_COURSE");
    }

    const enrollments = await enrollmentDataSourceRepository.find({
      where: {
        course: { id: courseId },
      },
      relations: {
        user: {
          profile: true,
        },
      },
      order: {
        enrolledAt: "DESC",
      },
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      progressPercent: Number(enrollment.progressPercent),
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      student: {
        id: enrollment.user.id,
        email: enrollment.user.email,
        fullName: enrollment.user.profile?.fullName ?? null,
        avatar: enrollment.user.profile?.avatar ?? null,
      },
    }));
  }

  async approveCourse(courseId: number): Promise<Course> {
    const dataSourceCourseRepository = AppDataSource.getRepository(Course);

    const course = await dataSourceCourseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    course.isActive = true;
    if (!course.publishedAt) {
      course.publishedAt = new Date();
    }

    return dataSourceCourseRepository.save(course);
  }

  async getPendingCoursesForAdmin(): Promise<Course[]> {
    return this.courseRepo.findPendingCoursesForAdmin();
  }

  async getUsersForAdmin(role: AdminUserRole) {
    return this.userRepo.findUsersByRole(role);
  }
}

export const courseService = new CourseService(
  courseRepository,
  userRepository,
  categoryRepository,
  tagRepository,
);
