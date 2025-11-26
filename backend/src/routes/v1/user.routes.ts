import express from "express";
import {
  getMe,
  getAllUsers,
  getUserById,
  updateUserRole,
} from "@/controllers/user.controller";
import { authenticate, isAdmin } from "@/middleware/auth.middleware";
import { validateBody } from "@/middleware/validate.middleware";
import { updateRoleSchema } from "@/validators/auth.validator";

const router = express.Router();

// @route   GET /v1/users/me - Get current user's profile
router.get("/me", authenticate, getMe);

// @route   GET /v1/users - Get all users (admin only)
router.get("/", authenticate, isAdmin, getAllUsers);

// @route   GET /v1/users/:id
router.get("/:id", authenticate, getUserById);

// @route   PATCH /v1/users/:id/role
router.patch(
  "/:id/role",
  authenticate,
  isAdmin,
  validateBody(updateRoleSchema),
  updateUserRole
);

export default router;
