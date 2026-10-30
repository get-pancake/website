import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skBump,
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
 * sloppy". So nothing travels but a wire drawing itself, once, and a node reacts as the wire's
 * drawing tip reaches it. Three generic patterns, drawn flat: a thinking beat that resolves into
 * its answer and a chosen card that lifts (founder: "very good idea"), status lights switching on
 * in order (the scan). And the craft: the release is held a beat and wound up before it goes, the
 * climax is held before the next move, the labels follow through after their hit, each move
 * starts as the last one settles.
 *
 * So: the three wires draw into the centre together and it takes one hit as their tips reach it
 * (one call). The agent thinks: "Thinking…" under the centre while the nine accounts light up in
 * one sweep. It decides: the centre winds up and lets the line out go; the picked account turns
 * near-black as the line comes and lifts as its tip reaches it, the take's strongest hit (the
 * decisive pick), and "Thinking…" gives way to "Which account". It acts: the line runs on to the
 * Play, which takes the hit and switches on its mark. It learns: the loop draws back over the
 * cluster and the centre takes a last hit. Every move is a kit verb (a stop lands, a disc pops, a
 * wire draws, a name rises, a dot takes a hit) or a plain tween on an `r` or a `fill`, played
 * once. No dot lands on a node's edge (founder 2026-10-28: "ca fait un peu vibe coded"); no glow,
 * ring, loop or ambient move. Times (s), the T table below:
 *
 *   0.00       f1: frame 0 = the cue: the plum centre and the accounts, in their END places
 *   0.30–0.95  the inputs land 0.1 s apart: ICP and Voice (a stop: r 0 → 16), then the CRM (its
 *              disc pops); each label rises (y 6 → 0) 0.08 s after its input
 *   0.95       f2: the three inputs are in
 *   0.95–1.40  the read: the three wires draw into the centre together (0.45 s); their tips reach
 *              its edge together (1.26–1.27) and it takes the hit (1.27, ×1.2): one call
 *   1.45–2.33  thinking: "Thinking…" rises under the centre (1.45); the nine accounts light up in
 *              one sweep, left to right, 0.05 s apart (1.53–2.33: ink-60 → the centre's plum in
 *              0.1 s, back in 0.3 s)
 *   2.33       f3: read, thinking. The beat held before the release
 *   2.34–2.76  the wind-up: the centre dips (r × 0.93), then springs back (2.46, 0.3 s)
 *   2.46–2.92  the pick: the near-black dot grows over the picked account (2.46, 0.35 s) as the
 *              line out draws to it (2.52, 0.4 s); the line's tip reaches the dot's edge at 2.81
 *   2.81–3.28  the chosen one lifts as the tip reaches it: the take's strongest hit (2.82, ×1.5);
 *              "Thinking…" fades (2.81), "Which account" and its name rise (2.88, 2.94). The
 *              climax holds ~0.3 s from its peak (2.94) before the next move
 *   3.23–3.73  go: the Play's stop lands (3.23, r 0 → 18) and the line runs on from the near-black
 *              dot's edge (3.28, 0.45 s); its tip reaches the stop's edge at 3.59
 *   3.60–4.07  the Play takes the hit (×1.25) and switches on its mark (0.2 s); "Which Play" and its
 *              name rise (3.66, 3.72)
 *   4.01       f4: which account, which Play
 *   4.01–4.84  the loop draws from the Play's top back over the cluster (0.7 s); its arrowhead
 *              draws as it lands (4.69–4.84)
 *   4.69–5.15  the loop's tip lands over the centre, which takes a last hit (×1.2): it learned;
 *              "Remembers what worked" rises (4.69)
 *   5.20       f5 = the END = the server markup (the carousel then holds it)
 *
 * A wire into a dot ends in the dot's middle, under it: its drawing tip reaches the dot's edge
 * before the draw ends, once the kit's draw (power2.inOut, (len + 1) × its progress) has covered
 * len − r. Worked out from the lengths in lp-story-context-data.ts, each hit starts there and
 * peaks as the draw ends. The loop ends in the open, over the centre: its hit starts as its tip
 * settles, with the arrowhead. Two tweens on one `r` never overlap: each hit starts once its dot
 * has landed.
 *
 * Never moves: the accounts' places (the scan only tints them, and lets go of the tint), every
 * dot once it has landed and taken its hit. The dots animate their `r` attribute, never a
 * transform; the Play's mark fades in (opacity); the disc's pop and the labels' rise go by the
 * kit's variables and let go of them SK_LANDED after they land (skPop, skRise), so nothing rests
 * transformed. "Thinking…" ends faded, as its CSS keeps it at rest.
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
  /** the centre takes the hit as the tips reach it */
  readBump: 1.27,
  /** "Thinking…" rises under the centre as that hit settles */
  thinking: 1.45,
  /** the scan: the nine accounts, left to right, each lit `scanStep` after the one before,
      lit in `scanOn`, back in `scanOff` (the last is back at 1.53 + 8 × 0.05 + 0.4 = 2.33) */
  scan: 1.53,
  scanStep: 0.05,
  scanOn: 0.1,
  scanOff: 0.3,
  /** read, thinking: the held beat */
  f3: 2.33,
  /** the wind-up: the centre dips, then springs back just before the line out starts, so the
      line meets a full-size centre */
  windUp: 2.34,
  windUpDip: 0.12,
  release: 2.46,
  releaseBack: 0.3,
  /** the near-black dot grows over the picked account (landed at 2.81) */
  pick: 2.46,
  /** the line out, from the centre's edge to the picked account (145 px, ending 12 px past the
      dot's edge): its tip reaches the dot at 2.807 */
  exit: 2.52,
  exitDraw: 0.4,
  /** the chosen one lifts as the tip reaches it, once it has landed */
  pickBump: 2.82,
  /** "Thinking…" gives way as the line lands */
  thinkingOut: 2.81,
  thinkingFade: 0.25,
  /** "Which account", then the account's name */
  pickLabels: [2.88, 2.94],
  rise: 0.35,
  /** the Play's stop lands as the line on starts (landed at 3.58) */
  playStop: 3.23,
  /** the line on, from the near-black dot's edge to the Play (163 px, ending 18 px past the
      stop's edge): its tip reaches the stop at 3.592 */
  play: 3.28,
  playDraw: 0.45,
  /** the Play takes the hit; its mark switches on with it */
  playBump: 3.6,
  playMark: 3.6,
  playMarkFade: 0.2,
  /** "Which Play", then the Play's name */
  playLabels: [3.66, 3.72],
  /** which account, which Play: the loop has not shown yet (it does at 4.03) */
  f4: 4.01,
  /** the loop: it draws from the Play's top back over the cluster; its arrowhead draws as it
      lands (0.02 s before its end, 0.15 s long) */
  loop: 4.01,
  loopDraw: 0.7,
  arrow: 4.69,
  arrowDraw: 0.15,
  /** the loop's tip settles over the centre (4.65–4.71): the centre's last hit, and "Remembers
      what worked" */
  loopBump: 4.69,
  loopLabel: 4.69,
  loopRise: 0.4,
  /** f5 = the END (the last hit settles at 5.15) */
  end: 5.2,
} as const;

