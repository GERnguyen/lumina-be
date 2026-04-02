import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { LearningService, learningService } from "../services/LearningService";

interface LectureParams {
  lectureId: string;
}

export class LearningController {
  constructor(private readonly service: LearningService) {}

  getMyCourses = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const courses = await this.service.getMyCourses(userId);
      res.status(200).json(courses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch my courses.";
      res.status(500).json({ message });
    }
  };

  getLectureDetail = async (
    req: AuthenticatedRequest & { params: LectureParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const lectureId = Number(req.params.lectureId);
      if (Number.isNaN(lectureId)) {
        res.status(400).json({ message: "Invalid lecture id." });
        return;
      }

      const lecture = await this.service.getLectureDetail(userId, lectureId);
      res.status(200).json(lecture);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch lecture detail.";

      if (message === "FORBIDDEN_NOT_ENROLLED") {
        res.status(403).json({ message: "Ban chua mua khoa hoc nay!" });
        return;
      }

      const statusCode = message === "Lecture not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  markLectureCompleted = async (
    req: AuthenticatedRequest & { params: LectureParams },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const lectureId = Number(req.params.lectureId);
      if (Number.isNaN(lectureId)) {
        res.status(400).json({ message: "Invalid lecture id." });
        return;
      }

      const enrollment = await this.service.markLectureCompleted(
        userId,
        lectureId,
      );

      res.status(200).json(enrollment);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark lecture completed.";

      if (message === "FORBIDDEN_NOT_ENROLLED") {
        res.status(403).json({ message: "Ban chua mua khoa hoc nay!" });
        return;
      }

      const statusCode = message === "Lecture not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };
}

export const learningController = new LearningController(learningService);
