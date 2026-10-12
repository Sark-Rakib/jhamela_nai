/**
 * End-to-end API test against a real (in-memory) MongoDB.
 *
 * Covers the flows that the route smoke test cannot: registration, session
 * cookies, tool-state persistence, history, analytics aggregation and admin
 * gating. Run with: npm run test:api --workspace @jhamela-nai/server
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.JWT_SECRET = "integration-test-secret-value";
process.env.GEMINI_MODEL = "gemini-2.0-flash";

const PORT = Number(process.env.TEST_PORT ?? 4399);
const BASE = `http://127.0.0.1:${PORT}`;

let mongo: MongoMemoryServer | undefined;
let server: { close(): void } | undefined;
let cookie = "";
let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(` FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function call(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth && cookie) headers.Cookie = cookie;

  const response = await fetch(`${BASE}${path}`, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const setCookie = response.headers.getSetCookie?.() ?? [];
  if (setCookie.length) cookie = setCookie.map((value) => value.split(";")[0]).join("; ");

  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    body = { raw: text };
  }
  return { status: response.status, body };
}

async function main() {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("jhamela-nai-test");

  const { connect, disconnect } = await import("../config/db.js");
  await connect();
  const { createApp } = await import("../app.js");
  const app = createApp();
  server = app.listen(PORT) as unknown as { close(): void };
  await new Promise((resolve) => setTimeout(resolve, 400));

  const credentials = {
    name: "পরীক্ষা ব্যবহারকারী",
    email: "tester@jhamelanai.com",
    password: "TestPass123",
  };

  // ── Registration ────────────────────────────────────────────────────────────
  const register = await call("/api/auth/register", { body: credentials });
  check(
    "register → 201",
    register.status === 201 && register.body.success === true,
    `status=${register.status}`,
  );
  check(
    "register sets an httpOnly session cookie",
    cookie.startsWith("jn_token="),
    cookie.slice(0, 24),
  );

  const user = (register.body.data as { user?: { email?: string; plan?: string } })?.user;
  check("register returns the user", user?.email === credentials.email, JSON.stringify(user));

  const duplicate = await call("/api/auth/register", { body: credentials });
  check("duplicate email → 409", duplicate.status === 409, `status=${duplicate.status}`);

  const weak = await call("/api/auth/register", {
    body: { name: "ক", email: "bad-email", password: "abc" },
  });
  check("invalid payload → 400 with field details", weak.status === 400 && !!weak.body.details);

  // ── Session ─────────────────────────────────────────────────────────────────
  const me = await call("/api/auth/me", { auth: true });
  check(
    "GET /auth/me returns the session user",
    me.status === 200 &&
      (me.body.data as { user?: { email?: string } })?.user?.email === credentials.email,
    `status=${me.status}`,
  );

  // ── Tool state ──────────────────────────────────────────────────────────────
  const saved = await call("/api/tools/budget-planner/state", {
    auth: true,
    body: { state: { income: 50000, expense: 32000 }, label: "জুলাই বাজেট" },
  });
  check(
    "POST tool state → saved",
    saved.status === 200 &&
      (saved.body.data as { state?: { income?: number } })?.state?.income === 50000,
    `status=${saved.status}`,
  );

  const fetched = await call("/api/tools/budget-planner/state", { auth: true });
  check(
    "GET tool state returns the saved value",
    fetched.status === 200 &&
      (fetched.body.data as { state?: { expense?: number } })?.state?.expense === 32000,
    `status=${fetched.status}`,
  );

  const unknownSlug = await call("/api/tools/Not A Slug/state", { auth: true });
  check("invalid slug → 400", unknownSlug.status === 400, `status=${unknownSlug.status}`);

  const missing = await call("/api/tools/study-planner/state", { auth: true });
  check("never-saved tool → 404", missing.status === 404, `status=${missing.status}`);

  await call("/api/tools/budget-planner/state", {
    auth: true,
    body: { state: { income: 55000, expense: 30000 } },
  });

  const history = await call("/api/tools/budget-planner/state/history", { auth: true });
  const historyRows = (history.body.data as { history?: unknown[] })?.history ?? [];
  check("history keeps the previous snapshot", historyRows.length >= 1, `rows=${historyRows.length}`);

  const listed = await call("/api/tools/states", { auth: true });
  const items = (listed.body.data as { items?: unknown[] })?.items ?? [];
  check("dashboard listing returns the tool", items.length === 1, `items=${items.length}`);

  const anonymous = await call("/api/tools/budget-planner/state");
  check("anonymous tool-state read → 401", anonymous.status === 401, `status=${anonymous.status}`);

  // ── Per-user data isolation ─────────────────────────────────────────────────
  const primaryCookie = cookie;
  cookie = "";

  const second = {
    name: "দ্বিতীয় ব্যবহারকারী",
    email: "second@jhamelanai.com",
    password: "SecondPass123",
  };
  const secondRegister = await call("/api/auth/register", { body: second });
  check("second account registers", secondRegister.status === 201, `status=${secondRegister.status}`);

  const secondSave = await call("/api/tools/budget-planner/state", {
    auth: true,
    body: { state: { income: 11111, expense: 111 } },
  });
  check("second account saves the same tool slug", secondSave.status === 200, `status=${secondSave.status}`);

  const secondFetch = await call("/api/tools/budget-planner/state", { auth: true });
  const secondIncome = (secondFetch.body.data as { state?: { income?: number } })?.state?.income;
  check("second account reads only its own state", secondIncome === 11111, `income=${secondIncome}`);

  cookie = primaryCookie;
  const primaryFetch = await call("/api/tools/budget-planner/state", { auth: true });
  const primaryIncome = (primaryFetch.body.data as { state?: { income?: number } })?.state?.income;
  check("first account state is untouched by the second", primaryIncome === 55000, `income=${primaryIncome}`);

  const primaryList = await call("/api/tools/states", { auth: true });
  const primaryItems = (primaryList.body.data as { items?: unknown[] })?.items ?? [];
  check("dashboard listing stays per-user", primaryItems.length === 1, `items=${primaryItems.length}`);

  // A forged cookie must never authenticate: the user is re-read from the DB.
  const forged = await fetch(`${BASE}/api/tools/states`, {
    headers: { Accept: "application/json", Cookie: "jn_token=forged.signature.value" },
  });
  check("forged session cookie → 401", forged.status === 401, `status=${forged.status}`);

  // ── Analytics ───────────────────────────────────────────────────────────────
  const batch = await call("/api/analytics/events", {
    auth: true,
    body: {
      sessionId: "test-session",
      events: [
        { event: "tool_opened", tool: "budget-planner", category: "money" },
        { event: "pdf_downloaded", tool: "budget-planner" },
      ],
    },
  });
  check("analytics batch accepted", batch.status === 202, `status=${batch.status}`);

  const summaryDenied = await call("/api/analytics/summary", { auth: true });
  check("non-admin summary → 403", summaryDenied.status === 403, `status=${summaryDenied.status}`);

  // Promote the test user so the admin-only aggregate is exercised too.
  const { User } = await import("../models/user.model.js");
  await User.updateOne({ email: credentials.email }, { $set: { role: "admin" } });

  const summary = await call("/api/analytics/summary", { auth: true });
  const aggregate = summary.body.data as { total?: number; byTool?: { slug: string; count: number }[] };
  check(
    "admin summary aggregates the events",
    summary.status === 200 && (aggregate?.total ?? 0) >= 2 && (aggregate?.byTool?.length ?? 0) >= 1,
    `status=${summary.status} total=${aggregate?.total}`,
  );

  await User.updateOne({ email: credentials.email }, { $set: { role: "user" } });

  // ── Assistant ───────────────────────────────────────────────────────────────
  const ask = await call("/api/ai/assistant", { body: { query: "মাসের বাজেট বানাতে চাই" } });
  const answer = ask.body.data as { slug?: string; source?: string };
  check("assistant resolves a catalogue slug", answer?.slug === "budget-planner", answer?.slug);
  check("assistant falls back to the local engine without a key", answer?.source === "local", answer?.source);

  // ── Login / logout ──────────────────────────────────────────────────────────
  const wrong = await call("/api/auth/login", {
    body: { email: credentials.email, password: "wrong-pass" },
  });
  check("wrong password → 401", wrong.status === 401, `status=${wrong.status}`);

  const logout = await call("/api/auth/logout", { auth: true, method: "POST", body: {} });
  check("logout succeeds", logout.status === 200, `status=${logout.status}`);

  const login = await call("/api/auth/login", {
    body: { email: credentials.email, password: credentials.password },
  });
  check(
    "login succeeds with the seeded password",
    login.status === 200 && cookie.startsWith("jn_token="),
    `status=${login.status}`,
  );

  const deleted = await call("/api/tools/budget-planner/state", { auth: true, method: "DELETE" });
  check("delete tool state", deleted.status === 200, `status=${deleted.status}`);

  const afterDelete = await call("/api/tools/budget-planner/state", { auth: true });
  check("state is gone after deletion", afterDelete.status === 404, `status=${afterDelete.status}`);

  server.close();
  await disconnect();
  await mongo.stop();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error("\nintegration run failed:", error instanceof Error ? error.stack : error);
  server?.close();
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
  if (mongo) await mongo.stop();
  process.exit(1);
});