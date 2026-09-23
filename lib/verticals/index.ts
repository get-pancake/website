// lib/verticals/index.ts — the /for registry. Server-only: imported by app/for/**,
// the Vx* server sections, LpNav (Industries menu) and app/sitemap.ts. Never import
// it from a "use client" module (the demo island gets its slice through props).
//
// The config list itself is GENERATED (lib/verticals/data/index.ts, by
// scripts/verticals-registry.mjs). validateVerticals() runs once at module load:
//   - production builds (`next build`, Vercel): any error THROWS → the build fails;
//   - dev: errors and warnings are logged, pages keep rendering (configs are
//     written by several people at once; one half-written file must not take
//     every page down).

import { SIGNAL_GROUPS } from "@/components/sections/verticals/vx-copy";
import { ALL_VERTICALS } from "@/lib/verticals/data";
import type { FaqItem, VerticalCategory, VerticalConfig } from "@/lib/verticals/types";
import { assertVerticals, validateVerticals } from "@/lib/verticals/validate";
import { VX_FAQ } from "@/components/sections/verticals/vx-copy";

export const SITE_URL = "https://getpancake.ai";

/** Hub / nav group order (= the VerticalCategory union order in types.ts). */
export const CATEGORY_ORDER: VerticalCategory[] = [
  "Sales, GTM & recruiting",
  "Marketing & creative agencies",
  "Tech & build agencies",
  "Consultants & advisors",
  "IT, cloud & security",
  "Startups & solo founders",
  "Vertical software",
  "Energy & industry",
];

/** Within a category: real customers first, then trials, founder picks, SEO bets; then A→Z. */
const EVIDENCE_RANK: Record<VerticalConfig["evidence"], number> = { paying: 0, trials: 1, founder: 2, "seo-bet": 3 };

function byHubOrder(a: VerticalConfig, b: VerticalConfig): number {
  return (
    CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
    EVIDENCE_RANK[a.evidence] - EVIDENCE_RANK[b.evidence] ||
    a.name.title.localeCompare(b.name.title, "en")
  );
}

/** Every config (drafts included), in hub order. */
export const VERTICALS: readonly VerticalConfig[] = [...ALL_VERTICALS].sort(byHubOrder);
export const VERTICAL_SLUGS: readonly string[] = VERTICALS.map((v) => v.slug);

/* ── validation at module load ─────────────────────────────────────────────── */

declare global {
  // eslint-disable-next-line no-var
  var __vxValidatedKey: string | undefined;
}
if (process.env.NODE_ENV === "production") {
  assertVerticals([...VERTICALS]);
} else {
  // Log once per registry content (HMR re-evaluates this module on every save).
  const key = VERTICAL_SLUGS.join(",") + ":" + JSON.stringify(VERTICALS).length;
  if (globalThis.__vxValidatedKey !== key) {
    globalThis.__vxValidatedKey = key;
    try {
      const issues = validateVerticals([...VERTICALS]);
      const errors = issues.filter((i) => i.level === "error");
      const warns = issues.filter((i) => i.level === "warn");
      for (const w of warns) console.warn(`[verticals] warn ${w.slug}: ${w.msg}`);
      if (errors.length) {
        console.error(
          `[verticals] ${errors.length} error(s) — a production build would FAIL:\n` +
            errors.map((e) => `  ${e.slug}: ${e.msg}`).join("\n"),
        );
      }
    } catch (e) {
      console.error("[verticals] validateVerticals crashed on a malformed config:", e);
    }
  }
}

/* ── lookups ───────────────────────────────────────────────────────────────── */

const BY_SLUG = new Map(VERTICALS.map((v) => [v.slug, v]));

export function getVertical(slug: string): VerticalConfig | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Drafts are visible (hub, related rows) outside Vercel production — local dev,
 * local builds and preview deploys — so the founder can review them. Production
 * shows approved pages only. robots/sitemap never depend on this (§8).
 */
export const SHOW_DRAFTS = process.env.VERCEL_ENV !== "production";

export const isApproved = (v: VerticalConfig) => v.status === "approved";
export const isListed = (v: VerticalConfig) => isApproved(v) || SHOW_DRAFTS;

export const verticalUrl = (v: VerticalConfig | string) =>
  `${SITE_URL}/for/${typeof v === "string" ? v : v.slug}`;
export const verticalPath = (v: VerticalConfig | string) => `/for/${typeof v === "string" ? v : v.slug}`;

/** Approved pages, hub order — sitemap, hub ItemList, nav. */
export function approvedVerticals(): VerticalConfig[] {
  return VERTICALS.filter(isApproved);
}

export type VerticalGroup = { category: VerticalCategory; items: VerticalConfig[] };

/** Hub groups: every category with ≥1 listed page, in CATEGORY_ORDER. */
export function hubGroups(): VerticalGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: VERTICALS.filter((v) => v.category === category && isListed(v)),
  })).filter((g) => g.items.length > 0);
}

/** Nav "Industries" menu: approved pages only (the nav ships on production pages). */
export function navGroups(): VerticalGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: VERTICALS.filter((v) => v.category === category && isApproved(v)),
  })).filter((g) => g.items.length > 0);
}

/**
 * §2.8 sibling resolution: v.related → drop missing; an approved page links to
 * approved siblings only; fewer than 3 left → backfill with approved pages of
 * the same category, then any approved page, in hub order. Drafts link to any
 * existing sibling (they are noindex review pages). Max 5.
 */
export function relatedFor(v: VerticalConfig): VerticalConfig[] {
  const ok = (x: VerticalConfig | undefined): x is VerticalConfig =>
    !!x && x.slug !== v.slug && (v.status !== "approved" || isApproved(x));
  const picked: VerticalConfig[] = [];
  const add = (x: VerticalConfig | undefined) => {
    if (ok(x) && !picked.some((p) => p.slug === x.slug) && picked.length < 5) picked.push(x);
  };
  v.related.forEach((slug) => add(getVertical(slug)));
  if (picked.length < 3) VERTICALS.filter((x) => x.category === v.category && isApproved(x)).forEach((x) => picked.length < 3 && add(x));
  if (picked.length < 3) VERTICALS.filter(isApproved).forEach((x) => picked.length < 3 && add(x));
  return picked;
}

/** §2.7: the vertical Q/As, then the 5 shared ones. The same array feeds FAQPage JSON-LD. */
export function faqItems(v: VerticalConfig): FaqItem[] {
  return [...v.faq, ...VX_FAQ.shared];
}

/** The 6 signal kinds in app order (for anyone that needs the canonical list). */
export const SIGNAL_KINDS = SIGNAL_GROUPS.flatMap((g) => g.kinds);
