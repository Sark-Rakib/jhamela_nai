"use client";

/**
 * Admin analytics — শুধু অ্যাডমিনদের জন্য.
 *
 * Reads the aggregated `/analytics/summary` endpoint (server-side role check on
 * top of the UI guard, so hiding the nav item is never the only protection).
 */

import * as React from "react";
import Link from "next/link";
import { Loader2, Lock, RefreshCw, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";
import { api, ApiError, friendlyError } from "@/lib/api";
import { formatNumber, monthLabelBN } from "@/lib/bn";
import { TOOL_BY_SLUG } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface Summary {
  windowDays: number;
  total: number;
  byTool: { slug: string; count: number }[];
  byEvent: { name: string; count: number }[];
  daily: { date: string; count: number }[];
}

export function AdminPanel() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [data, setData] = React.useState<Summary | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    if (!isAdmin) return;
    let active = true;

    api
      .get<Summary>("/analytics/summary")
      .then((summary) => {
        if (active) setData(summary);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof ApiError && caught.status === 403
              ? "শুধু অ্যাডমিন এই তথ্য দেখতে পারবেন।"
              : friendlyError(caught),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAdmin, refreshToken]);

  if (authLoading || (isAdmin && loading && !data)) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        লোড হচ্ছে…
      </p>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-6 text-center">
        <ShieldAlert className="mx-auto size-8 text-muted-foreground" aria-hidden />
        <h2 className="mt-3 text-lg font-semibold">এই পাতা শুধু অ্যাডমিনের জন্য</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {user
            ? "আপনার অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।"
            : "অ্যাডমিন অ্যাকাউন্টে লগইন করতে হবে। অ্যাডমিন ইমেইল সাইট মালিকের কাছে থাকে।"}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {!user ? (
            <Button asChild>
              <Link href="/login?next=/admin">
                <Lock aria-hidden />
                লগইন করুন
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/dashboard">ড্যাশবোর্ড</Link>
          </Button>
        </div>
      </div>
    );
  }

  const peak = data ? Math.max(1, ...data.daily.map((day) => day.count)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          গত {data?.windowDays ?? 30} দিনের সারাংশ · {user?.email}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLoading(true);
            setRefreshToken((token) => token + 1);
          }}
        >
          <RefreshCw className={cn(loading && "animate-spin")} aria-hidden />
          রিফ্রেশ
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive-soft px-4 py-3 text-sm">{error}</p>
      ) : null}

      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">মোট ইভেন্ট</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{formatNumber(data.total, 0)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">ব্যবহৃত টুল</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{data.byTool.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">ইভেন্ট ধরন</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{data.byEvent.length}</p>
            </div>
          </div>

          <section aria-labelledby="daily-heading" className="rounded-xl border border-border bg-surface p-5">
            <h2 id="daily-heading" className="text-base font-semibold">
              দৈনিক ব্যবহার
            </h2>
            {data.daily.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">এখনো কোনো ডেটা নেই।</p>
            ) : (
              <div className="mt-4 flex h-32 items-end gap-1 overflow-x-auto">
                {data.daily.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date} — ${day.count} ইভেন্ট`}
                    className="w-3 shrink-0 rounded-t bg-primary/70"
                    style={{ height: `${Math.max(4, (day.count / peak) * 100)}%` }}
                  />
                ))}
              </div>
            )}
            <p className="mt-2 text-2xs text-faint-foreground">
              {data.daily.length > 0 ? `${data.daily[0]?.date} থেকে আজ পর্যন্ত` : monthLabelBN("")}
            </p>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <ListCard title="সবচেয়ে বেশি ব্যবহৃত টুল" items={data.byTool.map((row) => ({
              key: row.slug,
              label: TOOL_BY_SLUG[row.slug]?.name ?? row.slug,
              count: row.count,
            }))} />

            <ListCard title="ইভেন্ট অনুযায়ী" items={data.byEvent.map((row) => ({
              key: row.name,
              label: row.name,
              count: row.count,
            }))} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items: { key: string; label: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">ডেটা নেই।</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-xs text-muted-foreground sm:w-36">{item.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <span
                  className="block h-full rounded-full bg-primary/80"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </span>
              <Badge tone="neutral" className="tabular-nums">
                {formatNumber(item.count, 0)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}