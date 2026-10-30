import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { skDot, skHideR, skHideRise, skHideWire, skQuery, skRise, skStop, skWire } from "./lp-story-kit";

/**
 * Deep-dive story "signals" (block 2, "Buying signal + enrichment") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Founder, 2026-10-28: "ban UI things from motions and
 * try to abstract things … graphic simple and on brand (you can reuse components)", then "no UI
 * should not mean text it should mean abstraction of what our infrastructure does". The picture
 * is one flow (LpStorySignals.tsx): six providers into Pancake's point, four signals out of it.
 *
 * The motion (2026-10-30, founder: make the four stories juicier, graphic and simple, with a
 * moment that moves the reader; then "the 4 blocks of the deep dive are the right ones but i am
 * looking for ideas to improve motions"): everything flows into one point, then leaves as
 * signals. Nothing travels but a wire drawing itself once (the same evening, on pulses that rode
 * the wires: "pas sur des signaux qui voyagent ca fait un peu sloppy"), and nothing bounces (then,
 * on the dots that swelled as a wire reached them: "j aime pas trop les effets de bounce que tu
 * mets a chaque fois"): a node appears once and holds still. So the wires draw in one by one,
 * the routes out draw to four stops that land unlit (the wires' grey), and after a held beat the
 * stops switch on like status lights, top to bottom, grey to each one's colour, each label rising
 * a beat later. Grey data in, coloured signals out: that is the one moment. The craft, kept to
 * what reads quietly: overlap (the routes start as the last wire reaches the hub), slow out (the
 * kit's eases), follow-through (a label a beat after its light) and rhythm (the loved spacing in,
 * a held beat, a quick run of four lights).
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the
 * first composed scene: 0, the providers with their names and the confetti, never an empty frame.
 * Every move is a kit verb (lp-story-kit.ts) but one plain tween: a light's switch (its `fill`,
 * from the grey set at frame 0 to the lit colour read from the markup, so the END paints the
 * same). No "use client" on purpose: reached only through DIVE_LOADERS.signals
 * (lp-dive-loaders.ts, lazy chunk).
 *
 * Times (s), the T table below. 4.3 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: the six providers with their names and the confetti, in
 *              their END places; no wire, no hub, no output yet
 *   0.30–0.80  Dealroom: its wire draws into the hub point
 *   0.55–1.05  TheirStack, the same (the two behind the funding, 0.25 s apart)
 *   0.70–0.95  the hub dot lands as the first wire's tip reaches it (0.1 s before the wire's end:
 *              the last 5 px run under the dot)
 *   1.05       f2: the two wires in
 *   1.05–2.39  Wappalyzer, Apify, Firecrawl, Coresignal: a wire each, 0.28 s apart (the loved
 *              spacing), the first as TheirStack's wire lands
 *   2.29–2.99  the routes out: as Coresignal's tip reaches the hub, the four wires draw out of it
 *              at once (0.45 s); each stop lands unlit, in the wires' grey, as the tip reaches its
 *              edge, 0.1 s before the wire's end (0.35 s)
 *   2.99       f3: the held beat: every wire is in, four lights wait unlit (0.3 s, nothing moves)
 *   3.29–3.79  the status lights, top to bottom, one every 0.14 s (3.29, 3.43, 3.57, 3.71: Hiring,
 *              Funding, Site visits, Work email): grey to its colour in 0.08 s; its label rises
 *              0.05 s later (y 8 → 0, 0.4 s)
 *   3.83–4.23  "30+ data providers" rises (y 8 → 0), the last to start
 *   4.17       f4: every light on, every label risen (the count all but risen)
 *   4.30       f5: the END = the server markup
 *
 * Until 2026-10-30 the wires only drew (3.75 s: the same draws, then four wires out to stops
 * landing in colour); that day a pulse rode each wire for a few hours (5.3 s), then each wire's
 * arrival swelled the hub and the lights swelled as they switched on (5.1 s), both dropped as
 * above. Until 2026-10-28 evening the story ended on a big claim ("WHY THEY FIT" over "Just
 * raised", the display face at 72 px) and, before that, opened on it zoomed ×2; the founder:
 * "this is not motion like it's plain text", then "Still a huge text".
 *
 * Nothing that rests moves: the discs, the names and the confetti stand from frame 0. The labels
 * rise by the kit's variable, let go SK_LANDED after they land (skRise), so they rest
 * untransformed. The hub dot and the stops land by their `r` attribute and hold still; a light
 * switches by its fill.
 */

/** the take, in seconds (see the table above), for the six providers and four outputs drawn */
const T = {
  f1: 0,
  /** each provider's wire, by data-order: the two behind the funding 0.25 s apart, then the four
      others DRAW_GAP apart from the moment the second lands (0.55 + 0.5) */
  draw: [0.3, 0.55, 1.05, 1.33, 1.61, 1.89],
  /** the hub dot lands as the first wire's tip reaches it: 0.39–0.41 s into a 0.5 s draw
      (power2.inOut), the last 5 px run under the dot, so 0.4 s in (0.3 + 0.4) */
  dot: 0.7,
  /** the two wires behind the funding are in (0.55 + 0.5) */
  f2: 1.05,
  /** the routes out draw as the last wire's tip reaches the hub (1.89 + 0.4) */
  routes: 2.29,
  /** the held beat: the stops have landed (2.29 + 0.45 − 0.1 + 0.35) */
  f3: 2.99,
  /** each light switches on, top to bottom, one every LIGHT_GAP, after a 0.3 s hold */
  lights: [3.29, 3.43, 3.57, 3.71],
  /** the count's rise starts, after the last label's (3.71 + FOLLOW = 3.76) */
  label: 3.83,
  /** the last label has risen (3.76 + 0.4 + SK_LANDED) */
  f4: 4.17,
  end: 4.3,
} as const;
/** a provider's wire draws in this long (the kit's 0.6 s, brisker) … */
const DRAW = 0.5;
/** … past the drawn six (a provider added to the data), one more every 0.28 s */
const DRAW_GAP = 0.28;
/** an output's wire draws in this long (a short wire); its stop lands STOP_LEAD before it
    arrives, as the tip reaches the stop's edge (the lineage stop's lead) */
