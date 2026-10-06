"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { Tooltip } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

function emptySubscribe() {
  return () => {};
}

const OPTIONS = [
  { value: "light", label: "লাইট মোড", Icon: Sun },
  { value: "dark", label: "ডার্ক মোড", Icon: Moon },
  { value: "system", label: "সিস্টেম", Icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Hydration-safe "am I on the client yet?" without an effect + setState pair.
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Avoid a hydration mismatch: render a stable placeholder until mounted.
  if (!mounted) {
    return (
      <div
        className={cn("size-10 rounded-md border border-border", className)}
        aria-hidden
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="থিম পরিবর্তন করুন"
      className={cn(
        "relative flex items-center gap-0.5 rounded-lg border border-border bg-surface-muted p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <Tooltip key={value} content={label}>
            <button
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => setTheme(value)}
              className={cn(
                "grid size-9 place-items-center rounded-[0.4375rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                active
                  ? "bg-surface text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </button>
          </Tooltip>
        );
      })}
      <span className="sr-only" aria-live="polite">
        বর্তমান থিম: {resolvedTheme === "dark" ? "ডার্ক" : "লাইট"}
      </span>
    </div>
  );
}
