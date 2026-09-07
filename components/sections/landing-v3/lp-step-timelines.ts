"use client";

import { gsap } from "@/lib/gsap";

import {
  S1_ADV,
  S1_HUBS,
  S1_JIT,
  S1_TOTAL,
  S2_HEADER_DY,
  S2_ITEMS,
  S2_PROC,
  S3_CHIPS,
  S3_DAY_W,
  S3_NUM_DX,
} from "./lp-step-data";

/**
 * The three "Pancake fills your pipeline" step animations as GSAP timelines —
 * the choreography of pancake-studio shorts/brain-research-loop,
 * pipeline-checklist-loop and meetings-calendar-loop (the compositions the
 * mp4s were rendered from), ported tween for tween onto the same markup and
 * CSS (LpStepMocks.tsx / steps.css). Each timeline is built paused on its
 * stage root when the card first touches the viewport; LpStepAnim.tsx owns
 * playback (60 % in view → play once → hold the last frame). Every builder is
 * seek-safe: sets and tweens only, no callbacks, no randomness. Frame 0 of
 * every timeline equals the markup's rest state (the poster the video had).
 */

export type StepVariant = "s1" | "s2" | "s3";
export type BuiltStep = { tl: gsap.core.Timeline; cleanup: () => void };

function query(root: HTMLElement) {
  return {
    $: <T extends Element = HTMLElement>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`lp-step: missing ${sel}`);
      return el;
    },
    $$: <T extends Element = HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel)),
  };
}

/* ── step 01 · Add your website (brain-research-loop, 9.2 s) ──
   opens on the EMPTY INPUT: one caret blink → "studio-pelican.com" types →
   the pointer eases in and clicks Start research → input + button dissolve,
   the brain node pops (~2.4 s), the graph blooms hub by hub → the graph glides
   left and shrinks, the market-profile panel fades in with shimmering
   skeletons → "5 insights": the rows resolve one by one → back to the
   company brain, held as the last image. */
