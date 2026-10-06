"use client";

/**
 * বাজেট প্ল্যানার
 *
 * A category breakdown with a live pie chart. Two rules keep the output
 * honest: every category is capped by what is actually left, and overspending
 * is surfaced immediately instead of being buried in a total.
 */

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import { ResultCard, StatBlock, ToolLayout, ToolPanel } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import { ACCENT_CHART, CHART_PALETTES } from "@/lib/accents";
import { trackToolCompleted } from "@/lib/analytics";
import { useToolState } from "@/lib/use-tool-state";
import { formatBDT, parseNumber, round2, uid } from "@/lib/utils";

interface Line {
  id: string;
  name: string;
  amount: string;
}

interface State {
  income: string;
  savingsGoal: string;
  lines: Line[];
}

const DEFAULT_LINES: Line[] = [
  { id: "a", name: "বাড়ি ভাড়া", amount: "15000" },
  { id: "b", name: "খাবার", amount: "12000" },
  { id: "c", name: "যাতায়াত", amount: "4000" },
  { id: "d", name: "বিল ও ইন্টারনেট", amount: "3500" },
  { id: "e", name: "যাতায়াত/ভ্রমণ", amount: "3000" },
  { id: "f", name: "ব্যক্তিগত খরচ", amount: "4000" },
];

const DEFAULT_STATE: State = {
  income: "45000",
  savingsGoal: "5000",
  lines: DEFAULT_LINES,
};

