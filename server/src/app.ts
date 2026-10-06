import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env, isProduction } from "./config/env.js";
import { attachUser } from "./middlewares/auth.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rate-limit.middleware.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  // Required for correct client IPs (rate limiting) behind Vercel/Railway proxies.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      // The API serves JSON only; CSP is enforced by Next.js for the web app.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(compression());
  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: false, limit: "512kb" }));
  app.use(cookieParser());
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use(attachUser);

  app.use("/api", apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}