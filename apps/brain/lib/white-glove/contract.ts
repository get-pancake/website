/**
 * The White Glove "Book a demo" form on brain.pancake.ai/white-glove: the
 * browser half of a contract the main website enforces. The form posts to
 * the website's routes (get-pancake/website: app/api/white-glove/demo and
 * /booked, rules in lib/white-glove-demo.ts), cross-origin: that repo's
 * lib/white-glove-cors.ts lets this app's origins in. The routes validate
 * every answer again and decide who books François's calendar, who waits
 * for his review and who is sent to self-serve, so this file only has to
 * offer the same choices. Keep the lists below identical to the website's.
 * countries.ts and personal-email.ts are copies of the website's lists.
 */

import type { Country } from "./countries";

/** Company headcount, the website's WG_SIZES. */
export const WG_SIZES = ["1–2", "3–10", "11–50", "51–200", "201+"] as const;
export type WgSize = (typeof WG_SIZES)[number];

export const WG_GTM_TEAM = ["yes", "no"] as const;
export type WgGtmTeam = (typeof WG_GTM_TEAM)[number];

/**
 * Does the monthly price work? The website's WG_BUDGET (/demo's three budget
 * answers): "no" goes to self-serve, "approval" to François's review, and
 * only "yes" can reach the calendar.
 */
export const WG_BUDGET = ["yes", "approval", "no"] as const;
export type WgBudget = (typeof WG_BUDGET)[number];

export type WgAnswers = {
  email: string;
  size: WgSize;
  country: Country;
  gtmTeam: WgGtmTeam;
  budget: WgBudget;
};

export type WgField = "email" | "size" | "country" | "gtmTeam" | "budget" | "submissionId";

/** The website's answer to POST /api/white-glove/demo. */
export type WgResponse =
  | { ok: true; route: "book"; booking: string | null }
  | { ok: true; route: "review" | "self_serve" }
  | { ok: false; error: string; field?: WgField; reason?: "personal_email" };

/** The form's anchor: the nav's "Book a demo" lands here. */
export const WG_BOOK_ANCHOR = "book-demo";
/** Never a real field: bots fill it, humans never see it (the website's WG_HONEYPOT). */
export const WG_HONEYPOT = "nickname";
export const WG_EMAIL_MAX = 200;

/**
 * Where the form posts: the main website, whose routes own the CRM writes
 * and the review queue. NEXT_PUBLIC_WG_API_ORIGIN points a local run at a
 * local website (http://localhost:3027). Never getpancake.ai: its redirect
 * would break the cross-origin request.
 */
export const WG_API_ORIGIN = (process.env.NEXT_PUBLIC_WG_API_ORIGIN?.trim() || "https://pancake.ai").replace(/\/+$/, "");

/**
 * The answers on one plain line, for the calendar's prep question (the host
 * reads it before the call). The website's wgContextLine, with this page's
 * name, so François sees which page booked. Pure.
 */
export function wgContextLine(a: WgAnswers): string {
  const budget = a.budget === "yes" ? "Yes" : a.budget === "approval" ? "Needs internal approval" : "No";
  return [
    "Booked from brain.pancake.ai/white-glove.",
    `Company size: ${a.size}.`,
    `Country: ${a.country}.`,
    `GTM team in place: ${a.gtmTeam === "yes" ? "Yes" : "No"}.`,
    `$3,000 a month works: ${budget}.`,
  ].join(" ");
}
