"use client";

/**
 * Quotation generator — দরপত্র তৈরি.
 *
 * A quotation is a promise of a price, so validity matters: the tool shows how
 * many days the offer is still open and flags an expired one instead of quietly
 * printing a stale price.
 */

import * as React from "react";
import { AlertTriangle, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToolState } from "@/lib/use-tool-state";
import { copyToClipboard, downloadCsv } from "@/lib/export";
import { trackDownload, trackToolCompleted } from "@/lib/analytics";
import { daysBetween, formatDateBN, todayInputValue } from "@/lib/bn";

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

const SLUG = "quotation-generator";

interface State {
  business: BusinessInfo;
  number: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientDetails: string;
  items: LineItem[];
  taxRate: string;
  discount: string;
  note: string;
  terms: string;
}

const DEFAULT_STATE: State = {
  business: { name: "", owner: "", phone: "", email: "", address: "" },
  number: "",
  date: "",
  validUntil: "",
  clientName: "",
  clientDetails: "",
  items: [newLineItem()],
  taxRate: "0",
  discount: "0",
  note: "দরপত্রটি প্রাপ্তির সময় পর্যন্ত বৈধ। মূল্য অনুমোদনের জন্য আমাদের সাথে যোগাযোগ করুন।",
  terms: "মাল্টপ্ল বা কোম্পানির শর্ত প্রযোজ্য। ডেলিভারি চার্জ অন্তর্ভুক্ত নয়।",
};

function buildQuoteNumber(date: string): string {
  if (!date) return "QUO-0000-01";
  return `QUO-${date.replace(/-/g, "")}-01`;
}

