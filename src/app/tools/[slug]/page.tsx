import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb, ShieldCheck } from "lucide-react";

import { ToolIcon } from "@/components/ui/icons";
import { ACCENT_BORDER, ACCENT_TILE } from "@/lib/accents";
import { TOOL_BY_SLUG, TOOLS, relatedTools, type ToolDefinition } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

import { ToolUi } from "@/features/tools/tool-ui";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) return { title: "টুল পাওয়া যায়নি" };

  const url = `${SITE.url}/tools/${tool.slug}`;
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      type: "article",
      title: tool.seoTitle,
      description: tool.seoDescription,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG[slug];
  if (!tool) notFound();

  const related = relatedTools(tool.slug);
  const faqSchema = faqJsonLd(tool);
  const breadcrumbSchema = breadcrumbJsonLd(tool);

  return (
    <div className="container-page py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, breadcrumbSchema]) }}
      />

      <Link
        href={`/tools/category/${tool.category}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        ক্যাটাগরিতে ফিরে যান
      </Link>

      <header className="mt-6 flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-start">
        <span
          className={cn(
            "grid size-14 shrink-0 place-items-center rounded-xl",
            ACCENT_TILE[tool.accent] ?? ACCENT_TILE.brand,
          )}
          aria-hidden
        >
          <ToolIcon name={tool.icon} className="size-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary">
            {tool.name}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {tool.nameBn}
          </h1>
          <p className="mt-2 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-faint-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            সব হিসাব আপনার ব্রাউজারে হয় — কোনো তথ্য সার্ভারে যায় না।
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0">
          <ToolUi slug={tool.slug} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          {tool.tips.length > 0 ? (
            <section
              aria-labelledby="tips-heading"
              className={cn(
                "rounded-xl border bg-surface p-5",
                ACCENT_BORDER[tool.accent] ?? ACCENT_BORDER.brand,
              )}
            >
              <h2
                id="tips-heading"
                className="flex items-center gap-2 text-sm font-semibold tracking-tight"
              >
                <Lightbulb className="size-4 text-accent" aria-hidden />
                ভালো ফলাফলের জন্য
              </h2>
              <ul className="mt-3 space-y-2.5">
                {tool.tips.map((tip) => (
                  <li key={tip} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section aria-labelledby="related-heading" className="rounded-xl border border-border bg-surface p-5">
              <h2 id="related-heading" className="text-sm font-semibold tracking-tight">
                সম্পর্কিত টুল
              </h2>
              <ul className="mt-3 space-y-1">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/tools/${item.slug}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-surface-muted focus-ring"
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-md",
                          ACCENT_TILE[item.accent] ?? ACCENT_TILE.brand,
                        )}
                        aria-hidden
                      >
                        <ToolIcon name={item.icon} className="size-3.5" />
                      </span>
                      <span className="truncate font-medium text-foreground">{item.nameBn}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      {tool.faq.length > 0 ? (
        <section aria-labelledby="faq-heading" className="mt-14 border-t border-border pt-10">
          <h2 id="faq-heading" className="text-xl font-bold tracking-tight">
            সাধারণ প্রশ্ন
          </h2>
          <div className="mt-4 max-w-3xl rounded-xl border border-border bg-surface px-5">
            {tool.faq.map((item) => (
              <details key={item.question} className="group border-b border-border last:border-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium focus-ring">
                  {item.question}
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-xs text-muted-foreground transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 pr-8 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function faqJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function breadcrumbJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "হোম", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "সব টুল", item: `${SITE.url}/tools` },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.nameBn,
        item: `${SITE.url}/tools/${tool.slug}`,
      },
    ],
  };
}