export const enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export const ROLE_LIST = [UserRole.ADMIN, UserRole.USER];

export const enum TaskStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export const TASK_STATUS_LIST = [TaskStatus.PENDING, TaskStatus.COMPLETED];

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/v1";
export const MAX_PAGE_SIZE = 20;
