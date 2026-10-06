import type { Metadata } from "next";
import Link from "next/link";

import { ToolsDirectory } from "@/components/tools/tools-directory";
import { ToolIcon } from "@/components/ui/icons";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "সব টুল — অনলাইন ফ্রি টুল ডিরেক্টরি",
  description: `ঝামেলা নাই-এর সব ${TOOLS.length}টি ফ্রি অনলাইন টুল — বাজেট, খরচের হিসাব, CV, invoice, ডকুমেন্ট, ভ্রমণ ও শিক্ষার্থী টুল। ক্যাটাগরি অনুযায়ী ফিল্টার করুন।`,
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "সব টুল | ঝামেলা নাই",
    description: "বাংলাদেশের জন্য বানানো সব ফ্রি অনলাইন টুল এক জায়গায়।",
    url: `${SITE.url}/tools`,
  },
};

export default function ToolsPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <nav aria-label="ব্রেডক্রাম্ব">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              হোম
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-foreground">সব টুল</li>
        </ol>
      </nav>

      <header className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          সব টুল — {TOOLS.length}টি ফ্রি অনলাইন টুল
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          প্রতিটি টুল ব্রাউজারের ভেতরেই কাজ করে, তাই কোনো ফর্ম ডেটা সার্ভারে যায় না। কোনো
          লগইন ছাড়াই ব্যবহার করুন।
        </p>
      </header>

      <ul className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/tools/category/${category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-ring"
            >
              <ToolIcon name={category.icon} className="size-3.5" />
              {category.nameBn}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <ToolsDirectory />
      </div>
    </div>
  );
}