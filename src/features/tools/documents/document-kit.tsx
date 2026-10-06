"use client";

/**
 * Shared building blocks for the three Bangladeshi small-business documents:
 * invoice, quotation and receipt.
 *
 * The maths lives here once so all three always agree — the line totals, the
 * discount, the VAT and the "amount in words" line that customers check.
 */

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { moneyInBanglaWords } from "@/lib/bn";
import { formatBDT, parseNumber, round2, uid } from "@/lib/utils";

export interface LineItem {
  id: string;
  description: string;
  qty: string;
  unit: string;
}

export interface BusinessInfo {
  name: string;
  owner: string;
  phone: string;
  email: string;
  address: string;
}

export interface DocumentTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
}

export function newLineItem(description = ""): LineItem {
  return { id: uid("item"), description, qty: "1", unit: "0" };
}

export function computeTotals(
  items: LineItem[],
  taxRate: number,
  discount: number,
): DocumentTotals {
  const subtotal = round2(
    items.reduce((sum, item) => {
      const qty = parseNumber(item.qty);
      const unit = parseNumber(item.unit);
      return sum + (Number.isFinite(qty) && Number.isFinite(unit) ? qty * unit : 0);
    }, 0),
  );
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = round2(subtotal - safeDiscount);
  const rate = Math.min(Math.max(taxRate, 0), 100);
  const tax = round2((taxable * rate) / 100);
  return { subtotal, discount: round2(safeDiscount), taxable, tax, total: round2(taxable + tax) };
}

export function BusinessFields({
  value,
  onChange,
}: {
  value: BusinessInfo;
  onChange: (next: BusinessInfo) => void;
}) {
  function patch(key: keyof BusinessInfo, next: string) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="ব্যবসার নাম" required htmlFor="doc-business">
        <Input
          id="doc-business"
          value={value.name}
          onChange={(event) => patch("name", event.target.value)}
          placeholder="যেমন: রহমান ট্রেডার্স"
        />
      </Field>
      <Field label="মালিকের নাম" htmlFor="doc-owner">
        <Input
          id="doc-owner"
          value={value.owner}
          onChange={(event) => patch("owner", event.target.value)}
          placeholder="যেমন: মো. রহমান"
        />
      </Field>
      <Field label="মোবাইল" htmlFor="doc-phone">
        <Input
          id="doc-phone"
          value={value.phone}
          onChange={(event) => patch("phone", event.target.value)}
          placeholder="01XXXXXXXXX"
        />
      </Field>
      <Field label="ইমেইল" htmlFor="doc-email">
        <Input
          id="doc-email"
          type="email"
          value={value.email}
          onChange={(event) => patch("email", event.target.value)}
          placeholder="name@example.com"
        />
      </Field>
      <Field label="ঠিকানা" htmlFor="doc-address" className="sm:col-span-2">
        <Textarea
          id="doc-address"
          rows={2}
          value={value.address}
          onChange={(event) => patch("address", event.target.value)}
          placeholder="বাজার, উপজেলা, জেলা"
        />
      </Field>
    </div>
  );
}

