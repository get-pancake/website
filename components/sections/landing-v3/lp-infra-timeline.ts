// No "use client": a plain module reached only through LpInfraAnim's loader (kept out of the
// initial bundle, as the step and story builders are).
import { gsap } from "@/lib/gsap";

/**
 * The infra section's timelines (LpInfraAnim.tsx): the build-up played once (below), the scroll
 * version (buildInfraScroll) and the leads queue (buildInfraLoop).
 *
 * The infra-first page's diagram build-up. progress(1) = the server markup
 * (restIsEnd); `cue` 0 = the first composed scene, never empty. Frame 0 is set before the
 * timeline exists, every move is a tween or a set (no callbacks), so both seek either way, and
 * cleanup() restores the rest markup's inline styles.
 *
 * Diagram flow (≈2.7 s):
 *   0          cue: the agents, the wires undrawn, Pancake and its three layers dimmed, the
 *              providers' discs not yet in, the Play switched off
 *   0.25       the agents send (a nudge on each chip)
 *   0.45       the wire draws down; the sign-in pill appears; the second wire
 *   1.25       Pancake lights
 *   1.5        the brain, the data and the tools light up, in reading order: the brain's rows
 *              settle, the providers' discs pop in, the Play switches on and the lead comes up
 *              (no signal chips and no status line since 2026-10-26: "Trop de texte")
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
  if (lines.length !== 2) throw new Error("infra timeline: two wires expected");
  const caption = one(root, ".lp-infra__link-text");
  const brand = one(root, ".lp-infra__brand");
  const parts = all(root, ".lp-infra__part");
  const rows = all(root, ".lp-infra__mem-row");
  const discs = all(root, ".lp-infra__disc");
  const toggle = one(root, ".lp-infra__toggle");
  const knob = one(root, ".lp-infra__toggle-knob");
  const lead = one(root, ".lp-infra__lead");

  const cleanup = restStyles([
    ...chips,
    ...lines,
    caption,
    brand,
    ...parts,
    ...rows,
    ...discs,
    toggle,
    knob,
    lead,
  ]);

  /* ── frame 0 = cue ── */
  gsap.set(lines, { scaleY: 0, transformOrigin: "50% 0%" });
  gsap.set(caption, { autoAlpha: 0, y: 4 });
  gsap.set(brand, { autoAlpha: 0.35, scale: 0.94, transformOrigin: "50% 50%" });
  gsap.set(parts, { autoAlpha: 0.4, y: 8 });
  gsap.set(rows, { autoAlpha: 0.3, x: -6 });
  gsap.set(discs, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
  gsap.set(toggle, { backgroundColor: TOGGLE_OFF });
  gsap.set(knob, { x: 0 });
  gsap.set(lead, { autoAlpha: 0.3 });
  gsap.set(lead, { y: 4 });

  const tl = gsap.timeline({ paused: true });

  // the agents send
  tl.to(chips, { scale: 1.04, duration: 0.14, ease: "power2.out", stagger: 0.06, yoyo: true, repeat: 1 }, 0.25);

  // the two wires draw down (as the sources story draws its wires), the sign-in pill between them
  lines.forEach((line, i) => {
    tl.to(line, { scaleY: 1, duration: 0.35, ease: "power2.inOut" }, 0.45 + i * 0.5);
  });
  tl.to(caption, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.75);

  // Pancake lights
  tl.to(brand, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 1.25);

  // the brain, the data and the tools
  tl.to(parts, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.18 }, 1.5);
  tl.to(rows, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.1 }, 1.6);
  tl.to(discs, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 }, 1.8);

  // the Play switches on, then the lead it found comes up for approval
  tl.to(knob, { x: 12, duration: 0.25, ease: "power2.inOut" }, 2.1);
  tl.to(toggle, { backgroundColor: TOGGLE_ON, duration: 0.25, ease: "power1.inOut" }, 2.1);
  tl.to(lead, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.4);

  return { tl, cleanup, cue: 0 };
}

