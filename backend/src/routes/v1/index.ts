import express from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import taskRoutes from "./task.routes";

const v1 = express.Router();

// Auth routes
v1.use("/auth", authRoutes);

// User routes
v1.use("/users", userRoutes);

// Task routes
v1.use("/tasks", taskRoutes);

export default v1;
