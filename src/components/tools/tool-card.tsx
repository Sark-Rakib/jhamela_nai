import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ToolIcon } from "@/components/ui/icons";
import { ACCENT_BORDER, ACCENT_RING, ACCENT_TILE } from "@/lib/accents";
import type { ToolDefinition } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
  /** Compact variant used in side rails. */
  compact?: boolean;
  /** Stagger index for entrance animation. */
  index?: number;
}

export function ToolCard({ tool, className, compact = false, index = 0 }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ACCENT_BORDER[tool.accent] ?? ACCENT_BORDER.brand,
        ACCENT_RING[tool.accent] ?? ACCENT_RING.brand,
        compact ? "gap-2 p-4" : "gap-3",
        className,
      )}
      style={compact ? undefined : { animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg transition-colors",
            ACCENT_TILE[tool.accent] ?? ACCENT_TILE.brand,
          )}
          aria-hidden
        >
          <ToolIcon name={tool.icon} className="size-5" />
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-faint-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {tool.nameBn}
        </h3>
        <p className="text-xs font-medium text-faint-foreground">{tool.name}</p>
      </div>

      {!compact ? (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {tool.tagline}
        </p>
      ) : null}

      {tool.popular && !compact ? (
        <span className="mt-auto pt-1 text-2xs font-semibold uppercase tracking-wide text-primary">
          জনপ্রিয়
        </span>
      ) : null}
    </Link>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="skeleton h-[9.5rem] rounded-xl border border-border" aria-hidden />
  );
}