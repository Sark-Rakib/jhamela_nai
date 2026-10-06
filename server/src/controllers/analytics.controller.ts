import type { Request, Response } from "express";

import { AnalyticsEvent } from "../models/analytics-event.model.js";
import type { AnalyticsBatchInput } from "../validators/tool-state.validator.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ok } from "../utils/respond.js";

/**
 * Accepts a batch of anonymous or authenticated events.
 *
 * Analytics must never break a tool, so failures are swallowed into a 202 —
 * a dropped metric is far cheaper than a visible error in the UI.
 */
export const trackEvents = asyncHandler(async (req: Request, res: Response) => {
  const { events, sessionId } = req.body as AnalyticsBatchInput;
  const userAgent = (req.get("user-agent") ?? "").slice(0, 200);

  const rows = events.map((event) => ({
    user: req.user?.id ?? null,
    sessionId: sessionId ?? req.user?.id ?? "",
    name: event.event,
    toolSlug: event.tool ?? "",
    category: event.category ?? "",
    props: event.props ?? {},
    occurredAt: event.occurredAt ?? new Date(),
    userAgent,
  }));

  try {
    await AnalyticsEvent.insertMany(rows, { ordered: false });
  } catch (error) {
    console.warn(`[analytics] dropped ${rows.length} event(s):`, (error as Error).message);
  }

  return res.status(202).json({ success: true, data: { accepted: rows.length } });
});

/** Lightweight aggregate used by the admin dashboard. */
export const summarise = asyncHandler(async (_req: Request, res: Response) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, byTool, byName, daily] = await Promise.all([
    AnalyticsEvent.countDocuments({ occurredAt: { $gte: since } }),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { occurredAt: { $gte: since }, toolSlug: { $nin: ["", null] } } },
      { $group: { _id: "$toolSlug", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { occurredAt: { $gte: since } } },
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    AnalyticsEvent.aggregate<{ _id: string; count: number }>([
      { $match: { occurredAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return ok(res, {
    windowDays: 30,
    total,
    byTool: byTool.map((row) => ({ slug: row._id, count: row.count })),
    byEvent: byName.map((row) => ({ name: row._id, count: row.count })),
    daily: daily.map((row) => ({ date: row._id, count: row.count })),
  });
});