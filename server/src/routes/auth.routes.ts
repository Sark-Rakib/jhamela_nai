import { Router } from "express";

import { login, logout, me, register, updateProfile } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rate-limit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(register),
);

authRouter.post("/login", authLimiter, validate({ body: loginSchema }), asyncHandler(login));

authRouter.post("/logout", asyncHandler(logout));

authRouter.get("/me", asyncHandler(me));

authRouter.patch(
  "/me",
  requireAuth,
  validate({ body: updateProfileSchema }),
  asyncHandler(updateProfile),
);