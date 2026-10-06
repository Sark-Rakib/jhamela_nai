"use client";

/**
 * Travel budget planner — ভ্রমণের খরচের হিসাব.
 *
 * Cost-first, not guesswork: the traveller enters what they already know
 * (people, nights, ticket price) and the tool derives the per-person and per-day
 * numbers, then flags where the money is actually leaking.
 */

import * as React from "react";
import { Plane, Ticket, Utensils, Hotel, Bus, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Field, Input } from "@/components/ui/input";
import { Progress, Select } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/card";
import { useToolState } from "@/lib/use-tool-state";
import { formatDateBN } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { formatBDT, parseNumber, round2 } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, SaveButton } from "@/features/tools/save-button";

const SLUG = "travel-budget-planner";

type Transport = "bus" | "train" | "flight" | "launch";

interface State {
  destination: string;
  start: string;
  end: string;
  people: string;
  transport: Transport;
  ticketPerPerson: string;
  hotelPerNight: string;
  foodPerDay: string;
  localPerDay: string;
  miscTotal: string;
}

const DEFAULT_STATE: State = {
  destination: "",
  start: "",
  end: "",
  people: "2",
  transport: "bus",
  ticketPerPerson: "1200",
  hotelPerNight: "2500",
  foodPerDay: "800",
  localPerDay: "400",
  miscTotal: "2000",
};

const TRANSPORT_OPTIONS = [
  { value: "bus", label: "বাস" },
  { value: "train", label: "ট্রেন" },
  { value: "flight", label: "ফ্লাইট" },
  { value: "launch", label: "লঞ্চ" },
];

const TRANSPORT_ICON: Record<Transport, React.ComponentType<{ className?: string }>> = {
  bus: Bus,
  train: Bus,
  flight: Plane,
  launch: Bus,
};

