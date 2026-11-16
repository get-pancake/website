// No "use client" on purpose: a plain module, reached only through the lazy imports of
// LpVisionStepAnim and lp-dive-loaders.ts (lp-dive-stages.ts has why).
import { gsap } from "@/lib/gsap";

/**
 * The toy pictures' shared motion (2026-11-12): the few verbs every picture is made of. A
 * drawing grows into place, slides along a line of the set, comes from one point to its own, a
 * badge comes up. Every helper writes sets and tweens only (no callbacks, no randomness), so a
 * timeline built with them can be seeked both ways and its progress(1) is the server markup.
 * Each verb comes as a pair: `toyHide…` writes frame 0 (inside the caller's gsap.context, which
 * reverts it), the verb adds the tweens at a time.
 *
 * Transforms stay 2D (force3D off, as in the step timelines): a 3D one re-rasterises the scaled
 * stage for the length of the tween.
 *
 * THE ONE PLACE FOR THE FEEL. A piece grows or fades into its place and stops there: no
 * overshoot, no settle, no hop (founder, 2026-10-30: "j aime pas trop les effets de bounce").
 * His review of these pictures (2026-11-16) took out the rest of the same family: the glows, the
 * rings that open, the beads and points of light that ride the cables, the radar's sweep, the
 * phone that shakes. So: no glow, no ring, nothing that travels along a line but the piece the
 * story is about, nothing that swells and settles. Until 2026-11-16 `pop` was back.out(1.6) and
 * `soft` back.out(1.15).
 */
export const TOY_EASE = {
  /** a piece pops into place */
  pop: "power3.out",
  /** a large piece (a message) comes to its place */
  soft: "power3.out",
  /** a piece lands */
  land: "power2.out",
  /** a piece travels */
  move: "power1.inOut",
} as const;

type Timeline = gsap.core.Timeline;
type Point = readonly [number, number];
/** an "instant" change: 1 ms (a tween, so gsap.context reverts it in time order) */
export const TOY_STEP = 0.001;

/** A picture's lookups: `one` throws on a missing element, naming the picture. */
export function toyQuery(root: HTMLElement, picture: string) {
  return {
    one: <T extends Element = HTMLElement>(sel: string, from: ParentNode = root): T => {
      const el = from.querySelector<T>(sel);
      if (!el) throw new Error(`lp-toy ${picture}: missing ${sel}`);
      return el;
    },
    all: <T extends Element = HTMLElement>(sel: string, from: ParentNode = root): T[] => Array.from(from.querySelectorAll<T>(sel)),
  };
}

/** Asks the browser to decode the picture's drawings ahead of the take: a drawing that first
    shows mid-take (a pile one row higher) is then ready when its turn comes. */
export function toyDecode(root: HTMLElement): void {
  for (const img of Array.from(root.querySelectorAll("img"))) {
    if (typeof img.decode === "function") img.decode().catch(() => undefined);
  }
}

/* ── a piece pops: it fades in fast while it grows from `from` ── */
export function toyHidePop(els: gsap.TweenTarget, from = 0.6): void {
  gsap.set(els, { autoAlpha: 0, scale: from });
}
export function toyPop(tl: Timeline, el: gsap.TweenTarget, at: number, duration = 0.42): void {
  tl.to(el, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, at);
  tl.to(el, { scale: 1, duration, ease: TOY_EASE.pop, force3D: false }, at);
}

/* ── a badge comes up from `y` px below, and can leave the way a thought does ── */
export function toyHideRise(els: gsap.TweenTarget, y = 8): void {
  gsap.set(els, { autoAlpha: 0, y });
}
export function toyRise(tl: Timeline, el: gsap.TweenTarget, at: number, duration = 0.36): void {
  tl.to(el, { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, at);
  tl.to(el, { y: 0, duration, ease: TOY_EASE.pop, force3D: false }, at);
}
export function toyLeave(tl: Timeline, el: gsap.TweenTarget, at: number, duration = 0.22): void {
  tl.to(el, { autoAlpha: 0, y: -6, duration, ease: "power1.in", force3D: false }, at);
}

/* ── something shows or goes at once ── */
export function toyShow(tl: Timeline, el: gsap.TweenTarget, at: number): void {
  tl.to(el, { autoAlpha: 1, duration: TOY_STEP, ease: "none" }, at);
}
export function toyGone(tl: Timeline, el: gsap.TweenTarget, at: number): void {
  tl.to(el, { autoAlpha: 0, duration: TOY_STEP, ease: "none" }, at);
}

/**
 * A drawing slides along a line of the set. `points` are the line (stage px); the drawing is
 * laid on `home` in the markup. It is set on the line's first point at frame 0 by `toyHideAlong`.
 */
export function toyHideAlong(el: gsap.TweenTarget, points: readonly Point[], home: Point): void {
  gsap.set(el, { autoAlpha: 0, x: points[0][0] - home[0], y: points[0][1] - home[1] });
}
export function toyAlong(tl: Timeline, el: gsap.TweenTarget, points: readonly Point[], home: Point, at: number, duration: number): void {
  // equal steps along a line whose points are evenly spaced: a steady speed
  const step = duration / (points.length - 1);
  for (let i = 1; i < points.length; i++) {
    tl.to(el, { x: points[i][0] - home[0], y: points[i][1] - home[1], duration: step, ease: "none", force3D: false }, at + (i - 1) * step);
  }
}

/**
 * A drawing comes from `from` to its own place in the markup (`home`) the straight way, growing
 * from `scale`, and stops there. (Until 2026-11-16 it hopped there, up then down: a bounce.)
 */
export function toyHideGlide(el: gsap.TweenTarget, from: Point, home: Point, scale = 0.35): void {
  gsap.set(el, { autoAlpha: 0, x: from[0] - home[0], y: from[1] - home[1], scale });
}
export function toyGlide(tl: Timeline, el: gsap.TweenTarget, at: number, duration = 0.42): void {
  tl.to(el, { autoAlpha: 1, duration: 0.1, ease: "none" }, at);
  tl.to(el, { x: 0, y: 0, scale: 1, duration, ease: "power2.out", force3D: false }, at);
}
