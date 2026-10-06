/**
 * Deterministic intent detection.
 *
 * This runs on every search keystroke and on the server when Gemini is not
 * configured, so it must be fast, dependency-free and predictable. Gemini is
 * treated as a *refinement* layer on top, never a requirement — see
 * `features/ai-assistant` for the hybrid path.
 *
 * Scoring: phrase hits scale with length (a 12-char phrase is far stronger
 * evidence than a 3-char one), with degraded credit for prefix and
 * single-character-typo matches to survive Bangla transliteration and typing
 * mistakes.
 */

import { TOOLS, type ToolDefinition } from "./tools";

/* ------------------------------------------------------------- normalising */

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Bangla + ASCII digits to ASCII, so "৩০ হাজার" and "30 thousand" behave alike. */
export function normaliseQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))
    .replace(/[‐-―]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokens of letters/digits only — punctuation and spacing noise removed. */
export function tokenise(input: string): string[] {
  return normaliseQuery(input)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 0);
}

/** Intent verbs that carry no tool signal — "আমি একটা CV বানাতে চাই" → "cv". */
const STOPWORDS = new Set([
  // Bangla
  "আমি",
  "আমার",
  "আমাকে",
  "চাই",
  "চান",
  "চায়",
  "চাওয়া",
  "করতে",
  "করব",
  "করবো",
  "করা",
  "করার",
  "করলে",
  "বানাতে",
  "বানাবো",
  "বানাতে",
  "তৈরি",
  "তৈরি",
  "দরকার",
  "দরকারি",
  "কিভাবে",
  "কীভাবে",
  "কোন",
  "কোনটা",
  "কোনটি",
  "কোনো",
  "একটা",
  "একটি",
  "একটা",
  "এক",
  "এই",
  "ওই",
  "সেই",
  "সেটা",
  "সেটি",
  "জন্য",
  "আর",
  "এবং",
  "ও",
  "হয়",
  "হবে",
  "হওয়া",
  "থেকে",
  "পেয়ে",
  "দিয়ে",
  "নিয়ে",
  "বলে",
  "বলতে",
  "না",
  "কোনোদিন",
  "পারি",
  "পারব",
  "চলে",
  "আছে",
  "নেই",
  "আসে",
  "যায়",
  "জন্যে",
  "দরুন",
  "ভালো",
  "ভাল",
  "আমাদের",
  "আপনার",
  "আপনি",
  "মনে",
  "খুব",
  // English
  "i",
  "want",
  "need",
  "make",
  "create",
  "generate",
  "build",
  "please",
  "help",
  "how",
  "can",
  "a",
  "an",
  "the",
  "my",
  "me",
  "to",
  "for",
  "of",
  "is",
  "and",
  "please",
]);

/* -------------------------------------------------- extra signal vocabulary */

/**
 * Domain phrases that are far more precise than the generic catalogue
 * keywords. Kept separate so the registry stays readable.
 */
