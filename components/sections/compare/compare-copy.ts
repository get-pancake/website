// components/sections/compare/compare-copy.ts — the fixed copy of /compare and of the hub links
// on the comparison pages (2026-10-07). Landing voice: labels <= 3 words, headlines one claim.
// The cards' lines are not here: each card reads its page's own lede (compare-data.ts).

/** The hub head: the /for hub's head pattern (eyebrow, H1 at H2 scale, lede in the right column). */
export const COMPARE_HUB = {
  eyebrow: "Comparisons",
  h1: "Pancake compared.",
  // 2026-11-17: the pages argue for Pancake and no longer end on a "Best fit" card for the other
  // product (GtmComparisonPage.tsx); each Sources line still links the vendor's own pages.
  lede: "Pancake next to the GTM tools founders weigh it against. Every fact comes from each product’s public pages.",
};

/** The blog's GTM "<tool> alternatives" guides, as Related-style rows (name + line from the post's own title). */
export const COMPARE_ALTERNATIVES = {
  eyebrow: "Alternatives",
  h2: "Alternatives, tool by tool.",
  // Each guide states it: "Every price and feature below comes from the vendor's own site".
  lede: "Each guide sets one tool beside its rivals, with prices from each vendor’s own site.",
};

/** The hub links on every comparison page (GtmComparisonPage). */
export const COMPARE_LINKS = {
  /** Under the closing CTA pair. The arrow is drawn aria-hidden, so the link reads its words only. */
  seeAll: "See all comparisons",
  /** The line under "Keep reading": the page's group siblings, then the hub. */
  more: "More comparisons:",
  /** The same line on a GTM tool's page (2026-11-17): its siblings are the other GTM tools buyers
   *  weigh Pancake against, so the line says what people search for, "<tool> competitors". */
  moreCompetitors: "More competitors compared:",
  moreAll: "see all comparisons",
};

/**
 * The words people search for when they look for another tool, "Clay alternative" (2026-11-17).
 * Since the evening of 2026-11-17 they are the badge that opens a GTM tool page's H1, as
 * /claude-for-sales opens on "Claude for sales" (they were an eyebrow over the H1 that morning).
 * Two words with the tool's name (landing voice: labels <= 3 words). The title, the breadcrumb and
 * the canonical keep "X vs Pancake".
 */
export const COMPARE_HERO = {
  eyebrow: (competitor: string) => `${competitor} alternative`,
};

/** The two sections every comparison page adds after the film (2026-11-17): why teams switch
 *  (the differences Pancake wins) and how it works (/claude-for-sales's three steps). */
export const COMPARE_SWITCH = {
  eyebrow: "Why switch",
  h2: (competitor: string) => `Why teams pick Pancake over ${competitor}`,
  /** An AI agent's page (Claude Tag, Viktor, OpenClaw, Paperclip): what a founder runs Pancake
   *  from, not a competitor (compare-data.ts), so its head names no rival. */
  h2Agent: "Why founders run GTM on Pancake",
  stepsEyebrow: "How it works",
};

export const COMPARE_META = {
  /** <= 60 characters, brand in front (the comparison pages carry none, the hub names every product). */
  // 2026-11-16 (SEO audit): names the most-searched tools (it named Origami, Unify, Octave and
  // Alta).
  title: "Pancake Compared: Clay, Apollo, ZoomInfo and More GTM Tools",
  ogTitle: "Pancake compared",
  // 2026-11-10: thirteen pages, too many to name in one line: six of them, then "and more".
  description:
    "Pancake compared with Clay, Apollo, ZoomInfo, Lemlist, Unify, Origami and more GTM tools, read from each product’s public pages.",
  /** = the comparison pages' BreadcrumbList (Pancake > Comparisons > X vs Pancake). */
  crumbs: { home: "Pancake", page: "Comparisons" },
};
