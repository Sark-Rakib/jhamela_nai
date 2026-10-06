"use client";

/**
 * Receipt generator — রসিদ তৈরি.
 *
 * Payment-first: the paid amount is the main field, and the balance left (if
 * any) is computed for the visitor. Payment channels cover the ones actually
 * used in Bangladesh — cash, bKash, Nagad, bank transfer, cheque.
 */

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { formatDateBN, todayInputValue } from "@/lib/bn";
import { trackToolCompleted } from "@/lib/analytics";
import { formatBDT, parseNumber, round2 } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";
import {
  BusinessFields,
  DocumentSheet,
  ItemsTable,
  LineItemsEditor,
  computeTotals,
  newLineItem,
  type BusinessInfo,
  type LineItem,
} from "./document-kit";

const SLUG = "receipt-generator";

type Method = "cash" | "bkash" | "nagad" | "bank" | "cheque";

interface State {
  business: BusinessInfo;
  number: string;
  date: string;
  payerName: string;
  payerDetails: string;
  method: Method;
  reference: string;
  items: LineItem[];
  discount: string;
  paid: string;
  note: string;
  showItems: boolean;
}

const DEFAULT_STATE: State = {
  business: { name: "", owner: "", phone: "", email: "", address: "" },
  number: "",
  date: "",
  payerName: "",
  payerDetails: "",
  method: "cash",
  reference: "",
  items: [newLineItem()],
  discount: "0",
  paid: "",
  note: "স্বাক্ষরিত ব্যক্তির হাতে সরাসরি প্রাপ্তি স্বীকার করা হলো।",
  showItems: true,
};

const METHOD_OPTIONS = [
  { value: "cash", label: "নগদ" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "নগদ (Nagad)" },
  { value: "bank", label: "ব্যাংক ট্রান্সফার" },
  { value: "cheque", label: "চেক" },
];

function buildReceiptNumber(date: string): string {
  if (!date) return "RCPT-0000-01";
  return `RCPT-${date.replace(/-/g, "")}-01`;
}

