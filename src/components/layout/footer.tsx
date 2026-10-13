import Link from "next/link";
import { Code2, Mail } from "lucide-react";

import { LogoMark } from "@/components/layout/logo";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { CATEGORIES } from "@/lib/tools";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-ring"
              aria-label={`${SITE.name} হোমপেজ`}
            >
              <LogoMark className="size-9" />
              <span className="flex flex-col leading-tight">
                <span className="font-semibold tracking-tight text-foreground">
                  {SITE.nameBn}
                </span>
                <span className="text-2xs uppercase tracking-[0.18em] text-faint-foreground">
                  {SITE.name}
                </span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {SITE.shortDescription}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <a
                href={`mailto:hello@${new URL(SITE.url).hostname}`}
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground focus-ring"
                aria-label="ইমেইল করুন"
              >
                <Mail className="size-4" aria-hidden />
              </a>
              <a
                href="https://github.com/Sark-Rakib/jhamela_nai"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground focus-ring"
                aria-label="সোর্স কোড দেখুন"
              >
                <Code2 className="size-4" aria-hidden />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_LINKS.slice(0, 3).map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint-foreground">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <nav aria-label={FOOTER_LINKS[3].title}>
              <h2 className="text-2xs font-semibold uppercase tracking-[0.16em] text-faint-foreground">
                {FOOTER_LINKS[3].title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {FOOTER_LINKS[3].links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-faint-foreground">
            © {year} {SITE.nameBn}. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs text-faint-foreground">
            Creator{" "}
            <a
              href="https://www.facebook.com/sarkrakib/"
              target="_blank"
              className="text-xs text-faint-foreground underline hover:text-brand-800"
            >
              Rakib Sarker
            </a>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-faint-foreground">
            বাংলাদেশে তৈরি
            {/* <Heart className="size-3.5 text-accent" aria-hidden /> */}
            <span className="sr-only">প্রেম সহ</span>
            <span aria-hidden>·</span>
            {CATEGORIES.length}টি ক্যাটাগরি
          </p>
        </div>
      </div>
    </footer>
  );
}
