"use client";

/**
 * Invoice generator — বিল তৈরি.
 *
 * Sequential invoice numbers (INV-YYYYMMDD-01) derived from the issue date, a
 * VAT field that defaults to the Bangladesh standard 15%, and a printable A4
 * sheet. Everything runs in the browser; no data leaves the device.
 */

import * as React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { useToolState } from "@/lib/use-tool-state";
import { copyToClipboard, downloadCsv } from "@/lib/export";
import { trackDownload, trackToolCompleted } from "@/lib/analytics";
import { formatDateBN, todayInputValue } from "@/lib/bn";

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

const SLUG = "invoice-generator";

interface State {
  business: BusinessInfo;
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientDetails: string;
  items: LineItem[];
  taxRate: string;
  discount: string;
  note: string;
  terms: string;
  showWords: boolean;
}

const DEFAULT_STATE: State = {
  business: { name: "", owner: "", phone: "", email: "", address: "" },
  number: "",
  date: "",
  dueDate: "",
  clientName: "",
  clientDetails: "",
  items: [newLineItem()],
  taxRate: "15",
  discount: "0",
  note: "ধন্যবাদ — পরবর্তী সহযোগিতার জন্য আন্তরিক।",
  terms: "পণ্য বিনিময়ের সময় মূল্য যাচাই করে নেবেন। এই ডকুমেন্টটি সফটওয়্যারে তৈরি, স্বাক্ষরবিহীন।",
  showWords: true,
};

function buildInvoiceNumber(date: string): string {
  if (!date) return "INV-0000-01";
  const compact = date.replace(/-/g, "");
  return `INV-${compact}-01`;
}