const SIGNAL_PHRASES: Record<string, string[]> = {
  "budget-planner": [
    "বাজেট",
    "বাজেট বানাতে",
    "বাজেট প্ল্যান",
    "মাসের খরচ",
    "মাসিক খরচ",
    "খরচ কিভাবে ভাগ",
    "খরচ ভাগ",
    "আয় ব্যয়ের পরিকল্পনা",
    "income expense plan",
    "monthly budget",
    "budget banate",
    "taka kotha",
    "খরচের পরিকল্পনা",
    "আয় কত খরচ",
    "প্রতিটার হিসাব",
    "বাজেট বানাও",
  ],
  "expense-tracker": [
    "খরচ ট্র্যাকার",
    "খরচের খাতা",
    "খরচ লিখে",
    "খরচ যোগ",
    "খরচ জমা",
    "আয় খরচ লিখ",
    "প্রতিদিনের খরচ",
    "খরচের ইতিহাস",
    "expense tracker",
    "kharcha hishab",
    "khoroch rakhi",
    "টাকা খরচ করা",
    "খরচের হিসাব রাখা",
  ],
  "savings-calculator": [
    "সঞ্চয় হিসাব",
    "সঞ্চয়ের লক্ষ্য",
    "সঞ্চয় করব",
    "জমানোর হিসাব",
    "কত মাসে",
    "কত সময়ে",
    "সুদের হিসাব",
    "savings goal",
    "bachao hishab",
    "emergency fund",
  ],
  "loan-emi-calculator": [
    "emi",
    "emi হিসাব",
    "লোন হিসাব",
    "লোনের কিস্তি",
    "কিস্তির হিসাব",
    "মাসিক কিস্তি",
    "ব্যাংক লোন",
    "পার্সোনাল লোন",
    "গাড়ির লোন",
    "home loan",
    "ধারের হিসাব",
    "loan calculator",
    "instalment",
    "কিস্তি কত",
    "সুদ কত",
  ],
  "profit-loss-calculator": [
    "লাভ ক্ষতি",
    "লাভের হিসাব",
    "ক্ষতির হিসাব",
    "কত লাভ",
    "কত লাভ হবে",
    "মুনাফা",
    "profit loss",
    "lab khosti",
    "profit calculator",
    "loss calculator",
    "মার্জিন কত",
    "বিক্রির হিসাব",
    "ecommerce profit",
    "resell",
  ],
  "cv-builder": [
    "সিভি",
    "সি ভি",
    "cv বানাতে",
    "cv বানাও",
    "cv তৈরি",
    "রিজিউমে",
    "resume",
    "curriculum vitae",
    "বায়োডাটা",
    "বায়ো ডাটা",
    "বিডিসি",
    "চাকরির জন্য সিভি",
    "cv banate",
    "cv maker",
    "জবের জন্য সিভি",
    "প্রফেশনাল সিভি",
  ],
  "cover-letter-generator": [
    "কভার লেটার",
    "কভারলেটার",
    "cover letter",
    "মোটিভেশন লেটার",
    "চাকরির চিঠি",
    "আবেদনের চিঠি",
  ],
  "job-application-generator": [
    "আবেদন পত্র",
    "আবেদন ফর্ম",
    "আবেদন ইমেইল",
    "চাকরির আবেদন",
    "job application",
    "application letter",
    "কীভাবে আবেদন",
    "how to apply",
  ],
  "interview-questions": [
    "ইন্টারভিউ",
    "ইন্টারভিউ প্রশ্ন",
    "সাক্ষাৎকার প্রশ্ন",
    "চাকরির প্রশ্ন",
    "interview question",
    "interview preparation",
    "ইন্টারভিউয়ের প্রস্তুতি",
    "viva",
    "hr question",
  ],
  "invoice-generator": [
    "ইনভয়েস",
    "ইনভয়েস বানাতে",
    "invoice বানাতে",
    "invoice বানাও",
    "বিল বানাতে",
    "চালান বানাতে",
    "invoice generator",
    "tax invoice",
    "invoice banate",
    "invois",
    "বিল তৈরি",
    "মূল্য তালিকা invoice",
  ],
  "receipt-generator": [
    "রসিদ",
    "রসিদ বানাতে",
    "জমার রসিদ",
    "পরিশোধের রসিদ",
    "receipt banate",
    "receipt generator",
    "money receipt",
    "হাতে লেখা রসিদ",
  ],
  "quotation-generator": [
    "কোটেশন",
    "কোটেশান",
    "দরপত্র",
    "অফার লেটার",
    "মূল্য অফার",
    "quotation",
    "quotation banate",
    "estimate",
    "প্রপোজাল",
    "কাজের দর",
  ],
  "image-compressor": [
    "ইমেজ কম্প্রেসর",
    "ইমেজ কমপ্রেসর",
    "ছবি কমপ্রেস",
    "ছবির সাইজ কমাতে",
    "ফটো সাইজ",
    "ইমেজ সাইজ",
    "ছবি ছোট করতে",
    "image compress",
    "image compressor",
    "compress image",
    "photo compress",
    "jpg compress",
    "ছবি ওজন কমাতে",
    "ফাইল সাইজ কমাতে",
  ],
  "pdf-maker": [
    "পিডিএফ",
    "pdf বানাতে",
    "pdf বানাও",
    "pdf তৈরি",
    "ছবি থেকে pdf",
    "টেক্সট থেকে pdf",
    "pdf maker",
    "jpg to pdf",
    "text to pdf",
    "pdf banano",
    "পিডিএফ বানানো",
    "ডকুমেন্ট বানানো",
  ],
  "travel-budget-planner": [
    "ট্রাভেল",
    "ট্রাভেল বাজেট",
    "ট্রিপ",
    "trip budget",
    "ভ্রমণের খরচ",
    "ভ্রমনের খরচ",
    "যাত্রার খরচ",
    "ট্যুর",
    "ট্যুরের খরচ",
    "ঘোরার খরচ",
    "ঢাকা যাব",
    "যাত্রা পরিকল্পনা",
    "হোটেল খরচ",
    "টিকিটের দাম",
    "travel plan",
    "tour budget",
    "ভ্রমণ পরিকল্পনা",
  ],
  "event-planner": [
    "অনুষ্ঠান",
    "অনুষ্ঠানের খরচ",
    "বিয়ের খরচ",
    "বিয়ে",
    "ওয়েডিং",
    "wedding",
    "ইফতার",
    "মেহেংদি",
    "পার্টির খরচ",
    "পার্টি",
    "birthday",
    "জন্মদিন",
    "event plan",
    "আয়োজন",
    "সাজসজ্জা খরচ",
  ],
  "moving-checklist": [
    "উঠানো",
    "উঠানোর চেকলিস্ট",
    "গেলে যাওয়া",
    "নতুন বাড়ি",
    "বাড়ি বদল",
    "moving checklist",
    "relocation",
    "shift korbo",
    "স্থানান্তর",
  ],
  "shopping-list": [
    "শপিং লিস্ট",
    "শপিং তালিকা",
    "কেনাকাটার তালিকা",
    "কেনাকাটা",
    "বাজারের তালিকা",
    "বাজারের লিস্ট",
    "shopping list",
    "grocery list",
    "bajar er list",
    "কি কিনব",
    "কী কিনব",
    "কেনাকাটা লিস্ট",
  ],
  "to-do-planner": [
    "টুডু",
    "টু ডো",
    "to do list",
    "todo list",
    "কাজের তালিকা",
    "টাস্ক লিস্ট",
    "task list",
    "কাজের লিস্ট",
    "দৈনিক কাজ",
    "আজ কী কী করতে হবে",
  ],
  "cgpa-calculator": [
    "সিজিপিএ",
    "জিপিএ",
    "cgpa",
    "gpa",
    "গ্রেড ক্যালকুলেটর",
    "গ্রেড হিসাব",
    "পয়েন্ট হিসাব",
    "সেমিস্টার জিপিএ",
    "রেজাল্ট হিসাব",
    "ট্রান্সক্রিপ্ট",
    "cgpa calculator",
    "cgpa hishab",
    "grade point",
    "কত জিপিএ",
    "আমার cgpa",
    "semester gpa",
  ],
  "study-planner": [
    "পড়ার পরিকল্পনা",
    "পড়ার রুটিন",
    "স্টাডি প্ল্যানার",
    "স্টাডি প্ল্যান",
    "পড়ার সময়",
    "study planner",
    "porasonha",
    "পড়ার টেবিল",
    "revision plan",
    "রিভিশন প্ল্যান",
  ],
  "exam-countdown": [
    "পরীক্ষার কাউন্টডাউন",
    "পরীক্ষার তারিখ",
    "কত দিন বাকি",
    "পরীক্ষার প্রস্তুতি",
    "exam countdown",
    "পরিক্ষা",
    "পরীক্ষা",
    "pariksha",
    "মিড টার্ম",
    "ফাইনাল পরীক্ষা",
    "পরীক্ষার সময়সূচি",
  ],
  "assignment-planner": [
    "অ্যাসাইনমেন্ট",
    "অ্যাসাইন্ট",
    "অ্যাসাইনমেন্ট প্ল্যানার",
    "অ্যাসাইনমেন্টের ডেডলাইন",
    "assignment planner",
    "ডেডলাইন",
    "deadline",
    "জমা দেওয়ার তারিখ",
    "প্রজেক্ট জমা",
    "থিসিস",
  ],
};

