"use client";

/**
 * Moving checklist — স্থানান্তরের চেকলিস্ট.
 *
 * Grouped by when it actually has to happen (৩০ দিন আগে → ভাগ্যনাশের দিন), with
 * the utility-transfer items Bangladesh households forget most: BERC meter,
 * gas cylinder, mobile banking address change, rent receipt.
 */

import * as React from "react";
import { Check, Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { daysBetween, formatDateBN, relativeDaysBN } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { uid } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "moving-checklist";

interface Task {
  id: string;
  label: string;
  done: boolean;
}

interface Group {
  id: string;
  title: string;
  hint: string;
  tasks: Task[];
}

interface State {
  fromCity: string;
  toCity: string;
  moveDate: string;
  groups: Group[];
}

function group(title: string, hint: string, labels: string[]): Group {
  return {
    id: uid("group"),
    title,
    hint,
    tasks: labels.map((label) => ({ id: uid("task"), label, done: false })),
  };
}

const DEFAULT_STATE: State = {
  fromCity: "",
  toCity: "",
  moveDate: "",
  groups: [
    group("৩০ দিন আগে", "যেসব কাজে অন্যের সাথে দেওদেওয়া লাগে", [
      "বাড়ি ভাড়া চুক্তিবন্ধ ও আগের বাড়ির মালিকের সাথে কথা",
      "নতুন বাড়িতে পানির লাইন ও বিদ্যুৎ আলাদা করানোর আবেদন",
      "বিদ্যুৎ বিল পরিষ্কার (আগের ঠিকানায়)",
      "গ্যাস সিলিণ্ডার ফেরত বা বদলানো",
      "মোবাইল ব্যাংকিং ও ই-ক্যাশ অ্যাপের ঠিকানা বদল",
      "সিম কার্ড ও বিট কো-এর নাম পরীক্ষা",
      "পরিবারের ডাক্তার-স্কুলের ঠিকানা হালনাগাদ",
      "গাড়ির লিসেন্স, ফিটনেস ও ইন্স্যুরেন্স নবায়ন",
    ]),

    group("৭ দিন আগে", "যা উঠিয়ে ফেলা হবে না", [
      "বিদ্যুৎ মিটার রিডিং ও ছবি তুলে রাখা",
      "পানির বিল ও গ্যাসের বিল পরিশোধ",
      "টিভি, ফ্রিজ, ওয়াশিং মেশিন খুলে দেখা",
      "ফার্নিচার ভাঙা-গোছানোর দায়িত্ব নির্ধারণ",
      "ব্যবহৃত মালামাল বেচা বা দেওয়ার তালিকা",
    ]),

    group("স্থানান্তরের দিন", "ট্রাকে ওঠানোর আগে শেষবার চেক", [
      "মূল ডকুমেন্ট আলাদা ব্যাগে (নাগরিকত্ব, সনদ, জমির কাগজ)",
      "ওষুধ ও প্রথম চিকিৎসা বক্স",
      "বিছানাপত্র, কম্বল ও বালিশ",
      "চাবি, মোবাইল চার্জার ও পাওয়ার ব্যাংক",
      "পানির বোতল, থালা-বাসন ও একদিনের খাবার",
    ]),

    group("পরিস্থান হলো", "প্রথম সপ্তাহে", [
      "নতুন ঠিকানায় গ্যাস সংযোগ চালু হয়েছে কি না",
      "নতুন ঠিকানার বিলের প্রথম পরিশোধ",
      "এলাকার প্রতিবেশীদের সাথে পরিচয়",
      "নিকটস্থ ফার্নিচার ও ইলেকট্রিকের নম্বর সংরক্ষণ",
    ]),
  ],
};

export function MovingChecklist() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);

  const allTasks = state.groups.flatMap((item) => item.tasks);
  const done = allTasks.filter((task) => task.done).length;
  const progress = allTasks.length > 0 ? (done / allTasks.length) * 100 : 0;
  const daysLeft = state.moveDate ? daysBetween(new Date(), state.moveDate) : null;
  const isReady = Boolean(state.fromCity || state.toCity || state.moveDate);

  function patch(next: Partial<State>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  function toggle(groupId: string, taskId: string) {
    patch({
      groups: state.groups.map((item) =>
        item.id === groupId
          ? {
              ...item,
              tasks: item.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task,
              ),
            }
          : item,
      ),
    });
  }

  function removeTask(groupId: string, taskId: string) {
    patch({
      groups: state.groups.map((item) =>
        item.id === groupId ? { ...item, tasks: item.tasks.filter((task) => task.id !== taskId) } : item,
      ),
    });
  }

  function addTask(groupId: string) {
    patch({
      groups: state.groups.map((item) =>
        item.id === groupId ? { ...item, tasks: [...item.tasks, { id: uid("task"), label: "", done: false }] } : item,
      ),
    });
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="যাত্রার তথ্য"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="যেখান থেকে" htmlFor="mv-from">
                <Input
                  id="mv-from"
                  value={state.fromCity}
                  onChange={(event) => patch({ fromCity: event.target.value })}
                  placeholder="যেমন: মিরপুর"
                />
              </Field>
              <Field label="যেখানে" htmlFor="mv-to">
                <Input
                  id="mv-to"
                  value={state.toCity}
                  onChange={(event) => patch({ toCity: event.target.value })}
                  placeholder="যেমন: বসুন্ধরা"
                />
              </Field>
              <Field label="স্থানান্তরের তারিখ" htmlFor="mv-date" className="sm:col-span-2">
                <Input
                  id="mv-date"
                  type="date"
                  value={state.moveDate}
                  onChange={(event) => patch({ moveDate: event.target.value })}
                />
              </Field>
            </div>
          </ToolPanel>

          {state.groups.map((item) => {
            const groupDone = item.tasks.filter((task) => task.done).length;
            return (
              <ToolPanel
                key={item.id}
                title={item.title}
                description={item.hint}
                actions={
                  <Button variant="outline" size="sm" onClick={() => addTask(item.id)}>
                    <Plus aria-hidden />
                    কাজ যোগ
                  </Button>
                }
              >
                <p className="mb-3 text-2xs text-faint-foreground">
                  {groupDone} / {item.tasks.length} টি শেষ
                </p>
                <ul className="space-y-1.5">
                  {item.tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                      <input
                        id={`mv-${task.id}`}
                        type="checkbox"
                        className="size-4 shrink-0 rounded border-border accent-primary"
                        checked={task.done}
                        onChange={() => toggle(item.id, task.id)}
                      />
                      <input
                        aria-label="কাজের নাম"
                        value={task.label}
                        placeholder="নতুন কাজ লিখুন"
                        onChange={(event) =>
                          patch({
                            groups: state.groups.map((group) =>
                              group.id === item.id
                                ? {
                                    ...group,
                                    tasks: group.tasks.map((row) =>
                                      row.id === task.id ? { ...row, label: event.target.value } : row,
                                    ),
                                  }
                                : group,
                            ),
                          })
                        }
                        className={task.done ? "flex-1 bg-transparent text-xs text-muted-foreground line-through outline-none" : "flex-1 bg-transparent text-xs outline-none"}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="কাজটি মুছে ফেলুন"
                        onClick={() => removeTask(item.id, task.id)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ToolPanel>
            );
          })}
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="moving-sheet">
            <ResultCard title="স্থানান্তরের অগ্রগতি">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock
                  label="সময় বাকি"
                  value={daysLeft === null ? "—" : daysLeft <= 0 ? "আজ/পেরিয়েছে" : `${daysLeft} দিন`}
                  tone={daysLeft !== null && daysLeft <= 3 ? "accent" : "brand"}
                />
                <StatBlock label="শেষ" value={`${done}/${allTasks.length}`} />
              </div>
              <div className="mt-4 space-y-1.5">
                <Progress value={progress} tone="brand" label="স্থানান্তরের প্রস্তুতি" />
                <p className="text-2xs text-faint-foreground">
                  {daysLeft !== null && daysLeft >= 0 ? relativeDaysBN(state.moveDate) : "তারিখ দিলে সময় বাকি দেখাবে"}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-slate-800">
                <h3 className="text-base font-bold">স্থানান্তর চেকলিস্ট</h3>
                <p className="mt-0.5 text-2xs text-slate-600">
                  {[state.fromCity, state.toCity].filter(Boolean).join(" থেকে ") || "ঠিকানা লিখুন"}
                  {state.moveDate ? ` · ${formatDateBN(state.moveDate, { short: true })}` : ""}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {state.groups.map((group) => (
                    <li key={group.id}>
                      <p className="text-2xs font-bold uppercase tracking-wide text-slate-500">{group.title}</p>
                      <ul className="mt-0.5 space-y-0.5">
                        {group.tasks.map((task) => (
                          <li key={task.id} className="text-xs leading-relaxed text-slate-700">
                            {task.done ? "☑" : "☐"} {task.label || "—"}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </ResultCard>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="moving-sheet"
              filename="moving-checklist"
              title="স্থানান্তর চেকলিস্ট"
              subtitle={[state.fromCity, state.toCity].filter(Boolean).join(" → ")}
              disabled={!isReady}
            />
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer aria-hidden />
              ছাপ
            </Button>
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { done, total: allTasks.length });
                toast.success("চেকলিস্ট সংরক্ষণ হয়েছে।");
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