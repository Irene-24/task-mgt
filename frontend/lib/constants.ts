import { UserRole } from "@/types/user.types";
import { TaskStatus } from "@/types/task.types";

export const ROLE_LIST = [UserRole.ADMIN, UserRole.USER];

export const ROLE_DETAILS = [
  {
    label: "Admin",
    value: UserRole.ADMIN,
    description: "Full access to all features and settings.",
  },
  {
    label: "User",
    value: UserRole.USER,
    description: "Can manage own tasks and view assigned tasks.",
  },
];

export const TASK_STATUS_LIST = [TaskStatus.PENDING, TaskStatus.COMPLETED];

export const TASK_STATUS_DETAILS = [
  {
    label: "In progress",
    value: TaskStatus.PENDING,
  },
  {
    label: "Completed",
    value: TaskStatus.COMPLETED,
  },
];

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/v1";
export const MAX_PAGE_SIZE = 5;
