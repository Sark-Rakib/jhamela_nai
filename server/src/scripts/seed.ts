/**
 * Development seed: creates one admin and one demo user.
 *
 * Passwords come from the environment so nothing secret is ever committed.
 * Usage: ADMIN_PASSWORD=... USER_PASSWORD=... npm run seed
 */

import { connect, disconnect } from "../config/db.js";
import { User } from "../models/user.model.js";
import { TOOL_INDEX } from "../services/tool-index.js";

const accounts = [
  {
    email: process.env.ADMIN_EMAIL ?? "admin@jhamelanai.com",
    name: "Jhamela Nai Admin",
    password: process.env.ADMIN_PASSWORD,
    role: "admin" as const,
  },
  {
    email: process.env.USER_EMAIL ?? "demo@jhamelanai.com",
    name: "ডেমো ব্যবহারকারী",
    password: process.env.USER_PASSWORD,
    role: "user" as const,
  },
];

async function main() {
  await connect();

  for (const account of accounts) {
    if (!account.password) {
      console.warn(`[seed] skipped ${account.email} — no password supplied.`);
      continue;
    }

    const passwordHash = await User.hashPassword(account.password);
    await User.findOneAndUpdate(
      { email: account.email },
      { $set: { name: account.name, passwordHash, role: account.role, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`[seed] ${account.role.padEnd(5)} ${account.email}`);
  }

  console.log(`[seed] assistant index ready for ${TOOL_INDEX.length} tools.`);
  await disconnect();
}

main().catch((error: unknown) => {
  console.error("[seed] failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});