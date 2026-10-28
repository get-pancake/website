import { gsap } from "@/lib/gsap";

/**
 * The deep-dive stories' shared motion (2026-10-28): the camera that opens every story and the
 * verbs of the one picture the founder loves (the sources story's end hub: a disc pops, a cap
 * lands, a wire draws into the near-black dot). Copied from lp-story-sources-timeline.ts at 630bb8e
 * (removed with its story the same day): disc pop :274-276, cap :283, wire :284-285, hub dot :289, the
 * label's rise :268-269. Styles: app/_styles/landing-v3/story-kit.css.
 *
 * No "use client", like the timelines that import it (lp-dive-stages.ts): reached only through
 * the lazy loaders in lp-dive-loaders.ts. Every helper writes sets and tweens only (no callbacks,
 * no randomness), so a timeline built with them stays seek-safe and its progress(1) is the server
 * markup. Each verb comes as a pair: `skHide…` writes frame 0 (inside the caller's gsap.context,
 * which reverts it), the verb adds the tweens at a time.
 *
 * Nothing moves by GSAP's own transform. SVG dots and caps animate their `r` attribute (a CSS
 * transform-origin on an SVG circle plus GSAP's own origin handling double-shifts it). The
 * camera, a disc's pop and a line's rise tween a CSS variable that story-kit.css reads into a 2D
 * transform, and let go of it SK_LANDED after they land (skLetGo): unset, the transform computes
 * to none, so the END is the server markup (Gecko snaps text in a transformed box differently).
 * GSAP's x / y / scale go through its transform cache: force3D "auto" writes translate3d while
 * they run, which in Chromium gives the piece a layer of its own and re-rasterises the scene
 * under it (every wire, disc and confetti edge shifted by up to 51 levels at DPR 2 for the length
 * of the tween, measured 2026-10-28), and a clearProps resets that cache, so a force3D: false
 * does not survive the next play.
 */

type Timeline = gsap.core.Timeline;

/** the wires' cap and hub-dot radius (Figma connector caps) */
export const SK_CAP_R = 5.333;
/** a piece lets go of its variable this long after its tween ends */
export const SK_LANDED = 0.01;
/** the opening (s): the claim fills the stage and holds, then the camera pulls back */
export const SK_CAM = { hold: 1.8, pull: 1.2 } as const;
/** where the pull-back has landed and the variable is cleared: a story's second beat starts here */
export const SK_CAM_END = SK_CAM.hold + SK_CAM.pull;

/** A story's `$` / `$$`: `$` throws on a missing element, naming the story. */
export function skQuery(root: HTMLElement, story: string) {
  return {
    $: <T extends Element = HTMLElement>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`lp-story-${story}: missing ${sel}`);
      return el;
    },
    $$: <T extends Element = HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel)),
  };
}

/**
 * Lets go of a kit variable at `at`: a 1 ms tween to its resting value that then clears it. A
 * tween, not a set: gsap.context's revert takes the tweens latest start first but files every
 * zero-length one at -Infinity, and GSAP 3.15's comparator leaves a tie between two of those to
 * the engine's sort (Gecko keeps creation order), so a set could come back after the frame-0 set
 * and write back what that set had hidden. A tween with a length is filed at its start, so every
 * engine reverts it first and the frame-0 set then restores the markup.
 */
function skLetGo(tl: Timeline, el: Element, prop: string, rest: number, at: number): void {
  tl.to(el, { [prop]: rest, clearProps: prop, duration: 0.001, ease: "none" }, at);
}

/**
 * The camera, the same in every story: frame 0 = `.lp-sk-cam` at --lp-sk-cam-from (the story's
 * stylesheet, with the transform-origin that puts its claim mid-stage), held SK_CAM.hold, then
 * pulled back to 1 in SK_CAM.pull (power2.inOut: the founder's approved sources push, ×3.89 in
 * 1.1 s, run backwards). SK_LANDED after it lands the variable is let go: from there the scene is
 * plain layout, as the server markup. A backward seek re-renders the fromTo, so the scale comes
 * back.
 */
