import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  UpdateProfileInput,
  UpdateSensitiveInput,
  userService,
  UserService,
} from "../services/UserService";

interface UpdateProfileBody {
  fullName?: string;
  avatar?: string;
  bio?: string;
}

interface UpdateSensitiveBody {
  otp: string;
  newPassword?: string;
  newEmail?: string;
  newPhone?: string;
}

export class ProfileController {
  constructor(private readonly service: UserService) {}

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const user = await this.service.getMe(userId);
      res.status(200).json(user);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch profile.";
      const statusCode = message === "User not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  updateProfile = async (
    req: AuthenticatedRequest & { body: UpdateProfileBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const payload: UpdateProfileInput = {
        fullName: req.body.fullName,
        avatar: req.body.avatar,
        bio: req.body.bio,
      };

      const user = await this.service.updateProfile(userId, payload);
      res.status(200).json(user);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      const statusCode = message === "User not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  sendUpdateOtp = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      await this.service.sendUpdateOtp(userId);
      res.status(200).json({ message: "OTP sent successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP.";
      const statusCode = message === "User not found" ? 404 : 500;
      res.status(statusCode).json({ message });
    }
  };

  updateSensitive = async (
    req: AuthenticatedRequest & { body: UpdateSensitiveBody },
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const payload: UpdateSensitiveInput = {
        otp: req.body.otp,
        newPassword: req.body.newPassword,
        newEmail: req.body.newEmail,
        newPhone: req.body.newPhone,
      };

      if (!payload.otp) {
        res.status(400).json({ message: "otp is required." });
        return;
      }

      const user = await this.service.updateSensitive(userId, payload);
      res.status(200).json(user);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update sensitive data.";

      const statusCode =
        message === "Invalid or expired OTP" ||
        message === "Email already exists." ||
        message === "Phone already exists."
          ? 400
          : message === "User not found"
            ? 404
            : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const profileController = new ProfileController(userService);