/* ── the scroll version: the three things come together ──────────────────────────────────────────
   Founder 2026-10-26: "Your agent needs 3 things to sell", "show that pancake brings all 3 of them
   when scrolling … some components that are spread in the hero and end up as components from an
   UI as the scroll goes", then "The reproduction should be PERFECT, the flow supersmooth every
   movement well calibrated". The model is save.design's hero, measured live: the stage pins, a
   short hold on the scattered pieces, the product's frame rises and fades in, the pieces converge
   into it, a hold before the pin lets go. Here the pieces ARE the product's parts: the three
   cards, scattered and tilted around the empty canvas, settle into Pancake's platform; Pancake's
   name comes up on it, the wire runs from Pancake up to your agent through the sign-in, and the
   payoff line lands under the heading.

   One timeline of length 1, scrubbed by the scroll (LpInfraAnim smooths the scroll's progress):
     0     – .10   hold: the cards scattered, no platform, no Pancake, no wire
     .10   – .40   the platform rises 48 px and fades in
     .24   – .64   the cards settle into it, left to right (each .30, .05 apart)
     .60   – .70   Pancake's name
     .68   – .84   the wire, from Pancake up to the agent: the lower wire, the sign-in, the upper
     .82   – .90   "Pancake brings all 3."
     .90   – 1     hold
   progress(1) = the server markup. Only transforms and opacity. */

/** each card's scattered place, from its slot (px, deg), on the widest card (1136): Context low
    left, Data high in the middle under the agent, Tools right, tilted apart, so no two paths
    cross and every card stays inside the canvas (the spread narrows with the card) */
const SCATTER = [
  { x: -56, y: -44, rotation: -7, scale: 0.88 },
  { x: 0, y: -128, rotation: 3, scale: 0.88 },
  { x: 56, y: -84, rotation: 5, scale: 0.88 },
] as const;

