import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

interface MongooseLikeError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

function normalise(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "_";
      (details[key] ??= []).push(issue.message);
    }
    return ApiError.badRequest("তথ্য সঠিকভাবে পূরণ করুন।", details);
  }

  const mongo = error as MongooseLikeError;
  if (mongo?.code === 11000) {
    const field = Object.keys(mongo.keyValue ?? {})[0] ?? "value";
    const message =
      field === "email"
        ? "এই ইমেইল দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে।"
        : "এই তথ্য আগেই ব্যবহার করা হয়েছে।";
    return ApiError.conflict(message);
  }
  if (mongo?.name === "ValidationError") {
    return ApiError.badRequest("তথ্য সঠিকভাবে পূরণ করুন।");
  }
  if (mongo?.name === "CastError") {
    return ApiError.badRequest("অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
  if (typeof mongo?.message === "string" && mongo.message.includes("ETIMEDOUT")) {
    return ApiError.unavailable("ডেটাবেস সাময়িকভাবে অপ্রাপ্য। একটু পরে আবার চেষ্টা করুন।");
  }

  return new ApiError(500, "সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।", "INTERNAL_ERROR");
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `এই ঠিকানাটি পাওয়া যায়নি: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(error);

  const apiError = normalise(error);
  if (apiError.status >= 500) {
    console.error(`[api] ${apiError.status} ${(error as Error)?.message ?? error}`);
  }

  return res.status(apiError.status).json({
    success: false,
    code: apiError.code,
    message: apiError.message,
    ...(apiError.details ? { details: apiError.details } : {}),
    ...(env.NODE_ENV === "development" && apiError.status >= 500
      ? { debug: (error as Error)?.message }
      : {}),
  });
}