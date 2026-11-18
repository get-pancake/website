import { ANALYTICS_INGEST_ORIGIN, LEADJOURNEY_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Public browser-side analytics identifiers that must stay aligned with their
 * server-side counterparts. These are routing IDs, not secrets.
 */
export const META_BROWSER_PIXEL_ID = "3496980123812649";

/** Google Tag Manager web container (GA4, X and Reddit tags live in it): app/layout.tsx and /pancake-tags.js. */
export const GOOGLE_TAG_MANAGER_ID = "GTM-P3Z79WKD";

/** First-party endpoint that banks the cookie's newest touch in Pancake's own lake (lib/site-config.mjs). */
export const PANCAKE_ANALYTICS_INGEST_ORIGIN = ANALYTICS_INGEST_ORIGIN;

/**
 * Workspace-scoped LeadJourney browser tracker supplied by the vendor (a routing id, not a credential),
 * served from LeadJourney's custom tracking domain (lib/site-config.mjs).
 */
export const LEADJOURNEY_TRACKING_SCRIPT_URL = `${LEADJOURNEY_ORIGIN}/package/latest/a27db1a6-9da6-4639-8bd2-a8e33014a16a/`;

/** LinkedIn Insight Tag partner id for retargeting audiences (a routing id, not a credential). */
export const LINKEDIN_INSIGHT_PARTNER_ID = "9710642";
