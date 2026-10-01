"use client";

import { gsap } from "@/lib/gsap";

import {
  S1_HUBS,
  S1_JIT,
  S2_HEADER_DY,
  S2_ITEMS,
  S2_PROC,
  S3_CHIPS,
  S3_DAY_W,
  S3_NUM_DX,
} from "./lp-step-data";

/** right edge of every glyph of `el`'s text, in the element's own unscaled px
    (the stage is scaled by --lp-fit) — measured at build, so the typing follows
    whatever face the mock renders in */
function measureRightEdges(el: HTMLElement): number[] {
  const box = el.getBoundingClientRect();
  const s = el.offsetWidth ? box.width / el.offsetWidth : 1;
  const edges: number[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node as Text).data;
    let i = 0;
    for (const ch of text) {
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      const r = range.getBoundingClientRect();
      i += ch.length;
      edges.push(r.width === 0 && edges.length ? edges[edges.length - 1] : (r.right - box.left) / s);
    }
  }
  return edges;
}

/**
 * The three "Pancake fills your pipeline" step animations as GSAP timelines —
 * the choreography of pancake-studio shorts/brain-research-loop,
 * pipeline-checklist-loop and meetings-calendar-loop (the compositions the
 * mp4s were rendered from), ported tween for tween onto the same markup and
 * CSS (LpStepMocks.tsx / steps.css), paced tighter on 2026-09-30 (see each
 * builder's "Pace" note). Each timeline is built paused on its stage root a
 * viewport ahead of the card; lp-play-once.ts owns playback (as the card
 * arrives → play once → hold the last frame). Every builder is
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

  /* the typed URL's glyph edges, measured from the live text (Range rects in
     the element's own unscaled px, like lp-feat-timelines' measureGlyphs): a
     Fono advance table used to drive this and desynced the clip and the caret
     the moment the mocks moved to Geist Sans (review 2026-09-09) */
  const typedEdges = measureRightEdges(typed);
  const typedWidth = typedEdges[typedEdges.length - 1] ?? 0;
  const CLIP0 = "inset(0 100% 0 0)";

  const tl = gsap.timeline({ paused: true });

  /* — 0 · frame 0 = the empty input; the graph waits un-bloomed behind it — */
  const allDots = [center, ...hubDots, ...leafDots.flat().filter((d): d is HTMLElement => !!d)];
  const allEdges = [...hubEdges, ...leafEdges.flat().filter((e): e is SVGLineElement => !!e)];
  tl.set(allDots, { scale: 0, opacity: 1 }, 0);
  tl.set(allEdges, { strokeDashoffset: undraw, opacity: 1 }, 0);
  tl.set(graph, { x: 0, y: 0, scale: 1, opacity: 1 }, 0);
  tl.set(clabel, { opacity: 0, y: 0 }, 0);
  tl.set(ui, { opacity: 1 }, 0);

  /* Pace (2026-09-30, founder: "tout plus dynamique"): the same beats, no
     idle caret blinks, 30 ms a key (was 45), each later beat closer — the
     brain pops at ~1.6 s (was 2.43), the held brain returns at ~6.2 s (was
     ~8.5). */

  /* — 1 · typing "studio-pelican.com" from 0.2 s (30 ms a key, a third of the old jitter) — */
  let t = 0.2;
  typedEdges.forEach((acc, i) => {
    t += 0.03 + (S1_JIT[i] ?? 0) / 3;
    const right = Math.max(0, typedWidth - acc);
    tl.set(typed, { clipPath: "inset(0 " + right.toFixed(3) + "px 0 0)" }, t);
    tl.set(caret, { x: +acc.toFixed(3) }, t);
    if (i === 0) tl.set(ph, { opacity: 0 }, t);
  });
  const tTyped = t;

  /* — 3 · pointer eases in from lower right and clicks (~0.85 – 1.3 s) — */
  const tPtr = tTyped + 0.05;
  const tC = tPtr + 0.35;
  tl.to(cursor, { x: 0, y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }, tPtr);
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

  /* — 4 · input + button dissolve, the brain node pops (~1.6 s), the graph blooms (to ~3 s) — */
  const tB = tC + 0.3;
  tl.to(ui, { opacity: 0, duration: 0.28, ease: "power2.in" }, tC + 0.25);
  tl.fromTo(center, { scale: 0 }, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.5)" }, tB);
  tl.fromTo(clabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, tB + 0.2);

  S1_HUBS.forEach((h, i) => {
    const t0 = tB + 0.2 + i * 0.1;
    tl.to(hubEdges[i], { strokeDashoffset: 0, duration: 0.42, ease: "power2.inOut" }, t0);
    tl.fromTo(hubDots[i], { scale: 0 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)" }, t0 + 0.29);
    const nMain = h.leaves.length;
    const base = tB + 0.55 + i * 0.11;
    leafEdges[i].forEach((e, k) => {
      const tk = k < nMain ? base + k * 0.06 : base + nMain * 0.06 + (k - nMain) * 0.055;
      if (e) tl.to(e, { strokeDashoffset: 0, duration: 0.29, ease: "power1.inOut" }, tk);
      const d = leafDots[i][k];
      if (d) tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" }, tk + 0.12);
    });
  });

  /* — 5 · the graph glides left + shrinks; all but the blue cluster soften; panel fades in (~3.2 – 4.4 s) — */
  const tG = tB + 1.6;
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

  /* — 6 · "5 insights": the rows resolve one by one (~4.4 – 5.6 s) — */
  const tR = tG + 1.2;
  tl.to(subA, { opacity: 0, y: -6, duration: 0.15, ease: "power2.in" }, tR);
  tl.fromTo(subB, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }, tR + 0.09);
  rows.forEach((r, i) => {
    const tr = tR + 0.08 + i * 0.14;
    tl.to(srows[i], { opacity: 0, duration: 0.17, ease: "power2.in" }, tr);
    tl.fromTo(r, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }, tr + 0.06);
    tl.fromTo(
      bping,
      { scale: 0.4, opacity: 0.9 },
      { scale: 2.4, opacity: 0, duration: 0.52, ease: "power2.out", immediateRender: false },
      tr,
    );
  });

  /* — 7 · back to the company brain, held as the last image (~5.7 – 6.7 s) — */
  const tX = tR + 1.3;
  tl.to(panel, { x: 300, opacity: 0, duration: 0.3, ease: "power2.in" }, tX);
  tl.to(graph, { x: 0, y: 0, scale: 1, duration: 0.68, ease: "power3.inOut" }, tX + 0.04);
  tl.to([center, ...softDots], { opacity: 1, duration: 0.45, ease: "power2.inOut" }, tX + 0.15);
  tl.to(softEdges, { opacity: 1, duration: 0.45, ease: "power2.inOut" }, tX + 0.15);
  tl.fromTo(clabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }, tX + 0.49);
  /* hold from ~6.2: the static illustration */

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
  tl.set({}, {}, tZ + 0.05); // the held brain (the composition padded to 9.2 s)

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

  /* Pace (2026-09-30, founder: "tout plus dynamique"): the opening hold is
     one blink (the agent opens Pipeline at 0.8 s of the cut, was 2.0), every
     item works 0.45 s (was 0.62; the held "Score leads for ICP fit" 1.0 s,
     was 1.5), and the fold-back follows the last item — 9.1 s on the master
     (was 11.2). Cut seconds below; O = the opening's shift. */
  const O = -1.2;
  /* — Phase 1 · the list holds; an avatar blinks (0 – 0.8 s) — */
  const blink = (eyes: SVGGElement[], t: number) =>
    tl.to(eyes, { scaleY: 0.08, transformOrigin: "50% 50%", duration: 0.09, yoyo: true, repeat: 1, ease: "sine.inOut" }, t);
  blink(eyeGroups[3], 0.3);

  /* — Phase 2 · the agent opens Pipeline by itself: the pill lights, the row settles, no cursor (0.8 – 1.7 s) — */
  tl.fromTo(pill, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, 2.0 + O);
  blink(eyeGroups[0], 2.25 + O);
  tl.to(prow, { scale: 0.94, duration: 0.14, ease: "power2.in" }, 2.45 + O);
  tl.to(prow, { scale: 1, duration: 0.32, ease: "back.out(1.6)" }, 2.59 + O);

  /* — Phase 3 · the card morphs into the Pipeline view (1.7 – 2.45 s), the checklist fills it from 2.15 — */
  tl.to(pill, { opacity: 0, duration: 0.25, ease: "power2.in" }, 2.9 + O);
  tl.to(title, { opacity: 0, y: -8, duration: 0.3, ease: "power2.in" }, 2.9 + O);
  tl.to(otherRows, { opacity: 0, y: 8, duration: 0.3, ease: "power2.in", stagger: 0.05 }, 2.9 + O);
  tl.fromTo(
    cardrect,
    { attr: { y: 101, height: 356 } },
    { attr: { y: 50.75, height: 456.5 }, duration: 0.6, ease: "power3.inOut", immediateRender: false },
    3.05 + O,
  );
  tl.to(prow, { y: S2_HEADER_DY, duration: 0.6, ease: "power3.inOut" }, 3.05 + O);
  tl.fromTo(chev, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out", immediateRender: false }, 3.5 + O);
  tl.fromTo(
    crowEls,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.085, immediateRender: false },
    3.35 + O,
  );

  /* — Phase 4 · each item is processed in turn (3.2 – ~10.3 s):
       the blue card lifts over the row with its spinner, works, then the row ticks and the card moves on.
       Item 3 ("Score leads for ICP fit") is held longer — that frame is the static step-2 illustration. — */
  const LIFT = 0.32;
  const DONE = 0.26;
  const GAP = 0.06;
  const WORK = (k: number) => (k === 3 ? 1.0 : 0.45);
  let t = 4.4 + O;
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
  /* ≈ 10.3 s */

  /* — Phase 5 · fold back to the Agents list (F – F + 1), then the Agents view holds as the last image — */
  const F = t;
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
  blink(eyeGroups[2], F + 1.25); // a blink during the closing hold; eyes are open again 0.18 s later

  /* The site seeks and plays `master`; the child's timeScale maps the master's
     time into the cut (cut time = master time × 4/3), so every seek stays
     deterministic. The master ends in the closing hold, once the last blink
     is done (F + 1.6 of the cut; the mp4 padded to 11.2 s). */
  master.add(tl, 0);
  tl.timeScale(1 / 0.75);
  master.set({}, {}, (F + 1.6) * 0.75);

  return { tl: master, cleanup: () => {} };
}

