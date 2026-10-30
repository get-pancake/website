import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skBump,
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
 *
 * The motion (2026-10-30, founder: make the four stories juicier, graphic and simple, with a
 * moment that moves the reader; then "the 4 blocks of the deep dive are the right ones but i am
 * looking for ideas to improve motions"): everything flows into one point, then leaves as
 * signals. Nothing travels but a wire drawing itself once: the same evening the founder, on the
 * pulses that rode the wires, "pas sur des signaux qui voyagent ca fait un peu sloppy", so a node
 * reacts as a wire's drawing tip reaches it, and the outputs switch on like status lights:
 *   the steady beat   each provider's wire draws into the hub, one every 0.46 s, and the hub takes
 *                     the hit as the wire's tip reaches it (skBump; the first wire lands it). 0.46 s
 *                     is the kit's bump, so each hit has settled as the next lands (two tweens on
 *                     one radius never overlap: seek-safe forward and back)
 *   status lights     the four routes draw out of the hub to stops that land unlit (the wires'
 *                     grey); after a held beat the hub gathers and pumps, and the lights switch on
 *                     top to bottom, grey to each one's colour with a bump (the bump is the
 *                     switch), each label rising a beat later. Grey data in, coloured signals out:
 *                     that is the one moment.
 * The craft, picked so it reads and stays quiet: overlap (the routes start as the last wire
 * lands), anticipation (the hub's radius dips before its pump), slow in and out (the kit's eases,
 * the dip's power2.inOut), follow-through (a label a beat after its light) and rhythm (a steady
 * beat in, a held beat, a quick run of four lights).
 *
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the
 * first composed scene: 0, the providers with their names and the confetti, never an empty frame.
 * Every move is a kit verb (lp-story-kit.ts) but two plain tweens: the hub's dip (its `r`) and a
 * light's switch (its `fill`, from the grey set at frame 0 to the lit colour read from the
 * markup, so the END paints the same). No "use client" on purpose: reached only through
 * DIVE_LOADERS.signals (lp-dive-loaders.ts, lazy chunk).
 *
 * Times (s), the T table below. 5.1 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: the six providers with their names and the confetti, in
 *              their END places; no wire, no hub, no output yet
 *   0.30–3.10  the steady beat, one provider every 0.46 s in data-order (Dealroom 0.30,
 *              TheirStack 0.76, Wappalyzer 1.22, Apify 1.68, Firecrawl 2.14, Coresignal 2.60):
 *              its wire draws into the hub point in 0.5 s, and 0.4 s in, as its tip reaches the
 *              dot (the last 5 px run under it), the hub reacts
 *   0.70–0.95  … the first time by landing (skDot, Dealroom's tip) …
 *   1.16–3.46  … then by a hit each (skBump ×1.35, 0.46 s): 1.16, 1.62, 2.08, 2.54, 3.00
 *   1.16       f2: the two behind the funding are in (TheirStack's hit)
 *   3.06–3.76  the routes out, on the beat after Coresignal's: the four wires draw out of the hub
 *              at once (0.45 s); each stop lands unlit, in the wires' grey, as the tip reaches its
 *              edge, 0.1 s before the wire's end (0.35 s)
 *   3.76       f3: the held beat: every wire is in, four lights wait unlit, the hub at rest
 *   3.83–4.00  the hub gathers: its radius dips to 0.8 (slow in and out) …
 *   4.00–4.46  … and pumps (×1.6)
 *   4.12–5.00  the status lights, top to bottom, one every 0.14 s from the pump's peak (4.12,
 *              4.26, 4.40, 4.54: Hiring, Funding, Site visits, Work email): grey to its colour in
 *              0.08 s with a bump (×1.3, 0.46 s); its label rises 0.05 s later (y 8 → 0, 0.4 s)
 *   4.66–5.06  "30+ data providers" rises (y 8 → 0), the last to start
 *   5.00       f4: every light on and settled, every label risen (the count all but risen)
 *   5.10       f5: the END = the server markup
 *
 * Until 2026-10-30 the wires only drew (3.75 s: the providers' wires into the dot, the two behind
 * the funding first, then four wires out to stops landing in colour); that day a pulse rode each
 * wire for a few hours (5.3 s), dropped as above. Until 2026-10-28 evening the story ended on a
 * big claim ("WHY THEY FIT" over "Just raised", the display face at 72 px) and, before that,
 * opened on it zoomed ×2; the founder: "this is not motion like it's plain text", then "Still a
 * huge text".
 *
 * Nothing that rests moves: the discs, the names and the confetti stand from frame 0. The labels
 * rise by the kit's variable, let go SK_LANDED after they land (skRise), so they rest
 * untransformed. The hub dot and the stops land and bump by their `r` attribute.
 */

/** the take, in seconds (see the table above), for the six providers and four outputs drawn */
const T = {
  f1: 0,
  /** each provider's wire, by data-order: one every CADENCE from 0.3 */
  draw: [0.3, 0.76, 1.22, 1.68, 2.14, 2.6],
  /** the hub dot lands as the first wire's tip reaches it (0.3 + HIT) */
  dot: 0.7,
  /** the two behind the funding are in: TheirStack's hit (0.76 + HIT) */
  f2: 1.16,
  /** the routes out draw on the beat after the last provider's (2.6 + CADENCE) */
  routes: 3.06,
  /** the held beat: the stops have landed (3.06 + 0.45 − 0.1 + 0.35); the hub has been at rest
      since the last hit settled (3.0 + 0.46) */
  f3: 3.76,
  /** the hub gathers from here … */
  dip: 3.83,
  /** … to its pump */
  release: 4.0,
  /** each light switches on, top to bottom, one every LIGHT_GAP from the pump's peak (+ 0.12) */
  lights: [4.12, 4.26, 4.4, 4.54],
  /** the count's rise starts, after the last label's (4.54 + FOLLOW = 4.59) */
  label: 4.66,
  /** the last light has settled (4.54 + 0.46) and its label risen (4.59 + 0.4 + SK_LANDED) */
  f4: 5.0,
  end: 5.1,
} as const;
/** a provider's wire draws in this long (the kit's 0.6 s, brisker) */
const DRAW = 0.5;
/** one provider every CADENCE: the kit's bump (skBump, 0.12 + 0.34 s), so each hit on the hub
    has settled as the next lands; past the drawn six, one more every beat */
const CADENCE = 0.46;
/** the hub reacts this long after a wire starts: its tip reaches the dot's edge 0.39–0.41 s into
    the 0.5 s draw (power2.inOut), the last 5 px run under the dot. 0.1 s before the wire's end,
    the lead the hub's landing and the stops already had */
const HIT = DRAW - 0.1;
/** an output's wire draws in this long (a short wire); its stop lands STOP_LEAD before it
    arrives, as the tip reaches the stop's edge (the lineage stop's lead) */
const OUT_DRAW = 0.45;
const STOP_LEAD = 0.1;
/** past the four outputs (one added to the data), one more light every LIGHT_GAP */
const LIGHT_GAP = 0.14;
/** a light's colour switch, grey to lit */
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
  wires.forEach((path) => skHideWire(path));
  outs.forEach((out) => skHideWire(out.path));
  yield;
  skHideRise([...outs.map((out) => out.text), label], RISE.y);
  yield;

  const tl = gsap.timeline({ paused: true });
  // a provider or an output past the drawn ones moves everything after it by one beat
  const late = Math.max(0, count - T.draw.length) * CADENCE;
  const more = Math.max(0, outs.length - T.lights.length) * LIGHT_GAP;

  /* ── the steady beat: each wire draws into the hub point and the hub reacts as its tip reaches
     the dot: the first lands it, every later one is a hit ── */
  wires.forEach((path, k) => {
    const at = T.draw[k] ?? T.draw[T.draw.length - 1] + CADENCE * (k - T.draw.length + 1);
    skWire(tl, path, at, DRAW);
    if (k > 0) skBump(tl, hub, hubR, at + HIT);
  });
  skDot(tl, hub, T.dot);

  /* ── the routes out, on the next beat: four wires draw out of the hub at once, each stop
     lands unlit (the grey set at frame 0) as the tip reaches it ── */
  outs.forEach(({ path, stop }, k) => {
    skWire(tl, path, T.routes + late, OUT_DRAW);
    skStop(tl, stop, stopR[k], T.routes + late + OUT_DRAW - STOP_LEAD);
  });

  /* ── the held beat: the hub gathers (its radius dips, slow in and out) … ── */
  tl.to(hub, { attr: { r: hubR * GATHER }, duration: T.release - T.dip, ease: "power2.inOut" }, T.dip + late);
  /* ── … and pumps ── */
  skBump(tl, hub, hubR, T.release + late, PUMP);

  /* ── the status lights, top to bottom from the pump's peak: grey to the lit colour with a
     bump, the label a beat later ── */
  outs.forEach(({ stop, text }, k) => {
    const at = late + (T.lights[k] ?? T.lights[T.lights.length - 1] + LIGHT_GAP * (k - T.lights.length + 1));
    tl.to(stop, { fill: lit[k], duration: FLIP, ease: "none" }, at);
    skBump(tl, stop, stopR[k], at, LIGHT);
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
