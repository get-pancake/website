// No "use client" on purpose: a plain module, reached only through LpVisionStepAnim's import()
// (lp-play-once loads it with GSAP, out of the page's first bundle).
import { gsap } from "@/lib/gsap";

import { registerTxtPlugin } from "./lp-gsap-txt";
import { ART_BRAIN, ART_SOURCES } from "./lp-toy-art";
import {
  TOY_EASE,
  TOY_STEP,
  toyAlong,
  toyDecode,
  toyGone,
  toyHideAlong,
  toyHideHop,
  toyHidePop,
  toyHideRise,
  toyHop,
  toyLeave,
  toyPop,
  toyQuery,
  toyRise,
  toyShow,
} from "./lp-toy-kit";

/**
 * The takes of the three toy pictures of the 1-2-3 (LpToySteps.tsx, 2026-11-12), one per card,
 * each played once by lp-play-once as its card reaches the reader.
 *   t1  the four sources connect one after the other: its mark lights, its cable draws in, what
 *       it sends comes up, a bead runs down the cable into the machine. The machine turns (the
 *       beads on its turntable), a row hops out for each bead and the two piles come up, with
 *       their counts
 *   t2  the radar's beam comes on and turns once; each time it passes a signal a ring opens on
 *       the face, a bead lands in it and what it says comes up; the beam fades, a line connects
 *       the dots into the account, which lifts a little and warms
 *   t3  the Brain wakes (a ripple through its hubs); signals run in from its dots, hub by hub,
 *       to the centre, which swells; two ideas fly out and land under it, then the next best
 *       Play comes up
 * The contract of the page's timelines (lp-vision-step-timelines.ts): the markup is the END
 * picture; every piece is looked up before anything is written (a missing piece throws there and
 * the server's picture stands); frame 0 is a block of gsap.set; the timeline holds tweens only
 * (an instant change is a 1 ms tween), so it can be seeked both ways (QA: window.__lpStep.t1).
 * Nothing loops. The feel is lp-toy-kit.ts's (TOY_EASE).
 */

type Timeline = gsap.core.Timeline;
type Built = { tl: Timeline; cleanup: () => void; cue: number };
type Point = readonly [number, number];

const fmt = (n: number) => n.toLocaleString("en-US");
const num = (el: HTMLElement, key: string) => Number(el.dataset[key]);

/* ── 01 · your sources plug in, the machine turns, the tables come up ── */

