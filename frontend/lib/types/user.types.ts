export const enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserResponse {
  user: User;
}

export interface GetAllUsersResponse {
  users: User[];
  count: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}
