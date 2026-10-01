"use client";

import { gsap } from "@/lib/gsap";

/**
 * The four "How Pancake finds customers" build-ups as GSAP timelines — f1,
 * f2 and f4 are the choreography of pancake-studio shorts/feat-{signals,
 * warm-message,learns}-anim (the compositions the mp4s were rendered from),
 * ported tween for tween onto the same markup and CSS (LpFeatMocks.tsx /
 * features.css); f5 (Plays, 2026-09-30) has no composition and was
 * storyboarded here from the app's Play UI.
 * Each timeline is built paused on its stage root a viewport ahead of the
 * card, once laid out (f2 measures its glyphs); lp-play-once.ts owns
 * playback (as the card arrives → play once → hold the last frame = the
 * designer's picture). The markup rests on that picture (2026-09-30: never a
 * blank card), so each builder first sets its frame 0 — gsap.set, undone by
 * the context's revert. Every builder is seek-safe: sets and tweens only, no
 * callbacks, no randomness.
 *
 * Deviation from the compositions, founder-requested 2026-09-03:
 * - f2: no Send button — the card is the message and its status (DRAFT
 *   READY in yellow, flipping to MESSAGE SENT in green); the card hugs the
 *   five-line copy and the ring follows (F2_RING). Typing reveals the real
 *   text run with a clip staircase (no span layer, no handover snap).
 */

// variant ids are identities, not positions: f3 (the AI-answers card) was retired
// 2026-09-30 and the Plays card (f5) opens the section
export type FeatVariant = "f1" | "f2" | "f4" | "f5";
export type BuiltFeat = { tl: gsap.core.Timeline; cleanup: () => void };

type Timeline = gsap.core.Timeline;

function query(root: HTMLElement) {
  return {
    $: <T extends Element = HTMLElement>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`lp-feat: missing ${sel}`);
      return el;
    },
    $$: <T extends Element = HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel)),
  };
}

/* ── f1 · Tell Pancake what to watch (feat-signals-anim, Figma-parity cut) ──
   card rises → four toggles flip act by act (count ticks 1→4) → Roles springs
   open, three checks pop (0→3) → the clay sticker settles → hold. */
