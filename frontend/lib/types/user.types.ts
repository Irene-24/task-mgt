export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetMeResponse {
  user: User;
}

export interface GetUserByIdResponse {
  user: User;
}

export interface GetAllUsersResponse {
  users: User[];
  count: number;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserRoleResponse {
  user: User;
}