export function TravelBudgetPlanner() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);

  const nights = React.useMemo(() => {
    if (!state.start || !state.end) return 0;
    const start = new Date(state.start).getTime();
    const end = new Date(state.end).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
    return Math.round((end - start) / 86_400_000);
  }, [state.start, state.end]);

  const people = Math.max(1, parseNumber(state.people) || 1);
  const days = Math.max(1, nights + 1);

  const costs = React.useMemo(() => {
    const ticket = round2((parseNumber(state.ticketPerPerson) || 0) * people);
    const hotel = round2((parseNumber(state.hotelPerNight) || 0) * nights);
    const food = round2((parseNumber(state.foodPerDay) || 0) * days * people);
    const local = round2((parseNumber(state.localPerDay) || 0) * days * people);
    const misc = round2(parseNumber(state.miscTotal) || 0);
    const total = round2(ticket + hotel + food + local + misc);
    return { ticket, hotel, food, local, misc, total };
  }, [state, people, days, nights]);

  const perPerson = round2(costs.total / people);
  const perDay = round2(costs.total / days);
  const isReady = costs.total > 0 && Boolean(state.destination);
  const TransportIcon = TRANSPORT_ICON[state.transport];

  const breakdown = [
    { key: "ticket", label: "যাত্রা ভাড়া", value: costs.ticket, icon: Ticket },
    { key: "hotel", label: "থাকার খরচ", value: costs.hotel, icon: Hotel },
    { key: "food", label: "খাবার", value: costs.food, icon: Utensils },
    { key: "local", label: "ভেতরে ওঠানামা", value: costs.local, icon: Bus },
    { key: "misc", label: "বিভিন্ন", value: costs.misc, icon: ShoppingBag },
  ].filter((item) => item.value > 0);

  const biggest = breakdown.reduce(
    (best, item) => (item.value > (best?.value ?? -1) ? item : best),
    breakdown[0],
  );
  const Transport = TransportIcon;

  function patch<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
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
              <Field label="গন্তব্য" required htmlFor="tb-destination">
                <Input
                  id="tb-destination"
                  value={state.destination}
                  onChange={(event) => patch("destination", event.target.value)}
                  placeholder="যেমন: কক্সবাজার"
                />
              </Field>
              <Field label="যাত্রার মাধ্যম" htmlFor="tb-transport">
                <Select
                  id="tb-transport"
                  value={state.transport}
                  onValueChange={(value) => patch("transport", value as Transport)}
                  options={TRANSPORT_OPTIONS}
                />
              </Field>
              <Field label="যাত্রার শুরু" htmlFor="tb-start">
                <Input
                  id="tb-start"
                  type="date"
                  value={state.start}
                  onChange={(event) => patch("start", event.target.value)}
                />
              </Field>
              <Field label="ফেরার তারিখ" htmlFor="tb-end">
                <Input
                  id="tb-end"
                  type="date"
                  value={state.end}
                  min={state.start || undefined}
                  onChange={(event) => patch("end", event.target.value)}
                />
              </Field>
              <Field label="যাত্রীর সংখ্যা" htmlFor="tb-people" className="sm:col-span-2">
                <Input
                  id="tb-people"
                  inputMode="numeric"
                  value={state.people}
                  onChange={(event) => patch("people", event.target.value)}
                />
              </Field>
            </div>
            {nights > 0 ? (
              <p className="mt-3 text-2xs text-faint-foreground">
                {days} দিন · {nights} রাত{state.start && state.end ? ` (${formatDateBN(state.start, { short: true })} থেকে ${formatDateBN(state.end, { short: true })})` : ""}
              </p>
            ) : state.start && state.end ? (
              <p className="mt-3 text-2xs text-destructive">ফেরার তারিখ শুরুর তারিখের পরে হতে হবে।</p>
            ) : null}
          </ToolPanel>

          <ToolPanel title="খরচের ধর" description="প্রতিটি ঘরকে শুধু আপনার হিসাব বসান — বাস্তব ভাড়া নয়।">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ভাড়া (জনপ্রতি)" htmlFor="tb-ticket">
                <Input
                  id="tb-ticket"
                  inputMode="decimal"
                  value={state.ticketPerPerson}
                  onChange={(event) => patch("ticketPerPerson", event.target.value)}
                />
              </Field>
              <Field label="হোটেল (রাতপ্রতি)" htmlFor="tb-hotel">
                <Input
                  id="tb-hotel"
                  inputMode="decimal"
                  value={state.hotelPerNight}
                  onChange={(event) => patch("hotelPerNight", event.target.value)}
                />
              </Field>
              <Field label="খাবার (দিনপ্রতি, জনপ্রতি)" htmlFor="tb-food">
                <Input
                  id="tb-food"
                  inputMode="decimal"
                  value={state.foodPerDay}
                  onChange={(event) => patch("foodPerDay", event.target.value)}
                />
              </Field>
              <Field label="ভেতরে যাওয়া-আসা (দিনপ্রতি, জনপ্রতি)" htmlFor="tb-local">
                <Input
                  id="tb-local"
                  inputMode="decimal"
                  value={state.localPerDay}
                  onChange={(event) => patch("localPerDay", event.target.value)}
                />
              </Field>
              <Field label="বাকি সব খরচ (মোট)" htmlFor="tb-misc" className="sm:col-span-2">
                <Input
                  id="tb-misc"
                  inputMode="decimal"
                  value={state.miscTotal}
                  onChange={(event) => patch("miscTotal", event.target.value)}
                />
              </Field>
            </div>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="মোট খরচ">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock
                label="সর্বমোট"
                value={formatBDT(costs.total)}
                tone="brand"
                hint={`${days} দিন · ${people} জন`}
              />
              <StatBlock label="জনপ্রতি" value={formatBDT(perPerson)} />
              <StatBlock label="দিনপ্রতি (গোট দল)" value={formatBDT(perDay)} />
              <StatBlock label="বড় খাত" value={biggest ? biggest.label : "—"} />
            </div>

            {breakdown.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {breakdown.map((item) => {
                  const Icon = item.icon;
                  const share = costs.total > 0 ? (item.value / costs.total) * 100 : 0;
                  return (
                    <li key={item.key}>
                      <div className="flex items-center justify-between text-2xs">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="size-3" aria-hidden />
                          {item.label}
                        </span>
                        <span className="tabular-nums">
                          {formatBDT(item.value)} · {Math.round(share)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <Progress value={share} label={`${item.label} ভাগ`} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </ResultCard>

          {costs.total > 0 ? (
            <ToolPanel title="যেভাবে কমানো যায়">
              <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Transport className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  যাত্রার মাধ্যম বদলে {formatBDT(costs.ticket)} থেকে বাস বা ট্রেনে গেলে সবচেয়ে বেশি সাশ্রয় হবে।
                </li>
                {costs.hotel > 0 ? (
                  <li className="flex items-start gap-2">
                    <Hotel className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    থাকার খরচ মোটের {Math.round((costs.hotel / costs.total) * 100)}% — এক রাত কম থাকলে{" "}
                    {formatBDT(parseNumber(state.hotelPerNight))} বাঁচবে।
                  </li>
                ) : null}
                <li className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  জনপ্রতি হিসাবে {formatBDT(perDay)} দিন খরচ হলে সাশ্রয়ের সবচেয়ে সহজ উপায় হলো দিনে একটা কম খাবার বাদ দেওয়া।
                </li>
              </ul>
              <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
                <span className="text-xs text-muted-foreground">হিসাব বাকি রেখে যান</span>
                <Badge tone="brand">১০% জমাতে রাখুন</Badge>
              </div>
            </ToolPanel>
          ) : null}

          <Button
            className="w-full"
            disabled={!isReady}
            onClick={() => {
              trackToolCompleted(SLUG, { people, days });
              toast.success("ভ্রমণের খরচের হিসাব প্রস্তুত।");
            }}
          >
            হিসাব সম্পন্ন
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}