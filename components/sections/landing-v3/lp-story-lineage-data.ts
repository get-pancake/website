/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its words and its geometry.
 * Owner: story-lineage package (2026-10-28). Contract: lp-dive-stages.ts; markup
 * LpStoryLineage.tsx, motion lp-story-lineage-timeline.ts, look story-kit.css + story-lineage.css.
 *
 * The founder on this block (2026-10-28): "lineage c est pas que l origine c est aussi la
 * detection croisee de signaux interne externe": where a lead came from is also where the
 * customer's own signals and outside signals cross; on 2026-10-30, "goal of this part is to show
 * we mix internal with external signals", so the two columns say so ("Pancake data je sais pas si
 * j aime ou si c est le bon mot": "Your data" and "Pancake data" became "Internal signals" and
 * "External signals"). On the section: "ban UI things from motions and try to abstract things we
 * re talking about being graphic simple and on brand (you can reuse components)"; on a big claim
 * over a value: "Still a huge text - no UI should not mean text it should mean abstraction of what
 * our infrastructure does". So the picture carries no claim and no UI. It is drawn in the parts
 * of the one picture he loves, the old sources story's end hub (white discs with each provider's
 * own mark, grey wires, the near-black dot, small names under the discs: story-kit.css), laid out
 * as two sides joined through the middle (Mobbin: Customer.io's data pipeline section,
 * 6e31f38b-b744-4dbf-9369-7e7e3205c19a, curved wires from sources on both sides meeting in the
 * centre). The END picture (the rest markup), stage px on the 752×489 box:
 *   - left, "Internal signals": the customer's own tools, three white discs (r 28) with their
 *     vendors' marks: the CRM (HubSpot), site visits (Google Analytics) and events (Luma), one
 *     family with the right side's (founder 2026-10-30: "Mettre un bon logo sur site visits et sur
 *     event maybe (Luma par ex)", "site visits is like GA4 no maybe"; until then site visits and
 *     events were the loved blue and yellow dots, Ø28.18). The kit draws a mark at half its disc;
 *     Google Analytics' file pads its icon in its 192 box and draws at 54%, Luma's black sparkle
 *     fills its box and outweighs the orange sprocket at the same extent, so it draws at 46%
 *     (story-lineage.css, weighed against HubSpot's at 50%);
 *   - right, "External signals": TheirStack, Apify and Dealroom, each on a white disc with its own
 *     mark, three of the data providers the product uses
 *     (docs/public-assets/lp/story-sources/README.md);
 *   - the middle: five leads, grey dots (r 8, the wires' grey) in a column on the stage's centre
 *     line. Each source draws one wire into one lead. Four leads are reached from one side only
 *     and stay grey. The middle one is reached from both, by the CRM's wire and by Dealroom's
 *     (the provider behind funding rounds): its near-black dot (the loved hub dot, at r 12)
 *     covers the grey one and its role at a real startup sits under it, "Founder @ Mastra",
 *     never an invented person's name (founder 2026-10-28, on "Tamsin Okafor" there: "get rid
 *     of those fake people looks cheap af", then roles at real companies; Mastra is the page's
 *     one lead: lp-step-data.ts S1_LEADS). Its two wires make
 *     one S through the column's centre, the line that crosses, and since 2026-10-30 that S is
 *     the hub's near-black (.lp-slin-lineage, story-lineage.css): her lineage, the one change
 *     "the match" made to this picture (the motion: lp-story-lineage-timeline.ts; the founder,
 *     that evening: "j aime bien le noir plus intense entre ledealroom et crm"). The four other
 *     wires stay grey;
 *   - the wires: the loved formula, one cubic with horizontal handles, c = 0.426667 × the
 *     straight distance between its ends (lp-story-sources-data.ts:89-93 at 630bb8e), written out
 *     here, never computed at render. Each starts on the source's edge that faces the leads (a
 *     left disc's right edge, x 152; a right disc's left edge, x 600), with no cap dot on it
 *     (founder 2026-10-28, on the dots over the discs: "ca fait un peu vibe coded"), and ends at
 *     its lead's centre, under the lead's dot. No two wires cross. The CRM's and Dealroom's are
 *     one cubic turned half a turn about her lead (equal lengths, 275.6).
 * Clearances (2026-10-28, re-measured 2026-10-30 with the discs and the new labels, Chromium):
 * every disc, dot and line of type is at least 47 px from the stage's edges (ink from x 81 to
 * 673, the two group labels, and y 47.5 to 430.7); a wire passes no closer than 12.3 px to a
 * label's ink (Dealroom's wire, to her name) and 58 px to a lead it does not end on.
 *
 * Words: the two group labels, the six sources' names and her name, all in the kit's 12 px name
 * style and hidden on phones (story-kit.css .lp-sk-name): the picture reads without them. In
 * scripts/homepage-lint.mjs FILES, so every string here is linted: words live in fields named
 * `text` or `name` only, codes sit under keys the lint skips (id, logo, d). No platform is
 * named. The marks are the vendors' own files, unmodified (public/lp/vendor-logos/: hubspot.svg,
 * google-analytics.svg, luma.svg; public/lp/story-sources/: their READMEs are under
 * docs/public-assets/lp/).
 *
 * STORY_LINEAGE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label). Keep it in step with the picture.
 */

