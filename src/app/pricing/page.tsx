import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InfoCard, PageShell } from "@/components/layout/content-page";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "প্রাইসিং",
  description: "ঝামেলা নাই-এর সব টুল বিনা খরচে ব্যবহার করা যায় — কোনো গেট ইকোন, কোনো লুকানো চার্জ নেই।",
  alternates: { canonical: "/pricing" },
};

const freeFeatures = [
  `${TOOLS.length}টি টুল — কোনো সীমা ছাড়াই`,
  "লগইন ছাড়াই অতিথি মোডে হিসাব",
  "PDF, CSV ও টেক্সট ডাউনলোড",
  "অ্যাকাউন্টে কাজ সংরক্ষণ ও ড্যাশবোর্ড",
  "কোনো বিজ্ঞাপন নেই",
];

const premiumPlans = [
  {
    title: "পিডিএফ বান্ডিল",
    body: "একসঙ্গে একাধিক ডকুমেন্ট এক পিডিএফে জোড়া লাগানোর সুবিধা — চালু হলে ইমেইলে জানানো হবে।",
  },
  {
    title: "টিম শেয়ার",
    body: "একই দলের সদস্যরা সাধারণ হিসাব ও ডকুমেন্ট দেখতে পারবেন — চালু হলে আগে জানানো হবে।",
  },
];

export default function PricingPage() {
  return (
    <PageShell
      eyebrow="প্রাইসিং"
      title="সব টুল ফ্রি — সত্যিই ফ্রি"
      description="কোনো গেট ইকোন নেই, কোনো লুকানো চার্জ নেই। ভবিষ্যতে কিছু চাওয়া হলে আগেই আপনাদের জানানো হবে।"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-primary/40 bg-surface p-6 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">ফ্রি পরিকল্পনা</h2>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              সবার জন্য
            </span>
          </div>
          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight">৳০</span>
            <span className="text-sm text-muted-foreground">প্রতি মাসে</span>
          </p>

          <ul className="mt-5 space-y-2.5">
            {freeFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/tools">এখনই ব্যবহার করুন</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">ফ্রি অ্যাকাউন্ট তৈরি করুন</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-surface-muted p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="size-5 text-accent" aria-hidden />
            আসছে ভবিষ্যতে
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            এগুলো এখনো চালু নয় — নিজের টাকা দিয়ে “চালু” বানিয়ে রাখা ঠিক হতো না। যেদিন
            সত্যিই দরকার হবে, তখন আগে খরচ ও সুবিধা পরিষ্কারভাবে জানানো হবে।
          </p>

          <ul className="mt-4 space-y-3">
            {premiumPlans.map((plan) => (
              <li key={plan.title}>
                <InfoCard title={plan.title}>
                  <p>{plan.body}</p>
                </InfoCard>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}