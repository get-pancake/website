import type { Goal, HasAccount, TeamSize } from "@/lib/demo-request";

/**
 * Demo booking, end to end.
 *
 * Every "Book a demo" / "Book a meeting" CTA links to /demo in the same tab
 * (DEMO_PAGE_PATH; François, 2026-09-16: "I want the 'book a demo' buttons
 * to lead to the demo page"). The page-level Calendly dialogs (LpModals,
 * LandingModals) are no longer mounted anywhere.
 *
 * Behind /demo, the booking destination is still Calendly's
 * qualification/routing form (DEMO_BOOKING_URL): it asks team size, whether
 * the visitor has a Pancake account and the optional #1 goal, routes each
 * combination to the right event type inside Calendly, and feeds Attio
 * (routing submissions and bookings). After /api/demo-request lands, /demo
 * embeds THIS form inline, prefilled with the visitor's answers
 * (demoBookingPrefillUrl). Never link a direct event: it would bypass the
 * routing and Attio (Calendly setup 2026-09-07, all routing combinations
 * preview-tested).
 */
export const DEMO_BOOKING_URL = "https://calendly.com/d/d3zd-2yc-x2s";

/** Where every demo-booking CTA on the site points (same tab). */
export const DEMO_PAGE_PATH = "/demo";

/*
 * The routing form's question ids. Calendly prefills a question from a query
 * param keyed by its id, valued with the option's exact visible text
 * (verified live 2026-09-16: all three prefilled; the visitor still presses
 * Calendly's own Submit, then picks a slot). The option text lives in
 * lib/demo-request.ts (TEAM_SIZES, GOALS) and must match Calendly verbatim.
 */
/** Team size: required dropdown, options "1-2" / "3-20" / "21-50" / "51+". */
export const CALENDLY_TEAM_SIZE_QUESTION_ID = "6bbdc262-0cf1-4225-ae54-cafa8bd90e7d";
/** "Do you already have a Pancake account?": required radio, "Yes" / "No". */
export const CALENDLY_HAS_ACCOUNT_QUESTION_ID = "370f031a-d6d3-4fed-be3a-5a57b2710ef3";
/** "What is the #1 thing Pancake can do for you?": optional dropdown (GOALS). */
export const CALENDLY_GOAL_QUESTION_ID = "efdf2fa6-ab52-4437-9b6a-1b376e79bf98";

/** The form's values are lowercase; Calendly's radio options are capitalised. */
const CALENDLY_HAS_ACCOUNT: Record<HasAccount, "Yes" | "No"> = { yes: "Yes", no: "No" };

/** The routing form's Calendly id — the `scheduler_id` on analytics events. */
export const DEMO_SCHEDULER_ID = "d3zd-2yc-x2s" as const;

/** Calendly's postMessage origin — the only sender the embeds listen to. */
export const CALENDLY_ORIGIN = "https://calendly.com";

/**
 * Below this frame width Calendly stacks the booking page (logo, host, event
 * details, THEN the calendar — the calendar lands ~500px down); at or above
 * it the page is two columns with the calendar in view at once. Measured
 * 2026-09-07: 952px stacked, 1000px two-column. Frames narrower than this
 * open the embed compact (event details hidden) so the calendar comes first.
 */
export const CALENDLY_TWO_COLUMN_MIN = 1000;

/** Calendly posts its loading spinner's height too (26px measured
 *  2026-09-07); page-height reports under this are not a page and must not
 *  resize the frame. Its shortest real page (the routing form) is ~650px. */
export const CALENDLY_MIN_PAGE_HEIGHT = 200;

/** Colors the embed is skinned with — Calendly's `background_color` /
 *  `text_color` / `primary_color` params. /demo's booking state reads them
 *  off the card at mount (computed CSS), so the embed follows the design
 *  tokens instead of duplicating hex values here. Any CSS color string;
 *  values that don't reduce to a flat hex are left to Calendly's defaults. */
export type EmbedColors = {
  background?: string | null;
  text?: string | null;
  primary?: string | null;
};

export type EmbedOptions = {
  /** Hide the event's details block (host, title, duration) so the calendar
   *  is the first thing in the frame — for frames under
   *  CALENDLY_TWO_COLUMN_MIN, where Calendly stacks the page. */
  compact?: boolean;
  colors?: EmbedColors;
};

