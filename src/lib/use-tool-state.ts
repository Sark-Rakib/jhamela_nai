"use client";

/**
 * Tool result persistence.
 *
 * Two layers, one hook:
 *  - Guest (no account): state is written to `localStorage` under
 *    `jn:tool:<slug>`, so closing the tab never loses work.
 *  - Signed in: the same payload is synced to the API so it follows the user
 *    across devices. A failing API is never surfaced — local wins.
 */

import * as React from "react";

import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { readLocal, writeLocal } from "@/lib/storage";
import { useAuth } from "@/features/auth/auth-provider";

export interface ToolSaveState<T> {
  /** Restore guest state, or the server copy when signed in. */
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
  reset: () => void;
  hasStored: boolean;
  saveToCloud: () => Promise<boolean>;
  isSaving: boolean;
  lastSavedAt: number | null;
}

export function useToolState<T>(slug: string, initial: T): ToolSaveState<T> {
  const storageKey = `jn:tool:${slug}`;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = React.useState<T>(initial);
  const [hasStored, setHasStored] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);

  // Restore the guest copy after hydration. Reading localStorage during render
  // instead would make the first client render differ from the server HTML
  // (SSR printed the defaults, not the saved value) and React reports that as
  // a hydration mismatch, so one extra render is the cheaper trade-off.
  const [restored, setRestored] = React.useState(false);

  React.useEffect(() => {
    const stored = readLocal<T | null>(storageKey, null);
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- applying the stored snapshot after hydration is the effect's job
      setState(stored);
      setHasStored(true);
    }
    setRestored(true);
  }, [storageKey]);

  // Persist locally whenever the working copy changes — but never before the
  // guest copy has been read, or the restore would overwrite itself.
  React.useEffect(() => {
    if (!restored) return;
    writeLocal(storageKey, state);
  }, [state, storageKey, restored]);

  // Pull the cloud copy when an account is present.
  React.useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;

    api
      .get<{ state: T }>(`/tools/${slug}/state`)
      .then((data) => {
        if (!active || !data?.state) return;
        setState(data.state);
        setHasStored(true);
      })
      .catch((error: unknown) => {
        // 404 = nothing saved yet, which is expected for a first visit.
        if (error instanceof ApiError && error.status === 404) return;
      });

    return () => {
      active = false;
    };
  }, [slug, isAuthenticated, authLoading]);

  const reset = React.useCallback(() => {
    setState(initial);
    setHasStored(false);
    setLastSavedAt(null);
    writeLocal(storageKey, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const saveToCloud = React.useCallback(async () => {
    if (!isAuthenticated) return false;
    setIsSaving(true);
    try {
      await api.post(`/tools/${slug}/state`, { state });
      setLastSavedAt(Date.now());
      track("saved_item", { tool: slug });
      return true;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated, slug, state]);

  return {
    state,
    setState,
    reset,
    hasStored,
    saveToCloud,
    isSaving,
    lastSavedAt,
  };
}