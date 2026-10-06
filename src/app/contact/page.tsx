import type { Metadata } from "next";
import { AlertCircle, Bug, Lightbulb, Mail } from "lucide-react";

import { InfoCard, PageShell, Prose } from "@/components/layout/content-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description: "ঝামেলা নাই সম্পর্কে প্রশ্ন, সমস্যা বা পরামর্শ পাঠান — ইমেইলেই উত্তর পাবেন।",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="যোগাযোগ"
      title="লিখুন — আমরা পড়ি"
      description="টুলে সমস্যা, ভুল হিসাব, নতুন টুলের আইডিয়া বা অন্য কোনো কিছু জানাতে চাইলে ইমেইল করুন।"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={Mail} title="ইমেইল">
          <p>
            <a href={`mailto:${SITE.email}`} className="font-medium">
              {SITE.email}
            </a>
          </p>
          <p>সাধারণত ১–২ কর্মদিবসের মধ্যে উত্তর দেওয়া হয়।</p>
        </InfoCard>

        <InfoCard icon={Bug} title="টুলে সমস্যা হলে মেলান">
          <p>কোন টুল, কী ভুল হয়েছে, আর ব্রাউজার/ফোনের ধরন (যেমন Android Chrome) লিখে দিন।</p>
        </InfoCard>

        <InfoCard icon={Lightbulb} title="নতুন টুলের আইডিয়া">
          <p>
            আপনার কাজের ধরন বলুন — চাওয়া হলে নতুন টুল যোগ করা হবে। সব টুলই বাংলায় ও
            বাংলাদেশি প্রেক্ষাপটে থাকবে।
          </p>
        </InfoCard>

        <InfoCard icon={AlertCircle} title="গোপনীয়তা">
          <p>
            ইমেইলে কখনো পাসওয়ার্ড, OTP বা সম্পূর্ণ টাকার বিবরণ লিখবেন না। বিস্তারিত{" "}
            <a href="/privacy" className="font-medium">
              প্রাইভেসি পলিসি
            </a>
            -তে আছে।
          </p>
        </InfoCard>
      </div>

      <Prose>
        <h2>অ্যাকাউন্ট সংক্রান্ত সমস্যা</h2>
        <p>
          লগইন করতে সমস্যা হলে পাসওয়ার্ড রিসেট লিখে ইমেইল দিন। অ্যাকাউন্ট মুছে ফেলা বা
          সংরক্ষিত তথ্য মুছে ফেলার অনুরোধও একই ঠিকানায় জানান — ৩০ দিনের মধ্যে করা হবে।
        </p>
      </Prose>
    </PageShell>
  );
}