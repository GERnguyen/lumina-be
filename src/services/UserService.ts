import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { OtpPurpose } from "../entities/OtpRecord";
import { Profile } from "../entities/Profile";
import { User } from "../entities/User";
import { otpRepository } from "../repositories/OtpRepository";
import { sendOTPEmail } from "../utils/mailer";

const SALT_ROUNDS = 10;

export interface MeResponse {
  id: number;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  profile: {
    fullName?: string;
    avatar?: string;
    bio?: string;
    phoneNumber?: string;
  };
}

export interface UpdateProfileInput {
  fullName?: string;
  avatar?: string;
  bio?: string;
}

export interface UpdateSensitiveInput {
  otp: string;
  newPassword?: string;
  newEmail?: string;
  newPhone?: string;
}

export class UserService {
  async getMe(userId: number): Promise<MeResponse> {
    const user = await this.getUserById(userId);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      profile: {
        fullName: user.profile?.fullName,
        avatar: user.profile?.avatar,
        bio: user.profile?.bio,
        phoneNumber: user.profile?.phoneNumber,
      },
    };
  }

  async updateProfile(
    userId: number,
    input: UpdateProfileInput,
  ): Promise<MeResponse> {
    const user = await this.getUserById(userId);
    const profileRepository = AppDataSource.getRepository(Profile);

    let profile = user.profile;
    if (!profile) {
      profile = profileRepository.create({ user, fullName: "" });
    }

    if (typeof input.fullName === "string") {
      profile.fullName = input.fullName.trim();
    }

    if (typeof input.avatar === "string") {
      profile.avatar = input.avatar.trim() || undefined;
    }

    if (typeof input.bio === "string") {
      profile.bio = input.bio.trim() || undefined;
    }

    await profileRepository.save(profile);

    return this.getMe(userId);
  }

  async sendUpdateOtp(userId: number): Promise<void> {
    const user = await this.getUserById(userId);

    const otp = this.generateOtp();
    await otpRepository.createOtp(user.email, otp, OtpPurpose.UPDATE_PROFILE);
    await sendOTPEmail(user.email, otp, "Cap nhat thong tin nhay cam");
  }

  async updateSensitive(
    userId: number,
    input: UpdateSensitiveInput,
  ): Promise<MeResponse> {
    const userRepository = AppDataSource.getRepository(User);
    const user = await this.getUserById(userId);

    const validOtp = await otpRepository.findValidOtp(
      user.email,
      input.otp,
      OtpPurpose.UPDATE_PROFILE,
    );

    if (!validOtp) {
      throw new Error("Invalid or expired OTP");
    }

    if (input.newEmail) {
      const normalizedEmail = input.newEmail.trim().toLowerCase();
      const existing = await userRepository.findOne({
        where: { email: normalizedEmail },
      });
      if (existing && existing.id !== userId) {
        throw new Error("Email already exists.");
      }
      user.email = normalizedEmail;
    }

    if (typeof input.newPhone === "string") {
      const normalizedPhone = input.newPhone.trim();
      if (normalizedPhone) {
        const existingPhone = await userRepository.findOne({
          where: { phone: normalizedPhone },
          select: { id: true, phone: true },
        });
        if (existingPhone && existingPhone.id !== userId) {
          throw new Error("Phone already exists.");
        }
        user.phone = normalizedPhone;
      } else {
        user.phone = undefined;
      }
    }

    if (input.newPassword) {
      user.password = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    }

    await userRepository.save(user);
    await otpRepository.markAsUsed(validOtp.id);

    return this.getMe(userId);
  }

  private async getUserById(userId: number): Promise<User> {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  private generateOtp(): string {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }
}

export const userService = new UserService();
