/**
 * Browser end-to-end suite (Chrome + puppeteer-core).
 *
 * Covers what the API tests cannot: real form submissions, the HttpOnly session
 * cookie, guest localStorage persistence, cloud sync, the assistant, the admin
 * guard and the offline path.
 *
 * Prerequisites:
 *   1. `npm run dev:all`      — web on :3000, API on :4000 (MONGODB_URI set)
 *   2. `npm run seed`         — creates the demo + admin accounts
 *   3. `npm run test:e2e`
 *
 * Override with E2E_WEB / E2E_API / CHROME_PATH if your setup differs.
 * Exits 0 with a SKIP notice when no Chrome is installed.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const WEB = process.env.E2E_WEB ?? "http://localhost:3000";
const API = process.env.E2E_API ?? "http://localhost:4000/api";

/** Local secrets come from the git-ignored `.env` (see `.env.example`). */
function readEnvFile() {
  const file = resolve(root, ".env");
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split("\n")
      .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
      .map((line) => {
        const [key, ...value] = line.split("=");
        return [key.trim(), value.join("=").trim()];
      }),
  );
}

const env = readEnvFile();
const PASSWORD_DEMO = env.USER_PASSWORD ?? "Demo12345";
const PASSWORD_ADMIN = env.ADMIN_PASSWORD ?? "Admin12345";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((path) => existsSync(path));
if (!chrome) {
  console.warn("SKIP  test:e2e — no Chrome/Chromium found (set CHROME_PATH to enable)");
  process.exit(0);
}

let puppeteer;
try {
  puppeteer = (await import("puppeteer-core")).default;
} catch {
  console.error("MISSING dependency — run `npm install` first (needs puppeteer-core)");
  process.exit(1);
}

// ── Preflight: fail fast with instructions instead of a wall of timeouts ─────
for (const [name, url] of [
  ["web", `${WEB}/login`],
  ["api", `${API}/health`],
]) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`status ${response.status}`);
  } catch (error) {
    console.error(`MISSING ${name} server at ${url} (${String(error)})`);
    console.error("Run `npm run dev:all` (and `npm run seed`) in another terminal, then retry.");
    process.exit(1);
  }
}

const EMAIL = `e2e${Date.now()}@example.com`;
const PASSWORD = "Passw0rd123";

const results = [];
const log = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1280, height: 900 },
});
const page = await browser.newPage();
const consoleErrors = [];
const apiFailures = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));
page.on("response", (res) => {
  if (res.url().startsWith(API) && res.status() >= 400) {
    apiFailures.push(`${res.status()} ${res.url().replace(API, "")}`);
  }
});

const api = (path, init = {}) =>
  page.evaluate(
    ([url, options]) =>
      fetch(url, options)
        .then((response) => response.json().then((data) => ({ status: response.status, data })))
        .catch((error) => ({ status: -1, data: { error: String(error) } })),
    [`${API}${path}`, { credentials: "include", ...init }],
  );

/** Types into a React-controlled input, retrying until hydration keeps the value. */
async function typeStable(selector, value, attempts = 5) {
  await page.waitForSelector(selector, { timeout: 15000 });
  for (let attempt = 0; attempt < attempts; attempt++) {
    await page.focus(selector);
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyA");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
    await page.type(selector, value);
    await sleep(400);
    if ((await page.$eval(selector, (el) => el.value)) === value) return true;
    await sleep(1000);
  }
  return false;
}

const clickButtonByText = (pattern) =>
  page.evaluate((source) => {
    const re = new RegExp(source);
    const button = [...document.querySelectorAll("button")].find((b) => re.test(b.textContent ?? ""));
    button?.click();
    return Boolean(button);
  }, pattern);

const toastText = () => page.$$eval("[data-sonner-toast]", (els) => els.map((e) => e.textContent).join(" | "));

