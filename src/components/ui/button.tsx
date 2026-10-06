"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 active:translate-y-px select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110 active:brightness-100",
        secondary:
          "bg-ink-900 text-white hover:bg-ink-800 dark:bg-ink-100 dark:text-ink-950 dark:hover:bg-white",
        outline:
          "border border-border bg-surface text-foreground hover:bg-surface-muted hover:border-ink-300",
        ghost: "text-foreground hover:bg-surface-muted",
        subtle:
          "bg-primary-soft text-primary hover:brightness-95 dark:hover:brightness-125",
        destructive:
          "bg-destructive text-white hover:brightness-110",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-[15px] [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-10 p-0",
        "icon-sm": "size-9 p-0",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, block, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

export { buttonVariants };
