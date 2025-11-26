import { Request, Response, NextFunction } from "express";
import { ParsedQs } from "qs";
import { z, ZodError } from "zod";
import { AppError } from "./errorHandler";

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message || "Validation failed";
        throw new AppError(message, 400);
      }
      next(error);
    }
  };
};

// Validation for different parts of the request
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message || "Validation failed";
        throw new AppError(message, 400);
      }
      next(error);
    }
  };
};

export const validateParams = <T extends Record<string, string>>(
  schema: z.ZodSchema<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as unknown as Record<
        string,
        string
      >;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message || "Invalid parameters";
        throw new AppError(message, 400);
      }
      next(error);
    }
  };
};
export const validateQuery = <T = ParsedQs>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues[0]?.message || "Invalid query parameters";
        throw new AppError(message, 400);
      }
      next(error);
    }
  };
};
