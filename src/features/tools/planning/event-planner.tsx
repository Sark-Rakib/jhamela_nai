"use client";

/**
 * Event planner — অনুষ্ঠানের খরচ ও তালিকা.
 *
 * Weddings, birthdays, holud, seminars — the cost shape is the same: a guest
 * count drives per-head cost, and a checklist is what actually stops anyone
 * from forgetting the sound system on the day.
 */

import * as React from "react";
import { Check, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Progress, Select } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { formatDateBN } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { formatBDT, parseNumber, round2, uid } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "event-planner";

type EventType = "বিয়ে" | "হোলুদ" | "জন্মদিন" | "সেমিনার" | "অন্যান্য";

interface CostLine {
  id: string;
  label: string;
  amount: string;
  perHead: boolean;
}

interface Task {
  id: string;
  label: string;
  done: boolean;
}

interface State {
  name: string;
  type: EventType;
  date: string;
  guests: string;
  venue: string;
  costs: CostLine[];
  tasks: Task[];
}

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "বিয়ে", label: "বিয়ে" },
  { value: "হোলুদ", label: "হোলুদ" },
  { value: "জন্মদিন", label: "জন্মদিন" },
  { value: "সেমিনার", label: "সেমিনার / কর্মশালা" },
  { value: "অন্যান্য", label: "অন্যান্য" },
];

const DEFAULT_TASKS: Task[] = [
  { id: "t-venue", label: "ভেন্যু ও তারিখ নিশ্চিত করা", done: false },
  { id: "t-guest", label: "অতিথির তালিকা তৈরি", done: false },
  { id: "t-catering", label: "ক্যাটারিং ও মেনু বুকিং", done: false },
  { id: "t-deco", label: "সাজসজ্জা ও ফুলের অর্ডার", done: false },
  { id: "t-photo", label: "ফটোগ্রাফার ও ভিডিও", done: false },
  { id: "t-sound", label: "সাউন্ড সিস্টেম ও মাইক", done: false },
  { id: "t-transport", label: "অতিথি ট্রান্সপোর্টের ব্যবস্থা", done: false },
  { id: "t-gift", label: "উপহার ও মিষ্টির অর্ডার", done: false },
  { id: "t-payment", label: "সব অগ্রিম পেমেন্ট দেওয়া", done: false },
];

const DEFAULT_STATE: State = {
  name: "",
  type: "বিয়ে",
  date: "",
  guests: "150",
  venue: "",
  costs: [
    { id: "c-cat", label: "ক্যাটারিং", amount: "0", perHead: true },
    { id: "c-deco", label: "সাজসজ্জা", amount: "0", perHead: false },
    { id: "c-sound", label: "সাউন্ড ও লাইট", amount: "0", perHead: false },
    { id: "c-photo", label: "ফটো ও ভিডিও", amount: "0", perHead: false },
    { id: "c-other", label: "অন্যান্য", amount: "0", perHead: false },
  ],
  tasks: DEFAULT_TASKS,
};

