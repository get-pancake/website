// No "use client": a plain module reached only through LpInfraAnim's loader (kept out of the
// initial bundle, as the step and story builders are).
import { gsap } from "@/lib/gsap";

/**
 * The infra section's timelines (LpInfraAnim.tsx): the build-up played once (below), the scroll
 * version (buildInfraScroll: the three bricks, their details, Pancake) and the leads queue
 * (buildInfraLoop).
 *
 * The infra-first page's diagram build-up. progress(1) = the server markup
 * (restIsEnd); `cue` 0 = the first composed scene, never empty. Frame 0 is set before the
 * timeline exists, every move is a tween or a set (no callbacks), so both seek either way, and
 * cleanup() restores the rest markup's inline styles.
 *
 * Diagram flow (≈2.3 s):
 *   0          cue: the agents, the wire undrawn, Pancake and its three layers dimmed, the
 *              providers' discs not yet in, the Play switched off
 *   0.25       the agents send (a nudge on each chip)
 *   0.45       the wire draws down into Pancake (no sign-in pill on it since 2026-10-27)
 *   0.85       Pancake lights
 *   1.1        the brain, the data and the tools light up, in reading order: the brain's rows
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
  const line = one(root, ".lp-infra__line");
  const brand = one(root, ".lp-infra__brand");
  const parts = all(root, ".lp-infra__part");
  const rows = all(root, ".lp-infra__mem-row");
  const discs = all(root, ".lp-infra__disc");
  const toggle = one(root, ".lp-infra__toggle");
  const knob = one(root, ".lp-infra__toggle-knob");
  const lead = one(root, ".lp-infra__lead");

  const cleanup = restStyles([...chips, line, brand, ...parts, ...rows, ...discs, toggle, knob, lead]);

  /* ── frame 0 = cue ── */
  gsap.set(line, { scaleY: 0, transformOrigin: "50% 0%" });
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

  // the wire draws down into Pancake (as the sources story draws its wires)
  tl.to(line, { scaleY: 1, duration: 0.45, ease: "power2.inOut" }, 0.45);

  // Pancake lights
  tl.to(brand, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.85);

  // the brain, the data and the tools
  tl.to(parts, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.18 }, 1.1);
  tl.to(rows, { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.1 }, 1.2);
  tl.to(discs, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 }, 1.4);

  // the Play switches on, then the lead it found comes up for approval
  tl.to(knob, { x: 12, duration: 0.25, ease: "power2.inOut" }, 1.7);
  tl.to(toggle, { backgroundColor: TOGGLE_ON, duration: 0.25, ease: "power1.inOut" }, 1.7);
  tl.to(lead, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.0);

  return { tl, cleanup, cue: 0 };
}

