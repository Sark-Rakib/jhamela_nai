"use client";

/**
 * Exam countdown — পরীক্ষার কাউন্টডাউন.
 *
 * Shows the days that actually matter to a student: today, this week, and a
 * readiness split per exam. No timer widget gimmick — just an honest date
 * calculation with a study plan suggestion attached.
 */

import * as React from "react";
import { AlarmClock, CalendarDays, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/card";
import { useToolState } from "@/lib/use-tool-state";
import { daysBetween, formatDateBN, formatDateWithDayBN, todayInputValue } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { cn, uid } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "exam-countdown";

interface Exam {
  id: string;
  subject: string;
  date: string;
  time: string;
  notes: string;
}

interface State {
  exams: Exam[];
}

const DEFAULT_STATE: State = { exams: [] };

function readiness(left: number): { label: string; tone: "danger" | "accent" | "brand" | "neutral" } {
  if (left < 0) return { label: "পরীক্ষা হয়ে গেছে", tone: "neutral" };
  if (left === 0) return { label: "আজ পরীক্ষা!", tone: "danger" };
  if (left <= 3) return { label: "এই সপ্তাহে", tone: "danger" };
  if (left <= 10) return { label: "প্রস্তুতির সময়", tone: "accent" };
  return { label: "সময় আছে", tone: "brand" };
}

export function ExamCountdown() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const today = todayInputValue();

  const sorted = React.useMemo(
    () =>
      [...state.exams].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      }),
    [state.exams],
  );

  const next = sorted.find((exam) => !exam.date || exam.date >= today);
  const daysToNext = next?.date ? daysBetween(new Date(), next.date) : null;
  const thisWeek = state.exams.filter((exam) => {
    const left = exam.date ? daysBetween(new Date(), exam.date) : -1;
    return left >= 0 && left <= 7;
  }).length;
  const isReady = state.exams.length > 0;

  function add() {
    setState((prev) => ({
      exams: [...prev.exams, { id: uid("exam"), subject: "", date: today, time: "", notes: "" }],
    }));
  }

  function patch(id: string, next: Partial<Exam>) {
    setState((prev) => ({ exams: prev.exams.map((exam) => (exam.id === id ? { ...exam, ...next } : exam)) }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="পরীক্ষার তালিকা"
            onReset={reset}
            actions={
              <>
                <SaveButton slug={SLUG} state={state} disabled={!isReady} />
                <Button variant="outline" size="sm" onClick={add}>
                  <Plus aria-hidden />
                  পরীক্ষা যোগ
                </Button>
              </>
            }
          >
            {state.exams.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-8 text-center">
                <CalendarDays className="mx-auto size-5 text-muted-foreground" aria-hidden />
                <p className="mt-2 text-sm text-muted-foreground">
                  এখনো পরীক্ষা যোগ হয়নি। তারিখ দিলেই বাকি দিন গোনা শুরু হবে।
                </p>
                <Button size="sm" className="mt-3" onClick={add}>
                  প্রথম পরীক্ষা যোগ করুন
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {state.exams.map((exam, index) => (
                  <li key={exam.id} className="rounded-xl border border-border p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-faint-foreground">
                        পরীক্ষা {index + 1}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="পরীক্ষা মুছে ফেলুন"
                        onClick={() =>
                          setState((prev) => ({ exams: prev.exams.filter((row) => row.id !== exam.id) }))
                        }
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="বিষয়" htmlFor={`ex-subject-${exam.id}`}>
                        <Input
                          id={`ex-subject-${exam.id}`}
                          value={exam.subject}
                          onChange={(event) => patch(exam.id, { subject: event.target.value })}
                          placeholder="যেমন: উচ্চতর গণিত"
                        />
                      </Field>
                      <Field label="তারিখ" htmlFor={`ex-date-${exam.id}`}>
                        <Input
                          id={`ex-date-${exam.id}`}
                          type="date"
                          value={exam.date}
                          onChange={(event) => patch(exam.id, { date: event.target.value })}
                        />
                      </Field>
                      <Field label="সময়" htmlFor={`ex-time-${exam.id}`} hint="ঐচ্ছিক">
                        <Input
                          id={`ex-time-${exam.id}`}
                          type="time"
                          value={exam.time}
                          onChange={(event) => patch(exam.id, { time: event.target.value })}
                        />
                      </Field>
                      <Field label="নোট" htmlFor={`ex-notes-${exam.id}`} hint="ঐচ্ছিক">
                        <Input
                          id={`ex-notes-${exam.id}`}
                          value={exam.notes}
                          onChange={(event) => patch(exam.id, { notes: event.target.value })}
                          placeholder="যেমন: ৫ অধ্যায়"
                        />
                      </Field>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="exam-sheet">
            <ResultCard title="পরবর্তী পরীক্ষা">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock
                  label="বাকি"
                  value={daysToNext === null ? "—" : daysToNext === 0 ? "আজ" : `${daysToNext} দিন`}
                  tone={daysToNext !== null && daysToNext <= 3 ? "danger" : "brand"}
                  hint={next?.subject || "তারিখ দিন"}
                />
                <StatBlock label="এই সপ্তাহে" value={`${thisWeek} টি`} />
              </div>

              {next ? (
                <div className="mt-4 rounded-xl border border-border bg-surface-muted p-4">
                  <p className="text-sm font-semibold text-foreground">{next.subject || "বিষয় লিখুন"}</p>
                  <p className="mt-0.5 text-2xs text-muted-foreground">
                    {next.date ? formatDateWithDayBN(next.date) : "তারিখ নেই"}
                    {next.time ? ` · ${next.time}` : ""}
                  </p>
                  {daysToNext !== null && daysToNext >= 0 ? (
                    <p className="mt-2 text-2xs leading-relaxed text-muted-foreground">
                      {daysToNext === 0
                        ? "আজ পরীক্ষা — সকালে শেষ অনুশীলনটি করে নিন।"
                        : `দিনে ${Math.max(1, Math.ceil(3 + daysToNext / 2))} ঘণ্টা পড়লে ${Math.max(1, Math.ceil((daysToNext * 3) / 2))} বসায় শেষ হবে।`}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {state.exams.length > 0 ? (
                <ul className="mt-4 space-y-1.5">
                  {sorted.slice(0, 10).map((exam) => {
                    const left = exam.date ? daysBetween(new Date(), exam.date) : null;
                    const status = left === null ? null : readiness(left);
                    return (
                      <li key={exam.id} className="flex items-center gap-2 text-xs">
                        <span className="min-w-0 flex-1 truncate text-foreground">{exam.subject || "—"}</span>
                        <span className="shrink-0 text-2xs text-faint-foreground">
                          {exam.date ? formatDateBN(exam.date, { short: true }) : "—"}
                        </span>
                        {status ? <Badge tone={status.tone}>{status.label}</Badge> : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </ResultCard>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="exam-sheet"
              filename="exam-schedule"
              title="পরীক্ষার সূচি"
              subtitle={formatDateBN(new Date())}
              disabled={!isReady}
            />
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { exams: state.exams.length });
                toast.success("পরীক্ষার সূচি প্রস্তুত।");
              }}
            >
              <AlarmClock aria-hidden />
              সূচি প্রস্তুত
            </Button>
          </div>
          <p className={cn("text-2xs leading-relaxed text-faint-foreground")}>
            দিনের হিসাব দেওয়া অফিসিয়াল পরীক্ষার সূচির দিন। রিজাল্ট বা সিলেবাস পরিবর্তন হলে তারিখটি আপডেট করে নিন।
          </p>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}