export function buildInfraScroll(stage: HTMLElement): { tl: gsap.core.Timeline; cleanup: () => void } {
  const parts = all(stage, ".lp-infra__part");
  if (parts.length !== SCATTER.length) throw new Error("infra scroll: three cards expected");
  const plat = one(stage, ".lp-infra__plat");
  const brand = one(stage, ".lp-infra__brand");
  const lines = all(stage, ".lp-infra__line");
  if (lines.length !== 2) throw new Error("infra scroll: two wires expected");
  const caption = one(stage, ".lp-infra__link-text");
  const lede = one(stage, ".lp-infra__lede");

  const spread = Math.min(1, one(stage, ".lp-infra__card").offsetWidth / 1136);

  const cleanup = restStyles([...parts, plat, brand, ...lines, caption, lede]);

  /* ── frame 0: the three things, scattered ── */
  parts.forEach((part, i) => gsap.set(part, { ...SCATTER[i], x: SCATTER[i].x * spread, transformOrigin: "50% 50%" }));
  gsap.set(plat, { autoAlpha: 0, y: 48 });
  gsap.set(brand, { autoAlpha: 0, y: 10, scale: 0.94, transformOrigin: "50% 50%" });
  gsap.set(lines, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.set(caption, { autoAlpha: 0, y: 4 });
  gsap.set(lede, { autoAlpha: 0, y: 12 });

  const tl = gsap.timeline({ paused: true });

  // the platform rises under the cards
  tl.to(plat, { autoAlpha: 1, duration: 0.24, ease: "power1.out" }, 0.1);
  tl.to(plat, { y: 0, duration: 0.3, ease: "power3.out" }, 0.1);

  // the cards settle into it
  parts.forEach((part, i) => {
    tl.to(part, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.3, ease: "power3.inOut" }, 0.24 + i * 0.05);
  });

  // Pancake's name, then the wire up to the agent
  tl.to(brand, { autoAlpha: 1, y: 0, scale: 1, duration: 0.1, ease: "power3.out" }, 0.6);
  tl.to(lines[1], { scaleY: 1, duration: 0.08, ease: "power1.inOut" }, 0.68);
  tl.to(caption, { autoAlpha: 1, y: 0, duration: 0.07, ease: "power2.out" }, 0.73);
  tl.to(lines[0], { scaleY: 1, duration: 0.08, ease: "power1.inOut" }, 0.76);

  // the payoff, then the hold
  tl.to(lede, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power3.out" }, 0.82);
  tl.to({}, { duration: 0.1 }, 0.9);

  return { tl, cleanup };
}

/* ── after the build-up: the leads queue ─────────────────────────────────────────────────────────
   Founder 2026-10-26: "Un peu de dynamisme. Un peu de juice!!!", then on the first passes
   (ambient loops, floating notes, beams, rings): "Ton animation elle fait molle et tres vibe codee
   dude", "Peut etre qu il faut faire plus simple comme animation !" and "nothing should look vibe
   coded / everything should be inspired from our design system OR from a best in class component
   taken from mobbin". So the diagram rests on its end picture like every animated card of the
   page, and only the product keeps working where it would: the Play's leads come up for approval
   one after another (Mobbin: Antimetal's "Needs your decision" cards, Approve → done), 3 s each:
     0      the lead is up, "Approve" in pink
     1.2    the press, then a green "Approved"
     2.3    the lead slides out, the next one comes up with its pink button
   LpInfraAnim builds it once the build-up is done, plays it while the card is on screen and the
   tab visible, and never under reduced motion. cleanup() gives back the build-up's end picture. */

/** colours the queue tweens (foundation.css: pink-30, green-10) */
const PINK_30 = "#ff7aa0";
const GREEN_10 = "#ceead5";
/** one lead */
const BEAT = 3;

export function buildInfraLoop(root: HTMLElement): { tl: gsap.core.Timeline; cleanup: () => void } {
  const leads = all(root, ".lp-infra__lead");
  const buttons = leads.map((lead) => ({
    btn: one(lead, ".lp-infra__approve"),
    todo: one(lead, ".lp-infra__approve-do"),
    done: one(lead, ".lp-infra__approve-ok"),
  }));
  if (leads.length < 2) throw new Error("infra loop: the queue needs two leads");

  const cleanup = restStyles([...leads, ...buttons.flatMap((b) => [b.btn, b.todo, b.done])]);

  /* the starting picture = the build-up's end: the first lead up with its pink button */
  gsap.set(leads, { autoAlpha: 0, y: 0 });
  gsap.set(leads[0], { autoAlpha: 1 });
  for (const b of buttons) {
    gsap.set(b.btn, { backgroundColor: PINK_30, scale: 1 });
    gsap.set(b.todo, { opacity: 1 });
    gsap.set(b.done, { opacity: 0 });
  }

  const tl = gsap.timeline({ paused: true, repeat: -1 });
  leads.forEach((lead, k) => {
    const t = k * BEAT;
    const b = buttons[k];
    tl.to(
      b.btn,
      {
        keyframes: [
          { scale: 0.92, duration: 0.08, ease: "power2.out" },
          { scale: 1, duration: 0.3, ease: "back.out(2.4)" },
        ],
      },
      t + 1.2,
    );
    tl.to(b.btn, { backgroundColor: GREEN_10, duration: 0.15, ease: "power1.out" }, t + 1.25);
    tl.to(b.todo, { opacity: 0, duration: 0.1, ease: "none" }, t + 1.25);
    tl.to(b.done, { opacity: 1, duration: 0.12, ease: "none" }, t + 1.3);

    const n = (k + 1) % leads.length;
    tl.to(lead, { autoAlpha: 0, y: -8, duration: 0.22, ease: "power2.in" }, t + 2.3);
    tl.set(buttons[n].btn, { backgroundColor: PINK_30, scale: 1 }, t + 2.3);
    tl.set(buttons[n].todo, { opacity: 1 }, t + 2.3);
    tl.set(buttons[n].done, { opacity: 0 }, t + 2.3);
    tl.fromTo(leads[n], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out", immediateRender: false }, t + 2.42);
  });
  // the last lead's full beat before the repeat
  tl.to({}, { duration: 0.01 }, leads.length * BEAT - 0.01);

  return { tl, cleanup };
}
