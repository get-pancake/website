import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  SK_CAM_END,
  skCamera,
  skCap,
  skDot,
  skHideR,
  skHideRise,
  skHideWire,
  skQuery,
  skRise,
  skWire,
} from "./lp-story-kit";

/**
 * Deep-dive story "signals" (block 2, "Buying signal + enrichment") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Founder, 2026-10-28: "ban UI things from motions and
 * try to abstract things … graphic simple and on brand (you can reuse components)"; the picture
 * is the one he loves, the old sources story's end hub, and so is its motion: the cap lands, the
 * wire draws into the near-black dot, the two providers behind the funding first, a beat, then
 * the four others 0.28 s apart (lp-story-sources-timeline.ts at 630bb8e, scene D). Build spec: the design
 * panel's §3.2; the opening is his request for the infra bricks, "prendre toute la place au
 * debut … puis ouvrir la fenetre", as the kit's camera.
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the
 * first composed scene: 0, the claim fills the stage from the first frame, never an empty one.
 * Every verb is the kit's (lp-story-kit.ts): this file places them in time.
 * No "use client" on purpose: reached only through DIVE_LOADERS.signals (lp-dive-loaders.ts,
 * lazy chunk).
 *
 * Times (s), the T table below. 7.00 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: the claim, "WHY THEY FIT / Just raised", at the camera's ×2 (cue). It HOLDS
 *              1.8 s
 *   1.80–3.00  the camera pulls back (power2.inOut): the providers, their names and the
 *              confetti slide in from the left, already in place. They never pop. The camera's
 *              variable is cleared at 3.01: from there the scene is plain layout
 *   3.00       f2: the providers stand, no wire yet
 *   3.20–3.80  Dealroom: its cap lands, its wire draws into the hub point
 *   3.45–4.05  TheirStack, the same (the two behind the funding, 0.25 s apart)
 *   3.70–3.95  the hub dot lands with the first wire (the loved timing: its draw + 0.5)
 *   4.05       f3: the two wires in. It HOLDS 0.7 s
 *   4.75–6.19  Wappalyzer, Apify, Firecrawl, Coresignal: cap and wire each, 0.28 s apart (the
 *              loved spacing)
 *   6.19       f4: every wire in
 *   6.55–6.95  "30+ data providers" rises (y 8 → 0)
 *   7.00       f5: the END = the server markup
 *
 * Nothing that rests moves by its own transform: the discs, the names, the confetti and the type
 * move only with the camera, once. The count label rises by the kit's variable, let go SK_LANDED
 * after it lands (skRise), so it rests untransformed. The caps and the hub dot land by their `r`
 * attribute.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** the camera has landed and let go of its variable (lp-story-kit.ts SK_CAM_END) */
  f2: SK_CAM_END,
  /** each provider's cap and wire, by data-order: the two behind the funding 0.25 s apart, a
      beat, then the four others 0.28 s apart (a wire draws in 0.6 s) */
  draw: [3.2, 3.45, 4.75, 5.03, 5.31, 5.59],
  /** the hub dot, as the first wire lands */
  dot: 3.7,
  f3: 4.05,
  f4: 6.19,
  /** the count label's rise starts */
  label: 6.55,
  end: 7,
} as const;
/** past the drawn six (a provider added to the data): one more every 0.28 s */
const DRAW_GAP = 0.28;
/** the count label's rise: from 8 px below its place in 0.4 s (the kit's skRise; the old message
    story's rise, lp-story-message-timeline.ts:372 at 630bb8e) */
const RISE = { y: 8, duration: 0.4 } as const;

/** The builder in one go. In slices: `buildStorySignalsSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and what
    it reads after its first write (the wires' lengths, the stylesheet's camera scale) depends on
    nothing it writes. */
export function buildStorySignals(root: HTMLElement): BuiltStory {
  const steps = buildStorySignalsSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStorySignalsSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "signals");

  const cam = $(".lp-sk-cam");
  // the providers' caps and wires in reveal order (data-order 0…n−1, from the data's `order`)
  const count = $$(".lp-sk-wires g[data-order]").length;
  const wires = Array.from({ length: count }, (_, k) => ({
    cap: $<SVGCircleElement>(`.lp-sk-wires g[data-order="${k}"] .lp-sk-cap`),
    path: $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] path`),
  }));
  const hub = $<SVGCircleElement>(".lp-sk-hub");
  const label = $(".lp-ssig-count");

  /* ── frame 0 (the markup rests on the end picture). Each block leaves a composed picture, the
     END less what is hidden so far; the camera comes last, with the timeline ── */
  skHideR([hub, ...wires.map((wire) => wire.cap)]);
  yield;
  wires.forEach((wire) => skHideWire(wire.path));
  yield;
  skHideRise(label, RISE.y);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── the opening: the claim fills the stage and holds, then the view pulls back ── */
  skCamera(tl, cam);

  /* ── the wires, one by one into the hub point; the dot lands with the first ── */
  wires.forEach(({ cap, path }, k) => {
    const at = T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
    skCap(tl, cap, at);
    skWire(tl, path, at);
  });
  skDot(tl, hub, T.dot);

  /* ── the count ── */
  skRise(tl, label, T.label, RISE.duration);

  // the take ends at 7.00 s (the carousel plays from the cue to the timeline's end, then holds)
  tl.set({}, {}, T.end);

  /* QA labels = the beats (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
