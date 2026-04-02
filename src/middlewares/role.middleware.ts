import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export const requireRole = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    const userRole = req.user?.role?.trim().toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.trim().toLowerCase(),
    );

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      res.status(403).json({ message: "Forbidden." });
      return;
    }

    next();
  };
};
