/**
 * MongoDB connection handling.
 *
 * `connect()` retries a few times so a cold database container does not crash
 * the API permanently, and listeners keep logging unexpected disconnects.
 */

import mongoose from "mongoose";

import { env, isProduction } from "./env.js";
import { AnalyticsEvent } from "../models/analytics-event.model.js";
import { ToolState } from "../models/tool-state.model.js";
import { User } from "../models/user.model.js";

const MAX_ATTEMPTS = 5;
const RETRY_MS = 3_000;

/**
 * The database the URI points at, falling back to `MONGODB_DB`.
 *
 * `mongodb+srv://host/?appName=x` has an empty path, and MongoDB then defaults
 * to a database literally named `test` — shared with anything else on the
 * cluster. Resolving it here keeps every model in one known database.
 */
function resolveDatabaseName(): string {
  let fromUri = "";
  try {
    fromUri = new URL(env.MONGODB_URI).pathname.replace(/^\//, "").trim();
  } catch {
    fromUri = "";
  }
  return fromUri || env.MONGODB_DB;
}

export async function connect(): Promise<typeof mongoose> {
  // Filters are always built server-side from validated input, so operator
  // objects such as `{ occurredAt: { $gte: since } }` must stay untouched.
  // (`sanitizeFilter` rewrites those and turns valid ranges into cast errors.)
  mongoose.set("strictQuery", true);

  const dbName = resolveDatabaseName();
  if (dbName === "test") {
    console.warn(
      "[db] resolved database is \"test\" — set MONGODB_DB or add the database name to MONGODB_URI.",
    );
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName,
        serverSelectionTimeoutMS: 10_000,
        autoIndex: !isProduction,
      });
      // `autoIndex` is off in production, so build the unique email / TTL
      // indexes explicitly — `init()` is a no-op when they already exist.
      await Promise.all([User.init(), ToolState.init(), AnalyticsEvent.init()]);
      console.log(`[db] connected (${mongoose.connection.name})`);
      return mongoose;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === MAX_ATTEMPTS) {
        console.error(`[db] giving up after ${MAX_ATTEMPTS} attempts: ${message}`);
        throw error;
      }
      console.warn(`[db] attempt ${attempt}/${MAX_ATTEMPTS} failed (${message}); retrying in ${RETRY_MS}ms`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
    }
  }

  throw new Error("unreachable");
}

export async function disconnect(): Promise<void> {
  await mongoose.connection.close();
}