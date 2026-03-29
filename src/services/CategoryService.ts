import {
  CategoryRepository,
  CreateCategoryInput,
  categoryRepository,
} from "../repositories/CategoryRepository";

export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async getAllCategories() {
    return this.categoryRepo.findAll();
  }

  async createCategory(input: CreateCategoryInput) {
    return this.categoryRepo.createCategory(input);
  }
}

export const categoryService = new CategoryService(categoryRepository);