/** one wire, from its source's edge into one lead */
export type StoryLineageWire = {
  /** its key in the markup (data-wire) */
  id: string;
  /** the lead it draws into: an index in `leads` (data-to). A wire into `found.lead` is part of
      her lineage (.lp-slin-lineage): near-black at rest, turned near-black at the match */
  to: number;
  /** its draw slot, T.draw[order] in lp-story-lineage-timeline.ts: the internal three first,
      then the external three, the two into the found lead last of each */
  order: number;
  /** one cubic from the source's edge (where it draws from) to the lead's centre */
  d: string;
};

export type StoryLineageSource = {
  id: "crm" | "visits" | "events" | "theirstack" | "dealroom" | "apify";
  /** written under it on desktop */
  name: string;
  /** a white disc carrying the vendor's own mark (an unmodified file, drawn at half the disc, or
      at its own share where the file needs it: story-lineage.css) */
  logo: string;
  /** centre and radius, stage px */
  x: number;
  y: number;
  r: number;
  wires: readonly StoryLineageWire[];
};

export type StoryLineageGroup = {
  id: "internal" | "external";
  /** the group's label, over its column: the line box's centre x and top, stage px */
  text: string;
  x: number;
  y: number;
  /** top to bottom */
  sources: readonly StoryLineageSource[];
};

export type StoryLineageStory = {
  /** internal signals (left), then external signals (right) */
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
      id: "internal",
      text: "Internal signals",
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
          id: "visits", name: "Site visits", logo: "/lp/vendor-logos/google-analytics.svg",
          x: 124, y: 245, r: 28,
          wires: [
            { id: "visits", to: 3, order: 1, d: "M152 245C250.725 245 277.275 303 376 303" },
          ],
        },
        {
          id: "events", name: "Events", logo: "/lp/vendor-logos/luma.svg",
          x: 124, y: 385, r: 28,
          wires: [
            { id: "events", to: 4, order: 0, d: "M152 385C248.12 385 279.88 361 376 361" },
          ],
        },
      ],
    },
    {
      id: "external",
      text: "External signals",
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
  found: { lead: 2, r: 12, name: "Founder @ Mastra" },
};

export const STORY_LINEAGE_ALT: string =
  "Animation: on one side, internal signals: your CRM, your site visits and your events. On the other, external signals from the providers TheirStack, Apify and Dealroom. Lines run to a column of leads, first from the internal signals, then from the external ones. One lead is reached from both sides, by your CRM and by Dealroom, and lights up with the two lines that found it: the founder of Mastra.";
