"use client";

/**
 * "কী চাই?" assistant.
 *
 * Hybrid routing:
 *  1. Deterministic `detectIntent` runs first — instant, offline, always works.
 *  2. If the deterministic score is weak we ask the API, where Gemini refines
 *     the answer when `GEMINI_API_KEY` is configured and the local engine is
 *     used as the fallback when it is not (or when the call fails).
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, RotateCcw, Send, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ui/icons";
import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { ACCENT_BORDER, ACCENT_TILE } from "@/lib/accents";
import { detectIntent, type IntentMatch } from "@/lib/intent";
import { AI_ASSISTANT_EXAMPLES, TOOL_BY_SLUG, type ToolDefinition } from "@/lib/tools";
import { cn } from "@/lib/utils";

/**
 * Wire format. The API only resolves a slug — the full definition is hydrated
 * from this app's catalogue so the two can never drift apart.
 */
interface AssistantResponse {
  slug: string;
  confidence: number;
  reply: string;
  /** "local" = deterministic engine, "gemini" = refined by the model. */
  source: "local" | "gemini";
  matchedOn: string[];
  alternativeSlugs: string[];
}

interface AssistantAnswer {
  tool: ToolDefinition;
  confidence: number;
  reply: string;
  /** "local" = deterministic engine, "gemini" = refined by the model. */
  source: "local" | "gemini";
  matchedOn: string[];
  alternatives: ToolDefinition[];
}

const WEAK_SCORE = 4.2;

export function AiAssistant({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [answer, setAnswer] = React.useState<AssistantAnswer | null>(null);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function reset() {
    setQuery("");
    setAnswer(null);
    inputRef.current?.focus();
  }

  async function ask(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;

    setQuery(text);
    setLoading(true);
    setAnswer(null);

    const local = detectIntent(text);
    const localMatch = local.best;
    const deterministic = (localMatch?.score ?? 0) >= WEAK_SCORE;

    if (deterministic && localMatch) {
      track("ai_query_used", { tool: localMatch.tool.slug, props: { source: "local" } });
      setAnswer({
        tool: localMatch.tool,
        confidence: localMatch.confidence,
        reply: replyFor(localMatch),
        source: "local",
        matchedOn: local.matchedOn,
        alternatives: local.alternatives.map((item) => item.tool),
      });
      setLoading(false);
      return;
    }

    try {
      const data = await api.post<AssistantResponse>("/ai/assistant", { query: text });
      const tool = TOOL_BY_SLUG[data.slug];
      if (!tool) {
        setAnswer(null);
        setQuery(text);
        return;
      }
      track("ai_query_used", {
        tool: tool.slug,
        props: { source: data.source },
      });
      setAnswer({
        tool,
        confidence: data.confidence,
        reply: data.reply,
        source: data.source,
        matchedOn: data.matchedOn,
        alternatives: data.alternativeSlugs
          .map((slug) => TOOL_BY_SLUG[slug])
          .filter((item): item is ToolDefinition => Boolean(item)),
      });
    } catch (error) {
      // Offline or no assistant endpoint — fall back to search suggestions.
      if (error instanceof ApiError && error.isOffline) {
        setAnswer(null);
        setQuery(text);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={cn("relative overflow-hidden", className)} aria-labelledby="assistant-heading">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-md sm:p-7">
        <div className="flex items-start gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
            aria-hidden
          >
            <Wand2 className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 id="assistant-heading" className="text-lg font-semibold tracking-tight">
              কী চাই বলুন — সঠিক টুলটা খুঁজে দিই
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              বাংলায় বা ইংরেজিতে লিখুন। যেমন: “এই মাসের খরচ কিভাবে ভাগ করব?” — লগইন ছাড়াই
              কাজ করে।
            </p>
          </div>
        </div>

        <form
          className="mt-5 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(query);
          }}
        >
          <label htmlFor="assistant-input" className="sr-only">
            আপনার প্রশ্ন
          </label>
          <input
            id="assistant-input"
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="যেমন: একটা invoice বানাতে চাই"
            autoComplete="off"
            enterKeyHint="send"
            className="h-11 flex-1 rounded-lg border border-input bg-background px-3.5 text-[15px] text-foreground placeholder:text-faint-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <Button type="submit" size="lg" disabled={loading || !query.trim()}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                খুঁজছি…
              </>
            ) : (
              <>
                <Send aria-hidden />
                খুঁজুন
              </>
            )}
          </Button>
        </form>

        {!answer && !loading ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {AI_ASSISTANT_EXAMPLES.slice(0, 4).map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => void ask(example)}
                className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-ring"
              >
                {example}
              </button>
            ))}
          </div>
        ) : null}

        {answer ? (
          <div className="mt-5 animate-jn-rise rounded-xl border border-border bg-surface-muted p-4 sm:p-5">
            <div className="flex flex-wrap items-start gap-3">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-lg",
                  ACCENT_TILE[answer.tool.accent] ?? ACCENT_TILE.brand,
                )}
                aria-hidden
              >
                <ToolIcon name={answer.tool.icon} className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-faint-foreground">
                  {answer.source === "gemini" ? "AI সহায়ক" : "স্বয়ংক্রিয় মিল"}
                  {" · "}
                  {Math.round(answer.confidence * 100)}% মিল
                </p>
                <h3 className="mt-0.5 text-base font-semibold tracking-tight">
                  {answer.tool.nameBn}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{answer.reply}</p>

                {answer.matchedOn.length > 0 ? (
                  <p className="mt-2 text-2xs text-faint-foreground">
                    মিল পাওয়া গেছে: {answer.matchedOn.join(", ")}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => router.push(`/tools/${answer.tool.slug}`)}>
                    টুলটা খুলুন
                    <ArrowRight aria-hidden />
                  </Button>
                  <Button variant="outline" size="sm" onClick={reset}>
                    <RotateCcw aria-hidden />
                    আরেকটি
                  </Button>
                </div>
              </div>
            </div>

            {answer.alternatives.length > 0 ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-2xs font-medium uppercase tracking-wide text-faint-foreground">
                  এগুলোও মিলতে পারে
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {answer.alternatives.slice(0, 3).map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted focus-ring",
                        ACCENT_BORDER[tool.accent] ?? ACCENT_BORDER.brand,
                      )}
                    >
                      <Sparkles className="size-3 text-faint-foreground" aria-hidden />
                      {tool.nameBn}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function replyFor(match: IntentMatch): string {
  const { tool, confidence } = match;
  const opener = confidence >= 0.75 ? "মনে হচ্ছে আপনি এটা চান" : "সবচেয়ে কাছের মিলটা";
  return `${opener} — ${tool.description.split("।")[0]}। সব হিসাব আপনার ব্রাউজারেই হবে, কোনো সার্ভারে তথ্য যায় না।`;
}