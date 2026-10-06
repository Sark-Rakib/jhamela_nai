import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";

import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "ফ্রি অ্যাকাউন্ট তৈরি করুন",
  description: "ঝামেলা নাই-এ ফ্রি অ্যাকাউন্ট তৈরি করুন — সব টুলে কাজ সংরক্ষণ করুন এবং যেকোনো ডিভাইস থেকে শুরু করুন।",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

const points = [
  "সব ২৩টি টুলে কাজ সংরক্ষণ ও পুনরায় খোলার সুবিধা",
  "টুল ব্যবহারের সহজ হিসাব দেখার জন্য প্রতিটি টুলের ইতিহাস",
  "মোবাইল ও ডেস্কটপ — যেকোনো ডিভাইস থেকে কাজ চালিয়ে যান",
  "কোনো কার্ড, কোনো ফি নয় — সম্পূর্ণ ফ্রি",
];

export default function RegisterPage() {
  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-12">
        <div className="hidden lg:block">
          <nav aria-label="ব্রেডক্রাম্ব">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  হোম
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-foreground">অ্যাকাউন্ট তৈরি</li>
            </ol>
          </nav>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-balance">
            ফ্রি অ্যাকাউন্ট — কাজ আর হারাবে না
          </h1>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
            টুলগুলো লগইন ছাড়াই ব্যবহার করা যায়, তবে অ্যাকাউন্ট থাকলে আপনার হিসাব ও
            ডকুমেন্ট সব ডিভাইসে সংরক্ষিত থাকে।
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-md sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              লগইন করুন
            </Link>
          </p>

          <div className="mt-6">
            <Suspense fallback={<p className="text-sm text-muted-foreground">লোড হচ্ছে…</p>}>
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}