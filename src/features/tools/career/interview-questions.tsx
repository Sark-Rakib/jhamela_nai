"use client";

/**
 * Interview question practice.
 *
 * The question bank is curated and stored in this file — no random claims, no
 * invented company-specific questions. Selection is deterministic for a given
 * (role, level) pair so a visitor can come back tomorrow and see the same set
 * until they ask for new ones.
 */

import * as React from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/card";
import { useToolState } from "@/lib/use-tool-state";
import { trackToolCompleted } from "@/lib/analytics";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, SaveButton } from "@/features/tools/save-button";

const SLUG = "interview-questions";

type Level = "entry" | "mid" | "senior";

interface Question {
  id: string;
  topic: string;
  question: string;
  hint: string;
}

interface State {
  role: string;
  level: Level;
  topic: string;
  count: number;
  seed: number;
  asked: string[];
}

const DEFAULT_STATE: State = {
  role: "",
  level: "entry",
  topic: "সব",
  count: 8,
  seed: 1,
  asked: [],
};

const LEVEL_OPTIONS = [
  { value: "entry", label: "ফ্রেশার / ০–১ বছর" },
  { value: "mid", label: "মিড লেভেল (২–৫ বছর)" },
  { value: "senior", label: "সিনিয়র (৫+ বছর)" },
];

const TOPIC_OPTIONS = [
  { value: "সব", label: "সব বিষয়" },
  { value: "সাধারণ", label: "সাধারণ প্রশ্ন" },
  { value: "আচরণ", label: "আচরণভিত্তিক" },
  { value: "টেকনিক্যাল", label: "টেকনিক্যাল" },
  { value: "পরিস্থিতি", label: "পরিস্থিতিনির্ভর" },
  { value: "ম্যানেজমেন্ট", label: "ম্যানেজমেন্ট" },
];