function buildS1(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const ui = $(".lp-s1-ui");
  const ph = $(".lp-s1-ph");
  const typed = $(".lp-s1-typed");
  const caret = $(".lp-s1-caret");
  const btn = $(".lp-s1-btn");
  const btnTxt = $(".lp-s1-btntxt");
  const ring = $(".lp-s1-ring");
  const cursor = $(".lp-s1-cursor");
  const graph = $(".lp-s1-graph");
  const center = $(".lp-s1-center");
  const clabel = $(".lp-s1-clabel");
  const bping = $(".lp-s1-bping");
  const panel = $(".lp-s1-panel");
  const ptitle = $(".lp-s1-ptitle");
  const subA = $(".lp-s1-sub-a");
  const subB = $(".lp-s1-sub-b");
  const srows = $$(".lp-s1-srow");
  const rows = $$(".lp-s1-row");
  const skels = $$(".lp-s1-skel");

  // the graph in the composition's build order (lp-step-data.ts s1Graph):
  // hub edge, hub dot, leaf edges/dots, sub-branches — regroup per hub
  const lines = $$<SVGLineElement>(".lp-s1-edges line");
  const dotEls = $$(".lp-s1-dot");
  let ei = 0;
  let di = 0;
  const hubEdges: SVGLineElement[] = [];
  const hubDots: HTMLElement[] = [];
  const leafEdges: (SVGLineElement | null)[][] = [];
  const leafDots: (HTMLElement | null)[][] = [];
  const blueEdges: SVGLineElement[] = [];
  const blueDots: HTMLElement[] = [];
  const softEdges: SVGLineElement[] = [];
  const softDots: HTMLElement[] = [];
  S1_HUBS.forEach((h) => {
    const he = lines[ei++];
    const hd = dotEls[di++];
    hubEdges.push(he);
    hubDots.push(hd);
    (h.blue ? blueEdges : softEdges).push(he);
    (h.blue ? blueDots : softDots).push(hd);
    const le: (SVGLineElement | null)[] = [];
    const ld: (HTMLElement | null)[] = [];
    h.leaves.forEach((L) => {
      const e = L[0] !== null ? lines[ei++] : null;
      const d = L.length === 4 ? dotEls[di++] : null;
      le.push(e);
      ld.push(d);
      if (e) (h.blue ? blueEdges : softEdges).push(e);
      if (d) (h.blue ? blueDots : softDots).push(d);
    });
    h.sub?.forEach(() => {
      const e = lines[ei++];
      const d = dotEls[di++];
      le.push(e);
      ld.push(d);
      softEdges.push(e);
      softDots.push(d);
    });
    leafEdges.push(le);
    leafDots.push(ld);
  });
  if (ei !== lines.length || di !== dotEls.length) throw new Error("lp-step: s1 graph markup out of sync");
  const undraw = (_i: number, el: SVGLineElement) => Number(el.dataset.len);

  gsap.set(center, { scale: 0 });
  gsap.set(graph, { transformOrigin: "246.5px 202.92px" });
  gsap.set(cursor, { x: 130, y: 120, opacity: 0, transformOrigin: "26% 12%" });
  gsap.set(btn, { transformOrigin: "50% 50%" });

  const CLIP0 = "inset(0 " + S1_TOTAL + "px 0 0)";

  const tl = gsap.timeline({ paused: true });

  /* — 0 · frame 0 = the empty input; the graph waits un-bloomed behind it — */
  const allDots = [center, ...hubDots, ...leafDots.flat().filter((d): d is HTMLElement => !!d)];
  const allEdges = [...hubEdges, ...leafEdges.flat().filter((e): e is SVGLineElement => !!e)];
  tl.set(allDots, { scale: 0, opacity: 1 }, 0);
  tl.set(allEdges, { strokeDashoffset: undraw, opacity: 1 }, 0);
  tl.set(graph, { x: 0, y: 0, scale: 1, opacity: 1 }, 0);
  tl.set(clabel, { opacity: 0, y: 0 }, 0);
  tl.set(ui, { opacity: 1 }, 0);

  /* — 1 · empty state, one caret blink (0 – 0.55 s) — */
  tl.set(caret, { opacity: 0 }, 0.15);
  tl.set(caret, { opacity: 1 }, 0.4);

  /* — 2 · typing "studio-pelican.com" (0.55 – ~1.45 s; 45 ms a key, half the old jitter) — */
  let t = 0.55;
  let acc = 0;
  S1_ADV.forEach((w, i) => {
    t += 0.045 + S1_JIT[i] / 2;
    acc += w;
    const right = Math.max(0, S1_TOTAL - acc);
    tl.set(typed, { clipPath: "inset(0 " + right.toFixed(3) + "px 0 0)" }, t);
    tl.set(caret, { x: +acc.toFixed(3) }, t);
    if (i === 0) tl.set(ph, { opacity: 0 }, t);
  });
  const tTyped = t;
  tl.set(caret, { opacity: 0 }, tTyped + 0.2);
  tl.set(caret, { opacity: 1 }, tTyped + 0.4);

  /* — 3 · pointer eases in from lower right and clicks (~1.55 – 2.3 s) — */
  const tPtr = tTyped + 0.1;
  const tC = tPtr + 0.5;
  tl.to(cursor, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, tPtr);
  tl.to(cursor, { scale: 0.88, duration: 0.08, ease: "power2.in" }, tC);
  tl.to(cursor, { scale: 1, duration: 0.26, ease: "back.out(1.6)" }, tC + 0.08);
  tl.to(btn, { scale: 0.94, duration: 0.09, ease: "power2.in" }, tC);
  tl.to(btn, { scale: 1, duration: 0.32, ease: "back.out(1.6)" }, tC + 0.09);
  tl.to(btn, { backgroundColor: "#ff7aa0", duration: 0.18, ease: "power1.out" }, tC);
  tl.to(btnTxt, { color: "#2c002a", duration: 0.18, ease: "power1.out" }, tC);
  tl.fromTo(
    ring,
    { scale: 0.3, opacity: 0.85 },
    { scale: 2.4, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
    tC + 0.02,
  );

  /* — 4 · input + button dissolve, the brain node pops (~2.4 s), the graph blooms (to ~4.8 s) — */
  const tB = tC + 0.4;
  tl.to(ui, { opacity: 0, duration: 0.28, ease: "power2.in" }, tC + 0.25);
  tl.fromTo(center, { scale: 0 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" }, tB);
  tl.fromTo(clabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, tB + 0.2);

  S1_HUBS.forEach((h, i) => {
    const t0 = tB + 0.25 + i * 0.12;
    tl.to(hubEdges[i], { strokeDashoffset: 0, duration: 0.42, ease: "power2.inOut" }, t0);
    tl.fromTo(hubDots[i], { scale: 0 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, t0 + 0.29);
    const nMain = h.leaves.length;
    const base = tB + 0.75 + i * 0.135;
    leafEdges[i].forEach((e, k) => {
      const tk = k < nMain ? base + k * 0.075 : base + nMain * 0.075 + (k - nMain) * 0.07;
      if (e) tl.to(e, { strokeDashoffset: 0, duration: 0.29, ease: "power1.inOut" }, tk);
      const d = leafDots[i][k];
      if (d) tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" }, tk + 0.12);
    });
  });

  /* — 5 · the graph glides left + shrinks; all but the blue cluster soften; panel fades in (~4.6 – 6.1 s) — */
  const tG = tB + 2.15;
  tl.to(graph, { x: -130.5, y: 42.08, scale: 0.55, duration: 0.75, ease: "power3.inOut" }, tG);
  tl.to(clabel, { opacity: 0, duration: 0.26, ease: "power2.in" }, tG);
  tl.to([center, ...softDots], { opacity: 0.45, duration: 0.6, ease: "power2.inOut" }, tG + 0.08);
  tl.to(softEdges, { opacity: 0.45, duration: 0.6, ease: "power2.inOut" }, tG + 0.08);

  tl.fromTo(ptitle, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" }, tG + 0.3);
  tl.fromTo(subA, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" }, tG + 0.36);
  tl.fromTo(
    srows,
    { opacity: 0, x: 14 },
    { opacity: 1, x: 0, duration: 0.34, ease: "power3.out", stagger: 0.075 },
    tG + 0.41,
  );
  tl.fromTo(
    skels,
    { backgroundPositionX: "120%" },
    { backgroundPositionX: "-120%", duration: 0.75, ease: "none", repeat: 1, stagger: 0.06 },
    tG + 0.68,
  );

  /* — 6 · "5 insights": the rows resolve one by one (~6.1 – 7.7 s) — */
  const tR = tG + 1.5;
  tl.to(subA, { opacity: 0, y: -6, duration: 0.15, ease: "power2.in" }, tR);
  tl.fromTo(subB, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }, tR + 0.09);
  rows.forEach((r, i) => {
    const tr = tR + 0.08 + i * 0.165;
    tl.to(srows[i], { opacity: 0, duration: 0.17, ease: "power2.in" }, tr);
    tl.fromTo(r, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }, tr + 0.06);
    tl.fromTo(
      bping,
      { scale: 0.4, opacity: 0.9 },
      { scale: 2.4, opacity: 0, duration: 0.52, ease: "power2.out", immediateRender: false },
      tr,
    );
  });

  /* — 7 · back to the company brain, held as the last image (~7.7 – 9.2 s) — */
  const tX = tR + 1.65;
  tl.to(panel, { x: 300, opacity: 0, duration: 0.3, ease: "power2.in" }, tX);
  tl.to(graph, { x: 0, y: 0, scale: 1, duration: 0.68, ease: "power3.inOut" }, tX + 0.04);
  tl.to([center, ...softDots], { opacity: 1, duration: 0.45, ease: "power2.inOut" }, tX + 0.15);
  tl.to(softEdges, { opacity: 1, duration: 0.45, ease: "power2.inOut" }, tX + 0.15);
  tl.fromTo(clabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }, tX + 0.49);
  /* hold ~8.5 → 9.2 : the static illustration */

  // the invisible UI and panel go back to their frame-0 poses during the hold
  // (the site never rewinds, but a seek to 0 must still show the pristine input)
  const tZ = tX + 0.9;
  tl.set(btn, { backgroundColor: "#30002c", scale: 1 }, tZ);
  tl.set(btnTxt, { color: "#ffffff" }, tZ);
  tl.set(cursor, { x: 130, y: 120, opacity: 0, scale: 1 }, tZ);
  tl.set(caret, { x: 0, opacity: 1 }, tZ);
  tl.set(typed, { clipPath: CLIP0 }, tZ);
  tl.set(ph, { opacity: 1 }, tZ);
  tl.set(ring, { opacity: 0 }, tZ);
  tl.set(panel, { x: 0, opacity: 1 }, tZ);
  tl.set([ptitle, subA, subB, ...srows, ...rows], { opacity: 0 }, tZ);
  tl.set(subA, { y: 0 }, tZ);
  tl.set({}, {}, 9.2); // pad to the full 9.2 s

  return { tl, cleanup: () => {} };
}

/* ── step 02 · Agents start working (pipeline-checklist-loop, 11.2 s) ──
   the 15 s cut (list holds, two avatars blink → the agent opens Pipeline by
   itself → the card morphs into the checklist → every item is processed in
   turn: the blue card lifts over the row with its spinner, works, the row
   ticks → fold back to the Agents view, held) runs at 4/3 speed inside a
   paused master, exactly like the composition's wrapper: every number below
   is in the cut's own seconds, the master is what the site plays (11.2 s). */
function buildS2(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const arows = $$(".lp-s2-arow");
  const eyeGroups = arows.map((r) => Array.from(r.querySelectorAll<SVGGElement>(".lp-s2-eye")));
  const prow = arows[0];
  const otherRows = arows.slice(1);
  const pill = $(".lp-s2-pill");
  const chev = $(".lp-s2-chev");
  const title = $(".lp-s2-title");
  const cardrect = $<SVGRectElement>(".lp-s2-cardrect");
  const crowEls = $$(".lp-s2-crow"); // 7 rows (the last one off-canvas)
  const cbOn = crowEls.map((r) => r.querySelector<HTMLElement>(".lp-s2-cb-on")!);
  const checks = crowEls.map((r) => r.querySelector<SVGPathElement>(".lp-s2-cb-on path")!);
  const labels = crowEls.map((r) => r.querySelector<HTMLElement>(".lp-s2-lbl")!);
  const strikes = crowEls.map((r) => r.querySelector<HTMLElement>(".lp-s2-strike")!);
  const hl = $(".lp-s2-hl");
  const hlbls = $$(".lp-s2-hlbl");
  const spin = $(".lp-s2-spin");
  const procLabels = S2_PROC.filter((k) => !S2_ITEMS[k].muted).map((k) => labels[k]); // muted ones keep their CSS colour
  // the travelling card's top for row k: centred on the row's checkbox (row.top + 16 = centre; card centre 29.2)
  const HL_TOP = (k: number) => S2_ITEMS[k].top + 16 - 29.2;
  // check-mark draw lengths, measured once at setup
  const lens = checks.map((p) => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = String(L);
    p.style.strokeDashoffset = String(L);
    return L;
  });

  // the highlighted item in its "flat" (plain row) pose: scale 1/1.1 about its centre + the 7.32px x-offset
  // puts its checkbox at (93,302.75) and its label at x=129 — the same box as the other rows.
  const HL_FLAT = { scale: 1 / 1.1, x: 7.32, y: -0.45 };
  const HL_BG_OFF = "rgba(217,233,255,0)";
  const HL_BD_OFF = "rgba(176,203,255,0)";
  const HL_SH_OFF = "0px 0px 0px rgba(44,0,42,0)";
  const HL_SH_ON = "0px 8px 22px rgba(44,0,42,0.10)";

  const master = gsap.timeline({ paused: true });
  const tl = gsap.timeline(); // the cut; NOT paused — a paused child would not follow its parent's seeks

  // initial poses (t = 0 must equal t = 14)
  tl.set(hl, { ...HL_FLAT, top: HL_TOP(0), backgroundColor: HL_BG_OFF, borderColor: HL_BD_OFF, boxShadow: HL_SH_OFF, opacity: 0 }, 0);
  tl.set(hlbls, { opacity: 0 }, 0);
  tl.set(spin, { opacity: 0, rotation: 0 }, 0);
  tl.set(cbOn, { scale: 0 }, 0);
  tl.set(strikes, { scaleX: 0 }, 0);
  tl.set(procLabels, { color: "#2c002a" }, 0);

  /* — Phase 1 · the list holds; two avatars blink (0 – 2.0 s) — */
  const blink = (eyes: SVGGElement[], t: number) =>
    tl.to(eyes, { scaleY: 0.08, transformOrigin: "50% 50%", duration: 0.09, yoyo: true, repeat: 1, ease: "sine.inOut" }, t);
  blink(eyeGroups[0], 0.9);
  blink(eyeGroups[3], 1.5);

  /* — Phase 2 · the agent opens Pipeline by itself: the pill lights, the row settles, no cursor (2.0 – 2.9 s) — */
  tl.fromTo(pill, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, 2.0);
  blink(eyeGroups[0], 2.25);
  tl.to(prow, { scale: 0.94, duration: 0.14, ease: "power2.in" }, 2.45);
  tl.to(prow, { scale: 1, duration: 0.32, ease: "back.out(1.6)" }, 2.59);

  /* — Phase 3 · the card morphs into the Pipeline view (2.9 – 3.65 s), the checklist fills it from 3.35 — */
  tl.to(pill, { opacity: 0, duration: 0.25, ease: "power2.in" }, 2.9);
  tl.to(title, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, 2.9);
  tl.to(otherRows, { opacity: 0, y: 8, duration: 0.3, ease: "power2.in", stagger: 0.05 }, 2.9);
  tl.fromTo(
    cardrect,
    { attr: { y: 101, height: 356 } },
    { attr: { y: 50.75, height: 456.5 }, duration: 0.6, ease: "power3.inOut", immediateRender: false },
    3.05,
  );
  tl.to(prow, { y: S2_HEADER_DY, duration: 0.6, ease: "power3.inOut" }, 3.05);
  tl.fromTo(chev, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, 3.5);
  tl.fromTo(
    crowEls,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.085, immediateRender: false },
    3.35,
  );

  /* — Phase 4 · each item is processed in turn (4.4 – 12.6 s):
       the blue card lifts over the row with its spinner, works, then the row ticks and the card moves on.
       Item 3 ("Score leads for ICP fit") is held longer — that frame is the static step-2 illustration. — */
  const LIFT = 0.32;
  const DONE = 0.26;
  const GAP = 0.08;
  const WORK = (k: number) => (k === 3 ? 1.5 : 0.62);
  let t = 4.4;
  S2_PROC.forEach((k) => {
    // place the card on this row (it is invisible at this moment) and show this item's label
    tl.set(hl, { top: HL_TOP(k), ...HL_FLAT, backgroundColor: HL_BG_OFF, borderColor: HL_BD_OFF, boxShadow: HL_SH_OFF, opacity: 0 }, t);
    tl.set(hlbls[k], { opacity: 1 }, t); // one tween per label: shown here, hidden once the item is done
    tl.set(spin, { rotation: 0 }, t);
    // lift: fade in + grow + turn blue (the fill goes opaque fast, then the row underneath is hidden — no ghost)
    tl.to(hl, { opacity: 1, duration: 0.1, ease: "power2.out" }, t);
    tl.to(hl, { scale: 1, x: 0, y: 0, duration: LIFT + 0.2, ease: "back.out(1.5)" }, t);
    tl.to(hl, { backgroundColor: "#d9e9ff", borderColor: "#b0cbff", duration: 0.1, ease: "power2.out" }, t);
    tl.to(hl, { boxShadow: HL_SH_ON, duration: LIFT, ease: "power2.out" }, t);
    tl.set(crowEls[k], { opacity: 0 }, t + 0.08);
    tl.to(spin, { opacity: 1, duration: 0.2, ease: "power2.out" }, t + 0.12);
    const work = WORK(k);
    tl.to(spin, { rotation: 360 * (work + LIFT) * 1.05, duration: work + LIFT, ease: "none" }, t + 0.12);
    // done: spinner out, card drops + fades while the row underneath ticks
    const td = t + LIFT + work;
    tl.to(spin, { opacity: 0, duration: 0.14, ease: "power2.in" }, td);
    tl.to(
      hl,
      { scale: HL_FLAT.scale, x: HL_FLAT.x, y: HL_FLAT.y, backgroundColor: HL_BG_OFF, borderColor: HL_BD_OFF, boxShadow: HL_SH_OFF, opacity: 0, duration: DONE, ease: "power3.in" },
      td,
    );
    tl.set(hlbls[k], { opacity: 0 }, td + DONE);
    tl.set(crowEls[k], { opacity: 1 }, td); // the row resurfaces as the card drops, and ticks
    tl.to(cbOn[k], { scale: 1, duration: 0.35, ease: "back.out(1.6)" }, td + 0.1);
    tl.to(checks[k], { strokeDashoffset: 0, duration: 0.25, ease: "power2.out" }, td + 0.2);
    if (!S2_ITEMS[k].muted) tl.to(labels[k], { color: "#9a818f", duration: 0.25, ease: "power1.out" }, td + 0.15);
    tl.to(strikes[k], { scaleX: 1, duration: 0.3, ease: "power2.out" }, td + 0.2);
    t = td + DONE + GAP;
  });
  /* ≈ 12.6 s */

  /* — Phase 5 · fold back to the Agents list (12.6 – 13.6 s), then the Agents view holds as the last image (13.6 – 15 s) — */
  const F = 12.6;
  tl.to(crowEls.slice().reverse(), { opacity: 0, y: -10, duration: 0.26, ease: "power2.in", stagger: 0.04 }, F + 0.05);
  // reset the ticked items while they are invisible
  tl.set(cbOn, { scale: 0 }, F + 0.7);
  tl.set(strikes, { scaleX: 0 }, F + 0.7);
  tl.set(procLabels, { color: "#2c002a" }, F + 0.7);
  tl.set(checks, { strokeDashoffset: (i: number) => lens[i] }, F + 0.7);
  tl.set(spin, { opacity: 0, rotation: 0 }, F + 0.7);
  tl.set(hl, { top: HL_TOP(0), ...HL_FLAT, backgroundColor: HL_BG_OFF, borderColor: HL_BD_OFF, boxShadow: HL_SH_OFF, opacity: 0 }, F + 0.7);
  tl.set(hlbls, { opacity: 0 }, F + 0.7);

  tl.to(chev, { opacity: 0, y: 4, duration: 0.2, ease: "power2.in" }, F + 0.35);
  tl.fromTo(
    cardrect,
    { attr: { y: 50.75, height: 456.5 } },
    { attr: { y: 101, height: 356 }, duration: 0.45, ease: "power3.inOut", immediateRender: false },
    F + 0.45,
  );
  tl.to(prow, { y: 0, duration: 0.45, ease: "power3.inOut" }, F + 0.45);
  tl.fromTo(title, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: false }, F + 0.75);
  // the four other agent rows return beneath the landing Pipeline row (last settles before 14 s)
  tl.fromTo(
    otherRows,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.32, ease: "power3.out", stagger: 0.085, immediateRender: false },
    F + 0.63,
  );
  blink(eyeGroups[2], 14.35); // a blink during the closing hold; eyes are open again by 14.53

  /* The site seeks and plays `master`; the child's timeScale maps the master's
     time into the cut (cut time = master time × 4/3), so every seek stays
     deterministic and the cut above needs no retiming. 11.2 s on the master =
     14.93 s of the cut — inside the closing hold (last blink done at 14.53). */
  master.add(tl, 0);
  tl.timeScale(1 / 0.75);
  master.set({}, {}, 11.2); // pad to the mp4's 11.2 s

  return { tl: master, cleanup: () => {} };
}

