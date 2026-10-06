import type { Request, Response } from "express";

import { answerAssistant } from "../services/ai.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ok } from "../utils/respond.js";

/**
 * Free-text → tool resolver.
 *
 * Returns a slug (never a made-up one) so the web app can hydrate the full tool
 * definition from its own catalogue.
 */
export const ask = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.body as { query: string };
  const answer = await answerAssistant(query);
  return ok(res, answer);
});

export const health = asyncHandler(async (_req: Request, res: Response) => {
  const mongoose = await import("mongoose");
  return ok(res, {
    status: "ok",
    db: mongoose.default.connection.readyState === 1 ? "connected" : "connecting",
    ai: process.env.GEMINI_API_KEY ? "gemini" : "local",
    time: new Date().toISOString(),
  });
});