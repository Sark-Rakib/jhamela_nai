import type { Response } from "express";

/**
 * Every response uses the same envelope the web client understands:
 * `{ success, data, message }`.
 */
export function ok<T>(res: Response, data: T, message?: string) {
  return res.json({ success: true, data, message });
}

export function created<T>(res: Response, data: T, message?: string) {
  return res.status(201).json({ success: true, data, message });
}