"use client";

/**
 * Cover letter generator.
 *
 * Writes a real letter from what the visitor actually supplies — there is no
 * hidden "AI" step and no invented experience. Three tones change the wording,
 * the letter body is fully editable before export.
 */

import * as React from "react";
import { Copy, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { copyToClipboard, downloadText } from "@/lib/export";
import { trackDownload, trackToolCompleted } from "@/lib/analytics";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "cover-letter-generator";

type Tone = "formal" | "confident" | "concise";

interface State {
  name: string;
  email: string;
  phone: string;
  hiringManager: string;
  company: string;
  role: string;
  years: string;
  achievements: string;
  skills: string;
  motivation: string;
  tone: Tone;
  edited: string;
  editedDirty: boolean;
}

const DEFAULT_STATE: State = {
  name: "",
  email: "",
  phone: "",
  hiringManager: "",
  company: "",
  role: "",
  years: "",
  achievements: "",
  skills: "",
  motivation: "",
  tone: "formal",
  edited: "",
  editedDirty: false,
};

const TONE_OPTIONS = [
  { value: "formal", label: "আনুষ্ঠানিক (ব্যাংক, সরকারি)" },
  { value: "confident", label: "আত্মবিশ্বাসী (প্রাইভেট, স্টার্টআপ)" },
  { value: "concise", label: "সংক্ষিপ্ত (টেক, ইন্টার্নশিপ)" },
];

function bullets(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.replace(/^[-•*\d.\s]+/, "").trim())
    .filter(Boolean);
}

function greeting(state: State): string {
  if (state.hiringManager) return `মাননীয় ${state.hiringManager},`;
  if (state.company) return `উত্তর প্রেরক, ${state.company},`;
  return "উত্তর প্রেরক,";
}

function closing(state: State): string {
  const name = state.name.trim();
  return name ? `\n\nবিনীত নিবেদক,\n${name}${state.phone ? `\nফোন: ${state.phone}` : ""}${state.email ? `\nইমেইল: ${state.email}` : ""}` : "";
}

export function buildLetter(state: State): string {
  const points = bullets(state.achievements);
  const skillList = state.skills
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const opener =
    state.tone === "concise"
      ? `${state.role ? `${state.role} পদের জন্য আবেদনপত্রে আমার আগ্রহ প্রকাশ করছি।` : "আপনার প্রতিষ্ঠানে আবেদন করতে চাই।"}${
          state.company ? ` ${state.company}-এর সঙ্গে কাজ করার সুযোগ আমাকে আগ্রহী করেছে।` : ""
        }`
      : state.tone === "confident"
        ? `${state.role ? `${state.role} পদের জন্য আমার অভিজ্ঞতা ও দক্ষতা আপনাদের প্রতিষ্ঠানে মূল্যায়নের যোগ্য বলে মনে হয়।` : "আপনাদের প্রতিষ্ঠানে আমার দক্ষতা মূল্যায়নের যোগ্য বলে মনে হয়।"}${
            state.years ? ` আমার ${state.years} বছরের প্রত্যন্ত অভিজ্ঞতা রয়েছে।` : ""
          }`
        : `আপনাদের প্রতিষ্ঠানে ${state.role || "উপযুক্ত"} পদের জন্য আমার আবেদন বিবেচনা করার জন্য আন্তরিকভাবে অনুরোধ জানাচ্ছি।${
            state.years ? ` সংশ্লিষ্ট ক্ষেত্রে আমার ${state.years} বছরের অভিজ্ঞতা রয়েছে।` : ""
          }`;

  const body: string[] = [greeting(state), "", opener];

  if (points.length > 0) {
    body.push("", "আমার প্রধান অর্জনসমূহ:", ...points.map((point) => `• ${point}`));
  }

  if (skillList.length > 0) {
    body.push("", `পদের জন্য প্রাসঙ্গিক দক্ষতা: ${skillList.join(", ")}।`);
  }

  if (state.motivation.trim()) {
    body.push("", state.motivation.trim());
  }

  body.push(
    state.tone === "formal"
      ? "সম্মানজনক অনুরোধের সাথে আবার জানাচ্ছি যে আপনাদের প্রতিষ্ঠানে আমাকে সুযোগ দিলে আমি সর্বোচ্চ মনোযোগ দিয়ে কাজ করব।"
      : state.tone === "confident"
        ? "আপনাদের দলের সাথে কাজ করার সুযোগ পেলে আমি দ্রুত মানিয়ে নিতে পারব এবং দীর্ঘমেয়াদে মূল্য দিতে পারব।"
        : "আপনাদের সাথে কাজ করার আগ্রহ রাখি।",
    closing(state),
  );

  return body.join("\n");
}

