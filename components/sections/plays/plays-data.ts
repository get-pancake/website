// components/sections/plays/plays-data.ts — the /plays gallery's examples, read from the /for
// registry. Server-only (lib/verticals must never reach a client bundle): imported by the /plays
// server sections and its JSON-LD builder.
//
// The examples are the approved /for prompts (demo.prompts, 3 per page, 120 for 40 pages),
// verbatim: they already pass validateVerticals() and verticals-budget, so this page adds no
// unreviewed example. Each one links to the /for page it comes from. Groups follow the app's
// signal order (vx-copy SIGNAL_GROUPS: the people signals, then the company signals); inside a
// group the examples alternate between hub categories, so the first rows show the range of
// markets rather than one category's pages in a row.

import { PLAYS_META } from "@/components/sections/plays/plays-copy";
import { SIGNAL_GROUPS, VX_HERO } from "@/components/sections/verticals/vx-copy";
import { approvedVerticals, verticalPath } from "@/lib/verticals";
import type { SignalKind, VerticalConfig } from "@/lib/verticals/types";

export type PlayExample = {
  /** Anchor id on /plays (the ItemList JSON-LD points at it): play-{slug}-{1..3}. */
  id: string;
  kind: SignalKind;
  /** The prompt, verbatim from the config. */
  text: string;
  /** The /for page it comes from. */
  href: string;
  /** "Pancake for {plural}", the /for H1 label and og:title. */
  forLabel: string;
};

export type PlayGroup = { kind: SignalKind; id: string; examples: PlayExample[] };

/** Anchor ids: the kind, hyphenated (/plays#own-brand). */
export const groupId = (kind: SignalKind) => kind.replace(/_/g, "-");

/** Round-robin over buckets, in first-seen order (= hub category order, since the input is). */
function interleave<T>(items: readonly T[], key: (t: T) => string): T[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    const b = buckets.get(k);
    if (b) b.push(it);
    else buckets.set(k, [it]);
  }
  const lists = Array.from(buckets.values());
  const out: T[] = [];
  for (let i = 0; out.length < items.length; i++) {
    for (const l of lists) if (i < l.length) out.push(l[i]);
  }
  return out;
}

/** The approved pages behind the gallery (hub order). */
export function playsSources(): VerticalConfig[] {
  return approvedVerticals();
}

/** Meta description = WebPage description, with the live counts ("120 example Plays for 40 kinds of B2B business"). */
export function playsDescription(): string {
  const sources = playsSources();
  const examples = sources.reduce((n, v) => n + v.demo.prompts.length, 0);
  return PLAYS_META.description(examples, sources.length);
}

/** Every example, one group per signal kind (empty groups dropped). */
export function playGroups(): PlayGroup[] {
  const rows = playsSources().flatMap((v) =>
    v.demo.prompts.map((p, i) => ({
      category: v.category,
      ex: {
        id: `play-${v.slug}-${i + 1}`,
        kind: p.kind,
        text: p.text,
        href: verticalPath(v),
        forLabel: VX_HERO.label(v),
      } satisfies PlayExample,
    })),
  );
  return SIGNAL_GROUPS.flatMap((g) => g.kinds)
    .map((kind) => ({
      kind,
      id: groupId(kind),
      examples: interleave(
        rows.filter((r) => r.ex.kind === kind),
        (r) => r.category,
      ).map((r) => r.ex),
    }))
    .filter((g) => g.examples.length > 0);
}
