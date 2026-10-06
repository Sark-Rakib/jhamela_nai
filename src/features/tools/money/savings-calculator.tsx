"use client";

/**
 * সঞ্চয় ক্যালকুলেটর
 *
 * Two modes that cover the two real questions people ask:
 *  - "goal": how long to reach a target (or how much to save monthly)
 *  - "compound": what a lump sum becomes over time at a given rate
 */

import * as React from "react";

import { Field, Input } from "@/components/ui/input";
import { Progress, Select } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { EmptyResult, ResultCard, StatBlock, ToolLayout, ToolPanel } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import { useToolState } from "@/lib/use-tool-state";
import { downloadCsv } from "@/lib/export";
import { formatBDT, parseNumber, round2 } from "@/lib/utils";

const RATE_PRESETS = [
  { value: "6", label: "৬% — সঞ্চয় অ্যাকাউন্ট" },
  { value: "8", label: "৮% — ব্যাংক ফিক্সড ডিপোজিট" },
  { value: "10", label: "১০% — জামায় বাণিজ্যিক সঞ্চয়" },
  { value: "12", label: "১২% — উচ্চমুদ্রার সুদ" },
  { value: "custom", label: "নিজের সুদের হার" },
];

interface State {
  mode: "goal" | "compound";
  target: string;
  monthly: string;
  years: string;
  rate: string;
  initial: string;
}

const DEFAULT_STATE: State = {
  mode: "goal",
  target: "100000",
  monthly: "5000",
  years: "2",
  rate: "8",
  initial: "0",
};

