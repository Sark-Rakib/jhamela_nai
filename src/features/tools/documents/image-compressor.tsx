"use client";

/**
 * Image compressor — ছবি ছোট করুন.
 *
 * The whole pipeline runs in the browser: decode → optional resize on a canvas
 * → re-encode. No upload, no queue, no server round-trip — which also means no
 * privacy risk and it keeps working on a weak connection.
 */

import * as React from "react";
import { Download, ImageIcon, ShieldCheck, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Select } from "@/components/ui/primitives";
import { Progress } from "@/components/ui/primitives";
import { formatBytes } from "@/lib/bn";
import { track, trackDownload, trackToolCompleted } from "@/lib/analytics";

import { ToolLayout, ToolPanel, ResultCard, StatBlock } from "@/features/tools/tool-panel";
import { GuestHint } from "@/features/tools/save-button";

const SLUG = "image-compressor";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface Loaded {
  file: File;
  url: string;
  width: number;
  height: number;
  size: number;
}

interface Compressed {
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
}

const FORMAT_OPTIONS = [
  { value: "image/jpeg", label: "JPEG (ছবির জন্য সেরা)" },
  { value: "image/webp", label: "WebP (আরও ছোট)" },
  { value: "image/png", label: "PNG (ট্রান্সপারেন্সি রাখে)" },
];

const MAX_SIDE_OPTIONS = [
  { value: "0", label: "মাপ বদলাবেন না" },
  { value: "2560", label: "২৫৬০ px" },
  { value: "1920", label: "১৯২০ px" },
  { value: "1280", label: "১২৮০ px" },
  { value: "800", label: "৮০০ px" },
  { value: "480", label: "৪৮০ px (আপলোডের জন্য)" },
];

async function decode(file: File): Promise<HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      return canvas as unknown as HTMLImageElement;
    }
    bitmap.close();
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    // The bitmap is already drawn; the object URL can go.
    URL.revokeObjectURL(url);
  }
}

