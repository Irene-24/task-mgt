import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@/middleware/validate.middleware";

describe("Validate Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe("validateBody", () => {
    const schema = z.object({
      email: z.email(),
      age: z.number().min(18),
    });

    it("should pass validation with valid body", () => {
      mockRequest.body = { email: "test@example.com", age: 25 };

      const middleware = validateBody(schema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.body).toEqual({ email: "test@example.com", age: 25 });
    });

    it("should fail validation with invalid email", () => {
      mockRequest.body = { email: "invalid-email", age: 25 };

      const middleware = validateBody(schema);

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).toThrow();
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should fail validation with age below minimum", () => {
      mockRequest.body = { email: "test@example.com", age: 15 };

      const middleware = validateBody(schema);

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).toThrow();
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should fail validation with missing required fields", () => {
      mockRequest.body = { email: "test@example.com" };

      const middleware = validateBody(schema);

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).toThrow();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("validateParams", () => {
    const schema = z.object({
      id: z.string().min(1),
    });

    it("should pass validation with valid params", () => {
      mockRequest.params = { id: "123" };

      const middleware = validateParams(schema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.params).toEqual({ id: "123" });
    });

    it("should fail validation with empty id", () => {
      mockRequest.params = { id: "" };

      const middleware = validateParams(schema);

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).toThrow();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("validateQuery", () => {
    const schema = z.object({
      page: z.string().transform(Number).pipe(z.number().min(1)),
      limit: z.string().transform(Number).pipe(z.number().max(100)),
    });

    it("should pass validation and transform query params", () => {
      mockRequest.query = { page: "2", limit: "20" };

      const middleware = validateQuery(schema);
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.query).toEqual({ page: 2, limit: 20 });
    });

    it("should fail validation with invalid page", () => {
      mockRequest.query = { page: "0", limit: "20" };

      const middleware = validateQuery(schema);

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).toThrow();
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should fail validation with limit exceeding max", () => {
      mockRequest.query = { page: "1", limit: "200" };

      const middleware = validateQuery(schema);

      expect(() => {
        middleware(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        );
      }).toThrow();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
