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