export function EventPlanner() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);

  const guests = Math.max(0, parseNumber(state.guests) || 0);
  const costRows = React.useMemo(
    () =>
      state.costs.map((line) => {
        const amount = round2(parseNumber(line.amount) * (line.perHead ? Math.max(1, guests) : 1));
        return { ...line, total: amount };
      }),
    [state.costs, guests],
  );
  const total = round2(costRows.reduce((sum, row) => sum + row.total, 0));
  const perGuest = guests > 0 ? round2(total / guests) : 0;
  const done = state.tasks.filter((task) => task.done).length;
  const progress = state.tasks.length > 0 ? (done / state.tasks.length) * 100 : 0;
  const isReady = Boolean(state.name) && total > 0;

  function patch(next: Partial<State>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="অনুষ্ঠানের তথ্য"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="অনুষ্ঠানের নাম" required htmlFor="ev-name">
                <Input
                  id="ev-name"
                  value={state.name}
                  onChange={(event) => patch({ name: event.target.value })}
                  placeholder="যেমন: রোহান ও নূসরাতের বিয়ে"
                />
              </Field>
              <Field label="ধরন" htmlFor="ev-type">
                <Select
                  id="ev-type"
                  value={state.type}
                  onValueChange={(value) => patch({ type: value as EventType })}
                  options={TYPE_OPTIONS}
                />
              </Field>
              <Field label="তারিখ" htmlFor="ev-date">
                <Input
                  id="ev-date"
                  type="date"
                  value={state.date}
                  onChange={(event) => patch({ date: event.target.value })}
                />
              </Field>
              <Field label="অতিথির সংখ্যা" htmlFor="ev-guests">
                <Input
                  id="ev-guests"
                  inputMode="numeric"
                  value={state.guests}
                  onChange={(event) => patch({ guests: event.target.value })}
                />
              </Field>
              <Field label="ভেন্যু" htmlFor="ev-venue" className="sm:col-span-2">
                <Input
                  id="ev-venue"
                  value={state.venue}
                  onChange={(event) => patch({ venue: event.target.value })}
                  placeholder="যেমন: ঢাকা রেস্টুরেন্ট, বসুন্ধরা"
                />
              </Field>
            </div>
            {state.date ? (
              <p className="mt-3 text-2xs text-faint-foreground">
                তারিখ: {formatDateBN(state.date, { short: true })}
              </p>
            ) : null}
          </ToolPanel>

          <ToolPanel
            title="খরচের তালিকা"
            description="জনপ্রতি হিসাবের খাতে টিক দিলে অতিথির সংখ্যা দিয়ে লেখা হবে।"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  patch({
                    costs: [
                      ...state.costs,
                      { id: uid("cost"), label: "", amount: "0", perHead: false },
                    ],
                  })
                }
              >
                <Plus aria-hidden />
                খাত যোগ
              </Button>
            }
          >
            <ul className="space-y-2">
              {state.costs.map((line) => {
                const row = costRows.find((item) => item.id === line.id);
                return (
                  <li key={line.id} className="grid grid-cols-[1fr_7rem_auto_2rem] items-end gap-2 rounded-lg border border-border p-2.5">
                    <Field label={line.id === state.costs[0]?.id ? "খাতের নাম" : undefined} htmlFor={`ev-cost-${line.id}`}>
                      <Input
                        id={`ev-cost-${line.id}`}
                        value={line.label}
                        onChange={(event) =>
                          patch({
                            costs: state.costs.map((item) =>
                              item.id === line.id ? { ...item, label: event.target.value } : item,
                            ),
                          })
                        }
                        placeholder="যেমন: ক্যাটারিং"
                      />
                    </Field>
                    <Field label={line.id === state.costs[0]?.id ? "পরিমাণ" : undefined} htmlFor={`ev-amount-${line.id}`}>
                      <Input
                        id={`ev-amount-${line.id}`}
                        inputMode="decimal"
                        value={line.amount}
                        onChange={(event) =>
                          patch({
                            costs: state.costs.map((item) =>
                              item.id === line.id ? { ...item, amount: event.target.value } : item,
                            ),
                          })
                        }
                      />
                    </Field>
                    <label className="flex h-9 items-center gap-1.5 whitespace-nowrap text-2xs text-muted-foreground">
                      <input
                        type="checkbox"
                        className="size-3.5 rounded border-border accent-primary"
                        checked={line.perHead}
                        onChange={(event) =>
                          patch({
                            costs: state.costs.map((item) =>
                              item.id === line.id ? { ...item, perHead: event.target.checked } : item,
                            ),
                          })
                        }
                      />
                      জনপ্রতি
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${line.label || "খাত"} মুছে ফেলুন`}
                      onClick={() => patch({ costs: state.costs.filter((item) => item.id !== line.id) })}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                    <p className="col-span-4 -mt-1 text-right text-2xs tabular-nums text-faint-foreground">
                      {line.perHead ? `${guests} জন × ${formatBDT(parseNumber(line.amount))} = ` : ""}
                      {formatBDT(row?.total ?? 0)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="event-sheet">
            <ResultCard title="খরচের সারাংশ">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="সর্বমোট" value={formatBDT(total)} tone="brand" />
                <StatBlock label="অতিথিপ্রতি" value={formatBDT(perGuest)} hint={`${guests} জন`} />
              </div>
              {total > 0 ? (
                <ul className="mt-4 space-y-2">
                  {costRows
                    .filter((row) => row.total > 0)
                    .map((row) => (
                      <li key={row.id} className="flex items-center justify-between text-2xs">
                        <span className="text-muted-foreground">{row.label || "খাত"}</span>
                        <span className="tabular-nums">
                          {formatBDT(row.total)} · {Math.round((row.total / total) * 100)}%
                        </span>
                      </li>
                    ))}
                </ul>
              ) : null}
            </ResultCard>

            <div className="mt-3 rounded-xl border border-border bg-white p-5 text-slate-800 shadow-sm">
              <h3 className="text-base font-bold">{state.name || "অনুষ্ঠান"}</h3>
              <p className="mt-1 text-2xs text-slate-600">
                {[state.type, state.date ? formatDateBN(state.date, { short: true }) : "", state.venue]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs">
                <Users className="size-3.5" aria-hidden />
                {guests} জন অতিথি
              </p>
              <p className="mt-3 border-t border-slate-200 pt-2 text-sm font-bold">
                মোট খরচ: {formatBDT(total)}
              </p>
              <p className="text-xs text-slate-600">অতিথিপ্রতি: {formatBDT(perGuest)}</p>
            </div>
          </div>

          <ToolPanel
            title="যা করতে হবে"
            description="দিনের আগে যা ভুলে যায় তা এখানে টিক দিয়ে রাখুন।"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  patch({
                    tasks: [
                      ...state.tasks,
                      { id: uid("task"), label: "", done: false },
                    ],
                  })
                }
              >
                <Plus aria-hidden />
                কাজ যোগ
              </Button>
            }
          >
            <div className="mb-3 space-y-1.5">
              <Progress value={progress} label="অনুষ্ঠানের প্রস্তুতি" />
              <p className="text-2xs text-faint-foreground">
                {done} / {state.tasks.length} টি কাজ শেষ
              </p>
            </div>
            <ul className="space-y-1.5">
              {state.tasks.map((task, index) => (
                <li key={task.id}>
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <input
                      id={`ev-task-${task.id}`}
                      type="checkbox"
                      className="size-4 shrink-0 rounded border-border accent-primary"
                      checked={task.done}
                      onChange={(event) =>
                        patch({
                          tasks: state.tasks.map((item) =>
                            item.id === task.id ? { ...item, done: event.target.checked } : item,
                          ),
                        })
                      }
                    />
                    <label
                      htmlFor={`ev-task-${task.id}`}
                      className={`flex-1 text-xs ${task.done ? "text-muted-foreground line-through" : ""}`}
                    >
                      {task.label || `কাজ ${index + 1}`}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${task.label || `কাজ ${index + 1}`} মুছে ফেলুন`}
                      onClick={() => patch({ tasks: state.tasks.filter((item) => item.id !== task.id) })}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ToolPanel>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="event-sheet"
              filename={state.name || "event-budget"}
              title={state.name || "অনুষ্ঠানের খরচ"}
              subtitle={state.date ? formatDateBN(state.date) : undefined}
              disabled={!isReady}
            />
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { guests, type: state.type });
                toast.success("অনুষ্ঠানের পরিকল্পনা প্রস্তুত।");
              }}
            >
              <Check aria-hidden />
              পরিকল্পনা সম্পন্ন
            </Button>
          </div>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}