/* ── the scroll version: the three bricks, their pieces, Pancake ─────────────────────────────────
   Founder 2026-10-26: "Your agent needs 3 things to sell", "show that pancake brings all 3 of them
   when scrolling … some components that are spread in the hero and end up as components from an
   UI as the scroll goes", "The reproduction should be PERFECT, the flow supersmooth every
   movement well calibrated". 2026-10-27, on the next versions: "way more juicy and spread accross
   the page … the tools a bit everywhere that go in 3 bucjets and unified in pancake", "des
   tailles differentes", "pas oblige de spread que des logos partout", "Les petits ronds peuvent
   etre des ronds imparfaits un peu comme les pancake du design system", "pas assez progressif et
   un peu brutal", then "Comment BCP plus insister sur les 3 briques CONTEXT / DATA / TOOLS ? Je
   les trouve anecdotiques du coup a cause de tous les logos … quitte a les faire arriver en
   premier puis faire arriver les petits details que sont les logos icp etc" and "Remove the
   'Pancake brings all 3.'".

   So the scroll tells it in three moves, the bricks first:
   1. the three bricks come up one after another, large and a little apart, under the heading and
      your agent, each word filling its brick: CONTEXT, DATA, TOOLS (its own badge, scaled up);
      then each window opens (founder 2026-10-27: "Peut etre que CONTEXT DATA TOOLS doit prendre
      toute la place au debut dans les encadres puis ouvrir la fenetre ?"): the word shrinks back
      into its badge, the title comes up and the white picture opens from its centre, empty;
   2. then the details of a company's go-to-market pop up all over the screen, in many sizes
      (LpInfra BITS: the brain's sections and notes, the Play's signals, providers and CRMs on the
      kit's pancakes, the Play's switch, a message, a lead; Mobbin: Front's and Tines' integration
      heroes, Antimetal's sizes for depth) and each flies into its brick along a curve, height
      first and then across, and becomes part of its picture (data-fill): a provider's mark lands
      and its disc pops in, a note lands and its row settles, the switch lands and the Play
      switches on, Tamsin lands and comes up for approval;
   3. the canvas comes in, Pancake's platform rises and the bricks close up into it (save.design's
      hero, measured live), Pancake's name comes up and the wire runs from it to your agent.

   One timeline of length 1, scrubbed by the smoothed scroll (LpInfraAnim), which starts it as
   the stage's top comes 45% down the window, before the pin, so something moves from the first
   notch on:
     0     – .18   the bricks come up, each word filling its brick (.1 each, .04 apart)
     .18   – .33   the windows open, left to right (.09 each, .03 apart)
     .28   – .66   the details pop up and fly in, brick by brick in reading order, overlapping
     .64   – .72   the canvas comes in
     .66   – .80   the platform rises 48 px and fades in
     .68   – .85   the bricks close up into it, left to right (.13 each, .02 apart)
     .84   – .89   Pancake's name
     .88   – .94   the wire, from Pancake up to the agent
     .94   – 1     hold
   progress(1) = the server markup, the details gone into their bricks. Built from the layout
   (where each piece is and where its brick's picture will be): LpInfraAnim builds it again when
   the window changes. Only transforms and opacity. */

/** the bricks while they fill: a size up and a little apart (px on the widest card, 1136; the
    gap narrows with the card) */
const BRICK = { scale: 1.12, apart: 70 } as const;

const BUCKETS = ["context", "data", "tools"] as const;
type Bucket = (typeof BUCKETS)[number];
/** when each brick's details pop up: the first one, then one every `gap` */
const WAVE: Record<Bucket, { start: number; gap: number }> = {
  context: { start: 0.28, gap: 0.024 },
  data: { start: 0.32, gap: 0.02 },
  tools: { start: 0.36, gap: 0.028 },
};
/** a detail popping up, waiting, flying in */
const POP = 0.035;
const WAIT = 0.015;
const FLIGHT = 0.13;
/** the bricks' words: how much of a brick's width the longest one fills, at most ×3; the windows
    open from .18, one every .03 */
const WORD = { share: 0.74, max: 3 } as const;
const OPEN = { at: 0.18, gap: 0.03, duration: 0.09 } as const;
/** a filled picture's beat (a disc's pop, a row settling) */
const FILL = 0.03;

