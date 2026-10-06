/**
 * Bangladesh date/time helpers.
 *
 * Bangladesh is a single-timezone country (UTC+6, no DST), so formatting is
 * stable year-round. We build formats with Intl rather than date-fns locale
 * bundles to keep the client bundle small.
 */

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const BN_MONTHS_SHORT = [
  "জানু",
  "ফেব",
  "মার্চ",
  "এপ্রি",
  "মে",
  "জুন",
  "জুল",
  "আগ",
  "সেপ্ট",
  "অক্টো",
  "নভে",
  "ডিসে",
];

const BN_DAYS_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** "2026-03-14" -> Date, parsed as a *local* date (avoids UTC off-by-one). */
export function parseLocalDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return new Date(value);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Date -> "2026-03-14" in local time. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

function bn(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

/** "১৪ মার্চ ২০২৬" */
export function formatDateBN(value: string | Date, options: { short?: boolean } = {}): string {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  const months = options.short ? BN_MONTHS_SHORT : BN_MONTHS;
  return `${bn(date.getDate())} ${months[date.getMonth()]} ${bn(date.getFullYear())}`;
}

/** "১৪ মার্চ, শুক্রবার" */
export function formatDateWithDayBN(value: string | Date): string {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  return `${bn(date.getDate())} ${BN_MONTHS_SHORT[date.getMonth()]}, ${BN_DAYS_SHORT[date.getDay()]}`;
}

/** "১৪ মার্চ ২০২৬, রাত ৯:৩০" */
export function formatDateTimeBN(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDateBN(date)}, ${formatTimeBN(date)}`;
}

export function formatTimeBN(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "বিকাল" : "সকাল";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${bn(hour12)}:${bn(minutes)}`;
}

/** "১৪ মার্চ ২০২৬" -> "14 Mar 2026" for PDF/English output. */
const EN_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateEN(value: string | Date): string {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  return `${String(date.getDate()).padStart(2, "0")} ${EN_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "2026-03-14" style key used by the month filter. */
export function monthKey(value: string | Date): string {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** "2026-03" -> "মার্চ ২০২৬" */
export function monthLabelBN(key: string): string {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return `${BN_MONTHS[month - 1]} ${bn(year)}`;
}

/** The last `count` months, newest first, as "2026-03" keys. */
export function recentMonthKeys(count = 6): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    return monthKey(date);
  });
}

export function daysBetween(from: string | Date, to: string | Date): number {
  const start = typeof from === "string" ? parseLocalDate(from) : from;
  const end = typeof to === "string" ? parseLocalDate(to) : to;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / 86_400_000);
}

/** "৩ দিন বাকি" / "আজ" / "২ দিন আগে" */
export function relativeDaysBN(target: string | Date): string {
  const diff = daysBetween(new Date(), target);
  if (diff === 0) return "আজ";
  if (diff === 1) return "আগামীকাল";
  if (diff === -1) return "গতকাল";
  if (diff > 0) return `${bn(diff)} দিন বাকি`;
  return `${bn(Math.abs(diff))} দিন আগে`;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

/* -------------------------------------------------- amount in Bangla words */

const WORD_DIGITS = ["শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
const WORD_TEENS = [
  "দশ",
  "এগারো",
  "বারো",
  "তেরো",
  "চৌদ্দ",
  "পনেরো",
  "ষোলো",
  "সতেরো",
  "আঠারো",
  "উনিশ",
];
const WORD_TENS = ["বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];

function upToFourDigits(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds > 0) parts.push(`${WORD_DIGITS[hundreds]} শত`);
  if (rest >= 20) {
    const tens = Math.floor(rest / 10);
    const ones = rest % 10;
    parts.push(ones > 0 ? `${WORD_TENS[tens - 2]} ${WORD_DIGITS[ones]}` : WORD_TENS[tens - 2]);
  } else if (rest >= 10) {
    parts.push(WORD_TEENS[rest - 10]);
  } else if (rest > 0) {
    parts.push(WORD_DIGITS[rest]);
  }

  return parts.join(" ");
}

/** "এক লক্ষ বিশ হাজার তিন শত পঞ্চাশ" — the way an amount is written on a bill. */
export function numberToBanglaWords(value: number): string {
  const num = Math.floor(Math.abs(value));
  if (!Number.isFinite(num) || num === 0) return WORD_DIGITS[0];

  const parts: string[] = [];
  const crore = Math.floor(num / 10_000_000);
  if (crore > 0) {
    parts.push(`${crore >= 10_000 ? numberToBanglaWords(crore) : upToFourDigits(crore)} কোটি`);
  }

  const lakh = Math.floor((num % 10_000_000) / 100_000);
  if (lakh > 0) parts.push(`${upToFourDigits(lakh)} লক্ষ`);

  const thousand = Math.floor((num % 100_000) / 1_000);
  if (thousand > 0) parts.push(`${upToFourDigits(thousand)} হাজার`);

  const rest = num % 1_000;
  if (rest > 0) parts.push(upToFourDigits(rest));

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Taka and paisa, e.g. "এক হাজার দুই শত পঞ্চাশ টাকা পঞ্চাশ পয়সা" */
export function moneyInBanglaWords(value: number): string {
  const safe = Number.isFinite(value) ? Math.abs(value) : 0;
  const taka = Math.floor(safe);
  const paisa = Math.min(99, Math.round((safe - taka) * 100));
  const base = `${numberToBanglaWords(taka)} টাকা`;
  if (paisa === 0) return base;

  const paisaWord =
    paisa >= 20
      ? paisa % 10 > 0
        ? `${WORD_TENS[Math.floor(paisa / 10) - 2]} ${WORD_DIGITS[paisa % 10]}`
        : WORD_TENS[Math.floor(paisa / 10) - 2]
      : WORD_DIGITS[paisa];

  return `${base} ${paisaWord} পয়সা`;
}
