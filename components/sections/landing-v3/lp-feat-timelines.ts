"use client";

import { gsap } from "@/lib/gsap";

/**
 * The four "How Pancake finds customers" build-ups as GSAP timelines — the
 * choreography of pancake-studio shorts/feat-{signals,warm-message,ai-search,
 * learns}-anim (the compositions the mp4s were rendered from), ported tween
 * for tween onto the same markup and CSS (LpFeatMocks.tsx / features.css).
 * Each timeline is built paused on its stage root when the card first
 * touches the viewport (laid out — f2 measures its glyphs); LpFeatAnim.tsx
 * owns playback (60 % in view → play once → hold the last frame = the
 * designer's picture). Every builder is seek-safe: sets and tweens only, no
 * callbacks, no randomness.
 *
 * Deviations from the compositions, both founder-requested 2026-09-03:
 * - f3: the question is typed in the composer bar and sent up into the
 *   blue bubble (was: typed inside the bubble; composer settled last).
 * - f2: no Send button — the card is the message and its status (DRAFT
 *   READY in yellow, flipping to MESSAGE SENT in green); the card hugs the
 *   five-line copy and the ring follows (F2_RING). Typing reveals the real
 *   text run with a clip staircase (no span layer, no handover snap).
 */

export type FeatVariant = "f1" | "f2" | "f3" | "f4";
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

  /* — 0.05 – 1.15 s · the Signals card rises in, rows stagger, toggles off, "0 active" — */
  tl.fromTo(signals, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.05);
  tl.fromTo(sighead, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.25);
  tl.fromTo(rows, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.075 }, 0.3);

  /* — acts, 1.15 s apart: each toggle flips and the count ticks — */
  const ACTS = [1.35, 2.5, 3.65, 4.8];
  ACTS.forEach((t0, k) => {
    flip(actRows[k], t0);
    tick(sigDigits, k + 1, t0 + 0.14);
  });
  // Figma's final/rest state keeps Companies hiring highlighted
  tl.to(rows[3], { backgroundColor: "rgba(44,0,42,0.05)", duration: 0.22, ease: "power1.out" }, ACTS[2]);

  /* — 5.95 s · the Roles panel springs open from its signals-card side, "0 selected", rows settle — */
  const R = 5.95;
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

  /* — 6.65 / 7.0 / 7.35 s · Sales → Marketing → Customer success pop in, the header counting 1 → 2 → 3 — */
  const CHECKS = [6.65, 7.0, 7.35];
  CHECKS.forEach((t, i) => {
    const img = checkWraps[i].querySelector<HTMLElement>(".lp-f1-checkimg")!;
    const off = checkWraps[i].querySelector<HTMLElement>(".lp-f1-checkbox-off")!;
    tl.fromTo(img, { scale: 0.3 }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
    tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power1.out" }, t);
    tl.set(off, { opacity: 0 }, t + 0.3); // the landed check covers it — artboard has no outline under a check
    tick(roleDigits, i + 1, t + 0.15);
  });

  /* — 8.15 s · the clay sticker settles at its rest spot; everything holds — */
  tl.fromTo(
    sticker,
    { scale: 0.75, rotation: TILT - 8, x: -6, y: -8 },
    { scale: 1, rotation: TILT, x: 0, y: 0, duration: 0.45, ease: "back.out(1.6)", immediateRender: false },
    8.15,
  );
  tl.fromTo(sticker, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power1.out", immediateRender: false }, 8.15);

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

  /* counters: the final number is the in-flow text, the earlier states are stacked over it */
  const mkCounter = (el: HTMLElement, max: number) => {
    const ns: HTMLElement[] = [];
    const fin = document.createElement("span");
    fin.className = "lp-f2-n lp-f2-n--final";
    fin.textContent = String(max);
    el.appendChild(fin);
    created.push(fin);
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

  /* — Phase 1 · the post rises: card, avatar, name / headline / time (0 – 1.0 s) — */
  tl.fromTo(post, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }, 0);
  tl.fromTo(
    avatar,
    { scale: 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(1.6)", immediateRender: false },
    0.28,
  );
  tl.fromTo(
    [name, headline, time],
    { y: 10, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", stagger: 0.09, immediateRender: false },
    0.38,
  );
  tl.fromTo(
    globe,
    { y: 10, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", immediateRender: false },
    0.56,
  );

  /* — Phase 2 · the post text types in with a caret (0.75 – 2.6 s) — */
  const tBody = typeIn(1.0, body, bodyCaret, bodyGlyphs, 0.036, (c) => (c === "." ? 0.07 : 0));
  typeDone(body, bodyCaret, tBody);

  /* — Phase 3 · the skeleton lines grow in and shimmer once (2.0 – 3.5 s) — */
  const bars = $$(".lp-f2-skelgrp i");
  tl.fromTo(
    bars,
    { scaleX: 0.6, autoAlpha: 0, transformOrigin: "0 50%" },
    { scaleX: 1, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.07, immediateRender: false },
    2.0,
  );
  $$(".lp-f2-skelgrp i b").forEach((b, i) =>
    tl.fromTo(
      b,
      { x: -SHEEN_W - SKEL_LEFT[i] },
      { x: SKEL_W - SKEL_LEFT[i], duration: 0.75, ease: "power1.inOut" },
      2.75,
    ),
  );

  /* — Phase 4 · the action row lands and the counts tick up (2.95 – 4.3 s) — */
  const rowEls: Element[] = [];
  ["#lpf2-pi-like", "#lpf2-pi-comment", "#lpf2-pi-repost", "#lpf2-pi-send"].forEach((s, i) =>
    rowEls.push($(s), counts[i]),
  );
  tl.fromTo(
    rowEls,
    { y: 8, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.07, immediateRender: false },
    2.95,
  );
  tick(likeN, 0, 33, 3.4, 0.9);
  otherN.forEach((ns, i) => tick(ns, 0, 5, 3.55 + i * 0.1, 0.45));

  /* (Phase 5 — Pancake liking the post, reaction bubbles popping — removed 2026-09-29:
     the site never shows the product acting on the platform, founder "vitrine plus compliant") */

  /* — Phase 6 · the draft card slides up empty and the rainbow ring draws around it, four strokes chasing (4.95 – 6.95 s) — */
  tl.fromTo(
    $(".lp-f2-draftgrp"),
    { y: 44, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out", immediateRender: false },
    4.95,
  );
  drawPaths.forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 5.3 + i * 0.12));

  /* — Phase 7 · the message types (6.3 – ~8.9 s) — */
  const tMsg = typeIn(6.3, msg, msgCaret, msgGlyphs, 0.017, (c, n) =>
    c === "." && n === " " ? 0.09 : c === "," ? 0.05 : 0,
  );
  typeDone(msg, msgCaret, tMsg);

  /* — Phase 8 · the status speaks for itself: DRAFT READY (yellow) lands once the draft is written,
     then flips to MESSAGE SENT (green) — the sent picture holds — */
  const T_READY = tMsg + 0.55;
  tl.fromTo(
    eyebrowDraft,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    T_READY,
  );
  const T_SENT = T_READY + 1.15;
  tl.to(eyebrowDraft, { y: -6, opacity: 0, duration: 0.18, ease: "power2.in" }, T_SENT);
  tl.fromTo(
    eyebrowSent,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    T_SENT + 0.06,
  );
  tl.to({}, { duration: 0.001 }, T_SENT + 1.3); // hold the sent picture

  return { tl, cleanup: () => created.forEach((n) => n.parentNode?.removeChild(n)) };
}

/* ── f3 · Show up where buyers search (feat-ai-search-anim, composer cut) ──
   the card rises with its composer → the caret blinks in the composer bar,
   the question is typed there (the bar grows line by line like a real chat
   input) → send: the bar clears and the question pops up into the blue
   bubble → the ChatGPT spiral, "Thought for 1s", the Claude asterisk, the
   answer streams (Studio Pelican lands with a peach flash), the Gemini star
   → rest = the designer's picture. Downstream timings are the composition's. */
function buildF3(root: HTMLElement): BuiltFeat {
  const { $, $$ } = query(root);
  const created: Node[] = [];

  // the composer's typed run: one span per character (display toggled, so
  // the bar wraps and grows exactly like a text field), each carrying the
  // caret that follows it; a zero-width holder in front blinks before typing
  const QUESTION = "best studio for a SaaS launch video in Stockholm";
  const ctyped = $(".lp-f3-ctyped");
  const mkCaret = () => {
    const i = document.createElement("i");
    i.className = "lp-f3-crt";
    return i;
  };
  const c0 = document.createElement("span");
  c0.className = "lp-f3-ch lp-f3-ch0";
  c0.textContent = "​";
  const caret0 = mkCaret();
  c0.appendChild(caret0);
  ctyped.appendChild(c0);
  created.push(c0);
  const chars: HTMLElement[] = [];
  const carets: HTMLElement[] = [];
  for (const c of QUESTION) {
    const s = document.createElement("span");
    s.className = "lp-f3-ch";
    s.textContent = c;
    const i = mkCaret();
    s.appendChild(i);
    ctyped.appendChild(s);
    created.push(s);
    chars.push(s);
    carets.push(i);
  }

  // the answer, one span per word; the site's string verbatim (typographic apostrophe, "\n\n" paragraph break)
  const P1 = "For B2B SaaS launch videos in Stockholm, I’d recommend";
  const P2 = "They turn complex products into clear stories, from strategy to final animation.";
  const answer = $(".lp-f3-answer--anim");
  const words: HTMLElement[] = [];
  const addWords = (text: string) =>
    text.split(" ").forEach((w, i) => {
      if (i) {
        const sp = document.createTextNode(" ");
        answer.appendChild(sp);
        created.push(sp);
      }
      const s = document.createElement("span");
      s.className = "lp-f3-w";
      s.textContent = w;
      answer.appendChild(s);
      created.push(s);
      words.push(s);
    });
  addWords(P1);
  const sp1 = document.createTextNode(" ");
  answer.appendChild(sp1);
  created.push(sp1);
  const pelican = document.createElement("span");
  pelican.className = "lp-f3-w";
  const mark = document.createElement("b");
  mark.className = "lp-f3-mark";
  mark.textContent = "Studio Pelican.";
  pelican.appendChild(mark);
  answer.appendChild(pelican);
  created.push(pelican);
  words.push(pelican);
  const br = document.createTextNode("\n\n");
  answer.appendChild(br);
  created.push(br);
  addWords(P2);
  const P2_START = P1.split(" ").length + 1; // para 1 words, then the highlighted mark, then para 2

  const card = $(".lp-f3-card");
  const bubble = $(".lp-f3-bubble");
  const gpt = $(".lp-f3-chatgpt");
  const gem = $(".lp-f3-gemini");
  const cla = $(".lp-f3-claude");
  const thought = $(".lp-f3-thought");
  const shim = $(".lp-f3-shim");
  const ask = $(".lp-f3-ask");
  const caretBaked = $<SVGPathElement>(".lpf3-caret0");
  const answerPlain = $(".lp-f3-answer--plain");
  const sparks = $$<SVGSVGElement>(".lp-f3-spk");

  const HAIRLINE = "inset 0 0 0 0.4px #ddcfcd";
  const SH_LIFT = "inset 0 0 0 0.4px rgba(221,207,205,1), 0 22px 44px rgba(44,0,42,0.10)";
  const SH_REST = "inset 0 0 0 0.4px rgba(221,207,205,1), 0 0px 0px rgba(44,0,42,0)";

  /* ===== initial (frame 0) state: cream only — the composer belongs to the card and rises with it ===== */
  gsap.set(card, { opacity: 0, y: 44, boxShadow: SH_LIFT });
  gsap.set(bubble, { opacity: 0, scale: 0.85, transformOrigin: "100% 50%" });
  gsap.set(answerPlain, { opacity: 0 }); // the site's plain answer takes over once the stream is done
  gsap.set(thought, { opacity: 0, y: 6 });
  gsap.set(shim, { opacity: 0, backgroundPosition: "100% 0%" });
  gsap.set(words, { opacity: 0, y: 3 });
  gsap.set(pelican, { transformOrigin: "50% 50%" });
  gsap.set(gpt, { opacity: 0, rotation: -140, scale: 0.5, x: -24, transformOrigin: "50% 50%" });
  gsap.set(cla, { opacity: 0, rotation: -270, scale: 0.35, transformOrigin: "50% 50%" });
  gsap.set(gem, { opacity: 0, rotation: -25, scale: 0, transformOrigin: "50% 50%" });
  gsap.set(sparks, { opacity: 0, scale: 0, transformOrigin: "50% 50%" });

  const tl = gsap.timeline({ paused: true });

  // caret blink: on .42 s / off .42 s, `cycles` times, ends "on" (explicit sets — seek-exact)
  const blink = (el: Element, t: number, cycles: number) => {
    for (let c = 0; c < cycles; c++) {
      tl.set(el, { opacity: 1 }, t + c * 0.84);
      tl.set(el, { opacity: 0 }, t + c * 0.84 + 0.42);
    }
    tl.set(el, { opacity: 1 }, t + cycles * 0.84);
  };

  /* — 1 · the card rises in (0 – .85), its lift shadow settles away — */
  tl.to(card, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0);
  tl.to(card, { y: 0, duration: 0.85, ease: "power3.out" }, 0);
  tl.to(card, { boxShadow: SH_REST, duration: 0.9, ease: "power2.out" }, 0.45);
  tl.set(card, { boxShadow: HAIRLINE }, 1.4);

  /* — 2 · the composer's caret takes over from the baked one and blinks once, then the question types in the bar (1.6 – 3.57) — */
  tl.set(caretBaked, { opacity: 0 }, 0.75);
  blink(caret0, 0.75, 1);
  const T0 = 1.6;
  const DT = 0.042;
  tl.set(ask, { opacity: 0 }, T0); // the placeholder leaves with the first character
  chars.forEach((s, i) => {
    const t = T0 + i * DT;
    tl.set(s, { display: "inline" }, t);
    tl.set(i ? carets[i - 1] : caret0, { opacity: 0 }, t);
    tl.set(carets[i], { opacity: 1 }, t);
  });
  const T_LAST = T0 + (chars.length - 1) * DT; // 3.574
  const caretLast = carets[chars.length - 1];
  // one idle blink on the last character, then send
  tl.set(caretLast, { opacity: 0 }, T_LAST + 0.46);
  tl.set(caretLast, { opacity: 1 }, T_LAST + 0.7);

  /* — 3 · send (4.35): the bar clears and settles back to one line, the question pops up into the blue bubble — */
  const SEND = 4.35;
  tl.set(caretLast, { opacity: 0 }, SEND);
  tl.set(chars, { display: "none" }, SEND);
  tl.set(caretBaked, { opacity: 1 }, SEND);
  tl.to(ask, { opacity: 1, duration: 0.2, ease: "power2.out" }, SEND + 0.05);
  tl.to(bubble, { opacity: 1, duration: 0.18, ease: "power2.out" }, SEND);
  tl.to(bubble, { scale: 1, duration: 0.5, ease: "back.out(1.6)" }, SEND);

  /* — 4 · the ChatGPT spiral rotates into place behind the card (4.45 – 5.45) — */
  tl.to(gpt, { opacity: 1, duration: 0.3, ease: "power2.out" }, 4.45);
  tl.to(gpt, { rotation: 0, scale: 1, x: 0, duration: 1.0, ease: "back.out(1.3)" }, 4.45);

  /* — 5 · "Thought for 1s" rises in with two shimmer sweeps, then a short pause (4.75 – 6.35) — */
  tl.to(thought, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 4.75);
  tl.to(shim, { opacity: 1, duration: 0.2, ease: "power1.out" }, 4.85);
  tl.fromTo(
    shim,
    { backgroundPosition: "100% 0%" },
    { backgroundPosition: "0% 0%", duration: 0.7, ease: "power1.inOut", repeat: 1, immediateRender: false },
    4.85,
  );
  tl.to(shim, { opacity: 0, duration: 0.25, ease: "power1.in" }, 6.1);

  /* — 6 · the Claude asterisk spins in (5.35 – 6.35) — */
  tl.to(cla, { opacity: 1, duration: 0.25, ease: "power2.out" }, 5.35);
  tl.to(cla, { rotation: 0, scale: 1, duration: 1.0, ease: "back.out(1.4)" }, 5.35);

  /* — 7 · the answer streams word by word at 40 ms; "Studio Pelican." lands with a peach flash (6.35 – 8.25) — */
  const A0 = 6.35;
  const DW = 0.04;
  const A2 = 7.15;
  words.forEach((w, i) => {
    const t = i < P2_START ? A0 + i * DW : A2 + (i - P2_START) * DW;
    tl.to(w, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, t);
  });
  const T_PELICAN = A0 + (P2_START - 1) * DW; // 6.75
  tl.fromTo(
    pelican,
    { scale: 1.35 },
    { scale: 1, duration: 0.55, ease: "back.out(2)", immediateRender: false },
    T_PELICAN,
  );
  tl.fromTo(
    mark,
    { backgroundColor: "#ffa45f", boxShadow: "0 0 0 6px rgba(255,164,95,0.45)" },
    {
      backgroundColor: "#ffbd7a",
      boxShadow: "0 0 0 0px rgba(255,164,95,0)",
      duration: 0.6,
      ease: "power2.out",
      immediateRender: false,
    },
    T_PELICAN,
  );
  tl.set(mark, { clearProps: "boxShadow,backgroundColor" }, T_PELICAN + 0.65);
  const T_ANSWER_DONE = A2 + (words.length - P2_START - 1) * DW + 0.25; // last word fully in
  tl.set(answer, { opacity: 0 }, T_ANSWER_DONE); // streamed spans → the plain <p>
  tl.set(answerPlain, { opacity: 1 }, T_ANSWER_DONE);

  /* — 8 · the Gemini star scales in with a sparkle (7.35 – 8.65) — */
  tl.to(gem, { opacity: 1, duration: 0.2, ease: "power1.out" }, 7.35);
  tl.to(gem, { scale: 1, duration: 1.3, ease: "elastic.out(1, 0.5)" }, 7.35);
  tl.to(gem, { rotation: 0, duration: 0.9, ease: "power3.out" }, 7.35);
  sparks.forEach((s, i) => {
    const t = 7.55 + i * 0.11;
    tl.to(s, { opacity: 1, duration: 0.12, ease: "power1.out" }, t);
    tl.to(s, { scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
    tl.to(s, { rotation: 90, duration: 0.65, ease: "power1.out" }, t);
    tl.to(s, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, t + 0.35);
  });

  /* — 9 · rest state = the designer's picture: drop every identity transform so the DOM paints exactly like the static site (9.02 – 10.5) — */
  tl.set([card, bubble, gpt, cla, gem, thought, pelican, ...words], { clearProps: "transform" }, 9.02);
  tl.to({}, { duration: 0.001 }, 10.499); // pad to the composition's 10.5 s

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

  const T = {
    graph: 0.4, // chart card rises
    bars: 1.05,
    barStep: 0.08, // 12 bars from the baseline, ≈ 80 ms apart
    count: 1.55, // 0 → 56% over the bars' growth
    arrow: 2.75, // the green arrow pops once the count lands
    worked: 3.4,
    chips: 3.85, // "What worked" slides in, chips pop one after another
    brain: 4.95,
    ring: 5.25,
    sub: 6.15, // "Brain updated" slides up, the ring draws around it, subtitle fades in
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
    { scale: 1, autoAlpha: 1, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.7)", stagger: 0.13 },
    T.chips,
  );

  /* — "Brain updated" slides up while the rainbow ring draws around it, then the subtitle fades in — */
  tl.fromTo(brain, { y: 36, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, T.brain);
  dps.forEach((p, i) => {
    tl.fromTo(
      p,
      { strokeDashoffset: lens[i] },
      { strokeDashoffset: 0, duration: 1.9, ease: "power2.inOut", immediateRender: false },
      T.ring + 0.1 * i,
    );
  });
  tl.fromTo(sub, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, T.sub);

  return { tl, cleanup: () => {} };
}

const BUILDERS: Record<FeatVariant, (root: HTMLElement) => BuiltFeat> = {
  f1: buildF1,
  f2: buildF2,
  f3: buildF3,
  f4: buildF4,
};

export function buildFeatTimeline(variant: FeatVariant, root: HTMLElement): BuiltFeat {
  return BUILDERS[variant](root);
}