const BANK: Question[] = [
  { id: "gen-intro", topic: "সাধারণ", question: "নিজের সংক্ষিপ্ত পরিচয় দিন — শিক্ষা ও কাজের অভিজ্ঞতা।", hint: "৬০ সেকেন্ডের ভেতর উত্তর দিন, উত্তর নয় বলে শুরু করবেন না।" },
  { id: "gen-why", topic: "সাধারণ", question: "এই পদের জন্য কেন আবেদন করেছেন?", hint: "প্রতিষ্ঠানের কাজের সঙ্গে নিজের অভিজ্ঞতা মেলান, টাকা-পয়সা নয়।" },
  { id: "gen-strength", topic: "সাধারণ", question: "আপনার সবচেয়ে শক্তিশালী দিক কোনটি? উদাহরণসহ বলুন।", hint: "উদাহরণ দিন: কোন সমস্যা কীভাবে সমাধান করলেন।" },
  { id: "gen-weak", topic: "সাধারণ", question: "একটি দুর্বলতা বা শেখার বিষয় বলুন এবং কী করছেন।", hint: "সত্যি উত্তর দিন, তারপর করণীয় দেখান।" },
  { id: "gen-salary", topic: "সাধারণ", question: "আপনার প্রত্যাশিত বেতন কত?", hint: "পরিস্থিতি ও দক্ষতা অনুযায়ী সংখ্যা বলুন, লজ্জা হলে বলুন আলোচনাযোগ্য।" },
  { id: "beh-team", topic: "আচরণ", question: "টিমের সাথে মতভেদ হলে কী করেন?", hint: "উদাহরণ: কে সিদ্ধান্ত নিল, আপনার অবস্থান কী ছিল।" },
  { id: "beh-failure", topic: "আচরণ", question: "একটি ভুল বা ব্যর্থতার কথা বলুন যেটা থেকে আপনি শিখেছেন।", hint: "দায় নিয়ে শেষে কী বদলালেন তা বলুন।" },
  { id: "beh-feedback", topic: "আচরণ", question: "কখনো কঠিন মন্তব্য পেয়েছেন? কীভাবে সামলান?", hint: "নির্দিষ্ট উদাহরণ ও পরিবর্তন দেখান।" },
  { id: "beh-time", topic: "আচরণ", question: "একসাথে একাধিক কাজের অগ্রাধিকার কীভাবে ঠিক করেন?", hint: "নির্দিষ্ট উদাহরণ ও ফলাফল দিন।" },
  { id: "tech-stack", topic: "টেকনিক্যাল", question: "আপনি প্রতিদিন যে কাজটি করেন, তার প্রযুক্তিগত অংশ ব্যাখ্যা করুন।", hint: "কী কেন বেছে নিলেন সেটাই বলুন, শুধু নাম নয়।" },
  { id: "tech-debug", topic: "টেকনিক্যাল", question: "একটি জটিল বাগ ডিবাগ করার সময় আপনার পদ্ধতি কী?", hint: "পুনরাবৃত্তি → সীমা পরীক্ষা → লগ → হাইপোথিসিস।" },
  { id: "tech-code", topic: "টেকনিক্যাল", question: "কোনো সমস্যা হাতে কলমে সমাধান করে দেখান।", hint: "আগে ভেবে বলুন, তারপর কোড লিখুন — দুটোই দেখান।" },
  { id: "tech-improve", topic: "টেকনিক্যাল", question: "আপনার কাজের কোনো অংশ আরও ভালো করতে চাইলে কী বদলাতেন?", hint: "বর্তমান সীমাবদ্ধতা → প্রস্তাবিত সমাধান → প্রভাব।" },
  { id: "sit-load", topic: "পরিস্থিতি", question: "সাপোর্ট টিমের কাজ হঠাৎ দ্বিগুণ হয়ে গেলে কী করবেন?", hint: "অগ্রাধিকার ঠিক করা ও ওপরে জানানোর কথা বলুন।" },
  { id: "sit-client", topic: "পরিস্থিতি", question: "ক্লায়েন্ট অভিযোগ করেছে কাজ ভুল হয়েছে — কীভাবে সামলাবেন?", hint: "শুনুন, তদন্ত করুন, সমাধান দিন — তিন ধাপই বলুন।" },
  { id: "sit-gap", topic: "পরিস্থিতি", question: "কাজে ভুল হয়ে গেছে কিন্তু কেউ জানে না — কী করবেন?", hint: "নিজেই আগে জানানো সবচেয়ে পেশাদার উত্তর।" },
  { id: "sit-new", topic: "পরিস্থিতি", question: "নতুন প্রযুক্তিতে কাজ শুরু করতে হলে প্রথম সপ্তাহে কী করবেন?", hint: "ছোট, নিরাপদ টাস্ক দিয়ে শুরুর কথা বলুন।" },
  { id: "sit-remote", topic: "পরিস্থিতি", question: "দূর থেকে কাজ করার সময় কী চ্যালেঞ্জ হয় এবং কীভাবে সামলান?", hint: "সময় ব্যবস্থাপনা ও যোগাযোগের নিয়মের কথা বলুন।" },
  { id: "man-team", topic: "ম্যানেজমেন্ট", question: "টিমের কোনো সদস্য কাজ করছে না — আপনি কী করবেন?", hint: "আগে কারণ জানুন, তারপর নির্দিষ্ট কথা বলুন।" },
  { id: "man-goal", topic: "ম্যানেজমেন্ট", question: "ছয় মাসের লক্ষ্য কী রাখবেন এবং কীভাবে মাপবেন?", hint: "পরিমাপযোগ্য লক্ষ্য দিন — সংখ্যা বা সময়সীমা সহ।" },
  { id: "man-hire", topic: "ম্যানেজমেন্ট", question: "নতুন কাজী নিয়োগে কী দেখবেন?", hint: "দক্ষতার চেয়ে মনোযোগ ও দায়িত্ব নেওয়ার ইচ্ছা বলুন।" },
  { id: "man-conflict", topic: "ম্যানেজমেন্ট", question: "দুই অংশীদার দল ভিন্ন সিদ্ধান্তে — কী করবেন?", hint: "সিদ্ধান্তের মানদণ্ড বেছে নিয়ে কথা বলার চেষ্টা করুন।" },
  { id: "ent-stress", topic: "সিনিয়র", question: "চাপের মধ্যে শান্ত থাকতে কী করেন? একটি উদাহরণ দিন।", hint: "আপনার নিজের কৌশল বর্ণনা করুন, সাধারণ পরামর্শ নয়।" },
  { id: "ent-stake", topic: "সিনিয়র", question: "এমন একটি সিদ্ধান্তের উদাহরণ দিন যেটার ফল আপনাকে পরিবর্তন করেছে।", hint: "পরিণতি ও কী শিখেছেন — দুটোই বলুন।" },
  { id: "ent-risk", topic: "সিনিয়র", question: "ঝুঁকি নেওয়ার ক্ষেত্রে আপনার সিদ্ধান্তের নিয়ম কী?", hint: "তথ্যের ভিত্তিতে সিদ্ধান্ত নেওয়ার উদাহরণ দিন।" },
];

