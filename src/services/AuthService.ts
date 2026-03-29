import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Profile } from "../entities/Profile";
import { User } from "../entities/User";
import { UserRepository, userRepository } from "../repositories/UserRepository";

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface SafeUser {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  fullName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResult {
  accessToken: string;
  user: SafeUser;
}

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(data: RegisterInput): Promise<SafeUser> {
    const existingUser = await this.userRepo.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = new User();
    user.email = data.email;
    user.password = hashedPassword;
    user.role = "student";

    const profile = new Profile();
    profile.fullName = data.fullName;
    profile.user = user;
    user.profile = profile;

    const savedUser = await this.userRepo.save(user);

    return this.toSafeUser(savedUser);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      throw new Error("Invalid email or password.");
    }

    const jwtSecret = process.env.JWT_SECRET || "cinx_dev_secret";

    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    );

    return {
      accessToken,
      user: this.toSafeUser(user),
    };
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      fullName: user.profile?.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService(userRepository);
