"use client";

/**
 * Shopping list — কেনাকাটার তালিকা.
 *
 * Budget-aware: the list tracks what is still unpurchased, the running total and
 * how much of the budget is left, so a bazaar trip ends with numbers that match
 * the receipt.
 */

import * as React from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Progress, Select } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { downloadCsv } from "@/lib/export";
import { trackDownload, trackToolCompleted } from "@/lib/analytics";
import { formatBDT, parseNumber, round2, uid } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "shopping-list";

type Category = "বাজার" | "ওষুধ" | "পোশাক" | "ঘরবাড়ি" | "অন্যান্য";

interface Item {
  id: string;
  name: string;
  qty: string;
  unitPrice: string;
  category: Category;
  bought: boolean;
}

interface State {
  budget: string;
  items: Item[];
  note: string;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "বাজার", label: "বাজার" },
  { value: "ওষুধ", label: "ওষুধ" },
  { value: "পোশাক", label: "পোশাক" },
  { value: "ঘরবাড়ি", label: "ঘরবাড়ি" },
  { value: "অন্যান্য", label: "অন্যান্য" },
];

const QUICK_ADDS = ["চাল", "ডাল", "আলু", "পেঁয়াজ", "তেল", "ডিম", "বিরিয়ানি", "মশলা", "সাবান", "দুধ"];

const DEFAULT_STATE: State = {
  budget: "3000",
  items: [],
  note: "",
};

