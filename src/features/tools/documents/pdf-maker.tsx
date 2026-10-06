"use client";

/**
 * PDF maker — বাংলায় ডকুমেন্ট থেকে PDF.
 *
 * Types any Bangla text (letter, application, note) and prints it on a real
 * page size. The preview node is the exact node handed to html2canvas, so what
 * you see is what lands in the PDF — including long text, which is sliced
 * across pages instead of being shrunk to unreadable.
 */

import * as React from "react";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { useToolState } from "@/lib/use-tool-state";
import { copyToClipboard } from "@/lib/export";
import { trackToolCompleted } from "@/lib/analytics";
import { cn } from "@/lib/utils";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint, PdfButton, SaveButton } from "@/features/tools/save-button";

const SLUG = "pdf-maker";

type PageSize = "a4" | "a5" | "letter";

interface State {
  title: string;
  body: string;
  dateLine: string;
  reference: string;
  footer: string;
  pageSize: PageSize;
  fontSize: string;
  align: "left" | "justify";
  signature: boolean;
}

const DEFAULT_STATE: State = {
  title: "",
  body: "",
  dateLine: "",
  reference: "",
  footer: "",
  pageSize: "a4",
  fontSize: "14",
  align: "justify",
  signature: true,
};

const PAGE_OPTIONS = [
  { value: "a4", label: "A4 (210 × ২৯৭ mm)" },
  { value: "a5", label: "A5 (148 × ২১০ mm)" },
  { value: "letter", label: "Letter (216 × ২৭৯ mm)" },
];

const ALIGN_OPTIONS = [
  { value: "left", label: "বাম দিকে" },
  { value: "justify", label: "দুই দিকে সমান (বাংলায় ভালো)" },
];

const FONT_SIZES = ["12", "14", "16", "18"];

