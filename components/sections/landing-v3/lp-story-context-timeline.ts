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
 * one plum centre; one line runs from it to one account under a cluster (which account), then on
 * to a Play (which Play); and a loop runs from the Play back into the centre (it remembers what
 * worked).
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
 * the stage and held: "this is not motion like it's plain text"), no big text ("no UI should not
 * mean text it should mean abstraction of what our infrastructure does"), then a little more to
 * read ("ajouter un poil de densité informationnelle"). Every move is one of the kit's verbs,
 * copied from the loved sources hub (a stop lands, a disc pops, a cap lands, a wire draws, a name
 * rises) and played once. Times (s), the T table below:
 *
 *   0.00       f1: frame 0 = the cue: the plum centre and the accounts, in their END places
 *   0.30–0.95  the inputs land 0.1 s apart: ICP and Voice (a stop: r 0 → 16), then the CRM (its
 *              disc pops); each label rises (y 6 → 0) 0.08 s after its input
 *   0.95       f2: the three inputs are in
 *   0.95–1.50  each input's cap lands and its wire draws into the centre, 0.1 s apart (0.35 s
 *              each): read in one call
 *   1.50       f3: every wire is in. A beat
 *   1.65–2.15  the cap lands on the centre's right edge and the line out draws to the picked
 *              account (0.5 s); its near-black dot grows 0.1 s before the line arrives, and
 *              "Which account" rises
 *   2.40–2.85  the cap lands on the near-black dot's right edge and the line runs on to the Play
 *              (0.45 s); the Play's stop lands 0.1 s before it arrives (r 0 → 18), its mark
 *              shows, "Which Play" and the Play's name rise
 *   3.25       f4: which account, which Play
 *   3.35–4.05  the cap lands on the Play's top and the loop draws back over the cluster into the
 *              centre (0.7 s); "Remembers what worked" rises as it closes
 *   4.60       f5 = the END = the server markup (the carousel then holds it)
 *
 * Never moves: the centre and the accounts (frame 0 on), every dot once it has landed. The dots
 * animate their `r` attribute, never a transform; the Play's mark fades in (opacity); the disc's
 * pop and the labels' rise go by the kit's variables and let go of them SK_LANDED after they land
 * (skPop, skRise), so nothing rests transformed.
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
  /** the line out: its cap lands on the centre's edge and it draws to the picked account */
  exit: 1.65,
  exitDraw: 0.5,
  /** the near-black dot grows over the picked account, 0.1 s before the line arrives (2.15) */
  pick: 2.05,
  /** "Which account" rises */
  pickLabel: 2.15,
  /** the line on: its cap lands on the near-black dot's edge and it draws to the Play */
  play: 2.4,
  playDraw: 0.45,
  /** the Play's stop lands, 0.1 s before the line arrives (2.85); its mark fades in on it */
  playStop: 2.75,
  playMark: 2.9,
  playMarkFade: 0.2,
  /** "Which Play", then the Play's name */
  playLabels: [2.9, 2.96],
  rise: 0.35,
  /** which account, which Play (2.96 + 0.35) */
  f4: 3.25,
  /** the loop: its cap lands on the Play's top and it draws back into the centre */
  loop: 3.35,
  loopDraw: 0.7,
  /** "Remembers what worked" rises as the loop closes (4.05) */
  loopLabel: 3.85,
  loopRise: 0.4,
  /** f5 = the END */
  end: 4.6,
} as const;

/** how far a label rises as it comes in, stage px */
const LABEL_RISE = 6;

/** the wires that are not an input's: the line out, the line on to the Play and the loop */
const NOT_INPUT = ':not([data-node="exit"]):not([data-node="play"]):not([data-node="loop"])';

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
  const inputs = $$<SVGGElement>(`.lp-sk-wires g[data-node]${NOT_INPUT}`).map((g) => {
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
  const play = {
    wire: $<SVGPathElement>('.lp-sk-wires g[data-node="play"] path'),
    cap: $<SVGCircleElement>('.lp-sk-cap[data-node="play"]'),
    stop: $<SVGCircleElement>(".lp-sctx-play"),
    mark: $<SVGPathElement>(".lp-sctx-play-mark"),
    labels: [$('.lp-sk-name[data-node="play"]'), $('.lp-sk-name[data-node="play-name"]')],
  };
  const playR = Number(play.stop.getAttribute("r"));
  const loop = {
    wire: $<SVGPathElement>('.lp-sk-wires g[data-node="loop"] path'),
    cap: $<SVGCircleElement>('.lp-sk-cap[data-node="loop"]'),
    label: $('.lp-sk-name[data-node="loop"]'),
  };

  const tl = gsap.timeline({ paused: true });

  /* ── frame 0 = the cue: the centre and the accounts; the inputs, the wires, the pick, the Play
     and the loop wait. Each block leaves a composed picture: the END less what is hidden so far ── */
  skHideR([
    ...inputs.flatMap(({ stop }) => (stop ? [stop] : [])),
    ...inputs.map(({ cap }) => cap),
    exit.cap,
    pick,
    play.cap,
    play.stop,
    loop.cap,
  ]);
  skHidePop(inputs.flatMap(({ stop, body }) => (stop ? [] : [body])));
  gsap.set(play.mark, { opacity: 0 });
  yield;
  skHideRise([...inputs.map(({ label }) => label), pickLabel, ...play.labels, loop.label], LABEL_RISE);
  yield;
  inputs.forEach(({ wire }) => skHideWire(wire));
  skHideWire(exit.wire);
  skHideWire(play.wire);
  skHideWire(loop.wire);
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

  /* ── one line out, to one account: which account ── */
  skCap(tl, exit.cap, T.exit);
  skWire(tl, exit.wire, T.exit, T.exitDraw);
  skStop(tl, pick, pickR, T.pick);
  skRise(tl, pickLabel, T.pickLabel, T.rise);

  /* ── the line runs on to the Play: which Play ── */
  skCap(tl, play.cap, T.play);
  skWire(tl, play.wire, T.play, T.playDraw);
  skStop(tl, play.stop, playR, T.playStop);
  tl.to(play.mark, { opacity: 1, duration: T.playMarkFade, ease: "power1.out" }, T.playMark);
  play.labels.forEach((label, i) => skRise(tl, label, T.playLabels[i], T.rise));

  /* ── the loop back into the centre: it remembers what worked ── */
  skCap(tl, loop.cap, T.loop);
  skWire(tl, loop.wire, T.loop, T.loopDraw);
  skRise(tl, loop.label, T.loopLabel, T.loopRise);

  // the END holds until T.end
  tl.set({}, {}, T.end);
  // the beats, by name (the shell's pose() and the harness take them)
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  // the caller's revert restores the server markup on its own (the kit's verbs): nothing to clean up
  return { tl, cleanup: () => {}, cue: 0 };
}