export function SavingsCalculator() {
  const { state, setState, reset } = useToolState<State>("savings-calculator", DEFAULT_STATE);

  const target = parseNumber(state.target);
  const monthly = parseNumber(state.monthly);
  const years = Math.max(0, parseNumber(state.years));
  const rate = Math.max(0, parseNumber(state.rate)) / 100;
  const initial = Math.max(0, parseNumber(state.initial));

  const monthlyRate = rate / 12;
  const months = Math.round(years * 12);

  /* ---- mode: goal — months needed for a target ---- */
  const goal = React.useMemo(() => {
    if (target <= 0 || monthly <= 0) return null;

    let balance = initial;
    // Without interest: plain division.
    if (monthlyRate === 0) {
      const needed = Math.ceil((target - initial) / monthly);
      return {
        months: needed,
        total: initial + needed * monthly,
        interest: initial + needed * monthly - target,
      };
    }

    // With interest: iterate month by month (closed-form needs a log-space
    // inversion for the payment>interest edge case).
    let monthsNeeded = 0;
    const cap = 1200; // 100 years — anything beyond is not a real plan
    while (balance < target && monthsNeeded < cap) {
      balance = (balance + monthly) * (1 + monthlyRate);
      monthsNeeded += 1;
    }
    return {
      months: monthsNeeded,
      total: initial + monthsNeeded * monthly,
      interest: initial + monthsNeeded * monthly - target,
    };
  }, [target, monthly, monthlyRate, initial]);

  /* ---- mode: compound — future value of a monthly contribution ---- */
  const compound = React.useMemo(() => {
    if (months <= 0) return null;
    let balance = initial;
    const series: { month: number; contributed: number; balance: number }[] = [];
    for (let month = 1; month <= months; month += 1) {
      balance = (balance + monthly) * (1 + monthlyRate);
      series.push({
        month,
        contributed: initial + month * monthly,
        balance: round2(balance),
      });
    }
    const contributed = initial + months * monthly;
    return {
      series,
      final: round2(balance),
      contributed,
      interest: round2(balance - contributed),
    };
  }, [months, monthly, monthlyRate, initial]);

  const yearlyRows = compound
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        .filter((year) => year * 12 <= months && Boolean(compound.series[year * 12 - 1]))
        .map((year) => {
          const point = compound.series[year * 12 - 1];
          return [
            `${year} বছর`,
            formatBDT(point.contributed, { bare: true }),
            formatBDT(point.balance, { bare: true }),
            formatBDT(point.balance - point.contributed, { bare: true }),
          ];
        })
    : [];

  const progress =
    goal && goal.months > 0 && goal.months <= months * 12
      ? Math.min(100, (months / goal.months) * 100)
      : months > 0
        ? 100
        : 0;

  return (
    <ToolLayout
      form={
        <ToolPanel
          title="তথ্য দিন"
          description="লক্ষ্য, মাসিক জমা ও সুদের হার — যা আপনার কাছে আছে।"
          onReset={reset}
          actions={
            <PdfButton targetId="savings-print" filename="savings-plan" title="সঞ্চয় পরিকল্পনা" />
          }
        >
          <div className="space-y-5">
            <Field label="কী হিসাব করবেন?">
              <Select
                value={state.mode}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, mode: value as State["mode"] }))
                }
                options={[
                  { value: "goal", label: "লক্ষ্যে পৌঁছাতে কত সময় লাগবে" },
                  { value: "compound", label: "সময়ের সাথে সঞ্চয় বাড়বে কতটা" },
                ]}
                ariaLabel="হিসাবের ধরন"
              />
            </Field>

            {state.mode === "goal" ? (
              <>
                <Field label="লক্ষ্যের পরিমাণ" hint="কত টাকা জমাতে চান" required htmlFor="target">
                  <Input
                    id="target"
                    inputMode="numeric"
                    value={state.target}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, target: event.target.value }))
                    }
                    placeholder="100000"
                  />
                </Field>
                <Field label="প্রতি মাসে জমাবেন" required htmlFor="monthly">
                  <Input
                    id="monthly"
                    inputMode="numeric"
                    value={state.monthly}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, monthly: event.target.value }))
                    }
                    placeholder="5000"
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="প্রতি মাসে জমাবেন" required htmlFor="monthly-c">
                  <Input
                    id="monthly-c"
                    inputMode="numeric"
                    value={state.monthly}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, monthly: event.target.value }))
                    }
                    placeholder="5000"
                  />
                </Field>
                <Field label="কত বছর" required htmlFor="years">
                  <Input
                    id="years"
                    inputMode="numeric"
                    value={state.years}
                    onChange={(event) => setState((prev) => ({ ...prev, years: event.target.value }))}
                    placeholder="5"
                  />
                </Field>
              </>
            )}

            <Field label="শুরুর জমা (থাকলে)" htmlFor="initial">
              <Input
                id="initial"
                inputMode="numeric"
                value={state.initial}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, initial: event.target.value }))
                }
                placeholder="0"
              />
            </Field>

            <Field label="বার্ষিক সুদের হার" htmlFor="rate">
              <Select
                value={state.rate}
                onValueChange={(value) => setState((prev) => ({ ...prev, rate: value }))}
                options={RATE_PRESETS}
                ariaLabel="সুদের হার"
              />
            </Field>

            {!RATE_PRESETS.some((preset) => preset.value === state.rate) ? (
              <Field label="নিজের হার (%)" htmlFor="custom-rate">
                <Input
                  id="custom-rate"
                  inputMode="decimal"
                  value={state.rate}
                  onChange={(event) => setState((prev) => ({ ...prev, rate: event.target.value }))}
                  placeholder="9.5"
                />
              </Field>
            ) : null}

            <SaveButton slug="savings-calculator" state={state} />
            <GuestHint slug="savings-calculator" />
          </div>
        </ToolPanel>
      }
      results={
        <div id="savings-print" className="space-y-4">
          {state.mode === "goal" ? (
            goal ? (
              <>
                <ResultCard title="ফলাফল">
                  <div className="grid gap-3">
                    <StatBlock
                      label="লক্ষ্যে পৌঁছাতে লাগবে"
                      value={`${goal.months} মাস`}
                      hint={
                        goal.months >= 12
                          ? `প্রায় ${(goal.months / 12).toFixed(1)} বছর`
                          : undefined
                      }
                      tone="brand"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <StatBlock label="মোট জমা" value={formatBDT(goal.total)} />
                      <StatBlock
                        label="সুদসহ বাড়বে"
                        value={`+${formatBDT(Math.max(0, goal.interest))}`}
                        tone="accent"
                      />
                    </div>
                    {months > 0 ? (
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-2xs text-muted-foreground">
                          <span>{years} বছরের অগ্রগতি</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} label="লক্ষ্যের অগ্রগতি" />
                      </div>
                    ) : null}
                  </div>
                </ResultCard>

                <p className="rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  প্রতি মাসে <strong className="text-foreground">{formatBDT(monthly)}</strong> জমালে{" "}
                  <strong className="text-foreground">{formatBDT(parseNumber(state.target))}</strong>{" "}
                  লক্ষ্যে পৌঁছাতে প্রায়{" "}
                  <strong className="text-foreground">{goal.months} মাস</strong> লাগবে। সুদের হার{" "}
                  {state.rate}% ধরে হিসাব করা হয়েছে; ব্যাংক ও কিস্তির শর্ত বদলালে ফলাফলও বদলাবে।
                </p>
              </>
            ) : (
              <EmptyResult message="লক্ষ্য ও মাসিক জমার অঙ্গ দিলে ফলাফল দেখুন।" />
            )
          ) : compound ? (
            <ResultCard title="সঞ্চয়ের বৃদ্ধি">
              <div className="space-y-3">
                <StatBlock
                  label={`${years} বছর পর মোট`}
                  value={formatBDT(compound.final)}
                  tone="brand"
                />
                <div className="grid grid-cols-2 gap-3">
                  <StatBlock label="আপনি জমিয়েছেন" value={formatBDT(compound.contributed)} />
                  <StatBlock
                    label="সুদ যোগ হয়েছে"
                    value={`+${formatBDT(compound.interest)}`}
                    tone="accent"
                  />
                </div>

                {yearlyRows.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-border bg-surface">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-muted text-2xs uppercase tracking-wide text-faint-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">সময়</th>
                          <th className="px-3 py-2 text-right font-medium">জমা</th>
                          <th className="px-3 py-2 text-right font-medium">ব্যালেন্স</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyRows.map(([when, paid, balance]) => (
                          <tr key={String(when)} className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">{when}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                              ৳{paid}
                            </td>
                            <td className="px-3 py-2 text-right font-medium tabular-nums">
                              ৳{balance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {yearlyRows.length > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    block
                    onClick={() =>
                      downloadCsv("savings-projection", [
                        ["সময়", "জমা", "ব্যালেন্স", "সুদ"],
                        ...yearlyRows,
                      ])
                    }
                  >
                    CSV ডাউনলোড
                  </Button>
                ) : null}
              </div>
            </ResultCard>
          ) : (
            <EmptyResult message="মাসিক জমা ও সময় দিলে ফলাফল দেখুন।" />
          )}
        </div>
      }
    />
  );
}