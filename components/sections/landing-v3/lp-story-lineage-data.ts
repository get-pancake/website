/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its words and its geometry.
 * Owner: story-lineage package (2026-10-28). Contract: lp-dive-stages.ts; markup
 * LpStoryLineage.tsx, motion lp-story-lineage-timeline.ts, look story-kit.css + story-lineage.css.
 *
 * The founder on this block (2026-10-28): "lineage c est pas que l origine c est aussi la
 * detection croisee de signaux interne externe": where a lead came from is also where the
 * customer's own signals and outside signals cross. On the section: "ban UI things from motions
 * and try to abstract things we re talking about being graphic simple and on brand (you can reuse
 * components)"; on a big claim over a value: "Still a huge text - no UI should not mean text it
 * should mean abstraction of what our infrastructure does". So the picture carries no claim and
 * no UI. It is drawn in the parts of the one picture he loves, the old sources story's end hub
 * (white discs with each provider's own mark, grey wires, the near-black dot,
 * flat brand dots, small names under the discs: story-kit.css), laid out as two sides joined
 * through the middle (Mobbin: Customer.io's data pipeline section,
 * 6e31f38b-b744-4dbf-9369-7e7e3205c19a, curved wires from sources on both sides meeting in the
 * centre). The END picture (the rest markup), stage px on the 752×489 box:
 *   - left, "Your data": the CRM (HubSpot's own mark on a white disc), site visits (a blue-30
 *     stop) and events (a yellow-30 stop), both stops at the loved blue and yellow dots' Ø28.18;
 *   - right, "Pancake data": TheirStack, Apify and Dealroom, each on a white disc with its own
 *     mark, three of the data providers the product uses
 *     (docs/public-assets/lp/story-sources/README.md);
 *   - the middle: five leads, grey dots (r 8, the wires' grey) in a column on the stage's centre
 *     line. Each source draws one wire into one lead. Four leads are reached from one side only
 *     and stay grey. The middle one is reached from both, by the CRM's wire and by Dealroom's
 *     (the provider behind funding rounds): its near-black dot (the loved hub dot, at r 12)
 *     covers the grey one and "Found by both" sits under it, what it is, never an invented
 *     person's name (founder 2026-10-28, on "Tamsin Okafor" there: "get rid of those fake
 *     people looks cheap af"). Its two wires make one S through the column's centre, the line
 *     that crosses;
 *   - the wires: the loved formula, one cubic with horizontal handles, c = 0.426667 × the
 *     straight distance between its ends (lp-story-sources-data.ts:89-93 at 630bb8e), written out
 *     here, never computed at render. Each starts on the source's edge that faces the leads (a
 *     left source's right edge, a right source's left edge), with no cap dot on it (founder
 *     2026-10-28, on the dots over the discs: "ca fait un peu vibe coded"), and ends at its
 *     lead's centre, under the lead's dot. No two wires cross.
 * Clearances, measured in the page's fonts (Chromium and Firefox, 2026-10-28): every disc, dot
 * and line of type is at least 47 px from the stage's edges (ink from x 96 to 667, y 47.5 to
 * 430.7); a wire passes no closer than 12.3 px to a label's ink (Dealroom's wire, to her name)
 * and 50 px to a lead it does not end on.
 *
 * Words: the two group labels, the six sources' names and her name, all in the kit's 12 px name
 * style and hidden on phones (story-kit.css .lp-sk-name): the picture reads without them. In
 * scripts/homepage-lint.mjs FILES, so every string here is linted: words live in fields named
 * `text` or `name` only, codes sit under keys the lint skips (id, tone, logo, d). No platform is
 * named. The marks are the vendors' own files, unmodified (public/lp/vendor-logos/hubspot.svg and
 * public/lp/story-sources/: their READMEs are under docs/public-assets/lp/).
 *
 * STORY_LINEAGE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Keep it in step with the picture.
 */

/** one wire, from its source's edge into one lead */
export type StoryLineageWire = {
  /** its key in the markup (data-wire) */
  id: string;
  /** the lead it draws into: an index in `leads` */
  to: number;
  /** its draw slot, T.draw[order] in lp-story-lineage-timeline.ts: your data's three first, then
      Pancake data's, the two into the found lead last of each */
  order: number;
  /** one cubic from the source's edge (where it draws from) to the lead's centre */
  d: string;
};

