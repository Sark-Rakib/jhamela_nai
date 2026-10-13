import type { IncomingMessage, ServerResponse } from "node:http";

import { createApp } from "../dist/app.js";
import { connect } from "../dist/config/db.js";

/**
 * Vercel serverless entrypoint for the API project.
 *
 * `../dist/*` is produced by `npm run build` (tsc) during the Vercel build.
 * The Mongo connection is memoised so warm invocations reuse it.
 */

let connecting: Promise<unknown> | undefined;

function ensureDb(): Promise<unknown> {
  if (!connecting) {
    connecting = connect().catch((error: unknown) => {
      connecting = undefined;
      throw error;
    });
  }
  return connecting;
}

const app = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await ensureDb();
  (app as unknown as (request: IncomingMessage, response: ServerResponse) => void)(req, res);
}