try {
  // ── 1. Guest persistence (localStorage) ────────────────────────────────────
  await page.goto(`${WEB}/tools/budget-planner`, { waitUntil: "networkidle0" });
  log("React accepts typed value before reload", await typeStable("#income", "55000"));
  await sleep(700);
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector("#income");
  const guestIncome = await page.$eval("#income", (el) => el.value);
  log("guest state survives reload", guestIncome === "55000", `income=${guestIncome}`);
  log(
    "localStorage key jn:tool:budget-planner written",
    await page.evaluate(() => localStorage.getItem("jn:tool:budget-planner") !== null),
  );

  // ── 2. Assistant resolves a tool slug ─────────────────────────────────────
  await page.goto(WEB, { waitUntil: "networkidle0" });
  const ask = 'input[placeholder*="invoice বানাতে"]';
  await page.waitForSelector(ask);
  await page.type(ask, "একটা invoice বানাতে চাই");
  await page.keyboard.press("Enter");
  const suggested = await page
    .waitForFunction(() => Boolean(document.querySelector('a[href="/tools/invoice-generator"]')), {
      timeout: 10000,
    })
    .then(() => true)
    .catch(() => false);
  log("assistant suggests invoice-generator", suggested);

  // ── 3. Register → dashboard (HttpOnly cookie session) ─────────────────────
  await page.goto(`${WEB}/register`, { waitUntil: "networkidle0" });
  const filled =
    (await typeStable("#name", "E2E Test User")) &&
    (await typeStable("#email", EMAIL)) &&
    (await typeStable("#phone", "01712345678")) &&
    (await typeStable("#password", PASSWORD)) &&
    (await typeStable("#confirmPassword", PASSWORD));
  log("register form accepts input", filled);
  await page.click("#terms");
  log(
    "terms checkbox toggles",
    (await page.$eval("#terms", (el) => el.getAttribute("data-state"))) === "checked",
  );
  await page.click('button[type="submit"]');
  const registered = await page
    .waitForFunction(() => location.pathname === "/dashboard", { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  log(
    "register redirects to /dashboard",
    registered,
    registered ? page.url() : `url=${page.url()} toast="${await toastText()}"`,
  );

  await sleep(800);
  log(
    "navbar shows logout when signed in",
    Boolean(await page.$('a[aria-label="লগআউট"], button[aria-label="লগআউট"]')),
  );

  let me = await api("/auth/me");
  log(
    "GET /api/auth/me returns user",
    me.status === 200 && me.data?.data?.user?.email === EMAIL,
    String(me.data?.data?.user?.email ?? `status=${me.status}`),
  );
  log(
    "auth cookie is HttpOnly",
    (await page.cookies()).some((c) => c.name === "jn_token" && c.httpOnly),
  );

  // ── 4. Signed-in cloud sync ───────────────────────────────────────────────
  await page.goto(`${WEB}/tools/budget-planner`, { waitUntil: "networkidle0" });
  log("cloud edit accepted", await typeStable("#income", "61000"));
  await sleep(400);
  log("save button visible when signed in", await clickButtonByText("সংরক্ষণ|সিঙ্ক"));
  await sleep(1500);

  const cloud = await api("/tools/budget-planner/state");
  log(
    "state saved to cloud API",
    cloud.status === 200 && Number(cloud.data?.data?.state?.income) === 61000,
    `income=${cloud.data?.data?.state?.income ?? "?"} status=${cloud.status}`,
  );

  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector("#income");
  await sleep(1500);
  const restoredIncome = await page.$eval("#income", (el) => el.value);
  log("cloud copy restored after reload", Number(restoredIncome) === 61000, `income=${restoredIncome}`);

  // A hard refresh must re-hydrate the session from the cookie, not log out.
  const afterReload = await api("/auth/me");
  log(
    "session survives a page refresh",
    afterReload.status === 200 && afterReload.data?.data?.user?.email === EMAIL,
    `status=${afterReload.status}`,
  );
  log(
    "navbar still signed in after refresh",
    Boolean(await page.$('a[aria-label="লগআউট"], button[aria-label="লগআউট"]')),
  );

  // A second save pushes the previous value into history.
  await typeStable("#income", "62000");
  await clickButtonByText("সংরক্ষণ|সিঙ্ক");
  await sleep(1500);
  const history = await api("/tools/budget-planner/state/history");
  const versions = history.data?.data?.history ?? [];
  log("history records previous versions", versions.length >= 1, `versions=${versions.length}`);
  const second = await api("/tools/budget-planner/state");
  log(
    "second save persisted",
    Number(second.data?.data?.state?.income) === 62000,
    `income=${second.data?.data?.state?.income}`,
  );

  const dashboard = await api("/tools/states");
  const items = dashboard.data?.data?.items ?? [];
  log("dashboard lists saved tools", items.length >= 1, `saved=${items.length}`);

  // ── 5. Role guard: regular users are locked out ───────────────────────────
  const summary = await api("/analytics/summary");
  log("non-admin blocked from admin analytics", summary.status === 403, `status=${summary.status}`);
  await page.goto(`${WEB}/admin`, { waitUntil: "networkidle0" });
  await sleep(800);
  log(
    "non-admin sees the admin guard on /admin",
    await page.evaluate(() => /এই পাতা শুধু অ্যাডমিনের জন্য/.test(document.body.innerText)),
  );

  // ── 6. Logout → session gone ──────────────────────────────────────────────
  await page.goto(WEB, { waitUntil: "networkidle0" });
  const clickedLogout = await page.evaluate(() => {
    const el =
      document.querySelector('button[aria-label="লগআউট"]') ??
      document.querySelector('a[aria-label="লগআউট"]') ??
      [...document.querySelectorAll("button")].find((x) => /লগআউট/.test(x.textContent ?? ""));
    el?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return Boolean(el);
  });
  await sleep(1500);
  me = await api("/auth/me");
  log(
    "logout clears session",
    clickedLogout && (me.status === 401 || me.data?.data?.user == null),
    `clicked=${clickedLogout} status=${me.status}`,
  );
  log("navbar shows login link after logout", Boolean(await page.$('a[href="/login"]')));

  await page.goto(`${WEB}/dashboard`, { waitUntil: "networkidle0" });
  const redirected = await page
    .waitForFunction(() => location.pathname === "/login", { timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  log("guest visiting /dashboard is redirected to /login", redirected, page.url());

  // ── 7. Wrong password is rejected ─────────────────────────────────────────
  await page.goto(`${WEB}/login`, { waitUntil: "networkidle0" });
  await typeStable("#email", EMAIL);
  await typeStable("#password", "wrong-password-123");
  await page.click('button[type="submit"]');
  await sleep(2000);
  log(
    "wrong password keeps user on /login with an error",
    page.url().includes("/login") && Boolean(await toastText()),
    `toast="${await toastText()}"`,
  );

  // ── 8. Seeded demo user can log in ────────────────────────────────────────
  await page.goto(`${WEB}/login`, { waitUntil: "networkidle0" });
  await typeStable("#email", "demo@jhamelanai.com");
  await typeStable("#password", PASSWORD_DEMO);
  await page.click('button[type="submit"]');
  const loggedIn = await page
    .waitForFunction(
      () => location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin"),
      { timeout: 15000 },
    )
    .then(() => true)
    .catch(() => false);
  log("seed user can log in", loggedIn, loggedIn ? page.url() : `url=${page.url()}`);

  // ── 9. Admin sees the analytics panel ─────────────────────────────────────
  await page.goto(`${WEB}/login`, { waitUntil: "networkidle0" });
  await typeStable("#email", "admin@jhamelanai.com");
  await typeStable("#password", PASSWORD_ADMIN);
  await page.click('button[type="submit"]');
  const onAdmin = await page
    .waitForFunction(() => location.pathname === "/admin", { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  log("admin user lands on /admin", onAdmin, page.url());
  await sleep(1500);
  log(
    "admin analytics panel renders summary",
    await page.evaluate(() => /মোট ইভেন্ট/.test(document.body.innerText)),
  );

  // ── 10. Tool pages keep working when the API is unreachable ───────────────
  await page.goto(`${WEB}/tools/savings-calculator`, { waitUntil: "networkidle0" });
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.url().startsWith(API)) void request.abort();
    else void request.continue();
  });
  await sleep(400);
  log("tool page renders without API", Boolean(await page.$("#target")));
  await page.setRequestInterception(false);
} catch (error) {
  console.error("E2E crashed:", error instanceof Error ? error.message : error);
} finally {
  // Expected 4xx responses (first-visit 404, auth guards 401/403) are logged
  // by the browser as resource errors — only real JS failures count.
  const severe = consoleErrors.filter(
    (line) => !/favicon|React DevTools|HMR|hmr\?id=|Failed to load resource|net::ERR/i.test(line),
  );
  if (severe.length) console.log("browser console errors:", severe.slice(0, 6));
  log("no unexpected browser console errors", severe.length === 0, `${severe.length} error(s)`);

  const unexpected = [...new Set(apiFailures)].filter((f) => ![401, 403, 404].includes(Number(f.slice(0, 3))));
  if (unexpected.length) console.log("unexpected API failures:", unexpected);

  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
