import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { SK_LANDED, skHideRise, skHideWire, skQuery, skRise, skWire } from "./lp-story-kit";
import { PROBLEM_SCENE, type ProblemStoryId, type SpStep } from "./lp-story-problems-data";

/**
 * The six hard problems' stories (the vision homepage, 2026-11-11) — one builder for the five
 * scenes of lp-story-problems-data.ts: each scene's take as ONE paused, seek-safe GSAP timeline on
 * its stage root. The founder: "des motion design simples et efficaces, bien penses, bien
 * architectures, qui depeignent le probleme qu'on solve". Markup LpStoryProblems.tsx, look
 * story-kit.css + story-problems.css.
 *
 * Contract (lp-dive-stages.ts): frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness, no repeat), progress(1) = the server markup, `cue`
 * = 0: every scene's frame 0 is a composed picture, the problem before Pancake (its sources, its
 * dots and their names), never an empty frame. No "use client": reached only through the lazy
 * loaders in lp-dive-loaders.ts.
 *
 * The scene's steps are played with the kit's verbs, or a plain tween on an SVG attribute or on
 * opacity. None overshoots, nothing travels along a wire, nothing loops:
 *   wire    skWire: the stroke draws from its start (a `linear` one at one speed, for a line
 *           whose datapoints land as its tip passes)
 *   grow    a dot's `r` attribute, power2.out, 0.35 s (the kit's skStop): to its END radius, or
 *           to a step on the way
 *   ink     a wire's stroke or a dot's fill, the kit's grey → its END near-black, the whole piece
 *           at once in 0.2 s, then let go (the stylesheet holds it at rest)
 *   rise    skRise: a line of type comes up 8 px into its place
 *   fade    opacity, then let go after the piece's last fade (the stylesheet holds data-gone at 0
 *           and data-dim at .45)
 *   move    a dot's cx / cy from where it stood to its END place, power2.inOut; the straight
 *           wires that end on it follow (their x2 / y2), so a wire and its dot never part
 * Frame 0 is written in this order: the moves' start places (a wire's length is read from there),
 * the wires, the dots' radii, the inks, the lines of type, the opacities.
 */

type Timeline = gsap.core.Timeline;

/** a dot's growth (the kit's skStop) */
const GROW = { duration: 0.35, ease: "power2.out" } as const;
/** the near-black's change */
const INK = 0.2;

