/**
 * The demo-booking destination — Calendly's qualification/routing form
 * (2 required questions: team size + tried Pancake), which routes each
 * combination to the right event type inside Calendly. Every "Book a demo"
 * CTA must use THIS form URL: direct event links would bypass qualification
 * (Calendly setup 2026-09-07, all 10 routing combinations preview-tested).
 * The zcal scheduler (ZEHl48rv) it replaces is retired.
 */
export const DEMO_BOOKING_URL = "https://calendly.com/d/d3zd-2yc-x2s";

/** The routing form's Calendly id — the `scheduler_id` on analytics events. */
export const DEMO_SCHEDULER_ID = "d3zd-2yc-x2s" as const;

/**
 * The URL the booking dialogs iframe. `embed_domain`/`embed_type` are
 * Calendly's own embed contract (enables its in-frame sizing + postMessage);
 * call only from the browser (the dialogs render the frame after a click).
 */
export function demoBookingEmbedUrl() {
  const domain = typeof window === "undefined" ? "getpancake.ai" : window.location.hostname;
  return `${DEMO_BOOKING_URL}?embed_domain=${encodeURIComponent(domain)}&embed_type=Inline&hide_gdpr_banner=1`;
}
