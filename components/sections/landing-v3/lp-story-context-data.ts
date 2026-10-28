/**
 * Deep-dive story "context" — block 1 of the four (founder 2026-10-28: "Pour les 4 blocs je ferai
 * donc 1/ Next best action + Unified GTM context 2/ Buying signal + enrichment 3/ Lead lineage
 * 4/ mcp first"), its copy and its geometry. Drawn in the one picture he loves (the old sources
 * story's end hub: grey wires into one near-black dot, "WHY THEY FIT" over "Just raised") with
 * no UI ("ban UI things from motions and try to abstract things … graphic simple and on brand
 * (you can reuse components)"). Build spec: the dive panel's final spec, §3.0 and §3.1.
 *
 * The picture, in words: the claim on the left (the kit's spaced-caps kicker over a value in the
 * display face), and beside it three parts of the workspace's Brain around one plum centre, each
 * with a straight spoke into it; one wire leaves the centre and lands on a near-black dot at the
 * end of the kicker. Three labelled points, one centre, one line, one answer: not a clone of
 * the steps' 42-edge Brain graph, and nothing that reads as an app (no row, panel, cursor or
 * button).
 *
 * Where each part comes from:
 *   - the claim: the story kit (story-kit.css .lp-sk-k / .lp-sk-v). "Next best Play" is the
 *     founder's "Next best action" in the product's word; the value is a real Play of the page's
 *     cast, Acme's sibling Play (lp-step-data.ts S2_PLAYS[1], "Startups posting about a rebrand");
 *   - the centre: the steps' Brain centre (step 03 on the page, the `s1` motion: steps.css
 *     .lp-s1-center, a 31 px plum disc), at 40;
 *   - the three parts: that graph's hubs and their names (lp-step-data.ts S1_HUBS: ICPs #68CEA7 =
 *     --lp-green-20, Competitors #BA8BFF = --lp-purple-30); Voice takes the infra Context
 *     card's yellow (LpInfra.tsx LAYERS, tone "yellow"). Their names are its hub label's size
 *     (steps.css .lp-s1-hlabel, 10/16) at ×2.8: 28 px on the spec's 32 px line, each centred on
 *     its dot, in the weight of the family's names (500: the loved hub's names, the lineage
 *     story's lead);
 *   - the spokes: straight, as that graph's edges (steps.css .lp-s1-edges), in the loved
 *     wire's look (the kit's grey 2 px);
 *   - the exit wire: the loved picture's connector, one cubic with horizontal handles,
 *     c = 0.426667 × the straight distance (the formula of lp-story-sources-data.ts:89-93 at
 *     630bb8e, removed with its story the same day); its end dot is the loved hub dot (.lp-src-hubdot);
 *   - Mobbin: Ada "reasoning engine" (8b9d52f3-05d9-47d9-81a2-aad5a6a8fa71, inputs converge into
 *     one node and one line exits) and Duna "Policy Engine" (bfa5af78-e3be-420f-a9fb-23e5a2edda20,
 *     a hub with satellites on short ticks).
 *
 * Truth (the dive panel's truth table): "Every answer tells your agent what to do next" and
 * "Pancake suggests your next Play, starting from what already brought you leads" (live); the
 * three parts are Brain sections (who buys = ICPs, your voice, your competitors). No CRM, no
 * account-level claim, no platform named or drawn.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted, so copy sits only in fields
 * named `text` (never a code key the lint skips: id, key, kind, type, role, tone, icon, path,
 * url, d…). The kicker is kept in sentence case: the caps are the stylesheet's.
 *
 * Geometry: stage px on the 752×489 design box (phones show the same box scaled, ×0.435 at
 * 375 px: labels 12.2, kicker 14.8, value 26.1 px). The type positions were measured in the
 * page's own fonts (the panel's metrics on :3011): the kicker's caps have their optical middle
 * 19.66 under its line box's top, its ink ends at x 356.9; the value's two lines run to x 433.2.
 * Every wire is written out here, never computed at render.
 *
 * STORY_CONTEXT_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: no import (the timeline reads what it needs from the markup).
 */

/** a part of the Brain, in its landing order */
export type StoryContextPartId = "voice" | "icp" | "competitors";

export type StoryContextPart = {
  id: StoryContextPartId;
  /** the brand token after `--lp-` (foundation.css) */
  tone: "yellow-30" | "green-20" | "purple-30";
  /** the dot's centre and radius, stage px */
  x: number;
  y: number;
  r: number;
  /** the spoke, written from the dot into the centre: the wire draws from its M point */
  d: string;
  /** the part's name, centred on the dot's x; `top` = its 32 px line box's top. Voice and ICPs
      sit above their dots, Competitors under its dot: about 10.6 px of air between ink and
      dot, and the ICPs ink 21.6 px over its own spoke (the spec's clearances). The ICPs dot
      sits at x 682, so its name ends 40 px clear of the stage's right edge (the spec's margin) */
  label: { text: string; top: number };
};

export type StoryContextStory = {
  /** the block's claim, filling the stage at frame 0 (the camera's s 1.5) */
  claim: {
    /** spaced caps, 34/40; x, y = its line box's top-left */
    kicker: { text: string; x: number; y: number };
    /** the display face, 60/60, two lines (white-space: pre); y = kicker's y + 64 */
    value: { text: string; x: number; y: number };
  };
  /** the Brain's centre, a resting piece: present from frame 0, it slides in with the camera */
  center: { x: number; y: number; r: number };
  /** array order = landing order (and paint order) */
  parts: readonly StoryContextPart[];
  /** the one line out: from the centre to the kicker's dot */
  exit: { d: string };
  /** where the exit lands: 18 px past the kicker's ink, on its caps' middle (r = the kit's cap) */
  dot: { x: number; y: number; r: number };
};

export const STORY_CONTEXT: StoryContextStory = {
  claim: {
    kicker: { text: "Next best Play", x: 48, y: 152 },
    value: { text: "Startups posting\nabout a rebrand", x: 49, y: 216 },
  },
  center: { x: 575, y: 250, r: 20 },
  parts: [
    {
      id: "voice", tone: "yellow-30", x: 575, y: 118, r: 11,
      d: "M575 118V250",
      label: { text: "Voice", top: 70 },
    },
    {
      id: "icp", tone: "green-20", x: 682, y: 250, r: 11,
      d: "M682 250H575",
      label: { text: "ICPs", top: 202 },
    },
    {
      id: "competitors", tone: "purple-30", x: 575, y: 382, r: 11,
      d: "M575 382V250",
      label: { text: "Competitors", top: 398 },
    },
  ],
  /** (575, 250) → (375, 171.66): distance 214.796, c = 91.646. 34.4 px clear of the value */
  exit: { d: "M575 250C483.354 250 466.646 171.66 375 171.66" },
  dot: { x: 375, y: 171.66, r: 5.333 },
};

/** The whole story, in the order it plays. The stage is aria-hidden: its words are read from
    here only. */
export const STORY_CONTEXT_ALT: string =
  "Animation: the words Next best Play, Startups posting about a rebrand, fill the view, then the view pulls back. Beside them, three parts of your Brain appear around one center: Voice, ICPs and Competitors. Their lines join the center, then one line runs from it to the next best Play.";
