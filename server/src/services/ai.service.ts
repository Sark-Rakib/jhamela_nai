/**
 * Assistant answer engine.
 *
 * Two layers, in this order:
 *  1. Deterministic keyword scoring — instant, free, works with no API key and
 *     no network. This is the same idea as the web app's local intent engine and
 *     it is what users get whenever Gemini is unavailable.
 *  2. Gemini — used only when `GEMINI_API_KEY` is set. It never decides *what* a
 *     tool is (the catalogue decides that); it only picks a slug from the fixed
 *     list and writes the Bangla reply. An unknown slug is rejected and the
 *     deterministic answer is returned instead.
 */

import { env, hasGemini } from "../config/env.js";
import { TOOL_INDEX, findTool, type ToolIndexEntry } from "./tool-index.js";

export interface AssistantAnswer {
  slug: string;
  confidence: number;
  reply: string;
  source: "local" | "gemini";
  matchedOn: string[];
  alternativeSlugs: string[];
}

interface ScoredTool {
  entry: ToolIndexEntry;
  score: number;
  matchedOn: string[];
}

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_TIMEOUT_MS = 6_000;

/** Bangla/English normalisation: lower-case, strip punctuation, collapse spaces. */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreTools(query: string): ScoredTool[] {
  const text = normalise(query);
  const tokens = text.split(" ").filter(Boolean);

  return TOOL_INDEX.map((entry) => {
    let score = 0;
    const matchedOn: string[] = [];

    for (const keyword of entry.keywords) {
      const needle = normalise(keyword);
      if (!needle) continue;
      let hit = 0;
      if (text === needle) hit = 9;
      else if (text.includes(needle)) hit = 5 + Math.min(3, needle.length / 4);
      else if (needle.includes(" ") === false && needle.length >= 4) {
        if (tokens.some((token) => token.startsWith(needle.slice(0, 3)) && token.length >= 4)) hit = 2.5;
      }
      if (hit > 0) {
        score += hit;
        matchedOn.push(keyword);
      }
    }

    // A generic category word is a weak signal on its own.
    if (/টাকা|হিসাব|হিসাবটা/.test(text) && entry.category === "money") score += 0.5;

    return { entry, score, matchedOn };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);
}

function localReply(entry: ToolIndexEntry, matchedOn: string[]): string {
  const lead = matchedOn.length
    ? `“${matchedOn.slice(0, 3).join(", ")}” শব্দটি মিলেছে।`
    : "আপনার প্রশ্নের সবচেয়ে কাছাকাছি মিল:";
  return `${lead}\n\n**${entry.label}** এখানে ঠিক আপনার কাজটা হবে — ${entry.hint}\n\nফর্মটি পূরণ করে সাথে সাথেই ফলাফল দেখতে পারবেন; লগইন না করলেও চলবে।`;
}

function confidenceOf(score: number, best: ScoredTool | undefined, runnerUp: ScoredTool | undefined): number {
  if (!best) return 0;
  const margin = score - (runnerUp?.score ?? 0);
  const base = Math.min(0.95, score / 14);
  return Math.max(0.3, Math.min(0.99, base + margin / 30));
}

function localAnswer(query: string): AssistantAnswer | null {
  const scored = scoreTools(query);
  const best = scored[0];
  if (!best) return null;

  const alternatives = scored
    .slice(1, 4)
    .filter((row) => row.score >= best.score * 0.4)
    .map((row) => row.entry.slug);

  return {
    slug: best.entry.slug,
    confidence: Number(confidenceOf(best.score, best, scored[1]).toFixed(2)),
    reply: localReply(best.entry, best.matchedOn),
    source: "local",
    matchedOn: best.matchedOn,
    alternativeSlugs: alternatives,
  };
}

interface GeminiResult {
  slug?: string;
  reply?: string;
}

async function askGemini(query: string): Promise<GeminiResult | null> {
  if (!hasGemini || !env.GEMINI_API_KEY) return null;

  const catalogue = TOOL_INDEX.map((tool) => `- ${tool.slug}: ${tool.label} — ${tool.hint}`).join("\n");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GEMINI_ENDPOINT}/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: query }] }],
          systemInstruction: {
            parts: [
              {
                text: [
                  "আপনি Jhamela Nai নামের বাংলাদেশি ওয়েবসাইটের সহকারী।",
                  "ব্যবহারকারীর প্রশ্নের উত্তর দিতে হবে এই তালিকার একটি টুল বেছে নিয়ে:",
                  catalogue,
                  "JSON দিয়ে উত্তর দিন: {\"slug\": \"তালিকার slug\", \"reply\": \"বাংলায় ২-৩ বাক্যের উত্তর\"}",
                  "slug অবশ্যই তালিকার একটি হতে হবে, অন্যথায় \"slug\": null দিন।",
                ].join("\n"),
              },
            ],
          },
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
      },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as GeminiResult;
    return typeof parsed?.slug === "string" ? parsed : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolves a free-text question to a tool.
 *
 * The deterministic engine runs first and stays the fallback, so this endpoint
 * never invents a tool that is not in the catalogue.
 */
export async function answerAssistant(query: string): Promise<AssistantAnswer> {
  const local = localAnswer(query);

  const gemini = await askGemini(query);
  const entry = gemini?.slug ? findTool(gemini.slug) : undefined;
  const reply = typeof gemini?.reply === "string" ? gemini.reply.trim() : "";

  if (entry && reply) {
    return {
      slug: entry.slug,
      confidence: 0.9,
      reply: `${reply}\n\n**${entry.label}** দিয়ে শুরু করুন — ${entry.hint}`,
      source: "gemini",
      matchedOn: local?.matchedOn ?? [],
      alternativeSlugs: (local?.alternativeSlugs ?? []).filter((slug) => slug !== entry.slug),
    };
  }

  if (local) return local;

  return {
    slug: "",
    confidence: 0,
    reply:
      "আপনার প্রশ্নটি পরিষ্কারভাবে বুঝতে পারলাম না। “খরচের হিসাব”, “পড়ার পরিকল্পনা”, “ইনভয়েস” — এভাবে একটি কাজের নাম লিখে দিলেই সঠিক টুল খুঁজে দেব।",
    source: "local",
    matchedOn: [],
    alternativeSlugs: [],
  };
}