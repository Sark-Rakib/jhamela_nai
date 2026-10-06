"use client";

/**
 * Assignment planner — অ্যাসাইনমেন্ট পরিকল্পনা.
 *
 * Breakdowns work backwards from the deadline: the tool reserves the last day
 * for review and submission, then splits the remaining days into research,
 * draft and polish phases per assignment.
 */

import * as React from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/card";
import { useToolState } from "@/lib/use-tool-state";
import { daysBetween, formatDateBN, todayInputValue } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { cn, uid } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "assignment-planner";

type Phase = "research" | "draft" | "polish";

interface Assignment {
  id: string;
  title: string;
  course: string;
  due: string;
  weight: string;
  notes: string;
  done: boolean;
}

interface State {
  assignments: Assignment[];
}

const DEFAULT_STATE: State = { assignments: [] };

const PHASES: { key: Phase; label: string; share: number }[] = [
  { key: "research", label: "তথ্য সংগ্রহ", share: 0.35 },
  { key: "draft", label: "খসড়া লেখা", share: 0.45 },
  { key: "polish", label: "সম্পাদনা ও জমা", share: 0.2 },
];

function phaseDate(start: number, days: number, share: number): string {
  const date = new Date();
  date.setDate(date.getDate() + start + Math.max(0, Math.floor(days * share) - 1));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function AssignmentPlanner() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [title, setTitle] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [due, setDue] = React.useState("");
  const [weight, setWeight] = React.useState("1");
  const [notes, setNotes] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  const today = todayInputValue();

  const upcoming = React.useMemo(
    () =>
      state.assignments
        .filter((item) => !item.done)
        .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999")),
    [state.assignments],
  );

  const stats = React.useMemo(() => {
    const open = state.assignments.filter((item) => !item.done);
    const overdue = open.filter((item) => item.due && item.due < today).length;
    const dueThisWeek = open.filter((item) => {
      const left = item.due ? daysBetween(new Date(), item.due) : -1;
      return left >= 0 && left <= 7;
    }).length;
    return { open: open.length, done: state.assignments.length - open.length, overdue, dueThisWeek };
  }, [state.assignments, today]);

  const visible = state.assignments.filter((item) => {
    if (filter === "open") return !item.done;
    if (filter === "done") return item.done;
    return true;
  });

  const isReady = state.assignments.length > 0;

  function add() {
    const label = title.trim();
    if (!label) return;
    setState((prev) => ({
      assignments: [
        ...prev.assignments,
        { id: uid("as"), title: label, course: course.trim(), due, weight, notes: notes.trim(), done: false },
      ],
    }));
    setTitle("");
    setCourse("");
    setNotes("");
    setWeight("1");
  }

  function patch(id: string, next: Partial<Assignment>) {
    setState((prev) => ({
      assignments: prev.assignments.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="নতুন অ্যাসাইনমেন্ট"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4">
              <Field label="অ্যাসাইনমেন্টের নাম" required htmlFor="ap-title">
                <Input
                  id="ap-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") add();
                  }}
                  placeholder="যেমন: ভূততত্ত্ব রিপোর্ট"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="কোর্স" htmlFor="ap-course">
                  <Input
                    id="ap-course"
                    value={course}
                    onChange={(event) => setCourse(event.target.value)}
                    placeholder="যেমন: ENV 201"
                  />
                </Field>
                <Field label="জমার তারিখ" htmlFor="ap-due">
                  <Input id="ap-due" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
                </Field>
                <Field label="গুরুত্ব (১–৫)" htmlFor="ap-weight" className="sm:col-span-2">
                  <Select
                    id="ap-weight"
                    value={weight}
                    onValueChange={setWeight}
                    options={[
                      { value: "1", label: "১ — সহজ" },
                      { value: "2", label: "২" },
                      { value: "3", label: "৩ — মাঝারি" },
                      { value: "4", label: "৪" },
                      { value: "5", label: "৫ — সবচেয়ে জরুরি" },
                    ]}
                  />
                </Field>
                <Field label="নোট" htmlFor="ap-notes" className="sm:col-span-2">
                  <Textarea
                    id="ap-notes"
                    rows={2}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="যা মনে রাখতে হবে"
                  />
                </Field>
              </div>
              <Button onClick={add} disabled={!title.trim()}>
                <Plus aria-hidden />
                যোগ করুন
              </Button>
            </div>
          </ToolPanel>

          <ToolPanel title="ফিল্টার">
            <Select
              value={filter}
              onValueChange={setFilter}
              options={[
                { value: "all", label: "সব" },
                { value: "open", label: "বাকি" },
                { value: "done", label: "জমা হয়ে গেছে" },
              ]}
              ariaLabel="ফিল্টার"
            />
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="assignment-sheet">
            <ResultCard title="অবস্থা">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock
                  label="বাকি"
                  value={stats.open}
                  tone="brand"
                  hint={`${stats.done} টি জমা`}
                />
                <StatBlock
                  label="মেয়াদ পেরিয়েছে"
                  value={stats.overdue}
                  tone={stats.overdue > 0 ? "danger" : "default"}
                  hint={`এই সপ্তাহে ${stats.dueThisWeek}`}
                />
              </div>
              {upcoming.length > 0 ? (
                <p className="mt-3 text-2xs leading-relaxed text-muted-foreground">
                  পরবর্তী জমা: {upcoming[0]?.title} —{" "}
                  {upcoming[0]?.due ? formatDateBN(upcoming[0].due, { short: true }) : "তারিখ নেই"}
                </p>
              ) : null}
            </ResultCard>
          </div>

          <ToolPanel title="অ্যাসাইনমেন্ট">
            {visible.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-8 text-center text-sm text-muted-foreground">
                {state.assignments.length === 0
                  ? "প্রথম অ্যাসাইনমেন্টটি যোগ করুন।"
                  : "এই ফিল্টারে কিছু নেই।"}
              </p>
            ) : (
              <ul className="space-y-3">
                {visible.map((item) => {
                  const left = item.due ? daysBetween(new Date(), item.due) : null;
                  const late = left !== null && left < 0 && !item.done;
                  const plan = left !== null && left > 0 && !item.done
                    ? PHASES.map((phase) => ({
                        ...phase,
                        date: phaseDate(0, left, phase.share * (Number(weightFactor(item.weight)) / 5 || 1)),
                      }))
                    : null;
                  return (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-4",
                        item.done ? "border-border bg-surface-muted" : late ? "border-destructive/40" : "border-border",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          id={`ap-${item.id}`}
                          type="checkbox"
                          className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
                          checked={item.done}
                          onChange={(event) => patch(item.id, { done: event.target.checked })}
                        />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`ap-${item.id}`}
                            className={cn("block text-sm font-medium", item.done && "text-muted-foreground line-through")}
                          >
                            {item.title}
                          </label>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {item.course ? <Badge tone="neutral">{item.course}</Badge> : null}
                            <Badge tone={late ? "danger" : "brand"}>
                              {left === null ? "তারিখ নেই" : left < 0 ? "মেয়াদ পেরিয়েছে" : `${left} দিন বাকি`}
                            </Badge>
                            <Badge tone="accent">গুরুত্ব {weightFactor(item.weight)}</Badge>
                          </div>
                          {item.notes ? (
                            <p className="mt-1.5 text-2xs leading-relaxed text-muted-foreground">{item.notes}</p>
                          ) : null}
                          {plan ? (
                            <ol className="mt-2 space-y-1 border-t border-border pt-2">
                              {plan.map((phase) => (
                                <li key={phase.key} className="flex items-center justify-between text-2xs">
                                  <span className="text-muted-foreground">{phase.label}</span>
                                  <span className="tabular-nums text-faint-foreground">
                                    {formatDateBN(phase.date, { short: true })}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          ) : null}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${item.title} মুছে ফেলুন`}
                          onClick={() =>
                            setState((prev) => ({
                              assignments: prev.assignments.filter((row) => row.id !== item.id),
                            }))
                          }
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </ToolPanel>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="assignment-sheet"
              filename="assignment-plan"
              title="অ্যাসাইনমেন্ট পরিকল্পনা"
              subtitle={formatDateBN(new Date())}
              disabled={!isReady}
            />
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { assignments: state.assignments.length });
                toast.success("অ্যাসাইনমেন্ট পরিকল্পনা প্রস্তুত।");
              }}
            >
              <CheckCircle2 aria-hidden />
              পরিকল্পনা প্রস্তুত
            </Button>
          </div>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}

function weightFactor(weight: string): number {
  const value = Number(weight);
  return Number.isFinite(value) && value >= 1 ? Math.min(5, Math.round(value)) : 1;
}