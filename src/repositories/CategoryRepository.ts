import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Category } from "../entities/Category";

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: number;
}

export class CategoryRepository {
  private readonly repository: Repository<Category>;

  constructor() {
    this.repository = AppDataSource.getRepository(Category);
  }

  async findAll(): Promise<Category[]> {
    return this.repository.find({
      relations: {
        parent: true,
      },
      order: {
        name: "ASC",
      },
    });
  }

  async findById(id: number): Promise<Category | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        parent: true,
      },
    });
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const category = this.repository.create({
      name: input.name,
      description: input.description,
    });

    if (input.parentId) {
      const parent = await this.repository.findOne({
        where: { id: input.parentId },
      });

      if (parent) {
        category.parent = parent;
      }
    }

    return this.repository.save(category);
  }
}

export const categoryRepository = new CategoryRepository();
