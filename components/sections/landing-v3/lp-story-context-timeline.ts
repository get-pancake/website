import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
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
 * to a Play (which Play); and a loop runs from the Play back onto the centre (it remembers what
 * worked), ending in an open arrowhead.
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness, no repeat, no timeScale), progress(1) = the server
 * markup, `cue` = 0: frame 0 is composed (the centre and the accounts), never empty. No "use
 * client" on purpose, like every story timeline: reached only through DIVE_LOADERS.context
 * (lp-dive-loaders.ts, a lazy chunk). Imports: GSAP, the kit's verbs (lp-story-kit.ts) and types,
 * nothing else; what it needs from the data (the stops' and the pick's radii, the centre's and
 * the accounts' tones) it reads from the markup.
 *
 * The founder's asks it follows: no UI in the motion ("ban UI things from motions and try to
 * abstract things"), real motion from the first fraction of a second (on the claim zoomed to fill
 * the stage and held: "this is not motion like it's plain text"), no big text ("no UI should not
 * mean text it should mean abstraction of what our infrastructure does"), then a little more to
 * read ("ajouter un poil de densité informationnelle"). Then, 2026-10-30 (founder, paraphrased):
 * make the four stories juicier, graphic and simple, letting the story go and giving the reader a
 * moment that moves them; and "the 4 blocks of the deep dive are the right ones but i am looking
 * for ideas to improve motions": the END picture is the same, the way there tells the story. The
 * same evening, on packets riding the wires: "pas sur des signaux qui voyagent ca fait un peu
 * sloppy", and on the dots swelling as they land or take a hit: "j aime pas trop les effets de
 * bounce que tu mets a chaque fois". So nothing travels but a wire drawing itself, once, and a
 * node appears once and then holds still: no radius ever passes its rest value. Two generic
 * patterns, drawn flat: a thinking beat that resolves into its answer (founder: "very good idea")
 * and status lights switching on in order (the scan). And the craft: the release is held a beat,
 * what lands answers the wire's tip as it reaches it, the labels follow it, each move starts as
 * the last one settles.
 *
 * So: the three wires draw into the centre together and land together (one call). The agent
 * thinks: "Thinking…" under the centre while the nine accounts light up in one sweep. It decides:
 * the line out draws to one account, which turns near-black as the line's tip reaches it (the
 * decisive pick), and "Thinking…" gives way to "Which account". It acts: the line runs on to the
 * Play, which switches on its mark as the tip reaches it. It learns: the loop draws back over the
 * cluster onto the centre. Every move is a kit verb (a stop lands, a disc pops, a wire draws, a
 * name rises) or a plain tween on a `fill` or an opacity, played once. No dot lands on a node's
 * edge (founder 2026-10-28: "ca fait un peu vibe coded"); no glow, ring, loop or ambient move.
 * Times (s), the T table below:
 *
 *   0.00       f1: frame 0 = the cue: the plum centre and the accounts, in their END places
 *   0.30–0.95  the inputs land 0.1 s apart: ICP and Voice (a stop: r 0 → 16), then the CRM (its
 *              disc pops); each label rises (y 6 → 0) 0.08 s after its input
 *   0.95       f2: the three inputs are in
 *   0.95–1.40  the read: the three wires draw into the centre together (0.45 s); their tips reach
 *              its edge together (1.26–1.27): one call
 *   1.30–2.18  thinking: "Thinking…" rises under the centre as they land (1.30); the nine accounts
 *              light up in one sweep, left to right, 0.05 s apart (1.38–2.18: ink-60 → the
 *              centre's plum in 0.1 s, back in 0.3 s)
 *   2.18       f3: read, thinking. The beat held before the release
 *   2.30–3.07  the pick: the line out draws (2.30, 0.4 s); as its tip reaches the picked account
 *              (2.60) the near-black dot grows over it (0.35 s), "Thinking…" fades and "Which
 *              account" and its name rise (2.66, 2.72)
 *   2.95–3.78  go: the Play's stop lands (2.95, r 0 → 18) and the line runs on from the near-black
 *              dot's edge (3.00, 0.45 s); as its tip reaches the stop (3.31) the mark switches on
 *              (0.2 s), "Which Play" and its name rise (3.37, 3.43)
 *   3.72       f4: which account, which Play
 *   3.72–4.80  the loop draws from the Play's top back over the cluster (0.7 s); as it lands, its
 *              arrowhead draws over the centre (4.40–4.55) and "Remembers what worked" rises (4.40)
 *   4.85       f5 = the END = the server markup (the carousel then holds it)
 *
 * A wire into a dot ends in the dot's middle, under it: its drawing tip reaches the dot's edge
 * before the draw ends, once the kit's draw (power2.inOut, (len + 1) × its progress) has covered
 * len − r. Worked out from the lengths in lp-story-context-data.ts: what answers a tip starts
 * there (the pick at the grey account's edge, r 9; the mark at the stop's, r 18).
 *
 * Never moves: the accounts' places (the scan only tints them, and lets go of the tint), every
 * dot once it has landed. The dots animate their `r` attribute, never a transform, and land by
 * the kit's eases, which never pass their rest; the Play's mark fades in (opacity); the disc's pop
 * and the labels' rise go by the kit's variables and let go of them SK_LANDED after they land
 * (skPop, skRise), so nothing rests transformed. "Thinking…" ends faded, as its CSS keeps it at
 * rest.
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
  /** the read: the three wires draw into the centre together; their tips reach its edge
      0.31–0.32 s in (ICP 215, Voice 172, CRM 207 px, each ending 20 px past it) */
  wires: 0.95,
  wireDraw: 0.45,
  /** "Thinking…" rises under the centre as the tips land */
  thinking: 1.3,
  /** the scan: the nine accounts, left to right, each lit `scanStep` after the one before,
      lit in `scanOn`, back in `scanOff` (the last is back at 1.38 + 8 × 0.05 + 0.4 = 2.18) */
  scan: 1.38,
  scanStep: 0.05,
  scanOn: 0.1,
  scanOff: 0.3,
  /** read, thinking: the held beat */
  f3: 2.18,
  /** the line out, from the centre's edge to the picked account (145 px, ending 9 px past the
      grey account's edge): its tip reaches the account at 2.597 */
  exit: 2.3,
  exitDraw: 0.4,
  /** the near-black dot grows over the picked account as the tip reaches it (landed at 2.95) */
  pick: 2.6,
  /** "Thinking…" gives way as the line lands */
  thinkingOut: 2.6,
  thinkingFade: 0.25,
  /** "Which account", then the account's name */
  pickLabels: [2.66, 2.72],
  rise: 0.35,
  /** the Play's stop lands as the line on starts (landed at 3.30) */
  playStop: 2.95,
  /** the line on, from the near-black dot's edge to the Play (163 px, ending 18 px past the
      stop's edge): its tip reaches the stop at 3.312 */
  play: 3.0,
  playDraw: 0.45,
  /** the Play's mark switches on as the tip reaches it */
  playMark: 3.31,
  playMarkFade: 0.2,
  /** "Which Play", then the Play's name */
  playLabels: [3.37, 3.43],
  /** which account, which Play: the loop has not shown yet (it does at 3.74) */
  f4: 3.72,
  /** the loop: it draws from the Play's top back over the cluster (its tip settles 4.36–4.42);
      its arrowhead draws as it lands (0.02 s before its end, 0.15 s long) */
  loop: 3.72,
  loopDraw: 0.7,
  arrow: 4.4,
  arrowDraw: 0.15,
  /** "Remembers what worked" rises as the loop lands */
  loopLabel: 4.4,
  loopRise: 0.4,
  /** f5 = the END (the loop's label lands at 4.80) */
  end: 4.85,
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
    until they are rendered, the radii and the tones are read before its first write, and what it
    reads after it (the wires' lengths) depends on nothing it writes. */
export function* buildStoryContextSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "context");

  // the inputs, in the markup's order (the data's: the wires' <g>); an input's body (a stop or
  // the disc), wire and label share its data-node
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
      label: $(`.lp-sk-name[data-node="${node}"]`),
    };
  });
  if (inputs.length !== T.inputs.length) throw new Error("lp-story-context: the inputs are out of step with T");
  const center = $<SVGCircleElement>(".lp-sctx-center");
  // the nine accounts the scan lights, left to right (the picked one, under the line, is not
  // scanned); lit in the centre's plum, back to their own tone (both read from the markup's CSS)
  const scanned = $$<SVGCircleElement>(".lp-sctx-account:not([data-picked])").sort(
    (a, b) => Number(a.getAttribute("cx")) - Number(b.getAttribute("cx")),
  );
  if (!scanned.length) throw new Error("lp-story-context: missing the accounts to scan");
  const lit = getComputedStyle(center).fill;
  const unlit = getComputedStyle(scanned[0]).fill;
  const thinking = $('.lp-sk-name[data-node="thinking"]');
  const exitWire = $<SVGPathElement>('.lp-sk-wires g[data-node="exit"] path');
  const pick = $<SVGCircleElement>(".lp-sctx-pick");
  const pickR = Number(pick.getAttribute("r"));
  const pickLabels = [$('.lp-sk-name[data-node="pick"]'), $('.lp-sk-name[data-node="pick-name"]')];
  const play = {
    wire: $<SVGPathElement>('.lp-sk-wires g[data-node="play"] path'),
    stop: $<SVGCircleElement>(".lp-sctx-play"),
    mark: $<SVGPathElement>(".lp-sctx-play-mark"),
    labels: [$('.lp-sk-name[data-node="play"]'), $('.lp-sk-name[data-node="play-name"]')],
  };
  const playR = Number(play.stop.getAttribute("r"));
  const loop = {
    wire: $<SVGPathElement>('.lp-sk-wires g[data-node="loop"] path:not(.lp-sctx-arrow)'),
    arrow: $<SVGPathElement>(".lp-sctx-arrow"),
    label: $('.lp-sk-name[data-node="loop"]'),
  };

  const tl = gsap.timeline({ paused: true });

  /* ── frame 0 = the cue: the centre and the accounts; the inputs, the wires, the pick, the Play
     and the loop wait. Each block leaves a composed picture: the END less what is hidden so far ── */
  skHideR([...inputs.flatMap(({ stop }) => (stop ? [stop] : [])), pick, play.stop]);
  skHidePop(inputs.flatMap(({ stop, body }) => (stop ? [] : [body])));
  gsap.set(play.mark, { opacity: 0 });
  yield;
  skHideRise([...inputs.map(({ label }) => label), thinking, ...pickLabels, ...play.labels, loop.label], LABEL_RISE);
  yield;
  inputs.forEach(({ wire }) => skHideWire(wire));
  skHideWire(exitWire);
  skHideWire(play.wire);
  skHideWire(loop.wire);
  skHideWire(loop.arrow);
  yield;

  /* ── sense: the inputs land, each named as it lands ── */
  inputs.forEach(({ stop, body, r, label }, i) => {
    if (stop) skStop(tl, stop, r, T.inputs[i]);
    else skPop(tl, body, T.inputs[i]);
    skRise(tl, label, T.labels[i], T.labelRise);
  });

  /* ── the read: the three wires draw into the centre together and land together: one call ── */
  inputs.forEach(({ wire }) => skWire(tl, wire, T.wires, T.wireDraw));

  /* ── thinking: "Thinking…" under the centre while the accounts light up in one sweep, left to
     right, each back to its tone (the tint let go: the CSS tone is theirs at rest) ── */
  skRise(tl, thinking, T.thinking, T.rise);
  scanned.forEach((account, i) => {
    const at = T.scan + i * T.scanStep;
    tl.to(account, { fill: lit, duration: T.scanOn, ease: "power1.out" }, at);
    tl.to(account, { fill: unlit, duration: T.scanOff, ease: "power1.inOut", clearProps: "fill" }, at + T.scanOn);
  });

  /* ── the pick: the line out draws to one account, which turns near-black as the tip reaches
     it. "Thinking…" gives way to the answer ── */
  skWire(tl, exitWire, T.exit, T.exitDraw);
  skStop(tl, pick, pickR, T.pick);
  tl.to(thinking, { autoAlpha: 0, duration: T.thinkingFade, ease: "power1.out" }, T.thinkingOut);
  pickLabels.forEach((label, i) => skRise(tl, label, T.pickLabels[i], T.rise));

  /* ── go: the Play lands, the line runs on to it; its mark switches on as the tip reaches it ── */
  skStop(tl, play.stop, playR, T.playStop);
  skWire(tl, play.wire, T.play, T.playDraw);
  tl.to(play.mark, { opacity: 1, duration: T.playMarkFade, ease: "power1.out" }, T.playMark);
  play.labels.forEach((label, i) => skRise(tl, label, T.playLabels[i], T.rise));

  /* ── the loop: it draws back over the cluster onto the centre: it remembers what worked ── */
  skWire(tl, loop.wire, T.loop, T.loopDraw);
  skWire(tl, loop.arrow, T.arrow, T.arrowDraw);
  skRise(tl, loop.label, T.loopLabel, T.loopRise);

  // the END holds until T.end
  tl.set({}, {}, T.end);
  // the beats, by name (the shell's pose() and the harness take them)
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  // the caller's revert restores the server markup on its own (the kit's verbs, and the tweens
  // above, which start from the markup's values): nothing to clean up
  return { tl, cleanup: () => {}, cue: 0 };
}