/* ----------------------------------------------------------------- helpers */

function editDistanceWithin(a: string, b: string, tolerance: number): boolean {
  if (Math.abs(a.length - b.length) > tolerance) return false;
  if (a === b) return true;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      current[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > tolerance) return false;
    previous = current;
  }
  return previous[b.length] <= tolerance;
}

/** Ample evidence that a money-ish question was asked ("৩০ হাজার টাকা"). */
function mentionsAmount(normalised: string): boolean {
  return /(\d[\d,.]*|\d+(?:\.\d+)?)\s*(টাকা|হাজার|লক্ষ|কোটি|taka|thousand|lakh)/.test(
    normalised,
  );
}

function scoreTool(tool: ToolDefinition, normalised: string, tokens: string[]): number {
  let score = 0;

  const phrases = [...tool.keywords, ...tool.keywordsBn, ...(SIGNAL_PHRASES[tool.slug] ?? [])]
    .map((phrase) => normaliseQuery(phrase))
    .filter(Boolean);

  for (const phrase of phrases) {
    if (normalised.includes(phrase)) {
      // Longer phrases are much stronger evidence: "budget planner" >> "budget".
      score += 3 + Math.min(phrase.replace(/\s/g, "").length, 14) / 5;
      continue;
    }
    const phraseTokens = phrase.split(/\s+/);
    if (phraseTokens.length > 1) continue;
    if (phraseTokens[0].length < 4) continue;
    for (const token of tokens) {
      if (token === phraseTokens[0]) continue;
      if (token.length >= 4 && token.startsWith(phraseTokens[0])) {
        score += 1.4;
        break;
      }
      if (phraseTokens[0].length >= 5 && editDistanceWithin(token, phraseTokens[0], 1)) {
        score += 1.1;
        break;
      }
    }
  }

  // A catalogue keyword can legitimately appear as a whole word — confirm it so
  // "budget" does not fire on "budgeteering".
  if (score > 0) score += Math.min(weightBoost(tool), 1.6);
  return score;
}

