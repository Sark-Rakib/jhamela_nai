import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private areas and API responses must never be indexed.
        disallow: ["/admin", "/dashboard", "/api/", "/login", "/register"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url.replace(/^https?:\/\//, ""),
  };
}