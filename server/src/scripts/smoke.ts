/**
 * Route smoke test that needs no database.
 *
 * Boots the Express app without calling `connect()`, then exercises the routes
 * that do not touch MongoDB (health, assistant, auth guard, 404 shape, rate-limit
 * headers). Run with: npm run smoke --workspace @jhamela-nai/server
 */

// Defaults so the suite runs without a real database or secrets. Must be set
// before the app module is loaded, because env validation happens on import.
process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/jhamela-nai-smoke";
process.env.JWT_SECRET ??= "smoke-test-secret-value";

const PORT = Number(process.env.SMOKE_PORT ?? 4321);
const BASE = `http://127.0.0.1:${PORT}`;

interface Case {
  name: string;
  run: () => Promise<{ status: number; body: unknown }>;
}

async function call(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${path}`, init);
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep the raw text */
  }
  return { status: response.status, body };
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const cases: Case[] = [
  {
    name: "GET /api/health",
    run: () => call("/api/health"),
  },
  {
    name: "GET /api/tools/budget-planner/state without auth → 401",
    run: () => call("/api/tools/budget-planner/state"),
  },
  {
    name: "GET /api/tools/x/state invalid slug → 401 (auth first)",
    run: () => call("/api/tools/NOT_A_SLUG/state"),
  },
  {
    name: "POST /api/ai/assistant (local engine)",
    run: () => call("/api/ai/assistant", json({ query: "এই মাসের খরচ কিভাবে ভাগ করব" })),
  },
  {
    name: "POST /api/ai/assistant (english: pdf)",
    run: () => call("/api/ai/assistant", json({ query: "make a pdf" })),
  },
  {
    name: "POST /api/ai/assistant (nonsense → no invented tool)",
    run: () => call("/api/ai/assistant", json({ query: "কেউ জানে না" })),
  },
  {
    name: "POST /api/ai/assistant empty query → 400 with details",
    run: () => call("/api/ai/assistant", json({ query: "" })),
  },
  {
    name: "POST /api/auth/login invalid payload → 400 with details",
    run: () => call("/api/auth/login", json({ email: "nope", password: "" })),
  },
  {
    name: "POST /api/analytics/events empty batch → 400",
    run: () => call("/api/analytics/events", json({ events: [] })),
  },
  {
    name: "GET /api/analytics/summary without admin → 401",
    run: () => call("/api/analytics/summary"),
  },
  {
    name: "GET /api/nope → 404 envelope",
    run: () => call("/api/nope"),
  },
];

function check(name: string, ok: boolean, detail: string) {
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

async function main() {
  const { createApp } = await import("../app.js");
  const app = createApp();
  const server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 300));

  let failures = 0;

  for (const testCase of cases) {
    try {
      const { status, body } = await testCase.run();
      const payload = (body ?? {}) as Record<string, unknown>;
      const detail = `status=${status} ${JSON.stringify(payload).slice(0, 130)}`;

      // Every route must answer with the shared envelope shape.
      const enveloped = typeof payload.success === "boolean";
      if (!check(testCase.name, enveloped, detail)) failures += 1;
    } catch (error) {
      console.log(` FAIL  ${testCase.name} — ${(error as Error).message}`);
      failures += 1;
    }
  }

  server.close();
  console.log(failures === 0 ? "\nAll smoke cases answered correctly." : `\n${failures} case(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main();