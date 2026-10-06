"use client";

/**
 * Study planner — পড়ার পরিকল্পনা.
 *
 * Spreads topics across the days that are actually left, respecting the number
 * of hours a student says they can study each day. The output is a day-by-day
 * table a student can print and tick off.
 */

import * as React from "react";
import { BookOpen, CalendarRange, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/card";
import { useToolState } from "@/lib/use-tool-state";
import { daysBetween, formatDateBN, formatDateWithDayBN, todayInputValue } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { parseNumber, round2, uid } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "study-planner";

type Subject = "বাংলা" | "ইংরেজি" | "গণিত" | "বিজ্ঞান" | "ইতিহাস" | "পরিচিতি";

interface Topic {
  id: string;
  name: string;
  subject: Subject;
  weight: string;
}

interface State {
  examDate: string;
  hoursPerDay: string;
  breakMinutes: string;
  topics: Topic[];
}

const DEFAULT_STATE: State = {
  examDate: "",
  hoursPerDay: "3",
  breakMinutes: "10",
  topics: [
    { id: "t1", name: "অধ্যায় ১", subject: "বাংলা", weight: "2" },
    { id: "t2", name: "অধ্যায় ২", subject: "বাংলা", weight: "2" },
    { id: "t3", name: "অধ্যায় ৩", subject: "বাংলা", weight: "1" },
  ],
};

const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: "বাংলা", label: "বাংলা" },
  { value: "ইংরেজি", label: "ইংরেজি" },
  { value: "গণিত", label: "গণিত" },
  { value: "বিজ্ঞান", label: "বিজ্ঞান" },
  { value: "ইতিহাস", label: "ইতিহাস" },
  { value: "পরিচিতি", label: "পরিচিতি" },
];

interface Slot {
  date: string;
  topics: { topic: Topic; hours: number }[];
}

function buildSlots(topics: Topic[], days: number, hoursPerDay: number): Slot[] {
  // Higher weight repeats more often, so heavy topics come up more often.
  // Higher weight repeats more often, so heavy topics come up more often.
  const pool: { topic: Topic; weight: number }[] = topics
    .flatMap((topic) => {
      const weight = Math.max(0.5, parseNumber(topic.weight) || 1);
      const count = Math.max(1, Math.round(weight));
      return Array.from({ length: count }, (): { topic: Topic; weight: number } => ({ topic, weight }));
    })
    .sort((a, b) => b.weight - a.weight);


  const slots: Slot[] = [];
  let cursor = 0;
  const start = new Date();

  for (let day = 0; day < Math.max(1, days) && pool.length > 0; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    // One heavy topic per session; a session lasts `hoursPerDay`.
    slots.push({
      date: dateKey,
      topics: [{ topic: pool[cursor % pool.length].topic, hours: round2(hoursPerDay) }],
    });
    cursor += 1;
  }

  return slots;
}

