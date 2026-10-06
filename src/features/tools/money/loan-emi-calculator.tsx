"use client";

/**
 * লোন EMI ক্যালকুলেটর
 *
 * Standard reducing-balance EMI: E = P·r·(1+r)^n / ((1+r)^n − 1).
 * A year-by-year principal vs interest split makes the total cost obvious,
 * which is the whole reason people run this calculation.
 */

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/primitives";
import { EmptyResult, ResultCard, StatBlock, ToolLayout, ToolPanel } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import { downloadCsv } from "@/lib/export";
import { useToolState } from "@/lib/use-tool-state";
import { formatBDT, parseNumber, round2 } from "@/lib/utils";

const LOAN_TYPES = [
  { value: "personal", label: "পার্সোনাল লোন" },
  { value: "home", label: "বাড়ির লোন" },
  { value: "car", label: "গাড়ির লোন" },
  { value: "business", label: "ব্যবসার লোন" },
  { value: "other", label: "অন্যান্য" },
] as const;

interface State {
  amount: string;
  rate: string;
  years: string;
  type: string;
  downPayment: string;
}

const DEFAULT_STATE: State = {
  amount: "500000",
  rate: "9.5",
  years: "5",
  type: "personal",
  downPayment: "0",
};

export function LoanEmiCalculator() {
  const { state, setState, reset } = useToolState<State>("loan-emi-calculator", DEFAULT_STATE);

  const principal = Math.max(0, parseNumber(state.amount) - parseNumber(state.downPayment));
  const annualRate = Math.max(0, parseNumber(state.rate)) / 100;
  const years = Math.max(0, parseNumber(state.years));
  const months = Math.round(years * 12);
  const monthlyRate = annualRate / 12;

  const result = React.useMemo(() => {
    if (principal <= 0 || months <= 0) return null;

    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * (1 + monthlyRate) ** months) /
          ((1 + monthlyRate) ** months - 1);

    const totalPayable = emi * months;

    // Yearly amortisation: how much of each EMI was interest vs principal.
    let balance = principal;
    const schedule: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let year = 1; year <= years; year += 1) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let month = 0; month < 12 && balance > 0; month += 1) {
        const interest = balance * monthlyRate;
        const principalPart = Math.min(emi - interest, balance);
        balance -= principalPart;
        yearInterest += interest;
        yearPrincipal += principalPart;
      }
      schedule.push({
        year,
        principal: round2(yearPrincipal),
        interest: round2(yearInterest),
        balance: round2(Math.max(0, balance)),
      });
    }

    return {
      emi: round2(emi),
      totalPayable: round2(totalPayable),
      totalInterest: round2(totalPayable - principal),
      schedule,
    };
  }, [principal, months, monthlyRate, years]);

  const interestShare =
    result && result.totalPayable > 0 ? (result.totalInterest / result.totalPayable) * 100 : 0;

  return (
    <ToolLayout
      form={
        <ToolPanel
          title="লোনের তথ্য"
          description="টাকার পরিমাণ, সুদের হার ও মেয়াদ দিন।"
          onReset={reset}
          actions={
            <PdfButton targetId="emi-print" filename="loan-emi" title="EMI তথ্য" />
          }
        >
          <div className="space-y-5">
            <Field label="লোনের পরিমাণ (৳)" required htmlFor="amount">
              <Input
                id="amount"
                inputMode="numeric"
                value={state.amount}
                onChange={(event) => setState((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="500000"
              />
            </Field>

            <Field label="লোনের ধরন">
              <div className="flex flex-wrap gap-2">
                {LOAN_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    size="sm"
                    variant={state.type === type.value ? "subtle" : "outline"}
                    onClick={() => setState((prev) => ({ ...prev, type: type.value }))}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="বার্ষিক সুদ (%)" required htmlFor="rate">
                <Input
                  id="rate"
                  inputMode="decimal"
                  value={state.rate}
                  onChange={(event) => setState((prev) => ({ ...prev, rate: event.target.value }))}
                  placeholder="9.5"
                />
              </Field>
              <Field label="মেয়াদ (বছর)" required htmlFor="years">
                <Input
                  id="years"
                  inputMode="numeric"
                  value={state.years}
                  onChange={(event) => setState((prev) => ({ ...prev, years: event.target.value }))}
                  placeholder="5"
                />
              </Field>
            </div>

            <Field label="অগ্রিম / ডাউন পেমেন্ট (৳)" hint="থাকলে লোনের অঙ্ক কমবে" htmlFor="down">
              <Input
                id="down"
                inputMode="numeric"
                value={state.downPayment}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, downPayment: event.target.value }))
                }
                placeholder="0"
              />
            </Field>

            <SaveButton slug="loan-emi-calculator" state={state} />
            <GuestHint slug="loan-emi-calculator" />
          </div>
        </ToolPanel>
      }
      results={
        <div id="emi-print" className="space-y-4">
          {result ? (
            <>
              <ResultCard title="মাসিক কিস্তি">
                <div className="space-y-3">
                  <StatBlock label="প্রতি মাসে পরিশোধ" value={formatBDT(result.emi)} tone="brand" />
                  <div className="grid grid-cols-2 gap-3">
                    <StatBlock label="মোট পরিশোধ" value={formatBDT(result.totalPayable)} />
                    <StatBlock
                      label="মোট সুদ"
                      value={formatBDT(result.totalInterest)}
                      tone="accent"
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-2xs text-muted-foreground">
                      <span>সুদের অংশ</span>
                      <span>{interestShare.toFixed(1)}%</span>
                    </div>
                    <Progress value={interestShare} tone="accent" label="সুদের অংশ" />
                    <div className="mt-1.5 flex items-center justify-between text-2xs text-muted-foreground">
                      <span>মূলধনের অংশ</span>
                      <span>{(100 - interestShare).toFixed(1)}%</span>
                    </div>
                    <Progress value={100 - interestShare} label="মূলধনের অংশ" />
                  </div>
                </div>
              </ResultCard>

              <div className="rounded-xl border border-border bg-surface p-4">
                <h3 className="text-sm font-semibold tracking-tight">বছরভিত্তিক ভাঙ্গন</h3>
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-muted text-2xs uppercase tracking-wide text-faint-foreground">
                      <tr>
                        <th className="px-2.5 py-2 font-medium">বছর</th>
                        <th className="px-2.5 py-2 text-right font-medium">মূলধন</th>
                        <th className="px-2.5 py-2 text-right font-medium">সুদ</th>
                        <th className="px-2.5 py-2 text-right font-medium">বাকি</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.year} className="border-t border-border">
                          <td className="px-2.5 py-2 text-muted-foreground">{row.year}</td>
                          <td className="px-2.5 py-2 text-right tabular-nums">
                            {formatBDT(row.principal, { bare: true })}
                          </td>
                          <td className="px-2.5 py-2 text-right tabular-nums text-accent-600 dark:text-accent-400">
                            {formatBDT(row.interest, { bare: true })}
                          </td>
                          <td className="px-2.5 py-2 text-right font-medium tabular-nums">
                            {formatBDT(row.balance, { bare: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  block
                  className="mt-3"
                  onClick={() =>
                    downloadCsv("loan-emi-schedule", [
                      ["বছর", "মূলধন", "সুদ", "বাকি ঋণ"],
                      ...result.schedule.map((row) => [
                        row.year,
                        row.principal,
                        row.interest,
                        row.balance,
                      ]),
                    ])
                  }
                >
                  CSV ডাউনলোড
                </Button>
              </div>

              <p className="rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {months} মাসে মোট {formatBDT(result.totalPayable)} পরিশোধ, যার মধ্যে{" "}
                {formatBDT(result.totalInterest)} সুদ। মেয়াদ বাড়ালে কিস্তি কমে কিন্তু মোট সুদ বাড়ে —
                এই ভাঙ্গনটাই সেটা দেখায়।
              </p>
            </>
          ) : (
            <EmptyResult message="লোনের পরিমাণ, সুদ ও মেয়াদ দিলে EMI বের হবে।" />
          )}
        </div>
      }
    />
  );
}