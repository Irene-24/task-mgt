import { Router } from "express";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { validateBody, validateParams } from "@/middleware/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from "@/validators/task.validator";
import {
  getTaskStats,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from "@/controllers/task.controller";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /tasks/stats - Get task statistics for dashboard
router.get("/stats", getTaskStats);

// GET /tasks - List tasks with filtering, sorting, and pagination
router.get("/", getTasks);

// POST /tasks - Create a new task
router.post("/", validateBody(createTaskSchema), createTask);

// PATCH /tasks/:id/toggle - Toggle task status (must be before /:id route)
router.patch(
  "/:id/toggle",
  validateParams(taskIdParamSchema),
  toggleTaskStatus
);

// GET /tasks/:id - Get a specific task
router.get("/:id", validateParams(taskIdParamSchema), getTaskById);

// PATCH /tasks/:id - Update a task
router.patch(
  "/:id",
  validateParams(taskIdParamSchema),
  validateBody(updateTaskSchema),
  updateTask
);

// DELETE /tasks/:id - Delete a task (admin only)
router.delete("/:id", validateParams(taskIdParamSchema), isAdmin, deleteTask);

export default router;