export function BudgetPlanner() {
  const { state, setState, reset } = useToolState<State>("budget-planner", DEFAULT_STATE);

  const income = Math.max(0, parseNumber(state.income));
  const savingsGoal = Math.max(0, parseNumber(state.savingsGoal));

  const rows = React.useMemo(
    () =>
      state.lines
        .map((line) => ({ ...line, value: Math.max(0, parseNumber(line.amount)) }))
        .filter((line) => line.name.trim().length > 0 || line.value > 0),
    [state.lines],
  );

  const spent = rows.reduce((total, row) => total + row.value, 0);
  const remaining = income - spent - savingsGoal;
  const committed = spent + savingsGoal;

  const chartData = React.useMemo(
    () =>
      rows
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((row) => ({ name: row.name, value: round2(row.value) })),
    [rows],
  );

  const palette = CHART_PALETTES.brand;

  function updateLine(id: string, patch: Partial<Line>) {
    setState((prev) => ({
      ...prev,
      lines: prev.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    }));
  }

  function addLine() {
    setState((prev) => ({ ...prev, lines: [...prev.lines, { id: uid("l"), name: "", amount: "" }] }));
  }

  function removeLine(id: string) {
    setState((prev) => ({ ...prev, lines: prev.lines.filter((line) => line.id !== id) }));
  }

  const overBudget = remaining < 0;

  return (
    <ToolLayout
      form={
        <ToolPanel
          title="আয় ও খরচ"
          description="মাসিক আয় দিন, তারপর প্রতিটি খাতের পরিমাণ লিখুন।"
          onReset={reset}
          actions={
            <PdfButton
              targetId="budget-print"
              filename="monthly-budget"
              title="মাসিক বাজেট"
              subtitle={`আয় ${formatBDT(income)}`}
            />
          }
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="মাসিক আয় (৳)" required htmlFor="income">
                <Input
                  id="income"
                  inputMode="numeric"
                  value={state.income}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, income: event.target.value }))
                  }
                  placeholder="45000"
                />
              </Field>
              <Field label="সঞ্চয় লক্ষ্য (৳)" htmlFor="savings">
                <Input
                  id="savings"
                  inputMode="numeric"
                  value={state.savingsGoal}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, savingsGoal: event.target.value }))
                  }
                  placeholder="5000"
                />
              </Field>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">খরচের খাত</h3>
                <Button variant="ghost" size="sm" onClick={addLine}>
                  <Plus aria-hidden />
                  খাত যোগ করুন
                </Button>
              </div>

              <div className="mt-3 space-y-2.5">
                {rows.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    এখনো কোনো খাত যোগ করা হয়নি।
                  </p>
                ) : null}

                {rows.map((line, index) => (
                  <div key={line.id} className="flex items-center gap-2">
                    <label htmlFor={`line-${line.id}`} className="sr-only">
                      খাতের নাম {index + 1}
                    </label>
                    <Input
                      id={`line-${line.id}`}
                      value={line.name}
                      onChange={(event) => updateLine(line.id, { name: event.target.value })}
                      placeholder="খাতের নাম"
                      className="flex-1"
                    />
                    <label htmlFor={`amount-${line.id}`} className="sr-only">
                      {line.name || `খাত ${index + 1}`} এর পরিমাণ
                    </label>
                    <Input
                      id={`amount-${line.id}`}
                      inputMode="numeric"
                      value={line.amount}
                      onChange={(event) => updateLine(line.id, { amount: event.target.value })}
                      placeholder="0"
                      className="w-28 text-right"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLine(line.id)}
                      aria-label={`${line.name || "খাত"} সরান`}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <SaveButton slug="budget-planner" state={state} />
            <GuestHint slug="budget-planner" />
          </div>
        </ToolPanel>
      }
      results={
        <div id="budget-print" className="space-y-4">
          <ResultCard title="মাসিক সারসংক্ষেপ">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="মোট আয়" value={formatBDT(income)} />
                <StatBlock label="মোট খরচ" value={formatBDT(spent)} />
              </div>
              <StatBlock
                label={overBudget ? "ঘাটতি" : "হাতে থাকবে"}
                value={formatBDT(Math.abs(remaining))}
                tone={overBudget ? "danger" : "brand"}
                hint={
                  savingsGoal > 0
                    ? `সঞ্চয় লক্ষ্য ${formatBDT(savingsGoal)} আগে রেখে হিসাব করা`
                    : undefined
                }
              />

              {income > 0 ? (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-2xs text-muted-foreground">
                    <span>ব্যয়ের হার</span>
                    <span>{((committed / income) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={(committed / income) * 100}
                    tone={overBudget ? "danger" : "brand"}
                    label="ব্যয়ের হার"
                  />
                </div>
              ) : null}
            </div>
          </ResultCard>

          {chartData.length > 0 ? (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold tracking-tight">খরচের ভাঙ্গন</h3>
              <div className="mt-2 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="46%"
                      outerRadius="78%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={palette[index % palette.length] ?? ACCENT_CHART.brand}
                        />
                      ))}
                    </Pie>
                    <ReTooltip
                      formatter={(value) => [formatBDT(Number(value)), "খরচ"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-foreground)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-3 space-y-1.5">
                {chartData.map((entry, index) => (
                  <li
                    key={entry.name}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          background: palette[index % palette.length] ?? ACCENT_CHART.brand,
                        }}
                        aria-hidden
                      />
                      <span className="truncate text-muted-foreground">{entry.name}</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatBDT(entry.value)}
                      <span className="ml-1.5 text-faint-foreground">
                        {income > 0 ? `${((entry.value / income) * 100).toFixed(0)}%` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {overBudget ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive-soft px-4 py-3 text-xs leading-relaxed text-destructive">
              খরচ আয়ের চেয়ে {formatBDT(Math.abs(remaining))} বেশি। সবচেয়ে বড় খাত “{chartData[0]?.name}”
              থেকে কিছু কমালে বাজেট ঠিক জায়গায় আসবে।
            </p>
          ) : income > 0 && savingsGoal > 0 && remaining >= 0 ? (
            <p className="rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              সঞ্চয় লক্ষ্য পূরণ করেও {formatBDT(remaining)} হাতে থাকবে। অবশিষ্ট টাকা আগের মাসের
              বাকিগুলো থেকে জমিয়ে ইমার্জেন্সি ফান্ড বানানো ভালো অভ্যাস।
            </p>
          ) : null}
        </div>
      }
    />
  );
}

export function trackBudgetComplete(income: number, spent: number) {
  trackToolCompleted("budget-planner", {
    buckets: new Set([income > 0, spent > 0]).size,
  });
}