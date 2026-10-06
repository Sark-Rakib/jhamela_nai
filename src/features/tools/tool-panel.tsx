"use client";

/**
 * Shared chrome for every tool: title, description, action row and the region
 * that gets rasterised for PDF export.
 */

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ToolPanelProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Right-aligned actions (save / reset / export). */
  actions?: React.ReactNode;
  /** Reset handler — when provided a reset button is rendered automatically. */
  onReset?: () => void;
  className?: string;
  bodyClassName?: string;
}

export function ToolPanel({
  title,
  description,
  children,
  actions,
  onReset,
  className,
  bodyClassName,
}: ToolPanelProps) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-surface shadow-sm", className)}
      aria-label={title}
    >
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2" data-print-hide="true">
          {actions}
          {onReset ? (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw aria-hidden />
              রিসেট
            </Button>
          ) : null}
        </div>
      </div>

      <div className={cn("px-5 py-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Two-column layout used by form-style tools. */
export function ToolLayout({
  form,
  results,
  className,
}: {
  form: React.ReactNode;
  results: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start", className)}>
      <div className="min-w-0">{form}</div>
      <div className="min-w-0 lg:sticky lg:top-24">{results}</div>
    </div>
  );
}

export function ResultCard({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-primary-soft/40 p-5 dark:bg-primary-soft/60",
        className,
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          {action}
        </div>
      ) : null}
      <div className={cn(title && "mt-3")}>{children}</div>
    </div>
  );
}

export function EmptyResult({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-muted px-5 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Big Bangla-friendly headline number. */
export function StatBlock({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "brand" | "accent" | "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3.5">
      <p className="text-2xs font-medium uppercase tracking-wide text-faint-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tracking-tight tabular-nums",
          tone === "brand" && "text-primary",
          tone === "accent" && "text-accent-600 dark:text-accent-400",
          tone === "danger" && "text-destructive",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-2xs text-faint-foreground">{hint}</p> : null}
    </div>
  );
}