function buildT1(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t1");
  const art = ART_SOURCES;
  const sources = q.all(".lp-t1-source").map((el) => ({ mark: q.one(".lp-t1-mark", el), name: q.one(".lp-t1-name", el) }));
  const cables = q.all(".lp-t1-cable");
  const sends = q.all(".lp-t1-send");
  const tokens = q.all(".lp-t1-token");
  const rows = q.all(".lp-t1-row");
  const riders = q.all(".lp-t1-rider");
  const glow = q.one(".lp-t1-hub");
  const pile = (side: string) => q.all(`.lp-t1-pile[data-side="${side}"]`).sort((a, b) => num(a, "n") - num(b, "n"));
  const piles: Record<string, HTMLElement[]> = { l: pile("l"), r: pile("r") };
  const counts: Record<string, { el: HTMLElement; to: number }> = {};
  for (const side of ["l", "r"]) {
    const el = q.one(`.lp-t1-table[data-side="${side}"] em`);
    counts[side] = { el, to: num(el, "to") || 0 };
  }
  if (sources.length !== 4 || cables.length !== 4 || sends.length !== 4) throw new Error("lp-toy t1: four sources, a cable and a badge each");
  if (tokens.length !== rows.length || !tokens.length) throw new Error("lp-toy t1: a row for each bead");
  const high = piles.l.length - 1;
  if (high < 1 || piles.r.length !== piles.l.length) throw new Error("lp-toy t1: the two piles, at every height");
  registerTxtPlugin();
  toyDecode(stage);

  const path = (dock: number) => (art.paths as unknown as Record<string, readonly Point[]>)[`cable${dock}`];
  const anchor = (name: string) => (art.anchors as unknown as Record<string, Point>)[name];

  // frame 0: nothing connected, the machine at rest, the two feet empty
  const set = gsap.set;
  for (const source of sources) {
    set(source.mark, { opacity: 0.45, scale: 0.86 });
    set(source.name, { opacity: 0.45 });
  }
  set(cables, { clipPath: "inset(0% 0% 100% 0%)" });
  toyHideRise(sends, 8);
  tokens.forEach((token) => toyHideAlong(token, path(num(token, "dock")), path(num(token, "dock"))[0]));
  toyHidePop(riders, 0.4);
  set(glow, { "--toy-glow": 0 });
  for (const side of ["l", "r"]) {
    piles[side].forEach((img, n) => set(img, { autoAlpha: n === 0 ? 1 : 0 }));
    set(counts[side].el, { txt: "0" });
  }
  rows.forEach((row) => {
    const side = row.dataset.side ?? "l";
    toyHideHop(row, anchor(`pile-${side}-mouth`), anchor(`pile-${side}-row${num(row, "row")}`), 0.3);
  });

  const tl = gsap.timeline({ paused: true });
  /** a source connects every … */
  const FIRST = 0.4;
  const EVERY = 0.62;
  /** a bead takes this long down its cable; then the row is on its way out */
  const RUN = 0.5;
  const INSIDE = 0.14;
  const HOP = 0.44;
  // when each bead leaves its dock: one per source as it connects, then six more, closer
  const leaves = tokens.map((_, k) => (k < 4 ? FIRST + k * EVERY + 0.32 : FIRST + 3 * EVERY + 0.32 + (k - 3) * 0.3));

  sources.forEach((source, i) => {
    const t = FIRST + i * EVERY;
    tl.to(source.mark, { opacity: 1, duration: 0.14, ease: "power1.out" }, t);
    tl.to(source.mark, { scale: 1, duration: 0.4, ease: TOY_EASE.pop, force3D: false }, t);
    tl.to(source.name, { opacity: 1, duration: 0.2, ease: "power1.out" }, t);
    tl.to(cables[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "power2.out" }, t + 0.06);
    // what it sends: up as it connects, gone as the one after the next comes up
    toyRise(tl, sends[i], t + 0.1);
    toyLeave(tl, sends[i], t + 2 * EVERY - 0.1);
  });

  // the machine turns from the first bead in to the last row out
  const turnFrom = leaves[0] + RUN;
  const turnTo = leaves[leaves.length - 1] + RUN + INSIDE + HOP + 0.25;
  tl.to(glow, { "--toy-glow": 1, duration: 0.3, ease: "power1.out" }, turnFrom);
  riders.forEach((rider, i) => {
    // (each rider joins as its source's first bead comes in; all ride the same turns)
    toyPop(tl, rider, leaves[i] + RUN, 0.35);
    const rest = Number(rider.style.getPropertyValue("--toy-a")) || 0;
    set(rider, { "--toy-a": rest - 3 });
    tl.to(rider, { "--toy-a": rest, duration: turnTo - turnFrom, ease: "power1.inOut" }, turnFrom);
  });

  const landed: Record<string, number> = { l: 0, r: 0 };
  tokens.forEach((token, k) => {
    const dock = num(token, "dock");
    const line = path(dock);
    const t = leaves[k];
    toyPop(tl, token, t, 0.25);
    toyAlong(tl, token, line, line[0], t, RUN);
    toyGone(tl, token, t + RUN);
    // the row it becomes: out of the machine's mouth, onto its pile
    const row = rows[k];
    const side = row.dataset.side ?? "l";
    const out = t + RUN + INSIDE;
    toyHop(tl, row, anchor(`pile-${side}-mouth`), anchor(`pile-${side}-row${num(row, "row")}`), out, HOP, 22);
    const lands = out + HOP;
    const n = (landed[side] += 1);
    toyGone(tl, row, lands);
    toyGone(tl, piles[side][n - 1], lands);
    toyShow(tl, piles[side][n], lands);
    // (the pile gives a little under the row that lands on it)
    tl.fromTo(
      piles[side][n],
      { scaleY: 0.955 },
      { scaleY: 1, duration: 0.26, ease: "power2.out", transformOrigin: "50% 100%", force3D: false, immediateRender: false },
      lands,
    );
    const count = counts[side];
    for (let step = 1; step <= 3; step++) {
      const value = Math.round((count.to * (n - 1 + step / 3)) / high);
      tl.to(count.el, { txt: fmt(value), duration: TOY_STEP, ease: "none" }, lands + (step - 1) * 0.06);
    }
  });
  // (the take ends a beat after the last row)
  tl.to(stage, { duration: TOY_STEP }, turnTo + 0.2);
  return { tl, cue: 0, cleanup() {} };
}

