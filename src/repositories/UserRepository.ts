import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class UserRepository {
  private readonly repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      relations: {
        profile: true,
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        profile: true,
      },
    });
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findUsersByRole(role: "student" | "instructor"): Promise<User[]> {
    return this.repository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.profile", "profile")
      .select([
        "user.id",
        "user.email",
        "user.role",
        "user.phone",
        "user.isActive",
        "user.rewardPoints",
        "user.createdAt",
        "user.updatedAt",
        "profile.id",
        "profile.fullName",
        "profile.avatar",
        "profile.bio",
        "profile.phoneNumber",
      ])
      .where("LOWER(user.role) = :role", { role: role.toLowerCase() })
      .orderBy("user.createdAt", "DESC")
      .getMany();
  }
}

export const userRepository = new UserRepository();
