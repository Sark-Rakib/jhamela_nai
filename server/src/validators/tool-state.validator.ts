import { z } from "zod";

/**
 * Slugs are validated by shape rather than against a hard-coded list so the API
 * keeps working when new tools are added to the web app without a server deploy.
 */
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "টুল আইডি সঠিক নয়")
  .max(64, "টুল আইডি সঠিক নয়")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "টুল আইডি সঠিক নয়");

/** Serialised JSON must stay small — it is echoed back on every dashboard load. */
const MAX_STATE_BYTES = 128 * 1024;

export const toolSlugParams = z.object({ slug });

export const saveToolStateSchema = z.object({
  state: z.record(z.string(), z.unknown()),
  label: z.string().trim().max(120).optional(),
});

export const listToolStatesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const analyticsBatchSchema = z.object({
  sessionId: z.string().trim().max(64).optional(),
  events: z
    .array(
      z.object({
        // Wire shape mirrors `AnalyticsPayload` in the web app; the database
        // stores them as `name` / `toolSlug`.
        event: z.string().trim().min(1).max(64),
        tool: slug.optional(),
        category: z.string().trim().max(32).optional(),
        props: z.record(z.string(), z.unknown()).optional(),
        occurredAt: z.coerce.date().optional(),
      }),
    )
    .min(1, "কোনো ইভেন্ট পাওয়া যায়নি")
    .max(50, "একবারে ৫০টির বেশি ইভেন্ট পাঠানো যায়"),
});

export function assertStateSize(state: unknown): void {
  const bytes = Buffer.byteLength(JSON.stringify(state ?? {}), "utf8");
  if (bytes > MAX_STATE_BYTES) {
    throw new Error(`টুলের তথ্য অনেক বড় (সর্বোচ্চ ${Math.round(MAX_STATE_BYTES / 1024)} KB)।`);
  }
}

export type SaveToolStateInput = z.infer<typeof saveToolStateSchema>;
export type AnalyticsBatchInput = z.infer<typeof analyticsBatchSchema>;