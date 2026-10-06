import { Router } from "express";

import { ask, health } from "../controllers/ai.controller.js";
import { summarise, trackEvents } from "../controllers/analytics.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";
import { aiLimiter } from "../middlewares/rate-limit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { assistantQuerySchema } from "../validators/ai.validator.js";
import { analyticsBatchSchema } from "../validators/tool-state.validator.js";

export const aiRouter = Router();

aiRouter.post("/assistant", aiLimiter, validate({ body: assistantQuerySchema }), asyncHandler(ask));

export const analyticsRouter = Router();

analyticsRouter.post("/events", validate({ body: analyticsBatchSchema }), asyncHandler(trackEvents));

analyticsRouter.get("/summary", requireRole("admin"), asyncHandler(summarise));

export const healthRouter = Router();

healthRouter.get("/", asyncHandler(health));