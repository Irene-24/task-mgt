import express from "express";
import {
  register,
  signIn,
  refreshToken,
  logout,
} from "@/controllers/auth.controller";
import { validateBody } from "@/middleware/validate.middleware";
import {
  registerSchema,
  signInSchema,
  refreshTokenSchema,
} from "@/validators/auth.validator";

const router = express.Router();

router.post("/register", validateBody(registerSchema), register);

router.post("/signin", validateBody(signInSchema), signIn);

router.post("/refresh", validateBody(refreshTokenSchema), refreshToken);

router.post("/logout", validateBody(refreshTokenSchema), logout);

export default router;
