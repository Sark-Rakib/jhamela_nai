import { Router } from "express";

import { aiRouter, analyticsRouter, healthRouter } from "./ai.routes.js";
import { authRouter } from "./auth.routes.js";
import { toolStateRouter } from "./tool-state.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/tools", toolStateRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/analytics", analyticsRouter);