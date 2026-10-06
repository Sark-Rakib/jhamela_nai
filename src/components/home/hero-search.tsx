"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";

import { detectIntent } from "@/lib/intent";
import { trackSearch } from "@/lib/analytics";

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim();
    if (!text) {
      router.push("/tools");
      return;
    }

    setBusy(true);
    const intent = detectIntent(text);
    const slug = intent.best?.tool.slug;
    trackSearch(text, slug);

    if (slug) router.push(`/tools/${slug}`);
    else router.push(`/tools?q=${encodeURIComponent(text)}`);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} role="search" className="w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-xl border border-input bg-surface p-1.5 pl-3.5 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25">
        <Search className="size-4 shrink-0 text-faint-foreground" aria-hidden />
        <label htmlFor="hero-search" className="sr-only">
          কী খুঁজছেন?
        </label>
        <input
          id="hero-search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="কী খুঁজছেন? যেমন: মাসের বাজেট, CV, invoice…"
          autoComplete="off"
          className="h-10 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-faint-foreground focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-ink-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          খুঁজুন
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}