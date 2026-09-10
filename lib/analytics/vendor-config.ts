/**
 * Public browser-side analytics identifiers that must stay aligned with their
 * server-side counterparts. These are routing IDs, not secrets.
 */
export const META_BROWSER_PIXEL_ID = "3496980123812649";

/** Fixed first-party endpoint that banks the cookie's newest touch in Pancake's own lake. */
export const PANCAKE_ANALYTICS_INGEST_ORIGIN = "https://beta-api.getpancake.ai";

/** Workspace-scoped LeadJourney browser tracker supplied by the vendor (a routing id, not a credential). */
export const LEADJOURNEY_TRACKING_SCRIPT_URL =
  "https://t.getpancake.ai/package/latest/a27db1a6-9da6-4639-8bd2-a8e33014a16a/";
