"use client";

/**
 * To-do planner — কাজের তালিকা.
 *
 * Sorting is by what actually matters in the morning: overdue first, then today,
 * then the rest. Everything stays in the browser until someone signs in.
 */

import * as React from "react";
import { AlarmClock, Check, Circle, Plus, Trash2 } from "lucide-react";
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

const SLUG = "to-do-planner";

type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  notes: string;
  due: string;
  priority: Priority;
  done: boolean;
}

interface State {
  tasks: Task[];
}

const DEFAULT_STATE: State = { tasks: [] };

const PRIORITY_OPTIONS = [
  { value: "high", label: "জরুরি" },
  { value: "medium", label: "সাধারণ" },
  { value: "low", label: "পরে করব" },
];

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "জরুরি",
  medium: "সাধারণ",
  low: "পরে",
};

export function ToDoPlanner() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [due, setDue] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("medium");

  const today = todayInputValue();

  const { open, done, overdue, todayCount } = React.useMemo(() => {
    const openTasks = state.tasks.filter((task) => !task.done);
    return {
      open: openTasks.length,
      done: state.tasks.length - openTasks.length,
      overdue: openTasks.filter((task) => task.due && task.due < today).length,
      todayCount: openTasks.filter((task) => task.due === today).length,
    };
  }, [state.tasks, today]);

  const sorted = React.useMemo(() => {
    const weight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return [...state.tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const aOver = a.due && a.due < today ? 0 : 1;
      const bOver = b.due && b.due < today ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      if (a.due !== b.due) return (a.due || "9999").localeCompare(b.due || "9999");
      return weight[a.priority] - weight[b.priority];
    });
  }, [state.tasks, today]);

  function add() {
    const label = title.trim();
    if (!label) return;
    setState((prev) => ({
      tasks: [
        ...prev.tasks,
        { id: uid("task"), title: label, notes: notes.trim(), due, priority, done: false },
      ],
    }));
    setTitle("");
    setNotes("");
    setDue("");
    setPriority("medium");
  }

  function patch(id: string, next: Partial<Task>) {
    setState((prev) => ({
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...next } : task)),
    }));
  }

  const isReady = state.tasks.length > 0;

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="নতুন কাজ"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4">
              <Field label="কাজ কী" required htmlFor="td-title">
                <Input
                  id="td-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") add();
                  }}
                  placeholder="যেমন: বিদ্যুৎ বিল দিতে হবে"
                />
              </Field>
              <Field label="বিস্তারিত" htmlFor="td-notes">
                <Textarea
                  id="td-notes"
                  rows={2}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="ঐচ্ছিক"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="শেষ তারিখ" htmlFor="td-due">
                  <Input id="td-due" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
                </Field>
                <Field label="অগ্রাধিকার" htmlFor="td-priority">
                  <Select
                    id="td-priority"
                    value={priority}
                    onValueChange={(value) => setPriority(value as Priority)}
                    options={PRIORITY_OPTIONS}
                  />
                </Field>
              </div>
              <Button onClick={add} disabled={!title.trim()}>
                <Plus aria-hidden />
                কাজ যোগ করুন
              </Button>
            </div>
          </ToolPanel>

          <ToolPanel title="আজ কী করতে হবে">
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>• মেয়াদোত্তীর্ণ কাজগুলো আগে দেখুন — সেগুলো আগে ধরুন।</li>
              <li>• একসাথে তিনটার বেশি জরুরি কাজ রাখলে কোনোটিই শেষ হয় না।</li>
              <li>• কাজ শেষ হলেই টিক দিন, তাহলে সারাংশ সঠিক থাকে।</li>
            </ul>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="todo-sheet">
            <ResultCard title="আজকের অবস্থা">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock
                  label="বাকি"
                  value={open}
                  tone={open > 0 ? "brand" : "default"}
                  hint={`${done} টি শেষ`}
                />
                <StatBlock
                  label="মেয়াদ পেরিয়েছে"
                  value={overdue}
                  tone={overdue > 0 ? "danger" : "default"}
                  hint={`আজ ${todayCount} টি`}
                />
              </div>

              {state.tasks.length > 0 ? (
                <ul className="mt-4 space-y-1.5">
                  {sorted
                    .filter((task) => !task.done)
                    .slice(0, 8)
                    .map((task) => {
                      const late = Boolean(task.due && task.due < today);
                      return (
                        <li key={task.id} className="flex items-start gap-2 text-xs">
                          <Circle className="mt-0.5 size-3 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className={late ? "text-destructive" : "text-foreground"}>{task.title}</span>
                            {task.due ? (
                              <span className="ml-1 text-2xs text-faint-foreground">
                                ({formatDateBN(task.due, { short: true })})
                              </span>
                            ) : null}
                          </span>
                          <span className="shrink-0 text-2xs text-faint-foreground">{PRIORITY_LABEL[task.priority]}</span>
                        </li>
                      );
                    })}
                </ul>
              ) : null}
            </ResultCard>
          </div>

          <ToolPanel title="সব কাজ">
            {state.tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-8 text-center text-sm text-muted-foreground">
                এখনো কোনো কাজ যোগ হয়নি। উপরের ঘরে প্রথম কাজটি লিখুন।
              </p>
            ) : (
              <ul className="space-y-2">
                {sorted.map((task) => {
                  const late = Boolean(task.due && task.due < today) && !task.done;
                  return (
                    <li
                      key={task.id}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 transition-colors",
                        task.done ? "border-border bg-surface-muted" : late ? "border-destructive/40" : "border-border",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          id={`td-${task.id}`}
                          type="checkbox"
                          className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
                          checked={task.done}
                          onChange={(event) => patch(task.id, { done: event.target.checked })}
                        />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`td-${task.id}`}
                            className={cn(
                              "block text-sm",
                              task.done && "text-muted-foreground line-through",
                              late && "text-destructive",
                            )}
                          >
                            {task.title}
                          </label>
                          {task.notes ? (
                            <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground">{task.notes}</p>
                          ) : null}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {task.due ? (
                              <Badge tone={late ? "danger" : "neutral"}>
                                {late
                                  ? `${Math.abs(daysBetween(new Date(), task.due))} দিন দেরি`
                                  : formatDateBN(task.due, { short: true })}
                              </Badge>
                            ) : null}
                            <Badge tone={task.priority === "high" ? "accent" : "neutral"}>
                              {PRIORITY_LABEL[task.priority]}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${task.title} মুছে ফেলুন`}
                          onClick={() =>
                            setState((prev) => ({ tasks: prev.tasks.filter((row) => row.id !== task.id) }))
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
              targetId="todo-sheet"
              filename="todo-list"
              title="কাজের তালিকা"
              subtitle={formatDateBN(new Date())}
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={done === 0}
              onClick={() => {
                setState((prev) => ({ tasks: prev.tasks.map((task) => ({ ...task, done: true })) }));
                toast.success("সব কাজ শেষ হয়ে গেছে।");
              }}
            >
              <AlarmClock aria-hidden />
              সব শেষ
            </Button>
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { open, done });
                toast.success("তালিকা সংরক্ষিত।");
              }}
            >
              <Check aria-hidden />
              সংরক্ষিত
            </Button>
          </div>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}