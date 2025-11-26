import express, { Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { morganMiddleware, logger, addMongoDBTransport } from "@/utils/logger";
import { connectDB } from "@/config/db";
import { swaggerSpec } from "@/config/swagger";
import v1 from "@/routes/v1";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

export const createServer = async () => {
  const app = express();

  try {
    const mongoConnection = await connectDB();
    addMongoDBTransport(mongoConnection);
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit the process with failure
  }

  app
    .disable("x-powered-by")
    .use(cors())
    .use(morganMiddleware)
    .use(express.json());

  // Swagger documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swagger JSON endpoint for Postman import
  app.get("/api-docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use("/v1", v1);

  app.get(["/", "/api", "/health"], (req: Request, res: Response) => {
    logger.info("Health check endpoint called");
    res.json({
      message: "Server is up and running!",
      env: process.env.NODE_ENV || "production",
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
