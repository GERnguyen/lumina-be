import { Request, Response } from "express";
import { LectureService, lectureService } from "../services/LectureService";

interface SectionParams {
  sectionId: string;
}

interface LectureParams {
  lectureId: string;
}

interface LectureBody {
  title: string;
  contentText: string;
  orderIndex: number;
}

export class LectureController {
  constructor(private readonly service: LectureService) {}

  create = async (
    req: Request<SectionParams, unknown, LectureBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const sectionId = Number(req.params.sectionId);
      const title = req.body.title?.trim();
      const contentText = req.body.contentText?.trim() || "";
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

      const lecture = await this.service.createLecture(
        sectionId,
        title,
        contentText,
        orderIndex,
      );
      res.status(201).json(lecture);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create lecture.";
      const statusCode = message === "Section not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  getBySection = async (
    req: Request<SectionParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const sectionId = Number(req.params.sectionId);

      if (Number.isNaN(sectionId)) {
        res.status(400).json({ message: "Invalid section id." });
        return;
      }

      const lectures = await this.service.getLecturesBySection(sectionId);
      res.status(200).json(lectures);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch lectures." });
    }
  };

  update = async (
    req: Request<LectureParams, unknown, LectureBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const lectureId = Number(req.params.lectureId);
      const title = req.body.title?.trim();
      const contentText = req.body.contentText?.trim() || "";
      const orderIndex = Number(req.body.orderIndex);

      if (Number.isNaN(lectureId)) {
        res.status(400).json({ message: "Invalid lecture id." });
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

      const lecture = await this.service.updateLecture(
        lectureId,
        title,
        contentText,
        orderIndex,
      );
      res.status(200).json(lecture);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update lecture.";
      const statusCode = message === "Lecture not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };

  delete = async (
    req: Request<LectureParams>,
    res: Response,
  ): Promise<void> => {
    try {
      const lectureId = Number(req.params.lectureId);

      if (Number.isNaN(lectureId)) {
        res.status(400).json({ message: "Invalid lecture id." });
        return;
      }

      await this.service.deleteLecture(lectureId);
      res.status(200).json({ message: "Lecture deleted successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete lecture.";
      const statusCode = message === "Lecture not found" ? 404 : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const lectureController = new LectureController(lectureService);