export function skCamera(tl: Timeline, cam: HTMLElement): void {
  const from = parseFloat(getComputedStyle(cam).getPropertyValue("--lp-sk-cam-from")) || 1;
  gsap.set(cam, { "--lp-sk-cam-s": from });
  tl.fromTo(
    cam,
    { "--lp-sk-cam-s": from },
    { "--lp-sk-cam-s": 1, duration: SK_CAM.pull, ease: "power2.inOut", immediateRender: false },
    SK_CAM.hold,
  );
  skLetGo(tl, cam, "--lp-sk-cam-s", 1, SK_CAM_END + SK_LANDED);
}

/* ── a disc pops: fades in 0.18 s while it grows from .6 in 0.45 s. The growth is
   --lp-sk-pop, which every .lp-sk-disc reads (story-kit.css) ── */
export function skHidePop(els: Element | Element[]): void {
  gsap.set(els, { autoAlpha: 0, "--lp-sk-pop": 0.6 });
}
export function skPop(tl: Timeline, el: Element, at: number): void {
  tl.to(el, { autoAlpha: 1, duration: 0.18, ease: "power1.out" }, at);
  tl.to(el, { "--lp-sk-pop": 1, duration: 0.45, ease: "back.out(1.6)" }, at);
  skLetGo(tl, el, "--lp-sk-pop", 1, at + 0.45 + SK_LANDED);
}

/* ── an SVG circle lands by its radius: a wire's cap, the hub dot, a stop ── */
export function skHideR(els: SVGCircleElement | SVGCircleElement[]): void {
  gsap.set(els, { attr: { r: 0 } });
}
/** a wire's start cap */
export function skCap(tl: Timeline, cap: SVGCircleElement, at: number): void {
  tl.to(cap, { attr: { r: SK_CAP_R }, duration: 0.15, ease: "back.out(2)" }, at);
}
/** the near-black dot a wire lands on */
export function skDot(tl: Timeline, dot: SVGCircleElement, at: number): void {
  tl.to(dot, { attr: { r: SK_CAP_R }, duration: 0.25, ease: "back.out(2.5)" }, at);
}
/** a coloured stop of radius r (the loved confetti's timing) */
export function skStop(tl: Timeline, dot: SVGCircleElement, r: number, at: number): void {
  tl.to(dot, { attr: { r }, duration: 0.35, ease: "back.out(2)" }, at);
}

/* ── a wire draws from its path's start (strokeDashoffset). Hidden (opacity 0) until 0.02 s
   into its draw: a zero-length dash still paints a speck at the start. It shows by a 1 ms
   tween, not a set, for the revert order (skLetGo) ── */
export function skHideWire(path: SVGPathElement): void {
  // +1: the full stroke shows at offset 0 whatever the length's rounding
  const len = path.getTotalLength() + 1;
  gsap.set(path, { opacity: 0, strokeDasharray: len, strokeDashoffset: len });
}
export function skWire(tl: Timeline, path: SVGPathElement, at: number, duration = 0.6): void {
  tl.to(path, { opacity: 1, duration: 0.001, ease: "none" }, at + 0.02);
  tl.to(path, { strokeDashoffset: 0, duration, ease: "power2.inOut" }, at);
}

/* ── a line of type or a group rises into place from y px below: --lp-sk-rise, which a
   .lp-sk-rise piece reads (story-kit.css). The piece must carry that class ── */
export function skHideRise(els: Element | Element[], y = 8): void {
  gsap.set(els, { autoAlpha: 0, "--lp-sk-rise": y });
}
export function skRise(tl: Timeline, el: Element, at: number, duration = 0.4): void {
  tl.to(el, { autoAlpha: 1, "--lp-sk-rise": 0, duration, ease: "power3.out" }, at);
  skLetGo(tl, el, "--lp-sk-rise", 0, at + duration + SK_LANDED);
}
