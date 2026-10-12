"use client";

/**
 * Dashboard — সংরক্ষিত কাজ.
 *
 * Reads the signed-in user's cloud states from `/tools/states` and merges them
 * with anything still sitting in this browser's local storage, so a tool used
 * before logging in is not lost. Guests see their local work instead.
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CloudOff,
  FolderOpen,
  Loader2,
  LogIn,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { ToolIcon } from "@/components/ui/icons";
import { useAuth } from "@/features/auth/auth-provider";
import { api, friendlyError } from "@/lib/api";
import { formatDateTimeBN, relativeDaysBN } from "@/lib/bn";
import { TOOL_BY_SLUG, type ToolDefinition } from "@/lib/tools";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface CloudItem {
  slug: string;
  label: string;
  savedAt: string;
}

interface LocalItem {
  slug: string;
  savedAt: string;
}

const LOCAL_PREFIX = "jn:tool:";

function readLocalItems(): LocalItem[] {
  if (typeof window === "undefined") return [];
  const items: LocalItem[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(LOCAL_PREFIX)) continue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { savedAt?: number; cloudSyncedAt?: number | null };
      const savedAt = parsed.savedAt ?? 0;
      if (!savedAt) continue;
      items.push({ slug: key.slice(LOCAL_PREFIX.length), savedAt: new Date(savedAt).toISOString() });
    } catch {
      // Ignore unreadable local entries rather than breaking the whole list.
    }
  }

  return items.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

function clearLocalItem(slug: string) {
  try {
    window.localStorage.removeItem(`${LOCAL_PREFIX}${slug}`);
  } catch {
    /* storage disabled — nothing to clear */
  }
}

function toolFor(slug: string): ToolDefinition | undefined {
  return TOOL_BY_SLUG[slug];
}