export function buildInfraScroll(stage: HTMLElement): { tl: gsap.core.Timeline; cleanup: () => void } {
  const card = one(stage, ".lp-infra__card");
  const canvas = one(card, ".lp-infra__canvas");
  const parts = all(card, ".lp-infra__part");
  if (parts.length !== BUCKETS.length) throw new Error("infra scroll: three bricks expected");
  const pics = parts.map((part) => one(part, ".lp-infra__pic"));
  const words = parts.map((part) => one(part, ".lp-infra__part-name"));
  const titles = parts.map((part) => one(part, ".lp-infra__part-title"));
  const bits = all(card, ".lp-infra__bit");
  const rows = all(card, ".lp-infra__mem-row");
  const discs = all(card, ".lp-infra__disc");
  const play = one(card, ".lp-infra__play");
  const toggle = one(card, ".lp-infra__toggle");
  const knob = one(card, ".lp-infra__toggle-knob");
  const leads = one(card, ".lp-infra__leads");
  const plat = one(card, ".lp-infra__plat");
  const brand = one(card, ".lp-infra__brand");
  const line = one(card, ".lp-infra__line");

  const cleanup = restStyles([
    canvas,
    ...parts,
    ...pics,
    ...words,
    ...titles,
    ...bits,
    ...rows,
    ...discs,
    play,
    toggle,
    knob,
    leads,
    plat,
    brand,
    line,
  ]);

  /* ── where the bricks' pictures will be while they fill, measured on the markup (screen px; the
     card may be scaled to fit the window) ── */
  const fit = card.getBoundingClientRect().width / card.offsetWidth || 1;
  const apart = BRICK.apart * Math.min(1, card.offsetWidth / 1136);
  const centre = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const holes = parts.map((part, i) => {
    const pc = centre(part);
    const ic = centre(pics[i]);
    return {
      x: pc.x + (i - 1) * apart * fit + BRICK.scale * (ic.x - pc.x),
      y: pc.y + BRICK.scale * (ic.y - pc.y),
    };
  });
  // each word, scaled up the same for all three, sits in the middle of its brick
  const big = Math.min(WORD.max, ...parts.map((part, i) => (WORD.share * part.offsetWidth) / words[i].offsetWidth));
  const lifts = parts.map((part, i) => {
    const pc = centre(part);
    const wc = centre(words[i]);
    return { x: (pc.x - wc.x) / fit, y: (pc.y - wc.y) / fit };
  });
  // the windows open from their centre, with the pictures' own corners
  const round = getComputedStyle(pics[0]).borderTopLeftRadius || "16px";
  const shut = `inset(50% 50% 50% 50% round ${round})`;
  const open = `inset(0% 0% 0% 0% round ${round})`;

  /* ── frame 0: the heading and your agent; no brick yet, no detail, no canvas, no Pancake ── */
  gsap.set(canvas, { autoAlpha: 0 });
  parts.forEach((part, i) => {
    gsap.set(part, { autoAlpha: 0, x: (i - 1) * apart, y: 80, scale: 1.04, transformOrigin: "50% 50%" });
    gsap.set(words[i], { x: lifts[i].x, y: lifts[i].y, scale: big, transformOrigin: "50% 50%" });
    gsap.set(titles[i], { autoAlpha: 0, y: 8 });
    gsap.set(pics[i], { clipPath: shut });
  });
  for (const bit of bits) {
    const s = Number(bit.dataset.s) || 1;
    gsap.set(bit, {
      autoAlpha: 0,
      xPercent: -50,
      yPercent: -50,
      scale: s * 0.4,
      rotation: Number(bit.dataset.r) || 0,
      transformOrigin: "50% 50%",
    });
  }
  gsap.set(rows, { autoAlpha: 0, x: -6 });
  gsap.set(discs, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
  gsap.set(play, { autoAlpha: 0, y: 6 });
  gsap.set(toggle, { backgroundColor: TOGGLE_OFF });
  gsap.set(knob, { x: 0 });
  gsap.set(leads, { autoAlpha: 0, y: 6 });
  gsap.set(plat, { autoAlpha: 0, y: 48 });
  gsap.set(brand, { autoAlpha: 0, y: 10, scale: 0.94, transformOrigin: "50% 50%" });
  gsap.set(line, { scaleY: 0, transformOrigin: "50% 100%" });

  const tl = gsap.timeline({ paused: true });

  /* ── 1. the bricks come up, one after another, each word filling its brick; then the windows
     open: the word goes back into its badge, the title comes up, the picture opens ── */
  parts.forEach((part, i) => {
    tl.to(part, { autoAlpha: 1, duration: 0.06, ease: "power1.out" }, i * 0.04);
    tl.to(part, { y: 0, scale: BRICK.scale, duration: 0.1, ease: "power3.out" }, i * 0.04);
    const t = OPEN.at + i * OPEN.gap;
    tl.to(words[i], { x: 0, y: 0, scale: 1, duration: OPEN.duration, ease: "power3.inOut" }, t);
    tl.to(pics[i], { clipPath: open, duration: OPEN.duration, ease: "power2.out" }, t + 0.015);
    tl.to(titles[i], { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" }, t + 0.05);
  });

  /* ── 2. the details pop up and fly into their bricks: nearest first, Tamsin last ── */
  const landed: Record<Bucket, { fill?: string; at: number }[]> = { context: [], data: [], tools: [] };
  BUCKETS.forEach((to, b) => {
    const hole = holes[b];
    const flights = bits
      .filter((bit) => bit.dataset.to === to)
      .map((bit) => {
        const c = centre(bit);
        return { bit, dx: (hole.x - c.x) / fit, dy: (hole.y - c.y) / fit, s: Number(bit.dataset.s) || 1 };
      })
      .sort((p, q) => Number("last" in p.bit.dataset) - Number("last" in q.bit.dataset) || Math.hypot(p.dx, p.dy) - Math.hypot(q.dx, q.dy));
    flights.forEach(({ bit, dx, dy, s }, k) => {
      const t = WAVE[to].start + k * WAVE[to].gap;
      const go = t + POP + WAIT;
      const odd = k % 2 === 1;
      tl.to(bit, { autoAlpha: 1, scale: s, duration: POP, ease: "back.out(1.7)" }, t);
      // height first, then across: the curve; a little apart, so they do not all land on one pixel
      tl.to(bit, { y: dy + (odd ? 6 : -6), duration: FLIGHT, ease: odd ? "power1.out" : "power2.out" }, go);
      tl.to(bit, { x: dx + ((k % 3) - 1) * 14, duration: FLIGHT, ease: odd ? "power2.in" : "power3.in" }, go);
      tl.to(bit, { scale: s * 0.4, rotation: 0, duration: FLIGHT, ease: "power1.in" }, go);
      tl.to(bit, { autoAlpha: 0, duration: FLIGHT * 0.3, ease: "power1.in" }, go + FLIGHT * 0.7);
      landed[to].push({ fill: bit.dataset.fill, at: go + FLIGHT * 0.82 });
    });
  });

  // each brick's picture fills as its details land: what a detail names (data-fill) comes in with
  // it, the Play with the brick's first detail, the rest (a row, "30+") with its last
  for (const el of all(card, ".lp-infra__parts [data-fill]")) {
    const mine = landed[BUCKETS[parts.findIndex((part) => part.contains(el))]];
    const hit = mine.find((l) => l.fill === el.dataset.fill);
    const t = hit ? hit.at : el.dataset.fill === "play" ? mine[0].at : mine[mine.length - 1].at;
    if (el === toggle) {
      tl.to(knob, { x: 12, duration: FILL, ease: "power2.inOut" }, t);
      tl.to(toggle, { backgroundColor: TOGGLE_ON, duration: FILL, ease: "power1.inOut" }, t);
    } else if (discs.includes(el)) {
      tl.to(el, { autoAlpha: 1, scale: 1, duration: FILL, ease: "back.out(2)" }, t);
    } else if (rows.includes(el)) {
      tl.to(el, { autoAlpha: 1, x: 0, duration: FILL, ease: "power2.out" }, t);
    } else {
      tl.to(el, { autoAlpha: 1, y: 0, duration: FILL, ease: "power2.out" }, t);
    }
  }

  /* ── 3. the canvas comes in, the platform rises, the bricks close up into it; Pancake's name and
     the wire up to your agent ── */
  tl.to(canvas, { autoAlpha: 1, duration: 0.08, ease: "power1.out" }, 0.64);
  tl.to(plat, { autoAlpha: 1, duration: 0.1, ease: "power1.out" }, 0.66);
  tl.to(plat, { y: 0, duration: 0.14, ease: "power2.out" }, 0.66);
  parts.forEach((part, i) => {
    tl.to(part, { x: 0, scale: 1, duration: 0.13, ease: "power2.inOut" }, 0.68 + i * 0.02);
  });
  tl.to(brand, { autoAlpha: 1, y: 0, scale: 1, duration: 0.05, ease: "power3.out" }, 0.84);
  tl.to(line, { scaleY: 1, duration: 0.06, ease: "power1.inOut" }, 0.88);
  tl.to({}, { duration: 0.06 }, 0.94);

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
