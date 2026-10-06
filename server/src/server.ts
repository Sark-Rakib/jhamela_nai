import { createApp } from "./app.js";
import { connect, disconnect } from "./config/db.js";
import { env, hasGemini } from "./config/env.js";

async function main() {
  await connect();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(
      [
        "",
        `  Jhamela Nai API → http://localhost:${env.PORT}/api`,
        `  env: ${env.NODE_ENV}`,
        `  client: ${env.CLIENT_URL}`,
        `  assistant: ${hasGemini ? `Gemini (${env.GEMINI_MODEL})` : "local keyword engine"}`,
        "",
      ].join("\n"),
    );
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[api] ${signal} received — shutting down.`);
    server.close(async () => {
      await disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error: unknown) => {
  console.error("[api] failed to start:", error instanceof Error ? error.message : error);
  process.exit(1);
});