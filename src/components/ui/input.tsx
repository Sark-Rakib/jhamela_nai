"use client";

import * as React from "react";
import {
  Checkbox as CheckboxPrimitive,
  Label as LabelPrimitive,
  Slider as SliderPrimitive,
  Switch as SwitchPrimitive,
} from "radix-ui";

import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Label>
>(function Label({ className, ...props }, ref) {
  return (
    <LabelPrimitive.Label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
});

const fieldBase =
  "flex w-full rounded-md border border-input bg-surface text-sm text-foreground transition-[border-color,box-shadow] placeholder:text-faint-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          fieldBase,
          "h-10 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-surface-muted file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldBase, "min-h-20 resize-y px-3 py-2 leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          fieldBase,
          "h-10 cursor-pointer appearance-none py-2 pl-3 pr-9 [&>option]:bg-surface",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      >
        <path
          d="M6 8l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer size-5 shrink-0 rounded-[5px] border border-input bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path
            d="M3.5 8.5l3 3 6-6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-ink-300",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5" />
    </SwitchPrimitive.Root>
  );
});

export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, ...props }, ref) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-5 rounded-full border-2 border-primary bg-surface shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none" />
    </SliderPrimitive.Root>
  );
});

/* ------------------------------------------------------------------ Field */

export function Field({
  label,
  hint,
  error,
  htmlFor,
  required,
  className,
  children,
  suffix,
}: {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={htmlFor}>
            {label}
            {required ? (
              <span className="ml-0.5 text-destructive" aria-hidden>
                *
              </span>
            ) : null}
          </Label>
          {suffix ? <span className="text-2xs text-faint-foreground">{suffix}</span> : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-2xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-2xs leading-relaxed text-faint-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
