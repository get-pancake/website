import type { Goal, HasAccount, TeamSize } from "@/lib/demo-request";

/**
 * Demo booking, end to end.
 *
 * Every "Book a demo" / "Book a meeting" CTA links to /demo in the same tab
 * (DEMO_PAGE_PATH; François, 2026-09-16: "I want the 'book a demo' buttons
 * to lead to the demo page"). The page-level Calendly dialogs (LpModals,
 * LandingModals) are no longer mounted anywhere.
 *
 * /demo asks the routing form's questions itself (lib/demo-request.ts), so
 * after /api/demo-request lands it embeds the calendar those answers route
 * to (demoBookingDestination, demoBookingEventUrl), not the routing form,
 * which would ask the same questions again (François, 2026-09-16: "could we
 * use the questions from the demo page as answers to the router directly,
 * and route you to the right calendar?").
 *
 * DEMO_BOOKING_URL is Calendly's qualification/routing form "Pancake
 * discovery call" (id 402887), still the public booking link: Calendly
 * routes everyone who opens it (Loops emails, the AI sales agent, the
 * unmounted dialogs) and feeds Attio from it (routing submissions and
 * bookings).
 */
export const DEMO_BOOKING_URL = "https://calendly.com/d/d3zd-2yc-x2s";

/** Where every demo-booking CTA on the site points (same tab). */
export const DEMO_PAGE_PATH = "/demo";

/*
 * The calendars /demo books directly. Mirrors the live Calendly routing form
 * 402887, read 2026-09-16: its routes run in order on the Team size answer
 * only (the account and goal answers never change the calendar), and any
 * other value falls back to the discovery call. Calendly still routes
 * everyone who uses the routing form URL (Loops emails, the AI sales agent),
 * so both paths must land on the same calendar: any change to Calendly's
 * routes, buckets or event links updates this table, DEMO_BOOKING_ROUTES and
 * lib/demo-request.ts TEAM_SIZES in the same change.
 *
 * The direct event links bypass the routing form by design (founder
 * decision, 2026-09-16). So /demo bookings create no "Calendly Routing Form
 * Submissions" in Attio; the bookings themselves still reach Attio.
 */
export type DemoBookingDestinationKey = "discovery" | "enterprise" | "groupDemo" | "largeGroupDemo";

export type DemoBookingDestination = Readonly<{
  key: DemoBookingDestinationKey;
  /** the event type's name in Calendly */
  name: string;
  /** the event type's public link (what the routing form redirects to) */
  url: string;
}>;

export const DEMO_BOOKING_DESTINATIONS: Readonly<Record<DemoBookingDestinationKey, DemoBookingDestination>> =
  Object.freeze({
    /** 30 min, Round Robin; asks name and email only */
    discovery: Object.freeze({
      key: "discovery",
      name: "Pancake discovery call",
      url: "https://calendly.com/d/d3nb-49j-dv2/pancake-discovery-call",
    }),
    /** 45 min, Collective; set up like the discovery call (2026-09-08) */
    enterprise: Object.freeze({
      key: "enterprise",
      name: "Pancake enterprise discovery call",
      url: "https://calendly.com/d/dz6m-cfh-bz7/pancake-enterprise-discovery-call",
    }),
    /** 30 min, Group; one optional question, prefilled through `a1` */
    groupDemo: Object.freeze({
      key: "groupDemo",
      name: "Pancake group demo",
      url: "https://calendly.com/getpancake/pancake-group-demo",
    }),
    /** 30 min, Group; one optional question, prefilled through `a1` */
    largeGroupDemo: Object.freeze({
      key: "largeGroupDemo",
      name: "Pancake group demo (L)",
      url: "https://calendly.com/getpancake/pancake-large-group-demo",
    }),
  });

/** The routing form's routes, in Calendly's order (first match wins). */
const DEMO_BOOKING_ROUTES: ReadonlyArray<Readonly<{ teamSize: TeamSize; destination: DemoBookingDestinationKey }>> =
  Object.freeze([
    Object.freeze({ teamSize: "21-50", destination: "discovery" }),
    Object.freeze({ teamSize: "51+", destination: "enterprise" }),
    Object.freeze({ teamSize: "3-20", destination: "groupDemo" }),
    Object.freeze({ teamSize: "1-2", destination: "largeGroupDemo" }),
  ]);

