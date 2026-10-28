import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skCamera,
  skCap,
  skDot,
  skHidePop,
  skHideR,
  skHideRise,
  skHideWire,
  skPop,
  skQuery,
  skRise,
  skStop,
  skWire,
} from "./lp-story-kit";

/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Owner: story-lineage package (2026-10-28). The
 * founder's third block, "3/ Lead lineage", with no UI in the motion ("ban UI things from
 * motions and try to abstract things … graphic simple and on brand (you can reuse
 * components)"): one trace runs back from a lead to the signal that found her, then on to its
 * source, in the verbs of the one picture he loves (the old sources story's end hub). Spec: the
 * final build spec of 2026-10-28, §3.0 and §3.3; markup LpStoryLineage.tsx, words and geometry
 * lp-story-lineage-data.ts, look story-kit.css + story-lineage.css.
 *
 * Contract: lp-dive-stages.ts and code-map §6.2 — frame 0 via gsap.set (the caller's
 * gsap.context reverts it), sets and tweens only (no callbacks, no randomness, no repeat, no
 * timeScale), progress(1) = the server markup, `cue` = the first composed scene: 0, the claim
 * fills the view from the first frame (never an empty one). No "use client": reached only
 * through DIVE_LOADERS.lineage (lp-dive-loaders.ts, a lazy chunk); it imports GSAP, the story
 * kit and types, nothing else (no copy: every word is in the markup).
 *
 * Every verb is the kit's (lp-story-kit.ts), each copied from the loved picture's timeline
 * (lp-story-sources-timeline.ts at 630bb8e) or its sibling's:
 *   the camera     skCamera: the claim at ×1.6 (story-lineage.css), held SK_CAM.hold, pulled
 *                  back in SK_CAM.pull (his approved ×3.89 push, :257, run backwards; his
 *                  "prendre toute la place au debut … puis ouvrir la fenetre")
 *   dot lands      skDot, r 0 → 5.333 in 0.25 s (:289)
 *   rise           skRise, y 8 → 0 in 0.4 s (the old message story's, lp-story-message-timeline.ts:372 at 630bb8e)
 *   wire draw      skWire, strokeDashoffset to 0 (:284-285), here in 0.7 s
 *   stop lands     skStop, r 0 → 12.709 in 0.35 s (the confetti's timing, :264)
 *   disc pop       skPop, fades in 0.18 s while it grows from .6 in 0.45 s (:274-275)
 *   cap            skCap, r 0 → 5.333 in 0.15 s (:283)
 * SVG dots grow by their `r` attribute, never by a transform; what moves (the name, the disc)
 * does it by the kit's variables and lets go of them SK_LANDED after it lands, so the END is the
 * server markup in Gecko too. The camera's variable is cleared at 3.01: from there the scene is
 * plain layout.
 *
 * Times (s), the T table below (spec §3.3):
 *
 *   0.00–1.80  f1: the claim, "WHICH SIGNAL" over "Hiring a / marketing lead", fills the view
 *              and holds (frame 0 = the cue)
 *   1.80–3.00  the view pulls back (the variable is cleared at 3.01)
 *   2.80–3.05  the lead's dot lands as the camera settles
 *   2.85–3.25  "Tamsin Okafor" rises by it
 *   3.25       f2: the lead is in. It holds to 4.00
 *   4.00–4.70  the line traces from her to the signal
 *   4.60–4.95  the purple stop lands as the line arrives
 *   4.95       f3: the signal that found her. It holds to 5.60
 *   5.60–6.30  the line traces on to the source
 *   6.20–6.65  TheirStack pops as the line arrives; its cap lands 6.30–6.45, where it ended
 *   7.00       f4 = the END (the carousel then holds it 2 s)
 *
 * Never moves: the type (only the camera moves it, once), the lead and her name once in, the
 * stop and the disc once landed. The line draws once, from her end.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** the lead's dot, as the camera settles (it lands at SK_CAM_END, 3.00) */
  dot: 2.8,
  name: 2.85,
  /** her name has risen: the lead's picture is whole */
  f2: 3.25,
  /** the trace runs from her to the signal … */
  toSignal: 4.0,
  /** … and the stop lands 0.1 s before the line arrives (4.70) */
  stop: 4.6,
  /** the stop has landed */
  f3: 4.95,
  /** the trace runs on to the source … */
  toSource: 5.6,
  /** … the disc pops 0.1 s before the line arrives (6.30), the cap lands where it ends */
  disc: 6.2,
  cap: 6.3,
  /** the last landing (the disc drops its transform at 6.66) holds to here */
  end: 7.0,
} as const;
/** each half of the trace draws in this long (the kit's 0.6 s, slowed: one line, read as it runs) */
const DRAW = 0.7;

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
    once, its tweens write nothing until they are rendered, and what it reads (the stop's
    radius, the camera's scale in the stylesheet, the wires' lengths) depends on nothing it
    writes. */
export function* buildStoryLineageSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $ } = skQuery(root, "lineage");
  const cam = $(".lp-sk-cam");
  const toSignal = $<SVGPathElement>('.lp-sk-wires path[data-trace="signal"]');
  const toSource = $<SVGPathElement>('.lp-sk-wires path[data-trace="source"]');
  const disc = $(".lp-sk-disc");
  const cap = $<SVGCircleElement>(".lp-sk-wires .lp-sk-cap");
  const stop = $<SVGCircleElement>(".lp-sk-wires .lp-slin-stop");
  const dot = $<SVGCircleElement>(".lp-sk-wires .lp-sk-hub");
  const name = $(".lp-slin-name");
  // the stop lands on the markup's radius (the END picture's): read before frame 0 writes it
  const stopR = Number(stop.getAttribute("r"));

  const tl = gsap.timeline({ paused: true });

  /* ── frame 0: the claim fills the view; every other part waits, unseen ── */
  skCamera(tl, cam);
  yield;
  skHideWire(toSignal);
  skHideWire(toSource);
  yield;
  skHideR([dot, stop, cap]);
  skHideRise(name);
  skHidePop(disc);
  yield;

  /* ── the lead comes in as the view settles ── */
  skDot(tl, dot, T.dot);
  skRise(tl, name, T.name);

  /* ── the trace runs back from her to the signal that found her … ── */
  skWire(tl, toSignal, T.toSignal, DRAW);
  skStop(tl, stop, stopR, T.stop);

  /* ── … then on to its source ── */
  skWire(tl, toSource, T.toSource, DRAW);
  skPop(tl, disc, T.disc);
  skCap(tl, cap, T.cap);

  tl.set({}, {}, T.end); // the END picture holds

  /* QA labels = the story's pictures (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.end);

  return { tl, cleanup: () => {}, cue: 0 };
}
