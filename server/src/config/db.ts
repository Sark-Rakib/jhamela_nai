/**
 * MongoDB connection handling.
 *
 * `connect()` retries a few times so a cold database container does not crash
 * the API permanently, and listeners keep logging unexpected disconnects.
 */

import mongoose from "mongoose";

import { env, isProduction } from "./env.js";

const MAX_ATTEMPTS = 5;
const RETRY_MS = 3_000;

export async function connect(): Promise<typeof mongoose> {
  // Filters are always built server-side from validated input, so operator
  // objects such as `{ occurredAt: { $gte: since } }` must stay untouched.
  // (`sanitizeFilter` rewrites those and turns valid ranges into cast errors.)
  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
        autoIndex: !isProduction,
      });
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