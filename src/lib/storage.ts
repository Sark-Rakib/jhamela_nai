"use client";

/**
 * Guarded localStorage helpers.
 *
 * Guest mode is a first-class feature: tool results persist in the browser so a
 * visitor can leave and come back without an account. Every read is wrapped
 * because Safari private mode and some in-app browsers throw on access.
 */

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage disabled — guest state is best-effort */
  }
}

export function removeLocal(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export const STORAGE_KEYS = {
  recentlyUsed: "jn:recently-used",
  guestDocs: "jn:guest-docs",
  guestLists: "jn:guest-lists",
  onboardingSeen: "jn:onboarding-seen",
  bengaliDigits: "jn:bengali-digits",
} as const;

export interface RecentEntry {
  slug: string;
  at: number;
  count: number;
}

export function readRecentlyUsed(): RecentEntry[] {
  return readLocal<RecentEntry[]>(STORAGE_KEYS.recentlyUsed, []);
}

export function pushRecentlyUsed(slug: string): RecentEntry[] {
  const current = readRecentlyUsed().filter((entry) => entry.slug !== slug);
  const next = [{ slug, at: Date.now(), count: 1 }, ...current].slice(0, 12);
  writeLocal(STORAGE_KEYS.recentlyUsed, next);
  return next;
}

export function clearRecentlyUsed(): void {
  removeLocal(STORAGE_KEYS.recentlyUsed);
}
