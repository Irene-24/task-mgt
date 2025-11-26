import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  port: process.env.PORT || 5050,
  env: process.env.NODE_ENV || "production",
  logLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
  dbUrl: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    "your-refresh-secret-key-change-in-production",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  maxPageSize: Number(process.env.PAGE_SIZE) || 20,
  dbName: {
    logs: "logsDB",
    app: "appDB",
  },
};
