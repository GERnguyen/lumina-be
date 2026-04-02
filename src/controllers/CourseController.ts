import { Request, Response } from "express";
import { CourseFilters } from "../repositories/CourseRepository";
import { courseService, CourseService } from "../services/CourseService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

interface CourseQuery {
  categoryId?: string;
  keyword?: string;
  tag?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  priceType?: string;
  isDiscounted?: string;
}

interface CourseParams {
  id: string;
}

interface InstructorCourseParams {
  courseId: string;
}

interface AdminCourseParams {
  courseId: string;
}

interface AdminUsersQuery {
  role?: string;
}

interface CreateCourseRequestBody {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: number;
  price?: number;
  tags?: string[];
}

interface UpdateCourseRequestBody {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: number;
  price?: number;
  tags?: string[];
}

export class CourseController {
  constructor(private readonly service: CourseService) {}

  getAll = async (
    req: Request<Record<string, never>, unknown, unknown, CourseQuery>,
    res: Response,
  ): Promise<void> => {
    try {
      const filters: CourseFilters = {
        categoryId: req.query.categoryId
          ? Number(req.query.categoryId)
          : undefined,
        keyword: req.query.keyword,
        tag: req.query.tag,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        sortBy: req.query.sortBy,
        priceType: req.query.priceType,
        isDiscounted: req.query.isDiscounted === "true",
      };

      if (!Number.isInteger(filters.page) || (filters.page ?? 1) <= 0) {
        res.status(400).json({ message: "page must be a positive integer." });
        return;
      }

      if (!Number.isInteger(filters.limit) || (filters.limit ?? 1) <= 0) {
        res.status(400).json({ message: "limit must be a positive integer." });
        return;
      }

      const courses = await this.service.getAllCourses(filters);
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch courses." });
    }
  };

  getBestSellers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const courses = await this.service.getBestSellers();
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch best sellers." });
    }
  };

  getTopDiscounted = async (_req: Request, res: Response): Promise<void> => {
    try {
      const courses = await this.service.getTopDiscounted();
      res.status(200).json(courses);
    } catch (_error) {
      res
        .status(500)
        .json({ message: "Failed to fetch top discounted courses." });
    }
  };

  getSimilarCourses = async (
    req: Request<CourseParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.id);

      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const courses = await this.service.getSimilarCourses(courseId);
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch similar courses." });
    }
  };

  getById = async (
    req: Request<CourseParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.id);

      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const course = await this.service.getPublicCourseById(courseId);

      if (!course) {
        res.status(404).json({ message: "Course not found." });
        return;
      }

      res.status(200).json(course);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch course detail." });
    }
  };

  getDetailForInstructor = async (
    req: AuthenticatedRequest & { params: InstructorCourseParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;

      if (!userId || !role) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courseId = Number(req.params.courseId);
      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const course = await this.service.getCourseByIdForInstructorOrAdmin(
        userId,
        role,
        courseId,
      );

      if (!course) {
        res.status(404).json({ message: "Course not found." });
        return;
      }

      res.status(200).json(course);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch course detail." });
    }
  };

  create = async (
    req: AuthenticatedRequest & {
      body: CreateCourseRequestBody;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const {
        title,
        slug,
        description,
        thumbnailUrl,
        categoryId,
        price,
        tags,
      } = req.body;
      const instructorId = req.user?.userId;

      if (!title || !slug) {
        res.status(400).json({
          message: "title and slug are required.",
        });
        return;
      }

      if (!instructorId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const course = await this.service.createCourse({
        title,
        slug,
        instructorId,
        description,
        thumbnailUrl,
        categoryId,
        price,
        tags,
      });

      res.status(201).json(course);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create course.";
      const statusCode =
        message === "User not found"
          ? 404
          : message === "Only Instructors or Admins can be assigned to a course"
            ? 400
            : 500;

      res.status(statusCode).json({ message });
    }
  };

  getMyCoursesForInstructor = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const instructorId = req.user?.userId;

      if (!instructorId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courses = await this.service.getInstructorCourses(instructorId);
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch instructor courses." });
    }
  };

  updateForInstructor = async (
    req: AuthenticatedRequest & {
      params: InstructorCourseParams;
      body: UpdateCourseRequestBody;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const instructorId = req.user?.userId;
      if (!instructorId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courseId = Number(req.params.courseId);
      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const {
        title,
        slug,
        description,
        thumbnailUrl,
        categoryId,
        price,
        tags,
      } = req.body;

      if (!title?.trim() || !slug?.trim()) {
        res.status(400).json({ message: "title and slug are required." });
        return;
      }

      const updatedCourse = await this.service.updateCourseForInstructor(
        instructorId,
        courseId,
        {
          title,
          slug,
          description,
          thumbnailUrl,
          categoryId,
          price,
          tags,
        },
      );

      res.status(200).json(updatedCourse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update course.";

      if (message === "FORBIDDEN_NOT_INSTRUCTOR_COURSE") {
        res
          .status(403)
          .json({ message: "Ban khong co quyen sua khoa hoc nay!" });
        return;
      }

      const statusCode = message === "Course not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  getStudentsForInstructor = async (
    req: AuthenticatedRequest & { params: InstructorCourseParams },
    res: Response,
  ): Promise<void> => {
    try {
      const instructorId = req.user?.userId;

      if (!instructorId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courseId = Number(req.params.courseId);
      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const students = await this.service.getStudentsForInstructor(
        instructorId,
        courseId,
      );

      res.status(200).json(students);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch students progress.";

      if (message === "FORBIDDEN_NOT_INSTRUCTOR_COURSE") {
        res
          .status(403)
          .json({ message: "Ban khong co quyen xem khoa hoc nay!" });
        return;
      }

      const statusCode = message === "Course not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  approveCourseForAdmin = async (
    req: AuthenticatedRequest & { params: AdminCourseParams },
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.courseId);
      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const course = await this.service.approveCourse(courseId);
      res.status(200).json(course);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to approve course.";
      const statusCode = message === "Course not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  deletePendingCourse = async (
    req: AuthenticatedRequest & { params: AdminCourseParams },
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.courseId);
      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const actorId = req.user?.userId;
      const actorRole = req.user?.role;

      if (!actorId || !actorRole) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      await this.service.deletePendingCourseByActor(
        courseId,
        actorId,
        actorRole,
      );
      res.status(204).send();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete pending course.";

      if (message === "FORBIDDEN_NOT_INSTRUCTOR_COURSE") {
        res.status(403).json({ message: "Forbidden." });
        return;
      }

      if (message === "ONLY_PENDING_COURSE_CAN_BE_DELETED") {
        res.status(400).json({
          message: "Only pending courses can be deleted.",
        });
        return;
      }

      if (message === "CANNOT_DELETE_COURSE_WITH_ORDERS") {
        res.status(400).json({
          message: "Cannot delete a course that already has orders.",
        });
        return;
      }

      const statusCode = message === "Course not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  getPendingCoursesForAdmin = async (
    _req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const courses = await this.service.getPendingCoursesForAdmin();
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch pending courses." });
    }
  };

  getUsersForAdmin = async (
    req: AuthenticatedRequest & {
      query: AdminUsersQuery;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const normalizedRole = req.query.role?.trim().toLowerCase();

      if (normalizedRole !== "student" && normalizedRole !== "instructor") {
        res.status(400).json({
          message: "Invalid role. Allowed roles: student, instructor.",
        });
        return;
      }

      const users = await this.service.getUsersForAdmin(normalizedRole);
      res.status(200).json(users);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch users." });
    }
  };
}

export const courseController = new CourseController(courseService);