function buildF1(root: HTMLElement): BuiltFeat {
  const { $, $$ } = query(root);
  const TILT = -13.36;
  const signals = $(".lp-f1-signals");
  const sighead = $(".lp-f1-sighead");
  const rows = $$(".lp-f1-signals .lp-f1-row");
  const actRows = [rows[0], rows[1], rows[3], rows[5]]; // Keyword / Competitor / Hiring / Technologies
  const sticker = $(".lp-f1-sticker");
  const roles = $(".lp-f1-roles");
  const roleRows = $$(".lp-f1-roles .lp-f1-role");
  const checkWraps = roleRows.slice(0, 3).map((r) => r.querySelector<HTMLElement>(".lp-f1-checkwrap")!);
  // counting headers: digit layers in display order (0,1,2,… then the in-flow rest digit)
  const digitSeq = (p: HTMLElement) => [
    ...Array.from(p.querySelectorAll<HTMLElement>(".lp-f1-cnt-alt")),
    p.querySelector<HTMLElement>(".lp-f1-cnt-cur")!,
  ];
  const sigDigits = digitSeq($(".lp-f1-sigcount")); // 0 1 2 3 4
  const roleDigits = digitSeq($(".lp-f1-rolecount")); // 0 1 2 3

  /* frame 0 — the markup rests on the picture: toggles off, knobs left, no
     highlight, the empty outlines under the checks, no sticker */
  gsap.set(actRows.map((r) => r.querySelector(".lp-f1-toggle")), { backgroundColor: "#ddcfcd" }); // ink-50
  gsap.set(actRows.map((r) => r.querySelector(".lp-f1-knob")), { x: 0 });
  gsap.set(rows[3], { backgroundColor: "rgba(44,0,42,0)" });
  gsap.set(checkWraps.map((w) => w.querySelector(".lp-f1-checkbox-off")), { opacity: 1 });
  gsap.set(sticker, { opacity: 0, rotation: 0 });

  const tl = gsap.timeline({ paused: true });

  /* — initial states — */
  tl.set(sigDigits[0], { opacity: 1 }, 0);
  tl.set(sigDigits[sigDigits.length - 1], { opacity: 0 }, 0);
  tl.set(roleDigits[0], { opacity: 1 }, 0);
  tl.set(roleDigits[roleDigits.length - 1], { opacity: 0 }, 0);

  // counter tick: the old digit rolls up and out, the new one lands from below
  const tick = (seq: HTMLElement[], k: number, t: number) => {
    tl.to(seq[k - 1], { y: -6, opacity: 0, duration: 0.18, ease: "power2.in" }, t);
    tl.fromTo(
      seq[k],
      { y: 6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
      t + 0.06,
    );
  };
  // toggle flip with a squash: track goes green, knob slides 12.8 (left 1.6 → 14.4), the whole toggle pops
  const flip = (row: HTMLElement, t: number) => {
    const tg = row.querySelector<HTMLElement>(".lp-f1-toggle")!;
    const knob = row.querySelector<HTMLElement>(".lp-f1-knob")!;
    tl.to(tg, { backgroundColor: "#037d48", duration: 0.22, ease: "power2.inOut" }, t);
    tl.to(knob, { x: 12.8, duration: 0.22, ease: "power2.inOut" }, t);
    tl.to(
      knob,
      {
        keyframes: [
          { scaleX: 1.28, scaleY: 0.8, duration: 0.1, ease: "power2.out" },
          { scaleX: 1, scaleY: 1, duration: 0.26, ease: "back.out(2)" },
        ],
      },
      t,
    );
    tl.to(
      tg,
      {
        keyframes: [
          { scale: 1.1, duration: 0.12, ease: "power2.out" },
          { scale: 1, duration: 0.3, ease: "back.out(1.6)" },
        ],
      },
      t + 0.06,
    );
  };

  /* Pace (2026-09-30, founder: "tout plus dynamique"): the same acts, 0.65 s
     apart (was 1.15) — Roles opens at 3.6 s (was 5.95), the sticker lands at
     5.4 s (was 8.15). */

  /* — 0.05 – 0.95 s · the Signals card rises in, rows stagger, toggles off, "0 active" — */
  tl.fromTo(signals, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, 0.05);
  tl.fromTo(sighead, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 0.15);
  tl.fromTo(rows, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.06 }, 0.2);

  /* — acts, 0.65 s apart: each toggle flips and the count ticks — */
  const ACTS = [1.0, 1.65, 2.3, 2.95];
  ACTS.forEach((t0, k) => {
    flip(actRows[k], t0);
    tick(sigDigits, k + 1, t0 + 0.14);
  });
  // Figma's final/rest state keeps Companies hiring highlighted
  tl.to(rows[3], { backgroundColor: "rgba(44,0,42,0.05)", duration: 0.22, ease: "power1.out" }, ACTS[2]);

  /* — 3.6 s · the Roles panel springs open from its signals-card side, "0 selected", rows settle — */
  const R = 3.6;
  tl.fromTo(
    roles,
    { x: -40, scale: 0.72, transformOrigin: "0% 48%" },
    { x: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
    R,
  );
  tl.fromTo(roles, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, R);
  tl.fromTo(
    roleRows,
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.06 },
    R + 0.12,
  );

  /* — 4.2 / 4.5 / 4.8 s · Sales → Marketing → Customer success pop in, the header counting 1 → 2 → 3 — */
  const CHECKS = [4.2, 4.5, 4.8];
  CHECKS.forEach((t, i) => {
    const img = checkWraps[i].querySelector<HTMLElement>(".lp-f1-checkimg")!;
    const off = checkWraps[i].querySelector<HTMLElement>(".lp-f1-checkbox-off")!;
    tl.fromTo(img, { scale: 0.3 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
    tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power1.out" }, t);
    tl.set(off, { opacity: 0 }, t + 0.3); // the landed check covers it — artboard has no outline under a check
    tick(roleDigits, i + 1, t + 0.15);
  });

  /* — 5.4 s · the clay sticker settles at its rest spot; everything holds — */
  tl.fromTo(
    sticker,
    { scale: 0.75, rotation: TILT - 8, x: -6, y: -8 },
    { scale: 1, rotation: TILT, x: 0, y: 0, duration: 0.45, ease: "back.out(1.6)", immediateRender: false },
    5.4,
  );
  tl.fromTo(sticker, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power1.out", immediateRender: false }, 5.4);

  return { tl, cleanup: () => {} };
}

/* ── f2 · Every first message starts warm (feat-warm-message-anim) ──
   the post rises → its copy types → skeleton shimmers → action row + counts
   → the draft card slides up and the ring draws around it
   → the message types → DRAFT READY (yellow) lands → flips to MESSAGE SENT
   (green) → hold. Founder 2026-09-03: no Send button — the card is the
   message and its status; the status changing by itself is the point. */

/** Typing on the REAL text run: the paragraph is revealed glyph by glyph with
    a clip-path staircase (full lines above, the current line up to the glyph
    just typed) and a caret that rides the glyph edges. No per-character span
    layer: WebKit does not shape across inline boundaries, so a span layer ran
    up to 2.4px/line wider than the run it handed over to and the text visibly
    tightened at the swap (founder 2026-09-03: "le texte rétrécit d'un coup").
    Glyph geometry is measured once at build (Range rects, in the element's own
    unscaled px) — hence LpFeatAnim builds when the card first touches the
    viewport, i.e. laid out. */
type Glyph = { right: number; top: number; bottom: number };
function measureGlyphs(el: HTMLElement): Glyph[] {
  const box = el.getBoundingClientRect();
  const s = el.offsetWidth ? box.width / el.offsetWidth : 1; // --lp-fit and any ancestor scale
  const glyphs: Glyph[] = [];
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
      if (r.width === 0 && glyphs.length) {
        glyphs.push(glyphs[glyphs.length - 1]); // a collapsed space: nothing new shows
        continue;
      }
      glyphs.push({
        right: (r.right - box.left) / s,
        top: (r.top - box.top) / s,
        bottom: (r.bottom - box.top) / s,
      });
    }
  }
  return glyphs;
}
const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
const clipTo = (g: Glyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;

function buildF2(root: HTMLElement): BuiltFeat {
  const { $, $$ } = query(root);
  const SKEL_LEFT = [0, 16.2, 87.3, 103.5, 157.5, 173.7]; // bar x inside the skeleton row
  const SKEL_W = 310.5; // row width: 173.7 + 136.8
  const SHEEN_W = 90;
  const created: Node[] = [];

  const body = $(".lp-f2-body");
  const msg = $(".lp-f2-msg");
  // carets: one per typed run, in the run's positioned PARENT (the run itself
  // is clipped to the typed glyphs — a child caret would be clipped with it),
  // offset by the run's layout position inside that parent
  type Caret = { el: HTMLElement; ox: number; oy: number };
  const mkCaret = (p: HTMLElement): Caret => {
    const c = document.createElement("i");
    c.className = "lp-f2-caret";
    c.style.color = getComputedStyle(p).color;
    (p.offsetParent ?? p.parentElement!).appendChild(c);
    created.push(c);
    return { el: c, ox: p.offsetLeft, oy: p.offsetTop };
  };
  const bodyCaret = mkCaret(body);
  const msgCaret = mkCaret(msg);
  const bodyGlyphs = measureGlyphs(body);
  const msgGlyphs = measureGlyphs(msg);

  /* counters: the final number is the in-flow text (server-rendered), the
     earlier states are stacked over it and it waits for its tick */
  const mkCounter = (el: HTMLElement, max: number) => {
    const ns: HTMLElement[] = [];
    let fin = el.querySelector<HTMLElement>(".lp-f2-n--final");
    if (!fin) {
      fin = document.createElement("span");
      fin.className = "lp-f2-n lp-f2-n--final";
      fin.textContent = String(max);
      el.appendChild(fin);
      created.push(fin);
    }
    gsap.set(fin, { opacity: 0 });
    for (let k = 0; k < max; k++) {
      const n = document.createElement("span");
      n.className = "lp-f2-n" + (k === 0 ? " lp-f2-n--zero" : "");
      n.textContent = String(k);
      el.appendChild(n);
      created.push(n);
      ns.push(n);
    }
    ns.push(fin);
    return ns;
  };
  const counts = $$(".lp-f2-count");
  const likeN = mkCounter(counts[0], 33);
  const otherN = [1, 2, 3].map((i) => mkCounter(counts[i], 5));

  /* ring draw masks: dash lengths from the actual squircle geometry (font-independent) */
  const drawPaths = $$<SVGPathElement>(".lpf2-drawp");
  drawPaths.forEach((p) => {
    const L = p.getTotalLength() + 2;
    p.style.strokeDasharray = String(L);
    p.style.strokeDashoffset = String(L);
  });

  const tl = gsap.timeline({ paused: true });

  /* frame 0: both runs fully clipped, carets off, eyebrow layers off */
  gsap.set([body, msg], { clipPath: HIDDEN_CLIP });
  gsap.set([bodyCaret.el, msgCaret.el], { opacity: 0 });
  const eyebrowDraft = $(".lp-f2-eyebrow-draft");
  const eyebrowSent = $(".lp-f2-eyebrow-sent");
  gsap.set([eyebrowDraft, eyebrowSent], { opacity: 0 });

  // types a run from t: the caret sits at the line start, then rides each glyph's right edge
  const typeIn = (
    t: number,
    el: HTMLElement,
    caret: Caret,
    glyphs: Glyph[],
    base: number,
    pause: (c: string, n: string) => number,
  ) => {
    const text = el.textContent || "";
    const chars = Array.from(text);
    const first = glyphs[0];
    tl.set(
      caret.el,
      { x: caret.ox, y: caret.oy + first.top, height: first.bottom - first.top, opacity: 1 },
      t - 0.25,
    );
    glyphs.forEach((g, i) => {
      tl.set(el, { clipPath: clipTo(g) }, t);
      tl.set(caret.el, { x: caret.ox + g.right + 1, y: caret.oy + g.top, height: g.bottom - g.top }, t);
      t += base + pause(chars[i] ?? "", chars[i + 1] ?? "");
    });
    return t; // the moment after the last glyph; the caret still sits on it
  };
  const typeDone = (el: HTMLElement, caret: Caret, t: number) => {
    tl.set(caret.el, { opacity: 0 }, t + 0.4);
    tl.set(el, { clipPath: "none" }, t + 0.45); // the run paints exactly like the static site
  };
  // ticking counter: tick times on a quad-out curve (fast first, settling into the final number)
  const tick = (ns: HTMLElement[], from: number, to: number, t0: number, dur: number) => {
    for (let k = from + 1; k <= to; k++) {
      const tk = t0 + dur * (1 - Math.sqrt(1 - (k - from) / (to - from)));
      tl.set(ns[k - 1], { opacity: 0 }, tk);
      tl.set(ns[k], { opacity: 1 }, tk);
    }
  };

  const post = $(".lp-f2-post");
  const avatar = $(".lp-f2-avatar");
  const name = $(".lp-f2-name");
  const headline = $(".lp-f2-headline");
  const time = $(".lp-f2-time");
  const globe = $("#lpf2-pi-globe");
  const bars = $$(".lp-f2-skelgrp i");
  const draftgrp = $(".lp-f2-draftgrp");
  const rowEls: Element[] = [];
  ["#lpf2-pi-like", "#lpf2-pi-comment", "#lpf2-pi-repost", "#lpf2-pi-send"].forEach((s, i) =>
    rowEls.push($(s), counts[i]),
  );
  /* frame 0 — the markup rests on the sent picture: the post's parts, its
     action row and the draft card wait for their entrances */
  gsap.set([avatar, name, headline, time, globe, ...bars, ...rowEls, draftgrp], { opacity: 0 });

  /* Pace (2026-09-30, founder: "tout plus dynamique"): the same beats in the
     same order, overlapped and brisker — the post types at 20 ms a character
     (was 36) while its skeleton and action row land, the draft card rises at
     2.25 s (was 4.95), the message types at 12 ms a character (was 17), and
     MESSAGE SENT holds from ~6 s (was ~10.6). */

  /* — Phase 1 · the post rises: card, avatar, name / headline / time (0 – 0.8 s) — */
  tl.fromTo(post, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, 0);
  tl.fromTo(
    avatar,
    { scale: 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.6)", immediateRender: false },
    0.15,
  );
  tl.fromTo(
    [name, headline, time],
    { y: 10, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.06, immediateRender: false },
    0.22,
  );
  tl.fromTo(
    globe,
    { y: 10, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", immediateRender: false },
    0.35,
  );

  /* — Phase 2 · the post text types in with a caret (0.45 – ~1.4 s) — */
  const tBody = typeIn(0.45, body, bodyCaret, bodyGlyphs, 0.02, (c) => (c === "." ? 0.05 : 0));
  typeDone(body, bodyCaret, tBody);

  /* — Phase 3 · the skeleton lines grow in and shimmer once (1.0 – 2.05 s) — */
  tl.fromTo(
    bars,
    { scaleX: 0.6, autoAlpha: 0, transformOrigin: "0 50%" },
    { scaleX: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out", stagger: 0.05, immediateRender: false },
    1.0,
  );
  $$(".lp-f2-skelgrp i b").forEach((b, i) =>
    tl.fromTo(
      b,
      { x: -SHEEN_W - SKEL_LEFT[i] },
      { x: SKEL_W - SKEL_LEFT[i], duration: 0.6, ease: "power1.inOut" },
      1.45,
    ),
  );

  /* — Phase 4 · the action row lands and the counts tick up (1.5 – 2.45 s) — */
  tl.fromTo(
    rowEls,
    { y: 8, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out", stagger: 0.05, immediateRender: false },
    1.5,
  );
  tick(likeN, 0, 33, 1.75, 0.7);
  otherN.forEach((ns, i) => tick(ns, 0, 5, 1.85 + i * 0.08, 0.4));

  /* (Phase 5 — Pancake liking the post, reaction bubbles popping — removed 2026-09-29:
     the site never shows the product acting on the platform, founder "vitrine plus compliant") */

  /* — Phase 6 · the draft card slides up empty and the rainbow ring draws around it, four strokes chasing (2.25 – 3.85 s) — */
  tl.fromTo(
    draftgrp,
    { y: 44, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", immediateRender: false },
    2.25,
  );
  drawPaths.forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 2.45 + i * 0.1));

  /* — Phase 7 · the message types (2.9 – ~4.75 s) — */
  const tMsg = typeIn(2.9, msg, msgCaret, msgGlyphs, 0.012, (c, n) =>
    c === "." && n === " " ? 0.06 : c === "," ? 0.035 : 0,
  );
  typeDone(msg, msgCaret, tMsg);

  /* — Phase 8 · the status speaks for itself: DRAFT READY (yellow) lands once the draft is written,
     then flips to MESSAGE SENT (green) — the sent picture holds — */
  const T_READY = tMsg + 0.4;
  tl.fromTo(
    eyebrowDraft,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    T_READY,
  );
  const T_SENT = T_READY + 0.85;
  tl.to(eyebrowDraft, { y: -6, opacity: 0, duration: 0.18, ease: "power2.in" }, T_SENT);
  tl.fromTo(
    eyebrowSent,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    T_SENT + 0.06,
  );
  tl.to({}, { duration: 0.001 }, T_SENT + 1.0); // hold the sent picture

  return { tl, cleanup: () => created.forEach((n) => n.parentNode?.removeChild(n)) };
}

/* ── f4 · Pancake learns from what wins (feat-learns-anim) ──
   chart card rises → 12 bars grow from the baseline, the count ticks 0 → 56,
   the arrow pops → "What worked" slides in, chips pop → "Brain updated"
   slides up while the rainbow ring draws around it, subtitle fades in. */
let txtPluginRegistered = false;
function registerTxtPlugin() {
  if (txtPluginRegistered) return;
  txtPluginRegistered = true;
  // seek-safe text swap: a zero-duration tween renders ratio 1 at/after its position, 0 before it — no callbacks
  gsap.registerPlugin({
    name: "txt",
    init(this: { t: Element; end: string; start: string | null }, target: Element, value: unknown) {
      this.t = target;
      this.end = String(value);
      this.start = target.textContent;
    },
    render(ratio: number, data: { t: Element; end: string; start: string | null }) {
      data.t.textContent = ratio >= 1 ? data.end : data.start;
    },
  });
}

function buildF4(root: HTMLElement): BuiltFeat {
  registerTxtPlugin();
  const { $, $$ } = query(root);
  const graph = $(".lp-f4-graph");
  const pct = $(".lp-f4-pct");
  const arrow = $(".lp-f4-arrow");
  const bars = $$(".lp-f4-bar");
  const weeks = $$(".lp-f4-weeks span");
  const worked = $(".lp-f4-worked");
  const chips = $$(".lp-f4-chip");
  const brain = $(".lp-f4-brain");
  const sub = $(".lp-f4-brainsub");
  const dps = [1, 2, 3, 4].map((i) => $<SVGPathElement>(`#lpf4-dp${i}`)); // p1 purple, p2 orange, p3 blue, p4 pink

  // draw guides: dash = pill length (+4 so the closing seam overlaps, no hairline gap), fully offset = nothing drawn
  const lens = dps.map((p) => {
    const L = p.getTotalLength() + 4;
    p.style.strokeDasharray = String(L);
    p.style.strokeDashoffset = String(L);
    return L;
  });

  const tl = gsap.timeline({ paused: true });

  /* Pace (2026-09-30, founder: "tout plus dynamique"): the same beats, no
     empty lead-in (the chart rose at 0.4 s) and closer together — "Brain
     updated" lands at 3.2 s (was 4.95), the picture at ~5.2 s (was 7.45). */
  const T = {
    graph: 0.05, // chart card rises
    bars: 0.55,
    barStep: 0.06, // 12 bars from the baseline, 60 ms apart
    count: 1.2, // 0 → 56% over the bars' growth
    arrow: 1.85, // the green arrow pops once the count lands
    worked: 2.2,
    chips: 2.55, // "What worked" slides in, chips pop one after another
    brain: 3.2,
    ring: 3.4,
    sub: 4.0, // "Brain updated" slides up, the ring draws around it, subtitle fades in
  };

  /* frame 0: empty cream — every card and its parts start hidden */
  tl.set(pct, { txt: "+0%" }, 0);

  /* — chart card rises in — */
  tl.fromTo(graph, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }, T.graph);

  /* — the 12 bars grow from the baseline in sequence — */
  tl.fromTo(
    bars,
    { scaleY: 0, transformOrigin: "50% 100%" },
    { scaleY: 1, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(1.5)", stagger: T.barStep },
    T.bars,
  );

  /* — week labels fade in under their three bars — */
  weeks.forEach((w, k) => {
    tl.fromTo(
      w,
      { autoAlpha: 0, y: 5 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
      T.bars + (3 * k + 2) * T.barStep + 0.22,
    );
  });

  /* — the percentage ticks 0 → 56 as the bars grow (mild ease-out: brisk ticks, soft landing) — */
  for (let k = 1; k <= 56; k++) {
    const p = 1 - Math.pow(1 - k / 56, 1 / 1.6);
    tl.set(pct, { txt: "+" + k + "%" }, T.bars + T.count * p);
  }

  /* — the arrow pops — */
  tl.fromTo(arrow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ease: "power2.out" }, T.arrow);
  tl.fromTo(
    arrow,
    { scale: 0.4, transformOrigin: "50% 50%" },
    { scale: 1, transformOrigin: "50% 50%", duration: 0.8, ease: "elastic.out(1, 0.5)" },
    T.arrow,
  );

  /* — "What worked" slides in, its chips pop in one after another — */
  tl.fromTo(worked, { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, T.worked);
  tl.fromTo(
    chips,
    { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" },
    { scale: 1, autoAlpha: 1, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.7)", stagger: 0.1 },
    T.chips,
  );

  /* — "Brain updated" slides up while the rainbow ring draws around it, then the subtitle fades in — */
  tl.fromTo(brain, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, T.brain);
  dps.forEach((p, i) => {
    tl.fromTo(
      p,
      { strokeDashoffset: lens[i] },
      { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", immediateRender: false },
      T.ring + 0.1 * i,
    );
  });
  tl.fromTo(sub, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, T.sub);

  return { tl, cleanup: () => {} };
}

/* ── f5 · Ask for the people you want (Plays, 2026-09-30; replaces f3's AI-answers cut) ──
   the Agent's composer rises → the request types in the bar → send: it becomes
   the plum bubble → the Play card rises in DRAFT, its three rows resolve (Not
   decided yet → value, 1·2·3 → ticks) → Create and run search is pressed →
   DRAFT flips to ACTIVE, Discover · Enrich · Qualify complete → the leads card
   rises, "25 new leads" ticks up, three leads land, each why line wipes in,
   NEW pops → rest = the end picture (= the CSS rest markup = the static and
   reduced-motion still). No studio composition: built here from the app's Play
   UI. Frame 0 is set with gsap.set (the LpFeatAnim context reverts it). */
function buildF5(root: HTMLElement): BuiltFeat {
  registerTxtPlugin();
  const { $, $$ } = query(root);
  const created: Node[] = [];

  // the composer's typed run (f3's recipe): one span per character, display
  // toggled, each carrying the caret that follows it; a zero-width holder in
  // front blinks before the first character
  const REQUEST = "Find US SaaS founders with a launch coming up.";
  const ctyped = $(".lp-f5-ctyped");
  const mkCaret = () => {
    const i = document.createElement("i");
    i.className = "lp-f5-crt";
    return i;
  };
  const c0 = document.createElement("span");
  c0.className = "lp-f5-ch lp-f5-ch0";
  c0.textContent = "​";
  const caret0 = mkCaret();
  c0.appendChild(caret0);
  ctyped.appendChild(c0);
  created.push(c0);
  const chars: HTMLElement[] = [];
  const carets: HTMLElement[] = [];
  for (const ch of REQUEST) {
    const s = document.createElement("span");
    s.className = "lp-f5-ch";
    s.textContent = ch;
    const c = mkCaret();
    s.appendChild(c);
    ctyped.appendChild(s);
    created.push(s);
    chars.push(s);
    carets.push(c);
  }

  const composer = $(".lp-f5-composer");
  const spark = $(".lp-f5-spark");
  const ph = $(".lp-f5-ph");
  const send = $(".lp-f5-send");
  const bubble = $(".lp-f5-bubble");
  const play = $(".lp-f5-play");
  const draft = $(".lp-f5-badge--draft");
  const active = $(".lp-f5-badge--active");
  const rows = $$(".lp-f5-row").map((r) => ({
    circ: r.querySelector<HTMLElement>(".lp-f5-circ")!,
    num: r.querySelector<HTMLElement>(".lp-f5-num")!,
    tick: r.querySelector<SVGSVGElement>(".lp-f5-tick")!,
    fin: r.querySelector<HTMLElement>(".lp-f5-val-final")!,
    wait: r.querySelector<HTMLElement>(".lp-f5-val-wait")!,
  }));
  const shims = $$(".lp-f5-shim");
  const create = $(".lp-f5-create");
  const chips = $$(".lp-f5-chip").map((c) => ({
    el: c,
    step: c.querySelector<SVGSVGElement>(".lp-f5-cstep")!,
    done: c.querySelector<SVGSVGElement>(".lp-f5-cdone")!,
  }));
  const chipEls = chips.map((c) => c.el);
  const links = $$(".lp-f5-link");
  const leads = $(".lp-f5-leads");
  const lcount = $(".lp-f5-lcount");
  const leadRows = $$(".lp-f5-lead");
  const whys = $$(".lp-f5-why");
  const news = $$(".lp-f5-badge--new");

  // GSAP can't tween var(): the tokens as literals (foundation.css)
  const PLUM = "#2c002a"; // ink-100
  const GREEN10 = "#ceead5";
  const CHIP_OFF = "inset 0 0 0 0.45px #ddcfcd"; // ink-50 hairline
  const CHIP_ON = "inset 0 0 0 0.45px #68cea7"; // green-20 hairline

  /* ===== frame 0: cream only ===== */
  gsap.set(composer, { autoAlpha: 0, y: 16 });
  gsap.set(spark, { scale: 0.5, transformOrigin: "50% 50%" });
  gsap.set(send, { backgroundColor: "#bba8ae", transformOrigin: "50% 50%" }); // ink-60 = empty bar
  gsap.set(bubble, { autoAlpha: 0, scale: 0.85, transformOrigin: "100% 50%" });
  gsap.set(play, { autoAlpha: 0, y: 28 });
  gsap.set(draft, { opacity: 1 });
  gsap.set(active, { opacity: 0 });
  rows.forEach(({ circ, num, tick, fin, wait }) => {
    gsap.set(circ, { backgroundColor: "rgba(44,0,42,0.05)" }); // ink-tr-5 = not decided
    gsap.set(num, { opacity: 1 });
    gsap.set(tick, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" });
    gsap.set(fin, { opacity: 0 });
    gsap.set(wait, { opacity: 1 });
  });
  gsap.set(shims, { backgroundPosition: "100% 0%" });
  gsap.set(create, { autoAlpha: 0, y: 6, transformOrigin: "50% 50%" });
  chips.forEach(({ el, step, done }) => {
    gsap.set(el, { autoAlpha: 0, y: 6, backgroundColor: "#ffffff", boxShadow: CHIP_OFF, color: "#9a818f" });
    gsap.set(step, { opacity: 1 });
    gsap.set(done, { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" });
  });
  gsap.set(links, { scaleX: 0, transformOrigin: "0 50%" });
  gsap.set(leads, { autoAlpha: 0, y: 32 });
  gsap.set(leadRows, { autoAlpha: 0, y: 10 });
  gsap.set(whys, { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set(news, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });

  const tl = gsap.timeline({ paused: true });
  tl.set(lcount, { txt: "0" }, 0);

  /* Pace (2026-09-30, founder: "tout plus dynamique" — a card scrolled past
     at reading speed must not be a bare composer bar): the Play card rises
     with the composer, in DRAFT with its rows "Not decided yet" shimmering,
     like the app's panel that "takes shape" beside the chat; the request types
     at 14 ms a character (was 32), no idle blinks, and the rows resolve once
     it is sent. The picture holds from ~6.2 s (was 9.8). */

  /* — 1 · the composer rises, Pancake's sparkle pops, the caret shows (0.05 – 0.25) — */
  tl.to(composer, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.05);
  tl.to(spark, { scale: 1, duration: 0.45, ease: "back.out(1.8)" }, 0.12);
  tl.set(caret0, { opacity: 1 }, 0.18);

  /* — 2 · the request types in the bar at 14 ms a character (0.25 – 0.88) — */
  const T0 = 0.25;
  const DT = 0.014;
  tl.set(ph, { opacity: 0 }, T0); // the placeholder leaves with the first character
  tl.to(send, { backgroundColor: PLUM, duration: 0.2, ease: "power2.out" }, T0);
  chars.forEach((s, i) => {
    const t = T0 + i * DT;
    tl.set(s, { display: "inline" }, t);
    tl.set(i ? carets[i - 1] : caret0, { opacity: 0 }, t);
    tl.set(carets[i], { opacity: 1 }, t);
  });
  const T_LAST = T0 + (chars.length - 1) * DT; // 0.88
  const caretLast = carets[carets.length - 1];

  /* — 3 · send (1.03 press, 1.13 send): the bar resets and leaves, then the request pops up as the plum
     bubble in its slot (hand-off, no cross-fade: the bubble starts once the bar is mostly gone) — */
  const PRESS = T_LAST + 0.15;
  tl.to(
    send,
    {
      keyframes: [
        { scale: 0.86, duration: 0.08, ease: "power2.out" },
        { scale: 1, duration: 0.3, ease: "back.out(2)" },
      ],
    },
    PRESS,
  );
  const SEND = PRESS + 0.1;
  tl.set(caretLast, { opacity: 0 }, SEND);
  tl.set(chars, { display: "none" }, SEND);
  tl.set(ph, { opacity: 1 }, SEND); // an emptied chat input shows its placeholder again
  tl.to(send, { backgroundColor: "#bba8ae", duration: 0.15, ease: "power1.out" }, SEND);
  tl.to(composer, { autoAlpha: 0, y: -6, duration: 0.18, ease: "power2.out" }, SEND);
  tl.to(bubble, { autoAlpha: 1, duration: 0.18, ease: "power2.out" }, SEND + 0.1);
  tl.to(bubble, { scale: 1, duration: 0.5, ease: "back.out(1.6)" }, SEND + 0.1);

  /* — 4 · the Play card rises in DRAFT with the composer (0.15); the placeholders shimmer while the
     request types; once sent, the rows resolve one by one (1.43 – 2.43) — */
  const PLAY = 0.15;
  tl.to(play, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" }, PLAY);
  shims.forEach((s, i) => {
    tl.to(s, { opacity: 1, duration: 0.2, ease: "power1.out" }, PLAY + 0.3 + i * 0.08);
    tl.to(s, { backgroundPosition: "0% 0%", duration: 0.7, ease: "power1.inOut" }, PLAY + 0.3 + i * 0.08);
  });
  const DECIDE = SEND + 0.3;
  [DECIDE, DECIDE + 0.35, DECIDE + 0.7].forEach((t, k) => {
    const { circ, num, tick, fin, wait } = rows[k];
    tl.to(wait, { y: -6, opacity: 0, duration: 0.14, ease: "power1.in" }, t);
    tl.fromTo(
      fin,
      { y: 6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
      t + 0.1,
    );
    tl.to(circ, { backgroundColor: GREEN10, duration: 0.22, ease: "power2.inOut" }, t);
    tl.to(num, { opacity: 0, duration: 0.12, ease: "power1.in" }, t);
    tl.to(tick, { opacity: 1, duration: 0.1, ease: "power1.out" }, t + 0.04);
    tl.to(tick, { scale: 1, duration: 0.3, ease: "back.out(2)" }, t + 0.04);
  });

  /* — 5 · Create and run search slides in, is pressed and leaves; DRAFT flips to ACTIVE (2.43 – 3.42) — */
  const CREATE = DECIDE + 1.0;
  tl.to(create, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, CREATE);
  tl.to(
    create,
    {
      keyframes: [
        { scale: 0.96, duration: 0.08, ease: "power2.out" },
        { scale: 1, duration: 0.28, ease: "back.out(2)" },
      ],
    },
    CREATE + 0.35,
  );
  const GO = CREATE + 0.55;
  tl.to(create, { autoAlpha: 0, duration: 0.14, ease: "power1.in" }, GO);
  tl.to(draft, { y: -6, opacity: 0, duration: 0.14, ease: "power1.in" }, GO);
  tl.fromTo(
    active,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    GO + 0.12,
  );

  /* — 6 · the steps run: the chips land once the button is gone, then Discover · Enrich · Qualify
     complete (3.1 – 4.23) — */
  tl.to(chipEls, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out", stagger: 0.06 }, GO + 0.12);
  [GO + 0.35, GO + 0.65, GO + 0.95].forEach((t, k) => {
    const { el, step, done } = chips[k];
    tl.to(el, { backgroundColor: GREEN10, boxShadow: CHIP_ON, color: PLUM, duration: 0.22, ease: "power2.inOut" }, t);
    tl.to(step, { opacity: 0, duration: 0.12, ease: "power1.in" }, t);
    tl.to(done, { opacity: 1, duration: 0.1, ease: "power1.out" }, t + 0.04);
    tl.to(done, { scale: 1, duration: 0.3, ease: "back.out(2)" }, t + 0.04);
    if (k < links.length) tl.to(links[k], { scaleX: 1, duration: 0.25, ease: "power2.out" }, t + 0.05);
  });

  /* — 7 · the leads: the card rises, the count ticks 0 → 25, three leads land, each why line
     wipes in, NEW pops (4.08 – 5.58) — */
  tl.to(leads, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, GO + 1.1);
  for (let k = 1; k <= 25; k++) {
    tl.set(lcount, { txt: String(k) }, GO + 1.2 + 0.9 * (1 - Math.sqrt(1 - k / 25))); // quad-out: brisk, then settling
  }
  [GO + 1.35, GO + 1.6, GO + 1.85].forEach((t, k) => {
    tl.to(leadRows[k], { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }, t);
    tl.to(whys[k], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out" }, t + 0.18);
    tl.to(news[k], { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, t + 0.3);
  });

  /* — 8 · rest = the static picture: drop identity transforms, clips and the chips' tweened
     paint (all equal to the CSS rest values) at ~5.6, hold ~0.55 s — */
  const REST = GO + 2.65;
  tl.set(
    [bubble, play, leads, active, ...leadRows, ...news, ...rows.map((r) => r.tick), ...rows.map((r) => r.fin)],
    { clearProps: "transform" },
    REST,
  );
  tl.set(chipEls, { clearProps: "transform,backgroundColor,boxShadow,color" }, REST);
  tl.set(chips.map((c) => c.done), { clearProps: "transform" }, REST);
  tl.set(links, { clearProps: "transform" }, REST);
  tl.set(whys, { clipPath: "none" }, REST);
  tl.to({}, { duration: 0.001 }, REST + 0.549); // hold the picture

  return { tl, cleanup: () => created.forEach((n) => n.parentNode?.removeChild(n)) };
}

const BUILDERS: Record<FeatVariant, (root: HTMLElement) => BuiltFeat> = {
  f1: buildF1,
  f2: buildF2,
  f4: buildF4,
  f5: buildF5,
};

export function buildFeatTimeline(variant: FeatVariant, root: HTMLElement): BuiltFeat {
  return BUILDERS[variant](root);
}
