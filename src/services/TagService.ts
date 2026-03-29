import { tagRepository, TagRepository } from "../repositories/TagRepository";

export class TagService {
  constructor(private readonly repo: TagRepository) {}

  async getAllTags() {
    return this.repo.findAll();
  }
}

export const tagService = new TagService(tagRepository);
