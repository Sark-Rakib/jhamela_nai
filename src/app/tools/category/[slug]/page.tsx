import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ToolCard } from "@/components/tools/tool-card";
import { ToolIcon } from "@/components/ui/icons";
import { ACCENT_BORDER, ACCENT_TILE } from "@/lib/accents";
import { CATEGORIES, CATEGORY_BY_SLUG, relatedTools, toolsByCategory } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug];
  if (!category) return { title: "ক্যাটাগরি পাওয়া যায়নি" };

  const tools = toolsByCategory(slug);
  const toolNames = tools.map((tool) => tool.nameBn).join(", ");

  return {
    title: `${category.nameBn} — ${tools.length}টি ফ্রি অনলাইন টুল`,
    description: `${category.description} ডিরেক্টলি ব্যবহার করুন: ${toolNames}।`,
    alternates: { canonical: `/tools/category/${category.slug}` },
    openGraph: {
      title: `${category.nameBn} | ${SITE.nameBn}`,
      description: category.description,
      url: `${SITE.url}/tools/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug];
  if (!category) notFound();

  const tools = toolsByCategory(category.slug);
  const suggestions = relatedTools(category.slug).slice(0, 4);
  const others = CATEGORIES.filter((item) => item.slug !== category.slug);

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        সব টুলে ফিরে যান
      </Link>

      <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "grid size-14 shrink-0 place-items-center rounded-xl",
              ACCENT_TILE[category.accent] ?? ACCENT_TILE.brand,
            )}
            aria-hidden
          >
            <ToolIcon name={category.icon} className="size-6" />
          </span>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary">
              {category.name}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {category.nameBn}
            </h1>
            <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>
        <p className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground">
          {tools.length}টি টুল
        </p>
      </header>

      <section aria-label={`${category.nameBn} টুলসমূহ`} className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} index={index} />
          ))}
        </div>
      </section>

      {others.length > 0 ? (
        <section aria-labelledby="other-categories" className="mt-16">
          <h2 id="other-categories" className="text-xl font-bold tracking-tight">
            অন্য ক্যাটাগরি
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((item) => (
              <Link
                key={item.slug}
                href={`/tools/category/${item.slug}`}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm focus-ring",
                  ACCENT_BORDER[item.accent] ?? ACCENT_BORDER.brand,
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg",
                    ACCENT_TILE[item.accent] ?? ACCENT_TILE.brand,
                  )}
                  aria-hidden
                >
                  <ToolIcon name={item.icon} className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium">{item.nameBn}</span>
                <ArrowRight
                  className="size-3.5 shrink-0 text-faint-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {suggestions.length > 0 ? (
        <section aria-labelledby="suggested-tools" className="mt-14">
          <h2 id="suggested-tools" className="text-xl font-bold tracking-tight">
            এই কাজের জন্য দরকারি হতে পারে
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-muted focus-ring"
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg",
                    ACCENT_TILE[tool.accent] ?? ACCENT_TILE.brand,
                  )}
                  aria-hidden
                >
                  <ToolIcon name={tool.icon} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{tool.nameBn}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {tool.name}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}