export type StoryLineageSource = {
  id: "crm" | "visits" | "events" | "theirstack" | "dealroom" | "apify";
  /** written under it on desktop */
  name: string;
  /** a white disc carrying the vendor's own mark (an unmodified file, drawn at half the disc) … */
  logo?: string;
  /** … or a flat brand stop: the token after `--lp-` (foundation.css) */
  tone?: "blue-30" | "yellow-30";
  /** centre and radius, stage px */
  x: number;
  y: number;
  r: number;
  wires: readonly StoryLineageWire[];
};

export type StoryLineageGroup = {
  id: "own" | "pancake";
  /** the group's label, over its column: the line box's centre x and top, stage px */
  text: string;
  x: number;
  y: number;
  /** top to bottom */
  sources: readonly StoryLineageSource[];
};

export type StoryLineageStory = {
  /** your data (left), then Pancake data (right) */
  groups: readonly [StoryLineageGroup, StoryLineageGroup];
  /** the leads, top to bottom: grey dots, centre and radius */
  leads: readonly { x: number; y: number; r: number }[];
  /** the lead reached from both sides: its index in `leads`, the radius of the near-black dot
      over its grey one, and her name, written under that dot */
  found: { lead: number; r: number; name: string };
};

export const STORY_LINEAGE: StoryLineageStory = {
  groups: [
    {
      id: "own",
      text: "Your data",
      x: 124,
      y: 44,
      sources: [
        {
          id: "crm", name: "CRM", logo: "/lp/vendor-logos/hubspot.svg",
          x: 124, y: 105, r: 28,
          wires: [
            { id: "crm", to: 2, order: 2, d: "M152 105C264.705 105 263.295 245 376 245" },
          ],
        },
        {
          id: "visits", name: "Site visits", tone: "blue-30",
          x: 124, y: 245, r: 14.09,
          wires: [
            { id: "visits", to: 3, order: 1, d: "M138.09 245C242.571 245 271.519 303 376 303" },
          ],
        },
        {
          id: "events", name: "Events", tone: "yellow-30",
          x: 124, y: 385, r: 14.09,
          wires: [
            { id: "events", to: 4, order: 0, d: "M138.09 385C240.114 385 273.976 361 376 361" },
          ],
        },
      ],
    },
    {
      id: "pancake",
      text: "Pancake data",
      x: 628,
      y: 44,
      sources: [
        {
          id: "theirstack", name: "TheirStack", logo: "/lp/story-sources/theirstack.svg",
          x: 628, y: 105, r: 28,
          wires: [
            { id: "theirstack", to: 0, order: 3, d: "M600 105C503.88 105 472.12 129 376 129" },
          ],
        },
        {
          id: "apify", name: "Apify", logo: "/lp/story-sources/apify.svg",
          x: 628, y: 245, r: 28,
          wires: [
            { id: "apify", to: 1, order: 4, d: "M600 245C501.275 245 474.725 187 376 187" },
          ],
        },
        {
          id: "dealroom", name: "Dealroom", logo: "/lp/story-sources/dealroom.svg",
          x: 628, y: 385, r: 28,
          wires: [
            { id: "dealroom", to: 2, order: 5, d: "M600 385C487.295 385 488.705 245 376 245" },
          ],
        },
      ],
    },
  ],
  leads: [
    { x: 376, y: 129, r: 8 },
    { x: 376, y: 187, r: 8 },
    { x: 376, y: 245, r: 8 },
    { x: 376, y: 303, r: 8 },
    { x: 376, y: 361, r: 8 },
  ],
  found: { lead: 2, r: 12, name: "Found by both" },
};

export const STORY_LINEAGE_ALT: string =
  "Animation: on one side, your data: your CRM, site visits and events. On the other, Pancake data: the providers TheirStack, Apify and Dealroom. Lines run to a column of leads, first from your data, then from Pancake data. One lead is reached from both sides, by your CRM and by Dealroom, and lights up: found by both.";
