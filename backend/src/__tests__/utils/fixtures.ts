import { UserRole, TaskStatus } from "@/utils/constants";

export const validUserData = {
  email: "test@example.com",
  password: "Test@123",
  firstName: "John",
  lastName: "Doe",
  role: UserRole.USER,
};

export const validAdminData = {
  email: "admin@example.com",
  password: "Admin@123",
  firstName: "Admin",
  lastName: "User",
  role: UserRole.ADMIN,
};

export const validTaskData = {
  title: "Test Task",
  description: "This is a test task description with sufficient length",
  status: TaskStatus.PENDING,
};

export const invalidUserData = {
  missingEmail: {
    password: "Test@123",
    firstName: "John",
    lastName: "Doe",
  },
  invalidEmail: {
    email: "invalid-email",
    password: "Test@123",
    firstName: "John",
    lastName: "Doe",
  },
  weakPassword: {
    email: "test@example.com",
    password: "weak",
    firstName: "John",
    lastName: "Doe",
  },
  missingFirstName: {
    email: "test@example.com",
    password: "Test@123",
    lastName: "Doe",
  },
};

export const invalidTaskData = {
  missingTitle: {
    description: "Description without title",
  },
  shortTitle: {
    title: "Ab",
    description: "Valid description with enough characters",
  },
  longTitle: {
    title: "A".repeat(101),
    description: "Valid description",
  },
  shortDescription: {
    title: "Valid Title",
    description: "Short",
  },
  longDescription: {
    title: "Valid Title",
    description: "A".repeat(1001),
  },
};
