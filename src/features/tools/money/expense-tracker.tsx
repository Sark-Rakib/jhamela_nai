"use client";

/**
 * খরচের হিসাব (Expense Tracker)
 *
 * Entries carry a date, so the tracker reports both an all-time balance and a
 * month-to-date one — the number people actually check. Data stays in
 * `localStorage` for guests and syncs when an account exists.
 */

import * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { EmptyResult, ResultCard, StatBlock, ToolLayout, ToolPanel } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import { CHART_PALETTES } from "@/lib/accents";
import { formatDateBN, monthKey, monthLabelBN, todayInputValue } from "@/lib/bn";
import { downloadCsv } from "@/lib/export";
import { useToolState } from "@/lib/use-tool-state";
import { formatBDT, parseNumber, round2, uid } from "@/lib/utils";

const CATEGORIES = [
  { value: "food", label: "খাবার" },
  { value: "transport", label: "যাতায়াত" },
  { value: "rent", label: "বাড়ি ভাড়া" },
  { value: "bill", label: "বিল ও ইন্টারনেট" },
  { value: "shopping", label: "কেনাকাটা" },
  { value: "health", label: "স্বাস্থ্য" },
  { value: "education", label: "শিক্ষা" },
  { value: "entertainment", label: "বিনোদন" },
  { value: "other", label: "অন্যান্য" },
] as const;

const CATEGORY_COLOURS: Record<string, string> = {
  food: "#fb800c",
  transport: "#0ea5e9",
  rent: "#8b5cf6",
  bill: "#12b886",
  shopping: "#f43f5e",
  health: "#10b981",
  education: "#6366f1",
  entertainment: "#f59e0b",
  other: "#64748b",
};

interface Entry {
  id: string;
  type: "expense" | "income";
  amount: string;
  category: string;
  note: string;
  date: string;
}

interface State {
  entries: Entry[];
  draftType: "expense" | "income";
  draftAmount: string;
  draftCategory: string;
  draftNote: string;
  draftDate: string;
  filterMonth: string;
}

const DEFAULT_STATE: State = {
  entries: [
    {
      id: "s1",
      type: "income",
      amount: "45000",
      category: "other",
      note: "মাসিক বেতন",
      date: todayInputValue(),
    },
    {
      id: "e1",
      type: "expense",
      amount: "15000",
      category: "rent",
      note: "বাড়ি ভাড়া",
      date: todayInputValue(),
    },
    {
      id: "e2",
      type: "expense",
      amount: "2350",
      category: "food",
      note: "বাজার",
      date: todayInputValue(),
    },
  ],
  draftType: "expense",
  draftAmount: "",
  draftCategory: "food",
  draftNote: "",
  draftDate: todayInputValue(),
  filterMonth: monthKey(new Date()),
};

