import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

import { ApiError } from "../utils/api-error.js";

function toFieldErrors(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (details[key] ??= []).push(issue.message);
  }
  return details;
}

function parse<T extends ZodType>(schema: T, value: unknown): unknown {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw ApiError.badRequest("তথ্য সঠিকভাবে পূরণ করুন।", toFieldErrors(result.error));
  }
  return result.data;
}

/**
 * Validates and *replaces* `req.body` / `req.query` / `req.params` with the parsed
 * value, which strips unknown keys before anything reaches Mongoose.
 */
export function validate(schemas: {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = parse(schemas.body, req.body);
      if (schemas.query) {
        const parsed = parse(schemas.query, req.query);
        Object.defineProperty(req, "query", { value: parsed, writable: true, configurable: true });
      }
      if (schemas.params) req.params = parse(schemas.params, req.params) as typeof req.params;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}