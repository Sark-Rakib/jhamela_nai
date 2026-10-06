import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Dashboard } from "@/features/dashboard/dashboard";

export const metadata: Metadata = {
  title: "ড্যাশবোর্ড",
  description: "আপনার সংরক্ষিত টুলের তথ্য ও কাজ এক জায়গায় দেখুন।",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
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
          <li className="font-medium text-foreground">ড্যাশবোর্ড</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">আপনার ড্যাশবোর্ড</h1>
          <p className="mt-2 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            যে টুলগুলো ব্যবহার করেছেন সেগুলোর সংরক্ষিত অবস্থা এখানে পাবেন। ক্লাউডে সংরক্ষণ
            করলে অন্য ডিভাইস থেকেও খোলা যায়।
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/tools">নতুন কাজ শুরু করুন</Link>
        </Button>
      </header>

      <div className="mt-8">
        <Dashboard />
      </div>
    </div>
  );
}