import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.nameBn} — ${SITE.tagline}`,
    short_name: SITE.nameBn,
    description: SITE.shortDescription,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: SITE.themeColorDark,
    theme_color: SITE.themeColor,
    lang: "bn",
    dir: "ltr",
    categories: ["finance", "productivity", "utilities", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "বাজেট প্ল্যানার", short_name: "বাজেট", url: "/tools/budget-planner" },
      { name: "খরচের হিসাব", short_name: "খরচ", url: "/tools/expense-tracker" },
      { name: "ইনভয়েস তৈরি", short_name: "ইনভয়েস", url: "/tools/invoice-generator" },
      { name: "সব টুল", short_name: "টুল", url: "/tools" },
    ],
  };
}