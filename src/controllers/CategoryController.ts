import { Request, Response } from "express";
import { categoryService, CategoryService } from "../services/CategoryService";

interface CreateCategoryBody {
  name: string;
  description?: string;
  parentId?: number;
}

export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.service.getAllCategories();
      res.status(200).json(categories);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch categories." });
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateCategoryBody>,
    res: Response,
  ): Promise<void> => {
    try {
      const { name, description, parentId } = req.body;

      if (!name) {
        res.status(400).json({ message: "name is required." });
        return;
      }

      const category = await this.service.createCategory({
        name,
        description,
        parentId,
      });

      res.status(201).json(category);
    } catch (_error) {
      res.status(500).json({ message: "Failed to create category." });
    }
  };
}

export const categoryController = new CategoryController(categoryService);
