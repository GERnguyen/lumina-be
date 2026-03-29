import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Tag } from "../entities/Tag";

export class TagRepository {
  private readonly repository: Repository<Tag>;

  constructor() {
    this.repository = AppDataSource.getRepository(Tag);
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findAll(): Promise<Tag[]> {
    return this.repository.find({
      order: {
        name: "ASC",
      },
    });
  }

  async createTag(name: string): Promise<Tag> {
    const tag = this.repository.create({ name });
    return this.repository.save(tag);
  }
}

export const tagRepository = new TagRepository();