export function ReceiptGenerator() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);

  const totals = React.useMemo(
    () => computeTotals(state.items, 0, Number(state.discount) || 0),
    [state.items, state.discount],
  );

  const number = state.number || buildReceiptNumber(state.date);
  const paid = round2(parseNumber(state.paid));
  const balance = round2(totals.total - paid);
  const isReady = Boolean(state.business.name && (state.payerName || paid > 0));

  function patch(next: Partial<State>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="ব্যবসার তথ্য"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <BusinessFields value={state.business} onChange={(business) => patch({ business })} />
          </ToolPanel>

          <ToolPanel title="রসিদের তথ্য">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="রসিদ নম্বর" htmlFor="rc-number" hint="খালি রাখলে তারিখ থেকে তৈরি হবে">
                <Input
                  id="rc-number"
                  value={state.number}
                  onChange={(event) => patch({ number: event.target.value })}
                  placeholder="RCPT-20250101-01"
                />
              </Field>
              <Field label="তারিখ" required htmlFor="rc-date">
                <Input
                  id="rc-date"
                  type="date"
                  value={state.date}
                  onChange={(event) => patch({ date: event.target.value })}
                />
              </Field>
              <Field label="পরিশোধকারীর নাম" htmlFor="rc-payer">
                <Input
                  id="rc-payer"
                  value={state.payerName}
                  onChange={(event) => patch({ payerName: event.target.value })}
                  placeholder="যেমন: মো. করিম"
                />
              </Field>
              <Field label="পরিশোধের মাধ্যম" htmlFor="rc-method">
                <Select
                  id="rc-method"
                  value={state.method}
                  onValueChange={(value) => patch({ method: value as Method })}
                  options={METHOD_OPTIONS}
                />
              </Field>
              <Field
                label="ট্রানজেকশন / চেক নম্বর"
                htmlFor="rc-ref"
                hint="bKash ও ব্যাংকের ক্ষেত্রে"
                className="sm:col-span-2"
              >
                <Input
                  id="rc-ref"
                  value={state.reference}
                  onChange={(event) => patch({ reference: event.target.value })}
                  placeholder="যেমন: 9ABC123XYZ"
                />
              </Field>
              <Field label="পরিশোধের পরিমাণ" required htmlFor="rc-paid">
                <Input
                  id="rc-paid"
                  inputMode="decimal"
                  value={state.paid}
                  onChange={(event) => patch({ paid: event.target.value })}
                  placeholder="যেমন: ৫০০০"
                />
              </Field>
              <Field label="ছাড় (টাকা)" htmlFor="rc-discount">
                <Input
                  id="rc-discount"
                  inputMode="decimal"
                  value={state.discount}
                  onChange={(event) => patch({ discount: event.target.value })}
                />
              </Field>
            </div>
          </ToolPanel>

          <ToolPanel
            title="কী কেনা হয়েছে"
            description="শুধু টাকার পরিমাণ দিলেও চলবে — লাইন খালি রাখলেও রসিদ তৈরি হবে।"
          >
            <LineItemsEditor items={state.items} onChange={(items) => patch({ items })} />
            <div className="mt-4 space-y-3">
              <Field label="মন্তব্য" htmlFor="rc-note">
                <Textarea
                  id="rc-note"
                  rows={2}
                  value={state.note}
                  onChange={(event) => patch({ note: event.target.value })}
                />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patch({ items: [...state.items, newLineItem()] })}
              >
                <Plus aria-hidden />
                আরেকটি লাইন
              </Button>
              {state.items.length > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch({ items: [state.items[0]] })}
                >
                  <Trash2 aria-hidden />
                  অতিরিক্ত লাইন সরান
                </Button>
              ) : null}
            </div>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="পরিশোধের হিসাব">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="মোট" value={formatBDT(totals.total)} />
              <StatBlock label="পরিশোধ" value={formatBDT(paid)} tone="brand" />
              <StatBlock
                label="বাকি"
                value={formatBDT(balance)}
                tone={balance > 0 ? "danger" : balance < 0 ? "accent" : "default"}
                hint={balance < 0 ? "অগ্রিপত পরিশোধ" : undefined}
              />
              <StatBlock
                label="মাধ্যম"
                value={METHOD_OPTIONS.find((item) => item.value === state.method)?.label ?? "—"}
              />
            </div>
            {balance > 0 ? (
              <p className="mt-3 text-2xs leading-relaxed text-muted-foreground">
                এখনো {formatBDT(balance)} বাকি আছে — রসিদে শুধু প্রাপ্ত অর্থই লিখে নিন।
              </p>
            ) : null}
          </ResultCard>

          <DocumentSheet
            id="receipt-sheet"
            business={state.business}
            heading="Receipt / রসিদ"
            meta={[
              { label: "নম্বর", value: number },
              { label: "তারিখ", value: state.date ? formatDateBN(state.date, { short: true }) : "—" },
            ]}
            client={{
              label: "পরিশোধকারী",
              name: state.payerName,
              details: state.reference ? `${METHOD_OPTIONS.find((item) => item.value === state.method)?.label} — ${state.reference}` : "",
            }}
            totals={{ ...totals, total: paid, tax: 0 }}
            taxRate={0}
            showDiscount={false}
            note={state.note}
            signatureLabel="গ্রহণকারীর স্বাক্ষর"
          >
            <ItemsTable items={state.showItems ? state.items : []} />
          </DocumentSheet>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="receipt-sheet"
              filename={number}
              title={`${state.business.name || "রসিদ"} — ${number}`}
              subtitle={state.date ? formatDateBN(state.date) : undefined}
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => patch({ date: todayInputValue() })}
              disabled={Boolean(state.date)}
            >
              আজকের তারিখ
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={!isReady}
            onClick={() => {
              trackToolCompleted(SLUG, { method: state.method });
              toast.success("রসিদ প্রস্তুত।");
            }}
          >
            রসিদ প্রস্তুত
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}