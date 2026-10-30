import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { skHideR, skHideRise, skHideWire, skQuery, skRise, skStop, skWire } from "./lp-story-kit";

/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Owner: story-lineage package (2026-10-28). The
 * founder's "3/ Lead lineage", which is also "la detection croisee de signaux interne externe",
 * with no UI in the motion ("ban UI things from motions and try to abstract things we re talking
 * about being graphic simple and on brand (you can reuse components)"): your data's wires reach
 * three leads, then Pancake data's reach three, and the one lead both reach lights up and is
 * named. Markup LpStoryLineage.tsx, words and geometry lp-story-lineage-data.ts, look
 * story-kit.css + story-lineage.css.
 *
 * Contract: lp-dive-stages.ts and code-map §6.2 — frame 0 via gsap.set (the caller's
 * gsap.context reverts it), sets and tweens only (no callbacks, no randomness, no repeat, no
 * timeScale), progress(1) = the server markup, `cue` = the first composed scene: 0, the whole
 * picture but its wires, her dot and her name, never an empty frame. No "use client": reached
 * only through DIVE_LOADERS.lineage (lp-dive-loaders.ts, a lazy chunk); it imports GSAP, the
 * story kit and types, nothing else (no copy: every word is in the markup).
 *
 * Every verb is the kit's (lp-story-kit.ts), copied from the loved picture's timeline
 * (lp-story-sources-timeline.ts at 630bb8e) or its sibling's:
 *   wire draw      skWire, strokeDashoffset to 0 in 0.6 s (:284-285), from its source's edge
 *   her dot        skStop, r 0 → 12 in 0.35 s (the confetti's timing, :264): the near-black
 *                  dot grows over the grey one
 *   rise           skRise, y 8 → 0 in 0.4 s (the old message story's,
 *                  lp-story-message-timeline.ts:372 at 630bb8e)
 * SVG dots grow by their `r` attribute, never by a transform; the name rises by the kit's
 * variable and lets go of it SK_LANDED after it lands, so the END is the server markup in Gecko
 * too. No camera, no pop: the sources, their names and the grey leads stand from frame 0.
 *
 * Times (s), the T table below. 3.30 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: both sides' sources with their names and group labels,
 *              the five grey leads; no wire yet
 *   0.30–1.20  your data reaches out, bottom to top: events, site visits, then the CRM, 0.15 s
 *              apart. The CRM's wire is the last in: it
 *              reaches the middle lead, which stays grey (one side only)
 *   1.20       f2: your data's three wires are in
 *   1.20–2.10  then Pancake data's, top to bottom: TheirStack, Apify, then Dealroom, 0.15 s
 *              apart. Dealroom's is the last of all, into the middle lead
 *   1.95       f3: TheirStack's and Apify's wires are in, Dealroom's on its way
 *   2.05–2.40  as it arrives, its near-black dot grows over the grey one
 *   2.20–2.60  "Founder @ Mastra" rises under it
 *   2.61       f4: the lead is found and named (its label lets go of its variable)
 *   3.30       f5: the END = the server markup
 *
 * Never moves: the discs, the stops, the names, the group labels and the grey leads. Each wire
 * draws once, from its source.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** each wire's start, by its data-order (lp-story-lineage-data.ts `order`): your data's three
      0.15 s apart, then Pancake data's three, the two into the found lead last of each */
  draw: [0.3, 0.45, 0.6, 1.2, 1.35, 1.5],
  /** your data's wires are in (0.6 + DRAW) */
  f2: 1.2,
  /** TheirStack's and Apify's are in (1.35 + DRAW) */
  f3: 1.95,
  /** her dot grows 0.05 s before Dealroom's wire arrives (1.5 + DRAW = 2.1) */
  found: 2.05,
  /** her name rises while the dot lands (it is whole at 2.40) */
  name: 2.2,
  /** the name has let go of its variable (2.2 + 0.4 + SK_LANDED) */
  f4: 2.61,
  /** the END holds to here */
  end: 3.3,
} as const;
/** a wire's draw (the kit's 0.6 s) */
const DRAW = 0.6;
/** past the drawn six (a wire added to the data): one more every 0.15 s */
const DRAW_GAP = 0.15;

/** The builder in one go: its slices (buildStoryLineageSteps) run to the end. */
export function buildStoryLineage(root: HTMLElement): BuiltStory {
  const steps = buildStoryLineageSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** The same builder in slices, which the carousel and the phone stack spread over idle slots
    (lp-play-once's startBuild). It may yield after any block: its frame-0 sets are written at
    once, its tweens write nothing until they are rendered, and what it reads (her dot's radius,
    the wires' lengths) depends on nothing it writes. */
export function* buildStoryLineageSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "lineage");
  const wires = $$<SVGPathElement>(".lp-sk-wires path[data-order]");
  const dot = $<SVGCircleElement>(".lp-sk-wires .lp-slin-found");
  const name = $(".lp-slin-name");
  // her dot lands on the markup's radius (the END picture's): read before frame 0 writes it
  const dotR = Number(dot.getAttribute("r"));
  /** a wire's start, from its slot */
  const startOf = (el: Element) => {
    const k = Number(el.getAttribute("data-order"));
    return T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
  };

  /* ── frame 0 (the markup rests on the end picture): the sources, their names and the grey
     leads stay; every wire, her dot and her name wait, unseen ── */
  wires.forEach((wire) => skHideWire(wire));
  yield;
  skHideR(dot);
  skHideRise(name);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── the wires, your data's then Pancake data's, each from its source's edge ── */
  wires.forEach((wire) => skWire(tl, wire, startOf(wire), DRAW));

  /* ── the lead both sides reach: her dot, then her name ── */
  skStop(tl, dot, dotR, T.found);
  skRise(tl, name, T.name);

  tl.set({}, {}, T.end); // the END picture holds

  /* QA labels = the story's pictures (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
