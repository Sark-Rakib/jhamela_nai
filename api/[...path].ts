import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Vercel serverless entrypoint for the API (single-project deploy).
 *
 * The Express app is compiled to `server/dist` by `npm run build:api` during
 * the Vercel build. We import it dynamically because `server/dist` is ESM while
 * the root project (Next.js) is CommonJS.
 */

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

let appPromise: Promise<NodeHandler> | undefined;

async function getApp(): Promise<NodeHandler> {
  if (!appPromise) {
    appPromise = (async () => {
      const { createApp } = await import("../server/dist/app.js");
      const { connect } = await import("../server/dist/config/db.js");
      await connect();
      return createApp() as unknown as NodeHandler;
    })().catch((error: unknown) => {
      appPromise = undefined;
      throw error;
    });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const app = await getApp();
  app(req, res);
}
