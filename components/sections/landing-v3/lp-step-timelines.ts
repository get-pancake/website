"use client";

import { gsap } from "@/lib/gsap";

import { registerTxtPlugin } from "./lp-gsap-txt";

import {
  S1_HUBS,
  S1_REST_LEAVES,
  S1_VERDICTS,
  S2_CHAT,
  S2_DRAFT,
  S3_CHIPS,
  S3_DAY_W,
  S3_LANDED,
  S3_NUM_DX,
  S3_THREAD,
  S4_DISC,
  S4_MAIL,
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
   clipTo; that file left with the feature cards, 2026-10-11 — the deep-dive stories carry
   their own copies), so the steps chunk imports no other timeline module. clipTo differs
   from the original since 2026-10-12: one unit, see `px` below. (The hidden rest clip is
   steps.css's .lp-s3-msg-text; no timeline sets it.) */
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
/** A px length in the one form GSAP's CSSPlugin takes at face value. It reads a value's unit
    as whatever follows `String(parseFloat(value))`, so "21.000px" carries the unit ".000px",
    and a `%` next to the browser's own px serialisation is a mismatch too; every mismatch on
    a non-zero number appends a probe div and measures it (a forced layout). Step 03's typing
    staircase is one set per glyph (119), all initialised in the ONE tick of a fast-forward
    (leaving the card unfinished): 412 probes, a tick of 90 ms on a fast Mac and 350 – 560 ms
    at CPU ×4 (verify M-03, 2026-10-12; `_convertToUnit` = 84 of 99 ms). So: px everywhere,
    no trailing zeros — the same picture, 0 probes. Do not go back to `toFixed()` + "px" or
    to `%` in a string a timeline sets (artifacts pw/lsf-clipcost.mjs counts the probes). */
const px = (n: number) => `${+n.toFixed(3)}px`;
/** everything above the glyph's line, and its line up to the glyph's right edge; `w` is the
    element's own width (what `100%` was) */
const clipTo = (g: Glyph, w: number) =>
  `polygon(0px 0px, ${px(w)} 0px, ${px(w)} ${px(g.top)}, ${px(g.right)} ${px(g.top)}, ${px(g.right)} ${px(g.bottom)}, 0px ${px(g.bottom)})`;

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
 * every timeline equals the markup's rest state, except s4's, whose markup is
 * its END picture (LpStepAnim REST_IS_END; buildS4 sets its frame 0). s2 and
 * s3 carry labels at the storyboard's pictures (f1 … f8, f1 … f5 and `cal`):
 * QA seeks them through window.__lpStep.s2 / .s3. Since 2026-10-28 step 02
 * plays s4 (Claude and the envelopes it sends) and s2 is unused, as s3.
 */

export type StepVariant = "s0" | "s1" | "s2" | "s3" | "s4";
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

/* ── step 01 (since 2026-10-27) · Connect your agent (≈ 5 s) ──
   In Claude, as step 02: the hand opens the composer's "+", Connectors comes up with Pancake
   in it, the hand connects it and allows it on Pancake's sign-in card; the "+" gives its
   place to the connector chip (step 02's composer, exactly), the composer docks, and Claude
   says what it can now do, one line at a time, in the infra section's three tones. */
const S0_T = {
  hand: 0.35,
  plus: 0.73,
  menu: 0.85,
  toConnect: 1.25,
  connect: 1.72,
  signin: 1.95,
  toAllow: 2.35,
  allow: 2.85,
  connected: 3.1,
  dock: 3.45,
  said: 3.75,
  /** a word of Claude's line */
  word: 0.07,
  /** the three things it can now do, after the line */
  can: 0.28,
  canGap: 0.15,
} as const;
/** the hand's top-left on what it clicks (its fingertip is 9.3, 3 in: steps.css .lp-sx-hand) */
const S0_HAND = {
  plus: { x: 345.7, y: 210 }, // the composer's "+" (centre 355, 213)
  connect: { x: 347.5, y: 118 }, // "Connect" on the Pancake row
  allow: { x: 222.7, y: 251 }, // "Allow" (centre 232, 254)
} as const;
/** how far the composer docks, as in step 02 (189 → 350) */
const S0_DOCK = 161;

function buildS0(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const hand = $(".lp-sx-hand");
  const composer = $(".lp-s0-composer");
  const plus = $(".lp-s0-plus");
  const chip = $(".lp-s0-pk");
  const ring = $(".lp-s0-ring");
  const menu = $(".lp-s0-menu");
  const connect = $(".lp-s0-connect");
  const signin = $(".lp-s0-signin");
  const allow = $(".lp-s0-allow");
  const said = $(".lp-s0-said");
  const can = $$(".lp-s0-can");
  const glyphs = measureGlyphs(said);
  const words = glyphs.filter((g, i) => g.ch !== " " && (glyphs[i + 1]?.ch ?? " ") === " ");
  const saidW = said.offsetWidth;
  if (!words.length || can.length !== 3) throw new Error("lp-step: s0 markup out of sync");
  const T = S0_T;

  const tl = gsap.timeline({ paused: true });
  /* — frame 0 = the empty composer and its "+"; everything else waits hidden — */
  tl.set(hand, { x: S0_HAND.plus.x + HAND_FROM.x, y: S0_HAND.plus.y + HAND_FROM.y, autoAlpha: 0, scale: 1 }, 0);
  tl.set(composer, { y: 0 }, 0);
  tl.set(plus, { scale: 1, autoAlpha: 1 }, 0);
  tl.set(chip, { scale: 0.4, autoAlpha: 0 }, 0);
  tl.set(ring, { scale: 0.3, opacity: 0 }, 0);
  tl.set([menu, signin], { autoAlpha: 0, y: 0, scale: 1 }, 0);
  tl.set(said, { autoAlpha: 0, y: 0, clipPath: clipTo(words[0], saidW) }, 0);
  tl.set(can, { autoAlpha: 0, y: 0 }, 0);

  /** the hand's click, as step 02's */
  const click = (t: number, what: HTMLElement, to = 0.94) => {
    tl.to(hand, { scale: 0.88, duration: 0.08, ease: "power2.in" }, t);
    tl.to(hand, { scale: 1, duration: 0.26, ease: "back.out(1.6)" }, t + 0.08);
    tl.to(what, { scale: to, duration: 0.08, ease: "power2.in" }, t);
    tl.to(what, { scale: 1, duration: 0.28, ease: "back.out(1.8)" }, t + 0.08);
  };

  /* — the hand comes in from the lower right and opens the "+" — */
  tl.to(hand, { x: S0_HAND.plus.x, y: S0_HAND.plus.y, autoAlpha: 1, duration: 0.38, ease: "power3.out" }, T.hand);
  click(T.plus, plus, 0.86);
  /* — Connectors comes up above the composer, Pancake first — */
  tl.fromTo(
    menu,
    { autoAlpha: 0, y: 8, scale: 0.98 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out", immediateRender: false },
    T.menu,
  );
  tl.to(hand, { x: S0_HAND.connect.x, y: S0_HAND.connect.y, duration: 0.45, ease: "power3.inOut" }, T.toConnect);
  click(T.connect, connect);
  /* — Pancake's sign-in card takes over; the hand allows it — */
  tl.to(menu, { autoAlpha: 0, y: 6, duration: 0.2, ease: "power2.in" }, T.signin - 0.08);
  tl.fromTo(
    signin,
    { autoAlpha: 0, y: 10, scale: 0.97 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.36, ease: "power3.out", immediateRender: false },
    T.signin,
  );
  tl.to(hand, { x: S0_HAND.allow.x, y: S0_HAND.allow.y, duration: 0.48, ease: "power3.inOut" }, T.toAllow);
  click(T.allow, allow);
  tl.to(allow, { backgroundColor: "#ff7aa0", color: "#2c002a", duration: 0.18, ease: "power1.out" }, T.allow);
  /* — connected: the card and the hand leave, the chip takes the "+"'s place with a ping — */
  tl.to(signin, { autoAlpha: 0, y: -6, scale: 0.98, duration: 0.24, ease: "power2.in" }, T.connected - 0.12);
  tl.to(hand, { autoAlpha: 0, y: S0_HAND.allow.y + 14, duration: 0.26, ease: "power2.in" }, T.connected - 0.06);
  tl.to(plus, { scale: 0, autoAlpha: 0, duration: 0.16, ease: "power2.in" }, T.connected);
  tl.fromTo(
    chip,
    { scale: 0.4, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", immediateRender: false },
    T.connected + 0.08,
  );
  tl.fromTo(
    ring,
    { scale: 0.3, opacity: 0.85 },
    { scale: 2.2, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
    T.connected + 0.12,
  );
  /* — the composer docks; Claude says what it can now do — */
  tl.to(composer, { y: S0_DOCK, duration: 0.55, ease: "power3.inOut" }, T.dock);
  tl.fromTo(
    said,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false },
    T.said,
  );
  let t = T.said + 0.1;
  words.forEach((g) => {
    tl.set(said, { clipPath: clipTo(g, saidW) }, t);
    t += T.word;
  });
  tl.set(said, { clipPath: "none" }, t);
  can.forEach((row, k) => {
    tl.fromTo(
      row,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.36, ease: "power3.out", immediateRender: false },
      t + T.can + k * T.canGap,
    );
  });
  tl.set({}, {}, t + T.can + 2 * T.canGap + 0.9); // the end picture holds

  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── step 03 (since 2026-10-27) · Watch it get better (≈ 5.6 s) ──
   The brain-research-loop composition's Brain (step 01 until then), grown by the leads: it
   rests young (each hub and its first leaf), glided left and shrunk as it was under the
   market profile, beside three leads → each lead gets its verdict (approved, not a fit,
   replied), a ping runs from Acme and the hubs that verdict teaches grow their leaves → the
   leads give way to "Who fits", whose rows resolve out of the skeletons → back to the whole
   labelled Brain, held as the last image (the composition's own end picture). */
const S1_GLIDE = { x: -130.5, y: 42.08, scale: 0.55 } as const;
const S1_T = {
  verdict: 0.4,
  verdictGap: 0.8,
  /** after the last verdict: the leads leave, "Who fits" comes in */
  panel: 0.7,
} as const;

function buildS1(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const graph = $(".lp-s1-graph");
  const center = $(".lp-s1-center");
  const clabel = $(".lp-s1-clabel");
  const cping = $(".lp-s1-cping");
  const leads = $$(".lp-s1-lead");
  const poss = $$(".lp-s1-lead-pos");
  const verdicts = $$(".lp-s1-verdict");
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
  if (leads.length !== S1_VERDICTS.length || verdicts.length !== S1_VERDICTS.length)
    throw new Error("lp-step: s1 leads out of sync");

  // the graph in the composition's build order (lp-step-data.ts s1Graph): hub edge, hub dot,
  // leaf edges/dots, sub-branches — regrouped per hub, split into the young Brain's and the rest
  const lines = $$<SVGLineElement>(".lp-s1-edges line");
  const dotEls = $$(".lp-s1-dot");
  let ei = 0;
  let di = 0;
  const hubEdges: SVGLineElement[] = [];
  const hubDots: HTMLElement[] = [];
  const restEdges: SVGLineElement[] = [];
  const restDots: HTMLElement[] = [];
  const growEdges: SVGLineElement[][] = [];
  const growDots: (HTMLElement | null)[][] = [];
  S1_HUBS.forEach((h) => {
    hubEdges.push(lines[ei++]);
    hubDots.push(dotEls[di++]);
    const ge: SVGLineElement[] = [];
    const gd: (HTMLElement | null)[] = [];
    h.leaves.forEach((L, k) => {
      const e = L[0] !== null ? lines[ei++] : null;
      const d = L.length === 4 ? dotEls[di++] : null;
      if (k < S1_REST_LEAVES) {
        if (e) restEdges.push(e);
        if (d) restDots.push(d);
      } else {
        if (e) ge.push(e);
        gd.push(d);
      }
    });
    h.sub?.forEach(() => {
      ge.push(lines[ei++]);
      gd.push(dotEls[di++]);
    });
    growEdges.push(ge);
    growDots.push(gd);
  });
  if (ei !== lines.length || di !== dotEls.length) throw new Error("lp-step: s1 graph markup out of sync");
  const undraw = (_i: number, el: SVGLineElement) => Number(el.dataset.len);

  gsap.set(graph, { transformOrigin: "246.5px 202.92px" });

  const tl = gsap.timeline({ paused: true });

  /* — 0 · frame 0 = the young Brain, glided left, beside the three unjudged leads — */
  const grownEdges = growEdges.flat();
  const grownDots = growDots.flat().filter((d): d is HTMLElement => !!d);
  tl.set(graph, { ...S1_GLIDE, opacity: 1 }, 0);
  tl.set([center, ...hubDots, ...restDots], { scale: 1, opacity: 1 }, 0);
  tl.set([...hubEdges, ...restEdges], { strokeDashoffset: 0, opacity: 1 }, 0);
  tl.set(grownDots, { scale: 0, opacity: 1 }, 0);
  tl.set(grownEdges, { strokeDashoffset: undraw, opacity: 1 }, 0);
  tl.set([clabel, ...hlabels], { opacity: 0, y: 0 }, 0);
  tl.set(leads, { opacity: 1, x: 0, scale: 1 }, 0);
  tl.set(poss, { opacity: 1, y: 0 }, 0);
  tl.set(verdicts, { opacity: 0, y: 6 }, 0);
  tl.set(cping, { opacity: 0 }, 0);
  tl.set(panel, { x: 0, opacity: 1 }, 0);
  tl.set([ptitle, subA, subB, ...srows, ...rows], { opacity: 0 }, 0);

  /* — 1 · the verdicts, lead by lead: each one pings Acme and grows the hubs it teaches — */
  S1_VERDICTS.forEach((v, j) => {
    const tv = S1_T.verdict + j * S1_T.verdictGap;
    const card = leads[j];
    tl.to(card, { scale: 0.97, duration: 0.08, ease: "power2.in" }, tv);
    tl.to(card, { scale: 1, duration: 0.3, ease: "back.out(1.6)" }, tv + 0.08);
    tl.to(poss[j], { opacity: 0, y: -6, duration: 0.15, ease: "power2.in" }, tv + 0.02);
    tl.fromTo(
      verdicts[j],
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", immediateRender: false },
      tv + 0.1,
    );
    tl.fromTo(
      cping,
      { scale: 0.4, opacity: 0.9 },
      { scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
      tv + 0.22,
    );
    v.hubs.forEach((hi, n) => {
      const base = tv + 0.3 + n * 0.12;
      growEdges[hi].forEach((e, k) => {
        tl.to(e, { strokeDashoffset: 0, duration: 0.29, ease: "power1.inOut" }, base + k * 0.05);
      });
      growDots[hi].forEach((d, k) => {
        if (d) tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" }, base + k * 0.05 + 0.12);
      });
    });
  });

  /* — 2 · the leads give way to "Who fits"; its rows resolve out of the skeletons — */
  const tP = S1_T.verdict + (S1_VERDICTS.length - 1) * S1_T.verdictGap + S1_T.panel;
  tl.to(leads, { x: 24, opacity: 0, duration: 0.28, ease: "power2.in", stagger: 0.05 }, tP);
  tl.fromTo(ptitle, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" }, tP + 0.3);
  tl.fromTo(subA, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.38, ease: "power3.out" }, tP + 0.36);
  tl.fromTo(
    srows,
    { opacity: 0, x: 14 },
    { opacity: 1, x: 0, duration: 0.34, ease: "power3.out", stagger: 0.075 },
    tP + 0.41,
  );
  tl.fromTo(
    skels,
    { backgroundPositionX: "120%" },
    { backgroundPositionX: "-120%", duration: 0.75, ease: "none", repeat: 1, stagger: 0.06 },
    tP + 0.68,
  );
  const tR = tP + 1.2;
  tl.to(subA, { opacity: 0, y: -6, duration: 0.15, ease: "power2.in" }, tR);
  tl.fromTo(subB, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }, tR + 0.09);
  rows.forEach((r, i) => {
    const tr = tR + 0.08 + i * 0.14;
    tl.to(srows[i], { opacity: 0, duration: 0.17, ease: "power2.in" }, tr);
    tl.fromTo(r, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }, tr + 0.06);
  });

  /* — 3 · back to the whole Brain, labelled, held as the last image — */
  const tX = tR + 1.3;
  tl.to(panel, { x: 300, opacity: 0, duration: 0.3, ease: "power2.in" }, tX);
  tl.to(graph, { x: 0, y: 0, scale: 1, duration: 0.68, ease: "power3.inOut" }, tX + 0.04);
  tl.fromTo(clabel, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }, tX + 0.49);
  tl.fromTo(
    hlabels,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", stagger: 0.04, immediateRender: false },
    tX + 0.49,
  );
  // the invisible leads and panel go back to their frame-0 poses during the hold
  const tZ = tX + 0.9;
  tl.set(panel, { x: 0, opacity: 1 }, tZ);
  tl.set([ptitle, subA, subB, ...srows, ...rows], { opacity: 0 }, tZ);
  tl.set(subA, { y: 0 }, tZ);
  tl.set({}, {}, tZ + 0.05);

  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── step 02 · Say who you want, Pancake builds the Play (Figma storyboard, ≈ 14 s) ──
   The opening exchange PLAYS (founder 2026-10-13: "those interactions should
   be animated"; before that it was a still picture, then a still picture
   held longer): the request is typed in the composer and sent, it joins the
   thread while the composer glides down, the worked row reads Pancake's
   steps one by one and settles on "Worked across 5 steps", the answer writes
   itself word by word = the storyboard's f1 (the label sits there). Rest =
   the empty composer, as step 01 rests on its empty input.
   Then the storyboard: the thread scrolls, one question arrives (f2) → the
   hand picks "1-50 employees" (f3) → the chat gives way to the draft, "Your
   Play takes shape here", whose slots are decided one by one (f4) → the
   Leads table fills row by row (f5) → the hand ticks the header checkbox,
   every row follows, the selection bar rises (f6) → the hand goes to "Add 13
   to sequence" (f7) and clicks → the Play card, its sparkline drawing in
   (f8), held as the last image (= V2's art card 5024:8277).
   S2_OPEN paces the exchange (its length follows the request's glyphs and
   the answer's words); S2_T counts from the moment the answer is complete.
   Pace knobs: every hold is the gap between two entries. */
const S2_OPEN = {
  type: 0.5,
  /** a person typing (the hero demo's pace is 38 ms) */
  key: 0.036,
  /** after the last key: the send button is pressed */
  send: 0.25,
  /** after the press: the request is in the thread, the composer glides down */
  sent: 0.12,
  /** after it is sent: the worked row comes in on its first line */
  work: 0.45,
  /** each line of S2_CHAT.working */
  step: 0.24,
  /** after the row settles: the answer card */
  answer: 0.14,
  /** each word of the answer */
  word: 0.034,
  /** the composer's travel, from the middle of the stage to under the thread (top 189 → 350) */
  dockY: 161,
} as const;
/** after the opening exchange (f1). The answer has just been written: it holds 1 s. */
const S2_T = {
  scroll: 1.0,
  question: 1.17,
  questionItems: 1.29,
  f2: 2.0,
  hand1: 2.35,
  hover: 2.61,
  f3: 2.8,
  click1: 2.95,
  chatOut: 3.35,
  draftHead: 3.53,
  draftCard: 3.59,
  thinking: 3.65,
  slots: [3.85, 4.07, 4.29],
  f4: 4.8,
  draftOut: 5.2,
  leadsIn: 5.37,
  rowsIn: 5.47,
  f5: 5.97,
  pan: 5.99,
  hand2: 6.47,
  click2: 6.93,
  ticks: 6.99,
  bar: 7.07,
  f6: 7.55,
  hand3: 7.75,
  f7: 8.3,
  click3: 8.4,
  leadsOut: 8.65,
  play1: 8.81,
  play2: 8.89,
  spark: 9.05,
  f8: 9.6,
  end: 9.8,
} as const;
type S2Times = { [K in keyof typeof S2_T]: (typeof S2_T)[K] extends readonly number[] ? readonly number[] : number };
/** S2_T on the master's clock: every entry moved by the opening's length */
const s2Times = (by: number): S2Times =>
  Object.fromEntries(
    Object.entries(S2_T).map(([k, v]) => [k, typeof v === "number" ? v + by : v.map((n) => n + by)]),
  ) as unknown as S2Times;
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
  const O = S2_OPEN;
  const chat = $(".lp-s2-chat");
  const composer = $(".lp-s2-composer");
  const ph = $(".lp-s2-ph");
  const typed = $(".lp-s2-typed");
  const caret = $(".lp-s2-caret");
  const send = $(".lp-s2-send");
  const bubble = $(".lp-s2-bubble");
  const worked = $(".lp-s2-worked");
  const workedLabel = $(".lp-s2-worked-l");
  const chevron = $<SVGElement>(".lp-s2-worked svg");
  const answer = $(".lp-s2-answer");
  const answerText = $(".lp-s2-answer-t");
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
  if (slots.length !== S2_DRAFT.slots.length || decided.length !== S2_T.slots.length) {
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
  const found = plays[0]?.querySelector<HTMLElement>(".lp-s2-play-val") ?? null;
  const foundTo = found ? Number(found.textContent) || 0 : 0;
  registerTxtPlugin();
  if (found && foundTo) gsap.set(found, { txt: "0" });
  // the worked row starts on Pancake's first step, its chevron waits for the last
  gsap.set(workedLabel, { txt: S2_CHAT.working[0] });
  gsap.set(chevron, { opacity: 0 });
  // the request's glyph edges (one line) and the answer's words, measured from the live text
  const keys = measureRightEdges(typed);
  const typedW = keys[keys.length - 1] ?? 0;
  const glyphs = measureGlyphs(answerText);
  const words = glyphs.filter((g, i) => g.ch !== " " && (glyphs[i + 1]?.ch ?? " ") === " ");
  const answerW = answerText.offsetWidth;
  if (!keys.length || !words.length) throw new Error("lp-step: s2 has no text to type");
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

  /* — the opening exchange · the request is typed in the composer… — */
  let t: number = O.type;
  keys.forEach((edge, i) => {
    t += O.key;
    tl.set(typed, { clipPath: `inset(0px ${px(Math.max(0, typedW - edge))} 0px 0px)` }, t); // one unit: see `px`
    tl.set(caret, { x: +edge.toFixed(3) }, t);
    if (i === 0) tl.set(ph, { opacity: 0 }, t);
  });
  /* …sent (the button is pressed): it joins the thread while the composer glides down under it… */
  const tSend = t + O.send;
  tl.to(send, { scale: 0.86, duration: 0.08, ease: "power2.in" }, tSend);
  tl.to(send, { scale: 1, duration: 0.28, ease: "back.out(1.8)" }, tSend + 0.08);
  const tSent = tSend + O.sent;
  tl.set(typed, { clipPath: `inset(0px ${px(typedW)} 0px 0px)` }, tSent);
  tl.set(caret, { opacity: 0 }, tSent);
  tl.set(ph, { opacity: 1 }, tSent);
  tl.fromTo(
    bubble,
    { autoAlpha: 0, y: 56 },
    { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", immediateRender: false },
    tSent,
  );
  tl.to(composer, { y: O.dockY, duration: 0.55, ease: "power3.inOut" }, tSent);
  /* …Pancake works: the row reads its steps one by one, then settles… */
  const tWork = tSent + O.work;
  tl.fromTo(
    worked,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false },
    tWork,
  );
  S2_CHAT.working.slice(1).forEach((line, i) => {
    tl.to(workedLabel, { txt: line, duration: 0.001, ease: "none" }, tWork + (i + 1) * O.step);
  });
  const tWorked = tWork + S2_CHAT.working.length * O.step;
  tl.to(workedLabel, { txt: S2_CHAT.worked, duration: 0.001, ease: "none" }, tWorked);
  tl.to(chevron, { opacity: 1, duration: 0.2, ease: "power1.out" }, tWorked);
  /* …and answers, word by word (a clip staircase over the real text) = the storyboard's f1 */
  const tAnswer = tWorked + O.answer;
  tl.fromTo(
    answer,
    { autoAlpha: 0, y: 8 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false },
    tAnswer,
  );
  t = tAnswer + 0.12;
  words.forEach((g) => {
    tl.set(answerText, { clipPath: clipTo(g, answerW) }, t);
    t += O.word;
  });
  tl.set(answerText, { clipPath: "none" }, t); // the text paints like any paragraph again
  const T = s2Times(t);
  tl.addLabel("f1", t);

  /* — f1 → f2 · the thread scrolls up, the composer leaves, the question card takes its place — */
  tl.to(chat, { y: S2_CHAT.scrollY, duration: 0.6, ease: "power3.inOut" }, T.scroll);
  tl.to(composer, { autoAlpha: 0, y: O.dockY + 10, duration: 0.24, ease: "power2.in" }, T.scroll);
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

  /* — f4 · the chat leaves, the draft takes shape (the ground stays the card's cream) — */
  tl.to(chat, { autoAlpha: 0, y: S2_CHAT.scrollY - 10, duration: 0.26, ease: "power2.in" }, T.chatOut);
  tl.to(hand, { autoAlpha: 0, y: S2_HAND.f3.y - 10, duration: 0.26, ease: "power2.in" }, T.chatOut);
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
  // the first Play's leads count up as its card lands (the figure is the markup's own)
  if (found) {
    for (let i = 1; i <= 6; i++) {
      tl.to(found, { txt: String(Math.round((foundTo * i) / 6)), duration: 0.001, ease: "none" }, T.play1 + 0.12 + (i - 1) * 0.07);
    }
  }
  tl.addLabel("f8", T.f8);
  tl.set({}, {}, T.end); // the Play card holds

  return { tl, cleanup: () => {}, cue: 0 };
}

/* ── step 03 · Pancake gets you the meeting (Figma storyboard intro + meetings-calendar-loop) ──
   f1 the selected leads (the poster), of which one stays lit → that lead, and
   a message Pancake drafts for her, typed (f2 = three glyphs into its last
   line) → sent (f3) → the thread scrolls, she answers (f4) → the meeting
   (f5) → the thread leaves but the meeting does not: its card shrinks into
   Thursday's slot of the week as the calendar comes in and becomes the
   week's first chip (founder 2026-10-13, "better animated": this was a cut,
   and the meeting was nowhere in the calendar) → today's calendar plays
   around it as the end (`cal`): the filled week holds = production's end
   picture (V2 art card 5022:6046, one chip renamed). ≈ 12.4 s with the
   default message: 9.2 s of intro, then the calendar's 4.26 s at
   S3_CAL_RATE. The opening picture holds 1.3 s before anything moves (same
   founder note as step 02: it left after 0.45 s, before the eye was on it). Typing times depend on the message's glyphs, so the later
   beats are offsets from the moment it is sent. One ground throughout, the
   card's cream (steps.css .lp-sx-bg). */
const S3_T = {
  /** the other rows step back: of the selection, this lead */
  pick: 1.3,
  leadsOut: 2.0,
  lead: 2.12,
  conn1: 2.42,
  message: 2.5,
  type: 2.9,
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
  /** after threadOut: the calendar comes in under the meeting card, which flies to its slot */
  calendarIn: 0.2,
  fly: 0.16,
  flyFor: 0.55,
  /** after threadOut: the calendar's own timeline starts once the meeting has landed */
  cal: 0.8,
} as const;
/** Pancake's typing pace (the old deep-dive message story's): 12 ms a glyph, a breath after a
    sentence end and after a comma */
const S3_TYPE = { glyph: 0.012, sentence: 0.06, comma: 0.035 } as const;
/** how fast the calendar plays inside the master (its own seconds are unchanged) */
const S3_CAL_RATE = 1.25;
/** the first lead's row sits this far below her card's place (table 82.86 + 44.89 + row 32,
    against the card's 84.86; steps.css) */
const S3_ROW_DY = 75;

function buildS3(root: HTMLElement): BuiltStep {
  const { $, $$ } = query(root);
  const T = S3_T;
  const leads = $(".lp-sx-leads");
  const rows = $$(".lp-sx-leads .lp-sx-row");
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
  const landed = $$(".lp-s3-chip")[S3_CHIPS.findIndex((c) => c.id === S3_LANDED)];
  if (conns.length !== 3) throw new Error("lp-step: s3 connectors out of sync");
  if (!landed) throw new Error("lp-step: s3 has no chip for the meeting");

  // the message's glyph edges, measured from the live text (weight 500, its typing face)
  const glyphs = measureGlyphs(msg);
  if (!glyphs.length) throw new Error("lp-step: s3 message has no glyphs");

  const tl = gsap.timeline({ paused: true });
  const rise = { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false };
  const grow = { scaleY: 1, duration: 0.22, ease: "power2.out", immediateRender: false };

  tl.addLabel("f1", 0);

  /* — f1 → f2 · of the selected leads, the first stays lit; then the table leaves and she
       comes back as a card, her message under it (same cream ground) — */
  tl.to(rows.slice(1), { opacity: 0.3, duration: 0.28, ease: "power1.out", stagger: 0.03 }, T.pick);
  tl.to(leads, { autoAlpha: 0, y: -8, duration: 0.26, ease: "power2.in" }, T.leadsOut);
  // her card comes up from where her row was (S3_ROW_DY): the row turns into the card
  tl.fromTo(
    leadCard,
    { autoAlpha: 0, y: S3_ROW_DY },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", immediateRender: false },
    T.lead,
  );
  tl.fromTo(conns[0], { scaleY: 0 }, grow, T.conn1);
  tl.fromTo(msgCard, { autoAlpha: 0, y: 12 }, rise, T.message);

  /* — the message types: a clip staircase over the real text, the caret on the glyph edges — */
  const lastTop = glyphs[glyphs.length - 1].top;
  const lastLineStart = glyphs.findIndex((g) => Math.abs(g.top - lastTop) < 1);
  const f2Glyph = Math.min(glyphs.length - 1, lastLineStart + 2); // three glyphs into the last line
  let t: number = T.type;
  let tF2: number = T.type;
  // the text block's own width, in the px the glyphs are measured in (measureGlyphs' scale)
  const msgW = msg.offsetWidth;
  tl.set(caret, { x: 0, y: glyphs[0].top, opacity: 1 }, T.type - 0.25);
  glyphs.forEach((g, i) => {
    tl.set(msg, { clipPath: clipTo(g, msgW) }, t);
    tl.set(caret, { x: +g.right.toFixed(3), y: +g.top.toFixed(3) }, t);
    if (i === f2Glyph) tF2 = t;
    const next = glyphs[i + 1]?.ch ?? "";
    t += S3_TYPE.glyph + (g.ch === "," ? S3_TYPE.comma : g.ch === "." && next === " " ? S3_TYPE.sentence : 0);
  });
  tl.addLabel("f2", tF2 + 0.001);
  const tE = t;
  tl.set(caret, { opacity: 0 }, tE + T.caretOff);
  tl.set(msg, { clipPath: "none" }, tE + T.caretOff); // the text paints like any paragraph again

  /* — f3 · sent: one label leaves, then the other comes (they share the same spot, so a
     crossfade drew the two words on top of each other) — */
  tl.to(ebDraft, { opacity: 0, y: -4, duration: 0.13, ease: "power2.in" }, tE + T.sentAfter);
  tl.fromTo(
    ebSent,
    { opacity: 0, y: 4 },
    { opacity: 1, y: 0, duration: 0.17, ease: "power2.out", immediateRender: false },
    tE + T.sentAfter + 0.13,
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

  /* — the thread leaves, the meeting stays: its card empties, shrinks into Thursday's slot of
       the week while the calendar comes in under it (on its own frame 0: the empty week, Mon 19
       in the circle), and the chip takes over on the frame it lands. Both boxes are measured
       at rest, in the stage's own px (the stage is scaled by --lp-fit; a chip rests at
       scale 0.3 about its centre, which a centre-based measure ignores). — */
  const tO = tS + T.threadOut;
  const origin = thread.getBoundingClientRect();
  const k = thread.offsetWidth ? origin.width / thread.offsetWidth : 1;
  const corner = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2 - origin.left) / k - el.offsetWidth / 2,
      y: (r.top + r.height / 2 - origin.top) / k - el.offsetHeight / 2,
    };
  };
  const meetAt = corner(meetCard);
  const chipAt = corner(landed);
  const chipBg = getComputedStyle(landed).backgroundColor;
  const tFly = tO + T.fly;
  const tLand = tFly + T.flyFor;

  // out fast, so the calendar's lines never show through the thread's (no dissolve of text on text)
  tl.to([leadCard, msgCard, replyCard, ...conns], { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, tO);
  tl.to(Array.from(meetCard.children), { opacity: 0, duration: 0.14, ease: "power1.in" }, tO);
  tl.fromTo(
    calendar,
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", immediateRender: false },
    tO + T.calendarIn,
  );
  // x / y are the card's own, on top of the thread's pose (the thread is at pose5 by now)
  tl.to(
    meetCard,
    {
      x: chipAt.x - meetAt.x - pose5.x,
      y: chipAt.y - meetAt.y - pose5.y,
      width: landed.offsetWidth,
      height: landed.offsetHeight,
      borderRadius: 4,
      backgroundColor: chipBg,
      duration: T.flyFor,
      ease: "power3.inOut",
    },
    tFly,
  );
  // the card's hairline and its soft shadow go as it turns into a chip (same string shape both ways)
  tl.fromTo(
    meetCard,
    { boxShadow: "0px 0px 0px 0.5px rgba(226,226,226,1), 0px 4px 32px 0px rgba(48,0,44,0.08)" },
    {
      boxShadow: "0px 0px 0px 0.5px rgba(226,226,226,0), 0px 4px 32px 0px rgba(48,0,44,0)",
      duration: T.flyFor * 0.7,
      ease: "power1.in",
      immediateRender: false,
    },
    tFly,
  );
  // landed: the chip is the same box, same colour; its bar and name come in, and it settles
  tl.to(thread, { autoAlpha: 0, duration: 0.001 }, tLand);
  tl.fromTo(landed, { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1, duration: 0.001, immediateRender: false }, tLand);
  tl.fromTo(
    [landed.querySelector(".lp-s3-bar"), landed.querySelector(".lp-s3-ctxt")],
    { opacity: 0 },
    { opacity: 1, duration: 0.22, ease: "power1.out", immediateRender: false },
    tLand,
  );
  tl.to(
    landed,
    {
      keyframes: [
        { scale: 1.07, duration: 0.12, ease: "power2.out" },
        { scale: 1, duration: 0.3, ease: "back.out(2.4)" },
      ],
      ease: "none",
    },
    tLand + 0.002,
  );

  /* — today's calendar: a child of the master (NOT paused — a paused child would not follow
       its parent's seeks), played at S3_CAL_RATE. The meeting's chip is already in the week,
       so the calendar does not pop it. — */
  const cal = buildCalendar(root, S3_LANDED);
  tl.add(cal, tO + T.cal);
  cal.timeScale(S3_CAL_RATE);
  tl.addLabel("cal", tO + T.cal);

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
function buildCalendar(root: HTMLElement, already?: string): gsap.core.Timeline {
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

  // chips: tiny -> full (elastic), fully invisible at frame 0 (`already`: the caller put it there)
  chips.forEach((c) => {
    if (c.id === already) return;
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

/* ── step 02 (since 2026-10-28) · Ask anything: Claude, and the envelopes it sends (≈ 2.9 s) ──
   Founder, on the storyboard's end picture (the Play card): "not sure we should show here the UI
   but maybe a juicy things showing claude + like plein de petites enveloppes qui partent de
   claude dans tous les sens dans le carré". Frame 0 = Claude's disc alone: every envelope sits
   under it, small, at its centre. From 0.3 s they leave in three waves, near ring to far ring
   (S4_MAIL's `at`, 0.05 s apart inside a wave), each straight out from Claude's centre to its
   place, growing as it goes, unwinding into its tilt, easing out; the last lands at 2.5 s and
   the burst holds. The markup is that END picture (LpStepAnim REST_IS_END), so the timeline
   writes frame 0 itself (inside the build's gsap.context, which reverts it) and tweens from it.
   Nothing moves by GSAP's own transform: each envelope's flight is four CSS variables that
   steps.css reads into translate / scale / rotate (the story kit's way, lp-story-kit.ts header:
   GSAP's x / y / scale write translate3d mid-tween, and Chromium re-rasterises the stage for
   the tween's length). Each envelope lets go of its variables once it has landed, so at rest it
   computes exactly what the server markup does (translate none, scale none, rotate = its tilt).
   Never a loop, a glow, a pulse, a ring or a trail. */
const S4_T = {
  /** the size an envelope leaves Claude at (all of them fit under the disc there) */
  from: 0.3,
  /** the burst holds this long after the last envelope lands */
  hold: 0.4,
} as const;
/** a let-go comes this long after the flight it ends (the story kit's SK_LANDED) */
const S4_LANDED = 0.01;
/** the envelopes' variables, all let go at once when it has landed */
const S4_VARS = ["--lp-s4-x", "--lp-s4-y", "--lp-s4-s", "--lp-s4-spin"] as const;

function buildS4(root: HTMLElement): BuiltStep {
  const { $$ } = query(root);
  const mails = $$(".lp-s4-mail");
  if (mails.length !== S4_MAIL.length) throw new Error("lp-step: s4 envelopes out of sync");

  /* lazy: false — each envelope's let-go starts from where its flight ended, and reads that
     value when it first renders. The build takes the timeline to its end in one render; a tween
     that first renders before GSAP's ticker has ticked defers its writes to the end of that
     render ("lazy"), so the let-go would read the frame-0 value instead and, played, jump back
     to Claude for the frame its 1 ms falls in. Not lazy, every tween writes as it starts. */
  const tl = gsap.timeline({ paused: true, defaults: { lazy: false } });
  let end = 0;
  mails.forEach((el, i) => {
    const m = S4_MAIL[i];
    /* — frame 0: at Claude's centre, small and turned, under its disc — */
    gsap.set(el, {
      "--lp-s4-x": S4_DISC.x - m.x,
      "--lp-s4-y": S4_DISC.y - m.y,
      "--lp-s4-s": S4_T.from,
      "--lp-s4-spin": m.spin,
    });
    /* — the flight: straight out to its place, easing out; it grows with a little give — */
    tl.to(el, { "--lp-s4-x": 0, "--lp-s4-y": 0, "--lp-s4-spin": 0, duration: m.dur, ease: "power3.out" }, m.at);
    tl.to(el, { "--lp-s4-s": 1, duration: m.dur, ease: "back.out(1.4)" }, m.at);
    /* — landed: it lets go of its variables (a 1 ms tween, not a set: lp-story-kit.ts skLetGo
       on how gsap.context reverts zero-length tweens in Gecko) — */
    const landed = m.at + m.dur + S4_LANDED;
    tl.to(
      el,
      { "--lp-s4-x": 0, "--lp-s4-y": 0, "--lp-s4-s": 1, "--lp-s4-spin": 0, clearProps: S4_VARS.join(","), duration: 0.001, ease: "none" },
      landed,
    );
    end = Math.max(end, landed + 0.001);
  });
  tl.set({}, {}, end + S4_T.hold); // the burst holds

  return { tl, cleanup: () => {}, cue: 0 };
}

const BUILDERS: Record<StepVariant, (root: HTMLElement) => BuiltStep> = {
  s0: buildS0,
  s1: buildS1,
  s2: buildS2,
  s3: buildS3,
  s4: buildS4,
};

export function buildStepTimeline(variant: StepVariant, root: HTMLElement): BuiltStep {
  return BUILDERS[variant](root);
}
