import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { logger } from "@/utils/logger";

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  status: "error";
  message: string;
  errors?: any;
  stack?: string;
}

// Handle Mongoose validation errors
const handleValidationError = (err: mongoose.Error.ValidationError) => {
  const errors = Object.values(err.errors).map((error) => ({
    field: error.path,
    message: error.message,
  }));

  return {
    statusCode: 400,
    message: "Validation Error",
    errors,
  };
};

// Handle Mongoose cast errors (invalid ObjectId)
const handleCastError = (err: mongoose.Error.CastError) => {
  return {
    statusCode: 400,
    message: `Invalid ${err.path}: ${err.value}`,
  };
};

// Handle MongoDB duplicate key errors
const handleDuplicateKeyError = (err: any) => {
  const field = err.keyPattern
    ? Object.keys(err.keyPattern)[0]
    : Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];

  return {
    statusCode: 400,
    message: `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } '${value}' already exists`,
  };
};

// Handle JWT errors
const handleJWTError = () => {
  return {
    statusCode: 401,
    message: "Invalid token. Please log in again.",
  };
};

const handleJWTExpiredError = () => {
  return {
    statusCode: 401,
    message: "Your token has expired. Please log in again.",
  };
};

// Error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const validationError = handleValidationError(err);
    error.statusCode = validationError.statusCode;
    error.message = validationError.message;
    error.errors = validationError.errors;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    const castError = handleCastError(err);
    error.statusCode = castError.statusCode;
    error.message = castError.message;
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const duplicateError = handleDuplicateKeyError(err);
    error.statusCode = duplicateError.statusCode;
    error.message = duplicateError.message;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const jwtError = handleJWTError();
    error.statusCode = jwtError.statusCode;
    error.message = jwtError.message;
  }

  if (err.name === "TokenExpiredError") {
    const jwtExpiredError = handleJWTExpiredError();
    error.statusCode = jwtExpiredError.statusCode;
    error.message = jwtExpiredError.message;
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || "Internal Server Error";

  const response: ErrorResponse = {
    status: "error",
    message,
  };

  // Include validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// Not found handler (404)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
