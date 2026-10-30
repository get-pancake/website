import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  SK_LANDED,
  skBump,
  skHidePulse,
  skHideR,
  skHideRise,
  skHideWire,
  skPulse,
  skQuery,
  skRise,
  skWire,
} from "./lp-story-kit";

/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Owner: story-lineage package (2026-10-28). The
 * founder's "3/ Lead lineage", which is also "la detection croisee de signaux interne externe",
 * with no UI in the motion ("ban UI things from motions and try to abstract things we re talking
 * about being graphic simple and on brand (you can reuse components)"). Since 2026-10-30 it plays
 * "the match" (founder: make the four stories juicier, keep them graphic and simple, give the
 * reader one moment that moves them; then "the 4 blocks of the deep dive are the right ones but i
 * am looking for ideas to improve motions": the picture stays, the motion gets better). Data
 * rides each wire as a pulse (the marble-run pattern, drawn flat) and the lead it lands on takes
 * the hit; the CRM's pulse waits for Dealroom's wire, then the two ride together and sink into
 * the middle lead at once: it gathers, pops near-black (the take's one strong hit, the chosen
 * card that lifts) and is named; a held beat, then the release: the two wires that found it
 * turn near-black, its lineage. Markup LpStoryLineage.tsx, words and geometry
 * lp-story-lineage-data.ts, look story-kit.css + story-lineage.css.
 *
 * Contract: lp-dive-stages.ts and code-map §6.2 — frame 0 via gsap.set (the caller's
 * gsap.context reverts it), sets and tweens only (no callbacks, no randomness, no repeat, no
 * timeScale), progress(1) = the server markup, `cue` = the first composed scene: 0, the whole
 * picture but its wires, her dot and her name, never an empty frame. No "use client": reached
 * only through DIVE_LOADERS.lineage (lp-dive-loaders.ts, a lazy chunk); it imports GSAP, the
 * story kit and types, nothing else (no copy: every word is in the markup).
 *
 * Every verb is the kit's (lp-story-kit.ts), copied from the loved picture's timeline
 * (lp-story-sources-timeline.ts at 630bb8e) or its sibling's, or a plain tween on an SVG
 * attribute or opacity:
 *   wire draw      skWire, strokeDashoffset to 0 in 0.6 s (:284-285), from its source's edge
 *   pulse          skPulse, a 9 px dash on the wire's copy (.lp-sk-pulse) from the source into
 *                  the lead, 0.45 s; the match's two 0.6 s (the longest wires, 275.6 px)
 *   hit            skBump, a lead's r 8 → 10.8 → 8 as its pulse sinks in
 *   gather         r 8 → 6 on the middle lead as the match's pulses close in (the anticipation),
 *                  back to 8 under her dot once it covers it
 *   pop            skBump from r 0 on her near-black dot: → 18 in 0.12 s, settles on 12
 *   rise           skRise, y 8 → 0 in 0.4 s (the old message story's,
 *                  lp-story-message-timeline.ts:372 at 630bb8e)
 *   staging        the four other wires to opacity 0.5 while the match plays, back to 1 in the
 *                  release (a skWire leaves opacity 1 inline: the markup's)
 *   lineage        her two wires' stroke, the kit's grey → the near-black of .lp-slin-lineage,
 *                  then let go (the CSS holds it at rest)
 * SVG dots move by their `r` attribute, never by a transform; the name rises by the kit's
 * variable and lets go of it SK_LANDED after it lands, so the END is the server markup in Gecko
 * too. No camera: the sources, their names and the grey leads stand from frame 0.
 *
 * Times (s), the T table below. 5.00 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: both sides' sources with their names and group labels,
 *              the five grey leads; no wire yet
 *   0.30–1.20  your data reaches out, bottom to top: events, site visits, then the CRM, 0.15 s
 *              apart. A pulse leaves each as its wire lands (0.55 s into the draw) and rides
 *              it in 0.45 s: leads 4 and 3 take their hit at 1.30 and 1.45 and stay grey. The
 *              CRM's wire reaches the middle lead at 1.20; its pulse waits
 *   1.50       f2: your data's three wires are in, both its pulses landed
 *   1.50–2.40  then Pancake data's, top to bottom: TheirStack, Apify (hits at 2.50 and 2.65),
 *              then Dealroom's into the middle lead, whose pulse waits too
 *   2.60–2.90  the staging: the four one-sided wires step back to 0.5
 *   2.70–3.30  the match: the CRM's pulse and Dealroom's ride together, point-symmetric about
 *              the middle lead (their wires are one cubic turned half a turn about it)
 *   3.00       f3: the two pulses half-way, the others dimmed
 *   3.10–3.35  the middle lead gathers (r 8 → 6) as they close in; they sink into it at 3.30
 *   3.40–3.86  a beat, then the pop: her near-black dot r 0 → 18 → 12 over the grey lead (the
 *              grey back to 8 under it, 3.46–3.56)
 *   3.50–3.90  "Founder @ Mastra" rises under it while the dot settles
 *   3.91       f4: the lead is found and named (its label lets go of its variable); held 0.3 s
 *   4.20–4.65  the release: the CRM's and Dealroom's wires turn near-black (let go at 4.66)
 *   4.30–4.75  the four others come back to full, a beat behind
 *   5.00       f5: the END = the server markup
 *
 * Never moves: the discs, the stops, the names, the group labels. Each wire draws once, from its
 * source; each pulse rides once; nothing loops.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** each wire's start, by its data-order (lp-story-lineage-data.ts `order`): your data's three
      0.15 s apart, then Pancake data's three after a beat, the two into the found lead last of
      each */
  draw: [0.3, 0.45, 0.6, 1.5, 1.65, 1.8],
  /** your data's wires are in, both its pulses landed (0.45 + PULSE_AT + PULSE = 1.45) */
  f2: 1.5,
  /** the four others step back as Apify's pulse sinks in (1.65 + PULSE_AT + PULSE = 2.65) */
  dim: 2.6,
  /** the two kept pulses leave together (Dealroom's wire is in at 1.8 + DRAW = 2.4) */
  match: 2.7,
  /** half-way: the two pulses point-symmetric about the middle lead */
  f3: 3,
  /** the middle lead gathers as they close in (they sink into it at 2.7 + MATCH = 3.3) */
  gather: 3.1,
  /** her dot pops a beat after they sink in */
  found: 3.4,
  /** her name rises while the dot settles */
  name: 3.5,
  /** the name has let go of its variable (3.5 + 0.4 + SK_LANDED) */
  f4: 3.91,
  /** the release, 0.3 s after her name lands: her lineage turns near-black … */
  trace: 4.2,
  /** … and the four others come back, a beat behind */
  back: 4.3,
  /** the END holds to here */
  end: 5,
} as const;
/** a wire's draw (the kit's 0.6 s) */
const DRAW = 0.6;
/** past the drawn six (a wire added to the data): one more every 0.15 s */
const DRAW_GAP = 0.15;
/** a pulse leaves its source this long into its wire's draw: as the wire lands */
const PULSE_AT = 0.55;
/** a pulse's ride into a lead reached from one side (wires of 226 to 247 px) */
const PULSE = 0.45;
/** the match's two rides, on the two longest wires: a touch slower, landing together */
const MATCH = 0.6;
/** the middle lead gathers to this share of its radius, in this long, before the pop */
const GATHER = { k: 0.75, duration: 0.25 } as const;
/** the pop: her dot from nothing to this many times its radius (a lead's hit: the kit's 1.35) */
const POP = 1.5;
/** the staging: the four others' opacity while the match plays, and its fade */
const DIM = { opacity: 0.5, duration: 0.3 } as const;
/** the release: her lineage's ink, then the others' return */
const RELEASE = 0.45;

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
    once, its tweens write nothing until they are rendered, and what it reads (the dots' radii,
    the wires' inks and lengths) depends on nothing it writes. */
export function* buildStoryLineageSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "lineage");
  // each wire with its pulse (data-pulse) and the lead it lands on (data-to)
  const rides = $$<SVGPathElement>(".lp-sk-wires path[data-order]").map((wire) => {
    const lead = $<SVGCircleElement>(`.lp-sk-wires .lp-slin-lead[data-lead="${wire.getAttribute("data-to")}"]`);
    return {
      wire,
      pulse: $<SVGPathElement>(`.lp-sk-wires .lp-sk-pulse[data-pulse="${wire.getAttribute("data-wire")}"]`),
      lead,
      /** the lead's radius, the one a hit settles back on (the END picture's) */
      r: Number(lead.getAttribute("r")),
      /** a wire into her lead (.lp-slin-lineage): its pulse is kept for the match */
      lineage: wire.classList.contains("lp-slin-lineage"),
      /** its length, for its pulse (frame 0 measures it) */
      len: 0,
    };
  });
  const mine = rides.filter((ride) => ride.lineage);
  const others = rides.filter((ride) => !ride.lineage).map((ride) => ride.wire);
  const lines = mine.map((ride) => ride.wire);
  const dot = $<SVGCircleElement>(".lp-sk-wires .lp-slin-found");
  const name = $(".lp-slin-name");
  // her dot lands on the markup's radius (the END picture's): read before frame 0 writes it
  const dotR = Number(dot.getAttribute("r"));
  // a wire's two inks, read before frame 0 writes either: the kit's grey every wire draws in,
  // and the near-black her lineage rests in (story-lineage.css)
  const grey = getComputedStyle(root).getPropertyValue("--sk-wire").trim();
  const ink = lines.length ? getComputedStyle(lines[0]).stroke : grey;
  /** a wire's start, from its slot */
  const startOf = (el: Element) => {
    const k = Number(el.getAttribute("data-order"));
    return T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
  };

  /* ── frame 0 (the markup rests on the end picture): the sources, their names and the grey
     leads stay; every wire and its pulse, her dot and her name wait, unseen, and her lineage
     will draw in the grey of the others ── */
  rides.forEach((ride) => {
    skHideWire(ride.wire);
    ride.len = skHidePulse(ride.pulse);
  });
  yield;
  if (lines.length) gsap.set(lines, { stroke: grey });
  skHideR(dot);
  skHideRise(name);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── the wires, your data's then Pancake data's, each from its source's edge. A pulse leaves
     each as it lands and its lead takes the hit; the two into her lead keep theirs ── */
  rides.forEach((ride) => {
    const at = startOf(ride.wire);
    skWire(tl, ride.wire, at, DRAW);
    if (ride.lineage) return;
    skPulse(tl, ride.pulse, ride.len, at + PULSE_AT, PULSE);
    skBump(tl, ride.lead, ride.r, at + PULSE_AT + PULSE);
  });

  /* ── the match: the four others step back; the two kept pulses ride together and sink into
     her lead at once while it gathers; a beat, then her dot pops near-black over it (the grey
     back to its radius under it) and her name rises ── */
  if (others.length) tl.to(others, { opacity: DIM.opacity, duration: DIM.duration, ease: "power1.inOut" }, T.dim);
  mine.forEach((ride) => skPulse(tl, ride.pulse, ride.len, T.match, MATCH));
  if (mine.length) {
    const { lead, r } = mine[0];
    tl.to(lead, { attr: { r: r * GATHER.k }, duration: GATHER.duration, ease: "power2.inOut" }, T.gather);
    tl.to(lead, { attr: { r }, duration: 0.1, ease: "none" }, T.found + 0.06);
  }
  skBump(tl, dot, dotR, T.found, POP);
  skRise(tl, name, T.name);

  /* ── the release, a held beat on: her lineage turns to the hub's near-black, then lets go of
     its stroke (.lp-slin-lineage holds it at rest; a 1 ms tween, not a set, for the revert
     order, as the kit's skLetGo); the four others come back to full a beat behind ── */
  if (lines.length) {
    tl.to(lines, { stroke: ink, duration: RELEASE, ease: "power2.inOut" }, T.trace);
    tl.to(lines, { stroke: ink, clearProps: "stroke", duration: 0.001, ease: "none" }, T.trace + RELEASE + SK_LANDED);
  }
  if (others.length) tl.to(others, { opacity: 1, duration: RELEASE, ease: "power2.inOut" }, T.back);

  tl.set({}, {}, T.end); // the END picture holds

  /* QA labels = the story's pictures (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
