import type { Metadata } from "next";
import Link from "next/link";
import { HardDrive, Keyboard, Lock, MousePointerClick } from "lucide-react";

import { InfoCard, PageShell, Prose } from "@/components/layout/content-page";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "কীভাবে কাজ করে",
  description:
    "ঝামেলা নাই-এর টুলগুলো কীভাবে কাজ করে — ব্রাউজারেই হিসাব, লগইন ছাড়াই ব্যবহার, ক্লাউডে সংরক্ষণ ও PDF ডাউনলোডের বিস্তারিত।",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    icon: MousePointerClick,
    title: "১. টুল বেছে নিন",
    body: `ক্যাটাগরি থেকে বা সার্চ করে আপনার কাজের টুল খুঁজুন। এখন মোট ${TOOLS.length}টি টুল আছে।`,
  },
  {
    icon: Keyboard,
    title: "২. ফর্ম পূরণ করুন",
    body: "হিসাব বা তথ্য দিন। ফলাফল সঙ্গে সঙ্গে হিসাব হয় — আলাদা করে “submit” চাপতে হবে না।",
  },
  {
    icon: HardDrive,
    title: "৩. আপনার ব্রাউজারেই থাকে",
    body: "টুল খুললেই আগের ভরা তথ্য ফিরে আসে। লগইন না করলেও কাজ হারায় না।",
  },
  {
    icon: Lock,
    title: "৪. সংরক্ষণ ও ডাউনলোড",
    body: "লগইন করলে “ক্লাউডে সংরক্ষণ করুন” চাপে কাজ অ্যাকাউন্টে জমা হয়; PDF, CSV বা কপি বাটনে ফলাফল নামিয়ে নিন।",
  },
];

export default function HowItWorksPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "টুলগুলোতে লগইন করতে হয়?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "না। সব টুল লগইন ছাড়াই কাজ করে। অ্যাকাউন্ট শুধু কাজ সংরক্ষণ ও অন্য ডিভাইসে ব্যবহারের জন্য দরকার।",
        },
      },
      {
        "@type": "Question",
        name: "আমার তথ্য কি সার্ভারে যায়?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "লগইন না করলে না। টুলের হিসাব ব্রাউজারেই হয়। শুধু ক্লাউডে সংরক্ষণ করলে আপনার নিজের অ্যাকাউন্টে যায়।",
        },
      },
      {
        "@type": "Question",
        name: "PDF ডাউনলোড করা যায়?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "হ্যাঁ। বেশিরভাগ টুল থেকে সরাসরি PDF, CSV বা টেক্সট হিসাব নামিয়ে নেওয়া যায়।",
        },
      },
    ],
  };

  return (
    <PageShell
      eyebrow="কীভাবে কাজ করে"
      title="চার ধাপে কাজ শেষ"
      description="কোনো ইনস্টল, কোনো অ্যাপ, কোনো লগইন ছাড়াই শুরু করুন — ফর্ম পূরণ করলেই ফলাফল।"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="grid gap-4 sm:grid-cols-2">
        {steps.map(({ icon, title, body }) => (
          <InfoCard key={title} icon={icon} title={title}>
            <p>{body}</p>
          </InfoCard>
        ))}
      </div>

      <Prose>
        <h2>ডেটা কোথায় থাকে</h2>
        <ul>
          <li>
            <strong>অতিথি মোড:</strong> হিসাব শুধু আপনার ব্রাউজারের সংরক্ষণস্থানে থাকে। সার্ভারে
            যায় না, তাই ব্রাউজারের ডেটা মুছলেই শেষ।
          </li>
          <li>
            <strong>অ্যাকাউন্ট মোড:</strong> ক্লাউডে সংরক্ষিত অবস্থা আপনার অ্যাকাউন্টে জমা হয়,
            যাতে অন্য ডিভাইস থেকেও খোলা যায়।
          </li>
          <li>
            <strong>ছবি কম্প্রেসর:</strong> ছবি আপলোড হয় না — কম্প্রেসিং সম্পূর্ণ ব্রাউজারে
            হয়।
          </li>
        </ul>

        <h2>PDF-এ বাংলা লেখা</h2>
        <p>
          বাংলা লেখার PDF সঠিকভাবে দেখানোর জন্য ডিসপ্লে-অ্যাপ পরিবর্তন না করে ব্রাউজারের
          নিজস্ব ফন্ট ব্যবহার করা হয়, তাই ডিসপ্লে-অ্যাপ থাকা সত্ত্বেও লেখা ঠিক থাকে।
        </p>

        <h2>কোনো সমস্যা হলে</h2>
        <p>
          টুল খুলছে না বা ফলাফল বোঝা যাচ্ছে না — <Link href="/contact">যোগাযোগ</Link>{" "}
          পেজে লিখুন, সাথে ব্রাউজার ও ফোনের ধরন জানালে দ্রুত সমাধান করা সম্ভব।
        </p>
      </Prose>
    </PageShell>
  );
}