/** Deterministic shuffle: same seed → same order. */
function pickQuestions(role: string, level: Level, topic: string, count: number, seed: number): Question[] {
  const pool = BANK.filter((item) => topic === "সব" || item.topic === topic);
  const rotated = pool.map((item, index) => {
    const score = (item.id.charCodeAt(0) + index * 7 + seed * 13 + role.length * 3 + level.length) % pool.length;
    return { item, score };
  });
  return rotated
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.max(1, Math.min(count, pool.length)))
    .map((entry) => entry.item);
}

export function InterviewQuestions() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);

  const questions = React.useMemo(
    () => pickQuestions(state.role, state.level, state.topic, state.count, state.seed),
    [state.role, state.level, state.topic, state.count, state.seed],
  );

  function patch<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="যোগ্যতার ধরন"
            description="পদ, অভিজ্ঞতার ধাপ ও বিষয় বেছে নিলে প্রশ্নের তালিকা বদলে যাবে।"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={{ ...state, asked: state.asked.length }} />}
          >
            <div className="grid gap-4">
              <Field label="পদের নাম" htmlFor="iq-role" hint="ফাঁকা রাখলেও কাজ হবে">
                <Input
                  id="iq-role"
                  value={state.role}
                  onChange={(event) => patch("role", event.target.value)}
                  placeholder="যেমন: ফ্রন্টএন্ড ডেভেলপার"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="অভিজ্ঞতার ধাপ" htmlFor="iq-level">
                  <Select
                    id="iq-level"
                    value={state.level}
                    onValueChange={(value) => patch("level", value as Level)}
                    options={LEVEL_OPTIONS}
                  />
                </Field>
                <Field label="বিষয়" htmlFor="iq-topic">
                  <Select
                    id="iq-topic"
                    value={state.topic}
                    onValueChange={(value) => patch("topic", value)}
                    options={TOPIC_OPTIONS}
                  />
                </Field>
              </div>
              <Field label="কতটি প্রশ্ন" htmlFor="iq-count" suffix={`সর্বোচ্চ ${BANK.length}`}>
                <input
                  id="iq-count"
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={state.count}
                  onChange={(event) => patch("count", Number(event.target.value))}
                  className="w-full accent-primary"
                />
              </Field>
              <Button
                variant="outline"
                onClick={() => patch("seed", state.seed + 1)}
                aria-label="নতুন প্রশ্নের তালিকা"
              >
                <RefreshCw aria-hidden />
                নতুন প্রশ্ন দেখুন
              </Button>
            </div>
          </ToolPanel>

          <ToolPanel title="উত্তরের সময়কাল" description="প্রশ্ন ৪–৫টি, তবে মাঝে ১–২ প্রশ্ন করা উত্তর দেওয়ার সময় বাড়ানোই বাস্তবসম্মত।">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>প্রতিটি উত্তর ১–২ মিনিটের মধ্যে শেষ করার অভ্যাস করুন।</li>
              <li>উত্তর শেষে একটি উদাহরণ দিলে স্মরণীয় হয়।</li>
              <li>জানেন না বলতে দ্বিধা না করে “জানি না, তবে যাচাই করে জানাব” বলুন।</li>
            </ul>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="আজকের প্রস্তুতি">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="প্রশ্ন" value={questions.length} tone="brand" />
              <StatBlock
                label="অভিজ্ঞতার ধাপ"
                value={LEVEL_OPTIONS.find((item) => item.value === state.level)?.label.split(" (")[0]}
              />
            </div>
            <p className="mt-3 flex items-start gap-2 text-2xs leading-relaxed text-faint-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              এই প্রশ্নগুলো এখানে সংগৃহীত ব্যাংক থেকে দেখানো হয় — কোনো কোম্পানির নিজস্ব প্রশ্ন নয়।
            </p>
          </ResultCard>

          <ol className="space-y-3">
            {questions.map((item, index) => (
              <li key={item.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-wide text-faint-foreground">
                    প্রশ্ন {index + 1}
                  </span>
                  <Badge tone="brand">{item.topic}</Badge>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground">{item.question}</p>
                <p className="mt-2 text-2xs leading-relaxed text-muted-foreground">ইঙ্গিত: {item.hint}</p>
              </li>
            ))}
          </ol>

          <Button
            className="w-full"
            onClick={() => {
              const next = [...state.asked, ...questions.map((item) => item.id)].slice(-40);
              setState((prev) => ({ ...prev, asked: next, seed: prev.seed + 1 }));
              trackToolCompleted(SLUG, { level: state.level, topic: state.topic });
              toast.success("প্রশ্নগুলো দেখা হয়েছে। অনুশীলন শেষে নতুন প্রশ্ন নিন।");
            }}
          >
            অনুশীলন শুরু
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}