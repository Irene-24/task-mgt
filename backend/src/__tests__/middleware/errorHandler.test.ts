import { Request, Response, NextFunction } from "express";
import {
  AppError,
  asyncHandler,
  errorHandler,
} from "@/middleware/errorHandler";
import mongoose from "mongoose";

describe("Error Handler Middleware", () => {
  describe("AppError", () => {
    it("should create an operational error with correct properties", () => {
      const error = new AppError("Test error", 400);

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it("should default to status code 500", () => {
      const error = new AppError("Test error");
      expect(error.statusCode).toBe(500);
    });
  });

  describe("asyncHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {};
      nextFunction = jest.fn();
    });

    it("should call next on successful async function", async () => {
      const asyncFn = jest.fn().mockResolvedValue("success");
      const wrappedFn = asyncHandler(asyncFn);

      wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(asyncFn).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        nextFunction
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should call next with error on rejected promise", async () => {
      const error = new Error("Async error");
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await Promise.resolve(
        wrappedFn(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });

    it("should handle thrown errors in async function", async () => {
      const error = new AppError("Custom error", 400);
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await Promise.resolve(
        wrappedFn(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      );

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe("errorHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      nextFunction = jest.fn();
    });

    it("should handle AppError correctly", () => {
      const error = new AppError("Not found", 404);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Not found",
      });
    });

    it("should handle Mongoose ValidationError", () => {
      const error = new mongoose.Error.ValidationError();
      error.errors = {
        email: new mongoose.Error.ValidatorError({
          message: "Email is required",
        } as any),
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Validation Error",
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "Email is required",
            }),
          ]),
        })
      );
    });

    it("should handle Mongoose CastError", () => {
      const error = new mongoose.Error.CastError(
        "ObjectId",
        "invalid-id",
        "id"
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("Invalid id"),
        })
      );
    });

    it("should handle duplicate key error", () => {
      const error: any = new Error("Duplicate key");
      error.code = 11000;
      error.keyValue = { email: "test@example.com" };
      error.keyPattern = { email: 1 };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Email 'test@example.com' already exists",
        })
      );
    });

    it("should handle JWT errors", () => {
      const error: any = new Error("jwt malformed");
      error.name = "JsonWebTokenError";

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: expect.stringContaining("Invalid token"),
        })
      );
    });

    it("should handle generic errors with 500 status", () => {
      const error = new Error("Something went wrong");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: "Something went wrong",
      });
    });
  });
});