/* ── step 03 · Pancake gets you the meeting (meetings-calendar-loop, 7 s) ──
   0 – 0.5 empty week · Mon / Tue / Wed / Thu 1.1 s each: chips pop in, the
   day circle hops and the numbers slide in / out of it, outcomes stamp the
   past meetings · the marker settles on Thu 22 and the filled week holds. */
function buildS3(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const circle = $(".lp-s3-circle");
  const days = $$(".lp-s3-day").map((d) => ({
    num: d.querySelector<HTMLElement>(".lp-s3-num")!,
    rg: d.querySelector<HTMLElement>(".lp-s3-rg")!,
    sb: d.querySelector<HTMLElement>(".lp-s3-sb")!,
  }));
  const chipEls = $$(".lp-s3-chip");
  const chips = S3_CHIPS.map((c, i) => ({
    ...c,
    el: chipEls[i],
    txt: chipEls[i].querySelector<HTMLElement>(".lp-s3-ctxt")!,
    badge: chipEls[i].querySelector<HTMLElement>(".lp-s3-badge")!,
  }));

  const tl = gsap.timeline({ paused: true });

  // chips: tiny -> full (elastic), fully invisible at frame 0
  chips.forEach((c) => {
    tl.fromTo(c.el, { scale: 0.3 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.55)" }, c.pop);
    tl.fromTo(c.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, c.pop);
  });

  // the day circle hops from day i to day j; the numbers slide in / out of it
  const hop = (i: number, j: number, t: number, ease?: string) => {
    tl.to(circle, { x: j * S3_DAY_W, duration: 0.45, ease: ease || "back.out(1.6)" }, t);
    tl.to(
      circle,
      {
        keyframes: [
          { y: -9, scaleX: 0.96, scaleY: 1.06, duration: 0.16, ease: "power2.out" },
          { y: 0, scaleX: 1, scaleY: 1, duration: 0.29, ease: "back.out(2.2)" },
        ],
        ease: "none",
      },
      t,
    );
    // leaving day: number drops back to its natural spot, regular weight
    tl.set(days[i].sb, { autoAlpha: 0 }, t + 0.12);
    tl.set(days[i].rg, { autoAlpha: 1 }, t + 0.12);
    tl.to(days[i].num, { x: i === 0 ? S3_NUM_DX[0] : 0, duration: 0.35, ease: "power3.out" }, t);
    // arriving day: number slides into the circle, semibold
    tl.set(days[j].rg, { autoAlpha: 0 }, t + 0.12);
    tl.set(days[j].sb, { autoAlpha: 1 }, t + 0.12);
    tl.to(days[j].num, { x: j === 0 ? 0 : S3_NUM_DX[j], duration: 0.45, ease: "back.out(1.6)" }, t);
  };

  // outcome badge slides onto the chip; the chip text dims a touch once the meeting is past
  const outcome = (c: (typeof chips)[number], t: number) => {
    tl.fromTo(c.badge, { x: 12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(1.6)" }, t);
    tl.to(c.txt, { opacity: 0.62, duration: 0.35, ease: "power1.out" }, t);
  };

  const T_TUE = 1.6;
  const T_WED = 2.7;
  const T_THU = 3.8;
  const T_FRI = 4.9;
  const byDay = (d: number) => chips.filter((c) => c.day === d);

  /* — Mon -> Tue — */
  hop(0, 1, T_TUE);
  byDay(0).forEach((c, k) => outcome(c, T_TUE + 0.15 + k * 0.15));
  /* — Tue -> Wed — */
  hop(1, 2, T_WED);
  byDay(1).forEach((c, k) => outcome(c, T_WED + 0.15 + k * 0.15));
  /* — Wed -> Thu — */
  hop(2, 3, T_THU);
  byDay(2).forEach((c, k) => outcome(c, T_THU + 0.15 + k * 0.15));
  /* — end of Thursday: its outcomes land, the marker settles on Thu 22, the filled week holds to the end — */
  tl.to(
    circle,
    {
      keyframes: [
        { y: -6, scaleX: 0.97, scaleY: 1.04, duration: 0.15, ease: "power2.out" },
        { y: 0, scaleX: 1, scaleY: 1, duration: 0.28, ease: "back.out(2)" },
      ],
      ease: "none",
    },
    T_FRI,
  );
  byDay(3).forEach((c, k) => outcome(c, T_FRI + 0.15 + k * 0.15));
  tl.set({}, {}, 7); // pad to the full 7 s hold (last badge lands at ~5.7)

  return { tl, cleanup: () => {} };
}

const BUILDERS: Record<StepVariant, (root: HTMLElement) => BuiltStep> = {
  s1: buildS1,
  s2: buildS2,
  s3: buildS3,
};

export function buildStepTimeline(variant: StepVariant, root: HTMLElement): BuiltStep {
  return BUILDERS[variant](root);
}
