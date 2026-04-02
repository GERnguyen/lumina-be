import { Request, Response } from "express";
import { SectionService, sectionService } from "../services/SectionService";

interface CourseParams {
  courseId: string;
}

interface SectionParams {
  sectionId: string;
}

interface SectionBody {
  title: string;
  orderIndex: number;
}

export class SectionController {
  constructor(private readonly service: SectionService) {}

  create = async (
    req: Request<CourseParams, unknown, SectionBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.courseId);
      const title = req.body.title?.trim();
      const orderIndex = Number(req.body.orderIndex);

      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      if (!title) {
        res.status(400).json({ message: "title is required." });
        return;
      }

      if (!Number.isInteger(orderIndex) || orderIndex <= 0) {
        res
          .status(400)
          .json({ message: "orderIndex must be a positive integer." });
        return;
      }

      const section = await this.service.createSection(
        courseId,
        title,
        orderIndex,
      );
      res.status(201).json(section);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create section.";
      const statusCode = message === "Course not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  getByCourse = async (
    req: Request<CourseParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const courseId = Number(req.params.courseId);

      if (Number.isNaN(courseId)) {
        res.status(400).json({ message: "Invalid course id." });
        return;
      }

      const sections = await this.service.getSectionsByCourse(courseId);
      res.status(200).json(sections);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch sections." });
    }
  };

  update = async (
    req: Request<SectionParams, unknown, SectionBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const sectionId = Number(req.params.sectionId);
      const title = req.body.title?.trim();
      const orderIndex = Number(req.body.orderIndex);

      if (Number.isNaN(sectionId)) {
        res.status(400).json({ message: "Invalid section id." });
        return;
      }

      if (!title) {
        res.status(400).json({ message: "title is required." });
        return;
      }

      if (!Number.isInteger(orderIndex) || orderIndex <= 0) {
        res
          .status(400)
          .json({ message: "orderIndex must be a positive integer." });
        return;
      }

      const section = await this.service.updateSection(
        sectionId,
        title,
        orderIndex,
      );
      res.status(200).json(section);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update section.";
      const statusCode = message === "Section not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  delete = async (
    req: Request<SectionParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const sectionId = Number(req.params.sectionId);

      if (Number.isNaN(sectionId)) {
        res.status(400).json({ message: "Invalid section id." });
        return;
      }

      await this.service.deleteSection(sectionId);
      res.status(200).json({ message: "Section deleted successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete section.";
      const statusCode = message === "Section not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const sectionController = new SectionController(sectionService);
