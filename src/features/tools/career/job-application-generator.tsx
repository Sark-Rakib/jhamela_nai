"use client";

/**
 * Job application generator.
 *
 * Produces two things a Bangladeshi job seeker actually needs: a short, polite
 * message for the hiring channel they used (email / WhatsApp / form text) and a
 * document checklist so nothing is forgotten.
 */

import * as React from "react";
import { Check, Copy, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { copyToClipboard, downloadText } from "@/lib/export";
import { trackDownload, trackToolCompleted } from "@/lib/analytics";
import { todayInputValue } from "@/lib/bn";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "job-application-generator";

type Channel = "email" | "whatsapp" | "form";

interface State {
  name: string;
  phone: string;
  email: string;
  channel: Channel;
  company: string;
  role: string;
  source: string;
  experience: string;
  notice: string;
  attachments: string[];
  deadline: string;
}

const DEFAULT_STATE: State = {
  name: "",
  phone: "",
  email: "",
  channel: "email",
  company: "",
  role: "",
  source: "",
  experience: "",
  notice: "",
  attachments: [
    "আবেদনপত্র (CV)",
    "পরিচয়পত্র ও শিক্ষাগত সার্টিফিকেট",
    "অভিজ্ঞতার সার্টিফিকেট",
    "ফটো (পাসপোর্ট সাইজ)",
  ],
  deadline: "",
};

const CHANNEL_OPTIONS = [
  { value: "email", label: "ইমেইল" },
  { value: "whatsapp", label: "হোয়াটসঅ্যাপ / মেসেজ" },
  { value: "form", label: "ওয়েবসাইট ফরম" },
];

export function buildApplication(state: State): string {
  const greeting = state.channel === "whatsapp" ? "আসসালামু আলাইকুম" : "সম্মানিত সম্মানচিত";

  if (state.channel === "email") {
    return [
      `বিষয়: আবেদনপত্র — ${state.role || "পদের নাম"}${state.company ? ` | ${state.company}` : ""}`,
      "",
      greeting + ",",
      "",
      `আপনার প্রতিষ্ঠানে ${state.role || "উপযুক্ত পদের"} জন্য আবেদন করতে আগ্রহী হয়ে নিচের অনুরোধটি জানাচ্ছি।${
        state.source ? ` আপনাদের ${state.source} থেকে এই সুযোগ সম্পর্কে জানতে পারেছি।` : ""
      }`,
      state.experience ? `সংশ্লিষ্ট ক্ষেত্রে আমার ${state.experience} বছরের অভিজ্ঞতা রয়েছে।` : "",
      state.notice ? `আমি চাকরি ছাড়ার ${state.notice} মেয়াদের নোটিশ দিতে পারব।` : "",
      "",
      "সংযুক্ত: " + (state.attachments.length > 0 ? state.attachments.join(", ") : "সিভি"),
      "",
      "বিনীত নিবেদক,",
      state.name || "আপনার নাম",
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  if (state.channel === "whatsapp") {
    return [
      greeting + ",",
      "",
      `আসসালামু আলাইকুম। আমি ${state.name || "[নাম]"}${
        state.experience ? `, সংশ্লিষ্ট ক্ষেত্রে ${state.experience} বছরের অভিজ্ঞ` : ""
      }।`,
      `${state.company || "আপনাদের প্রতিষ্ঠানে"} ${state.role || "পদের"} জন্য আবেদন করতে আগ্রহী। আপনার প্রয়োজন হলে আমার সিভি ও প্রমাণপত্র পাঠিয়ে দিচ্ছি।`,
      state.notice ? `আমি ${state.notice} মেয়াদের নোটিশ দিতে পারব।` : "",
      "",
      "ধন্যবাদ।",
      state.name ? `${state.name}\n${state.phone || ""}` : "",
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  return [
    "ফরমে লিখবেন:",
    "",
    `১. পূর্ণ নাম: ${state.name || "[নাম]"}`,
    `২. মোবাইল: ${state.phone || "[মোবাইল]"}`,
    `৩. ইমেইল: ${state.email || "[ইমেইল]"}`,
    `৪. শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা:\n${
      state.experience ? `   ${state.experience} বছরের প্রত্যন্ত অভিজ্ঞতা` : "   [অভিজ্ঞতার বিবরণ]"
    }`,
    `৫. সংযুক্ত নথি: ${state.attachments.join(", ") || "সিভি"}`,
    state.deadline ? `৬. জমার শেষ তারিখ: ${state.deadline}` : "",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function JobApplicationGenerator() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const [copied, setCopied] = React.useState(false);

  const message = buildApplication(state);
  const done = state.attachments.filter((item) => checked[item]).length;
  const progress = state.attachments.length > 0 ? (done / state.attachments.length) * 100 : 0;
  const isReady = Boolean(state.name && (state.role || state.company));

  function patch<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="আবেদনের তথ্য"
            description="যেখানে আবেদন করছেন সে অনুযায়ী বার্তাটি নিজে থেকে সাজিয়ে দেব।"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="আপনার নাম" required htmlFor="ja-name">
                <Input
                  id="ja-name"
                  value={state.name}
                  onChange={(event) => patch("name", event.target.value)}
                  placeholder="যেমন: রহিম উদ্দিন"
                />
              </Field>
              <Field label="মোবাইল" htmlFor="ja-phone">
                <Input
                  id="ja-phone"
                  value={state.phone}
                  onChange={(event) => patch("phone", event.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </Field>
              <Field label="ইমেইল" htmlFor="ja-email">
                <Input
                  id="ja-email"
                  type="email"
                  value={state.email}
                  onChange={(event) => patch("email", event.target.value)}
                  placeholder="name@example.com"
                />
              </Field>
              <Field label="কোথায় আবেদন" htmlFor="ja-channel">
                <div className="flex gap-2">
                  {CHANNEL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={state.channel === option.value}
                      onClick={() => patch("channel", option.value as Channel)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        state.channel === option.value
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="প্রতিষ্ঠান" htmlFor="ja-company">
                <Input
                  id="ja-company"
                  value={state.company}
                  onChange={(event) => patch("company", event.target.value)}
                  placeholder="যেমন: অথেনা টেক"
                />
              </Field>
              <Field label="পদের নাম" htmlFor="ja-role">
                <Input
                  id="ja-role"
                  value={state.role}
                  onChange={(event) => patch("role", event.target.value)}
                  placeholder="যেমন: ফ্রন্টএন্ড ডেভেলপার"
                />
              </Field>
              <Field label="অভিজ্ঞতা (বছর)" htmlFor="ja-exp">
                <Input
                  id="ja-exp"
                  value={state.experience}
                  inputMode="numeric"
                  onChange={(event) => patch("experience", event.target.value)}
                  placeholder="যেমন: ২"
                />
              </Field>
              <Field label="চাকরি ছাড়ার নোটিশ" htmlFor="ja-notice" hint="ঐচ্ছিক">
                <Input
                  id="ja-notice"
                  value={state.notice}
                  onChange={(event) => patch("notice", event.target.value)}
                  placeholder="যেমন: ১ মাস"
                />
              </Field>
              <Field label="সুযোগ কোথায় পেয়েছেন" htmlFor="ja-source" className="sm:col-span-2">
                <Input
                  id="ja-source"
                  value={state.source}
                  onChange={(event) => patch("source", event.target.value)}
                  placeholder="যেমন: ফেসবুক গ্রুপ, বিজনেস সংবাদপত্র"
                />
              </Field>
              <Field label="আবেদনের শেষ তারিখ" htmlFor="ja-deadline" hint="ঐচ্ছিক">
                <Input
                  id="ja-deadline"
                  type="date"
                  value={state.deadline}
                  min={todayInputValue()}
                  onChange={(event) => patch("deadline", event.target.value)}
                />
              </Field>
            </div>
          </ToolPanel>

          <ToolPanel title="ফাইল চেকলিস্ট" description="প্রতিটি ফাইল প্রস্তুত আছে কি না দেখে নিন।">
            <ul className="space-y-2">
              {state.attachments.map((item) => {
                const isChecked = Boolean(checked[item]);
                return (
                  <li key={item}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        isChecked ? "border-primary/40 bg-primary-soft/50" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-primary"
                        checked={isChecked}
                        onChange={(event) =>
                          setChecked((prev) => ({ ...prev, [item]: event.target.checked }))
                        }
                      />
                      <span className={isChecked ? "text-muted-foreground line-through" : "text-foreground"}>
                        {item}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 space-y-1.5">
              <Progress value={progress} label="ফাইল প্রস্তুতির অগ্রগতি" />
              <p className="text-2xs text-faint-foreground">
                {done} / {state.attachments.length} টি ফাইল প্রস্তুত
              </p>
            </div>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="বার্তার ধরন">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock
                label="পদ"
                value={state.role || "—"}
              />
              <StatBlock label="ফাইল" value={`${done}/${state.attachments.length}`} tone={done === state.attachments.length ? "brand" : "default"} />
            </div>
          </ResultCard>

          <div
            id="application-sheet"
            className="rounded-xl border border-border bg-white p-6 text-slate-800 shadow-sm print:border-0 print:p-0 print:shadow-none"
          >
            <pre className="whitespace-pre-wrap font-sans text-[0.82rem] leading-relaxed">
              {message || "বাম দিকের ফরম পূরণ করলে এখানে বার্তা তৈরি হবে।"}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="application-sheet"
              filename="job-application"
              title={state.role ? `${state.role} — আবেদনপত্র` : "আবেদনপত্র"}
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady}
              onClick={async () => {
                const ok = await copyToClipboard(message);
                if (ok) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                  toast.success("বার্তা কপি হয়েছে।");
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
                downloadText("job-application", message);
                trackDownload(SLUG, { channel: state.channel });
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
              trackToolCompleted(SLUG, { channel: state.channel });
              toast.success("আবেদনপত্র প্রস্তুত।");
            }}
          >
            <Check aria-hidden />
            আবেদন সম্পূর্ণ
          </Button>
          <GuestHint slug={SLUG} />

          <p className="flex items-start gap-2 text-2xs leading-relaxed text-faint-foreground">
            <FileText className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            এখানে কোনো ছাপ বা ইউনিভার্সাল ঠিকানা যোগ হয়নি — নিজের তথ্য বসিয়ে নিন।
          </p>
        </div>
      }
    />
  );
}