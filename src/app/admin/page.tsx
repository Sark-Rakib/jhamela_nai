import type { Metadata } from "next";
import Link from "next/link";

import { AdminPanel } from "@/features/admin/admin-panel";

export const metadata: Metadata = {
  title: "অ্যাডমিন",
  description: "ঝামেলা নাই অ্যাডমিন প্যানেল।",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <nav aria-label="ব্রেডক্রাম্ব">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              হোম
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-foreground">অ্যাডমিন</li>
        </ol>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">অ্যাডমিন প্যানেল</h1>
        <p className="mt-2 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          টুল ব্যবহারের সংখ্যা ও ইভেন্ট সারাংশ — কোনো ব্যক্তিগত তথ্য ছাড়াই।
        </p>
      </header>

      <div className="mt-8">
        <AdminPanel />
      </div>
    </div>
  );
}