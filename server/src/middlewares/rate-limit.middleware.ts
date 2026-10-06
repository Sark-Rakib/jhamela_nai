import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

const shared = {
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  handler: (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }) => {
    res.status(429).json({
      success: false,
      code: "RATE_LIMITED",
      message: "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
    });
  },
};

/** Broad ceiling for every API call. */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  ...shared,
  windowMs: 60_000,
  limit: 300,
});

/** Credential endpoints: tight window, long block. */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  ...shared,
  windowMs: 15 * 60_000,
  limit: 20,
  skipSuccessfulRequests: true,
});

/** Assistant endpoint: Gemini calls cost money, so keep it measured. */
export const aiLimiter: RateLimitRequestHandler = rateLimit({
  ...shared,
  windowMs: 60_000,
  limit: 30,
});