export function Dashboard() {
  const { user, isLoading: authLoading, isOffline } = useAuth();
  const router = useRouter();
  const [cloud, setCloud] = React.useState<CloudItem[]>([]);
  const [local, setLocal] = React.useState<LocalItem[]>([]);
  // Starts true: the first authenticated paint is a fetch, not empty state.
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  // Bumped by the refresh button to trigger a re-fetch without an effect.
  const [refreshToken, setRefreshToken] = React.useState(0);

  // The session cookie is host-only for the API origin, so this page cannot be
  // guarded on the server — `/auth/me` is the source of truth. Guests are sent
  // to the login form; if the API itself is unreachable they keep the local
  // browser copy instead (no private data is ever rendered either way).
  React.useEffect(() => {
    if (authLoading || user || isOffline) return;
    router.replace("/login?next=%2Fdashboard");
  }, [authLoading, user, isOffline, router]);

  React.useEffect(() => {
    if (!user) return;
    let active = true;

    track("dashboard_viewed");

    api
      .get<{ items: CloudItem[] }>("/tools/states", { query: { limit: 50 } })
      .then((data) => {
        if (active) setCloud(data.items ?? []);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(friendlyError(caught));
          setLoading(false);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, refreshToken]);

  // Local storage is read once on mount: it is a client-only store, so doing it
  // here keeps hydration stable and avoids a cascading render.
  const [localScanned, setLocalScanned] = React.useState(false);
  if (!localScanned) {
    setLocalScanned(true);
    const items = readLocalItems();
    if (items.length > 0) setLocal(items);
  }

  function refreshList() {
    setLocal(readLocalItems());
    if (user) {
      setLoading(true);
      setRefreshToken((token) => token + 1);
    }
  }

  async function remove(slug: string) {
    try {
      await api.delete(`/tools/${slug}/state`);
      clearLocalItem(slug);
      setCloud((prev) => prev.filter((item) => item.slug !== slug));
      setLocal((prev) => prev.filter((item) => item.slug !== slug));
      toast.success("ক্লাউড থেকে মুছে ফেলা হয়েছে।");
    } catch (caught) {
      toast.error(friendlyError(caught));
    }
  }

  if (authLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        লোড হচ্ছে…
      </p>
    );
  }

  if (!user) {
    // Reachable only while offline — otherwise the effect above is redirecting.
    if (!isOffline) {
      return (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          লগইন পেজে নিয়ে যাওয়া হচ্ছে…
        </p>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-6">
        <h2 className="text-lg font-semibold">লগইন করলে কাজ সব ডিভাইসে পাবেন</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          টুলগুলো লগইন ছাড়াই চলে, তবে অ্যাকাউন্ট থাকলে হিসাব ও ডকুমেন্ট ক্লাউডে জমা হয় এবং
          অন্য ডিভাইস থেকেও খোলা যায়।
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/login?next=/dashboard">
              <LogIn aria-hidden />
              লগইন করুন
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools">
              টুল ব্রাউজারে খুলুন
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        {local.length > 0 ? (
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">এই ব্রাউজারে সংরক্ষিত ({local.length})</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {local.map((item) => (
                <LocalRow key={item.slug} item={item} onRemove={clearLocalItem} setLocal={setLocal} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {user.email} · সদস্য হয়েছেন {formatDateTimeBN(user.createdAt)}
        </p>
        <Button variant="ghost" size="sm" onClick={refreshList} disabled={loading}>
          <RefreshCw className={cn(loading && "animate-spin")} aria-hidden />
          রিফ্রেশ
        </Button>
      </div>

      {isOffline ? (
        <p className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-foreground">
          <CloudOff className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          সার্ভারে পৌঁছানো যাচ্ছে না — নিচের তালিকা এই ব্রাউজারের সংরক্ষিত তথ্য থেকে দেখানো
          হয়েছে।
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive-soft px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {loading && cloud.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          ক্লাউড থেকে আনা হচ্ছে…
        </p>
      ) : null}

      <section aria-labelledby="cloud-heading">
        <h2 id="cloud-heading" className="flex items-center gap-2 text-base font-semibold">
          <FolderOpen className="size-4 text-primary" aria-hidden />
          ক্লাউডে সংরক্ষিত কাজ
        </h2>

        {cloud.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-surface-muted px-4 py-8 text-center text-sm text-muted-foreground">
            এখনো কিছু সংরক্ষণ করা হয়নি। যেকোনো টুল খুলে{" "}
            <span className="font-medium text-foreground">“ক্লাউডে সংরক্ষণ করুন”</span> চাপুন।
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {cloud.map((item) => {
              const tool = toolFor(item.slug);
              return (
                <li key={item.slug}>
                  <SavedCard
                    slug={item.slug}
                    title={tool?.name ?? item.slug}
                    description={item.label || tool?.tagline || "সংরক্ষিত অবস্থা"}
                    icon={tool?.icon ?? "calculator"}
                    savedAt={item.savedAt}
                    onRemove={() => void remove(item.slug)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="local-heading">
        <h2 id="local-heading" className="text-base font-semibold">
          এই ব্রাউজারে সংরক্ষিত
        </h2>
        {local.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">এই ব্রাউজারে কোনো তথ্য নেই।</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {local.map((item) => (
              <LocalRow key={item.slug} item={item} onRemove={clearLocalItem} setLocal={setLocal} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SavedCard({
  slug,
  title,
  description,
  icon,
  savedAt,
  onRemove,
}: {
  slug: string;
  title: string;
  description: string;
  icon: string;
  savedAt: string;
  onRemove: () => void;
}) {
  return (
    <article className="flex h-full items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/50">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <ToolIcon name={icon} className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone="neutral">{relativeDaysBN(savedAt)}</Badge>
          <span className="text-2xs text-faint-foreground">{formatDateTimeBN(savedAt)}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/tools/${slug}`} aria-label={`${title} খুলুন`}>
            <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`${title} মুছে ফেলুন`}>
          <Trash2 aria-hidden />
        </Button>
      </div>
    </article>
  );
}

function LocalRow({
  item,
  onRemove,
  setLocal,
}: {
  item: LocalItem;
  onRemove: (slug: string) => void;
  setLocal: React.Dispatch<React.SetStateAction<LocalItem[]>>;
}) {
  const tool = toolFor(item.slug);
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <ToolIcon name={tool?.icon ?? "calculator"} className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <Link href={`/tools/${item.slug}`} className="block truncate text-sm font-medium hover:text-primary">
          {tool?.name ?? item.slug}
        </Link>
        <p className="text-2xs text-faint-foreground">{formatDateTimeBN(item.savedAt)}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${tool?.name ?? item.slug} মুছে ফেলুন`}
        onClick={() => {
          onRemove(item.slug);
          setLocal((prev) => prev.filter((row) => row.slug !== item.slug));
        }}
      >
        <Trash2 aria-hidden />
      </Button>
    </li>
  );
}