export function ExpenseTracker() {
  const { state, setState, reset } = useToolState<State>("expense-tracker", DEFAULT_STATE);

  const entries = React.useMemo(
    () => [...state.entries].sort((a, b) => b.date.localeCompare(a.date)),
    [state.entries],
  );

  const filtered = React.useMemo(
    () =>
      state.filterMonth === "all"
        ? entries
        : entries.filter((entry) => monthKey(entry.date) === state.filterMonth),
    [entries, state.filterMonth],
  );

  const totals = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    const byCategory = new Map<string, number>();

    for (const entry of filtered) {
      const amount = Math.max(0, parseNumber(entry.amount));
      if (entry.type === "income") {
        income += amount;
      } else {
        expense += amount;
        byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + amount);
      }
    }

    const breakdown = [...byCategory.entries()]
      .map(([key, value]) => ({
        key,
        label: CATEGORIES.find((item) => item.value === key)?.label ?? "অন্যান্য",
        value: round2(value),
      }))
      .sort((a, b) => b.value - a.value);

    return {
      income: round2(income),
      expense: round2(expense),
      balance: round2(income - expense),
      breakdown,
    };
  }, [filtered]);

  function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Math.max(0, parseNumber(state.draftAmount));
    if (amount <= 0) return;

    const entry: Entry = {
      id: uid("e"),
      type: state.draftType,
      amount: String(amount),
      category: state.draftCategory,
      note: state.draftNote.trim(),
      date: state.draftDate || todayInputValue(),
    };

    setState((prev) => ({
      ...prev,
      entries: [entry, ...prev.entries],
      draftAmount: "",
      draftNote: "",
    }));
  }

  function removeEntry(id: string) {
    setState((prev) => ({ ...prev, entries: prev.entries.filter((entry) => entry.id !== id) }));
  }

  const monthOptions = React.useMemo(() => {
    const keys = new Set(entries.map((entry) => monthKey(entry.date)));
    keys.add(monthKey(new Date()));
    return [
      { value: "all", label: "সব মাস" },
      ...[...keys].sort().reverse().map((key) => ({ value: key, label: monthLabelBN(key) })),
    ];
  }, [entries]);

  return (
    <ToolLayout
      form={
        <div className="space-y-6">
          <ToolPanel
            title="নতুন এন্ট্রি"
            description="আয় বা খরচ লিখে যোগ করুন।"
          >
            <form className="space-y-5" onSubmit={addEntry}>
              <Field label="কী লিখছেন?">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={state.draftType === "expense" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setState((prev) => ({ ...prev, draftType: "expense" }))}
                  >
                    খরচ
                  </Button>
                  <Button
                    type="button"
                    variant={state.draftType === "income" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setState((prev) => ({ ...prev, draftType: "income" }))}
                  >
                    আয়
                  </Button>
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="পরিমাণ (৳)" required htmlFor="entry-amount">
                  <Input
                    id="entry-amount"
                    inputMode="numeric"
                    value={state.draftAmount}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, draftAmount: event.target.value }))
                    }
                    placeholder="500"
                  />
                </Field>
                <Field label="তারিখ" htmlFor="entry-date">
                  <Input
                    id="entry-date"
                    type="date"
                    value={state.draftDate}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, draftDate: event.target.value }))
                    }
                  />
                </Field>
              </div>

              {state.draftType === "expense" ? (
                <Field label="খাত">
                  <Select
                    value={state.draftCategory}
                    onValueChange={(value) =>
                      setState((prev) => ({ ...prev, draftCategory: value }))
                    }
                    options={CATEGORIES.map((item) => ({ ...item }))}
                    ariaLabel="খরচের খাত"
                  />
                </Field>
              ) : null}

              <Field label="নোট (ঐচ্ছিক)" htmlFor="entry-note">
                <Textarea
                  id="entry-note"
                  rows={2}
                  value={state.draftNote}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, draftNote: event.target.value }))
                  }
                  placeholder="কোথায় খরচ হলো"
                />
              </Field>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={parseNumber(state.draftAmount) <= 0}>
                  যোগ করুন
                </Button>
                <SaveButton slug="expense-tracker" state={state} />
              </div>
              <GuestHint slug="expense-tracker" />
            </form>
          </ToolPanel>

          <ToolPanel
            title="এন্ট্রির তালিকা"
            description={`${filtered.length}টি এন্ট্রি দেখানো হচ্ছে`}
            onReset={reset}
          >
            <div className="mb-4 max-w-48">
              <Select
                value={state.filterMonth}
                onValueChange={(value) => setState((prev) => ({ ...prev, filterMonth: value }))}
                options={monthOptions}
                ariaLabel="মাস ফিল্টার"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                এই মাসে কোনো এন্ট্রি নেই।
              </p>
            ) : (
              <ul className="space-y-1.5">
                {filtered.map((entry) => {
                  const amount = parseNumber(entry.amount);
                  const isIncome = entry.type === "income";
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          background: isIncome
                            ? "var(--color-primary)"
                            : CATEGORY_COLOURS[entry.category] ?? CATEGORY_COLOURS.other,
                        }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {entry.note ||
                            (isIncome
                              ? "আয়"
                              : CATEGORIES.find((item) => item.value === entry.category)?.label ||
                                "খরচ")}
                        </p>
                        <p className="text-2xs text-faint-foreground">
                          {formatDateBN(entry.date)} ·{" "}
                          {isIncome
                            ? "আয়"
                            : CATEGORIES.find((item) => item.value === entry.category)?.label}
                        </p>
                      </div>
                      <span
                        className={
                          isIncome
                            ? "shrink-0 text-sm font-semibold tabular-nums text-primary"
                            : "shrink-0 text-sm font-semibold tabular-nums text-foreground"
                        }
                      >
                        {isIncome ? "+" : "−"}
                        {formatBDT(amount, { bare: true })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEntry(entry.id)}
                        aria-label={`${entry.note || "এন্ট্রি"} মুছুন`}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}

            {filtered.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  downloadCsv("expenses", [
                    ["তারিখ", "ধরন", "খাত", "নোট", "পরিমাণ"],
                    ...filtered.map((entry) => [
                      entry.date,
                      entry.type === "income" ? "আয়" : "খরচ",
                      CATEGORIES.find((item) => item.value === entry.category)?.label ?? "",
                      entry.note,
                      parseNumber(entry.amount),
                    ]),
                  ])
                }
              >
                CSV ডাউনলোড
              </Button>
            ) : null}
          </ToolPanel>
        </div>
      }
      results={
        <div id="expense-print" className="space-y-4">
          {filtered.length === 0 ? (
            <EmptyResult message="এন্ট্রি যোগ করলে এখানে সারসংক্ষেপ দেখা যাবে।" />
          ) : (
            <>
              <ResultCard title="ফলাফল">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBlock label="আয়" value={formatBDT(totals.income)} tone="brand" />
                    <StatBlock label="খরচ" value={formatBDT(totals.expense)} />
                  </div>
                  <StatBlock
                    label={totals.balance >= 0 ? "জমা" : "ঘাটতি"}
                    value={formatBDT(Math.abs(totals.balance))}
                    tone={totals.balance >= 0 ? "brand" : "danger"}
                  />
                </div>
              </ResultCard>

              {totals.breakdown.length > 0 ? (
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-semibold tracking-tight">খাতভিত্তিক ভাঙ্গন</h3>
                  <ul className="mt-3 space-y-2.5">
                    {totals.breakdown.map((row, index) => {
                      const share = totals.expense > 0 ? (row.value / totals.expense) * 100 : 0;
                      return (
                        <li key={row.key}>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{
                                  background:
                                    CATEGORY_COLOURS[row.key] ??
                                    CHART_PALETTES.brand[index % CHART_PALETTES.brand.length],
                                }}
                                aria-hidden
                              />
                              <span className="truncate text-muted-foreground">{row.label}</span>
                            </span>
                            <span className="shrink-0 font-medium tabular-nums">
                              {formatBDT(row.value)}
                              <span className="ml-1.5 text-faint-foreground">{share.toFixed(0)}%</span>
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, share)}%`,
                                background: CATEGORY_COLOURS[row.key] ?? "var(--color-primary)",
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4">
                    <PdfButton
                      targetId="expense-print"
                      filename="expense-report"
                      title="খরচের হিসাব"
                      subtitle={
                        state.filterMonth === "all" ? "সব মাস" : monthLabelBN(state.filterMonth)
                      }
                    />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      }
    />
  );
}