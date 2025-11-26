import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "@/models/User.model";
import { AppError, asyncHandler } from "@/middleware/errorHandler";
import { appConfig } from "@/config/appConfig";
import { UserRole } from "@/utils/constants";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("No token provided. Please log in.", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, appConfig.jwtSecret) as {
        id: string;
        role: UserRole;
      };

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppError("Account is deactivated", 403);
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token has expired. Please log in again.", 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token. Please log in again.", 401);
      }
      throw error;
    }
  }
);

export const isAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new AppError("Access denied. admin privileges required.", 403);
    }

    next();
  }
);
