export interface FullAuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export type UsedAuthResponse = Omit<
  FullAuthResponse,
  "refreshToken" | "user"
> & {
  userId: string;
};

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  id: string;
}

export interface RefreshTokenResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export type UsedRefreshTokenResponse = Omit<
  RefreshTokenResponse,
  "refreshToken"
>;

export const enum AuthStatus {
  pending = "pending",
  resolved = "resolved",
  idle = "idle",
  rejected = "rejected",
}

export interface AuthState extends UsedAuthResponse {
  authStatus: AuthStatus;
  showToast: boolean;
}

export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}
