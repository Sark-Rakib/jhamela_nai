"use client";

/**
 * Client-side PDF/CSV export.
 *
 * Bangla note: jsPDF's built-in fonts have no Bengali glyphs, so any text export
 * would render as empty boxes. Every export therefore rasterises a real DOM node
 * with html2canvas — the browser draws the text with the web font, so Bangla is
 * always correct — and places that image on the requested page size.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface ExportOptions {
  /** Filename without extension. */
  filename: string;
  title?: string;
  subtitle?: string;
  orientation?: "portrait" | "landscape";
  /** Paper size; defaults to A4. */
  format?: PdfPageSize;
  /** Hide elements marked `.no-print` during capture. */
  scale?: number;
}

/** jsPDF format names used across the app. */
export type PdfPageSize = "a4" | "a5" | "letter";

const HEADER_FONT = '"Noto Sans Bengali", system-ui, sans-serif';

/**
 * Paints an optional title/subtitle band above the captured bitmap using the
 * real web font, then returns the extended canvas under the same reference.
 */
async function drawBanglaHeader(
  canvas: HTMLCanvasElement,
  title?: string,
  subtitle?: string,
): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.ready;
  } catch {
    /* font loading API unavailable — fall through to the default font */
  }

  const padding = Math.max(16, Math.round(canvas.width * 0.035));
  const titleSize = Math.max(15, Math.round(canvas.width * 0.024));
  const subSize = Math.max(12, Math.round(canvas.width * 0.017));

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return;

  measure.font = `600 ${titleSize}px ${HEADER_FONT}`;
  const titleHeight = title ? titleSize * 1.45 : 0;
  measure.font = `400 ${subSize}px ${HEADER_FONT}`;
  const subtitleHeight = subtitle ? subSize * 1.5 : 0;
  const bandHeight = padding / 2 + titleHeight + subtitleHeight + padding / 2;
  if (bandHeight <= 0) return;

  const composed = document.createElement("canvas");
  composed.width = canvas.width;
  composed.height = canvas.height + Math.round(bandHeight);
  const context = composed.getContext("2d");
  if (!context) return;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, composed.width, composed.height);
  context.drawImage(canvas, 0, Math.round(bandHeight));
  context.textBaseline = "top";
  context.fillStyle = "#111111";
  context.font = `600 ${titleSize}px ${HEADER_FONT}`;
  let y = padding / 2;
  if (title) {
    context.fillText(title, padding, y);
    y += titleHeight;
  }
  context.fillStyle = "#6b7280";
  context.font = `400 ${subSize}px ${HEADER_FONT}`;
  if (subtitle) context.fillText(subtitle, padding, y);

  const target = canvas.getContext("2d");
  if (!target) return;
  canvas.height = composed.height;
  target.fillStyle = "#ffffff";
  target.fillRect(0, 0, canvas.width, canvas.height);
  target.drawImage(composed, 0, 0);
}

/** Rasterises a DOM node and downloads it as a single-page PDF. */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const { filename, title, subtitle, orientation = "portrait", format = "a4", scale = 2 } = options;

  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
    windowWidth: element.scrollWidth,
    onclone(clonedDoc) {
      // Force light colours so a dark-mode screenshot stays printable.
      clonedDoc.documentElement.classList.remove("dark");
      clonedDoc.querySelectorAll("[data-print-hide]").forEach((node) => {
        (node as HTMLElement).style.display = "none";
      });
    },
  });

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
    compress: true,
  });

  // jsPDF reports the first page size; landscape swaps the usable axes.
  const baseWidth = pdf.internal.pageSize.getWidth();
  const baseHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = orientation === "landscape" ? baseHeight : baseWidth;
  const pageHeight = orientation === "landscape" ? baseWidth : baseHeight;
  const margin = 10;
  let cursor = margin;

  // jsPDF can only draw Latin text, so the Bangla header is painted onto the
  // captured bitmap with the page font and travels with the image.
  if (title || subtitle) {
    await drawBanglaHeader(canvas, title, subtitle);
  }

  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - cursor - margin;
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  if (imageHeight <= printableHeight) {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", margin, cursor, printableWidth, imageHeight);
  } else {
    // Slice the capture across pages instead of shrinking it into mush.
    const pageCanvasHeight = Math.floor((printableHeight * canvas.width) / printableWidth);
    let offset = 0;
    let page = 0;
    while (offset < canvas.height) {
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = Math.min(pageCanvasHeight, canvas.height - offset);
      const context = slice.getContext("2d");
      if (!context) break;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height,
      );

      if (page > 0) {
        pdf.addPage();
        cursor = margin;
      }
      const sliceHeight = (slice.height * printableWidth) / slice.width;
      pdf.addImage(slice.toDataURL("image/jpeg", 0.94), "JPEG", margin, cursor, printableWidth, sliceHeight);
      offset += pageCanvasHeight;
      page += 1;
    }
  }

  pdf.save(`${slugifyFilename(filename)}.pdf`);
}

export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\n");

  downloadBlob(filename, new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" }), ".csv");
}

export function downloadText(filename: string, text: string, mime = "text/plain"): void {
  downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8;` }), ".txt");
}

function downloadBlob(filename: string, blob: Blob, extension: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugifyFilename(filename)}${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function slugifyFilename(input: string): string {
  return (
    input
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase()
      .slice(0, 80) || "jhamela-nai"
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}