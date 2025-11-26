import winston from "winston";
import "winston-mongodb"; // registers MongoDB transport
import morgan from "morgan";
import { appConfig } from "@/config/appConfig";

// Winston logger transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  // File transport
  new winston.transports.File({ filename: "logs/app.log" }),
];

// Create the logger
export const logger = winston.createLogger({
  level: appConfig.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

// Function to add MongoDB transport after connection
export const addMongoDBTransport = (mongooseConnection: any) => {
  logger.add(
    new (winston.transports as any).MongoDB({
      db: mongooseConnection.useDb("logsDB"),
      collection: "logs",
      level: appConfig.logLevel,
      tryReconnect: true,
      capped: false,
    })
  );
  logger.info("MongoDB transport added to logger");
};

// Morgan middleware using Winston
export const morganMiddleware = morgan("combined", {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
});
