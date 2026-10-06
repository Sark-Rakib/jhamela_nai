import type { MetadataRoute } from "next";

import { CATEGORIES, TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/** Tool pages are statically generated, so they belong in the sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },

    ...CATEGORIES.map((category) => ({
      url: `${SITE.url}/tools/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    ...TOOLS.map((tool) => ({
      url: `${SITE.url}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: tool.featured ? 0.8 : 0.6,
    })),
  ];
}