import { Request, Response } from "express";
import { tagService, TagService } from "../services/TagService";

export class TagController {
  constructor(private readonly service: TagService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tags = await this.service.getAllTags();
      res.status(200).json(tags);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch tags." });
    }
  };
}

export const tagController = new TagController(tagService);