export function ShoppingList() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [name, setName] = React.useState("");
  const [qty, setQty] = React.useState("1");
  const [price, setPrice] = React.useState("");
  const [category, setCategory] = React.useState<Category>("বাজার");

  const budget = round2(parseNumber(state.budget));
  const totals = React.useMemo(() => {
    const remaining = state.items.filter((item) => !item.bought);
    const planned = round2(state.items.reduce((sum, item) => sum + parseNumber(item.qty) * parseNumber(item.unitPrice), 0));
    const spent = round2(
      state.items
        .filter((item) => item.bought)
        .reduce((sum, item) => sum + parseNumber(item.qty) * parseNumber(item.unitPrice), 0),
    );
    return { planned, spent, remaining, left: round2(budget - planned) };
  }, [state.items, budget]);

  const bought = state.items.filter((item) => item.bought).length;
  const progress = state.items.length > 0 ? (bought / state.items.length) * 100 : 0;
  const overBudget = budget > 0 && totals.planned > budget;
  const isReady = state.items.length > 0;

  function addItem(label?: string) {
    const itemName = (label ?? name).trim();
    if (!itemName) return;
    setState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: uid("item"),
          name: itemName,
          qty: qty || "1",
          unitPrice: price || "0",
          category,
          bought: false,
        },
      ],
    }));
    setName("");
    setPrice("");
  }

  function patchItem(id: string, next: Partial<Item>) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }));
  }

  const grouped = React.useMemo(() => {
    const map = new Map<Category, Item[]>();
    for (const item of state.items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()];
  }, [state.items]);

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="বাজেট"
            description="কত টাকা খরচ করতে চান? তালিকা এই সীমার মধ্যেই থাকে কি না দেখাবে।"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <Field label="মোট বাজেট" htmlFor="sl-budget">
              <Input
                id="sl-budget"
                inputMode="decimal"
                value={state.budget}
                onChange={(event) => setState((prev) => ({ ...prev, budget: event.target.value }))}
              />
            </Field>
          </ToolPanel>

          <ToolPanel title="নতুন জিনিস যোগ" description="নাম লিখে পরিমাণ ও দাম দিন।">
            <div className="grid gap-3 sm:grid-cols-[1fr_5rem_6rem]">
              <Field label="জিনিসের নাম" htmlFor="sl-name">
                <Input
                  id="sl-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addItem();
                  }}
                  placeholder="যেমন: চাল ৫ কেজি"
                />
              </Field>
              <Field label="পরিমাণ" htmlFor="sl-qty">
                <Input
                  id="sl-qty"
                  inputMode="decimal"
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                />
              </Field>
              <Field label="একক দাম" htmlFor="sl-price">
                <Input
                  id="sl-price"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addItem();
                  }}
                />
              </Field>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field label="ক্যাটাগরি" htmlFor="sl-category">
                <Select
                  id="sl-category"
                  value={category}
                  onValueChange={(value) => setCategory(value as Category)}
                  options={CATEGORY_OPTIONS}
                />
              </Field>
              <Button className="mt-6" onClick={() => addItem()} disabled={!name.trim()}>
                <Plus aria-hidden />
                যোগ করুন
              </Button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-2xs text-faint-foreground">দ্রুত যোগ:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ADDS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => addItem(label)}
                    className="rounded-full border border-border px-2.5 py-1 text-2xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          </ToolPanel>

          <ToolPanel title="মন্তব্য">
            <Field label="যা মনে রাখতে হবে" htmlFor="sl-note">
              <Input
                id="sl-note"
                value={state.note}
                onChange={(event) => setState((prev) => ({ ...prev, note: event.target.value }))}
                placeholder="যেমন: দোকানে গিয়ে ছাড় নেবেন"
              />
            </Field>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <div id="shopping-sheet">
            <ResultCard title="হিসাব">
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="বাজেট" value={formatBDT(budget)} />
                <StatBlock
                  label={overBudget ? "বাজেট ছাড়াবেনি" : "বাজেট বাকি"}
                  value={formatBDT(Math.abs(totals.left))}
                  tone={overBudget ? "danger" : "brand"}
                />
                <StatBlock label="পরিকল্পিত খরচ" value={formatBDT(totals.planned)} />
                <StatBlock label="কেনা হয়েছে" value={formatBDT(totals.spent)} />
              </div>
              {budget > 0 ? (
                <div className="mt-4 space-y-1.5">
                  <Progress
                    value={(totals.planned / budget) * 100}
                    tone={overBudget ? "danger" : "brand"}
                    label="বাজেট ব্যবহার"
                  />
                  <p className="text-2xs text-faint-foreground">
                    {overBudget
                      ? `বাজেট ${formatBDT(totals.planned - budget)} ছাড়াবেনি।`
                      : `আরও ${formatBDT(totals.left)} খরচ করা যাবে।`}
                  </p>
                </div>
              ) : null}
              {state.items.length > 0 ? (
                <>
                  <div className="mt-4 space-y-1.5">
                    <Progress value={progress} tone="accent" label="কেনাকাটার অগ্রগতি" />
                    <p className="text-2xs text-faint-foreground">
                      {bought} / {state.items.length} টি কেনা হয়েছে
                    </p>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-800">
                    <h3 className="text-sm font-bold">কেনাকাটার তালিকা</h3>
                    <ul className="mt-2 space-y-0.5">
                      {grouped.map(([group, items]) => (
                        <li key={group}>
                          <p className="text-2xs font-bold uppercase tracking-wide text-slate-500">{group}</p>
                          <ul>
                            {items.map((item) => (
                              <li key={item.id} className="text-xs leading-relaxed text-slate-700">
                                {item.bought ? "☑" : "☐"} {item.name} — {item.qty} × {formatBDT(parseNumber(item.unitPrice))}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    {state.note ? (
                      <p className="mt-2 border-t border-slate-200 pt-2 text-2xs text-slate-600">{state.note}</p>
                    ) : null}
                    <p className="mt-2 text-sm font-bold">মোট: {formatBDT(totals.planned)}</p>
                  </div>
                </>
              ) : null}
            </ResultCard>
          </div>

          <ToolPanel title="তালিকা">
            {state.items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface-muted px-4 py-6 text-center text-sm text-muted-foreground">
                এখনো কিছু যোগ হয়নি — উপরের ঘর থেকে শুরু করুন।
              </p>
            ) : (
              <ul className="space-y-2">
                {state.items.map((item) => {
                  const lineTotal = round2(parseNumber(item.qty) * parseNumber(item.unitPrice));
                  return (
                    <li key={item.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start gap-2">
                        <input
                          id={`sl-${item.id}`}
                          type="checkbox"
                          className="mt-1 size-4 shrink-0 rounded border-border accent-primary"
                          checked={item.bought}
                          onChange={(event) => patchItem(item.id, { bought: event.target.checked })}
                        />
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`sl-${item.id}`}
                            className={`block text-sm ${item.bought ? "text-muted-foreground line-through" : ""}`}
                          >
                            {item.name}
                          </label>
                          <p className="mt-0.5 text-2xs text-faint-foreground">
                            {item.qty} × {formatBDT(parseNumber(item.unitPrice))} = {formatBDT(lineTotal)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${item.name} মুছে ফেলুন`}
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              items: prev.items.filter((row) => row.id !== item.id),
                            }))
                          }
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Input
                          aria-label={`${item.name} — পরিমাণ`}
                          inputMode="decimal"
                          value={item.qty}
                          onChange={(event) => patchItem(item.id, { qty: event.target.value })}
                          className="h-8 text-xs"
                        />
                        <Input
                          aria-label={`${item.name} — একক দাম`}
                          inputMode="decimal"
                          value={item.unitPrice}
                          onChange={(event) => patchItem(item.id, { unitPrice: event.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </ToolPanel>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="shopping-sheet"
              filename="shopping-list"
              title="কেনাকাটার তালিকা"
              subtitle={budget > 0 ? `বাজেট: ${formatBDT(budget)}` : undefined}
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady}
              onClick={() => {
                downloadCsv("shopping-list", [
                  ["জিনিস", "পরিমাণ", "একক দাম", "মোট", "কেনা হয়েছে"],
                  ...state.items.map((item) => [
                    item.name,
                    parseNumber(item.qty),
                    parseNumber(item.unitPrice),
                    round2(parseNumber(item.qty) * parseNumber(item.unitPrice)),
                    item.bought ? "হ্যাঁ" : "না",
                  ]),
                  [],
                  ["মোট", totals.planned],
                ]);
                trackDownload(SLUG, { format: "csv" });
                toast.success("CSV ডাউনলোড হয়েছে।");
              }}
            >
              CSV
            </Button>
            <Button
              className="flex-1"
              disabled={!isReady}
              onClick={() => {
                trackToolCompleted(SLUG, { items: state.items.length });
                toast.success("তালিকা প্রস্তুত।");
              }}
            >
              <ShoppingCart aria-hidden />
              তালিকা প্রস্তুত
            </Button>
          </div>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}