export function ImageCompressor() {
  const [source, setSource] = React.useState<Loaded | null>(null);
  const [output, setOutput] = React.useState<Compressed | null>(null);
  const [format, setFormat] = React.useState<OutputFormat>("image/jpeg");
  const [maxSide, setMaxSide] = React.useState("1280");
  const [quality, setQuality] = React.useState(0.72);
  const [busy, setBusy] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Object URLs are revoked once, on unmount. Doing it in an effect keyed on
  // `source`/`output` would free the URL of an image that is still on screen.
  const sourceUrlRef = React.useRef<string | null>(null);
  const outputUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    sourceUrlRef.current = source?.url ?? null;
  }, [source]);

  React.useEffect(() => {
    outputUrlRef.current = output?.url ?? null;
  }, [output]);

  React.useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    };
  }, []);

  async function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("একটি ছবির ফাইল বেছে নিন।");
      return;
    }
    try {
      const image = await decode(file);
      const url = URL.createObjectURL(file);
      // Handlers are the only place allowed to free the previous URL.
      if (source) URL.revokeObjectURL(source.url);
      if (output) URL.revokeObjectURL(output.url);
      setSource({ file, url, width: image.width, height: image.height, size: file.size });
      setOutput(null);
      track("tool_opened", { tool: SLUG });
    } catch {
      toast.error("ছবিটি পড়া যায়নি। অন্য ফাইল চেষ্টা করুন।");
    }
  }

  async function compress() {
    if (!source) return;
    setBusy(true);
    try {
      const image = await decode(source.file);
      const limit = Number(maxSide);
      const ratio =
        limit > 0 && Math.max(image.width, image.height) > limit ? limit / Math.max(image.width, image.height) : 1;
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas unavailable");
      if (format === "image/jpeg") {
        // JPEG has no alpha channel; without this, transparent areas turn black.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality),
      );
      if (!blob) throw new Error("encode failed");

      const url = URL.createObjectURL(blob);
      const base = source.file.name.replace(/\.[^.]+$/, "");
      if (output) URL.revokeObjectURL(output.url);
      setOutput({ url, size: blob.size, width, height, filename: `${base}-compressed.${format.split("/")[1]}` });
      trackToolCompleted(SLUG, { format: format.split("/")[1] });
    } catch {
      toast.error("ছবিটি ছোট করা যায়নি। অন্য ফরম্যাট বা ফাইল চেষ্টা করুন।");
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    if (source) URL.revokeObjectURL(source.url);
    if (output) URL.revokeObjectURL(output.url);
    setSource(null);
    setOutput(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const saved = source && output ? source.size - output.size : 0;
  const savedPercent = source && output && source.size > 0 ? (saved / source.size) * 100 : 0;
  const grew = output !== null && source !== null && output.size >= source.size;

  return (
    <ToolLayout
      form={
        <div className="space-y-5">
          <ToolPanel title="ছবি নির্বাচন" description="যেকোনো ছবি — ফোনের ছবিও চলবে।">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file) void loadFile(file);
              }}
              className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                dragging ? "border-primary bg-primary-soft/40" : "border-border bg-surface-muted"
              }`}
            >
              <ImageIcon className="mx-auto size-6 text-muted-foreground" aria-hidden />
              <p className="mt-2 text-sm font-medium text-foreground">
                {source ? source.file.name : "ছবি টেনে আনুন বা ফাইল বেছে নিন"}
              </p>
              <p className="mt-1 text-2xs text-faint-foreground">
                ছবি আপলোড হয় না — সবকিছু আপনার ব্রাউজারেই ঘটে।
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                  <Upload aria-hidden />
                  ফাইল বেছে নিন
                </Button>
                {source ? (
                  <Button variant="ghost" size="sm" onClick={clear}>
                    <Trash2 aria-hidden />
                    মুছুন
                  </Button>
                ) : null}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void loadFile(file);
                }}
              />
            </div>
            {source ? (
              <p className="mt-3 text-2xs text-muted-foreground">
                মূল: {source.width}×{source.height} px · {formatBytes(source.size)}
              </p>
            ) : null}
          </ToolPanel>

          <ToolPanel title="সেটিংস">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ফরম্যাট" htmlFor="img-format">
                <Select
                  id="img-format"
                  value={format}
                  onValueChange={(value) => setFormat(value as OutputFormat)}
                  options={FORMAT_OPTIONS}
                />
              </Field>
              <Field label="সর্বোচ্চ পাশ" htmlFor="img-side" hint="ছোট করলে মানসম্পন্নতাও কমে">
                <Select
                  id="img-side"
                  value={maxSide}
                  onValueChange={setMaxSide}
                  options={MAX_SIDE_OPTIONS}
                />
              </Field>
              {format !== "image/png" ? (
                <Field
                  label={`গুণগত মান: ${Math.round(quality * 100)}%`}
                  htmlFor="img-quality"
                  className="sm:col-span-2"
                  hint="৭০–৮০% সাধারণত চোখে ধরা পড়ে না"
                >
                  <input
                    id="img-quality"
                    type="range"
                    min={0.3}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
                </Field>
              ) : null}
            </div>

            <Button
              className="mt-4 w-full"
              disabled={!source || busy}
              onClick={() => void compress()}
            >
              {busy ? "ছোট করা হচ্ছে…" : "ছবি ছোট করুন"}
            </Button>
          </ToolPanel>
        </div>
      }
      results={
        <div className="space-y-4">
          <ResultCard title="ফলাফল">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="মূল" value={source ? formatBytes(source.size) : "—"} />
              <StatBlock
                label="নতুন"
                value={output ? formatBytes(output.size) : "—"}
                tone={output ? "brand" : "default"}
              />
              <StatBlock
                label="সাশ্রয়"
                value={output ? `${Math.max(0, Math.round(savedPercent))}%` : "—"}
                tone="brand"
              />
              <StatBlock
                label="মাপ"
                value={output ? `${output.width}×${output.height}` : "—"}
              />
            </div>

            {output ? (
              <>
                <div className="mt-4 space-y-1.5">
                  <Progress
                    value={Math.min(100, Math.max(0, savedPercent))}
                    tone={grew ? "danger" : "brand"}
                    label="ফাইল সাইজে সাশ্রয়"
                  />
                  <p className="text-2xs text-faint-foreground">
                    {grew
                      ? "ফাইল বড় হয়েছে — মান কমিয়ে বা পাশ ছোট করে আবার চেষ্টা করুন।"
                      : `প্রায় ${formatBytes(Math.abs(saved))} জায়গা বাঁচছে।`}
                  </p>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={output.url} alt="ছোট করা ছবির প্রিভিউ" className="max-h-72 w-full object-contain" />
                </div>

                <Button
                  className="mt-3 w-full"
                  onClick={() => {
                    const anchor = document.createElement("a");
                    anchor.href = output.url;
                    anchor.download = output.filename;
                    document.body.appendChild(anchor);
                    anchor.click();
                    anchor.remove();
                    trackDownload(SLUG, { format: format.split("/")[1] });
                    toast.success("ছোট করা ছবি ডাউনলোড হয়েছে।");
                  }}
                >
                  <Download aria-hidden />
                  ছবি ডাউনলোড করুন
                </Button>
              </>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                ছবি বেছে নিয়ে “ছবি ছোট করুন” চাপুন।
              </p>
            )}

            <p className="mt-4 flex items-start gap-2 text-2xs leading-relaxed text-faint-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              ক্যানভাস দিয়ে এনকোড করার কারণে ছবির EXIF তথ্য (তারিখ, মডেল, লোকেশন) মুছে যায় — প্রয়োজন হলে আগে
              মেটাডেটা সংরক্ষণ করুন।
            </p>
          </ResultCard>

          <GuestHint slug={SLUG} />
        </div>
      }
    />
  );
}