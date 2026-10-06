import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { LoginForm } from "@/features/auth/login-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "লগইন",
  description: "ঝামেলা নাই অ্যাকাউন্টে লগইন করুন — সব ডিভাইসে আপনার সংরক্ষিত হিসাব ও ডকুমেন্ট পাবেন।",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

const benefits = [
  { icon: Wallet, text: "সব টুলের হিসাব ডিভাইসে ধরে রাখা হয়" },
  { icon: ShieldCheck, text: "টুলের তথ্য শুধু আপনার অ্যাকাউন্টে জমা হয়" },
  { icon: Sparkles, text: "সব টুল ও আগামী সংস্করণে সম্পূর্ণ ফ্রি" },
];

export default function LoginPage() {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-12">
        <div className="hidden lg:block">
          <nav aria-label="ব্রেডক্রাম্ব">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  হোম
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-foreground">লগইন</li>
            </ol>
          </nav>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-balance">
            আবার স্বাগতম — আপনার কাজগুলো ফিরে এসেছে
          </h1>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            অ্যাকাউন্ট ছাড়াই সব টুল ব্যবহার করা যায়। লগইন করলে বাজেট, খরচের হিসাব ও
            ডকুমেন্ট যেকোনো ডিভাইস থেকে খুলবেন।
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-md sm:p-8">
          <div className="lg:hidden">
            <h1 className="text-2xl font-extrabold tracking-tight">লগইন করুন</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              অ্যাকাউন্ট না থাকলে{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                ফ্রি অ্যাকাউন্ট তৈরি করুন
              </Link>
              — অথবা না লগইন করেই টুল ব্যবহার করুন।
            </p>
          </div>

          <div className="mt-6 lg:mt-0">
            <Suspense fallback={<p className="text-sm text-muted-foreground">লোড হচ্ছে…</p>}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            লগইন করলে আপনি{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              গোপনীয়তা নীতি
            </Link>{" "}
            মেনে নিচ্ছেন। সাইটের ঠিকানা:{" "}
            <span className="whitespace-nowrap">{SITE.url.replace(/^https?:\/\//, "")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}