export function LineItemsEditor({
  items,
  onChange,
}: {
  items: LineItem[];
  onChange: (next: LineItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="grid grid-cols-[1fr_4.5rem_6rem_2rem] items-end gap-2 rounded-lg border border-border p-3"
          >
            <Field label={index === 0 ? "বিবরণ" : undefined} htmlFor={`item-desc-${item.id}`}>
              <Input
                id={`item-desc-${item.id}`}
                value={item.description}
                onChange={(event) =>
                  onChange(
                    items.map((row) =>
                      row.id === item.id ? { ...row, description: event.target.value } : row,
                    ),
                  )
                }
                placeholder="যেমন: মডিউল সার্ভিস"
              />
            </Field>
            <Field label={index === 0 ? "পরিমাণ" : undefined} htmlFor={`item-qty-${item.id}`}>
              <Input
                id={`item-qty-${item.id}`}
                value={item.qty}
                inputMode="decimal"
                onChange={(event) =>
                  onChange(
                    items.map((row) => (row.id === item.id ? { ...row, qty: event.target.value } : row)),
                  )
                }
              />
            </Field>
            <Field label={index === 0 ? "একক মূল্য" : undefined} htmlFor={`item-unit-${item.id}`}>
              <Input
                id={`item-unit-${item.id}`}
                value={item.unit}
                inputMode="decimal"
                onChange={(event) =>
                  onChange(
                    items.map((row) => (row.id === item.id ? { ...row, unit: event.target.value } : row)),
                  )
                }
              />
            </Field>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${index + 1} নম্বর লাইন মুছে ফেলুন`}
              onClick={() => onChange(items.filter((row) => row.id !== item.id))}
            >
              <Trash2 aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" onClick={() => onChange([...items, newLineItem()])}>
        <Plus aria-hidden />
        লাইন যোগ করুন
      </Button>
    </div>
  );
}

export function TotalsRows({
  totals,
  taxRate,
  showDiscount = true,
}: {
  totals: DocumentTotals;
  taxRate: number;
  showDiscount?: boolean;
}) {
  return (
    <dl className="ml-auto w-full max-w-xs space-y-1 text-sm">
      <Row label="সাবটোটাল" value={formatBDT(totals.subtotal)} />
      {showDiscount && totals.discount > 0 ? (
        <Row label="ছাড়" value={`− ${formatBDT(totals.discount)}`} />
      ) : null}
      {taxRate > 0 ? <Row label={`ভ্যাট (${taxRate}%)`} value={formatBDT(totals.tax)} /> : null}
      <div className="flex items-center justify-between border-t border-slate-300 pt-1.5">
        <dt className="font-semibold">সর্বমোট</dt>
        <dd className="text-base font-bold tabular-nums">{formatBDT(totals.total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-600">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/** Printable sheet used by all three documents. */
export function DocumentSheet({
  id,
  business,
  heading,
  meta,
  client,
  children,
  totals,
  taxRate,
  showDiscount,
  note,
  terms,
  signatureLabel = "স্বাক্ষর",
}: {
  id: string;
  business: BusinessInfo;
  heading: string;
  meta: { label: string; value: string }[];
  client?: { label: string; name: string; details: string };
  children: React.ReactNode;
  totals?: DocumentTotals;
  taxRate?: number;
  showDiscount?: boolean;
  note?: string;
  terms?: string;
  signatureLabel?: string;
}) {
  return (
    <div
      id={id}
      className="rounded-xl border border-border bg-white p-6 text-slate-800 shadow-sm print:border-0 print:p-0 print:shadow-none"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{business.name || "আপনার ব্যবসার নাম"}</h3>
          {business.owner ? <p className="mt-0.5 text-xs">{business.owner}</p> : null}
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {[business.address, business.phone, business.email].filter(Boolean).join(" • ") || "যোগাযোগের তথ্য"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{heading}</p>
          <dl className="mt-2 space-y-0.5 text-xs">
            {meta.map((row) => (
              <div key={row.label} className="flex justify-end gap-2">
                <dt className="text-slate-500">{row.label}</dt>
                <dd className="font-medium tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {client ? (
        <section className="mt-4">
          <p className="text-2xs uppercase tracking-wide text-slate-500">{client.label}</p>
          <p className="text-sm font-semibold">{client.name || "—"}</p>
          {client.details ? (
            <p className="mt-0.5 text-xs text-slate-600">{client.details}</p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-4">{children}</section>

      {totals ? (
        <section className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-[14rem] flex-1">
            {totals.total > 0 ? (
              <p className="text-xs">
                <span className="text-slate-500">কথায়: </span>
                {moneyInBanglaWords(totals.total)}
              </p>
            ) : null}
            {note ? <p className="mt-2 text-xs leading-relaxed text-slate-600">{note}</p> : null}
            {terms ? <p className="mt-1 text-2xs leading-relaxed text-slate-500">{terms}</p> : null}
          </div>
          <TotalsRows totals={totals} taxRate={taxRate ?? 0} showDiscount={showDiscount} />
        </section>
      ) : null}

      <footer className="mt-6 flex items-end justify-between gap-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
        <p className="max-w-[16rem] leading-relaxed">
          এই ডকুমেন্টটি ব্রাউজারেই তৈরি হয়েছে। প্রয়োজনে ছাপ নিয়ে স্বাক্ষর করুন।
        </p>
        <div className="text-center">
          <div className="h-10 w-40 border-b border-slate-400" />
          <p className="mt-1">{signatureLabel}</p>
        </div>
      </footer>
    </div>
  );
}

export function ItemsTable({ items }: { items: LineItem[] }) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="border-b border-slate-300 text-left text-2xs uppercase tracking-wide text-slate-500">
          <th className="w-6 py-1.5">#</th>
          <th className="py-1.5">বিবরণ</th>
          <th className="w-12 py-1.5 text-right">পরিমাণ</th>
          <th className="w-24 py-1.5 text-right">একক মূল্য</th>
          <th className="w-24 py-1.5 text-right">মোট</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const lineTotal = round2(parseNumber(item.qty) * parseNumber(item.unit));
          return (
            <tr key={item.id} className="border-b border-slate-100 align-top">
              <td className="py-2 text-slate-500">{index + 1}</td>
              <td className="py-2 pr-2">{item.description || "—"}</td>
              <td className="py-2 text-right tabular-nums">{parseNumber(item.qty)}</td>
              <td className="py-2 text-right tabular-nums">{formatBDT(parseNumber(item.unit))}</td>
              <td className="py-2 text-right tabular-nums">{formatBDT(lineTotal)}</td>
            </tr>
          );
        })}
        {items.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-4 text-center text-slate-500">
              কোনো লাইন যোগ করা হয়নি।
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