const OUT_DRAW = 0.45;
const STOP_LEAD = 0.1;
/** past the four outputs (one added to the data), one more light every LIGHT_GAP */
const LIGHT_GAP = 0.14;
/** a light's colour switch, grey to lit */
const FLIP = 0.08;
/** a label rises this long after its light switches on (follow-through) */
const FOLLOW = 0.05;
/** the labels' rise: from 8 px below their place in 0.4 s (the kit's skRise; the old message
    story's rise, lp-story-message-timeline.ts:372 at 630bb8e) */
const RISE = { y: 8, duration: 0.4 } as const;

/** The builder in one go. In slices: `buildStorySignalsSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and what
    it reads (the stops' radius, the lit colours, the wires' lengths) it reads before it writes. */
export function buildStorySignals(root: HTMLElement): BuiltStory {
  const steps = buildStorySignalsSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStorySignalsSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "signals");

  // the providers' wires in reveal order (data-order 0…n−1, from the data's `order`)
  const count = $$(".lp-sk-wires g[data-node][data-order]").length;
  const wires = Array.from({ length: count }, (_, k) =>
    $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] path`),
  );
  const hub = $<SVGCircleElement>(".lp-sk-hub");
  // the outputs, top to bottom (the markup's order = the order the lights switch on)
  const outs = $$<SVGGElement>(".lp-sk-wires g[data-out]").map((g) => {
    const id = g.getAttribute("data-out");
    return {
      path: $<SVGPathElement>(`.lp-sk-wires g[data-out="${id}"] path`),
      stop: $<SVGCircleElement>(`.lp-sk-wires .lp-ssig-stop[data-out="${id}"]`),
      text: $(`.lp-ssig-out[data-out="${id}"]`),
    };
  });
  const label = $(".lp-ssig-count");
  // read before frame 0 writes them: the radius each stop lands on (the END picture's), its lit
  // colour (its inline brand token, computed) and the unlit grey (the kit's wire grey,
  // story-kit.css --sk-wire)
  const stopR = outs.map(({ stop }) => Number(stop.getAttribute("r")));
  const lit = outs.map(({ stop }) => getComputedStyle(stop).fill);
  const unlit = getComputedStyle(root).getPropertyValue("--sk-wire").trim() || "#969696";

  /* ── frame 0 (the markup rests on the end picture). Each block leaves a composed picture, the
     END less what is hidden so far ── */
  skHideR([hub, ...outs.map((out) => out.stop)]);
  gsap.set(
    outs.map((out) => out.stop),
    { fill: unlit },
  );
  yield;
  wires.forEach((path) => skHideWire(path));
  outs.forEach((out) => skHideWire(out.path));
  yield;
  skHideRise([...outs.map((out) => out.text), label], RISE.y);
  yield;

  const tl = gsap.timeline({ paused: true });
  // a provider or an output past the drawn ones moves everything after it
  const late = Math.max(0, count - T.draw.length) * DRAW_GAP;
  const more = Math.max(0, outs.length - T.lights.length) * LIGHT_GAP;

  /* ── the providers' wires, one by one into the hub point; the dot lands with the first ── */
  wires.forEach((path, k) => {
    const at = T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
    skWire(tl, path, at, DRAW);
  });
  skDot(tl, hub, T.dot);

  /* ── the routes out: four wires draw out of the hub at once, each stop lands unlit (the grey
     set at frame 0) as the tip reaches it ── */
  outs.forEach(({ path, stop }, k) => {
    skWire(tl, path, T.routes + late, OUT_DRAW);
    skStop(tl, stop, stopR[k], T.routes + late + OUT_DRAW - STOP_LEAD);
  });

  /* ── the held beat, then the status lights, top to bottom: grey to the lit colour, the label a
     beat later ── */
  outs.forEach(({ stop, text }, k) => {
    const at = late + (T.lights[k] ?? T.lights[T.lights.length - 1] + LIGHT_GAP * (k - T.lights.length + 1));
    tl.to(stop, { fill: lit[k], duration: FLIP, ease: "none" }, at);
    skRise(tl, text, at + FOLLOW, RISE.duration);
  });

  /* ── the count, the last to start ── */
  skRise(tl, label, T.label + late + more, RISE.duration);

  // the take ends at T.end (the carousel plays from the cue to the timeline's end, then holds)
  tl.set({}, {}, T.end + late + more);

  /* QA labels = the beats (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1)
    .addLabel("f2", T.f2)
    .addLabel("f3", T.f3 + late)
    .addLabel("f4", T.f4 + late + more)
    .addLabel("f5", T.end + late + more);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
