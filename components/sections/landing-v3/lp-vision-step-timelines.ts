// No "use client" on purpose: a plain module, reached only through LpVisionStepAnim's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { STEP } from "./lp-demo-pancake-timeline";
import { registerTxtPlugin } from "./lp-gsap-txt";
import type { VisionStepVariant } from "./lp-vision-data";

/**
 * The takes of the vision homepage's 1-2-3 (LpVisionStepMocks.tsx, 2026-11-11), one per card,
 * each played once by lp-play-once as its card reaches the reader.
 *   v1  the four sources connect one after the other; each one's wire joins the line into
 *       Pancake; the two tables' counts go up as each source arrives
 *   v2  four kinds of signal fire in turn (their light goes on, their dot lands on the account
 *       with what it says); then a line connects the dots
 *   v3  the account comes up beside the designer's Brain; a ping runs through the Brain from its
 *       centre and it grows, hub by hub (the designer's own motion for a lead's verdict, without
 *       its elastic ease); the next best Play rises, then its who, its when and its why
 * The contract of the page's timelines: the markup is the END picture; every piece is looked up
 * and measured before anything is written (a missing piece throws there and the server's picture
 * stands); frame 0 is a block of gsap.set; the timeline holds tweens only (an instant change is
 * a 1 ms tween), so it can be seeked both ways (QA: window.__lpStep.v1 / v2 / v3). Eases never
 * overshoot (power1 to power3), nothing loops. Transforms stay 2D (force3D off): a 3D one
 * re-rasterises the scaled stage for the length of the tween (steps.css, the s4 note).
 */

type Timeline = gsap.core.Timeline;
type Built = { tl: Timeline; cleanup: () => void; cue: number };

const fmt = (n: number) => n.toLocaleString("en-US");

const finder = (stage: HTMLElement, name: string) => {
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = stage): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`vision-step ${name}: ${sel} missing`);
    return el;
  };
  const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = stage) => Array.from(root.querySelectorAll<T>(sel));
  return { $, $$ };
};

/* ── 01 · your sources into Pancake ── */