export function InvoiceGenerator() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  const totals = React.useMemo(
    () => computeTotals(state.items, Number(state.taxRate) || 0, Number(state.discount) || 0),
    [state.items, state.taxRate, state.discount],
  );

  const number = state.number || buildInvoiceNumber(state.date);
  const isReady = Boolean(state.business.name && state.clientName && totals.total > 0);

  function patch(next: Partial<State>) {
    setState((prev) => ({ ...prev, ...next }));
  }

  const asText = [
    `${state.business.name || "ব্যবসা"} — বিল`,
    `বিল নং: ${number}`,
    `তারিখ: ${state.date ? formatDateBN(state.date) : "—"}`,
    `গ্রাহক: ${state.clientName || "—"}`,
    "",
    ...state.items
      .filter((item) => item.description)
      .map(
        (item, index) =>
          `${index + 1}. ${item.description} — ${item.qty} × ${item.unit} = ${Number(item.qty) * Number(item.unit)}`,
      ),
    "",
    `সাবটোটাল: ${totals.subtotal}`,
    `ভ্যাট (${state.taxRate}%): ${totals.tax}`,
    `সর্বমোট: ${totals.total}`,
  ].join("\n");

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="ব্যবসার তথ্য"
            description="যে নামে ট্যাক্স ইনভয়েস চাইবেন সেটিই লিখুন।"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <BusinessFields value={state.business} onChange={(business) => patch({ business })} />
          </ToolPanel>

          <ToolPanel title="বিলের তথ্য">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="বিল নম্বর" htmlFor="inv-number" hint="খালি রাখলে তারিখ থেকে তৈরি হবে">
                <Input
                  id="inv-number"
                  value={state.number}
                  onChange={(event) => patch({ number: event.target.value })}
                  placeholder="INV-20250101-01"
                />
              </Field>
              <Field label="তারিখ" required htmlFor="inv-date">
                <Input
                  id="inv-date"
                  type="date"
                  value={state.date}
                  onChange={(event) => patch({ date: event.target.value })}
                />
              </Field>
              <Field label="পরিশোধের শেষ তারিখ" htmlFor="inv-due">
                <Input
                  id="inv-due"
                  type="date"
                  value={state.dueDate}
                  min={state.date || todayInputValue()}
                  onChange={(event) => patch({ dueDate: event.target.value })}
                />
              </Field>
              <Field label="গ্রাহকের নাম" required htmlFor="inv-client">
                <Input
                  id="inv-client"
                  value={state.clientName}
                  onChange={(event) => patch({ clientName: event.target.value })}
                  placeholder="যেমন: ঢাকা ট্রেডার্স"
                />
              </Field>
              <Field label="গ্রাহকের ঠিকানা" htmlFor="inv-client-details" className="sm:col-span-2">
                <Textarea
                  id="inv-client-details"
                  rows={2}
                  value={state.clientDetails}
                  onChange={(event) => patch({ clientDetails: event.target.value })}
                  placeholder="ঠিকানা, ফোন"
                />
              </Field>
            </div>
          </ToolPanel>

          <ToolPanel title="পণ্য বা সেবা">
            <LineItemsEditor items={state.items} onChange={(items) => patch({ items })} />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="ভ্যাট (%)" htmlFor="inv-tax">
                <Input
                  id="inv-tax"
                  inputMode="decimal"
                  value={state.taxRate}
                  onChange={(event) => patch({ taxRate: event.target.value })}
                />
              </Field>
              <Field label="ছাড় (টাকা)" htmlFor="inv-discount">
                <Input
                  id="inv-discount"
                  inputMode="decimal"
                  value={state.discount}
                  onChange={(event) => patch({ discount: event.target.value })}
                />
              </Field>
              <Field label="মন্তব্য" htmlFor="inv-note" className="sm:col-span-2">
                <Textarea
                  id="inv-note"
                  rows={2}
                  value={state.note}
                  onChange={(event) => patch({ note: event.target.value })}
                />
              </Field>
            </div>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="হিসাব">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="সাবটোটাল" value={`৳${totals.subtotal.toLocaleString("en-IN")}`} />
              <StatBlock label="ভ্যাট" value={`৳${totals.tax.toLocaleString("en-IN")}`} />
              <StatBlock
                label="সর্বমোট"
                value={`৳${totals.total.toLocaleString("en-IN")}`}
                tone="brand"
                hint={`${state.items.length} টি লাইন`}
              />
              <StatBlock
                label="বিল নম্বর"
                value={number.replace("INV-", "#")}
                tone={isReady ? "brand" : "default"}
              />
            </div>
          </ResultCard>

          <DocumentSheet
            id="invoice-sheet"
            business={state.business}
            heading="Invoice / বিল"
            meta={[
              { label: "নম্বর", value: number },
              { label: "তারিখ", value: state.date ? formatDateBN(state.date, { short: true }) : "—" },
              ...(state.dueDate
                ? [{ label: "ডিউ", value: formatDateBN(state.dueDate, { short: true }) }]
                : []),
            ]}
            client={{
              label: "গ্রাহক",
              name: state.clientName,
              details: state.clientDetails,
            }}
            totals={state.showWords ? totals : undefined}
            taxRate={Number(state.taxRate) || 0}
            showDiscount={true}
            note={state.note}
            terms={state.terms}
            signatureLabel="বিক্রেতার স্বাক্ষর"
          >
            <ItemsTable items={state.items} />
          </DocumentSheet>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="invoice-sheet"
              filename={number}
              title={`${state.business.name || "বিল"} — ${number}`}
              subtitle={state.date ? formatDateBN(state.date) : undefined}
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
                  toast.success("বিলের হিসাব কপি হয়েছে।");
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
                  ...state.items.map((item) => [
                    item.description,
                    Number(item.qty) || 0,
                    Number(item.unit) || 0,
                    Math.round((Number(item.qty) || 0) * (Number(item.unit) || 0) * 100) / 100,
                  ]),
                  [],
                  ["সাবটোটাল", totals.subtotal],
                  ["ভ্যাট", totals.tax],
                  ["সর্বমোট", totals.total],
                ]);
                trackDownload(SLUG, { format: "csv" });
                toast.success("CSV ডাউনলোড হয়েছে — এক্সেলে খোলা যাবে।");
              }}
            >
              CSV
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={!isReady}
            onClick={() => {
              trackToolCompleted(SLUG, { items: state.items.length });
              toast.success("বিল প্রস্তুত। PDF নিয়ে কাগজে ছাপ নিন।");
            }}
          >
            বিল প্রস্তুত
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}