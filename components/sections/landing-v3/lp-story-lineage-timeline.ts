import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { SK_LANDED, skBump, skHideR, skHideRise, skHideWire, skQuery, skRise, skWire } from "./lp-story-kit";

/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Owner: story-lineage package (2026-10-28). The
 * founder's "3/ Lead lineage", which is also "la detection croisee de signaux interne externe",
 * with no UI in the motion ("ban UI things from motions and try to abstract things we re talking
 * about being graphic simple and on brand (you can reuse components)"). Since 2026-10-30 it plays
 * "the match" (founder: make the four stories juicier, keep them graphic and simple, give the
 * reader one moment that moves them; then "the 4 blocks of the deep dive are the right ones but i
 * am looking for ideas to improve motions": the picture stays, the motion gets better). The same
 * evening, on the take whose pulses rode the wires: "pas sur des signaux qui voyagent ca fait un
 * peu sloppy en revanche j aime bien le noir plus intense entre ledealroom et crm". So nothing
 * travels but a wire drawing itself once, and the near-black of her two wires is the climax:
 * each lead takes a hit as its wire's drawing tip lands on it; when Dealroom's wire lands on the
 * lead the CRM's already reached, the others step back and that lead gathers; a beat, then it
 * pops near-black and its two wires turn near-black at once, the whole wire in 0.2 s; it is
 * named, a held beat, and the others come back. Markup LpStoryLineage.tsx, words and geometry
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
 *   hit            skBump, a lead's r 8 → 10.8 → 8, 0.55 s into its wire's draw: the drawing tip
 *                  meets the dot's edge 0.52–0.53 s in (power2.inOut over 226–276 px)
 *   gather         r 8 → 6 on her lead as Dealroom's tip lands on it (the anticipation), back to 8
 *                  under her dot once it covers it
 *   pop            skBump from r 0 on her near-black dot: → 18 in 0.12 s, settles on 12
 *   ink            her two wires' stroke, the kit's grey → the near-black of .lp-slin-lineage in
 *                  0.2 s on the whole wire, then let go (the CSS holds it at rest)
 *   rise           skRise, y 8 → 0 in 0.4 s (the old message story's,
 *                  lp-story-message-timeline.ts:372 at 630bb8e)
 *   staging        the four other wires to opacity 0.5 from the match until the release, back to
 *                  1 (a skWire leaves opacity 1 inline: the markup's)
 * SVG dots move by their `r` attribute, never by a transform; the name rises by the kit's
 * variable and lets go of it SK_LANDED after it lands, so the END is the server markup in Gecko
 * too. No camera: the sources, their names and the grey leads stand from frame 0.
 *
 * Times (s), the T table below. 4.00 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: both sides' sources with their names and group labels,
 *              the five grey leads; no wire yet
 *   0.30–1.20  the internal signals reach out, bottom to top: events, site visits, then the CRM,
 *              0.15 s apart; each lead takes its hit as the tip lands (0.85, 1.00, then her lead
 *              at 1.15, still grey: one side so far)
 *   1.20       f2: the internal signals' three wires are in
 *   1.20–2.10  then the external signals', top to bottom: TheirStack, Apify (hits at 1.75 and
 *              1.90), then Dealroom's into her lead
 *   2.05–2.35  the match, as Dealroom's tip lands: the four others step back to 0.5 and her
 *              lead gathers (r 8 → 6, to 2.30)
 *   2.35       f3: the held breath: all six wires in, the others back, her lead gathered
 *   2.40–2.86  the climax: her near-black dot pops (r 0 → 18 → 12) over the grey lead while her
 *              two wires turn near-black at once (2.40–2.60, let go at 2.61); the grey back to 8
 *              under her dot (2.46–2.56)
 *   2.55–2.95  "Founder @ Mastra" rises under it while the dot settles
 *   2.96       f4: the lead is found and named, its lineage near-black; held 0.3 s
 *   3.25–3.70  the four others come back to full
 *   4.00       f5: the END = the server markup
 *
 * Never moves: the discs, the names, the group labels. Nothing travels: each wire
 * draws once, from its source; nothing loops.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** each wire's start, by its data-order (lp-story-lineage-data.ts `order`): the internal three
      0.15 s apart, then the external three, the two into her lead last of each */
  draw: [0.3, 0.45, 0.6, 1.2, 1.35, 1.5],
  /** the internal signals' wires are in (0.6 + DRAW) */
  f2: 1.2,
  /** Dealroom's tip lands on her lead (1.5 + HIT_AT): the others step back, her lead gathers */
  match: 2.05,
  /** the held breath: the others are back (2.05 + DIM), her lead gathered (2.05 + GATHER) */
  f3: 2.35,
  /** the climax, a beat on: her dot pops near-black and her two wires turn near-black */
  found: 2.4,
  /** her name rises while the dot settles */
  name: 2.55,
  /** the name has let go of its variable (2.55 + 0.4 + SK_LANDED) */
  f4: 2.96,
  /** a held beat on, the four others come back */
  back: 3.25,
  /** the END holds to here */
  end: 4,
} as const;
/** a wire's draw (the kit's 0.6 s) */
const DRAW = 0.6;
/** past the drawn six (a wire added to the data): one more every 0.15 s */
const DRAW_GAP = 0.15;
/** a lead takes its hit this long into its wire's draw: as the drawing tip meets its dot */
const HIT_AT = 0.55;
/** her lead gathers to this share of its radius, in this long, before the pop */
const GATHER = { k: 0.75, duration: 0.25 } as const;
/** the pop: her dot from nothing to this many times its radius (a lead's hit: the kit's 1.35) */
const POP = 1.5;
/** her two wires' ink: a crisp change on the whole wire, nothing travels along it */
const INK = 0.2;
/** the staging: the four others' opacity from the match to the release, and its fade */
const DIM = { opacity: 0.5, duration: 0.3 } as const;
/** the four others' return */
const BACK = 0.45;

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
  /** a wire's start, from its slot */
  const startOf = (el: Element) => {
    const k = Number(el.getAttribute("data-order"));
    return T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
  };
  // each wire with the lead it lands on (data-to)
  const wires = $$<SVGPathElement>(".lp-sk-wires path[data-order]").map((wire) => {
    const lead = $<SVGCircleElement>(`.lp-sk-wires .lp-slin-lead[data-lead="${wire.getAttribute("data-to")}"]`);
    return {
      wire,
      lead,
      /** the lead's radius, the one a hit settles back on (the END picture's) */
      r: Number(lead.getAttribute("r")),
      /** a wire into her lead (.lp-slin-lineage) */
      lineage: wire.classList.contains("lp-slin-lineage"),
    };
  });
  // her lineage in landing order: the CRM's, then Dealroom's, whose landing is the match
  const mine = wires.filter((w) => w.lineage).sort((a, b) => startOf(a.wire) - startOf(b.wire));
  const last = mine[mine.length - 1];
  const others = wires.filter((w) => !w.lineage).map((w) => w.wire);
  const lines = mine.map((w) => w.wire);
  const dot = $<SVGCircleElement>(".lp-sk-wires .lp-slin-found");
  const name = $(".lp-slin-name");
  // her dot lands on the markup's radius (the END picture's): read before frame 0 writes it
  const dotR = Number(dot.getAttribute("r"));
  // a wire's two inks, read before frame 0 writes either: the kit's grey every wire draws in,
  // and the near-black her lineage rests in (story-lineage.css)
  const grey = getComputedStyle(root).getPropertyValue("--sk-wire").trim();
  const ink = lines.length ? getComputedStyle(lines[0]).stroke : grey;

  /* ── frame 0 (the markup rests on the end picture): the sources, their names and the grey
     leads stay; every wire, her dot and her name wait, unseen, and her lineage will draw in the
     grey of the others ── */
  wires.forEach((w) => skHideWire(w.wire));
  yield;
  if (lines.length) gsap.set(lines, { stroke: grey });
  skHideR(dot);
  skHideRise(name);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── the wires, the internal signals' then the external's, each from its disc's edge; each
     lead takes its hit as the drawing tip lands on it, but for the last wire into her lead: its
     landing is the match ── */
  wires.forEach((w) => {
    const at = startOf(w.wire);
    skWire(tl, w.wire, at, DRAW);
    if (w !== last) skBump(tl, w.lead, w.r, at + HIT_AT);
  });

  /* ── the match: the four others step back and her lead gathers; a beat, then the climax: her
     dot pops near-black over it while her two wires turn near-black at once, the whole wire
     (nothing travels along it), then let go of their stroke (.lp-slin-lineage holds it at rest;
     a 1 ms tween, not a set, for the revert order, as the kit's skLetGo). The grey lead goes
     back to its radius under her dot, and her name rises ── */
  if (others.length) tl.to(others, { opacity: DIM.opacity, duration: DIM.duration, ease: "power1.inOut" }, T.match);
  if (last) {
    tl.to(last.lead, { attr: { r: last.r * GATHER.k }, duration: GATHER.duration, ease: "power2.inOut" }, T.match);
    tl.to(last.lead, { attr: { r: last.r }, duration: 0.1, ease: "none" }, T.found + 0.06);
  }
  skBump(tl, dot, dotR, T.found, POP);
  if (lines.length) {
    tl.to(lines, { stroke: ink, duration: INK, ease: "power2.out" }, T.found);
    tl.to(lines, { stroke: ink, clearProps: "stroke", duration: 0.001, ease: "none" }, T.found + INK + SK_LANDED);
  }
  skRise(tl, name, T.name);

  /* ── a held beat, then the four others come back to full ── */
  if (others.length) tl.to(others, { opacity: 1, duration: BACK, ease: "power2.inOut" }, T.back);

  tl.set({}, {}, T.end); // the END picture holds

  /* QA labels = the story's pictures (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
