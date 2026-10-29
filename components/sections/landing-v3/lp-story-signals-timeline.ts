import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
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
 * Deep-dive story "signals" (block 2, "Buying signal + enrichment") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Founder, 2026-10-28: "ban UI things from motions and
 * try to abstract things … graphic simple and on brand (you can reuse components)", then "no UI
 * should not mean text it should mean abstraction of what our infrastructure does". The picture
 * is one flow (LpStorySignals.tsx): six providers into Pancake's point, four signals out of it.
 * The providers' half moves as the hub he loves did (lp-story-sources-timeline.ts at 630bb8e,
 * scene D): each wire draws into the near-black dot, the two behind the funding
 * first, then the four others 0.28 s apart; here brisker (0.5 s draws, and the four others start
 * as the second lands instead of 0.9 s later). Then the hub gives out: four wires draw out of it
 * 0.12 s apart, each stop lands as its wire arrives and its label rises; the count rises last.
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the
 * first composed scene: 0, the providers with their names and the confetti, never an empty frame.
 * Every verb is the kit's (lp-story-kit.ts): this file places them in time.
 * No "use client" on purpose: reached only through DIVE_LOADERS.signals (lp-dive-loaders.ts,
 * lazy chunk).
 *
 * Times (s), the T table below. 3.75 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: the six providers with their names and the confetti, in
 *              their END places; no wire, no hub, no output yet
 *   0.30–0.80  Dealroom: its wire draws into the hub point
 *   0.55–1.05  TheirStack, the same (the two behind the funding, 0.25 s apart)
 *   0.70–0.95  the hub dot lands as the first wire arrives
 *   1.05       f2: the two wires in
 *   1.05–2.39  Wappalyzer, Apify, Firecrawl, Coresignal: a wire each, 0.28 s apart (the
 *              loved spacing), the first as TheirStack's wire lands
 *   2.39       f3: every provider's wire in
 *   2.39–3.60  Hiring, Funding, Site visits, Work email: each wire draws out of the hub in
 *              0.45 s, 0.12 s apart, the first as Coresignal's lands; its stop lands 0.1 s
 *              before the wire arrives (0.35 s), its label rises (y 8 → 0, 0.4 s) as it arrives
 *   3.30–3.70  "30+ data providers" rises (y 8 → 0), the last to start
 *   3.60       f4: every output in (the count all but risen)
 *   3.75       f5: the END = the server markup
 *
 * Until the same evening the story ended on a big claim ("WHY THEY FIT" over "Just raised", the
 * display face at 72 px) and, before that, opened on it zoomed ×2; the founder: "this is not
 * motion like it's plain text", then "Still a huge text".
 *
 * Nothing that rests moves: the discs, the names and the confetti stand from frame 0. The labels
 * rise by the kit's variable, let go SK_LANDED after they land (skRise), so they rest
 * untransformed. The hub dot and the stops land by their `r` attribute.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** each provider's wire, by data-order: the two behind the funding 0.25 s apart, then
      the four others 0.28 s apart from the moment the second lands (0.55 + 0.5) */
  draw: [0.3, 0.55, 1.05, 1.33, 1.61, 1.89],
  /** the hub dot, 0.1 s before the first wire lands (0.8) */
  dot: 0.7,
  /** the two wires behind the funding are in (0.55 + 0.5) */
  f2: 1.05,
  /** every provider's wire is in (1.89 + 0.5) */
  f3: 2.39,
  /** each output's wire leaves the hub, top to bottom, 0.12 s apart, the first as the last
      provider's lands */
  out: [2.39, 2.51, 2.63, 2.75],
  /** the count label's rise starts, after the last output's label (3.20) */
  label: 3.3,
  /** the last output's label has risen (2.75 + 0.45 + 0.4) */
  f4: 3.6,
  end: 3.75,
} as const;
/** a provider's wire draws in this long (the kit's 0.6 s, brisker) */
const DRAW = 0.5;
/** past the drawn six (a provider added to the data): one more every 0.28 s */
const DRAW_GAP = 0.28;
/** an output's wire draws in this long (a short wire) … */
const OUT_DRAW = 0.45;
/** … past the four (an output added to the data): one more every 0.12 s */
const OUT_GAP = 0.12;
/** its stop lands this long before the wire arrives (the lineage stop's lead), its label as the
    wire arrives */
const STOP_LEAD = 0.1;
/** the labels' rise: from 8 px below their place in 0.4 s (the kit's skRise; the old message
    story's rise, lp-story-message-timeline.ts:372 at 630bb8e) */
const RISE = { y: 8, duration: 0.4 } as const;

/** The builder in one go. In slices: `buildStorySignalsSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and what
    it reads (the stops' radius, the wires' lengths) depends on nothing it writes. */
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
  const wires = Array.from({ length: count }, (_, k) => ({
    path: $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] path`),
  }));
  const hub = $<SVGCircleElement>(".lp-sk-hub");
  // the outputs, top to bottom (the markup's order = the draw order)
  const outs = $$<SVGGElement>(".lp-sk-wires g[data-out]").map((g) => {
    const id = g.getAttribute("data-out");
    return {
      path: $<SVGPathElement>(`.lp-sk-wires g[data-out="${id}"] path`),
      stop: $<SVGCircleElement>(`.lp-sk-wires .lp-ssig-stop[data-out="${id}"]`),
      text: $(`.lp-ssig-out[data-out="${id}"]`),
    };
  });
  // each stop lands on the markup's radius (the END picture's): read before frame 0 writes it
  const stopR = outs.map(({ stop }) => Number(stop.getAttribute("r")));
  const label = $(".lp-ssig-count");

  /* ── frame 0 (the markup rests on the end picture). Each block leaves a composed picture, the
     END less what is hidden so far ── */
  skHideR([hub, ...outs.map((out) => out.stop)]);
  yield;
  wires.forEach((wire) => skHideWire(wire.path));
  outs.forEach((out) => skHideWire(out.path));
  yield;
  skHideRise([...outs.map((out) => out.text), label], RISE.y);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── the providers' wires, one by one into the hub point; the dot lands with the first ── */
  wires.forEach(({ path }, k) => {
    const at = T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
    skWire(tl, path, at, DRAW);
  });
  skDot(tl, hub, T.dot);

  /* ── the outputs: out of the hub, top to bottom; each stop lands as its wire arrives ── */
  outs.forEach(({ path, stop, text }, k) => {
    const at = T.out[k] ?? T.out[T.out.length - 1] + OUT_GAP * (k - T.out.length + 1);
    skWire(tl, path, at, OUT_DRAW);
    skStop(tl, stop, stopR[k], at + OUT_DRAW - STOP_LEAD);
    skRise(tl, text, at + OUT_DRAW, RISE.duration);
  });

  /* ── the count ── */
  skRise(tl, label, T.label, RISE.duration);

  // the take ends at T.end (the carousel plays from the cue to the timeline's end, then holds)
  tl.set({}, {}, T.end);

  /* QA labels = the beats (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