/** each hit's swell (skBump's k): the pick's is the take's strongest, the chosen one lifting */
const K = { read: 1.2, pick: 1.5, play: 1.25, loop: 1.2 } as const;

/** the centre's wind-up: its radius dips to this share of its own before it lets the line go */
const WIND_UP = 0.93;

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
  const centerR = Number(center.getAttribute("r"));
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

  /* ── the read: the three wires draw into the centre together, and it takes the hit as their
     tips reach it: one call ── */
  inputs.forEach(({ wire }) => skWire(tl, wire, T.wires, T.wireDraw));
  skBump(tl, center, centerR, T.readBump, K.read);

  /* ── thinking: "Thinking…" under the centre while the accounts light up in one sweep, left to
     right, each back to its tone (the tint let go: the CSS tone is theirs at rest) ── */
  skRise(tl, thinking, T.thinking, T.rise);
  scanned.forEach((account, i) => {
    const at = T.scan + i * T.scanStep;
    tl.to(account, { fill: lit, duration: T.scanOn, ease: "power1.out" }, at);
    tl.to(account, { fill: unlit, duration: T.scanOff, ease: "power1.inOut", clearProps: "fill" }, at + T.scanOn);
  });

  /* ── the pick: the centre winds up and lets the line out go; the account turns near-black as
     it comes and lifts as its tip reaches it: the take's strongest hit. "Thinking…" gives way to
     the answer ── */
  tl.to(center, { attr: { r: centerR * WIND_UP }, duration: T.windUpDip, ease: "power2.inOut" }, T.windUp);
  tl.to(center, { attr: { r: centerR }, duration: T.releaseBack, ease: "back.out(2)" }, T.release);
  skStop(tl, pick, pickR, T.pick);
  skWire(tl, exitWire, T.exit, T.exitDraw);
  skBump(tl, pick, pickR, T.pickBump, K.pick);
  tl.to(thinking, { autoAlpha: 0, duration: T.thinkingFade, ease: "power1.out" }, T.thinkingOut);
  pickLabels.forEach((label, i) => skRise(tl, label, T.pickLabels[i], T.rise));

  /* ── go: the Play lands, the line runs on to it; it takes the hit and switches on its mark ── */
  skStop(tl, play.stop, playR, T.playStop);
  skWire(tl, play.wire, T.play, T.playDraw);
  skBump(tl, play.stop, playR, T.playBump, K.play);
  tl.to(play.mark, { opacity: 1, duration: T.playMarkFade, ease: "power1.out" }, T.playMark);
  play.labels.forEach((label, i) => skRise(tl, label, T.playLabels[i], T.rise));

  /* ── the loop: it draws back over the cluster onto the centre, which takes a last hit: it
     remembers what worked ── */
  skWire(tl, loop.wire, T.loop, T.loopDraw);
  skWire(tl, loop.arrow, T.arrow, T.arrowDraw);
  skBump(tl, center, centerR, T.loopBump, K.loop);
  skRise(tl, loop.label, T.loopLabel, T.loopRise);

  // the END holds until T.end
  tl.set({}, {}, T.end);
  // the beats, by name (the shell's pose() and the harness take them)
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  // the caller's revert restores the server markup on its own (the kit's verbs, and the tweens
  // above, which start from the markup's values): nothing to clean up
  return { tl, cleanup: () => {}, cue: 0 };
}
