import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  EyeOff,
  FileDown,
  Gauge,
  Keyboard,
  Lock,
  MousePointerClick,
  Save,
} from "lucide-react";

import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/ui/icons";
import { ACCENT_BORDER, ACCENT_TILE } from "@/lib/accents";
import { CATEGORIES, FEATURED_TOOLS, TOOLS, toolsByCategory } from "@/lib/tools";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- Categories */

export function CategoryGrid() {
  return (
    <section className="container-page py-16" aria-labelledby="categories-heading">
      <SectionHeading
        id="categories-heading"
        eyebrow="ক্যাটাগরি"
        title="কাজ অনুযায়ী টুল খুঁজুন"
        description="পাঁচটি ক্যাটাগরি, মোট ২৩টি টুল — প্রতিটিই বাংলাদেশের বাস্তব হিসাব ও প্রয়োজন অনুযায়ী বানানো।"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const count = toolsByCategory(category.slug).length;

          return (
            <Link
              key={category.slug}
              href={`/tools/category/${category.slug}`}
              className={cn(
                "group flex flex-col rounded-xl border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-ring",
                ACCENT_BORDER[category.accent] ?? ACCENT_BORDER.brand,
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-xl",
                    ACCENT_TILE[category.accent] ?? ACCENT_TILE.brand,
                  )}
                  aria-hidden
                >
                  <ToolIcon name={category.icon} className="size-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {category.nameBn}
                  </h3>
                  <p className="text-xs text-faint-foreground">
                    {category.name} · {count}টি টুল
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                ক্যাটাগরি দেখুন
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          );
        })}

        <div className="flex flex-col justify-between rounded-xl border border-dashed border-border bg-surface-muted p-5">
          <div>
            <h3 className="text-base font-semibold tracking-tight">সব টুল একসাথে</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              অনুসন্ধান, ফিল্টার ও সাজানোর সুবিধা সহ পুরো তালিকা দেখুন।
            </p>
          </div>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/tools">
              সব {TOOLS.length}টি টুল
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Featured rail */

