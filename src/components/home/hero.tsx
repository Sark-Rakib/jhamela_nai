import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { HeroSearch } from "@/components/home/hero-search";
import { Button } from "@/components/ui/button";
import { CATEGORIES, POPULAR_TOOLS, TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";

export function Hero() {
  return (
    <section className="surface-grain relative overflow-hidden border-b border-border">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="animate-jn-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            বাংলাদেশের জন্য বানানো · {TOOLS.length}টি টুল · সম্পূর্ণ ফ্রি
          </p>

          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {SITE.nameBn}
            <span className="block text-primary">ঝামেলা নাই।</span>
          </h1>

          <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            মাসের বাজেট, খরচের হিসাব, CV, invoice, CGPA, ভ্রমণের পরিকল্পনা — যা যা
            প্রতিদিন লাগে, সব এক জায়গায়। লগইন না করেই ব্যবহার করুন, সব হিসাব আপনার
            ব্রাউজারেই থাকে।
          </p>

          <div className="mt-7">
            <HeroSearch />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              কোনো ফর্ম ডেটা সার্ভারে যায় না
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-accent" aria-hidden />
              লাইন ইন্টারনেট ছাড়াই কাজ করে
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button size="lg" asChild>
              <Link href="/tools">
                সব টুল দেখুন
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">কীভাবে কাজ করে</Link>
            </Button>
          </div>
        </div>

        <div className="animate-jn-rise [animation-delay:120ms]">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">জনপ্রিয় টুল</h2>
              <Link
                href="/tools"
                className="text-xs font-medium text-primary hover:underline focus-ring"
              >
                সব দেখুন
              </Link>
            </div>

            <ul className="mt-4 space-y-2">
              {POPULAR_TOOLS.slice(0, 6).map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-surface-muted focus-ring"
                  >
                    <span aria-hidden className="text-base">
                      {CATEGORIES.find((category) => category.slug === tool.category)?.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {tool.nameBn}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {tool.tagline}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-faint-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: "টুল", value: TOOLS.length },
              { label: "ক্যাটাগরি", value: CATEGORIES.length },
              { label: "ট্র্যাকিং", value: "নেই" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-surface px-3 py-3 text-center"
              >
                <dt className="text-2xs uppercase tracking-wide text-faint-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}