/* ── 02 · a radar over one account: the signals land, a line connects the dots ── */

function buildT2(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t2");
  const beam = q.one(".lp-t2-beam");
  const blips = q.all(".lp-t2-blip");
  const pings = q.all(".lp-t2-ping");
  const says = q.all(".lp-t2-says");
  const line = q.one<SVGPathElement>(".lp-t2-line path");
  const heat = q.one(".lp-t2-heat");
  const account = q.one(".lp-t2-account");
  if (blips.length < 2 || pings.length !== blips.length || says.length !== blips.length) throw new Error("lp-toy t2: a ring and a badge for each signal");
  toyDecode(stage);
  /** where the beam starts, and where it is when it meets each signal (degrees) */
  const from = num(beam, "from");
  const meets = blips.map((blip) => num(blip, "at"));

  // frame 0: the radar and the account as you know it; nothing has landed
  const set = gsap.set;
  set(beam, { autoAlpha: 0, rotation: from });
  toyHidePop(blips, 0.3);
  set(pings, { autoAlpha: 0, scale: 0.3 });
  toyHideRise(says, 6);
  set(line, { strokeDashoffset: 1 });
  set(heat, { autoAlpha: 0, scale: 0.6 });

  const tl = gsap.timeline({ paused: true });
  /** the beam comes on, then turns once: a full turn takes … */
  const ON = 0.3;
  const TURN = 3.1;
  const to = from + 360;
  tl.to(beam, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, ON);
  tl.to(beam, { rotation: to, duration: TURN, ease: "none", force3D: false }, ON);
  blips.forEach((blip, k) => {
    const t = ON + ((meets[k] - from) / 360) * TURN;
    // the beam passes: a ring opens on the face, the bead lands in it, what it says comes up
    tl.to(pings[k], { autoAlpha: 0.9, duration: 0.08, ease: "none" }, t);
    tl.to(pings[k], { scale: 1.9, duration: 0.7, ease: "power2.out", force3D: false }, t);
    tl.to(pings[k], { autoAlpha: 0, duration: 0.45, ease: "power1.in" }, t + 0.25);
    toyPop(tl, blip, t + 0.04, 0.4);
    toyRise(tl, says[k], t + 0.16);
  });
  // the beam has gone round: it fades, and a line connects the dots, into the account
  const done = ON + TURN;
  tl.to(beam, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, done - 0.1);
  const joins = done + 0.2;
  tl.to(line, { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" }, joins);
  // the account takes it in: it lifts a little, and warms
  const lands = joins + 0.95;
  tl.to(heat, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out", force3D: false }, lands);
  tl.to(account, { keyframes: [{ y: -5, duration: 0.16, ease: "power2.out" }, { y: 0, duration: 0.3, ease: TOY_EASE.pop }], force3D: false }, lands);
  tl.to(stage, { duration: TOY_STEP }, lands + 0.75);
  return { tl, cue: 0, cleanup() {} };
}

/* ── 03 · the Brain: signals run in, ideas come out, the next best Play ── */

function buildT3(stage: HTMLElement): Built {
  const q = toyQuery(stage, "t3");
  const art = ART_BRAIN;
  const hubs = q.all(".lp-t3-hub");
  const centre = q.one(".lp-t3-centre");
  const halo = q.one(".lp-t3-halo");
  const runs = q.all(".lp-t3-run");
  const names = q.all(".lp-t3-name");
  const ideas = q.all(".lp-t3-idea");
  const play = q.one(".lp-t3-play");
  if (!hubs.length || !runs.length || !ideas.length) throw new Error("lp-toy t3: the Brain's hubs, its signals and its ideas");
  toyDecode(stage);
  const anchor = (name: string) => (art.anchors as unknown as Record<string, Point>)[name];
  const heart = anchor("centre");
  const hubOf = (el: HTMLElement) => hubs.find((hub) => hub.dataset.hub === el.dataset.hub);
  /** where an idea rests: it flies there from the centre */
  const restOf = (el: HTMLElement): Point => [parseFloat(el.style.left), parseFloat(el.style.top)];

  // frame 0: the Brain, whole and still; no idea yet
  const set = gsap.set;
  set(runs, { autoAlpha: 0, scale: 0.5 });
  set(halo, { opacity: 0.35, scale: 0.8 });
  ideas.forEach((idea) => {
    const rest = restOf(idea);
    set(idea, { autoAlpha: 0, x: heart[0] - rest[0], y: heart[1] - rest[1], scale: 0.3 });
  });
  set(play, { autoAlpha: 0, y: 16, scale: 0.92 });

  const tl = gsap.timeline({ paused: true });
  /** a hub, or the centre, swells and settles: what a signal does to it as it passes */
  const swell = (el: Element, at: number, by = 1.07) =>
    tl.to(el, { keyframes: [{ scale: by, duration: 0.16, ease: "power2.out" }, { scale: 1, duration: 0.34, ease: "power2.inOut" }], force3D: false }, at);

  // the Brain wakes: a ripple through its hubs, from the first one round
  hubs.forEach((hub, k) => swell(hub, 0.2 + k * 0.05, 1.045));

  // signals run in: each from a dot to its hub, then on to the centre
  const FIRST = 0.75;
  const EVERY = 0.17;
  const TO_HUB = 0.26;
  const TO_HEART = 0.34;
  let lastIn = FIRST;
  runs.forEach((run, k) => {
    const hub = hubOf(run);
    if (!hub) throw new Error("lp-toy t3: a signal without its hub");
    const from = anchor(`dot${run.dataset.hub}-${run.dataset.dot}`);
    const via = anchor(`hub${run.dataset.hub}`);
    const t = FIRST + k * EVERY;
    tl.to(run, { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power1.out", force3D: false }, t);
    tl.to(run, { x: via[0] - from[0], y: via[1] - from[1], duration: TO_HUB, ease: "power1.in", force3D: false }, t + 0.06);
    swell(hub, t + 0.06 + TO_HUB - 0.04);
    tl.to(run, { x: heart[0] - from[0], y: heart[1] - from[1], duration: TO_HEART, ease: "power1.inOut", force3D: false }, t + 0.06 + TO_HUB);
    lastIn = t + 0.06 + TO_HUB + TO_HEART;
    tl.to(run, { autoAlpha: 0, scale: 0.4, duration: 0.1, ease: "power1.in", force3D: false }, lastIn - 0.06);
    // (the centre takes each one in)
    tl.to(halo, { opacity: 0.55 + 0.09 * k, scale: 0.86 + 0.035 * k, duration: 0.2, ease: "power1.out", force3D: false }, lastIn - 0.05);
  });

  // they cross: the centre swells, and the ideas come out, one after the other
  const thinks = lastIn + 0.05;
  swell(centre, thinks, 1.14);
  tl.to(halo, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out", force3D: false }, thinks);
  let t = thinks + 0.22;
  ideas.forEach((idea) => {
    tl.to(idea, { autoAlpha: 1, duration: 0.1, ease: "none" }, t);
    tl.to(idea, { x: 0, duration: 0.5, ease: "power2.out", force3D: false }, t);
    tl.to(idea, { y: 0, duration: 0.5, ease: "power2.inOut", force3D: false }, t);
    tl.to(idea, { scale: 1, duration: 0.5, ease: TOY_EASE.pop, force3D: false }, t);
    t += 0.38;
  });
  // and the one it recommends
  const says = t + 0.2;
  swell(centre, says - 0.1, 1.1);
  tl.to(play, { autoAlpha: 1, duration: 0.16, ease: "power1.out" }, says);
  tl.to(play, { y: 0, scale: 1, duration: 0.5, ease: TOY_EASE.pop, force3D: false }, says);
  tl.to(names, { opacity: 1, duration: TOY_STEP }, says);
  tl.to(stage, { duration: TOY_STEP }, says + 0.9);
  return { tl, cue: 0, cleanup() {} };
}

const BUILDERS = { t1: buildT1, t2: buildT2, t3: buildT3 } as const;
export type ToyStepVariant = keyof typeof BUILDERS;

export function buildToyStep(variant: ToyStepVariant, stage: HTMLElement): Built {
  return BUILDERS[variant](stage);
}
