"use client";

/**
 * Client-side filtering for the tool directory.
 *
 * The catalogue ships statically, so filtering happens in the browser — the
 * page itself stays server-rendered for SEO and first paint.
 */

import * as React from "react";

import { ToolCard } from "@/components/tools/tool-card";
import { Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

import { CATEGORIES, TOOLS, toolsByCategory, type ToolCategorySlug } from "@/lib/tools";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  { value: "all", label: "সব ক্যাটাগরি" },
  ...CATEGORIES.map((category) => ({ value: category.slug, label: category.nameBn })),
] as const;

const SORTS = [
  { value: "popular", label: "জনপ্রিয়তা" },
  { value: "az", label: "নাম (অ–ক্রম)" },
  { value: "category", label: "ক্যাটাগরি" },
] as const;

type SortKey = (typeof SORTS)[number]["value"];

export function ToolsDirectory({ initialCategory }: { initialCategory?: string }) {
  const validInitial = CATEGORIES.some((category) => category.slug === initialCategory)
    ? (initialCategory as ToolCategorySlug)
    : "all";

  const [category, setCategory] = React.useState<string>(validInitial);
  const [sort, setSort] = React.useState<SortKey>("popular");
  const [query, setQuery] = React.useState("");

  const results = React.useMemo(() => {
    const base = category === "all" ? TOOLS : toolsByCategory(category);
    const needle = query.trim().toLowerCase();

    const filtered = needle
      ? base.filter((tool) =>
          [tool.name, tool.nameBn, tool.tagline, tool.keywords.join(" "), tool.keywordsBn.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(needle),
        )
      : base;

    const sorted = [...filtered];
    if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "category") sorted.sort((a, b) => a.category.localeCompare(b.category));
    if (sort === "popular") sorted.sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)) || b.weight - a.weight);

    return sorted;
  }, [category, sort, query]);

  const hasFilters = category !== "all" || query.trim().length > 0;

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:border-primary">
          <Search className="size-4 shrink-0 text-faint-foreground" aria-hidden />
          <label htmlFor="tools-filter" className="sr-only">
            টুল ফিল্টার করুন
          </label>
          <input
            id="tools-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="এই তালিকায় খুঁজুন…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-faint-foreground focus-visible:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid size-6 place-items-center rounded text-muted-foreground hover:text-foreground"
              aria-label="ফিল্টার মুছুন"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-[11rem_10rem]">
          <Select
            value={category}
            onValueChange={setCategory}
            options={CATEGORY_OPTIONS.map((option) => ({ ...option }))}
            ariaLabel="ক্যাটাগরি বাছুন"
          />
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as SortKey)}
            options={SORTS.map((option) => ({ ...option }))}
            ariaLabel="সাজানোর নিয়ম"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground">{results.length}টি</span> টুল দেখানো হচ্ছে
          {category !== "all" ? (
            <>
              {" · "}
              {CATEGORIES.find((item) => item.slug === category)?.nameBn}
            </>
          ) : null}
        </p>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            <RotateIcon />
            ফিল্টার রিসেট
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
          results.length === 0 && "hidden",
        )}
      >
        {results.map((tool, index) => (
          <ToolCard key={tool.slug} tool={tool} index={index} />
        ))}
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-base font-semibold text-foreground">কিছু পাওয়া যায়নি</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            অন্য কিছু লিখে দেখুন, অথবা সব টুল দেখুন।
          </p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            সব টুল দেখুন
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function RotateIcon() {
  return <span aria-hidden>↺</span>;
}