import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import type { UserRole } from "../types/express.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { verifyToken } from "../utils/jwt.js";

function readToken(req: Request): string | null {
  const fromCookie = req.cookies?.[env.COOKIE_NAME];
  if (typeof fromCookie === "string" && fromCookie) return fromCookie;
  const header = req.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  return null;
}

/** Populates `req.user` when a valid token is present, never rejects. */
export const attachUser = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select("email role isActive").lean();
    if (user?.isActive) {
      req.user = { id: String(user._id), email: user.email, role: user.role as UserRole };
    }
  } catch {
    // Invalid or expired tokens are treated as anonymous.
  }
  return next();
});

/** Requires a signed-in user. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  return next();
}

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role !== role) return next(ApiError.forbidden());
    return next();
  };
}