function buildV1(stage: HTMLElement): Built {
  const { $, $$ } = finder(stage, "v1");
  const tiles = $$(".lp-vs1-tile").map((el) => ({ faces: [$("img", el), $("span", el)], on: $(".lp-vs1-on", el) }));
  const drops = $$(".lp-vs1-drop");
  const bus = (seg: string) => $(`.lp-vs1-bus[data-seg="${seg}"]`);
  const line = { a: bus("a"), b: bus("b"), c: bus("c") };
  const trunkIn = $('.lp-vs1-trunk[data-at="in"]');
  const trunkOut = $('.lp-vs1-trunk[data-at="out"]');
  const splits = $$(".lp-vs1-split");
  const legs = $$(".lp-vs1-leg");
  const tables = $$(".lp-vs1-table").map((el) => {
    const num = $("em", el);
    return { el, num, to: Number(num.dataset.to) || 0 };
  });
  if (tiles.length !== 4 || drops.length !== tiles.length) throw new Error("vision-step v1: four sources, one wire each");
  registerTxtPlugin();

  // frame 0: the sources not connected yet, no wire, the tables empty
  const set = gsap.set;
  for (const tile of tiles) {
    set(tile.faces, { opacity: 0.38 });
    set(tile.on, { autoAlpha: 0, scale: 0.5 });
  }
  set([...drops, trunkIn, trunkOut, ...legs], { scaleY: 0 });
  set([line.a, line.b, line.c, ...splits], { scaleX: 0 });
  for (const table of tables) {
    set(table.el, { opacity: 0.45 });
    set(table.num, { txt: "0" });
  }

  const tl = gsap.timeline({ paused: true });
  const draw = (el: Element | Element[], axis: "X" | "Y", t: number, duration = 0.2) =>
    tl.to(el, { [`scale${axis}`]: 1, duration, ease: "power2.out", force3D: false }, t);
  const FIRST = 0.5;
  const EVERY = 0.6;
  tiles.forEach((tile, i) => {
    const t = FIRST + i * EVERY;
    tl.to(tile.faces, { opacity: 1, duration: 0.2, ease: "power1.out" }, t);
    tl.to(tile.on, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power3.out", force3D: false }, t + 0.05);
    draw(drops[i], "Y", t + 0.15);
    // the line they share grows towards Pancake from the tile that has just joined it (the second
    // tile lands on the stretch the first one drew)
    if (i === 0) {
      draw(line.a, "X", t + 0.33, 0.25);
      draw(trunkIn, "Y", t + 0.56, 0.15);
    }
    if (i === 2) draw(line.b, "X", t + 0.33, 0.15);
    if (i === 3) draw(line.c, "X", t + 0.33, 0.2);
    // what it brings: the tables' counts go up, a quarter a source
    const arrives = t + (i === 0 ? 1.3 : 0.62);
    for (const table of tables) {
      for (let k = 1; k <= 3; k++) {
        const value = Math.round((table.to * (i + k / 3)) / tiles.length);
        tl.to(table.num, { txt: fmt(value), duration: STEP, ease: "none" }, arrives + (k - 1) * 0.06);
      }
    }
  });
  // out of Pancake, once the first source is in: one wire, its split, the two tables
  const out = FIRST + 0.75;
  draw(trunkOut, "Y", out, 0.15);
  draw(splits, "X", out + 0.15, 0.2);
  draw(legs, "Y", out + 0.35, 0.12);
  tl.to(tables.map((table) => table.el), { opacity: 1, duration: 0.25, ease: "power1.out" }, out + 0.45);
  return { tl, cue: 0, cleanup() {} };
}

/* ── 02 · market signals land on one account; a line connects the dots ── */

function buildV2(stage: HTMLElement): Built {
  const { $, $$ } = finder(stage, "v2");
  const chips = $$(".lp-vs2-chip");
  // (in the markup the dots are in the order they land)
  const dots = $$(".lp-vs2-dot").map((el) => {
    const chip = chips.find((c) => c.dataset.id === el.dataset.id);
    if (!chip) throw new Error("vision-step v2: a dot without its kind of signal");
    const cs = getComputedStyle(chip);
    return { pin: $("i", el), label: $("span", el), chip, led: $(".lp-vs2-led", chip), tint: cs.getPropertyValue("--vs-tint").trim(), ground: cs.backgroundColor };
  });
  const path = $<SVGPathElement>(".lp-vs2-path");
  const head = $<SVGPathElement>(".lp-vs2-head");
  if (dots.length < 2) throw new Error("vision-step v2: dots to connect");

  // frame 0: every kind of signal quiet, the account as you know it, no dot
  const set = gsap.set;
  for (const dot of dots) {
    set(dot.led, { "--vs-on": 0 });
    set(dot.pin, { autoAlpha: 0, scale: 0.4 });
    set(dot.label, { autoAlpha: 0, y: 4 });
  }
  set(path, { strokeDashoffset: 1 });
  set(head, { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true });
  const FIRST = 0.5;
  const EVERY = 0.65;
  dots.forEach((dot, k) => {
    const t = FIRST + k * EVERY;
    // the kind fires: its light goes on, its chip takes its colour for a moment
    tl.to(dot.led, { "--vs-on": 1, duration: 0.2, ease: "power1.out" }, t);
    if (dot.tint) {
      tl.to(
        dot.chip,
        { keyframes: [{ backgroundColor: dot.tint, duration: 0.12, ease: "power1.out" }, { backgroundColor: dot.ground, duration: 0.6, ease: "power1.out" }] },
        t,
      );
    }
    // and what it says lands on the account
    tl.to(dot.pin, { autoAlpha: 1, scale: 1, duration: 0.28, ease: "power3.out", force3D: false }, t + 0.2);
    tl.to(dot.label, { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out", force3D: false }, t + 0.3);
  });
  // the dots, connected
  const joined = FIRST + dots.length * EVERY + 0.25;
  tl.to(path, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, joined);
  tl.to(head, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, joined + 0.92);
  return { tl, cue: 0, cleanup() {} };
}

/* ── 03 · the designer's Brain; an account reaches it; the next best Play comes up ── */

function buildV3(stage: HTMLElement): Built {
  const { $, $$ } = finder(stage, "v3");
  const ping = $(".lp-s1-cping");
  // what the young Brain does not have yet, hub by hub: its edges (each draws from its hub's
  // end, its dash being its own length) and its dots
  const growEdges = $$<SVGLineElement>(".lp-s1-edges line[data-grow]");
  const growDots = $$(".lp-s1-dot[data-grow]");
  const hubs = Array.from(new Set(growEdges.map((line) => line.dataset.hub ?? ""))).sort();
  const account = $(".lp-vs3-account");
  const play = $(".lp-vs3-play");
  const rows = $$(".lp-vs3-play-row");
  if (!growEdges.length || !growDots.length || !rows.length) throw new Error("vision-step v3: the Brain's branches, and the Play's lines");
  const whole = (line: SVGLineElement) => Number(line.dataset.len) || 0;

  // frame 0: the young Brain alone
  const set = gsap.set;
  growEdges.forEach((line) => set(line, { strokeDashoffset: whole(line) }));
  set(growDots, { scale: 0 });
  set(ping, { opacity: 0, scale: 0.4 });
  set(account, { autoAlpha: 0, y: 8 });
  set(play, { autoAlpha: 0, y: 10 });
  set(rows, { autoAlpha: 0, y: 4 });

  const tl = gsap.timeline({ paused: true });
  // an account comes up beside it
  tl.to(account, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power3.out", force3D: false }, 0.35);
  // it reaches the Brain: the ping from its centre (the designer's), and the Brain grows
  const PING = 0.85;
  tl.to(ping, { keyframes: [{ opacity: 0.9, duration: STEP, ease: "none" }, { scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out" }], force3D: false }, PING);
  hubs.forEach((hub, n) => {
    const base = PING + 0.1 + n * 0.14;
    growEdges
      .filter((line) => line.dataset.hub === hub)
      .forEach((line, k) => tl.to(line, { strokeDashoffset: 0, duration: 0.29, ease: "power1.inOut" }, base + k * 0.05));
    growDots
      .filter((dot) => dot.dataset.hub === hub)
      .forEach((dot, k) => tl.to(dot, { scale: 1, duration: 0.3, ease: "power3.out", force3D: false }, base + k * 0.05 + 0.12));
  });
  // and it recommends: the Play, then who, when and why
  const out = PING + 0.1 + hubs.length * 0.14 + 0.75;
  tl.to(play, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out", force3D: false }, out);
  rows.forEach((row, k) => tl.to(row, { autoAlpha: 1, y: 0, duration: 0.26, ease: "power2.out", force3D: false }, out + 0.4 + k * 0.26));
  // (the take ends a beat after its last line)
  tl.to(stage, { duration: STEP }, out + 0.4 + rows.length * 0.26 + 0.3);
  return { tl, cue: 0, cleanup() {} };
}

const BUILDERS: Record<VisionStepVariant, (stage: HTMLElement) => Built> = { v1: buildV1, v2: buildV2, v3: buildV3 };

export function buildVisionStep(variant: VisionStepVariant, stage: HTMLElement): Built {
  return BUILDERS[variant](stage);
}
