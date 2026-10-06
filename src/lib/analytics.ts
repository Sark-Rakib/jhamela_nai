"use client";

/**
 * Privacy-conscious product analytics.
 *
 * Principles:
 *  - No PII, no raw form values, no free-text user input is ever sent.
 *  - Events are fire-and-forget and silently dropped when the API is offline.
 *  - A local ring buffer keeps the "Recently used" rail working without an
 *    account or a network round-trip.
 */

import { pushRecentlyUsed, readRecentlyUsed, type RecentEntry } from "@/lib/storage";
import { api } from "@/lib/api";

export type AnalyticsEventName =
  | "tool_opened"
  | "tool_completed"
  | "tool_shared"
  | "pdf_downloaded"
  | "user_registered"
  | "user_logged_in"
  | "search_used"
  | "ai_query_used"
  | "saved_item"
  | "dashboard_viewed"
  | "tool_shared_via_copy";

interface AnalyticsPayload {
  event: AnalyticsEventName;
  tool?: string;
  /** Non-identifying categorical metadata only (e.g. "invoice", "monthly"). */
  props?: Record<string, string | number | boolean>;
}

function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "jn:session";
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    return "unknown";
  }
}

/** Buffered so rapid events in one tick produce a single request. */
let queue: AnalyticsPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    const batch = queue;
    queue = [];
    flushTimer = null;
    void api
      .post("/analytics/events", {
        sessionId: sessionId(),
        events: batch,
      })
      .catch(() => {
        /* analytics must never surface an error to the user */
      });
  }, 1200);
}

export function track(event: AnalyticsEventName, payload: Omit<AnalyticsPayload, "event"> = {}) {
  if (typeof window === "undefined") return;
  queue.push({ event, ...payload });
  if (queue.length >= 12) {
    const batch = queue;
    queue = [];
    void api
      .post("/analytics/events", { sessionId: sessionId(), events: batch })
      .catch(() => {});
    return;
  }
  scheduleFlush();
}

export function trackToolOpened(slug: string) {
  track("tool_opened", { tool: slug });
  pushRecentlyUsed(slug);
}

export function trackToolCompleted(slug: string, props?: Record<string, string | number | boolean>) {
  track("tool_completed", { tool: slug, props });
}

export function trackDownload(slug: string, props?: Record<string, string | number | boolean>) {
  track("pdf_downloaded", { tool: slug, props });
}

export function trackShare(slug: string, via: "native" | "copy" | "clipboard") {
  track("tool_shared", { tool: slug, props: { via } });
}

export function trackSearch(query: string, resultSlug?: string) {
  // Only the *matched* tool is sent — never the raw query text.
  track("search_used", { tool: resultSlug, props: { length: query.length } });
}

export function useRecentTools(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  return readRecentlyUsed();
}
