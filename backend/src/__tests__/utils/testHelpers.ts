import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "@/models/User.model";
import Task from "@/models/Task.model";
import RefreshToken from "@/models/RefreshToken.model";
import { UserRole, TaskStatus } from "@/utils/constants";
import { appConfig } from "@/config/appConfig";

export interface TestUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export interface TestTask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
}

/**
 * Create a test user in the database
 */
export const createTestUser = async (
  overrides?: Partial<TestUser>
): Promise<any> => {
  const defaultUser = {
    email: `test-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}@example.com`,
    password: "Test@123",
    firstName: "Test",
    lastName: "User",
    role: UserRole.USER,
    isActive: true,
  };

  const userData = { ...defaultUser, ...overrides };
  const user = await User.create(userData);
  return user;
};

/**
 * Create a test admin user
 */
export const createTestAdmin = async (
  overrides?: Partial<TestUser>
): Promise<any> => {
  return createTestUser({ role: UserRole.ADMIN, ...overrides });
};

/**
 * Create a test task in the database
 */
export const createTestTask = async (
  createdBy: Types.ObjectId,
  overrides?: Partial<TestTask>
): Promise<any> => {
  const defaultTask = {
    title: `Test Task ${Date.now()}`,
    description: "This is a test task description that meets minimum length",
    status: TaskStatus.PENDING,
    createdBy,
  };

  const taskData = { ...defaultTask, ...overrides };
  const task = await Task.create(taskData);
  return task;
};

/**
 * Generate JWT access token for testing
 */
export const generateTestAccessToken = (
  userId: Types.ObjectId,
  role: UserRole = UserRole.USER
): string => {
  const signOptions: jwt.SignOptions = {
    expiresIn: (appConfig.jwtExpiresIn || "15m") as any,
  };
  return jwt.sign(
    { id: userId.toString(), role },
    appConfig.jwtSecret as jwt.Secret,
    signOptions
  );
};

/**
 * Generate JWT refresh token for testing
 */
export const generateTestRefreshToken = (userId: Types.ObjectId): string => {
  const signOptions: jwt.SignOptions = {
    expiresIn: (appConfig.jwtRefreshExpiresIn || "7d") as any,
  };
  // Add random string to prevent collisions
  const randomSuffix = Math.random().toString(36).substring(7);
  return jwt.sign(
    { userId: userId.toString(), nonce: randomSuffix },
    appConfig.jwtRefreshSecret as jwt.Secret,
    signOptions
  );
};

/**
 * Create refresh token in database
 */
export const createTestRefreshToken = async (
  userId: Types.ObjectId,
  token?: string
): Promise<any> => {
  const refreshToken = token || generateTestRefreshToken(userId);
  const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;

  return await RefreshToken.create({
    token: refreshToken,
    userId,
    expiresAt: new Date(decoded.exp! * 1000),
    isRevoked: false,
  });
};

/**
 * Get authorization header with Bearer token
 */
export const getAuthHeader = (token: string): { Authorization: string } => {
  return { Authorization: `Bearer ${token}` };
};

/**
 * Clean all test data from database
 */
export const cleanDatabase = async (): Promise<void> => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await RefreshToken.deleteMany({});
};
