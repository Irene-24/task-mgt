import mongoose from "mongoose";
import { appConfig } from "@/config/appConfig";

const mongoUrl = appConfig.dbUrl;

export const connectDB = async () => {
  await mongoose.connect(mongoUrl);

  console.log("MongoDB connected via Mongoose");

  return mongoose.connection;
};

export default mongoose.connection;
