import { Request, Response } from "express";
import { CourseFilters } from "../repositories/CourseRepository";
import { courseService, CourseService } from "../services/CourseService";
import { CreateCourseInput } from "../services/CourseService";

interface CourseQuery {
  categoryId?: string;
  keyword?: string;
  tag?: string;
}

interface CourseParams {
  id: string;
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
      };

      const courses = await this.service.getAllCourses(filters);
      res.status(200).json(courses);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch courses." });
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

      const course = await this.service.getCourseById(courseId);

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
    req: Request<Record<string, never>, unknown, CreateCourseInput>,
    res: Response,
  ): Promise<void> => {
    try {
      const {
        title,
        slug,
        instructorId,
        description,
        categoryId,
        price,
        tags,
      } = req.body;

      if (!title || !slug || !instructorId) {
        res.status(400).json({
          message: "title, slug and instructorId are required.",
        });
        return;
      }

      const course = await this.service.createCourse({
        title,
        slug,
        instructorId,
        description,
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
}

export const courseController = new CourseController(courseService);
