// components/sections/compare/compare-copy.ts — the fixed copy of /compare and of the hub links
// on the comparison pages (2026-10-07). Landing voice: labels <= 3 words, headlines one claim.
// The cards' lines are not here: each card reads its page's own lede (compare-data.ts).

/** The hub head: the /for hub's head pattern (eyebrow, H1 at H2 scale, lede in the right column). */
export const COMPARE_HUB = {
  eyebrow: "Comparisons",
  h1: "Pancake compared.",
  // Every comparison page ends its verdict on a "Best fit" card for the other product, and its
  // Sources line links the vendor's own pages: the lede says exactly that, no more.
  lede: "Honest comparisons, read from each product’s public pages. Each one says when the other tool fits better.",
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
  moreAll: "see all comparisons",
};

export const COMPARE_META = {
  /** <= 60 characters, brand in front (the comparison pages carry none, the hub names every product). */
  title: "Pancake Compared: Origami, Unify, Octave, Alta and More",
  ogTitle: "Pancake compared",
  description:
    "Pancake compared with Origami, Unify, Octave, Alta, Lemlist, Gojiberry, Viktor, Claude Tag, OpenClaw and Paperclip, read from each product’s public pages.",
  /** = the comparison pages' BreadcrumbList (Pancake > Comparisons > X vs Pancake). */
  crumbs: { home: "Pancake", page: "Comparisons" },
};
