import Link from "next/link";
import * as React from "react";

/** Shared breadcrumb + page header used by all static content pages. */
export function PageShell({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-10 sm:py-14">
      <nav aria-label="ব্রেডক্রাম্ব">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              হোম
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-foreground">{eyebrow ?? title}</li>
        </ol>
      </nav>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </header>

      <div className="mt-8">{children}</div>
    </div>
  );
}

/** Styled prose container for policy and marketing copy. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:leading-relaxed [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:space-y-2 [&_ul]:ps-5 [&_ul]:list-disc">
      {children}
    </div>
  );
}

/** Simple titled card used for feature/FAQ grids on content pages. */
export function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        {Icon ? (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </article>
  );
}