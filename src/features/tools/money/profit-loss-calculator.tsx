"use client";

/**
 * লাভ-ক্ষতি ক্যালকুলেটর
 *
 * Built for the Bangladeshi small-business / reseller case: given a selling
 * price and a cost, work out the margin, and — the question people actually
 * have — "how many units must I sell per day to cover my fixed costs?"
 */

import * as React from "react";

import { Field, Input } from "@/components/ui/input";
import { EmptyResult, ResultCard, StatBlock, ToolLayout, ToolPanel } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import { useToolState } from "@/lib/use-tool-state";
import { formatBDT, parseNumber, round2 } from "@/lib/utils";

interface State {
  sellingPrice: string;
  costPrice: string;
  quantity: string;
  fixedCost: string;
  extraCost: string;
}

const DEFAULT_STATE: State = {
  sellingPrice: "1500",
  costPrice: "1000",
  quantity: "10",
  fixedCost: "5000",
  extraCost: "0",
};

export function ProfitLossCalculator() {
  const { state, setState, reset } = useToolState<State>("profit-loss-calculator", DEFAULT_STATE);

  const sellingPrice = Math.max(0, parseNumber(state.sellingPrice));
  const costPrice = Math.max(0, parseNumber(state.costPrice));
  const quantity = Math.max(0, parseNumber(state.quantity));
  const fixedCost = Math.max(0, parseNumber(state.fixedCost));
  const extraCost = Math.max(0, parseNumber(state.extraCost));

  const result = React.useMemo(() => {
    const revenue = sellingPrice * quantity;
    const variableCost = (costPrice + extraCost) * quantity;
    const totalCost = variableCost + fixedCost;
    const profit = revenue - totalCost;

    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const markup = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;
    const perUnitProfit = sellingPrice - costPrice - extraCost;

    // Break-even: units needed to cover fixed costs, or the break-even price.
    const breakEvenUnits = perUnitProfit > 0 ? Math.ceil(fixedCost / perUnitProfit) : null;
    const breakEvenPrice = sellingPrice - costPrice - extraCost > 0
      ? costPrice + extraCost + fixedCost / Math.max(1, quantity)
      : null;

    return {
      revenue,
      totalCost,
      profit,
      margin,
      markup,
      perUnitProfit,
      breakEvenUnits,
      breakEvenPrice,
    };
  }, [sellingPrice, costPrice, quantity, fixedCost, extraCost]);

  const profitable = result.profit >= 0;

  return (
    <ToolLayout
      form={
        <ToolPanel
          title="ব্যবসার হিসাব"
          description="বিক্রয়মূল্য, ক্রয়মূল্য ও পরিমাণ দিন।"
          onReset={reset}
          actions={
            <PdfButton targetId="profit-print" filename="profit-loss" title="লাভ-ক্ষতির হিসাব" />
          }
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="বিক্রয়মূল্য (প্রতি পিস)" required htmlFor="sp">
                <Input
                  id="sp"
                  inputMode="numeric"
                  value={state.sellingPrice}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, sellingPrice: event.target.value }))
                  }
                  placeholder="1500"
                />
              </Field>
              <Field label="ক্রয়মূল্য (প্রতি পিস)" required htmlFor="cp">
                <Input
                  id="cp"
                  inputMode="numeric"
                  value={state.costPrice}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, costPrice: event.target.value }))
                  }
                  placeholder="1000"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="কত পিস" required htmlFor="qty">
                <Input
                  id="qty"
                  inputMode="numeric"
                  value={state.quantity}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, quantity: event.target.value }))
                  }
                  placeholder="10"
                />
              </Field>
              <Field label="প্রতি পিসে অন্য খরচ" hint="ডেলিভারি, প্যাকেজিং ইত্যাদি" htmlFor="extra">
                <Input
                  id="extra"
                  inputMode="numeric"
                  value={state.extraCost}
                  onChange={(event) =>
                    setState((prev) => ({ ...prev, extraCost: event.target.value }))
                  }
                  placeholder="0"
                />
              </Field>
            </div>

            <Field
              label="স্থির খরচ (মাসিক)"
              hint="ভাড়া, বিজ্ঞাপন, ইন্টারনেট — সব মিলিয়ে"
              htmlFor="fixed"
            >
              <Input
                id="fixed"
                inputMode="numeric"
                value={state.fixedCost}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, fixedCost: event.target.value }))
                }
                placeholder="5000"
              />
            </Field>

            <SaveButton slug="profit-loss-calculator" state={state} />
            <GuestHint slug="profit-loss-calculator" />
          </div>
        </ToolPanel>
      }
      results={
        <div id="profit-print" className="space-y-4">
          {sellingPrice > 0 && costPrice > 0 && quantity > 0 ? (
            <>
              <ResultCard title="ফলাফল">
                <div className="space-y-3">
                  <StatBlock
                    label={profitable ? "মোট লাভ" : "মোট ক্ষতি"}
                    value={formatBDT(Math.abs(result.profit))}
                    tone={profitable ? "brand" : "danger"}
                    hint={`মার্জিন ${result.margin.toFixed(1)}% · মার্কআপ ${result.markup.toFixed(1)}%`}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <StatBlock label="মোট আয়" value={formatBDT(result.revenue)} />
                    <StatBlock label="মোট খরচ" value={formatBDT(result.totalCost)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatBlock
                      label="প্রতি পিসে লাভ"
                      value={formatBDT(result.perUnitProfit)}
                      tone={result.perUnitProfit >= 0 ? "accent" : "danger"}
                    />
                    <StatBlock
                      label="মাসে বিক্রি (দরকার)"
                      value={
                        result.breakEvenUnits !== null
                          ? `${result.breakEvenUnits} পিস`
                          : "লাভ নেই"
                      }
                      hint="স্থির খরচ বাড়াতে"
                    />
                  </div>
                </div>
              </ResultCard>

              <p className="rounded-lg border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {profitable ? (
                  <>
                    {quantity} পিস বিক্রি করলে মোট লাভ{" "}
                    <strong className="text-primary">{formatBDT(result.profit)}</strong>। স্থির খরচ
                    বাড়াতে প্রতি মাসে অন্তত{" "}
                    <strong className="text-foreground">{result.breakEvenUnits ?? 0} পিস</strong>{" "}
                    বিক্রি করতে হবে।
                  </>
                ) : (
                  <>
                    বর্তমান মূল্যে {quantity} পিস বিক্রি করলে{" "}
                    <strong className="text-destructive">{formatBDT(Math.abs(result.profit))} ক্ষতি</strong>{" "}
                    হবে। প্রতি পিসে লাভ নেই বলে স্থির খরচ কভারই হবে না — মূল্য বাড়ানো বা খরচ কমানো দরকার।
                  </>
                )}
              </p>
            </>
          ) : (
            <EmptyResult message="বিক্রয়মূল্য, ক্রয়মূল্য ও পরিমাণ দিলে লাভ-ক্ষতি দেখুন।" />
          )}
        </div>
      }
    />
  );
}

export function computeProfitLoss(input: {
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  fixedCost: number;
  extraCost: number;
}) {
  const revenue = input.sellingPrice * input.quantity;
  const totalCost = (input.costPrice + input.extraCost) * input.quantity + input.fixedCost;
  return {
    revenue: round2(revenue),
    totalCost: round2(totalCost),
    profit: round2(revenue - totalCost),
  };
}