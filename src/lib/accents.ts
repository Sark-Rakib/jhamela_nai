/**
 * Accent → class maps. Kept as explicit class strings (rather than runtime
 * interpolation) so Tailwind's scanner can see every utility.
 */

export const ACCENT_TILE: Record<string, string> = {
  brand: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-700 dark:text-accent-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/12 dark:text-sky-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/12 dark:text-rose-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
};

export const ACCENT_SOLID: Record<string, string> = {
  brand: "bg-brand-600 text-white",
  accent: "bg-accent-500 text-white",
  violet: "bg-violet-600 text-white",
  sky: "bg-sky-600 text-white",
  rose: "bg-rose-600 text-white",
  amber: "bg-amber-500 text-white",
};

export const ACCENT_BORDER: Record<string, string> = {
  brand: "border-brand-200 dark:border-brand-800",
  accent: "border-accent-200 dark:border-accent-900",
  violet: "border-violet-200 dark:border-violet-900/60",
  sky: "border-sky-200 dark:border-sky-900/60",
  rose: "border-rose-200 dark:border-rose-900/60",
  amber: "border-amber-200 dark:border-amber-900/60",
};

export const ACCENT_RING: Record<string, string> = {
  brand: "focus-visible:ring-brand-500/30",
  accent: "focus-visible:ring-accent-500/30",
  violet: "focus-visible:ring-violet-500/30",
  sky: "focus-visible:ring-sky-500/30",
  rose: "focus-visible:ring-rose-500/30",
  amber: "focus-visible:ring-amber-500/30",
};

export const ACCENT_CHART: Record<string, string> = {
  brand: "#12b886",
  accent: "#fb800c",
  violet: "#8b5cf6",
  sky: "#0ea5e9",
  rose: "#f43f5e",
  amber: "#f59e0b",
};

/** Deterministic, visually harmonious palettes for pie/bar charts. */
export const CHART_PALETTES: Record<string, string[]> = {
  brand: ["#12b886", "#34d3a1", "#059669", "#6ee7bb", "#047857", "#a7f3d4", "#064e3b"],
  accent: ["#fb800c", "#ff9f38", "#ed6105", "#ffc074", "#c64409", "#ffdbab"],
  violet: ["#8b5cf6", "#a78bfa", "#7c3aed", "#c4b5fd", "#6d28d9", "#ddd6fe"],
  sky: ["#0ea5e9", "#38bdf8", "#0284c7", "#7dd3fc", "#0369a1", "#bae6fd"],
  rose: ["#f43f5e", "#fb7185", "#e11d48", "#fda4af", "#9f1239", "#fecdd3"],
  amber: ["#f59e0b", "#fbbf24", "#d97706", "#fcd34d", "#b45309", "#fde68a"],
};
