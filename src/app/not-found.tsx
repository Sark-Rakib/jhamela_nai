import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SEARCH_EXAMPLES } from "@/lib/tools";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold tracking-wide text-primary">৪০৪</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
        পেজটি খুঁজে পাওয়া যায়নি
      </h1>
      <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
        হয়তো ঠিকানাটি ভুল লেখা হয়েছে, অথবা পেজটি সরিয়ে ফেলা হয়েছে। নিচের তালিকা থেকে আপনার
        কাজটি খুঁজে নিন।
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/tools">সব টুল দেখুন</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">হোমে ফিরে যান</Link>
        </Button>
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {SEARCH_EXAMPLES.map((example) => (
          <li key={example}>
            <Link
              href={`/tools?query=${encodeURIComponent(example)}`}
              className="inline-block rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-ring"
            >
              {example}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}