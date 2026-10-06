"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowRight, CornerDownLeft, Search, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { CATEGORIES, TOOLS, type ToolDefinition } from "@/lib/tools";
import { detectIntent, searchTools } from "@/lib/intent";
import { trackSearch } from "@/lib/analytics";
import { ACCENT_TILE } from "@/lib/accents";
import { ToolIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global search (⌘K / Ctrl+K) with debounced autocomplete and live intent
 * detection. Keyboard-first, but fully usable with a thumb on a 320px screen.
 */
export function CommandSearch({ open, onOpenChange }: CommandDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounced(query, 140);

  // Reset on open during render (React's sanctioned "adjust state" pattern)
  // rather than in an effect, so opening never triggers a cascading render.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const results = React.useMemo<ToolDefinition[]>(
    () => (debouncedQuery.trim() ? searchTools(debouncedQuery, 7) : []),
    [debouncedQuery],
  );

  const intent = React.useMemo(
    () => (debouncedQuery.trim() ? detectIntent(debouncedQuery) : null),
    [debouncedQuery],
  );

  // Show the intent winner first when the plain keyword ranking disagrees —
  // "আমার মাসে ৩০ হাজার টাকা আয়, budget বানাতে চাই" must land on Budget Planner.
  const ordered = React.useMemo(() => {
    if (!intent?.best) return results;
    const winner = intent.best.tool;
    if (results[0]?.slug === winner.slug) return results;
    return [winner, ...results.filter((tool) => tool.slug !== winner.slug)].slice(0, 7);
  }, [intent, results]);

  const [lastQuery, setLastQuery] = React.useState(debouncedQuery);
  if (debouncedQuery !== lastQuery) {
    setLastQuery(debouncedQuery);
    setActiveIndex(0);
  }

  const suggestions = intent?.best
    ? [intent.best.tool, ...intent.alternatives.map((match) => match.tool)].filter(
        (tool, index, array) => array.findIndex((item) => item.slug === tool.slug) === index,
      )
    : [];


  function go(tool: ToolDefinition) {
    trackSearch(query, tool.slug);
    onOpenChange(false);
    router.push(`/tools/${tool.slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (ordered.length ? (index + 1) % ordered.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        ordered.length ? (index - 1 + ordered.length) % ordered.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (ordered[activeIndex]) go(ordered[activeIndex]);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-ink-950/50 backdrop-blur-[3px] data-[state=open]:animate-jn-fade-in" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[12dvh] z-[80] flex max-h-[76dvh] w-[calc(100vw-1.5rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg focus:outline-none data-[state=open]:animate-jn-zoom-in"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">টুল খুঁজুন</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            যেকোনো টুলের নাম বা আপনার সমস্যা লিখে খুঁজুন
          </DialogPrimitive.Description>

          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="টুল খুঁজুন… (যেমন: budget, CV, invoice)"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-faint-foreground"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="টুল খুঁজুন"
              aria-controls="command-results"
              aria-activedescendant={ordered[activeIndex] ? `cmd-${ordered[activeIndex].slug}` : undefined}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-surface-muted"
                aria-label="খোঁজা মুছুন"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : (
              <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-sans text-[10px] font-medium text-faint-foreground sm:block">
                ESC
              </kbd>
            )}
          </div>

          <div id="command-results" className="min-h-0 flex-1 overflow-y-auto p-2">
            <AnimatePresence mode="wait" initial={false}>
              {!query.trim() ? (
                <motion.div
                  key="browse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="space-y-4 p-2"
                >
                  <Section label="জনপ্রিয়">
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {TOOLS.filter((tool) => tool.popular)
                        .slice(0, 6)
                        .map((tool) => (
                          <QuickTile key={tool.slug} tool={tool} onSelect={go} />
                        ))}
                    </div>
                  </Section>
                  <Section label="ক্যাটাগরি">
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/tools/category/${category.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-ink-300 hover:text-foreground"
                        >
                          <span aria-hidden>{category.emoji}</span>
                          {category.nameBn}
                        </Link>
                      ))}
                    </div>
                  </Section>
                </motion.div>
              ) : ordered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 px-4 py-10 text-center"
                >
                  <p className="text-sm font-medium text-foreground">কিছু পাওয়া যায়নি</p>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                    অন্য কিছু লিখে দেখুন — যেমন “বাজেট”, “CV”, “invoice”, “CGPA” বা টুলের নাম।
                  </p>
                  <Link
                    href="/tools"
                    onClick={() => onOpenChange(false)}
                    className="mt-1 text-xs font-medium text-primary hover:underline"
                  >
                    সব টুল দেখুন →
                  </Link>
                </motion.div>
              ) : (
                <motion.ul
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="space-y-0.5"
                  role="listbox"
                  aria-label="টুলের তালিকা"
                >
                  {intent?.best && suggestions.length > 1 ? (
                    <li className="px-2 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wide text-faint-foreground">
                      সমস্যা বুঝে সাজেস্ট
                    </li>
                  ) : null}
                  {ordered.map((tool, index) => {
                    const active = index === activeIndex;
                    const isIntentPick = index === 0 && Boolean(intent?.best);
                    return (
                      <li key={tool.slug}>
                        <button
                          id={`cmd-${tool.slug}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => go(tool)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
                            active ? "bg-surface-muted" : "hover:bg-surface-muted/60",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-lg",
                              ACCENT_TILE[tool.accent],
                            )}
                          >
                            <ToolIcon name={tool.icon} className="size-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium text-foreground">
                                {tool.nameBn}
                              </span>
                              {isIntentPick ? (
                                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary-soft px-1.5 py-px text-[10px] font-semibold text-primary">
                                  <Sparkles className="size-2.5" aria-hidden />
                                  সেরা মিল
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {tool.tagline}
                            </span>
                          </span>
                          {active ? (
                            <CornerDownLeft className="size-3.5 shrink-0 text-faint-foreground" aria-hidden />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {ordered.length > 0 ? (
            <button
              type="button"
              onClick={() => go(ordered[activeIndex])}
              className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-surface-muted/60 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="truncate">
                খুলুন: <span className="font-medium text-foreground">{ordered[activeIndex].nameBn}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 font-medium text-primary">
                খুলুন
                <ArrowRight className="size-3" aria-hidden />
              </span>
            </button>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function QuickTile({
  tool,
  onSelect,
}: {
  tool: ToolDefinition;
  onSelect: (tool: ToolDefinition) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-left transition-colors hover:border-ink-300 hover:bg-surface-muted"
    >
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md", ACCENT_TILE[tool.accent])}>
        <ToolIcon name={tool.icon} className="size-3.5" />
      </span>
      <span className="truncate text-xs font-medium text-foreground">{tool.nameBn}</span>
    </button>
  );
}

export function useDebounced<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
