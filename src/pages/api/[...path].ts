import type { NextApiRequest, NextApiResponse } from "next";

import { createApp } from "../../../server/dist/app.js";
import { connect } from "../../../server/dist/config/db.js";

/**
 * Bridge that exposes the compiled Express API inside the Next.js app.
 *
 * A root-level `api/` folder is ignored when Vercel uses the Next.js framework
 * preset, so the API is served from a Next.js API route instead. Pages-router
 * API routes hand us Node `req`/`res`, which an Express app consumes directly.
 */

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const app = createApp();

let connecting: Promise<unknown> | null = null;

function ensureDb(): Promise<unknown> {
  if (!connecting) {
    connecting = connect().catch((error: unknown) => {
      connecting = null;
      throw error;
    });
  }
  return connecting;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Next may hand us the path without the `/api` prefix depending on routing;
  // the Express router is mounted at `/api`, so normalise it here.
  const original = req.url ?? "/";
  if (original !== "/api" && !original.startsWith("/api/") && !original.startsWith("/api?")) {
    req.url = `/api${original.startsWith("/") ? original : `/${original}`}`;
  }

  await ensureDb();
  (app as unknown as (request: NextApiRequest, response: NextApiResponse) => void)(req, res);
}
