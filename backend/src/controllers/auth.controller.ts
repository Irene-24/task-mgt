import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/User.model";
import RefreshToken from "@/models/RefreshToken.model";
import { asyncHandler, AppError } from "@/middleware/errorHandler";
import { appConfig } from "@/config/appConfig";
import { UserRole } from "@/utils/constants";

// Generate JWT tokens and store refresh token
const generateTokens = async (userId: string, role: UserRole) => {
  const accessSignOptions: jwt.SignOptions = {
    expiresIn: appConfig.jwtExpiresIn || ("15m" as any),
  };
  const accessToken = jwt.sign(
    { id: userId, role },
    appConfig.jwtSecret as jwt.Secret,
    accessSignOptions
  );

  // Add random string to prevent collisions when tests run rapidly
  const refreshSignOptions: jwt.SignOptions = {
    expiresIn: appConfig.jwtRefreshExpiresIn || ("7d" as any),
  };
  const randomSuffix = Math.random().toString(36).substring(7);
  const refreshToken = jwt.sign(
    { id: userId, role, nonce: randomSuffix },
    appConfig.jwtRefreshSecret as jwt.Secret,
    refreshSignOptions
  );

  // Calculate expiration date
  const expiresIn = appConfig.jwtRefreshExpiresIn || "7d";
  const expiresAt = new Date();
  if (expiresIn.endsWith("d")) {
    expiresAt.setDate(expiresAt.getDate() + Number.parseInt(expiresIn));
  } else if (expiresIn.endsWith("h")) {
    expiresAt.setHours(expiresAt.getHours() + Number.parseInt(expiresIn));
  } else if (expiresIn.endsWith("m")) {
    expiresAt.setMinutes(expiresAt.getMinutes() + Number.parseInt(expiresIn));
  }

  // Store refresh token in database
  await RefreshToken.create({
    token: refreshToken,
    userId,
    expiresAt,
  });

  return { accessToken, refreshToken };
};

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role = UserRole.USER,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (existingUser) {
    throw new AppError("This email is already registered", 400);
  }

  // Create user (password will be hashed by pre-save hook)
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role,
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(
    user._id.toString(),
    user.role
  );

  res.status(201).json({
    user: user.toJSON(),
    accessToken,
    refreshToken,
  });
});

// Sign in user
export const signIn = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(
    user._id.toString(),
    user.role
  );

  res.status(200).json({
    user: user.toJSON(),
    accessToken,
    refreshToken,
  });
});

// Refresh access token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken: token } = req.body;

    try {
      // Check if token exists and is valid in database
      const isValid = await RefreshToken.isValidToken(token);
      if (!isValid) {
        throw new AppError("Invalid or revoked refresh token", 401);
      }

      // Verify refresh token
      const decoded = jwt.verify(token, appConfig.jwtRefreshSecret) as {
        id: string;
        role: UserRole;
      };

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isActive) {
        throw new AppError("Account is deactivated", 403);
      }

      // Revoke old refresh token
      await RefreshToken.revokeToken(token);

      // Generate new tokens
      const tokens = await generateTokens(user._id.toString(), user.role);

      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Refresh token has expired", 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid refresh token", 401);
      }
      throw error;
    }
  }
);

// Logout user
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError("Refresh token is required", 400);
  }

  // Revoke the refresh token
  await RefreshToken.revokeToken(token);

  res.status(200).json({
    message: "Logged out successfully",
  });
});
