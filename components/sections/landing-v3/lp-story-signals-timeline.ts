import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skBump,
  skDot,
  skHidePulse,
  skHideR,
  skHideRise,
  skHideWire,
  skPulse,
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
 *
 * The motion (2026-10-30, founder: make the four stories juicier, graphic and simple, with a
 * moment that moves the reader; then "the 4 blocks of the deep dive are the right ones but i am
 * looking for ideas to improve motions"): everything flows into one point, then leaves as
 * signals. Two patterns, drawn flat with the kit's verbs:
 *   the marble run   each provider's wire draws into the hub as before; as it lands, a near-black
 *                    pulse (the data) leaves the disc and rides it in, and the hub takes the hit.
 *                    One provider every 0.46 s, a steady beat: the length of the kit's bump, so
 *                    each hit has settled as the next lands (two tweens on one radius never
 *                    overlap: seek-safe forward and back)
 *   status lights    the four stops wait unlit (the wires' grey) at the end of their routes; after
 *                    a held beat the hub gathers and pumps, and four pulses in the stops' own
 *                    tones ride out one after another; each light switches on as its pulse meets
 *                    it (grey to its colour, the bump is the switch), its label rising a beat
 *                    later. Grey data in, coloured signals out: the colour first shows as the
 *                    signals leave the hub. That is the one moment.
 * The craft, picked so it reads and stays quiet: overlap (each pulse leaves before its wire has
 * landed; the routes draw as the last pulse rides in), anticipation (the hub's radius dips before
 * its pump), slow in and out (the kit's eases, the dip's power2.inOut), follow-through (a label a
 * beat after its light) and rhythm (a steady beat in, a held beat, a quick run of four out).
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the
 * first composed scene: 0, the providers with their names and the confetti, never an empty frame.
 * Every move is a kit verb (lp-story-kit.ts) but two plain tweens: the hub's dip (its `r`) and a
 * light's switch (its `fill`, from the grey set at frame 0 to the lit colour read from the
 * markup, so the END paints the same). No "use client" on purpose: reached only through
 * DIVE_LOADERS.signals (lp-dive-loaders.ts, lazy chunk).
 *
 * Times (s), the T table below. 5.3 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: the six providers with their names and the confetti, in
 *              their END places; no wire, no hub, no output yet
 *   0.30–3.46  the marble run in, one provider every 0.46 s in data-order (Dealroom 0.30,
 *              TheirStack 0.76, Wappalyzer 1.22, Apify 1.68, Firecrawl 2.14, Coresignal 2.60):
 *              its wire draws into the hub point in 0.5 s; 0.4 s in, its pulse leaves the disc
 *              and rides in for 0.46 s (Coresignal's passes under TheirStack's disc with its
 *              wire); 0.77 s in, as the pulse's front meets the dot, the hub takes the hit
 *              (skBump ×1.35, 0.46 s): hits at 1.07, 1.53, 1.99, 2.45, 2.91, 3.37
 *   0.70–0.95  the hub dot lands as the first wire arrives (0.8)
 *   1.53       f2: the two behind the funding are in (TheirStack's hit)
 *   3.06–3.76  the routes out, on the beat after Coresignal's: the four wires draw out of the hub
 *              at once (0.45 s) as the last pulse rides in; each stop lands unlit, in the wires'
 *              grey, 0.1 s before its wire arrives (0.35 s)
 *   3.83       f3: the held beat: every provider's data is in, the last hit has settled, four
 *              lights wait unlit
 *   3.83–4.00  the hub gathers: its radius dips to 0.8 (slow in and out) …
 *   4.00–4.46  … and pumps (×1.6) as the first signal leaves
 *   4.00–4.82  the status lights: a pulse in each stop's own tone rides out of the hub (0.4 s), one
 *              every 0.14 s, Hiring, Funding, Site visits, Work email; each light switches on as
 *              its pulse meets it (0.31 s in: 4.31, 4.45, 4.59, 4.73), grey to its colour in
 *              0.08 s with a bump (×1.3, 0.46 s), and its label rises 0.05 s later (y 8 → 0, 0.4 s)
 *   4.85–5.25  "30+ data providers" rises (y 8 → 0), the last to start
 *   5.19       f4: every light on and settled, every label risen (the count all but risen)
 *   5.30       f5: the END = the server markup
 *
 * Until 2026-10-30 the wires only drew (3.75 s: the providers' wires into the dot, the two behind
 * the funding first, then four wires out to stops landing in colour). Until 2026-10-28 evening
 * the story ended on a big claim ("WHY THEY FIT" over "Just raised", the display face at 72 px)
 * and, before that, opened on it zoomed ×2; the founder: "this is not motion like it's plain
 * text", then "Still a huge text".
 *
 * Nothing that rests moves: the discs, the names and the confetti stand from frame 0. The labels
 * rise by the kit's variable, let go SK_LANDED after they land (skRise), so they rest
 * untransformed. The hub dot and the stops land and bump by their `r` attribute; the pulses only
 * ever show while they ride (skPulse hides each at the end of its ride).
 */

/** the take, in seconds (see the table above), for the six providers and four outputs drawn */
const T = {
  f1: 0,
  /** each provider's wire, by data-order: one every CADENCE from 0.3 */
  draw: [0.3, 0.76, 1.22, 1.68, 2.14, 2.6],
  /** the hub dot, 0.1 s before the first wire lands (0.8) */
  dot: 0.7,
  /** the two behind the funding are in: TheirStack's hit (0.76 + HIT) */
  f2: 1.53,
  /** the routes out draw on the beat after the last provider's (2.6 + CADENCE) */
  routes: 3.06,
  /** the held beat: the last hit (2.6 + HIT = 3.37) has settled (+ 0.46); the hub gathers from
      here to the release */
  f3: 3.83,
  /** the hub lets go: its pump, and the first signal leaves */
  release: 4.0,
  /** each signal leaves the hub, top to bottom, one every OUT_GAP; the first with the pump */
  out: [4.0, 4.14, 4.28, 4.42],
  /** the count's rise starts, after the last label's (4.42 + SWITCH + FOLLOW = 4.78) */
  label: 4.85,
  /** the last light has settled (4.42 + SWITCH + 0.46) and its label risen */
  f4: 5.19,
  end: 5.3,
} as const;
/** a provider's wire draws in this long (the kit's 0.6 s, brisker) */
const DRAW = 0.5;
/** one provider every CADENCE: the kit's bump (skBump, 0.12 + 0.34 s), so each hit on the hub
    has settled as the next lands; past the drawn six, one more every beat */
const CADENCE = 0.46;
/** a provider's pulse leaves its disc this long after its wire starts (0.1 s before the wire
    lands) and rides in this long (= the cadence: one leaves as the one before is swallowed) */
const RIDE_AT = 0.4;
const RIDE_IN = 0.46;
/** the hub takes the hit this long after the wire starts: as the pulse's front meets the dot
    (0.8 of the ride; 0.78–0.83 by the wires' lengths) */
const HIT = 0.77;
/** an output's wire draws in this long (a short wire); its stop lands STOP_LEAD before it
    arrives (the lineage stop's lead) */
const OUT_DRAW = 0.45;
const STOP_LEAD = 0.1;
/** a signal rides out in this long; past the four outputs (one added to the data), one more
    every OUT_GAP */
const RIDE_OUT = 0.4;
const OUT_GAP = 0.14;
/** a light switches on this long after its signal leaves, as the signal's front meets the stop
    (0.73–0.76 of the ride): its colour in FLIP s, and its bump */
const SWITCH = 0.31;
const FLIP = 0.08;
/** the bumps' swell (the kit's arrival hit is ×1.35): a light's switch, the hub's pump */
const LIGHT = 1.3;
const PUMP = 1.6;
/** the hub's radius during the held beat, × its own (the anticipation before the pump) */
const GATHER = 0.8;
/** a label rises this long after its light switches on (follow-through) */
const FOLLOW = 0.05;
/** the labels' rise: from 8 px below their place in 0.4 s (the kit's skRise; the old message
    story's rise, lp-story-message-timeline.ts:372 at 630bb8e) */
const RISE = { y: 8, duration: 0.4 } as const;

/** The builder in one go. In slices: `buildStorySignalsSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and what
    it reads (the dots' radii, the lit colours, the wires' lengths) it reads before it writes. */
export function buildStorySignals(root: HTMLElement): BuiltStory {
  const steps = buildStorySignalsSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStorySignalsSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "signals");

  // the providers' wires in reveal order (data-order 0…n−1, from the data's `order`), each with
  // its pulse (the copy of its path after it in its <g>)
  const count = $$(".lp-sk-wires g[data-node][data-order]").length;
  const wires = Array.from({ length: count }, (_, k) => ({
    path: $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] path:not(.lp-sk-pulse)`),
    pulse: $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] .lp-sk-pulse`),
  }));
  const hub = $<SVGCircleElement>(".lp-sk-hub");
  // the outputs, top to bottom (the markup's order = the order the lights switch on)
  const outs = $$<SVGGElement>(".lp-sk-wires g[data-out]").map((g) => {
    const id = g.getAttribute("data-out");
    return {
      path: $<SVGPathElement>(`.lp-sk-wires g[data-out="${id}"] path:not(.lp-sk-pulse)`),
      pulse: $<SVGPathElement>(`.lp-sk-wires g[data-out="${id}"] .lp-sk-pulse`),
      stop: $<SVGCircleElement>(`.lp-sk-wires .lp-ssig-stop[data-out="${id}"]`),
      text: $(`.lp-ssig-out[data-out="${id}"]`),
    };
  });
  const label = $(".lp-ssig-count");
  // read before frame 0 writes them: the radii the dots land on and settle back to (the END
  // picture's), each stop's lit colour (its inline brand token, computed) and the unlit grey (the
  // kit's wire grey, story-kit.css --sk-wire)
  const hubR = Number(hub.getAttribute("r"));
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
  wires.forEach((wire) => skHideWire(wire.path));
  outs.forEach((out) => skHideWire(out.path));
  yield;
  // the pulses rest hidden (story-kit.css); this sets their dash and returns each path's length
  const inLen = wires.map((wire) => skHidePulse(wire.pulse));
  const outLen = outs.map((out) => skHidePulse(out.pulse));
  skHideRise([...outs.map((out) => out.text), label], RISE.y);
  yield;

  const tl = gsap.timeline({ paused: true });
  // a provider or an output past the drawn ones moves everything after it by one beat
  const late = Math.max(0, count - T.draw.length) * CADENCE;
  const more = Math.max(0, outs.length - T.out.length) * OUT_GAP;

  /* ── the marble run in: each wire draws into the hub point; as it lands its pulse (the data)
     leaves the disc and rides it in, and the hub takes the hit ── */
  wires.forEach(({ path, pulse }, k) => {
    const at = T.draw[k] ?? T.draw[T.draw.length - 1] + CADENCE * (k - T.draw.length + 1);
    skWire(tl, path, at, DRAW);
    skPulse(tl, pulse, inLen[k], at + RIDE_AT, RIDE_IN);
    skBump(tl, hub, hubR, at + HIT);
  });
  skDot(tl, hub, T.dot);

  /* ── the routes out, on the next beat: four wires draw out of the hub at once, each stop
     lands unlit (the grey set at frame 0) as its wire arrives ── */
  outs.forEach(({ path, stop }, k) => {
    skWire(tl, path, T.routes + late, OUT_DRAW);
    skStop(tl, stop, stopR[k], T.routes + late + OUT_DRAW - STOP_LEAD);
  });

  /* ── the held beat: the hub gathers (its radius dips, slow in and out) … ── */
  tl.to(hub, { attr: { r: hubR * GATHER }, duration: T.release - T.f3, ease: "power2.inOut" }, T.f3 + late);
  /* ── … and lets go: it pumps as the first signal leaves ── */
  skBump(tl, hub, hubR, T.release + late, PUMP);

  /* ── the status lights: a signal in each stop's own tone rides out, one after another; its
     light switches on as it arrives (grey to the lit colour, a bump), its label a beat later ── */
  outs.forEach(({ pulse, stop, text }, k) => {
    const at = late + (T.out[k] ?? T.out[T.out.length - 1] + OUT_GAP * (k - T.out.length + 1));
    skPulse(tl, pulse, outLen[k], at, RIDE_OUT);
    tl.to(stop, { fill: lit[k], duration: FLIP, ease: "none" }, at + SWITCH);
    skBump(tl, stop, stopR[k], at + SWITCH, LIGHT);
    skRise(tl, text, at + SWITCH + FOLLOW, RISE.duration);
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
