import * as React from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------- Card */

export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-xs",
        interactive &&
          "transition-[box-shadow,border-color,transform] duration-200 hover:border-ink-300 hover:shadow-md dark:hover:border-ink-700",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-border p-5", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ Badge */

const badgeTones = {
  neutral: "bg-surface-muted text-muted-foreground border-border",
  brand: "bg-primary-soft text-primary border-transparent",
  accent: "bg-accent-soft text-accent-700 dark:text-accent-300 border-transparent",
  outline: "bg-transparent text-muted-foreground border-border",
  danger: "bg-destructive-soft text-destructive border-transparent",
} as const;

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof badgeTones;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-2xs font-medium leading-5",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------- Separator */

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

/* --------------------------------------------------------------- Skeleton */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden {...props} />;
}