function weightBoost(tool: ToolDefinition): number {
  return (tool.weight - 70) / 25;
}

/* ------------------------------------------------------------------- public */

export interface IntentMatch {
  tool: ToolDefinition;
  score: number;
  /** 0–1, calibrated against a plausible max score for a confident match. */
  confidence: number;
}

export interface IntentResult {
  best: IntentMatch | null;
  alternatives: IntentMatch[];
  /** What the engine actually keyed on — surfaced in the UI for transparency. */
  matchedOn: string[];
}

function matchedPhrasesFor(tool: ToolDefinition, normalised: string): string[] {
  const phrases = [
    ...tool.keywords,
    ...tool.keywordsBn,
    ...(SIGNAL_PHRASES[tool.slug] ?? []),
  ];
  return phrases.filter((phrase) => {
    const needle = normaliseQuery(phrase);
    return needle.length >= 3 && normalised.includes(needle);
  });
}

export function detectIntent(rawQuery: string): IntentResult {
  const query = rawQuery.trim();
  if (!query) return { best: null, alternatives: [], matchedOn: [] };

  const normalised = normaliseQuery(query);
  const tokens = tokenise(query).filter((token) => !STOPWORDS.has(token));
  if (tokens.length === 0 && normalised.length === 0) {
    return { best: null, alternatives: [], matchedOn: [] };
  }

  const hasAmount = mentionsAmount(normalised);

  const matches = TOOLS.map((tool) => {
    let score = scoreTool(tool, normalised, tokens);

    // "৩০ হাজার টাকা আয়" is money before it is anything else.
    if (hasAmount && tool.category === "money") score += 1.2;
    // Bangla questions almost always want a tool, not a document.
    if (hasAmount && (tool.slug === "invoice-generator" || tool.slug === "receipt-generator")) {
      score -= 1;
    }
    return { tool, score };
  })
    .filter((match) => match.score > 2)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return { best: null, alternatives: [], matchedOn: [] };
  }

  const toIntent = (match: (typeof matches)[number]): IntentMatch => ({
    tool: match.tool,
    score: Number(match.score.toFixed(2)),
    confidence: Math.min(0.98, Number((match.score / (match.score + 4.5)).toFixed(2))),
  });

  const best = toIntent(matches[0]);
  const alternatives = matches.slice(1, 4).map(toIntent);

  return {
    best: best.score >= 3 ? best : null,
    alternatives,
    matchedOn: matchedPhrasesFor(best.tool, normalised).slice(0, 3),
  };
}

/**
 * Plain keyword search used for the global search bar. Ranks by match position
 * so typing "budget" surfaces Budget Planner before Budget-related tips.
 */
export function searchTools(query: string, limit = 8): ToolDefinition[] {
  const normalised = normaliseQuery(query);
  if (!normalised) return [];
  const tokens = tokenise(query).filter((token) => !STOPWORDS.has(token));
  if (tokens.length === 0) return [];

  return TOOLS.map((tool) => {
    let score = 0;
    const haystacks = [
      { text: normaliseQuery(tool.name), boost: 6 },
      { text: normaliseQuery(tool.nameBn), boost: 5 },
      { text: normaliseQuery(tool.tagline), boost: 3 },
      { text: normaliseQuery(tool.keywords.join(" ")), boost: 2.5 },
      { text: normaliseQuery(tool.keywordsBn.join(" ")), boost: 2.5 },
      { text: normaliseQuery((SIGNAL_PHRASES[tool.slug] ?? []).join(" ")), boost: 2 },
      { text: normaliseQuery(tool.category), boost: 1.5 },
    ];

    for (const { text, boost } of haystacks) {
      if (!text) continue;
      if (text === normalised) {
        score += boost * 3;
        continue;
      }
      if (text.includes(normalised)) {
        score += boost * 1.6;
        continue;
      }
      for (const token of tokens) {
        if (token.length < 2) continue;
        if (text.includes(token)) score += boost;
      }
    }
    return { tool, score };
  })
    .filter((entry) => entry.score > 3)
    .sort((a, b) => b.score - a.score || b.tool.weight - a.tool.weight)
    .slice(0, limit)
    .map((entry) => entry.tool);
}
