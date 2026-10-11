// No "use client" on purpose (phase N, 2026-10-11, as the three other story timelines): this
// module is reached only through the client loaders (lp-dive-loaders.ts), and a "use client"
// module that a server graph ever reaches again would ship eagerly in the homepage bundle.
import { gsap } from "@/lib/gsap";

import type { BuiltStory, DiveStageLayout } from "./lp-dive-stages";
import { registerTxtPlugin } from "./lp-gsap-txt";
import { LEARNS } from "./lp-story-learns-data";

/**
 * Deep-dive story "Pancake learns from what wins" — its build-up as ONE paused, seek-safe GSAP timeline on the
 * stage root (Figma 4964:2021 / 2404 / 2448 / 2490 / 4052). Owner: story-learns package. Contract: lp-dive-stages.ts and
 * code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens
 * only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the first composed
 * scene. Reached only through its lazy loader (DIVE_LOADERS.learns, lp-dive-loaders.ts).
 *
 * The storyboard has no prototype or motion data: the beats below are derived from its frames
 * and the designer's motion arrows in frame 4 (never rendered). Times in seconds:
 *
 *   0      cue: the Plays list, every share at 50% and unlabeled, months oct / nov / dec
 *   A 0.40–2.15  two months pass: the axis slides to dec / jan / feb while the shares tick to
 *          their values, take their tone colour, and the app's labels appear (Strong / Weak,
 *          none in between)                                        → Figma frame 2 at 2.15
 *   B 2.50–3.15  the winners lift (shadow), the rest recedes to 0.821389 and .32, axis goes
 *                                                                  → Figma frame 3 at 3.15
 *   C 3.35–4.00  the brain rises, the losers slide out right, the 80% row shrinks
 *                                                                  → Figma frame 4 at 4.0046
 *   D 4.05–4.90  both winners drop into the brain (each draws in, then falls), the brain gulps
 *   E 5.15–7.75  the brain sinks away and production f4's cards build: "Brain learned" + chips,
 *          "Brain updated" with its rainbow ring drawn around it    → rest = END picture
 *
 * Phones (400×520 box) run the same beats on the phone composition's constants.
 */

/** the back layer's recede scale (Figma frame 3: 482.977 / 588) */
const K = 0.821389;
/** the 80% row on its way into the brain (Figma frame 4: 314 / 588) */
const K_SHRINK = 0.534014;

type Geo = {
  /** the axis strip's travel: two months */
  strip: number;
  /** losers' exit distance, stage px (they sit in the back layer: local = px / K) */
  exit: number;
  /** where the winners land: 5px inside the disc's top, on its vertical axis */
  land: { x: number; y: number };
  /** row centres (data order) */
  rowX: number;
  rowY: readonly [number, number, number, number];
  backOrigin: string;
};

const GEO: Record<DiveStageLayout, Geo> = {
  desktop: {
    strip: -639.71, // 2 × 319.855
    exit: 640, // at T4: Weak +428.489, the in-between row +339.840 (Figma frame 4)
    land: { x: 386.45, y: 362 },
    rowX: 383.684,
    rowY: [151.5, 213.5, 275.5, 337.5],
    backOrigin: "383.684px 212.52px",
  },
  phone: {
    strip: -320, // 2 × 160
    exit: 405,
    land: { x: 200, y: 393 },
    rowX: 200,
    rowY: [130, 210, 290, 370],
    backOrigin: "200px 218px",
  },
};

/** the brain disc's hand-drawn rainbow ring (lp-story-learns-art.ts explains the drawing) */
const RING_SRC = "/lp/story-learns/brain-ring.svg";
/** the brain's hidden offset (fully below either box) */
const DROP = 150;
const LIFT_FROM = "0px 0px 0px 0px rgba(0, 0, 0, 0)";
const LIFT_TO = "0px 14px 19px 0px rgba(0, 0, 0, 0.15)"; // = --lp-sl-lift

const T = {
  strip: 0.4, // A: the axis slides 0.40 → 1.90
  count: 0.5, // A: row r's share ticks from 0.50 + 0.05·r for 1.20 s
  countStep: 0.05,
  countDur: 1.2,
  tone: 0.35, // the value takes its colour over the last 0.35 s of its count
  lift: 2.5, // B
  brain: 3.35, // C
  exit2: 3.4216, // C: the second loser's start, solved so both frame-4 offsets match Figma
  shrink: 3.45, // C: the 80% row
  t4: 4.0046,
  drop80: 4.05, // D
  drop93: 4.25,
  gulp1: 4.47,
  gulp2: 4.87,
  away: 5.15, // E
  worked: 5.45,
  chips: 5.75,
  bgroup: 6.1,
  ring: 6.25,
  sub: 6.75,
} as const;

/** Which composition the stage sits in. COPIED from lp-dive-stages.ts diveStageLayout (same
    logic): a runtime import of the registry would pull all four Stage components, their copy and
    art into this lazy chunk; the shell mirrors its loaders for the same reason. */