export function PdfMaker() {
  const { state, setState, reset } = useToolState<State>(SLUG, DEFAULT_STATE);
  const [copied, setCopied] = React.useState(false);

  const words = state.body.trim() ? state.body.trim().split(/\s+/).length : 0;
  const isReady = Boolean(state.body.trim());
  const lineHeight = Number(state.fontSize) * 2;

  function patch<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel
            title="ডকুমেন্টের লেখা"
            onReset={reset}
            actions={<SaveButton slug={SLUG} state={state} disabled={!isReady} />}
          >
            <div className="grid gap-4">
              <Field label="শিরোনাম" htmlFor="pdf-title">
                <Input
                  id="pdf-title"
                  value={state.title}
                  onChange={(event) => patch("title", event.target.value)}
                  placeholder="ঐচ্ছিক — যেমন: বিবরণী"
                />
              </Field>
              <Field label="লেখা" required htmlFor="pdf-body" hint="যা লিখবেন তা-ই PDF-এ যাবে">
                <Textarea
                  id="pdf-body"
                  rows={12}
                  value={state.body}
                  onChange={(event) => patch("body", event.target.value)}
                  placeholder="এখানে আপনার লেখা লিখুন…"
                  className="leading-loose"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="তারিখের লাইন" htmlFor="pdf-date" hint="ডান কোণে">
                  <Input
                    id="pdf-date"
                    value={state.dateLine}
                    onChange={(event) => patch("dateLine", event.target.value)}
                    placeholder="যেমন: ১৫ জানুয়ারি ২০২৬"
                  />
                </Field>
                <Field label="রেফারেন্স নম্বর" htmlFor="pdf-ref">
                  <Input
                    id="pdf-ref"
                    value={state.reference}
                    onChange={(event) => patch("reference", event.target.value)}
                    placeholder="ঐচ্ছিক"
                  />
                </Field>
                <Field label="ফুটার" htmlFor="pdf-footer" className="sm:col-span-2">
                  <Input
                    id="pdf-footer"
                    value={state.footer}
                    onChange={(event) => patch("footer", event.target.value)}
                    placeholder="যেমন: ধন্যবাদ"
                  />
                </Field>
              </div>
            </div>
          </ToolPanel>

          <ToolPanel title="পাতার সেটিংস">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="পাতার আকার" htmlFor="pdf-size">
                <Select
                  id="pdf-size"
                  value={state.pageSize}
                  onValueChange={(value) => patch("pageSize", value as PageSize)}
                  options={PAGE_OPTIONS}
                />
              </Field>
              <Field label="অক্ষরের আকার" htmlFor="pdf-font">
                <Select
                  id="pdf-font"
                  value={state.fontSize}
                  onValueChange={(value) => patch("fontSize", value)}
                  options={FONT_SIZES.map((size) => ({ value: size, label: `${size} pt` }))}
                />
              </Field>
              <Field label="সারিবদ্ধতা" htmlFor="pdf-align" className="sm:col-span-2">
                <Select
                  id="pdf-align"
                  value={state.align}
                  onValueChange={(value) => patch("align", value as State["align"])}
                  options={ALIGN_OPTIONS}
                />
              </Field>
            </div>
            <label className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
                checked={state.signature}
                onChange={(event) => patch("signature", event.target.checked)}
              />
              নিচে স্বাক্ষরের জায়গা রাখুন
            </label>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="ডকুমেন্ট">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="শব্দ" value={words} />
              <StatBlock
                label="আনুমানিক পাতা"
                value={words > 0 ? Math.max(1, Math.ceil(words / 280)) : 0}
                tone="brand"
              />
            </div>
          </ResultCard>

          <div
            id="pdf-sheet"
            className="mx-auto rounded-xl border border-border bg-white p-8 text-slate-800 shadow-sm print:border-0 print:p-0 print:shadow-none"
            style={{ maxWidth: state.pageSize === "a5" ? "22rem" : "100%" }}
          >
            {state.reference ? (
              <p className="text-right text-[0.65rem] text-slate-500">রেঃ {state.reference}</p>
            ) : null}
            {state.dateLine ? (
              <p className="text-right text-[0.65rem] text-slate-500">{state.dateLine}</p>
            ) : null}

            {state.title ? (
              <h3 className="mt-3 text-center text-lg font-bold tracking-tight">{state.title}</h3>
            ) : null}

            <p
              className={cn(
                "mt-4 whitespace-pre-wrap",
                state.align === "justify" ? "text-justify" : "text-left",
              )}
              style={{ fontSize: `${state.fontSize}px`, lineHeight: `${lineHeight}px` }}
            >
              {state.body || "আপনার লেখা এখানে দেখা যাবে।"}
            </p>

            {state.signature && state.body.trim() ? (
              <div className="mt-10 ml-auto w-48 text-center text-xs">
                <div className="h-12 border-b border-slate-400" />
                <p className="mt-1">স্বাক্ষর</p>
              </div>
            ) : null}

            {state.footer ? (
              <p className="mt-8 border-t border-slate-200 pt-3 text-center text-[0.65rem] text-slate-500">
                {state.footer}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PdfButton
              targetId="pdf-sheet"
              filename={state.title || "document"}
              title={state.title || undefined}
              subtitle={state.dateLine || undefined}
              format={state.pageSize}
              orientation="portrait"
              disabled={!isReady}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!isReady}
              onClick={async () => {
                const ok = await copyToClipboard(state.body);
                setCopied(ok);
                if (ok) {
                  window.setTimeout(() => setCopied(false), 2000);
                  toast.success("লেখা কপি হয়েছে।");
                } else {
                  toast.error("কপি করা যায়নি।");
                }
              }}
            >
              <Copy aria-hidden />
              {copied ? "কপি হয়েছে" : "লেখা কপি"}
            </Button>
          </div>

          <Button
            className="w-full"
            disabled={!isReady}
            onClick={() => {
              trackToolCompleted(SLUG, { pageSize: state.pageSize });
              toast.success("PDF তৈরি হয়েছে।");
            }}
          >
            <FileText aria-hidden />
            PDF তৈরি করুন
          </Button>
          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}