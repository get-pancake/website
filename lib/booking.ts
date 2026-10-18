import { TEAM_SIZES, type Goal, type HasAccount, type TeamSize } from "@/lib/demo-request";
import { SITE_HOST } from "@/lib/site-config.mjs";

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
 * routes everyone who opens it (Loops emails, the unmounted dialogs) and
 * feeds Attio from it (routing submissions and bookings). The "Talk to
 * Pancake" agent no longer sends people there: it offers open times on the
 * calendar this file routes to and opens the one the visitor picks
 * (demoBookingSlot, lib/ai-sales.ts).
 */
export const DEMO_BOOKING_URL = "https://calendly.com/d/d3zd-2yc-x2s";

/** Where every demo-booking CTA on the site points (same tab). */
export const DEMO_PAGE_PATH = "/demo";

/** Sales consultations: explicit White Glove interest takes precedence over size.
 * Keep the independent Calendly routing form in sync. Unknown answers never
 * fall back to an unrestricted calendar. Group event IDs remain in historical analytics only.
 */
export type DemoBookingDestinationKey = "enterprise" | "whiteGlove";
export type DemoBookingDestination = Readonly<{
  key: DemoBookingDestinationKey;
  name: string;
  url: string;
  eventTypeUri: string;
  answerParam: "a1" | "a2";
}>;
export const DEMO_BOOKING_DESTINATIONS: Readonly<Record<DemoBookingDestinationKey, DemoBookingDestination>> = {
  enterprise: {
    key: "enterprise",
    name: "Pancake enterprise discovery call",
    url: "https://calendly.com/d/dz6m-cfh-bz7/pancake-enterprise-discovery-call",
    eventTypeUri: "https://api.calendly.com/event_types/e377c789-7c07-4b99-84cd-5a5464b7ce31",
    answerParam: "a2",
  },
  whiteGlove: {
    key: "whiteGlove",
    name: "Pancake Whiteglove",
    url: "https://calendly.com/getpancake/pancake-whiteglove",
    eventTypeUri: "https://api.calendly.com/event_types/4038695d-6406-483f-b395-533f6a3aee77",
    answerParam: "a1",
  },
};

