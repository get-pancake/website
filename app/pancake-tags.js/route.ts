import { ATTRIBUTION_QUERY_KEYS, emptyMappedEventFields } from "@/lib/analytics/data-layer";
import { partnerTagsScript } from "@/lib/analytics/partner-tags.mjs";
import { GOOGLE_TAG_MANAGER_ID, PANCAKE_ANALYTICS_INGEST_ORIGIN } from "@/lib/analytics/vendor-config";
import { PRODUCTION_SITE_HOSTS } from "@/lib/site-config.mjs";

/**
 * /pancake-tags.js (2026-11-03): our tags for the pages pancake.ai serves from
 * a partner's server (/learn, lib/learn-proxy.mjs). The partner loads it right
 * after /pancake-attribution.min.js. Built once at build time from the same
 * constants app/layout.tsx uses, so it can't drift from our own pages; the
 * script itself is lib/analytics/partner-tags.mjs. Partner pages depend on this
 * address: never rename or remove it (it is in scripts/known-urls.txt).
 */
export const dynamic = "force-static";

const script = partnerTagsScript({
  hosts: PRODUCTION_SITE_HOSTS,
  ingestOrigin: PANCAKE_ANALYTICS_INGEST_ORIGIN,
  gtmId: GOOGLE_TAG_MANAGER_ID,
  queryKeys: ATTRIBUTION_QUERY_KEYS,
  emptyFields: emptyMappedEventFields(),
});

export function GET() {
  return new Response(script, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      // Short browser cache, so a fix reaches partner pages within minutes.
      "Cache-Control": "public, max-age=300",
    },
  });
}