/** Calendly's fallback when no route matches. */
const DEMO_BOOKING_FALLBACK: DemoBookingDestinationKey = "discovery";

/**
 * The calendar a Team size answer routes to, as the routing form would
 * route it. Takes any string: a value with no route gets the fallback, as in
 * Calendly. Pure.
 */
export function demoBookingDestination(teamSize: string): DemoBookingDestination {
  const route = DEMO_BOOKING_ROUTES.find((candidate) => candidate.teamSize === teamSize);
  return DEMO_BOOKING_DESTINATIONS[route ? route.destination : DEMO_BOOKING_FALLBACK];
}

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
 *  resize the frame. Real pages are far taller (the routing form measured
 *  ~650px). */
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
 * Calendly's Inline embed params. `embed_domain`/`embed_type` are Calendly's
 * own embed contract (enables its in-frame sizing + postMessage). Call only
 * from the browser (the frame is built after mount, from computed colors).
 */
function calendlyEmbedParams({ compact = false, colors = {} }: EmbedOptions): URLSearchParams {
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
  return params;
}

/**
 * The routing form as an Inline embed, for the unmounted dialogs (LpModals,
 * LandingModals). Every param set here survives the routing form's redirect
 * to the event type (verified 2026-09-07).
 */
export function demoBookingEmbedUrl(options: EmbedOptions = {}) {
  return `${DEMO_BOOKING_URL}?${calendlyEmbedParams(options).toString()}`;
}

/** What /demo hands Calendly after a successful request: the answers the
 *  event URL uses. Nothing else about the visitor (no submission id) goes to
 *  Calendly. */
export type DemoBookingAnswers = {
  firstName: string;
  lastName: string;
  email: string;
  /** normalised (lib/demo-request.ts normalizeWebsite) */
  website: string;
  teamSize: TeamSize;
  hasAccount: HasAccount;
  /** optional question: left out of the context line when empty */
  goal?: Goal | "";
};

/** The context line's ceiling, in characters. Every field is bounded by
 *  lib/demo-request.ts, so only an unusually long website can reach it. */
export const DEMO_BOOKING_CONTEXT_MAX = 500;

/** The form's values are lowercase; the context line reads like Calendly's options. */
const HAS_ACCOUNT_TEXT: Record<HasAccount, "Yes" | "No"> = { yes: "Yes", no: "No" };

/**
 * The plain-text line prefilled into the group demos' one booking question
 * ("Please share anything that will help prepare for our meeting.", `a1`),
 * so the host sees the /demo answers: "Team size: 3-20. Pancake account: No.
 * Goal: Find qualified leads. Website: https://acme.com/". Goal is left out
 * when empty. A line that would pass DEMO_BOOKING_CONTEXT_MAX drops the
 * website rather than cut a URL in half.
 */
function demoBookingContext(answers: DemoBookingAnswers): string {
  const facts = [`Team size: ${answers.teamSize}.`, `Pancake account: ${HAS_ACCOUNT_TEXT[answers.hasAccount]}.`];
  if (answers.goal) facts.push(`Goal: ${answers.goal}.`);
  const website = answers.website.trim();
  const line = [...facts, ...(website ? [`Website: ${website}`] : [])].join(" ");
  return line.length <= DEMO_BOOKING_CONTEXT_MAX ? line : facts.join(" ").slice(0, DEMO_BOOKING_CONTEXT_MAX);
}

/**
 * The routed calendar (demoBookingDestination) as an Inline embed, prefilled:
 * the embed and color params, then `name` ("First Last"), `email` and `a1`
 * (the context line). The discovery and enterprise calls have no custom
 * question, and Calendly ignores `a1` there. Encoded with URLSearchParams,
 * then `+` written as `%20`: the form the routing-form prefill was verified
 * with live (2026-09-16), decoded the same by every parser; a literal plus
 * (an email alias) is already `%2B`. Call only from the browser.
 */
export function demoBookingEventUrl(answers: DemoBookingAnswers, options: EmbedOptions = {}) {
  const params = calendlyEmbedParams(options);
  const name = [answers.firstName.trim(), answers.lastName.trim()].filter(Boolean).join(" ");
  if (name) params.set("name", name);
  const email = answers.email.trim();
  if (email) params.set("email", email);
  params.set("a1", demoBookingContext(answers));
  const { url } = demoBookingDestination(answers.teamSize);
  return `${url}?${params.toString().replace(/\+/g, "%20")}`;
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
