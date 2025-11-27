import swaggerJsdoc from "swagger-jsdoc";
import { appConfig } from "./appConfig";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Management API",
      version: "1.0.0",
      description:
        "A comprehensive task management API with user authentication, task CRUD operations, and more.",
      contact: {
        name: "API Support",
        email: "okaforirenen@gmail.com",
      },
    },
    servers: [
      {
        url:
          appConfig.env === "production"
            ? appConfig.prodUrl
            : `http://localhost:${appConfig.port}`,
        description:
          appConfig.env === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your access token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            email: { type: "string", example: "john.doe@example.com" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            isActive: { type: "boolean", example: true },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            title: {
              type: "string",
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              example: "Write comprehensive API documentation",
            },
            status: {
              type: "string",
              enum: ["pending", "completed"],
              example: "pending",
            },
            createdBy: { type: "string", example: "507f1f77bcf86cd799439011" },
            assignedTo: { type: "string", example: "507f1f77bcf86cd799439011" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Error message" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/controllers/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