export function CoverLetterGenerator() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  const generated = state.editedDirty ? state.edited : buildLetter(state);
  const wordCount = generated.trim() ? generated.trim().split(/\s+/).length : 0;
  const isReady = Boolean(state.name && (state.role || state.company));

  function patch<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      if (key !== "edited" && key !== "editedDirty") {
        // Any input change invalidates a hand-edited body, so the visitor never
        // ships a stale letter.
        return { ...next, edited: buildLetter(next), editedDirty: false };
      }
      return next;
    });
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="চাকরির তথ্য"
            description="যে পদে আবেদন করছেন সেটিই লিখুন — খালি জায়গা বাক্য অসম্পূর্ণ রাখবে।"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="আপনার নাম" required htmlFor="cl-name">
                <Input
                  id="cl-name"
                  value={state.name}
                  onChange={(event) => patch("name", event.target.value)}
                  placeholder="যেমন: রহিম উদ্দিন"
                />
              </Field>
              <Field label="ইমেইল" htmlFor="cl-email">
                <Input
                  id="cl-email"
                  type="email"
                  value={state.email}
                  onChange={(event) => patch("email", event.target.value)}
                  placeholder="name@example.com"
                />
              </Field>
              <Field label="মোবাইল" htmlFor="cl-phone">
                <Input
                  id="cl-phone"
                  value={state.phone}
                  onChange={(event) => patch("phone", event.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </Field>
              <Field label="কোনো হেড অব ই লেটার?" htmlFor="cl-hm">
                <Input
                  id="cl-hm"
                  value={state.hiringManager}
                  onChange={(event) => patch("hiringManager", event.target.value)}
                  placeholder="ঐচ্ছিক — যেমন: জনাব সাইফুল ইসলাম"
                />
              </Field>
              <Field label="প্রতিষ্ঠান" htmlFor="cl-company">
                <Input
                  id="cl-company"
                  value={state.company}
                  onChange={(event) => patch("company", event.target.value)}
                  placeholder="যেমন: বাংলাদেশ ব্যাংক"
                />
              </Field>
              <Field label="পদের নাম" htmlFor="cl-role">
                <Input
                  id="cl-role"
                  value={state.role}
                  onChange={(event) => patch("role", event.target.value)}
                  placeholder="যেমন: সহকারী ব্যবস্থাপক"
                />
              </Field>
              <Field label="অভিজ্ঞতা (বছর)" htmlFor="cl-years">
                <Input
                  id="cl-years"
                  value={state.years}
                  inputMode="numeric"
                  onChange={(event) => patch("years", event.target.value)}
                  placeholder="যেমন: ৩"
                />
              </Field>
              <Field label="ভাষার ধরন" htmlFor="cl-tone">
                <Select
                  id="cl-tone"
                  value={state.tone}
                  onValueChange={(value) => patch("tone", value as Tone)}
                  options={TONE_OPTIONS}
                />
              </Field>
            </div>
          </ToolPanel>

          <ToolPanel title="আপনার অর্জন ও দক্ষতা" description="প্রতি লাইনে একটি অর্জন লিখুন — সংখ্যা দিলে চাকরিদাতারা বেশি মনোযোগ দেন।">
            <div className="grid gap-4">
              <Field label="অর্জন" htmlFor="cl-ach" hint="প্রতি লাইনে একটি">
                <Textarea
                  id="cl-ach"
                  rows={4}
                  value={state.achievements}
                  onChange={(event) => patch("achievements", event.target.value)}
                  placeholder={"মাসিক ৩০০+ ইনভয়েস প্রসেস করেছি\nনতুন কাস্টমার খোঁজার প্রক্রিয়া তৈরি করেছি"}
                />
              </Field>
              <Field label="দক্ষতা" htmlFor="cl-skills" hint="কমা দিয়ে আলাদা করুন">
                <Textarea
                  id="cl-skills"
                  rows={2}
                  value={state.skills}
                  onChange={(event) => patch("skills", event.target.value)}
                  placeholder="Tally, Excel, মাইক্রোসফট অ্যাক্সেস"
                />
              </Field>
              <Field label="কেন এই প্রতিষ্ঠান?" htmlFor="cl-motivation">
                <Textarea
                  id="cl-motivation"
                  rows={3}
                  value={state.motivation}
                  onChange={(event) => patch("motivation", event.target.value)}
                  placeholder="১–২ বাক্যে আপনাদের প্রতিষ্ঠানের সঙ্গে আপনার মিলের কথা লিখুন।"
                />
              </Field>
            </div>
          </ToolPanel>

          <ToolPanel
            title="চিঠি সম্পাদনা"
            description="তৈরি হওয়া চিঠি সরাসরি এখানে বদলাতে পারেন।"
          >
            <Textarea
              rows={16}
              value={generated}
              onChange={(event) => {
                setState((prev) => ({ ...prev, edited: event.target.value, editedDirty: true }));
              }}
              className="font-mono text-[0.8rem] leading-relaxed"
              aria-label="তৈরি করা চিঠি"
            />
            {state.editedDirty ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setState((prev) => ({ ...prev, edited: "", editedDirty: false }))}
              >
                সম্পাদনা বাতিল করে আবার তৈরি করুন
              </Button>
            ) : null}
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="চিঠির অবস্থা">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="শব্দ" value={wordCount} hint={wordCount > 350 ? "অনেক বেশি" : "উপযুক্ত"} />
              <StatBlock
                label="সম্পূর্ণতা"
                value={isReady ? "প্রস্তুত" : "অসম্পূর্ণ"}
                tone={isReady ? "brand" : "default"}
              />
            </div>
            <p className="mt-3 text-2xs leading-relaxed text-faint-foreground">
              চিঠি বেশি লম্বা হলে পড়া হয় না — ৩০০ শব্দের মধ্যে রাখার চেষ্টা করুন।
            </p>
          </ResultCard>

          <div
            id="cover-letter-sheet"
            className="rounded-xl border border-border bg-white p-6 text-slate-800 shadow-sm print:border-0 print:p-0 print:shadow-none"
          >
            <p className="text-xs text-slate-500">
              {[state.email, state.phone].filter(Boolean).join("  •  ") || "যোগাযোগের তথ্য"}
            </p>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-[0.82rem] leading-relaxed">
              {generated || "বাম দিকের ফরম পূরণ করলে এখানে চিঠি তৈরি হবে।"}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="cover-letter-sheet"
              filename="cover-letter"
              title={state.name ? `${state.name} — কভার লেটার` : "কভার লেটার"}
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady}
              onClick={async () => {
                const ok = await copyToClipboard(generated);
                if (ok) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                  toast.success("চিঠি কপি হয়েছে।");
                } else {
                  toast.error("কপি করা যায়নি।");
                }
              }}
            >
              <Copy aria-hidden />
              {copied ? "কপি হয়েছে" : "কপি"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady}
              onClick={() => {
                downloadText("cover-letter", generated);
                trackDownload(SLUG, { format: "txt" });
                toast.success("ফাইল ডাউনলোড হয়েছে।");
              }}
            >
              TXT
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={!isReady}
            onClick={() => {
              trackToolCompleted(SLUG, { tone: state.tone });
              toast.success("চিঠি প্রস্তুত। PDF নিয়ে পাঠান।");
            }}
          >
            <Pencil aria-hidden />
            চিঠি প্রস্তুত
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}