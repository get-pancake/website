import type { MetadataRoute } from "next";
import { learnSitemaps } from "@/lib/learn-proxy.mjs";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    // Ours, plus the /learn partner's own sitemap while that section is on.
    sitemap: [`${SITE_ORIGIN}/sitemap.xml`, ...learnSitemaps(SITE_ORIGIN)],
  };
}