/**
 * The routing form as an Inline embed. `embed_domain`/`embed_type` are
 * Calendly's own embed contract (enables its in-frame sizing + postMessage);
 * every param set here survives the routing form's redirect to the event
 * type (verified 2026-09-07). Call only from the browser (the frame is built
 * after mount, from computed colors).
 */
export function demoBookingEmbedUrl({ compact = false, colors = {} }: EmbedOptions = {}) {
  const domain = typeof window === "undefined" ? "getpancake.ai" : window.location.hostname;
  const params = new URLSearchParams({
    embed_domain: domain,
    embed_type: "Inline",
    hide_gdpr_banner: "1",
  });
  if (compact) params.set("hide_event_type_details", "1");
  const background = toCalendlyHex(colors.background);
  const text = toCalendlyHex(colors.text);
  const primary = toCalendlyHex(colors.primary);
  if (background) params.set("background_color", background);
  if (text) params.set("text_color", text);
  if (primary) params.set("primary_color", primary);
  return `${DEMO_BOOKING_URL}?${params.toString()}`;
}

/** What /demo hands Calendly after a successful request: the three routing
 *  answers plus the name and email for the booking page. Nothing else about
 *  the visitor (no website, no submission id) goes to Calendly. */
export type DemoBookingPrefill = {
  teamSize: TeamSize;
  hasAccount: HasAccount;
  /** optional question: omitted from the URL when empty */
  goal?: Goal | "";
  firstName: string;
  lastName: string;
  email: string;
};

/**
 * demoBookingEmbedUrl (embed + color params kept) plus the prefill: the three
 * routing answers keyed by question id, then `name` ("First Last") and
 * `email`, which Calendly carries to the booking page after routing (every
 * query param survives the redirect, verified 2026-09-07). Encoded with
 * URLSearchParams, then `+` written as `%20`: the form the prefill was
 * verified with live (2026-09-16), decoded the same by every parser; a
 * literal plus (an email alias) is already `%2B`. Client-safe.
 */
export function demoBookingPrefillUrl(prefill: DemoBookingPrefill, options: EmbedOptions = {}) {
  const embed = new URL(demoBookingEmbedUrl(options));
  const params = embed.searchParams;
  params.set(CALENDLY_TEAM_SIZE_QUESTION_ID, prefill.teamSize);
  params.set(CALENDLY_HAS_ACCOUNT_QUESTION_ID, CALENDLY_HAS_ACCOUNT[prefill.hasAccount]);
  if (prefill.goal) params.set(CALENDLY_GOAL_QUESTION_ID, prefill.goal);
  const name = [prefill.firstName.trim(), prefill.lastName.trim()].filter(Boolean).join(" ");
  if (name) params.set("name", name);
  const email = prefill.email.trim();
  if (email) params.set("email", email);
  return `${DEMO_BOOKING_URL}?${params.toString().replace(/\+/g, "%20")}`;
}

/**
 * `#rgb` / `#rrggbb` / `rgb(r, g, b)` (what getComputedStyle hands back for
 * the tokens) → Calendly's `rrggbb`. Anything else — transparent, translucent,
 * color-mix(), empty — returns null so the param is left to Calendly.
 */
export function toCalendlyHex(color: string | null | undefined): string | null {
  if (!color) return null;
  const value = color.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1]!;
    const full =
      digits.length === 3
        ? digits
            .split("")
            .map((d) => d + d)
            .join("")
        : digits;
    return full.toLowerCase();
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (rgb) {
    if (rgb[4] !== undefined && Number(rgb[4]) < 1) return null;
    return [rgb[1], rgb[2], rgb[3]]
      .map((n) => Math.min(255, Number(n)).toString(16).padStart(2, "0"))
      .join("");
  }
  return null;
}

/**
 * The height Calendly reports for its page inside an Inline embed — the
 * `calendly.page_height` message (`payload.height`, e.g. "742px"). Null for
 * any other message. Callers must have checked the event's origin already.
 */
export function calendlyPageHeight(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const message = data as { event?: unknown; payload?: { height?: unknown } };
  if (message.event !== "calendly.page_height") return null;
  const raw = message.payload?.height;
  const height = typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw) : NaN;
  return Number.isFinite(height) && height > 0 ? Math.ceil(height) : null;
}

/**
 * True for Calendly's `calendly.event_scheduled` message: the visitor
 * finished booking inside an Inline embed. Callers must have checked the
 * event's origin and source already.
 */
export function isCalendlyEventScheduled(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  return (data as { event?: unknown }).event === "calendly.event_scheduled";
}