export function StudyPlanner() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);

  const daysLeft = state.examDate ? Math.max(1, daysBetween(new Date(), state.examDate)) : 0;
  const hoursPerDay = Math.max(0.5, parseNumber(state.hoursPerDay) || 3);
  const totalHours = round2(hoursPerDay * daysLeft);
  const totalWeight = round2(state.topics.reduce((sum, topic) => sum + Math.max(0.5, parseNumber(topic.weight) || 1), 0));
  const isReady = state.topics.length > 0 && daysLeft > 0;

  const slots = React.useMemo(
    () => (isReady ? buildSlots(state.topics, Math.min(daysLeft, 14), hoursPerDay) : []),
    [state.topics, daysLeft, hoursPerDay, isReady],
  );

  function patchTopic(id: string, next: Partial<Topic>) {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => (topic.id === id ? { ...topic, ...next } : topic)),
    }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="পরীক্ষা ও সময়"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="পরীক্ষার তারিখ" htmlFor="sp-date">
                <Input
                  id="sp-date"
                  type="date"
                  value={state.examDate}
                  min={todayInputValue()}
                  onChange={(event) => setState((prev) => ({ ...prev, examDate: event.target.value }))}
                />
              </Field>
              <Field
                label={`দিনে ${hoursPerDay} ঘণ্টা`}
                htmlFor="sp-hours"
                hint="স্কুল/কলেজ ছাড়া বাকি সময়"
              >
                <input
                  id="sp-hours"
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={hoursPerDay}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, hoursPerDay: event.target.value }))
                  }
                  className="w-full accent-primary"
                />
              </Field>
              <Field label="বিরতি (মিনিট)" htmlFor="sp-break" className="sm:col-span-2">
                <Select
                  id="sp-break"
                  value={state.breakMinutes}
                  onValueChange={(value) => setState((prev) => ({ ...prev, breakMinutes: value }))}
                  options={[
                    { value: "5", label: "৫ মিনিট" },
                    { value: "10", label: "১০ মিনিট" },
                    { value: "15", label: "১৫ মিনিট" },
                    { value: "20", label: "২০ মিনিট" },
                  ]}
                />
              </Field>
            </div>
            {state.examDate ? (
              <p className="mt-3 text-2xs text-faint-foreground">
                {daysLeft} দিন বাকি · মোট {totalHours} ঘণ্টা পড়ার সময় আছে
              </p>
            ) : null}
          </ToolPanel>

          <ToolPanel
            title="অধ্যায় ও বিষয়"
            description="গুরুত্বপূর্ণ অধ্যায়ে বেশি ওজন দিন (১ থেকে ৫)।"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    topics: [
                      ...prev.topics,
                      { id: uid("topic"), name: "", subject: "বাংলা", weight: "1" },
                    ],
                  }))
                }
              >
                <Plus aria-hidden />
                অধ্যায় যোগ
              </Button>
            }
          >
            {state.topics.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
                প্রথম অধ্যায়টি যোগ করুন।
              </p>
            ) : (
              <ul className="space-y-2">
                {state.topics.map((topic) => (
                  <li
                    key={topic.id}
                    className="grid grid-cols-[1fr_8rem_5rem_2rem] items-end gap-2 rounded-lg border border-border p-3"
                  >
                    <Field label={topic.id === state.topics[0]?.id ? "অধ্যায়" : undefined} htmlFor={`sp-topic-${topic.id}`}>
                      <Input
                        id={`sp-topic-${topic.id}`}
                        value={topic.name}
                        onChange={(event) => patchTopic(topic.id, { name: event.target.value })}
                        placeholder="অধ্যায় ১"
                      />
                    </Field>
                    <Field label={topic.id === state.topics[0]?.id ? "বিষয়" : undefined} htmlFor={`sp-subject-${topic.id}`}>
                      <Select
                        id={`sp-subject-${topic.id}`}
                        value={topic.subject}
                        onValueChange={(value) => patchTopic(topic.id, { subject: value as Subject })}
                        options={SUBJECT_OPTIONS}
                        ariaLabel="বিষয়"
                      />
                    </Field>
                    <Field label={topic.id === state.topics[0]?.id ? "ওজন" : undefined} htmlFor={`sp-weight-${topic.id}`}>
                      <Input
                        id={`sp-weight-${topic.id}`}
                        inputMode="numeric"
                        value={topic.weight}
                        onChange={(event) => patchTopic(topic.id, { weight: event.target.value })}
                      />
                    </Field>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="অধ্যায় মুছে ফেলুন"
                      onClick={() =>
                        setState((prev) => ({ ...prev, topics: prev.topics.filter((row) => row.id !== topic.id) }))
                      }
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="study-sheet">
            <ResultCard title="পরিকল্পনার সারাংশ">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="দিন বাকি" value={daysLeft || "—"} tone="brand" />
                <StatBlock label="মোট ঘণ্টা" value={`${totalHours}`} />
                <StatBlock label="অধ্যায়" value={state.topics.length} />
                <StatBlock label="ওজন" value={`${totalWeight}`} />
              </div>
            </ResultCard>

            {slots.length > 0 ? (
              <div className="mt-3 rounded-xl border border-border bg-white p-5 text-slate-800 shadow-sm">
                <h3 className="text-sm font-bold">দৈনিক পড়ার সূচি</h3>
                <ol className="mt-3 space-y-2">
                  {slots.map((slot, index) => (
                    <li key={`${slot.date}-${index}`} className="border-b border-slate-100 pb-2 last:border-0">
                      <p className="text-2xs font-semibold uppercase tracking-wide text-slate-500">
                        দিন {index + 1} · {formatDateWithDayBN(slot.date)}
                      </p>
                      <ul className="mt-0.5 space-y-0.5">
                        {slot.topics.map((entry, row) => (
                          <li key={row} className="text-xs leading-relaxed text-slate-700">
                            ☐ {entry.topic.subject} — {entry.topic.name || "অধ্যায়"} ({entry.hours} ঘণ্টা)
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          {slots.length > 0 ? (
            <ul className="space-y-1.5">
              {slots.slice(0, 5).map((slot, index) => (
                <li key={`chip-${index}`} className="flex items-center gap-2 text-xs">
                  <CalendarRange className="size-3.5 text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">{formatDateBN(slot.date, { short: true })}</span>
                  <Badge tone="brand">{slot.topics[0]?.topic.subject}</Badge>
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {slot.topics[0]?.topic.name || "অধ্যায়"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
              পরীক্ষার তারিখ ও অধ্যায় যোগ করলে দৈনিক সূচি তৈরি হবে।
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="study-sheet"
              filename="study-plan"
              title="পড়ার পরিকল্পনা"
              subtitle={state.examDate ? `পরীক্ষা: ${formatDateBN(state.examDate)}` : undefined}
              disabled={!isReady}
            />
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { days: daysLeft, topics: state.topics.length });
                toast.success("পড়ার পরিকল্পনা প্রস্তুত।");
              }}
            >
              <BookOpen aria-hidden />
              পরিকল্পনা প্রস্তুত
            </Button>
          </div>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}