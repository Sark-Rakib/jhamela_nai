import type { Metadata } from "next";
import Link from "next/link";

import { InfoCard, PageShell, Prose } from "@/components/layout/content-page";
import { CATEGORIES, TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description: "ঝামেলা নাই কেন বানানো হলো — বাংলাদেশের জন্য বাংলায়, বিজ্ঞাপন ছাড়া, সহজ হিসাবের টুল।",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="আমাদের সম্পর্কে"
      title="ঝামেলা নাই — কারণ হিসাব করা যত্নের হওয়া উচিত"
      description="বাংলাদেশে টাকা, চাকরি, ডকুমেন্ট ও পড়াশোনার হিসাবের জন্য দিনে দিনে অনেক অ্যাপ
        লাগে — বেশিরভাগই ইংরেজি, বিজ্ঞাপন আর পয়সা চাওয়া নিয়ে। আমরা সেই ঝামেলা কমাতেই
        এই সাইটটি বানিয়েছি।"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard title={`${TOOLS.length}টি টুল`}>
          <p>৫টি ক্যাটাগরিতে ছড়িয়ে — টাকা, চাকরি, ডকুমেন্ট, পরিকল্পনা ও শিক্ষার্থী।</p>
        </InfoCard>
        <InfoCard title={`${CATEGORIES.length}টি ক্যাটাগরি`}>
          <p>যা যা প্রতিদিন লাগে, একই জায়গায় — খুঁজতে সময় নষ্ট হয় না।</p>
        </InfoCard>
        <InfoCard title="০টি বিজ্ঞাপন">
          <p>প্রতিটি টুল আলাদা করে হিসাব হয়, তাই বিজ্ঞাপন দেখানোর দরকারই হয়নি।</p>
        </InfoCard>
      </div>

      <Prose>
        <h2>আমাদের সহজ নিয়ম</h2>
        <ul>
          <li>সব হিসাব ব্রাউজারেই হবে — ফর্মের তথ্য সার্ভারে যাবে না।</li>
          <li>লগইন ছাড়াই সব টুল চলবে; অ্যাকাউন্ট শুধু সংরক্ষণের জন্য।</li>
          <li>বাংলায় ভাষা, বাংলাদেশের টাকা ও বাংলাদেশি ছুটির দিন মাথায় রাখা।</li>
          <li>ভুল হিসাব দেখালে আমরাই দায়ী — তাই গুরুত্বপূর্ণ সিদ্ধান্তের আগে সংশ্লিষ্ট নিয়মটাও দেখে নিন।</li>
        </ul>

        <h2>যারা বানিয়েছে</h2>
        <p>
          ঝামেলা নাই একটি স্বাধীন পণ্য। প্রযুক্তি দিয়ে কাজটা ছোট রাখা হয়েছে যাতে সাইট দ্রুত
          থাকে এবং আপনার তথ্য নিরাপদ থাকে। কোনো প্রশ্ন থাকলে{" "}
          <Link href="/contact">যোগাযোগ</Link>-এ লিখুন।
        </p>

        <p className="text-xs text-faint-foreground">
          ওয়েবসাইট: {SITE.url.replace(/^https?:\/\//, "")} · ইমেইল: {SITE.email}
        </p>
      </Prose>
    </PageShell>
  );
}