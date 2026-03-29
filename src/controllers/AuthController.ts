import { Request, Response } from "express";
import {
  AuthService,
  LoginResult,
  RegisterInput,
  ResetPasswordInput,
  SafeUser,
  SendOtpInput,
  authService,
} from "../services/AuthService";
import { OtpPurpose } from "../entities/OtpRecord";

interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
  otp: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface SendOtpBody {
  email: string;
  purpose: OtpPurpose;
}

interface ResetPasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

interface RegisterResponse {
  message: string;
  user: SafeUser;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  user: SafeUser;
}

export class AuthController {
  constructor(private readonly service: AuthService) {}

  sendOtp = async (
    req: Request<Record<string, never>, { message: string }, SendOtpBody>,
    res: Response<{ message: string }>,
  ): Promise<void> => {
    try {
      const payload: SendOtpInput = {
        email: req.body.email,
        purpose: req.body.purpose,
      };

      if (!payload.email || !payload.purpose) {
        res.status(400).json({ message: "email and purpose are required." });
        return;
      }

      if (!Object.values(OtpPurpose).includes(payload.purpose)) {
        res.status(400).json({ message: "Invalid OTP purpose." });
        return;
      }

      await this.service.sendOtp(payload);
      res.status(200).json({ message: "OTP sent successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const statusCode =
        message === "Email already exists." ||
        message === "Invalid OTP purpose."
          ? 400
          : message === "User not found"
            ? 404
            : 500;

      res.status(statusCode).json({ message });
    }
  };

  register = async (
    req: Request<Record<string, never>, RegisterResponse, RegisterBody>,
    res: Response<RegisterResponse | { message: string }>,
  ): Promise<void> => {
    try {
      const payload: RegisterInput = {
        email: req.body.email,
        password: req.body.password,
        fullName: req.body.fullName,
        otp: req.body.otp,
      };

      if (
        !payload.email ||
        !payload.password ||
        !payload.fullName ||
        !payload.otp
      ) {
        res
          .status(400)
          .json({ message: "email, password, fullName, otp are required." });
        return;
      }

      const user = await this.service.register(payload);

      res.status(201).json({
        message: "Register successfully.",
        user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const statusCode =
        message === "Email already exists." ||
        message === "Invalid or expired OTP"
          ? 400
          : 500;

      res.status(statusCode).json({ message });
    }
  };

  login = async (
    req: Request<Record<string, never>, LoginResponse, LoginBody>,
    res: Response<LoginResponse | { message: string }>,
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "email and password are required." });
        return;
      }

      const result: LoginResult = await this.service.login(email, password);

      res.status(200).json({
        message: "Login successfully.",
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const statusCode = message === "Invalid email or password." ? 401 : 500;

      res.status(statusCode).json({ message });
    }
  };

  resetPassword = async (
    req: Request<Record<string, never>, { message: string }, ResetPasswordBody>,
    res: Response<{ message: string }>,
  ): Promise<void> => {
    try {
      const payload: ResetPasswordInput = {
        email: req.body.email,
        otp: req.body.otp,
        newPassword: req.body.newPassword,
      };

      if (!payload.email || !payload.otp || !payload.newPassword) {
        res
          .status(400)
          .json({ message: "email, otp, newPassword are required." });
        return;
      }

      await this.service.resetPassword(payload);
      res.status(200).json({ message: "Reset password successfully." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error.";
      const statusCode =
        message === "Invalid or expired OTP"
          ? 400
          : message === "User not found"
            ? 404
            : 500;

      res.status(statusCode).json({ message });
    }
  };
}

export const authController = new AuthController(authService);
