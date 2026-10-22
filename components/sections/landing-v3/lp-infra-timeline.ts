// No "use client": a plain module reached only through LpInfraAnim's loader (kept out of the
// initial bundle, as the step and story builders are).
import { gsap } from "@/lib/gsap";

/**
 * The infra-first page's diagram build-up (LpInfraAnim.tsx). progress(1) = the server markup
 * (restIsEnd); `cue` 0 = the first composed scene, never empty. Frame 0 is set before the
 * timeline exists, every move is a tween or a set (no callbacks), so both seek either way, and
 * cleanup() restores the rest markup's inline styles.
 *
 * Diagram flow (≈2.7 s):
 *   0          cue: the agents, the wires undrawn, Pancake and its three layers dimmed, the
 *              providers' discs not yet in, the Play switched off
 *   0.25       the agents send (a nudge on each chip)
 *   0.45       the wire draws down, a dot rides it; the sign-in pill appears; the second wire
 *   1.25       Pancake lights
 *   1.5        the brain, the data and the tools light up, in reading order: the brain's rows
 *              settle, the providers' discs pop in, the Play switches on and the lead comes up
 */

type Built = { tl: gsap.core.Timeline; cleanup: () => void; cue: number };

/** the Play's switch, off and on (ink-50 → pink-30, foundation.css) */
const TOGGLE_OFF = "#ddcfcd";
const TOGGLE_ON = "#ff7aa0";

function all<E extends Element = HTMLElement>(root: Element, sel: string) {
  return Array.from(root.querySelectorAll<E>(sel));
}

function one<E extends Element = HTMLElement>(root: Element, sel: string) {
  const el = root.querySelector<E>(sel);
  if (!el) throw new Error(`infra timeline: ${sel} is missing`);
  return el;
}

/** cleanup(): every element the builder styled gets its rest inline style back */
function restStyles(touched: Element[]) {
  const styles = touched.map((el) => el.getAttribute("style"));
  return () =>
    touched.forEach((el, i) => {
      const style = styles[i];
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    });
}

export function buildInfraFlow(root: HTMLElement): Built {
  const chips = all(root, ".lp-infra__agent");
  const lines = all(root, ".lp-infra__line");
  const dots = all(root, ".lp-infra__dot");
  const wires = all(root, ".lp-infra__wire");
  if (lines.length !== 2 || dots.length !== 2 || wires.length !== 2) throw new Error("infra timeline: two wires expected");
  const caption = one(root, ".lp-infra__link-text");
  const brand = one(root, ".lp-infra__brand");
  const parts = all(root, ".lp-infra__part");
  const rows = all(root, ".lp-infra__mem-row");
  const discs = all(root, ".lp-infra__disc");
  const signals = all(root, ".lp-infra__signal");
  const toggle = one(root, ".lp-infra__toggle");
  const knob = one(root, ".lp-infra__toggle-knob");
  const meta = one(root, ".lp-infra__play-meta");
  const lead = one(root, ".lp-infra__lead");

  const cleanup = restStyles([
    ...chips,
    ...lines,
    ...dots,
    caption,
    brand,
    ...parts,
    ...rows,
    ...discs,
    ...signals,
    toggle,
    knob,
    meta,
    lead,
  ]);

  /* ── frame 0 = cue ── */
  gsap.set(lines, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(dots, { autoAlpha: 0, y: 0 });
  gsap.set(caption, { autoAlpha: 0, y: 4 });
  gsap.set(brand, { autoAlpha: 0.35, scale: 0.94, transformOrigin: "50% 50%" });
  gsap.set(parts, { autoAlpha: 0.4, y: 8 });
  gsap.set(rows, { autoAlpha: 0.3, x: -6 });
  gsap.set(discs, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
  gsap.set(signals, { autoAlpha: 0.3 });
  gsap.set(toggle, { backgroundColor: TOGGLE_OFF });
  gsap.set(knob, { x: 0 });
  gsap.set([meta, lead], { autoAlpha: 0.3 });
  gsap.set(lead, { y: 4 });

  const tl = gsap.timeline({ paused: true });

  // the agents send
  tl.to(chips, { scale: 1.04, duration: 0.14, ease: "power2.out", stagger: 0.06, yoyo: true, repeat: 1 }, 0.25);

  // the two wires, each drawn with a dot riding its front; the sign-in pill between them
  wires.forEach((wire, i) => {
    const t = 0.45 + i * 0.5;
    const length = wire.offsetHeight || 24;
    tl.to(lines[i], { scaleY: 1, duration: 0.35, ease: "power2.inOut" }, t);
    tl.set(dots[i], { autoAlpha: 1 }, t);
    tl.to(dots[i], { y: length, duration: 0.35, ease: "power2.inOut" }, t);
    tl.set(dots[i], { autoAlpha: 0 }, t + 0.36);
  });
  tl.to(caption, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.75);

  // Pancake lights
  tl.to(brand, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 1.25);

  // the brain, the data and the tools
  tl.to(parts, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.18 }, 1.5);
  tl.to(rows, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.1 }, 1.6);
  tl.to(discs, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 }, 1.8);
  tl.to(signals, { autoAlpha: 1, duration: 0.25, ease: "power1.out", stagger: 0.06 }, 2.05);

  // the Play switches on, then the lead it found comes up for approval
  tl.to(knob, { x: 12, duration: 0.25, ease: "power2.inOut" }, 2.1);
  tl.to(toggle, { backgroundColor: TOGGLE_ON, duration: 0.25, ease: "power1.inOut" }, 2.1);
  tl.to(meta, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 2.25);
  tl.to(lead, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.4);

  return { tl, cleanup, cue: 0 };
}
