"use client";

import { gsap } from "@/lib/gsap";

import {
  S1_HUBS,
  S1_JIT,
  S2_CHAT,
  S2_DRAFT,
  S3_CHIPS,
  S3_DAY_W,
  S3_NUM_DX,
  S3_THREAD,
  SX_LEADS_F5,
  SX_LEADS_ROW_IN,
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

/* Multi-line typing helpers — COPIED from production's lp-feat-timelines.ts (measureGlyphs,
   HIDDEN_CLIP, clipTo; that file left with the feature cards, 2026-10-11 — the deep-dive
   stories carry their own copies), so the steps chunk imports no other timeline module. */
type Glyph = { ch: string; right: number; top: number; bottom: number };
/** each character's right edge and line box, in the element's own unscaled px (Range rects) */
function measureGlyphs(el: HTMLElement): Glyph[] {
  const box = el.getBoundingClientRect();
  const s = el.offsetWidth ? box.width / el.offsetWidth : 1; // --lp-fit and any ancestor scale
  const glyphs: Glyph[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node as Text).data;
    let i = 0;
    for (const ch of text) {
      range.setStart(node, i);
      range.setEnd(node, i + ch.length);
      const r = range.getBoundingClientRect();
      i += ch.length;
      const prev = glyphs[glyphs.length - 1];
      if (r.width === 0 && prev) {
        glyphs.push({ ...prev, ch }); // a collapsed space: nothing new shows
        continue;
      }
      glyphs.push({ ch, right: (r.right - box.left) / s, top: (r.top - box.top) / s, bottom: (r.bottom - box.top) / s });
    }
  }
  return glyphs;
}
const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
/** everything above the glyph's line, and its line up to the glyph's right edge */
const clipTo = (g: Glyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top.toFixed(3)}px, ${g.right.toFixed(3)}px ${g.top.toFixed(3)}px, ${g.right.toFixed(3)}px ${g.bottom.toFixed(3)}px, 0 ${g.bottom.toFixed(3)}px)`;

/**
 * The three "Pancake fills your pipeline" step animations as GSAP timelines.
 * s1 and s3's calendar are the choreography of pancake-studio
 * shorts/brain-research-loop and meetings-calendar-loop (the compositions the
 * mp4s were rendered from), ported tween for tween onto the same markup and
 * CSS (LpStepMocks.tsx / steps.css) and paced tighter on 2026-09-30. s2 and
 * s3's intro come from the designer's "How it works" storyboards (Figma page
 * 4197:9774, 2026-10-11: frames 5016:4214 → 5022:6230 and 5022:6116 →
 * 5022:6080); the storyboards carry no prototype motion, so their timings are
 * derived (specs/updates/steps-how-it-works.md §6, §8) and every beat is a
 * named constant (S2_T, S3_T). Each timeline is built paused on its stage
 * root a viewport ahead of the card; lp-play-once.ts owns playback (as the
 * card arrives → play once → hold the last frame). Every builder is
 * seek-safe: sets and tweens only, no callbacks, no randomness. Frame 0 of
 * every timeline equals the markup's rest state. s2 and s3 carry labels at
 * the storyboard's pictures (f1 … f8, f1 … f5 and `cal`): QA seeks them
 * through window.__lpStep.s2 / .s3.
 */

export type StepVariant = "s1" | "s2" | "s3";
/** cue: the first scene where the card waits for the visitor (0: the poster) */
export type BuiltStep = { tl: gsap.core.Timeline; cleanup: () => void; cue: number };

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
  // the five hub names (V2 "Labels in 2nd level dots"), in S1_HUBS order
  const hlabels = $$(".lp-s1-hlabel");
  if (hlabels.length !== S1_HUBS.length) throw new Error("lp-step: s1 hub labels out of sync");

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
  tl.set(hlabels, { opacity: 0, y: 0 }, 0);
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
    // its name rises in as the pop settles (≈2.1 – 2.8 s, all in before the glide)
    tl.fromTo(
      hlabels[i],
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", immediateRender: false },
      t0 + 0.45,
    );
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
  // the hub names leave with the centre label (at 0.55 they would be 5.5px, under the panel)
  tl.to(hlabels, { opacity: 0, duration: 0.26, ease: "power2.in" }, tG);
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
  // and the hub names, in hub order (the last lands before the timeline ends: the held
  // picture is V2's labelled graph)
  tl.fromTo(
    hlabels,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", stagger: 0.04, immediateRender: false },
    tX + 0.49,
  );
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

  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── step 02 · Say who you want, Pancake builds the Play (Figma storyboard, ≈ 8.95 s) ──
   f1 the chat request and its answer (the poster) → the thread scrolls, one
   question arrives (f2) → the hand picks "1-50 employees" (f3) → the chat
   gives way to the draft, "Your Play takes shape here", whose slots are
   decided one by one (f4) → the Leads table fills row by row (f5) → the hand
   ticks the header checkbox, every row follows, the selection bar rises (f6)
   → the hand goes to "Add 13 to sequence" (f7) and clicks → the Play card,
   its sparkline drawing in (f8), held as the last image (= V2's art card
   5024:8277). Seconds of the timeline; the labels are the storyboard's
   pictures. Pace knobs: every hold is the gap between two entries. */
const S2_T = {
  scroll: 0.45,
  question: 0.62,
  questionItems: 0.74,
  f2: 1.45,
  hand1: 1.6,
  hover: 1.86,
  f3: 2.05,
  click1: 2.2,
  chatOut: 2.5,
  draftHead: 2.68,
  draftCard: 2.74,
  thinking: 2.8,
  slots: [3.0, 3.22, 3.44],
  f4: 3.95,
  draftOut: 4.35,
  leadsIn: 4.52,
  rowsIn: 4.62,
  f5: 5.12,
  pan: 5.14,
  hand2: 5.62,
  click2: 6.08,
  ticks: 6.14,
  bar: 6.22,
  f6: 6.7,
  hand3: 6.9,
  f7: 7.45,
  click3: 7.55,
  leadsOut: 7.8,
  play1: 7.96,
  play2: 8.04,
  spark: 8.2,
  f8: 8.75,
  end: 8.95,
} as const;
/** the hand's top-left at its three pictures (Figma instance boxes; its fingertip is 9.3, 3
    further in: steps.css .lp-sx-hand) */
const S2_HAND = {
  f3: { x: 122.53, y: 159.86 }, // on option 1
  f6: { x: 101.5, y: 137.75 }, // on the header checkbox
  f7: { x: 251.5, y: 368.53 }, // on "Add 13 to sequence"
} as const;
/** where the hand comes from, relative to the pose it eases onto (buildS1's pointer: lower right) */
const HAND_FROM = { x: 110, y: 96 };

function buildS2(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const T = S2_T;
  const bg = $(".lp-sx-bg");
  const chat = $(".lp-s2-chat");
  const question = $(".lp-s2-q");
  const qItems = $$(".lp-s2-q-item");
  const hover = $(".lp-s2-hover");
  const hand = $(".lp-sx-hand");
  const draft = $(".lp-s2-draft");
  const draftHead = $(".lp-s2-draft-head");
  const draftCard = $(".lp-s2-draft-card");
  const thinking = $(".lp-s2-thinking");
  const slots = $$(".lp-s2-slot").map((el) => ({
    undecided: el.querySelector<HTMLElement>(".lp-s2-slot-u")!,
    value: el.querySelector<HTMLElement>(".lp-s2-slot-v"),
    ok: el.querySelector<HTMLElement>(".lp-s2-slot-ok"),
  }));
  const decided = slots.filter((sl) => sl.value && sl.ok);
  if (slots.length !== S2_DRAFT.slots.length || decided.length !== T.slots.length) {
    throw new Error("lp-step: s2 draft slots out of sync");
  }
  const leads = $(".lp-sx-leads");
  const rows = $$(".lp-sx-row");
  if (rows.length !== SX_LEADS_ROW_IN.length) throw new Error("lp-step: s2 lead rows out of sync");
  const ticks = $$(".lp-sx-cb-on"); // the header's, then one per row
  const bar = $(".lp-s2-bar");
  const add = $(".lp-s2-bar-add");
  const plays = $$(".lp-s2-play");
  const spark = $<SVGPathElement>(".lp-s2-play-spark path");
  // the ground's second colour is the token's, read once (the chat's is steps.css's rest)
  const white = getComputedStyle(root).getPropertyValue("--lp-ink-0").trim() || "#ffffff";
  // rest poses that carry a half pixel as a transform (steps.css .lp-sx-leads, .lp-s2-bar)
  const leadsX = Number(gsap.getProperty(leads, "x")) || 0;
  const barY = Number(gsap.getProperty(bar, "y")) || 0;

  const tl = gsap.timeline({ paused: true });
  /** the hand's click, as buildS1's pointer */
  const click = (t: number) => {
    tl.to(hand, { scale: 0.88, duration: 0.08, ease: "power2.in" }, t);
    tl.to(hand, { scale: 1, duration: 0.26, ease: "back.out(1.6)" }, t + 0.08);
  };
  /** the hand eases in from the lower right onto a pose */
  const handIn = (pose: { x: number; y: number }, t: number) =>
    tl.fromTo(
      hand,
      { x: pose.x + HAND_FROM.x, y: pose.y + HAND_FROM.y, autoAlpha: 0 },
      { x: pose.x, y: pose.y, autoAlpha: 1, duration: 0.38, ease: "power3.out", immediateRender: false },
      t,
    );

  tl.addLabel("f1", 0);

  /* — f1 → f2 · the thread scrolls up, the question card arrives and fills — */
  tl.to(chat, { y: S2_CHAT.scrollY, duration: 0.6, ease: "power3.inOut" }, T.scroll);
  tl.fromTo(
    question,
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false },
    T.question,
  );
  tl.fromTo(
    qItems,
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.045, immediateRender: false },
    T.questionItems,
  );
  tl.addLabel("f2", T.f2);

  /* — f3 · the hand lands on option 1 (its hover plate lights), then clicks — */
  handIn(S2_HAND.f3, T.hand1);
  tl.fromTo(hover, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power1.out", immediateRender: false }, T.hover);
  tl.addLabel("f3", T.f3);
  click(T.click1);
  tl.to(hover, { backgroundColor: "rgba(0,0,0,0.08)", duration: 0.1, ease: "power1.out" }, T.click1);
  tl.to(hover, { backgroundColor: "rgba(0,0,0,0.04)", duration: 0.25, ease: "power1.out" }, T.click1 + 0.1);

  /* — f4 · the chat leaves, the ground turns white, the draft takes shape — */
  tl.to(chat, { autoAlpha: 0, y: S2_CHAT.scrollY - 10, duration: 0.26, ease: "power2.in" }, T.chatOut);
  tl.to(hand, { autoAlpha: 0, y: S2_HAND.f3.y - 10, duration: 0.26, ease: "power2.in" }, T.chatOut);
  tl.to(bg, { backgroundColor: white, duration: 0.3, ease: "power1.inOut" }, T.chatOut);
  const rise = { autoAlpha: 1, y: 0, duration: 0.38, ease: "power3.out", immediateRender: false };
  tl.fromTo(draftHead, { autoAlpha: 0, y: 10 }, rise, T.draftHead);
  tl.fromTo(draftCard, { autoAlpha: 0, y: 10 }, rise, T.draftCard);
  tl.fromTo(thinking, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power1.out", immediateRender: false }, T.thinking);
  // "thinking": two soft pulses, the first back at full strength exactly on f4 (no loop)
  const pulse = (T.f4 - (T.thinking + 0.3)) / 2;
  tl.to(thinking, { opacity: 0.45, duration: pulse, ease: "sine.inOut", yoyo: true, repeat: 3 }, T.thinking + 0.3);
  decided.forEach((sl, k) => {
    const t = T.slots[k];
    tl.to(sl.undecided, { opacity: 0, duration: 0.12, ease: "power1.in" }, t);
    tl.fromTo(sl.value, { opacity: 0, x: 6 }, { opacity: 1, x: 0, duration: 0.26, ease: "power3.out", immediateRender: false }, t);
    tl.fromTo(sl.ok, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(1.6)", immediateRender: false }, t);
  });
  tl.addLabel("f4", T.f4);

  /* — f5 · the draft leaves, the Leads table comes in at its frame-5 pose, row by row — */
  tl.to(draft, { autoAlpha: 0, y: -10, duration: 0.26, ease: "power2.in" }, T.draftOut);
  const f5 = { x: leadsX + SX_LEADS_F5.x, y: SX_LEADS_F5.y };
  tl.fromTo(
    leads,
    { autoAlpha: 0, ...f5 },
    { autoAlpha: 1, ...f5, duration: 0.3, ease: "power2.out", immediateRender: false },
    T.leadsIn,
  );
  rows.forEach((row, i) => {
    tl.fromTo(row, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none", immediateRender: false }, T.rowsIn + SX_LEADS_ROW_IN[i]);
  });
  tl.addLabel("f5", T.f5);

  /* — f6 · the table settles, the hand ticks the header checkbox, every row follows, the bar rises — */
  tl.to(leads, { x: leadsX, y: 0, duration: 0.6, ease: "power2.inOut" }, T.pan);
  handIn(S2_HAND.f6, T.hand2);
  click(T.click2);
  tl.fromTo(
    ticks,
    { scale: 0 },
    { scale: 1, duration: 0.25, ease: "back.out(1.6)", stagger: 0.03, immediateRender: false },
    T.ticks,
  );
  tl.fromTo(
    bar,
    { autoAlpha: 0, y: barY + 16, scale: 0.96 },
    { autoAlpha: 1, y: barY, scale: 1, duration: 0.4, ease: "back.out(1.4)", immediateRender: false },
    T.bar,
  );
  tl.addLabel("f6", T.f6);

  /* — f7 · the hand goes to "Add 13 to sequence" and clicks — */
  tl.to(hand, { x: S2_HAND.f7.x, y: S2_HAND.f7.y, duration: 0.5, ease: "power3.inOut" }, T.hand3);
  tl.addLabel("f7", T.f7);
  click(T.click3);
  tl.to(add, { scale: 0.96, duration: 0.09, ease: "power2.in" }, T.click3);
  tl.to(add, { scale: 1, duration: 0.3, ease: "back.out(1.6)" }, T.click3 + 0.09);

  /* — f8 · the table, the bar and the hand leave; the Play cards rise, the sparkline draws in — */
  tl.to([leads, hand], { autoAlpha: 0, duration: 0.26, ease: "power2.in" }, T.leadsOut);
  tl.to(bar, { autoAlpha: 0, y: barY + 10, duration: 0.26, ease: "power2.in" }, T.leadsOut);
  [T.play1, T.play2].forEach((t, i) => {
    tl.fromTo(
      plays[i],
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", immediateRender: false },
      t,
    );
  });
  tl.to(spark, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, T.spark);
  tl.addLabel("f8", T.f8);
  tl.set({}, {}, T.end); // the Play card holds

  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── step 03 · Pancake gets you the meeting (Figma storyboard intro + meetings-calendar-loop) ──
   f1 the selected leads (the poster) → one lead, and a message Pancake drafts
   for her, typed (f2 = three glyphs into its last line) → sent (f3) → the
   thread scrolls, she answers (f4) → the meeting (f5) → the thread leaves,
   the cream card shows and today's calendar plays, unchanged, as the end
   (`cal`): the filled week holds = production's end picture (V2 art card
   5022:6046). ≈ 10.7 s with the default message: 7.3 s of intro, then the
   calendar's 4.26 s at S3_CAL_RATE. Typing times depend on the message's
   glyphs, so the later beats are offsets from the moment it is sent. */
const S3_T = {
  leadsOut: 0.45,
  lead: 0.62,
  conn1: 0.82,
  message: 0.9,
  type: 1.3,
  /** after the last glyph */
  caretOff: 0.25,
  sentAfter: 0.35,
  f3After: 0.65,
  /** after f3 (the message is sent) */
  scroll1: 0.4,
  conn2: 0.65,
  reply: 0.75,
  f4: 1.25,
  scroll2: 1.85,
  conn3: 2.1,
  meet: 2.2,
  f5: 2.7,
  threadOut: 3.4,
  calendarIn: 3.6,
  cal: 3.8,
} as const;
/** Pancake's typing pace (the deep dive's message story): 12 ms a glyph, a breath after a
    sentence end and after a comma */
const S3_TYPE = { glyph: 0.012, sentence: 0.06, comma: 0.035 } as const;
/** how fast the calendar plays inside the master (its own seconds are unchanged) */
const S3_CAL_RATE = 1.25;

function buildS3(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const T = S3_T;
  const bg = $(".lp-sx-bg");
  const leads = $(".lp-sx-leads");
  const thread = $(".lp-s3-thread");
  const leadCard = $(".lp-s3-lead");
  const conns = $$(".lp-s3-conn");
  const msgCard = $(".lp-s3-msg");
  const ebDraft = $(".lp-s3-eb-draft");
  const ebSent = $(".lp-s3-eb-sent");
  const msg = $(".lp-s3-msg-text");
  const caret = $(".lp-s3-caret");
  const replyCard = $(".lp-s3-reply");
  const meetCard = $(".lp-s3-meet");
  const calendar = $(".lp-s3-card");
  if (conns.length !== 3) throw new Error("lp-step: s3 connectors out of sync");

  // the ground's second colour is the token's, read once (never a second name for #fafaf8)
  const threadBg = getComputedStyle(root).getPropertyValue("--lp-dive-stage-bg").trim() || "#fafaf8";
  // the message's glyph edges, measured from the live text (weight 500, its typing face)
  const glyphs = measureGlyphs(msg);
  if (!glyphs.length) throw new Error("lp-step: s3 message has no glyphs");

  const tl = gsap.timeline({ paused: true });
  const rise = { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false };
  const grow = { scaleY: 1, duration: 0.22, ease: "power2.out", immediateRender: false };

  tl.addLabel("f1", 0);

  /* — f1 → f2 · the table leaves, the ground turns to the thread's; the lead, then her message card — */
  tl.to(leads, { autoAlpha: 0, y: -8, duration: 0.26, ease: "power2.in" }, T.leadsOut);
  tl.to(bg, { backgroundColor: threadBg, duration: 0.3, ease: "power1.inOut" }, T.leadsOut);
  tl.fromTo(leadCard, { autoAlpha: 0, y: 12 }, rise, T.lead);
  tl.fromTo(conns[0], { scaleY: 0 }, grow, T.conn1);
  tl.fromTo(msgCard, { autoAlpha: 0, y: 12 }, rise, T.message);

  /* — the message types: a clip staircase over the real text, the caret on the glyph edges — */
  const lastTop = glyphs[glyphs.length - 1].top;
  const lastLineStart = glyphs.findIndex((g) => Math.abs(g.top - lastTop) < 1);
  const f2Glyph = Math.min(glyphs.length - 1, lastLineStart + 2); // three glyphs into the last line
  let t: number = T.type;
  let tF2: number = T.type;
  tl.set(caret, { x: 0, y: glyphs[0].top, opacity: 1 }, T.type - 0.25);
  glyphs.forEach((g, i) => {
    tl.set(msg, { clipPath: clipTo(g) }, t);
    tl.set(caret, { x: +g.right.toFixed(3), y: +g.top.toFixed(3) }, t);
    if (i === f2Glyph) tF2 = t;
    const next = glyphs[i + 1]?.ch ?? "";
    t += S3_TYPE.glyph + (g.ch === "," ? S3_TYPE.comma : g.ch === "." && next === " " ? S3_TYPE.sentence : 0);
  });
  tl.addLabel("f2", tF2 + 0.001);
  const tE = t;
  tl.set(caret, { opacity: 0 }, tE + T.caretOff);
  tl.set(msg, { clipPath: "none" }, tE + T.caretOff); // the text paints like any paragraph again

  /* — f3 · sent — */
  tl.to(ebDraft, { opacity: 0, y: -4, duration: 0.15, ease: "power2.in" }, tE + T.sentAfter);
  tl.fromTo(
    ebSent,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", immediateRender: false },
    tE + T.sentAfter,
  );
  const tS = tE + T.f3After;
  tl.addLabel("f3", tS);

  /* — f4 · the thread scrolls (the sent message becomes history: regular weight), she answers — */
  const [pose4, pose5] = S3_THREAD.scroll;
  tl.to(thread, { x: pose4.x, y: pose4.y, duration: 0.6, ease: "power3.inOut" }, tS + T.scroll1);
  tl.to(msg, { fontWeight: 400, duration: 0.6, ease: "none" }, tS + T.scroll1);
  tl.fromTo(conns[1], { scaleY: 0 }, grow, tS + T.conn2);
  tl.fromTo(replyCard, { autoAlpha: 0, y: 12 }, rise, tS + T.reply);
  tl.addLabel("f4", tS + T.f4);

  /* — f5 · it scrolls again, the meeting appears — */
  tl.to(thread, { x: pose5.x, y: pose5.y, duration: 0.6, ease: "power3.inOut" }, tS + T.scroll2);
  tl.fromTo(conns[2], { scaleY: 0 }, grow, tS + T.conn3);
  tl.fromTo(meetCard, { autoAlpha: 0, y: 12 }, rise, tS + T.meet);
  tl.addLabel("f5", tS + T.f5);

  /* — the thread leaves, its ground with it (the cream card shows), and the calendar comes in
       on its own frame 0: the empty week, Mon 19 in the circle — */
  tl.to(thread, { autoAlpha: 0, y: pose5.y - 10, duration: 0.28, ease: "power2.in" }, tS + T.threadOut);
  tl.to(bg, { opacity: 0, duration: 0.3, ease: "power1.inOut" }, tS + T.threadOut);
  tl.fromTo(
    calendar,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false },
    tS + T.calendarIn,
  );

  /* — today's calendar, unchanged: a child of the master (NOT paused — a paused child would
       not follow its parent's seeks), played at S3_CAL_RATE — */
  const cal = buildCalendar(root);
  tl.add(cal, tS + T.cal);
  cal.timeScale(S3_CAL_RATE);
  tl.addLabel("cal", tS + T.cal);

  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── step 03's calendar (meetings-calendar-loop, 7 s) — the choreography production
   shipped as the whole of step 03 until 2026-10-11, tween for tween ──
   0 – 0.5 empty week · Mon / Tue / Wed / Thu 1.1 s each: chips pop in, the
   day circle hops and the numbers slide in / out of it, outcomes stamp the
   past meetings · the marker settles on Thu 22 and the filled week holds.
   Pace (2026-09-30, founder: "tout plus dynamique"): the composition's
   seconds (S3_CHIPS, the T_ beats) map through `at` — the first meeting
   pops at 0.2 s (was 0.55), each day lasts 0.83 s (was 1.1), the week is
   full at ~4.1 s (was ~5.7). Tween lengths are unchanged. Its closing pad is
   0.8 s (was 1.2 as a stand-alone card: the last badge lands at T_FRI + 0.7). */
function buildCalendar(root: HTMLElement): gsap.core.Timeline {
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

  const tl = gsap.timeline();
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
  tl.set({}, {}, T_FRI + 0.8); // hold once the last badge has landed

  return tl;
}

const BUILDERS: Record<StepVariant, (root: HTMLElement) => BuiltStep> = {
  s1: buildS1,
  s2: buildS2,
  s3: buildS3,
};

export function buildStepTimeline(variant: StepVariant, root: HTMLElement): BuiltStep {
  return BUILDERS[variant](root);
}