export function demoBookingDestination(teamSize: string, whiteGlove?: string): DemoBookingDestination | null {
  if (!(TEAM_SIZES as readonly string[]).includes(teamSize)) return null;
  if (whiteGlove === "yes") return DEMO_BOOKING_DESTINATIONS.whiteGlove;
  if (teamSize === "51+" && whiteGlove === "no") return DEMO_BOOKING_DESTINATIONS.enterprise;
  return null;
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
  const domain = typeof window === "undefined" ? SITE_HOST : window.location.hostname;
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
  whiteGlove: "yes" | "no";
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
 * The plain-text line prefilled into every calendar's booking question
 * ("Please share anything that will help prepare for our meeting.", through
 * the destination's answerParam), so the host sees the /demo answers: "Team size: 3-20. Pancake account: No.
 * Goal: Find qualified leads. Website: https://acme.com/". Goal is left out
 * when empty. A line that would pass DEMO_BOOKING_CONTEXT_MAX drops the
 * website rather than cut a URL in half.
 */
export function demoBookingContext(answers: DemoBookingAnswers): string {
  const facts = [`White Glove interest: ${answers.whiteGlove === "yes" ? "Yes" : "No"}.`, `Team size: ${answers.teamSize}.`, `Pancake account: ${HAS_ACCOUNT_TEXT[answers.hasAccount]}.`];
  if (answers.goal) facts.push(`Goal: ${answers.goal}.`);
  const website = answers.website.trim();
  const line = [...facts, ...(website ? [`Website: ${website}`] : [])].join(" ");
  return line.length <= DEMO_BOOKING_CONTEXT_MAX ? line : facts.join(" ").slice(0, DEMO_BOOKING_CONTEXT_MAX);
}

/**
 * One open time on the routed calendar, as Calendly's own page links to it:
 * `<event url>/<start>?month=YYYY-MM&date=YYYY-MM-DD` opens "Enter Booking
 * Details" for that time, with the prefill params applied (checked live on
 * the discovery call, the enterprise call and the group demo, 2026-09-16).
 * The visitor only confirms. What Calendly shows for a time taken in the
 * meantime was not tested; its booking page has a back arrow to the
 * calendar either way.
 */
export type DemoBookingSlot = Readonly<{
  /** UTC, whole seconds: "2026-09-21T18:00:00Z" */
  start: string;
  /** the calendar month and day behind the booking page, in the visitor's zone */
  month: string;
  date: string;
}>;

/** How far ahead a slot may be: Calendly's own booking windows are shorter. */
export const DEMO_BOOKING_SLOT_MAX_DAYS = 90;

const SLOT_START_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|([+-])(\d{2}):?(\d{2}))$/;

/**
 * A slot from a start time the agent read from Calendly's available times
 * ("2026-09-21T18:00:00.000000Z", or with an offset), or null when it is not
 * an ISO date-time with a zone, not a real date, in the past, or more than
 * DEMO_BOOKING_SLOT_MAX_DAYS ahead. Parsed by hand: Safari's Date parser
 * refuses microseconds. Pure.
 */
export function demoBookingSlot(startTime: unknown, now: Date, timeZone: string): DemoBookingSlot | null {
  if (typeof startTime !== "string") return null;
  const match = SLOT_START_RE.exec(startTime.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, sec, sign, offH, offM] = match;
  const offsetMinutes = sign ? (sign === "-" ? -1 : 1) * (Number(offH) * 60 + Number(offM)) : 0;
  const fields = [Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(sec ?? "0")] as const;
  const local = new Date(Date.UTC(...fields));
  // Date.UTC rolls over (February 30 becomes March 2): reject what it changed.
  if (
    local.getUTCFullYear() !== fields[0] ||
    local.getUTCMonth() !== fields[1] ||
    local.getUTCDate() !== fields[2] ||
    local.getUTCHours() !== fields[3] ||
    local.getUTCMinutes() !== fields[4] ||
    local.getUTCSeconds() !== fields[5]
  ) {
    return null;
  }
  const start = new Date(local.getTime() - offsetMinutes * 60_000);
  const ahead = start.getTime() - now.getTime();
  if (ahead <= 0 || ahead > DEMO_BOOKING_SLOT_MAX_DAYS * 24 * 60 * 60 * 1000) return null;
  let day: string;
  try {
    // en-CA formats as YYYY-MM-DD.
    day = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(start);
  } catch {
    day = start.toISOString().slice(0, 10);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) day = start.toISOString().slice(0, 10);
  return { start: start.toISOString().replace(/\.\d{3}Z$/, "Z"), month: day.slice(0, 7), date: day };
}

/**
 * The routed calendar (demoBookingDestination) as an Inline embed, prefilled:
 * the embed and color params, then `name` ("First Last"), `email` and the
 * context line in the destination's answerParam. With a `slot`, the embed
 * opens that time's booking page instead of the calendar (DemoBookingSlot).
 * Encoded with URLSearchParams, then `+` written as `%20`: the form the
 * routing-form prefill was verified with live (2026-09-16), decoded the
 * same by every parser; a literal plus (an email alias) is already `%2B`.
 * Call only from the browser.
 */
export function demoBookingEventUrl(answers: DemoBookingAnswers, options: EmbedOptions = {}, slot?: DemoBookingSlot | null) {
  const params = calendlyEmbedParams(options);
  if (slot) {
    params.set("month", slot.month);
    params.set("date", slot.date);
  }
  const name = [answers.firstName.trim(), answers.lastName.trim()].filter(Boolean).join(" ");
  if (name) params.set("name", name);
  const email = answers.email.trim();
  if (email) params.set("email", email);
  const destination = demoBookingDestination(answers.teamSize, answers.whiteGlove);
  if (!destination) return null;
  const { url, answerParam } = destination;
  params.set(answerParam, demoBookingContext(answers));
  const path = slot ? `${url}/${slot.start}` : url;
  return `${path}?${params.toString().replace(/\+/g, "%20")}`;
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
