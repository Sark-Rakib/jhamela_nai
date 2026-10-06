import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** 1234 -> "১২৩৪" */
export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/** "১২৩৪" -> "1234" (also tolerates ASCII and Bengali decimal marks). */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))
    .replace(/[০১২৩৪৫৬৭৮৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
}

export interface CurrencyOptions {
  /** Show Bengali numerals. Default: false — Latin digits scan faster. */
  bengali?: boolean;
  /** Drop the ৳ symbol (useful inside input adornments). */
  bare?: boolean;
  /** Max fraction digits. Default 0 for taka, 2 elsewhere. */
  digits?: number;
}

/** Formats a number as Bangladeshi Taka using the South Asian digit grouping (lakh/crore). */
export function formatBDT(value: number, options: CurrencyOptions = {}): string {
  const { bengali = false, bare = false, digits } = options;
  if (!Number.isFinite(value)) return bare ? "0" : "৳0";

  const fractionDigits =
    digits ?? (Math.abs(value) < 100 && !Number.isInteger(value) ? 2 : 0);

  const grouped = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  return `${bare ? "" : "৳"}${bengali ? toBanglaDigits(grouped) : grouped}`;
}

/** Compact money for dashboard tiles: ৳1.2L, ৳3.4Cr */
export function formatCompactBDT(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}৳${(abs / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `${sign}৳${(abs / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `${sign}৳${(abs / 1_000).toFixed(1)}K`;
  return `${sign}৳${abs}`;
}

/** Parses user input (may contain Bengali digits / commas / ৳) into a number. */
export function parseNumber(input: string | number | null | undefined): number {
  if (typeof input === "number") return Number.isFinite(input) ? input : 0;
  if (!input) return 0;
  const cleaned = toEnglishDigits(String(input))
    .replace(/[৳,\s_]/g, "")
    .replace(/[^0-9.\-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Rounds to 2dp without floating point drift (0.1 + 0.2 problems). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

export function sumBy<T>(items: T[], selector: (item: T) => number): number {
  return sum(items.map(selector));
}

/** Stable id generator that works on the server too. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function truncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return `${input.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Bangladeshi mobile number: 01[3-9]XXXXXXXX or +8801[3-9]XXXXXXXX */
export function isValidBDBoMobile(value: string): boolean {
  const digits = toEnglishDigits(value).replace(/[^\d]/g, "");
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(digits);
}

export function formatBDBoMobile(value: string): string {
  const digits = toEnglishDigits(value).replace(/[^\d]/g, "").replace(/^880/, "");
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "JN";
}

export function pluralBn(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
