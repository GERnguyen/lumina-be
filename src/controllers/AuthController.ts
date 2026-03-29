import { Request, Response } from "express";
import {
  AuthService,
  LoginResult,
  RegisterInput,
  SafeUser,
  authService,
} from "../services/AuthService";

interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
}

interface LoginBody {
  email: string;
  password: string;
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

  register = async (
    req: Request<Record<string, never>, RegisterResponse, RegisterBody>,
    res: Response<RegisterResponse | { message: string }>,
  ): Promise<void> => {
    try {
      const payload: RegisterInput = {
        email: req.body.email,
        password: req.body.password,
        fullName: req.body.fullName,
      };

      if (!payload.email || !payload.password || !payload.fullName) {
        res
          .status(400)
          .json({ message: "email, password, fullName are required." });
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
      const statusCode = message === "Email already exists." ? 400 : 500;

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
}

export const authController = new AuthController(authService);
