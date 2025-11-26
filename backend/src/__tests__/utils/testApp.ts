import express, { Application } from "express";
import v1Routes from "@/routes/v1";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

/**
 * Create a test Express app without database connection
 * Use this for integration tests with supertest
 */
export const createTestApp = (): Application => {
  const app = express();

  app.disable("x-powered-by").use(express.json()).use("/v1", v1Routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