export function QuotationGenerator() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  const totals = React.useMemo(
    () => computeTotals(state.items, Number(state.taxRate) || 0, Number(state.discount) || 0),
    [state.items, state.taxRate, state.discount],
  );

  const number = state.number || buildQuoteNumber(state.date);
  const daysLeft = state.validUntil ? daysBetween(new Date(), state.validUntil) : null;
  const expired = daysLeft !== null && daysLeft < 0;
  const isReady = Boolean(state.business.name && state.clientName && totals.total > 0);

  function patch(next: Partial<State>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  const asText = [
    `${state.business.name || "ব্যবসা"} — দরপত্র`,
    `নম্বর: ${number}`,
    `তারিখ: ${state.date ? formatDateBN(state.date) : "—"}`,
    state.validUntil ? `বৈধতা: ${formatDateBN(state.validUntil)}` : "",
    `গ্রাহক: ${state.clientName || "—"}`,
    "",
    ...state.items
      .filter((item) => item.description)
      .map(
        (item, index) =>
          `${index + 1}. ${item.description} — ${item.qty} × ${item.unit} = ${Number(item.qty) * Number(item.unit)}`,
      ),
    "",
    `সর্বমোট: ${totals.total}`,
  ]
    .filter(Boolean)
    .join("\n");

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

          <ToolPanel title="দরপত্রের তথ্য">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="দরপত্র নম্বর" htmlFor="q-number" hint="খালি রাখলে তারিখ থেকে তৈরি হবে">
                <Input
                  id="q-number"
                  value={state.number}
                  onChange={(event) => patch({ number: event.target.value })}
                  placeholder="QUO-20250101-01"
                />
              </Field>
              <Field label="তারিখ" required htmlFor="q-date">
                <Input
                  id="q-date"
                  type="date"
                  value={state.date}
                  onChange={(event) => patch({ date: event.target.value })}
                />
              </Field>
              <Field label="বৈধতার শেষ তারিখ" htmlFor="q-valid">
                <Input
                  id="q-valid"
                  type="date"
                  value={state.validUntil}
                  min={state.date || todayInputValue()}
                  onChange={(event) => patch({ validUntil: event.target.value })}
                />
              </Field>
              <Field label="গ্রাহকের নাম" required htmlFor="q-client">
                <Input
                  id="q-client"
                  value={state.clientName}
                  onChange={(event) => patch({ clientName: event.target.value })}
                  placeholder="যেমন: স্কুল কমিটি"
                />
              </Field>
              <Field label="গ্রাহকের বিবরণ" htmlFor="q-client-details" className="sm:col-span-2">
                <Textarea
                  id="q-client-details"
                  rows={2}
                  value={state.clientDetails}
                  onChange={(event) => patch({ clientDetails: event.target.value })}
                  placeholder="প্রতিষ্ঠান, ঠিকানা, ফোন"
                />
              </Field>
            </div>
          </ToolPanel>

          <ToolPanel title="আনুমানিক কাজ">
            <LineItemsEditor items={state.items} onChange={(items) => patch({ items })} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="ভ্যাট (%)" htmlFor="q-tax">
                <Input
                  id="q-tax"
                  inputMode="decimal"
                  value={state.taxRate}
                  onChange={(event) => patch({ taxRate: event.target.value })}
                />
              </Field>
              <Field label="ছাড় (টাকা)" htmlFor="q-discount">
                <Input
                  id="q-discount"
                  inputMode="decimal"
                  value={state.discount}
                  onChange={(event) => patch({ discount: event.target.value })}
                />
              </Field>
              <Field label="শর্তাবলী" htmlFor="q-terms" className="sm:col-span-2">
                <Textarea
                  id="q-terms"
                  rows={2}
                  value={state.terms}
                  onChange={(event) => patch({ terms: event.target.value })}
                />
              </Field>
            </div>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="দরপত্রের অবস্থা">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="সর্বমোট" value={`৳${totals.total.toLocaleString("en-IN")}`} tone="brand" />
              <StatBlock
                label="বৈধতা"
                value={daysLeft === null ? "—" : expired ? "মেয়াদ শেষ" : `${daysLeft} দিন`}
                tone={expired ? "danger" : "brand"}
              />
            </div>
            {expired ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-2xs leading-relaxed text-destructive">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                বৈধতার মেয়াদ শেষ হয়ে গেছে। নতুন তারিখ দিয়ে আবার তৈরি করুন, নাহলে গ্রাহক সেই দামে আর বাঁধা থাকবেন না।
              </p>
            ) : null}
          </ResultCard>

          <DocumentSheet
            id="quotation-sheet"
            business={state.business}
            heading="Quotation / দরপত্র"
            meta={[
              { label: "নম্বর", value: number },
              { label: "তারিখ", value: state.date ? formatDateBN(state.date, { short: true }) : "—" },
              ...(state.validUntil
                ? [{ label: "বৈধ", value: formatDateBN(state.validUntil, { short: true }) }]
                : []),
            ]}
            client={{ label: "গ্রাহক", name: state.clientName, details: state.clientDetails }}
            totals={totals}
            taxRate={Number(state.taxRate) || 0}
            showDiscount={true}
            note={state.note}
            terms={state.terms}
            signatureLabel="প্রতিস্থানকারীর স্বাক্ষর"
          >
            <ItemsTable items={state.items} />
          </DocumentSheet>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="quotation-sheet"
              filename={number}
              title={`${state.business.name || "দরপত্র"} — ${number}`}
              subtitle={state.clientName ? `গ্রাহক: ${state.clientName}` : undefined}
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady}
              onClick={async () => {
                const ok = await copyToClipboard(asText);
                setCopied(ok);
                if (ok) {
                  window.setTimeout(() => setCopied(false), 2000);
                  toast.success("দরপত্রের হিসাব কপি হয়েছে।");
                } else {
                  toast.error("কপি করা যায়নি।");
                }
              }}
            >
              <Copy aria-hidden />
              {copied ? "কপি হয়েছে" : "হিসাব কপি"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={totals.subtotal <= 0}
              onClick={() => {
                downloadCsv(number, [
                  ["বিবরণ", "পরিমাণ", "একক মূল্য", "মোট"],
                  ...state.items.map((item) => [item.description, item.qty, item.unit, ""]),
                  [],
                  ["সর্বমোট", totals.total],
                ]);
                trackDownload(SLUG, { format: "csv" });
                toast.success("CSV ডাউনলোড হয়েছে।");
              }}
            >
              CSV
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={!isReady || expired}
            onClick={() => {
              trackToolCompleted(SLUG, { items: state.items.length });
              toast.success("দরপত্র প্রস্তুত।");
            }}
          >
            দরপত্র প্রস্তুত
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}