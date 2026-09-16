/**
 * /demo request contract, shared by the form (browser) and the API route.
 * Browser-safe on purpose: no `server-only`, no node imports. The option
 * lists live here once so the selects and the server check the same values.
 * The questions are the Calendly routing form's (lib/booking.ts). After the
 * request lands, /demo routes these answers itself and opens the calendar
 * the routing form would pick, so Calendly does not ask them again.
 */

/**
 * MUST equal the Calendly routing form's Team size option text, character
 * for character (ASCII hyphen-minus): lib/booking.ts routes /demo on this
 * exact string (DEMO_BOOKING_ROUTES copies the routing form's routes). A
 * value with no route falls back to the discovery call without an error,
 * while Loops emails and the AI sales agent still go through the routing
 * form itself, so the two paths would book different calendars. It broke
 * once on 2026-09-16, when the Calendly buckets changed from 1-2 / 3-10 /
 * 11-50 / 51-200 / 201+ to the four below. Any change to Calendly's routes,
 * buckets or event links updates this list and lib/booking.ts in the same
 * change.
 */
export const TEAM_SIZES = ["1-2", "3-20", "21-50", "51+"] as const;
export type TeamSize = (typeof TEAM_SIZES)[number];
/** Form values; lib/booking.ts writes them as "Yes" / "No" in the booking's answers line. */
export const HAS_ACCOUNT = ["yes", "no"] as const;
export type HasAccount = (typeof HAS_ACCOUNT)[number];
/** The Calendly routing form's option text, verbatim, so an answer reads the
    same on both paths. Not used for routing (only Team size is). */
export const GOALS = [
  "Find qualified leads",
  "Help me run my GTM from Claude / other",
  "Grow visibility in AI search",
  "Automate outreach",
  "Explore what Pancake can do",
] as const;
export type Goal = (typeof GOALS)[number];

export const DEMO_REQUEST_SOURCE = "demo-page";
/** Never a real field: bots fill it, humans never see it. The waitlist's
    honeypot is named `website`, which is a real question here. */
export const HONEYPOT_FIELD = "nickname";
export const NAME_MAX = 100;
export const EMAIL_MAX = 200;
export const WEBSITE_MAX = 200;
/** bytes; the largest legitimate body is ~600 bytes */
export const BODY_MAX = 16_384;
/** = app/api/waitlist/route.ts */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** = lib/analytics/waitlist-delivery.ts (v4 only) */
const SUBMISSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** C0/C1 controls, bidi overrides, zero-width joiners: never part of a name.
    Built with the constructor: tsconfig has no `target`, so TS rejects the
    `u` flag on a literal (TS1501) although every runtime here supports it. */
const CONTROL_OR_FORMAT_RE = new RegExp("[\\p{Cc}\\p{Cf}]", "gu");

export const DEMO_REQUEST_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "website",
  "teamSize",
  "hasAccount",
  "goal",
  "submissionId",
] as const;
export type DemoRequestField = (typeof DEMO_REQUEST_FIELDS)[number];

export type DemoRequest = {
  firstName: string;
  lastName: string;
  email: string;
  website: string;
  teamSize: TeamSize;
  hasAccount: HasAccount;
  goal?: Goal;
  submissionId?: string;
};
export type DemoRequestParse = { ok: true; value: DemoRequest } | { ok: false; field: DemoRequestField };
export type DemoRequestDelivery = "slack" | "airtable";
export type DemoRequestErrorCode = "invalid" | "forbidden" | "rate_limited" | "unavailable";
export type DemoRequestResponse =
  | { ok: true; delivered: DemoRequestDelivery[] }
  | { ok: false; error: DemoRequestErrorCode; field?: DemoRequestField };

function isOneOf<const T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

export function isDemoRequestField(value: unknown): value is DemoRequestField {
  return isOneOf(DEMO_REQUEST_FIELDS, value);
}

/** Collapse whitespace (a pasted tab or newline becomes one space), then
    strip control and format characters (C0/C1, bidi overrides, zero-width),
    then trim. Nothing that could start a new line survives. */
export function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").replace(CONTROL_OR_FORMAT_RE, "").trim();
}

/** Accept "acme.com" as well as a full URL; null when it cannot be one.
    Copied from app/api/waitlist/route.ts normalizeUrl (path dropped there too). */
export function normalizeWebsite(raw: string): string | null {
  const trimmed = cleanText(raw);
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.username || url.password || !url.hostname.includes(".")) return null;
    return `${url.protocol}//${url.host}/`;
  } catch {
    return null;
  }
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = cleanText(value);
  return name.length >= 1 && name.length <= NAME_MAX ? name : null;
}

/** Blank means "not answered" for the optional fields. */
function isBlank(value: unknown): value is undefined | null | "" {
  return value === undefined || value === null || value === "";
}

/**
 * Validate an untrusted body (a parsed JSON object, or the form's
 * FormData entries). Unknown keys, the honeypot included, are ignored. The
 * first failing field is returned, in form order.
 */
export function parseDemoRequest(input: unknown): DemoRequestParse {
  if (typeof input !== "object" || input === null) return { ok: false, field: "firstName" };
  const body = input as Record<string, unknown>;

  const firstName = cleanName(body.firstName);
  if (!firstName) return { ok: false, field: "firstName" };
  const lastName = cleanName(body.lastName);
  if (!lastName) return { ok: false, field: "lastName" };

  const email = typeof body.email === "string" ? cleanText(body.email).toLowerCase() : "";
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) return { ok: false, field: "email" };

  const website =
    typeof body.website === "string" && body.website.length <= WEBSITE_MAX
      ? normalizeWebsite(body.website)
      : null;
  if (!website) return { ok: false, field: "website" };

  const teamSize = body.teamSize;
  if (!isOneOf(TEAM_SIZES, teamSize)) return { ok: false, field: "teamSize" };
  const hasAccount = body.hasAccount;
  if (!isOneOf(HAS_ACCOUNT, hasAccount)) return { ok: false, field: "hasAccount" };

  let goal: Goal | undefined;
  if (!isBlank(body.goal)) {
    if (!isOneOf(GOALS, body.goal)) return { ok: false, field: "goal" };
    goal = body.goal;
  }

  let submissionId: string | undefined;
  if (!isBlank(body.submissionId)) {
    const candidate = typeof body.submissionId === "string" ? body.submissionId.trim().toLowerCase() : "";
    if (!SUBMISSION_ID_RE.test(candidate)) return { ok: false, field: "submissionId" };
    submissionId = candidate;
  }

  return {
    ok: true,
    value: {
      firstName,
      lastName,
      email,
      website,
      teamSize,
      hasAccount,
      ...(goal ? { goal } : {}),
      ...(submissionId ? { submissionId } : {}),
    },
  };
}

/** The route's success shape, checked before the form trusts a 2xx. */
export function isDemoRequestOk(value: unknown): value is { ok: true; delivered: DemoRequestDelivery[] } {
  if (typeof value !== "object" || value === null) return false;
  const body = value as { ok?: unknown; delivered?: unknown };
  return (
    body.ok === true &&
    Array.isArray(body.delivered) &&
    body.delivered.every((item) => item === "slack" || item === "airtable")
  );
}
