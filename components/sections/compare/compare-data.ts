// components/sections/compare/compare-data.ts — every comparison page, in one list.
//
// 2026-10-07 (founder: "inspire-toi de la compet pour rendre accessible les pages que t'as
// créées"): the comparison pages were linked from nowhere but the sitemap and llms.txt. Unify,
// Origami, Octave and Alta all link theirs from a hub and from each other, so Pancake does too.
// This reverses the 2026-09-03 call to keep the comparison pages out of sight.
//
// Read by the /compare hub (cards + ItemList JSON-LD) and by GtmComparisonPage ("More
// comparisons" siblings and the "See all comparisons" link back to the hub).
//
// `line` is the page's own heroLede, verbatim: the hub never writes copy for a page, as the /for
// hub reads each vertical's own hubLine. GtmComparisonPage checks the pair at build time, so a
// new comparison page missing here, or a lede edited on its page and not here, fails the build
// with the fix in the message.

export const COMPARE_PATH = "/compare";

/** Hub group order. Labels stay <= 3 words (landing voice). */
export const COMPARE_GROUPS = ["GTM tools", "AI agents"] as const;
export type CompareGroup = (typeof COMPARE_GROUPS)[number];

export type CompareEntry = {
  /** The page's route segment = its GtmComparisonConfig.slug. */
  slug: string;
  /** = GtmComparisonConfig.competitor. The card and every link read "{competitor} vs Pancake", the page's H1. */
  competitor: string;
  group: CompareGroup;
  /** = GtmComparisonConfig.heroLede, verbatim. */
  line: string;
};

/** Page order within each group. */
export const COMPARISONS: readonly CompareEntry[] = [
  // the GTM products buyers weigh Pancake against (audit plan 3.10)
  { slug: "origami-vs-pancake", competitor: "Origami", group: "GTM tools", line: "Plays billed in credits versus Plays at one price." },
  { slug: "unify-vs-pancake", competitor: "Unify", group: "GTM tools", line: "A sales platform priced per seat versus one plan per workspace." },
  { slug: "octave-vs-pancake", competitor: "Octave", group: "GTM tools", line: "A context layer for your GTM stack versus Plays that reach people." },
  { slug: "alta-vs-pancake", competitor: "Alta", group: "GTM tools", line: "Named AI agents for revenue teams versus Plays a founder runs." },
  { slug: "lemlist-vs-pancake", competitor: "Lemlist", group: "GTM tools", line: "A sales platform your team operates versus Plays that run for you." },
  { slug: "gojiberry-vs-pancake", competitor: "Gojiberry", group: "GTM tools", line: "A focused outreach agent versus a full GTM platform." },
  // general agents and agent runtimes
  { slug: "claude-tag-vs-pancake", competitor: "Claude Tag", group: "AI agents", line: "A shared AI teammate versus a GTM platform that finds your buyers." },
  { slug: "viktor-vs-pancake", competitor: "Viktor", group: "AI agents", line: "A general AI employee versus a GTM platform built to bring you customers." },
  { slug: "openclaw-vs-pancake", competitor: "OpenClaw", group: "AI agents", line: "An agent runtime you assemble versus Plays that run for you." },
  { slug: "pancake-vs-paperclips", competitor: "Paperclip", group: "AI agents", line: "An AI company control plane versus a managed GTM platform." },
];

/**
 * The blog's "<tool> alternatives" guides for GTM tools, alphabetical by tool. The hub reads each
 * post's own title (lib/posts) and skips a slug whose post is gone, so a removed post never leaves
 * a dead link. The agent-side guides (viktor-alternatives, cofounder-co-alternatives, OpenClaw
 * hosting) stay off this list: the hub's list is the GTM one.
 */
export const GTM_ALTERNATIVES_POSTS = [
  "aisdr-alternatives",
  "alta-alternatives",
  "amplemarket-alternatives",
  "artisan-alternatives",
  "dripify-alternatives",
  "gojiberry-alternatives",
  "lemlist-alternatives",
  "origami-alternatives",
  "trigify-alternatives",
  "valley-alternatives",
] as const;

export const comparePath = (c: CompareEntry) => `/${c.slug}`;
export const compareName = (c: CompareEntry) => `${c.competitor} vs Pancake`;
export const compareEntry = (slug: string) => COMPARISONS.find((c) => c.slug === slug);

/** The hub's groups, in COMPARE_GROUPS order; an empty group is dropped. */
export function compareGroups(): { group: CompareGroup; items: CompareEntry[] }[] {
  return COMPARE_GROUPS.map((group) => ({ group, items: COMPARISONS.filter((c) => c.group === group) })).filter(
    (g) => g.items.length > 0,
  );
}

/** The other pages of a page's group, in hub order. */
export function compareSiblings(slug: string): CompareEntry[] {
  const self = compareEntry(slug);
  if (!self) return [];
  return COMPARISONS.filter((c) => c.group === self.group && c.slug !== slug);
}
