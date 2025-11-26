import { Request, Response } from "express";
import User from "@/models/User.model";
import { asyncHandler, AppError } from "@/middleware/errorHandler";

// Get current user's profile
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    user: user.toJSON(),
  });
});

// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().select("firstName lastName email role");

  res.status(200).json({
    users,
    count: users.length,
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    user: user.toJSON(),
  });
});

// Update user role
export const updateUserRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      user: user.toJSON(),
    });
  }
);
