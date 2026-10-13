/**
 * Global site configuration. Single source of truth for SEO, OpenGraph,
 * structured data and PWA manifest values.
 */

export const SITE = {
  name: "Jhamela Nai",
  nameBn: "ঝামেলা নাই",
  tagline: "প্রতিদিনের কাজ, এক জায়গায় সহজ সমাধান।",
  taglineEn: "Everyday problems. Simple solutions.",
  shortDescription:
    "বাংলাদেশের জন্য বানানো সবকিছুর টুল এক জায়গায় — বাজেট, CV, invoice, খরচের হিসাব, CGPA ও ভ্রমণের পরিকল্পনা।",
  shortDescriptionEn:
    "Everyday tools for Bangladesh in one place — budget, CV, invoice, expense tracking, CGPA and trip planning.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jhamelanai.com",
  locale: "bn_BD",
  lang: "bn",
  twitter: "@jhamelanai",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@jhamelanai.com",
  themeColor: "#059669",
  themeColorDark: "#0c0e10",
  category: "productivity",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "হোম", labelEn: "Home" },
  { href: "/tools", label: "সব টুল", labelEn: "Tools" },
  { href: "/tools?category=money", label: "ক্যাটাগরি", labelEn: "Categories" },
  { href: "/how-it-works", label: "কীভাবে কাজ করে", labelEn: "How It Works" },
  { href: "/pricing", label: "প্রাইসিং", labelEn: "Pricing" },
] as const;

export const FOOTER_LINKS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "টুল",
    links: [
      { href: "/tools/budget-planner", label: "বাজেট প্ল্যানার" },
      { href: "/tools/expense-tracker", label: "খরচের হিসাব" },
      { href: "/tools/cv-builder", label: "CV বিল্ডার" },
      { href: "/tools/invoice-generator", label: "Invoice জেনারেটর" },
      { href: "/tools/cgpa-calculator", label: "CGPA ক্যালকুলেটর" },
      { href: "/tools/travel-budget-planner", label: "ট্রাভেল বাজেট" },
    ],
  },
  {
    title: "ক্যাটাগরি",
    links: [
      { href: "/tools/category/money", label: "টাকা ও হিসাব" },
      { href: "/tools/category/career", label: "চাকরি ও ক্যারিয়ার" },
      { href: "/tools/category/documents", label: "ডকুমেন্ট" },
      { href: "/tools/category/planning", label: "পরিকল্পনা" },
      { href: "/tools/category/student", label: "শিক্ষার্থী" },
    ],
  },
  {
    title: "কোম্পানি",
    links: [
      { href: "/how-it-works", label: "কীভাবে কাজ করে" },
      { href: "/pricing", label: "প্রাইসিং" },
      { href: "/about", label: "আমাদের সম্পর্কে" },
      { href: "/contact", label: "যোগাযোগ" },
    ],
  },
  {
    title: "আইনি",
    links: [
      { href: "/privacy", label: "প্রাইভেসি পলিসি" },
      { href: "/terms", label: "শর্তাবলি" },
      { href: "/admin", label: "অ্যাডমিন" },
    ],
  },
];

// The API ships inside the Next app (see `src/pages/api/[...path].ts`), so the
// same-origin path works everywhere. Local dev can still point at the
// standalone Express server via `NEXT_PUBLIC_API_URL`.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
