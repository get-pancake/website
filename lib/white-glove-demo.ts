/**
 * The /white-glove "Book a demo" form, shared by the browser (WgBookDemo.tsx)
 * and the API routes (app/api/white-glove/*). Browser-safe on purpose: no
 * `server-only`, no node imports. Flow and reasons: docs/white-glove-demo.md.
 *
 * The form is the White Glove campaign's ask (2026-11-05): a work email and
 * three questions (company size, country, GTM team in place), then the
 * calendar. François's rule still holds (Tristan, 2026-11-05: a meeting only
 * when there is a fit): only a clear White Glove fit books
 * straight onto his calendar. Everyone else either goes to his /demo review
 * queue, where he decides, or to self-serve, with no meeting at all.
 *
 *   personal email          → refused in the form (lib/personal-email.ts)
 *   company of 1–2          → self_serve: no meeting, no CRM write
 *   outside WG_INSTANT_MARKETS, or 3–10 with no GTM team
 *                           → review: François's queue (/demo/review)
 *   everyone else           → book: the White Glove calendar, at once
 */

import { COUNTRIES, type Country } from "@/lib/countries";
import { isPersonalEmail } from "@/lib/personal-email";
import { PANCAKE_DOMAINS } from "@/lib/site-config.mjs";

/** Company headcount. Wider than /demo's first bucket on purpose: solo and duo teams are the cut. */
export const WG_SIZES = ["1–2", "3–10", "11–50", "51–200", "201+"] as const;
export type WgSize = (typeof WG_SIZES)[number];

export const WG_GTM_TEAM = ["yes", "no"] as const;
export type WgGtmTeam = (typeof WG_GTM_TEAM)[number];

/**
 * Where a qualified request books at once: the markets White Glove sells to
 * today (North America, the UK and Ireland, Western and Northern Europe,
 * Israel, Australia and New Zealand, Singapore). Any other country is not
 * refused: it goes to François's review queue. Edit this list to move a
 * market; the tests read it.
 */
export const WG_INSTANT_MARKETS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "France",
  "Germany",
  "Netherlands",
  "Belgium",
  "Luxembourg",
  "Switzerland",
  "Austria",
  "Spain",
  "Portugal",
  "Italy",
  "Denmark",
  "Sweden",
  "Norway",
  "Finland",
  "Iceland",
  "Israel",
  "Australia",
  "New Zealand",
  "Singapore",
] as const satisfies readonly Country[];

export type WgAnswers = {
  email: string;
  size: WgSize;
  country: Country;
  gtmTeam: WgGtmTeam;
};

export type WgRoute = "book" | "review" | "self_serve";

export const WG_FIELDS = ["email", "size", "country", "gtmTeam", "submissionId"] as const;
export type WgField = (typeof WG_FIELDS)[number];

export type WgParse =
  | { ok: true; value: WgAnswers; submissionId: string }
  | { ok: false; field: WgField; reason?: "personal_email" };

/** The browser's answer to POST /api/white-glove/demo. */
export type WgResponse =
  | { ok: true; route: "book"; booking: string | null }
  | { ok: true; route: "review" | "self_serve" }
  | { ok: false; error: string; field?: WgField; reason?: "personal_email" };

/** The page every answer and CRM note points back to. */
export const WG_PAGE_URL = "https://pancake.ai/white-glove";
/** The form's anchor: the page's other "Book a demo" buttons scroll here. */
export const WG_BOOK_ANCHOR = "book-demo";
/** Never a real field: bots fill it, humans never see it (= /demo's). */
export const WG_HONEYPOT = "nickname";
export const WG_EMAIL_MAX = 200;
/** bytes; a real body is ~250 */
export const WG_BODY_MAX = 4096;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isOneOf<const T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

/** Validate an untrusted body. The first failing field is returned, in form order. Pure. */
export function parseWgRequest(input: unknown): WgParse {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, field: "email" };
  const body = input as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > WG_EMAIL_MAX || !EMAIL_RE.test(email)) return { ok: false, field: "email" };
  if (isPersonalEmail(email)) return { ok: false, field: "email", reason: "personal_email" };
  if (!isOneOf(WG_SIZES, body.size)) return { ok: false, field: "size" };
  if (!isOneOf(COUNTRIES, body.country)) return { ok: false, field: "country" };
  if (!isOneOf(WG_GTM_TEAM, body.gtmTeam)) return { ok: false, field: "gtmTeam" };
  if (typeof body.submissionId !== "string" || !UUID_RE.test(body.submissionId)) {
    return { ok: false, field: "submissionId" };
  }
  return {
    ok: true,
    value: { email, size: body.size, country: body.country, gtmTeam: body.gtmTeam },
    submissionId: body.submissionId.toLowerCase(),
  };
}

/** Where a valid request goes (the table at the top of this file). Pure. */
export function wgRoute(a: WgAnswers): WgRoute {
  if (a.size === "1–2") return "self_serve";
  if (!isOneOf(WG_INSTANT_MARKETS, a.country)) return "review";
  if (a.size === "3–10" && a.gtmTeam === "no") return "review";
  return "book";
}

/** Why a request waits for François, for his queue and the CRM note. Pure. */
export function wgReviewReason(a: WgAnswers): string {
  if (!isOneOf(WG_INSTANT_MARKETS, a.country)) return `Country outside the instant-booking markets (${a.country})`;
  return "Company of 3–10 with no GTM team yet";
}

/** "acme.com" from "jane@acme.com". Pure. */
export function wgEmailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase();
}

/**
 * True for a team address (pancake.ai, getpancake.ai): a test. The routes
 * answer it as usual but write nothing to the review queue or the CRM. Pure.
 */
export function isTeamEmail(email: string): boolean {
  const domain = wgEmailDomain(email);
  return PANCAKE_DOMAINS.some((own) => domain === own || domain.endsWith(`.${own}`));
}

/**
 * The answers on one plain line, for the calendar's prep question (the host
 * reads it before the call) and the CRM notes. Pure.
 */
export function wgContextLine(a: WgAnswers): string {
  return [
    "Booked from pancake.ai/white-glove.",
    `Company size: ${a.size}.`,
    `Country: ${a.country}.`,
    `GTM team in place: ${a.gtmTeam === "yes" ? "Yes" : "No"}.`,
  ].join(" ");
}
