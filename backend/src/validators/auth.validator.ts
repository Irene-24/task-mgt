import { z } from "zod";
import { ROLE_LIST } from "@/utils/constants";

// Auth validation schemas
export const registerSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(ROLE_LIST).optional(),
});

export const signInSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// User validation schemas
export const updateRoleSchema = z.object({
  role: z.enum(
    ROLE_LIST,
    `Please provide a valid role, must be one of ${ROLE_LIST.join(", ")}`
  ),
});
