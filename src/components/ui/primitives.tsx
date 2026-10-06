"use client";

import * as React from "react";
import {
  Accordion as AccordionPrimitive,
  Progress as ProgressPrimitive,
  Select as SelectPrimitive,
  Tabs as TabsPrimitive,
  Tooltip as TooltipPrimitive,
} from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------- Tabs */

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "scrollbar-none inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg bg-surface-muted p-1",
        className,
      )}
      {...props}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-xs",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = TabsPrimitive.Content;

/* ----------------------------------------------------------------- Select */

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  id,
  name,
  disabled,
  ariaLabel,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        name={name}
        aria-label={ariaLabel}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-surface px-3 text-sm text-foreground transition-colors hover:border-ink-300 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60 data-[placeholder]:text-faint-foreground",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-[60] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-muted-foreground">
            <ChevronDown className="size-3.5 rotate-180" aria-hidden />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-foreground outline-none data-[highlighted]:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2.5 flex items-center justify-center">
                  <Check className="size-3.5 text-primary" aria-hidden />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-muted-foreground">
            <ChevronDown className="size-3.5" aria-hidden />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
      {current ? <span className="sr-only">{current.label}</span> : null}
    </SelectPrimitive.Root>
  );
}

/* -------------------------------------------------------------- Accordion */

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem({ className, ...props }, ref) {
  return <AccordionPrimitive.Item ref={ref} className={cn("border-b border-border last:border-0", className)} {...props} />;
});

export const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionTrigger({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between gap-3 py-4 text-left text-sm font-medium text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm leading-relaxed text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className,
      )}
      {...props}
    >
      <div className="pb-4 pr-2">{children}</div>
    </AccordionPrimitive.Content>
  );
});

/* ---------------------------------------------------------------- Tooltip */

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={300}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  if (!content) return <>{children}</>;
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-[70] max-w-64 rounded-md bg-ink-900 px-2.5 py-1.5 text-2xs font-medium text-white shadow-md dark:bg-ink-100 dark:text-ink-950",
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-ink-900 dark:fill-ink-100" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/* --------------------------------------------------------------- Progress */

export function Progress({
  value,
  className,
  tone = "brand",
  label,
}: {
  value: number;
  className?: string;
  tone?: "brand" | "accent" | "danger";
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <ProgressPrimitive.Root
      value={clamped}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800", className)}
      aria-label={label}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "brand" && "bg-primary",
          tone === "accent" && "bg-accent-500",
          tone === "danger" && "bg-destructive",
        )}
        style={{ width: `${clamped}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
