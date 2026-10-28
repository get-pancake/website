import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  SK_CAM_END,
  skCamera,
  skDot,
  skHideR,
  skHideRise,
  skHideWire,
  skQuery,
  skRise,
  skStop,
  skWire,
} from "./lp-story-kit";

/**
 * Deep-dive story "context" (block 1: Next best action + Unified GTM context) — its build-up as
 * ONE paused, seek-safe GSAP timeline on the stage root. Spec: the dive panel's final spec §3.0
 * (the kit's camera and verbs) and §3.1 (this story's beats). Contract: lp-dive-stages.ts —
 * frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens only (no
 * callbacks, no randomness, no repeat, no timeScale), progress(1) = the server markup
 * (LpStoryContext.tsx), `cue` = 0: the claim is composed at t = 0, never an empty frame.
 * Reached only through DIVE_LOADERS.context (lp-dive-loaders.ts, lazy chunk); no "use client"
 * on purpose, like every story timeline: a "use client" module the server graph reaches ships
 * eagerly in the homepage bundle. Imports: GSAP, the kit's verbs (lp-story-kit.ts) and types
 * only. What it needs from the data (the parts' radii, the wires' lengths, the camera's scale)
 * it reads from the markup and the stylesheet.
 *
 * The founder's asks it follows: no UI in the motion ("ban UI things from motions and try to
 * abstract things"), and for the opening "prendre toute la place au debut … puis ouvrir la
 * fenetre", then "les faire arriver en premier puis faire arriver les petits details": the claim
 * first, at full size, then the view opens and the Brain's parts come, then the lines. Every
 * move is one of the kit's verbs, copied from the loved sources hub (draw, land, rise) and
 * played once. Times (s), the T table below:
 *
 *   0.00–1.80  f1: frame 0 = the cue. The claim ("NEXT BEST PLAY" over the Play) fills the
 *              stage at ×1.5 and holds
 *   1.80–3.00  the camera pulls back to ×1 (power2.inOut); the plum centre, a resting piece
 *              off the stage at x' 875, slides in with it. The scale variable is cleared at 3.01
 *   3.00       f2
 *   3.10–3.95  Voice, ICPs, Competitors land 0.25 s apart (a stop: r 0 → 11); each name rises
 *              (y 6 → 0) 0.1 s after its dot
 *   4.00       f3
 *   4.15–4.80  each spoke draws from its dot into the centre, 0.1 s apart (0.45 s each)
 *   4.80–5.80  f4: the Brain stands, held
 *   5.80–6.60  the one line out draws from the centre to the kicker (0.8 s)
 *   6.50–6.75  the kicker's dot lands as it arrives (the loved hub dot's timing: 0.1 s before
 *              the wire's end)
 *   7.00       f5 = the END = the server markup (the carousel then holds it)
 *
 * Never moves: the type (only the camera moves it, once), the centre, and every dot once it
 * has landed. The dots animate their `r` attribute, never a transform; the names rise by the
 * kit's variable and let go of it SK_LANDED after they land (skRise), so no text rests in a
 * transformed layer.
 */

/** the take, in seconds (see the table above) */
const T = {
  /** frame 0: the claim, held SK_CAM.hold */
  f1: 0,
  /** the camera has pulled back (SK_CAM.hold + SK_CAM.pull) */
  f2: SK_CAM_END,
  /** each part's dot lands, in the markup's order (Voice, ICPs, Competitors) */
  parts: [3.1, 3.35, 3.6],
  /** each part's name rises, 0.1 s after its dot */
  labels: [3.2, 3.45, 3.7],
  labelRise: 0.3,
  f3: 4,
  /** each spoke starts to draw from its dot into the centre */
  spokes: [4.15, 4.25, 4.35],
  spokeDraw: 0.45,
  /** the last spoke has landed (4.35 + 0.45): the Brain stands */
  f4: 4.8,
  /** the one line out, centre → kicker */
  exit: 5.8,
  exitDraw: 0.8,
  /** the kicker's dot lands */
  dot: 6.5,
  /** f5 = the END */
  end: 7,
} as const;

/** how far a part's name rises as it comes in, stage px */
const LABEL_RISE = 6;

/** The builder in one go. In slices: `buildStoryContextSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, the
    parts' radii and the stylesheet's camera scale are read before its first write, and the
    only thing it reads after it (the wires' lengths) depends on nothing it writes. */
export function buildStoryContext(root: HTMLElement): BuiltStory {
  const steps = buildStoryContextSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryContextSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "context");

  const cam = $(".lp-sk-cam");
  // the Brain's parts, in the markup's order; a part's dot, spoke and name share its data-part
  const parts = $$<SVGCircleElement>(".lp-sctx-part").map((dot) => {
    const part = dot.dataset.part;
    return {
      dot,
      /** its END radius (the markup's), read before frame 0 sets it to 0 */
      r: Number(dot.getAttribute("r")),
      spoke: $<SVGPathElement>(`.lp-sctx-spoke[data-part="${part}"]`),
      label: $(`.lp-sctx-label[data-part="${part}"]`),
    };
  });
  if (parts.length !== T.parts.length) throw new Error("lp-story-context: the parts are out of step with T");
  const exit = $<SVGPathElement>(".lp-sctx-exit");
  const kickerDot = $<SVGCircleElement>(".lp-sk-hub");

  const tl = gsap.timeline({ paused: true });

  /* ── frame 0 = the cue: the claim alone, at ×1.5 (the centre rests off the stage) ── */
  skCamera(tl, cam);
  skHideR([...parts.map(({ dot }) => dot), kickerDot]);
  yield;
  skHideRise(parts.map(({ label }) => label), LABEL_RISE); // each name hidden, 6 px below its place
  yield;
  parts.forEach(({ spoke }) => skHideWire(spoke));
  skHideWire(exit);
  yield;

  /* ── the Brain's three parts land, each named as it lands ── */
  parts.forEach(({ dot, r, label }, i) => {
    skStop(tl, dot, r, T.parts[i]);
    skRise(tl, label, T.labels[i], T.labelRise);
  });

  /* ── their spokes join the centre ── */
  parts.forEach(({ spoke }, i) => skWire(tl, spoke, T.spokes[i], T.spokeDraw));

  /* ── one line out, from the centre to the next best Play; its dot lands as it arrives ── */
  skWire(tl, exit, T.exit, T.exitDraw);
  skDot(tl, kickerDot, T.dot);

  // the END holds until T.end: the take is 7.00 s like the three other stories
  tl.set({}, {}, T.end);
  // the beats, by name (the shell's pose() and the harness take them)
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  // the caller's revert restores the server markup on its own (the kit's verbs): nothing to clean up
  return { tl, cleanup: () => {}, cue: 0 };
}
