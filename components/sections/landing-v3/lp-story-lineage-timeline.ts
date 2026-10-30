import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { SK_LANDED, skHideRise, skHideWire, skQuery, skRise, skStop, skWire } from "./lp-story-kit";

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
 * peu sloppy en revanche j aime bien le noir plus intense entre ledealroom et crm"; then, on the
 * leads' hits and the dot's pop: "j aime pas trop les effets de bounce que tu mets a chaque fois".
 * So nothing travels but a wire drawing itself once, nothing swells past its size and comes
 * back, and the near-black of her two wires is the climax: the wires land on the leads, which
 * hold still; when Dealroom's lands on the lead the CRM's already reached, the others step back;
 * then that lead and its two wires turn near-black at once, the whole wire in 0.2 s, while the
 * dot grows to its found size; it is named, a held beat, and the others come back. Markup
 * LpStoryLineage.tsx, words and geometry lp-story-lineage-data.ts, look story-kit.css +
 * story-lineage.css.
 *
 * Contract: lp-dive-stages.ts and code-map §6.2 — frame 0 via gsap.set (the caller's
 * gsap.context reverts it), sets and tweens only (no callbacks, no randomness, no repeat, no
 * timeScale), progress(1) = the server markup, `cue` = the first composed scene: 0, the whole
 * picture but its wires, her near-black and her name, never an empty frame. No "use client":
 * reached only through DIVE_LOADERS.lineage (lp-dive-loaders.ts, a lazy chunk); it imports GSAP,
 * the story kit and types, nothing else (no copy: every word is in the markup).
 *
 * Every verb is the kit's (lp-story-kit.ts), copied from the loved picture's timeline
 * (lp-story-sources-timeline.ts at 630bb8e) or its sibling's, or a plain tween on an SVG
 * attribute or opacity. None overshoots:
 *   wire draw      skWire, strokeDashoffset to 0 in 0.6 s (:284-285), from its disc's edge
 *   staging        the four other wires to opacity 0.5 from the match until the release, back to
 *                  1 (a skWire leaves opacity 1 inline: the markup's)
 *   ink            her two wires' stroke and her dot's fill, the kit's grey → the hub's
 *                  near-black (.lp-slin-lineage, .lp-sk-hub) in 0.2 s, the whole wire and the
 *                  whole dot at once, then let go (the CSS holds it at rest)
 *   grow           skStop on her dot, r 8 → 12 in 0.35 s, power2.out: it waits from frame 0 as
 *                  her lead (her lead's radius, in its grey, identical pixels over it), so the
 *                  near-black covers the lead from the first frame of the change, no grey ring
 *   rise           skRise, y 8 → 0 in 0.4 s (the old message story's,
 *                  lp-story-message-timeline.ts:372 at 630bb8e)
 * SVG dots move by their `r` attribute, never by a transform; the name rises by the kit's
 * variable and lets go of it SK_LANDED after it lands, so the END is the server markup in Gecko
 * too. No camera: the sources, their names and the grey leads stand from frame 0.
 *
 * Times (s), the T table below. 3.90 s in all; the carousel then holds the end 2 s:
 *
 *   0.00       f1: frame 0 = the cue: both sides' sources with their names and group labels,
 *              the five grey leads; no wire yet
 *   0.30–1.20  the internal signals reach out, bottom to top: events, site visits, then the CRM
 *              into her lead, 0.15 s apart
 *   1.20       f2: the internal signals' three wires are in
 *   1.20–2.10  then the external signals', top to bottom: TheirStack, Apify, then Dealroom's
 *              into her lead
 *   2.05–2.35  the match, as Dealroom's tip lands on her lead (0.55 s into its draw): the four
 *              others step back to 0.5
 *   2.35       f3: the held breath: all six wires in, the others back, her lead still grey
 *   2.35–2.70  the climax: her lead and its two wires turn near-black at once (2.35–2.55, let go
 *              at 2.56) while her dot grows to its radius (r 8 → 12)
 *   2.50–2.90  "Founder @ Mastra" rises under it
 *   2.91       f4: the lead is found and named, its lineage near-black; held 0.3 s
 *   3.20–3.65  the four others come back to full
 *   3.90       f5: the END = the server markup
 *
 * Never moves: the discs, the names, the group labels, the grey leads. Nothing travels: each
 * wire draws once, from its disc; nothing loops.
 */

/** the take, in seconds (see the table above) */
const T = {
  f1: 0,
  /** each wire's start, by its data-order (lp-story-lineage-data.ts `order`): the internal three
      0.15 s apart, then the external three, the two into her lead last of each */
  draw: [0.3, 0.45, 0.6, 1.2, 1.35, 1.5],
  /** the internal signals' wires are in (0.6 + DRAW) */
  f2: 1.2,
  /** Dealroom's tip lands on her lead (1.5 + 0.55: it meets an r 8 dot's edge 0.53 s into the
      draw): the others step back */
  match: 2.05,
  /** the held breath: all six in, the others back (2.05 + DIM) */
  f3: 2.35,
  /** the climax, as the others settle: her lead and its two wires turn near-black */
  found: 2.35,
  /** her name rises while the dot grows */
  name: 2.5,
  /** the name has let go of its variable (2.5 + 0.4 + SK_LANDED) */
  f4: 2.91,
  /** a held beat on, the four others come back */
  back: 3.2,
  /** the END holds to here */
  end: 3.9,
} as const;
/** a wire's draw (the kit's 0.6 s) */
const DRAW = 0.6;
/** past the drawn six (a wire added to the data): one more every 0.15 s */
const DRAW_GAP = 0.15;
/** the near-black's change, on her two wires and her dot: crisp, the whole of each at once */
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
    the inks, the wires' lengths) depends on nothing it writes. */
export function* buildStoryLineageSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "lineage");
  /** a wire's start, from its slot */
  const startOf = (el: Element) => {
    const k = Number(el.getAttribute("data-order"));
    return T.draw[k] ?? T.draw[T.draw.length - 1] + DRAW_GAP * (k - T.draw.length + 1);
  };
  const wires = $$<SVGPathElement>(".lp-sk-wires path[data-order]");
  // her lineage (.lp-slin-lineage): the CRM's wire and Dealroom's; the four others step back
  const lines = wires.filter((wire) => wire.classList.contains("lp-slin-lineage"));
  const others = wires.filter((wire) => !lines.includes(wire));
  const dot = $<SVGCircleElement>(".lp-sk-wires .lp-slin-found");
  const name = $(".lp-slin-name");
  // her lead, the grey dot under hers (where her lineage lands): her dot waits as it
  const lead = lines.length
    ? $<SVGCircleElement>(`.lp-sk-wires .lp-slin-lead[data-lead="${lines[0].getAttribute("data-to")}"]`)
    : null;
  // read before frame 0 writes any: her dot's END radius and her lead's, the kit's grey every
  // wire and lead is drawn in, and the near-black her lineage and her dot rest in
  const dotR = Number(dot.getAttribute("r"));
  const leadR = lead ? Number(lead.getAttribute("r")) : 0;
  const grey = getComputedStyle(root).getPropertyValue("--sk-wire").trim();
  const ink = lines.length ? getComputedStyle(lines[0]).stroke : grey;
  const dotInk = getComputedStyle(dot).fill;

  /* ── frame 0 (the markup rests on the end picture): the sources, their names and the grey
     leads stay; every wire and her name wait, unseen; her lineage will draw in the grey of the
     others, and her dot waits as her lead (its radius, its grey) ── */
  wires.forEach((wire) => skHideWire(wire));
  yield;
  if (lines.length) gsap.set(lines, { stroke: grey });
  gsap.set(dot, { attr: { r: leadR }, fill: grey });
  skHideRise(name);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── the wires, the internal signals' then the external's, each from its disc's edge; a lead
     holds still as its wire lands on it ── */
  wires.forEach((wire) => skWire(tl, wire, startOf(wire), DRAW));

  /* ── the match, as Dealroom's tip lands on her lead: the four others step back ── */
  if (others.length) tl.to(others, { opacity: DIM.opacity, duration: DIM.duration, ease: "power1.inOut" }, T.match);

  /* ── the climax: her lead and its two wires turn near-black at once, the whole of each
     (nothing travels along a wire), while her dot grows to its radius; each then lets go of its
     colour (.lp-slin-lineage and .lp-sk-hub hold it at rest; a 1 ms tween, not a set, for the
     revert order, as the kit's skLetGo). Her name rises ── */
  if (lines.length) {
    tl.to(lines, { stroke: ink, duration: INK, ease: "power2.out" }, T.found);
    tl.to(lines, { stroke: ink, clearProps: "stroke", duration: 0.001, ease: "none" }, T.found + INK + SK_LANDED);
  }
  tl.to(dot, { fill: dotInk, duration: INK, ease: "power2.out" }, T.found);
  tl.to(dot, { fill: dotInk, clearProps: "fill", duration: 0.001, ease: "none" }, T.found + INK + SK_LANDED);
  skStop(tl, dot, dotR, T.found);
  skRise(tl, name, T.name);

  /* ── a held beat, then the four others come back to full ── */
  if (others.length) tl.to(others, { opacity: 1, duration: BACK, ease: "power2.inOut" }, T.back);

  tl.set({}, {}, T.end); // the END picture holds

  /* QA labels = the story's pictures (a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
