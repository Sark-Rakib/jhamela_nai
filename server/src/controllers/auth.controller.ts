import type { Request, Response } from "express";

import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/user.model.js";
import type { LoginInput, RegisterInput, UpdateProfileInput } from "../validators/auth.validator.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { cookieOptions, signToken } from "../utils/jwt.js";
import { created, ok } from "../utils/respond.js";

interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  plan: string;
  locale: string;
  createdAt: string;
}

interface UserLike {
  _id: unknown;
  name: string;
  email: string;
  phone: string;
  role: string;
  plan: string;
  locale: string;
  createdAt: Date | string;
}

/** Accepts both hydrated documents and `.lean()` results. */
function toPublic(user: UserDocument | UserLike): PublicUser {
  const doc = user as UserLike;
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    phone: doc.phone ?? "",
    role: doc.role,
    plan: doc.plan ?? "free",
    locale: doc.locale,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

function issue(res: Response, user: UserDocument) {
  res.cookie(env.COOKIE_NAME, signToken({ id: String(user._id), email: user.email, role: user.role as "user" | "admin" }), cookieOptions);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body as RegisterInput;

  const existing = await User.exists({ email });
  if (existing) throw ApiError.conflict("এই ইমেইল দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে।");

  const user = new User({ name, email, passwordHash: password, ...(phone ? { phone } : {}) });
  await user.save();
  issue(res, user);

  return created(res, { user: toPublic(user) }, "অ্যাকাউন্ট তৈরি হয়েছে। স্বাগতম!");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
  }
  if (!user.isActive) throw ApiError.forbidden("এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  issue(res, user);

  return ok(res, { user: toPublic(user) }, "স্বাগতম!");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  return ok(res, { user: null }, "লগআউট হয়েছে।");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return ok(res, { user: null });
  const user = await User.findById(req.user.id).lean();
  if (!user) return ok(res, { user: null });
  return ok(res, { user: toPublic(user as UserLike) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized();

  const patch = req.body as UpdateProfileInput;
  if (patch.name) user.name = patch.name;
  if (patch.locale) user.locale = patch.locale;
  await user.save();

  return ok(res, { user: toPublic(user) }, "তথ্য আপডেট হয়েছে।");
});