/**
 * Environment validation.
 *
 * The API refuses to boot on a misconfigured environment instead of failing at
 * the first request — a wrong `JWT_SECRET` should be a start-up error, not a
 * security incident at 3am.
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { z } from "zod";

// `server/.env` wins when present, otherwise the repo-root `.env` is read so a
// single file can configure both the web app and the API. The same depth is
// used from `src/` and `dist/`, so this works in dev and after a build.
const here = dirname(fileURLToPath(import.meta.url));
const serverEnv = resolve(here, "../../.env");
const rootEnv = resolve(here, "../../../.env");

loadEnv({ path: existsSync(serverEnv) ? serverEnv : rootEnv, quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  /**
   * Database to use when `MONGODB_URI` has no path of its own. Without it a
   * path-less Atlas URI silently connects to the default `test` database and
   * every collection lands in the wrong place. A path in the URI always wins.
   */
  MONGODB_DB: z.string().trim().min(1).default("jhamela_nai"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  /** One origin or a comma-separated list — cookies require exact matches. */
  CLIENT_URL: z.string().min(1).default("http://localhost:3000"),
  COOKIE_NAME: z.string().default("jn_token"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  console.error(`\nInvalid server environment:\n${issues}\n\nCopy .env.example to .env and fill it in.\n`);
  process.exit(1);
}

const clientOrigins = parsed.data.CLIENT_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Fail loudly on a malformed origin instead of silently rejecting every login.
for (const origin of clientOrigins) {
  try {
    new URL(origin);
  } catch {
    console.error(`Invalid CLIENT_URL origin: "${origin}" (expected e.g. http://localhost:3000)\n`);
    process.exit(1);
  }
}

export const env = { ...parsed.data, clientOrigins };
export const isProduction = env.NODE_ENV === "production";
export const hasGemini = Boolean(env.GEMINI_API_KEY);