export function FeaturedTools() {
  return (
    <section className="border-y border-border bg-surface" aria-labelledby="featured-heading">
      <div className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="featured-heading"
            eyebrow="জনপ্রিয়"
            title="সবচেয়ে বেশি ব্যবহৃত টুল"
            description="শুরু করার জন্য এই টুলগুলোই যথেষ্ট — লগইন ছাড়াই ব্যবহার করুন।"
          />
          <Button variant="ghost" asChild>
            <Link href="/tools">
              আরও দেখুন
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(FEATURED_TOOLS.length > 0 ? FEATURED_TOOLS : TOOLS).slice(0, 6).map((tool, index) => (
            <ToolCard key={tool.slug} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- How it works */

const STEPS = [
  {
    icon: MousePointerClick,
    title: "প্রশ্নটা লিখুন বা ক্যাটাগরি খুঁজুন",
    body: "“এই মাসের খরচ কিভাবে ভাগ করব?” — এমন একটা লাইন লিখলেই সঠিক টুল খুঁজে পাবেন। না পারলে Ctrl+K দিয়ে সার্চ করুন।",
  },
  {
    icon: Gauge,
    title: "নম্বর বা তথ্য দিন",
    body: "আয়, খরচ, কিস্তি, গ্রেড — যা লাগবে সেটুকুই। কোনো অপ্রয়োজনীয় তথ্য বা সাইন-আপ লাগে না।",
  },
  {
    icon: FileDown,
    title: "ফলাফল দেখুন, ডাউনলোড করুন",
    body: "চার্ট, ভাঙ্গন এবং PDF/CSV ডাউনলোড — সব ফ্রি। চাইলে ফলাফল লিংকভাবে শেয়ার করুন।",
  },
  {
    icon: Save,
    title: "চাইলে সেভ করুন",
    body: "অ্যাকাউন্ট থাকলে সব ফলাফল সিঙ্ক থাকবে; না থাকলেও এই ডিভাইসেই কাজ চলবে।",
  },
];

export function HowItWorks() {
  return (
    <section className="container-page py-16" aria-labelledby="how-heading">
      <SectionHeading
        id="how-heading"
        eyebrow="কীভাবে কাজ করে"
        title="চার ধাপে কাজ শেষ"
        description="কোনো ঝামেলা নেই — না অ্যাপ ইনস্টল করতে হবে, না কার্ডের তথ্য দিতে হবে।"
      />

      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="relative rounded-xl border border-border bg-surface p-5 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary"
                aria-hidden
              >
                <StepIcon step={step} />
              </span>
              <span className="text-2xs font-bold uppercase tracking-[0.18em] text-faint-foreground">
                ধাপ {index + 1}
              </span>
            </div>
            <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --------------------------------------------------------------- Features */

const FEATURES = [
  {
    icon: Keyboard,
    title: "Ctrl+K সার্চ",
    body: "যেকোনো পেজ থেকে কীবোর্ড শর্টকাটে টুল খুঁজুন — বাংলা টাইপ করলেও কাজ করে।",
  },
  {
    icon: EyeOff,
    title: "ট্র্যাকিং নেই",
    body: "কোনো বিজ্ঞাপন নেই, কোনো ফর্ম ডেটা সংরক্ষণ হয় না। হিসাব আপনার ব্রাউজারে হয়।",
  },
  {
    icon: Lock,
    title: "গেস্ট মোড",
    body: "লগইন ছাড়াই সব টুল। অ্যাকাউন্ট শুধু ফলাফল সংরক্ষণ ও সিঙ্কের জন্য।",
  },
  {
    icon: FileDown,
    title: "PDF ডাউনলোড",
    body: "হিসাব, চার্ট বা ডকুমেন্ট — সব ফলাফল এক ক্লিকে PDF হিসেবে নামিয়ে নিন।",
  },
];

export function FeatureBand() {
  return (
    <section className="border-y border-border bg-surface-muted" aria-labelledby="features-heading">
      <div className="container-page py-16">
        <SectionHeading
          id="features-heading"
          eyebrow="কেন এটা আলাদা"
          title="হালকা, দ্রুত, আপনার প্রয়োজন মতো"
          description="কোনো বিজ্ঞাপন বা লগইনের চাপ নেই — শুধু কাজটা হয়ে যায়।"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-surface p-5">
              <span
                className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent-700 dark:text-accent-300"
                aria-hidden
              >
                <FeatureIcon feature={feature} />
              </span>
              <h3 className="mt-3 text-[15px] font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */

const FAQ = [
  {
    question: "এই টুল কি সত্যিই ফ্রি?",
    answer:
      "হ্যাঁ। সব টুল ব্যবহার করা, PDF ডাউনলোড করা এবং ফলাফল দেখা সম্পূর্ণ ফ্রি। ভবিষ্যতে Pro ফিচার যুক্ত হলেও মূল টুলগুলো ফ্রি থাকবে।",
  },
  {
    question: "আমার তথ্য কি কোথাও সেভ হয়?",
    answer:
      "না। প্রতিটি টুল ব্রাউজারের ভেতরেই হিসাব করে, তাই ইনফরমেশন সার্ভারে পাঠানো হয় না। শুধু আপনি চাইলে ওই টুলের নামটা অ্যানালিটিক্সে গণনা হয় (টুল খোলা হয়েছে কি না)।",
  },
  {
    question: "লগইন না করলে আমার তথ্য হারিয়ে যাবে?",
    answer:
      "ফলাফল সংরক্ষণ করলে সেটা এই ব্রাউজারেই থাকে, তাই একই ডিভাইসে ফিরে পাবেন। অ্যাকাউন্ট করলে সব ডিভাইসে সিঙ্ক হবে এবং ইতিহাস দেখতে পাবেন।",
  },
  {
    question: "টাকার হিসাব কি বাংলা নম্বরে দেখায়?",
    answer:
      "হ্যাঁ। ৳ সিম্বলসহ বাংলা নম্বরে (যেমন ৳৩০,০০০) দেখানোর অপশন আছে, এবং ইনপুটেও বাংলা নম্বর লিখতে পারবেন।",
  },
  {
    question: "ফোনে ব্যবহার করা যাবে?",
    answer:
      "হ্যাঁ, প্রতিটি টুল মোবাইলের জন্য তৈরি — বড় স্ক্রিনে সুন্দর, ছোট স্ক্রিনেও কাজ করে। ফোন থেকে “Add to Home Screen” করলে অ্যাপের মতো ব্যবহার করা যায়।",
  },
];

export function FaqSection() {
  return (
    <section className="container-page py-16" aria-labelledby="faq-heading">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          id="faq-heading"
          eyebrow="সাধারণ প্রশ্ন"
          title="জানতে চাওয়া কিছু কথা"
          description="আরও কিছু জানতে চাইলে যোগাযোগ বা AI সহায়কে জিজ্ঞেস করতে পারেন।"
        />

        <div className="rounded-xl border border-border bg-surface px-5 shadow-xs">
          {FAQ.map((item) => (
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
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- CTA */

export function FinalCta() {
  return (
    <section className="container-page pb-20">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-ink-900 px-6 py-12 text-center dark:bg-ink-850">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(50% 70% at 50% 0%, rgb(18 184 134 / 0.35), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            আজই শুরু করুন — ঝামেলা নেই
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-ink-200 sm:text-base">
            কোনো ইনস্টল, কোনো অ্যাকাউন্ট বাধ্যতামূলক নয়। ব্রাউজার খুলে লিখুন — বাকিটা আমরা সামলে নেব।
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/tools">
                টুল দেখুন
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-ink-700 bg-transparent text-white hover:bg-ink-800 hover:text-white"
              asChild
            >
              <Link href="/register">ফ্রি অ্যাকাউন্ট তৈরি করুন</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ helper */

function StepIcon({ step }: { step: (typeof STEPS)[number] }) {
  return React.createElement(step.icon, { className: "size-4", "aria-hidden": true });
}

function FeatureIcon({ feature }: { feature: (typeof FEATURES)[number] }) {
  return React.createElement(feature.icon, { className: "size-5", "aria-hidden": true });
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}