/* ── step 03 · Pancake gets you the meeting (meetings-calendar-loop, 7 s) ──
   0 – 0.5 empty week · Mon / Tue / Wed / Thu 1.1 s each: chips pop in, the
   day circle hops and the numbers slide in / out of it, outcomes stamp the
   past meetings · the marker settles on Thu 22 and the filled week holds.
   Pace (2026-09-30, founder: "tout plus dynamique"): the composition's
   seconds (S3_CHIPS, the T_ beats) map through `at` — the first meeting
   pops at 0.2 s (was 0.55), each day lasts 0.83 s (was 1.1), the week is
   full at ~4.1 s (was ~5.7). Tween lengths are unchanged. */
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
  const at = (t: number) => 0.2 + (t - 0.55) * 0.75;

  // chips: tiny -> full (elastic), fully invisible at frame 0
  chips.forEach((c) => {
    tl.fromTo(c.el, { scale: 0.3 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.55)" }, at(c.pop));
    tl.fromTo(c.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, at(c.pop));
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

  const T_TUE = at(1.6);
  const T_WED = at(2.7);
  const T_THU = at(3.8);
  const T_FRI = at(4.9);
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
  tl.set({}, {}, T_FRI + 1.2); // hold once the last badge has landed (the composition padded to 7 s)

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
