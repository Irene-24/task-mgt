import { z } from "zod";
import { TASK_STATUS_LIST } from "@/utils/constants";

// Create task schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  status: z.enum(TASK_STATUS_LIST).optional(),
  assignedTo: z.string().optional(),
});

// Update task schema
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  status: z.enum(TASK_STATUS_LIST).optional(),
  assignedTo: z.string().optional(),
});

// Task ID param schema
export const taskIdParamSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});