/** The builder in one go: its slices (buildStoryProblemSteps) run to the end. */
export function buildStoryProblem(root: HTMLElement): BuiltStory {
  const steps = buildStoryProblemSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** The same builder in slices (lp-play-once's startBuild): it may yield after any block, as its
    frame-0 sets are written at once and its tweens write nothing until they are rendered. */
export function* buildStoryProblemSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const id = (root.getAttribute("data-lp-story") ?? "") as ProblemStoryId;
  const scene = PROBLEM_SCENE[id];
  if (!scene) throw new Error(`lp-story-problems: no scene "${id}"`);
  const { $ } = skQuery(root, id);
  const piece = <T extends Element = SVGElement>(key: string) => $<T>(`[data-sp="${key}"]`);
  const grey = getComputedStyle(root).getPropertyValue("--sk-wire").trim();
  const isDot = (el: Element) => el.tagName.toLowerCase() === "circle";
  const of = <K extends string>(key: K) => scene.steps.filter((step): step is Extract<SpStep, Record<K, unknown>> => key in step);

  const moves = of("move");
  const wires = of("wire");
  const grows = of("grow");
  const inks = of("ink");
  const rises = of("rise");
  const fades = of("fade");

  /* ── read the END before frame 0 writes anything ── */
  const endR = new Map(grows.map((step) => [step.grow, Number(piece(step.grow).getAttribute("r"))]));
  const endInk = new Map(
    inks.flatMap((step) => step.ink).map((key) => {
      const el = piece(key);
      const style = getComputedStyle(el);
      return [key, isDot(el) ? style.fill : style.stroke] as const;
    }),
  );
  const endAt = new Map(
    moves.map((step) => {
      const dot = piece(step.move);
      return [step.move, [Number(dot.getAttribute("cx")), Number(dot.getAttribute("cy"))] as const] as const;
    }),
  );
  yield;

  /* ── frame 0 (the markup rests on the END picture) ── */
  // a dot that will move waits where it stood, and the wires that end on it end there too
  moves.forEach((step) => {
    gsap.set(piece(step.move), { attr: { cx: step.from[0], cy: step.from[1] } });
    (step.with ?? []).forEach((key) => gsap.set(piece(key), { attr: { x2: step.from[0], y2: step.from[1] } }));
  });
  wires.forEach((step) => skHideWire(piece<SVGPathElement>(step.wire)));
  yield;
  // a dot's first growth starts from its `from` (0: it is not there yet)
  const grown = new Set<string>();
  grows.forEach((step) => {
    if (grown.has(step.grow)) return;
    grown.add(step.grow);
    gsap.set(piece(step.grow), { attr: { r: step.from ?? 0 } });
  });
  // what will turn near-black waits in the kit's grey
  endInk.forEach((_ink, key) => {
    const el = piece(key);
    gsap.set(el, isDot(el) ? { fill: grey } : { stroke: grey });
  });
  rises.forEach((step) => skHideRise(piece<HTMLElement>(step.rise)));
  // a piece that will fade is whole at frame 0, whatever it rests at
  new Set(fades.flatMap((step) => step.fade)).forEach((key) => gsap.set(piece(key), { opacity: 1 }));
  yield;

  const tl: Timeline = gsap.timeline({ paused: true });

  wires.forEach((step) => {
    const wire = piece<SVGPathElement>(step.wire);
    const duration = step.dur ?? 0.6;
    if (step.linear) {
      // one speed from end to end (the kit's skWire eases in and out)
      tl.to(wire, { opacity: 1, duration: 0.001, ease: "none" }, step.at + 0.02);
      tl.to(wire, { strokeDashoffset: 0, duration, ease: "none" }, step.at);
    } else {
      skWire(tl, wire, step.at, duration);
    }
  });
  // a wire whose end will move gives up its dash once it is drawn: its length is about to change
  moves.forEach((step) =>
    (step.with ?? []).forEach((key) => {
      const drawn = wires.find((w) => w.wire === key);
      if (!drawn) return;
      const at = Math.min(step.at - 0.02, drawn.at + (drawn.dur ?? 0.6) + SK_LANDED);
      tl.to(piece(key), { strokeDashoffset: 0, clearProps: "strokeDasharray,strokeDashoffset", duration: 0.001, ease: "none" }, at);
    }),
  );

  moves.forEach((step) => {
    const [cx, cy] = endAt.get(step.move)!;
    const duration = step.dur ?? 0.55;
    tl.to(piece(step.move), { attr: { cx, cy }, duration, ease: "power2.inOut" }, step.at);
    (step.with ?? []).forEach((key) =>
      tl.to(piece(key), { attr: { x2: cx, y2: cy }, duration, ease: "power2.inOut" }, step.at),
    );
  });

  grows.forEach((step) => {
    tl.to(piece(step.grow), { attr: { r: step.to ?? endR.get(step.grow)! }, ...GROW }, step.at);
  });

  inks.forEach((step) =>
    step.ink.forEach((key) => {
      const el = piece(key);
      const prop = isDot(el) ? "fill" : "stroke";
      const ink = endInk.get(key)!;
      tl.to(el, { [prop]: ink, duration: INK, ease: "power2.out" }, step.at);
      // let go: the stylesheet's data-ink holds it at rest (a 1 ms tween, for the revert order)
      tl.to(el, { [prop]: ink, clearProps: prop, duration: 0.001, ease: "none" }, step.at + INK + SK_LANDED);
    }),
  );

  rises.forEach((step) => skRise(tl, piece<HTMLElement>(step.rise), step.at));

  // each fade; a piece lets go of its opacity after its last one (data-gone / data-dim hold it)
  const lastFade = new Map<string, { at: number; to: number }>();
  fades.forEach((step) => {
    const duration = step.dur ?? 0.3;
    step.fade.forEach((key) => {
      tl.to(piece(key), { opacity: step.to, duration, ease: "power1.inOut" }, step.at);
      const end = step.at + duration;
      const seen = lastFade.get(key);
      if (!seen || end >= seen.at) lastFade.set(key, { at: end, to: step.to });
    });
  });
  lastFade.forEach(({ at, to }, key) => {
    tl.to(piece(key), { opacity: to, clearProps: "opacity", duration: 0.001, ease: "none" }, at + SK_LANDED);
  });

  tl.set({}, {}, scene.end); // the END picture holds
  tl.addLabel("f1", 0).addLabel("f5", scene.end);

  return { tl, cleanup: () => {}, cue: 0 };
}
