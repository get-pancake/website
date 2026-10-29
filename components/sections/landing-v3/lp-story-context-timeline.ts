import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skCap,
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
 * Deep-dive story "context" (block 1, "Your agent knows what to do next") — its build-up as ONE
 * paused, seek-safe GSAP timeline on the stage root. The picture (LpStoryContext.tsx, words and
 * geometry in lp-story-context-data.ts): ICP, Voice and the CRM's mark each draw a grey wire into
 * one plum centre, and one wire runs from it to one account of a cluster, the next best action.
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness, no repeat, no timeScale), progress(1) = the server
 * markup, `cue` = 0: frame 0 is composed (the centre and the accounts), never empty. No "use
 * client" on purpose, like every story timeline: reached only through DIVE_LOADERS.context
 * (lp-dive-loaders.ts, a lazy chunk). Imports: GSAP, the kit's verbs (lp-story-kit.ts) and types,
 * nothing else; what it needs from the data (the stops' and the pick's radii, the wires' lengths)
 * it reads from the markup.
 *
 * The founder's asks it follows: no UI in the motion ("ban UI things from motions and try to
 * abstract things"), real motion from the first fraction of a second (on the claim zoomed to fill
 * the stage and held: "this is not motion like it's plain text"), and no big text ("no UI should
 * not mean text it should mean abstraction of what our infrastructure does"). Every move is one of
 * the kit's verbs, copied from the loved sources hub (a stop lands, a disc pops, a cap lands, a
 * wire draws, a name rises) and played once. Times (s), the T table below:
 *
 *   0.00       f1: frame 0 = the cue: the plum centre and the cluster of accounts, in their END
 *              places
 *   0.30–0.95  the inputs land 0.1 s apart: ICP and Voice (a stop: r 0 → 16), then the CRM (its
 *              disc pops); each label rises (y 6 → 0) 0.08 s after its input
 *   0.95       f2: the three inputs are in
 *   0.95–1.50  each input's cap lands and its wire draws into the centre, 0.1 s apart (0.35 s
 *              each): read in one call
 *   1.50       f3: every wire is in. A beat
 *   1.80–2.50  the cap lands on the centre's right edge and the one wire out draws to the
 *              picked account (0.7 s)
 *   2.40–2.75  the near-black dot grows over it as the wire arrives (the loved hub dot's timing:
 *              0.1 s before the wire's end)
 *   2.50–2.90  "Next best action" rises over it
 *   2.90       f4: the next best action is named
 *   3.40       f5 = the END = the server markup (the carousel then holds it)
 *
 * Never moves: the centre and the accounts (frame 0 on), every dot once it has landed. The dots
 * animate their `r` attribute, never a transform; the disc's pop and the labels' rise go by the
 * kit's variables and let go of them SK_LANDED after they land (skPop, skRise), so nothing rests
 * transformed.
 */

/** the take, in seconds (see the table above) */
const T = {
  /** frame 0: the centre and the accounts */
  f1: 0,
  /** each input lands, in the markup's order (ICP, Voice, CRM) */
  inputs: [0.3, 0.4, 0.5],
  /** each label rises, 0.08 s after its input */
  labels: [0.38, 0.48, 0.58],
  labelRise: 0.3,
  /** the inputs are in (the CRM disc's pop settles at 0.5 + 0.45) */
  f2: 0.95,
  /** each input's cap lands and its wire starts to draw into the centre */
  wires: [0.95, 1.05, 1.15],
  wireDraw: 0.35,
  /** the last wire is in (1.15 + 0.35) */
  f3: 1.5,
  /** the one wire out: its cap lands on the centre's edge and it draws to the picked account */
  exit: 1.8,
  exitDraw: 0.7,
  /** the near-black dot grows over the picked account, 0.1 s before the wire arrives (2.5) */
  pick: 2.4,
  /** its label rises */
  pickLabel: 2.5,
  pickRise: 0.4,
  /** the label is in (2.5 + 0.4) */
  f4: 2.9,
  /** f5 = the END */
  end: 3.4,
} as const;

/** how far a label rises as it comes in, stage px */
const LABEL_RISE = 6;

/** The builder in one go. In slices: `buildStoryContextSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). */
export function buildStoryContext(root: HTMLElement): BuiltStory {
  const steps = buildStoryContextSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** It may yield after any block: its frame-0 sets are written at once, its tweens write nothing
    until they are rendered, the radii are read before its first write, and what it reads after
    it (the wires' lengths) depends on nothing it writes. */
export function* buildStoryContextSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "context");

  // the inputs, in the markup's order (the data's: the wires' <g>); an input's body (a stop or
  // the disc), wire, cap and label share its data-node
  const inputs = $$<SVGGElement>('.lp-sk-wires g[data-node]:not([data-node="exit"])').map((g) => {
    const node = g.dataset.node;
    const body = $<Element>(`.lp-sctx-stop[data-node="${node}"], .lp-sk-disc[data-node="${node}"]`);
    return {
      /** a stop lands by its radius; the disc pops */
      stop: body instanceof SVGCircleElement ? body : null,
      body,
      /** a stop's END radius (the markup's), read before frame 0 sets it to 0 */
      r: Number(body.getAttribute("r")),
      wire: $<SVGPathElement>(`.lp-sk-wires g[data-node="${node}"] path`),
      cap: $<SVGCircleElement>(`.lp-sk-cap[data-node="${node}"]`),
      label: $(`.lp-sk-name[data-node="${node}"]`),
    };
  });
  if (inputs.length !== T.inputs.length) throw new Error("lp-story-context: the inputs are out of step with T");
  const exit = {
    wire: $<SVGPathElement>('.lp-sk-wires g[data-node="exit"] path'),
    cap: $<SVGCircleElement>('.lp-sk-cap[data-node="exit"]'),
  };
  const pick = $<SVGCircleElement>(".lp-sctx-pick");
  const pickR = Number(pick.getAttribute("r"));
  const pickLabel = $('.lp-sk-name[data-node="pick"]');

  const tl = gsap.timeline({ paused: true });

  /* ── frame 0 = the cue: the centre and the accounts; the inputs, the wires and the pick wait.
     Each block leaves a composed picture: the END less what is hidden so far ── */
  skHideR([...inputs.flatMap(({ stop }) => (stop ? [stop] : [])), ...inputs.map(({ cap }) => cap), exit.cap, pick]);
  skHidePop(inputs.flatMap(({ stop, body }) => (stop ? [] : [body])));
  yield;
  skHideRise([...inputs.map(({ label }) => label), pickLabel], LABEL_RISE);
  yield;
  inputs.forEach(({ wire }) => skHideWire(wire));
  skHideWire(exit.wire);
  yield;

  /* ── the inputs land, each named as it lands ── */
  inputs.forEach(({ stop, body, r, label }, i) => {
    if (stop) skStop(tl, stop, r, T.inputs[i]);
    else skPop(tl, body, T.inputs[i]);
    skRise(tl, label, T.labels[i], T.labelRise);
  });

  /* ── each draws its wire into the centre: one call ── */
  inputs.forEach(({ cap, wire }, i) => {
    skCap(tl, cap, T.wires[i]);
    skWire(tl, wire, T.wires[i], T.wireDraw);
  });

  /* ── one wire out, to one account; it becomes the next best action ── */
  skCap(tl, exit.cap, T.exit);
  skWire(tl, exit.wire, T.exit, T.exitDraw);
  skStop(tl, pick, pickR, T.pick);
  skRise(tl, pickLabel, T.pickLabel, T.pickRise);

  // the END holds until T.end
  tl.set({}, {}, T.end);
  // the beats, by name (the shell's pose() and the harness take them)
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  // the caller's revert restores the server markup on its own (the kit's verbs): nothing to clean up
  return { tl, cleanup: () => {}, cue: 0 };
}