function stageLayout(root: HTMLElement): DiveStageLayout {
  const scene = root.closest<HTMLElement>("[data-lp-layout]");
  const declared = scene?.dataset.lpLayout;
  if (declared === "phone" || declared === "desktop") return declared;
  return (scene ?? root).offsetWidth < 600 ? "phone" : "desktop";
}

function query(root: HTMLElement) {
  return {
    $: <E extends Element = HTMLElement>(sel: string): E => {
      const el = root.querySelector<E>(sel);
      if (!el) throw new Error(`lp-story-learns: missing ${sel}`);
      return el;
    },
    $$: <E extends Element = HTMLElement>(sel: string): E[] => Array.from(root.querySelectorAll<E>(sel)),
  };
}

export function buildStoryLearns(root: HTMLElement): BuiltStory {
  registerTxtPlugin();
  const { $, $$ } = query(root);
  const geo = GEO[stageLayout(root)];

  const scene = $(".lp-sl-scene");
  const back = $(".lp-sl-back");
  const title = $(".lp-sl-title");
  const axis = $(".lp-sl-axis");
  const strip = $(".lp-sl-strip");
  const disc = $(".lp-sl-disc");
  const ring = $(".lp-sl-discring");
  const label = $(".lp-sl-brainlabel");
  const rows = LEARNS.rows.map((_, i) => $(`.lp-sl-row--${i}`));
  const vals = rows.map((row) => row.querySelector<HTMLElement>(".lp-sl-val")!);
  const statuses = rows.map((row) => row.querySelector<HTMLElement>(".lp-sl-status")!);
  const worked = $(".lp-sl-worked");
  const chips = $$(".lp-sl-chip");
  const bgroup = $(".lp-sl-bgroup");
  const sub = $(".lp-sl-brainsub");
  const dps = [1, 2, 3, 4].map((i) => $<SVGPathElement>(`#lpsl-dp${i}`)); // purple, orange, blue, pink

  // the paints, read from the stylesheet BEFORE frame 0 overrides them (the rest markup carries
  // each row's tone colour)
  const ink = getComputedStyle(rows[0]).color;
  const tones = vals.map((val) => getComputedStyle(val).color);

  // the rest markup, for cleanup(): every element this builder animates, its inline style, and
  // the shares' text
  const touched: Element[] = [scene, back, title, axis, strip, disc, ring, label, ...rows, ...vals, ...statuses, worked, ...chips, bgroup, sub, ...dps];
  const restStyle = touched.map((el) => el.getAttribute("style"));
  const restText = vals.map((val) => val.textContent);

  /* ── frame 0 (gsap.set: the context's revert restores the rest markup) ── */
  gsap.set(scene, { autoAlpha: 1 });
  gsap.set(back, { transformOrigin: geo.backOrigin });
  vals.forEach((val, i) => {
    gsap.set(val, { txt: `${LEARNS.rows[i].start}%`, color: ink, width: LEARNS.cueValueWidth });
  });
  LEARNS.rows.forEach((row, i) => {
    if (row.tone !== "none") gsap.set(statuses[i], { autoAlpha: 0 });
  });
  rows.forEach((row, i) => {
    if (LEARNS.rows[i].winner) gsap.set(row, { boxShadow: LIFT_FROM });
  });
  gsap.set(ring, { backgroundImage: `url("${RING_SRC}")` }); // fetched now, a viewport ahead of the play
  gsap.set([disc, label], { y: DROP });
  gsap.set(label, { transformOrigin: "45.766px 59.059px" });
  // ring draw guides: dash = pill length (+4 so the closing seam overlaps), fully offset = nothing drawn
  const lens = dps.map((p) => p.getTotalLength() + 4);
  dps.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }));

  const tl = gsap.timeline({ paused: true });

  /* ── A · two months pass ── */
  tl.to(strip, { x: geo.strip, duration: 1.5, ease: "power2.inOut" }, T.strip);
  LEARNS.rows.forEach((row, i) => {
    const t0 = T.count + T.countStep * i;
    const steps = Math.abs(row.end - row.start);
    const dir = Math.sign(row.end - row.start);
    // the f4 count curve: brisk ticks, soft landing
    for (let j = 1; j <= steps; j++) {
      const p = 1 - Math.pow(1 - j / steps, 1 / 1.6);
      tl.set(vals[i], { txt: `${row.start + dir * j}%` }, t0 + T.countDur * p);
    }
    tl.to(vals[i], { color: tones[i], duration: T.tone, ease: "none" }, t0 + T.countDur - T.tone);
    if (row.valueWidth !== LEARNS.cueValueWidth) {
      tl.to(vals[i], { width: row.valueWidth, duration: T.countDur, ease: "power1.out" }, t0);
    }
    // the app labels a Play once its share clears a threshold (none in between)
    if (row.tone !== "none") {
      tl.to(statuses[i], { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, t0 + T.countDur);
    }
  });

  /* ── B · the winners lift, the rest recedes ── */
  tl.to(back, { scale: K, opacity: 0.32, duration: 0.65, ease: "power3.inOut" }, T.lift);
  tl.to(axis, { autoAlpha: 0, y: 8, duration: 0.35, ease: "power2.in" }, T.lift);
  rows.forEach((row, i) => {
    if (!LEARNS.rows[i].winner) return;
    tl.to(row, { boxShadow: LIFT_TO, duration: 0.65, ease: "power3.out" }, T.lift);
  });

  /* ── C · the brain rises, the losers leave, the 80% row shrinks ── */
  tl.to([disc, label], { y: 0, duration: 0.65, ease: "power3.out" }, T.brain);
  const losers = rows.filter((_, i) => !LEARNS.rows[i].winner);
  // quadratic in (GSAP power1 = quad): at T4 the eased progress is .6695 / .5311, which puts the
  // two losers exactly at Figma's frame-4 offsets
  losers.forEach((row, n) => {
    tl.to(row, { x: geo.exit / K, duration: 0.8, ease: "power1.in" }, n === 0 ? T.brain : T.exit2);
  });
  const [first, second] = rows.filter((_, i) => LEARNS.rows[i].winner);
  const [firstI, secondI] = LEARNS.rows.flatMap((row, i) => (row.winner ? [i] : []));
  tl.to(second, { scale: K_SHRINK, duration: T.t4 - T.shrink, ease: "power2.inOut" }, T.shrink);

  /* ── D · both winners drop into the brain, the brain gulps ── */
  const dx = geo.land.x - geo.rowX;
  tl.to(second, { y: geo.land.y - geo.rowY[secondI], duration: 0.45, ease: "power2.in" }, T.drop80);
  tl.to(second, { x: dx, duration: 0.45, ease: "none" }, T.drop80);
  tl.to(second, { scale: 0.1, duration: 0.45, ease: "power1.in" }, T.drop80);
  tl.to(second, { autoAlpha: 0, duration: 0.2, ease: "none" }, T.drop80 + 0.25);
  // the first winner follows the converging arrows: its ends draw in early, then it falls late
  tl.to(first, { scaleX: 0.1, duration: 0.65, ease: "power2.out" }, T.drop93);
  tl.to(first, { scaleY: 0.3, duration: 0.65, ease: "power1.in" }, T.drop93);
  tl.to(first, { y: geo.land.y - geo.rowY[firstI], duration: 0.65, ease: "power2.in" }, T.drop93);
  tl.to(first, { x: dx, duration: 0.65, ease: "none" }, T.drop93);
  tl.to(first, { autoAlpha: 0, duration: 0.2, ease: "none" }, T.drop93 + 0.45);
  [T.gulp1, T.gulp2].forEach((t) => {
    tl.to([disc, label], { scale: 1.035, duration: 0.12, ease: "power2.out" }, t);
    tl.to([disc, label], { scale: 1, duration: 0.23, ease: "power2.inOut" }, t + 0.12);
  });

  /* ── E · the brain hands over to the cards (production f4's beats) ── */
  tl.to([disc, label], { y: DROP, duration: 0.5, ease: "power2.in" }, T.away);
  tl.to(title, { opacity: 0, duration: 0.3, ease: "none" }, T.away);
  // empty by then: off the paint list for good. A short tween, not a set: gsap.context's revert
  // orders zero-duration tweens by an inconsistent sort (engine-dependent: Firefox reverted this
  // one after frame 0's set and left the scene showing), tweens with a duration revert first.
  tl.to(scene, { autoAlpha: 0, duration: 0.05, ease: "none" }, T.away + 0.55);
  tl.fromTo(worked, { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, T.worked);
  tl.fromTo(
    chips,
    { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" },
    { scale: 1, autoAlpha: 1, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.7)", stagger: 0.1 },
    T.chips,
  );
  tl.fromTo(bgroup, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, T.bgroup);
  dps.forEach((p, i) => {
    tl.to(p, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, T.ring + 0.1 * i);
  });
  tl.fromTo(sub, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, T.sub);
  // → 7.75 s: the last ring path lands; the picture is the server markup

  /* cleanup runs after the caller's ctx.revert(). That revert is not enough on its own here:
     gsap.context sorts what it reverts with a comparator that is inconsistent for zero-duration
     tweens and for tweens starting at the same time, so their order is engine-dependent — Firefox
     left the label at y 150 and the first winner mid-fall. Put the rest markup back explicitly:
     clear GSAP's inline styles and transform cache, restore the server's inline styles and the
     shares' text. */
  const cleanup = () => {
    gsap.set(touched, { clearProps: "all" });
    touched.forEach((el, i) => {
      const style = restStyle[i];
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    });
    vals.forEach((val, i) => {
      val.textContent = restText[i];
    });
  };

  return { tl, cleanup, cue: 0 };
}
