export enum TaskStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: User;
  assignedTo?: User;
  updatedBy?: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskStats = {
  total: number;
  pending: number;
  completed: number;
};

// Query params for getTasks
export type GetTasksParams = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: TaskStatus;
  search?: string;
};

// Response types
export type GetTasksResponse = {
  tasks: Task[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type GetTaskStatsResponse = {
  stats: TaskStats;
};

export type GetTaskByIdResponse = {
  task: Task;
};

export type CreateTaskRequest = {
  title: string;
  description: string;
  status?: TaskStatus;
  assignedTo?: string;
  dueDate?: string;
};

export type CreateTaskResponse = {
  task: Task;
};

export type UpdateTaskRequest = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedTo?: string;
  dueDate?: string;
};

export type UpdateTaskResponse = {
  task: Task;
};

export type ToggleTaskStatusResponse = {
  task: Task;
};

export type DeleteTaskResponse = {
  message: string;
};
