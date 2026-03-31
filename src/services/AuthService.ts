import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { OtpPurpose } from "../entities/OtpRecord";
import { Profile } from "../entities/Profile";
import { User } from "../entities/User";
import { otpRepository } from "../repositories/OtpRepository";
import { UserRepository, userRepository } from "../repositories/UserRepository";
import { sendOTPEmail } from "../utils/mailer";

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  otp: string;
}

export interface SendOtpInput {
  email: string;
  purpose: OtpPurpose;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface SafeUser {
  id: number;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  rewardPoints: number;
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

  async sendOtp(data: SendOtpInput): Promise<void> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (data.purpose === OtpPurpose.REGISTER && user) {
      throw new Error("Email already exists.");
    }

    if (data.purpose === OtpPurpose.FORGOT_PASSWORD && !user) {
      throw new Error("User not found");
    }

    const otp = this.generateOtp();
    await otpRepository.createOtp(normalizedEmail, otp, data.purpose);
    await sendOTPEmail(
      normalizedEmail,
      otp,
      this.mapPurposeLabel(data.purpose),
    );
  }

  async register(data: RegisterInput): Promise<SafeUser> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = await this.userRepo.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    const validOtp = await otpRepository.findValidOtp(
      normalizedEmail,
      data.otp,
      OtpPurpose.REGISTER,
    );

    if (!validOtp) {
      throw new Error("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = new User();
    user.email = normalizedEmail;
    user.password = hashedPassword;
    user.role = "student";

    const profile = new Profile();
    profile.fullName = data.fullName;
    profile.user = user;
    user.profile = profile;

    const savedUser = await this.userRepo.save(user);
    await otpRepository.markAsUsed(validOtp.id);

    return this.toSafeUser(savedUser);
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error("User not found");
    }

    const validOtp = await otpRepository.findValidOtp(
      normalizedEmail,
      data.otp,
      OtpPurpose.FORGOT_PASSWORD,
    );

    if (!validOtp) {
      throw new Error("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

    await AppDataSource.getRepository(User)
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where("id = :id", { id: user.id })
      .execute();

    await otpRepository.markAsUsed(validOtp.id);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(email.trim().toLowerCase());

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
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      rewardPoints: user.rewardPoints ?? 0,
      fullName: user.profile?.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateOtp(): string {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }

  private mapPurposeLabel(purpose: OtpPurpose): string {
    if (purpose === OtpPurpose.FORGOT_PASSWORD) {
      return "Quen mat khau";
    }

    if (purpose === OtpPurpose.UPDATE_PROFILE) {
      return "Cap nhat thong tin";
    }

    return "Dang ky tai khoan";
  }
}

export const authService = new AuthService(userRepository);
