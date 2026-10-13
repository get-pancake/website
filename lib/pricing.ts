import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * The self-serve offer in numbers: one plan, five levels of monthly credits
 * (pancake-cmo ADR 0078 as amended 2026-10-12, PR #1220). Every figure mirrors
 * `packages/backend/billing/src/domain/package-catalog.ts`, which is what
 * Stripe charges: change both together, never one.
 *
 * - Every level is the same product: whole team, every Play, one sending
 *   account. Only the monthly credits change.
 * - `key` is the app's tier id. The pricing card passes it to the app
 *   (`/signup?package=tier_2`, `apps/frontend/src/lib/selected-package.ts`),
 *   which opens onboarding on that level.
 * - `savePercent` is the app's own figure: the price per credit against the
 *   first level, rounded to one decimal.
 *
 * Credits are never shown as dollars (the app's rule, `credits/copy.ts`), and
 * never as a count of leads: a search costs what its research took.
 */
export const CREDIT_LEVELS = [
  { key: "tier_1", credits: 60_000, dollars: 99, savePercent: 0 },
  { key: "tier_2", credits: 120_000, dollars: 189, savePercent: 4.5 },
  { key: "tier_3", credits: 240_000, dollars: 359, savePercent: 9.3 },
  { key: "tier_4", credits: 480_000, dollars: 679, savePercent: 14.3 },
  { key: "tier_5", credits: 960_000, dollars: 1_299, savePercent: 18 },
] as const;

export type CreditLevel = (typeof CREDIT_LEVELS)[number];

/** The first level: the price every "from $99" line reads. */
export const BASE_LEVEL = CREDIT_LEVELS[0];
/** The largest self-serve level; above it, sales quotes. */
export const TOP_LEVEL = CREDIT_LEVELS[CREDIT_LEVELS.length - 1];

/** One work email found (`work_email` in the app's task catalogue). Nothing
 *  is charged when none is found. */
export const WORK_EMAIL_CREDITS = 50;
/** One sending account is in every level; each extra one is a monthly licence. */
export const EXTRA_SENDER_DOLLARS = 39;

/** "60,000": always en-US, so the server and the browser print the same. */
export const formatCredits = (credits: number) => credits.toLocaleString("en-US");
/** "60k": the picker's short label on narrow screens. */
export const shortCredits = (credits: number) => `${credits / 1_000}k`;
/** "$1,299" */
export const formatDollars = (dollars: number) => `$${dollars.toLocaleString("en-US")}`;

/** Where "Start free" goes once a level is chosen. The app's /signup keeps the
 *  choice and lands on its sign-in; a bare origin would drop the parameter on
 *  the app's own redirect. */
export const appHrefForLevel = (key: CreditLevel["key"]) => `${APP_ORIGIN}/signup?package=${key}`;
