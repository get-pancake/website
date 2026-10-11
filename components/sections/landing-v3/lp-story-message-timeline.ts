"use client";

import { gsap } from "@/lib/gsap";

import { diveStageLayout, type BuiltStory } from "./lp-dive-stages";
import { measureGlyphs } from "./lp-feat-timelines";
import { SM_POSE } from "./lp-story-message-data";

/**
 * Deep-dive story "A personal message for every lead" — its build-up as ONE paused, seek-safe
 * GSAP timeline on the stage root (Figma V2 storyboard 4964:1469 / 1471 / 1729 / 1821 / 1899).
 * Owner: story-message package. Contract: lp-dive-stages.ts and code-map §6.2 — frame 0 via
 * gsap.set (the caller's gsap.context reverts it), sets and tweens only (no callbacks, no
 * randomness), progress(1) = the server markup (the accounts world, f5), `cue` = the first
 * composed scene. Reached only through DIVE_STAGES.message.load() (lazy chunk).
 *
 * The designer's storyboard (decision 2026-10-09 §6: it wins over the 2026-09-03 no-Send rule,
 * flagged in the PR): A the post rises and types (f1) → B it shrinks to the top, the draft
 * card rises in its rainbow ring and Pancake types the message, the card growing a line at a
 * time (f2, f3) → D the ring hands over to the plain card, a member corrects the last word by
 * hand, "Friday?" → red "Thursday?" (f4), presses Send, DRAFTING → MESSAGE SENT → E the camera
 * pulls back from the sending account's card to five more accounts, each with its own leads
 * (f5 = the end picture). QA labels f1…f5 sit at the five storyboard pictures.
 *
 * Production f2's machinery (lp-feat-timelines.ts buildF2): the typed runs are revealed with a
 * clip staircase over the real text + a caret riding the glyph edges (no per-character spans:
 * WebKit kerning), the counts tick on stacked digits, the ring's four bands draw through their
 * masks. `measureGlyphs` is imported (exported for the stories, decision §1); `query`,
 * HIDDEN_CLIP, clipTo, the caret and counter builders are copied from buildF2.
 * Glyphs are measured at build (Range rects), so the stage must be laid out (never
 * display:none; visibility:hidden is fine — the conversation rests hidden).
 */

/** every beat time, in timeline seconds (founder pace knob) */
export const SM_T = {
  postIn: 0,
  avatar: 0.15,
  meta: 0.22,
  globe: 0.35,
  cue: 0.75,
  bodyType: 0.8,
  skel: 1.35,
  sheen: 1.8,
  row: 1.85,
  likes: 2.1,
  others: 2.2,
  f1: 2.8,
  postToB: 2.85,
  draftIn: 3.1,
  ringDraw: 3.2,
  eyebrowIn: 3.4,
  msgType: 3.7,
  /** after the typing ends (caret off at +0.40, clip released at +0.45) */
  f3After: 0.46,
  ringOut: 0.5, // after the typing ends
  fixCaret: 0.7, // the member's caret appears after the last word
  backspace: 0.95,
  backspaceStep: 0.05,
  swapAfter: 0.05, // after the last backspace
  retypeAfter: 0.05,
  retypeStep: 0.07, // human pace, ~6× slower than Pancake's 12 ms
  caretOff: 0.22, // after the retyped word's last letter (f4 follows)
  sendAfter: 0.3, // the press, after the last letter
  sentAfter: 0.06, // DRAFTING leaves, MESSAGE SENT lands 0.06 later
  zoomAfter: 0.5, // after MESSAGE SENT lands
  zoom: 1.2,
} as const;

const PANCAKE_MS = 0.012; // per message glyph (+60 ms after ". ", +35 ms after ",")
const POST_MS = 0.02; // per post glyph (+50 ms after ".")
/** the message's line pitch (story-message.css .lp-sm-msg) */
const LINE = 29;
/** the draft group's geometry per number of message lines (Figma f2 = 2 lines, f3/f4 = 4):
    card h = 139.217 + 29·L, group y = 32.591·(4 − L), ring stretch = −29·(4 − L) */
const cardH = (lines: number) => 139.217 + LINE * lines;
const groupY = (lines: number) => 32.591 * (4 - lines);
const ringExtra = (lines: number) => -LINE * (4 - lines);
const FIRST_LINES = 2; // the card rises at two lines
const CAM_FROM = 1.6; // the camera's start: the main card nearly fills the stage

type Glyph = ReturnType<typeof measureGlyphs>[number];

// copied from lp-feat-timelines.ts (query, HIDDEN_CLIP, clipTo)
function query(root: HTMLElement) {
  return {
    $: <T extends Element = HTMLElement>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`lp-story-message: missing ${sel}`);
      return el;
    },
    $$: <T extends Element = HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel)),
  };
}
const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
const clipTo = (g: Glyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;

export function buildStoryMessage(root: HTMLElement): BuiltStory {
  const { $, $$ } = query(root);
  const P = SM_POSE[diveStageLayout(root)];
  const created: Node[] = [];
  const tl = gsap.timeline({ paused: true });

  const convo = $(".lp-sm-convo");
  const world = $(".lp-sm-world");
  const cam = $(".lp-sm-cam");
  const post = $(".lp-sm-post");
  const body = $(".lp-sm-body");
  const draftgrp = $(".lp-sm-draftgrp");
  const card = $(".lp-sm-draft");
  const ring = $<SVGSVGElement>(".lp-sm-ring");
  const msg = $(".lp-sm-msg");
  const fixOld = $(".lp-sm-fix-old");
  const fixNew = $(".lp-sm-fix-new");
  const ebDraft = $(".lp-sm-eb-draft");
  const ebSent = $(".lp-sm-eb-sent");
  const send = $(".lp-sm-send");
  const ringMid = $$<SVGGElement>(".lpsm-sl-mid");
  const ringBot = $$<SVGGElement>(".lpsm-sl-bot");

  /* Dispose must give back the server markup in every engine. gsap.context().revert() sorts
     its tweens with `b.g - a.g || -Infinity` (gsap-core 3.15), a comparator that is
     inconsistent for ties, so SpiderMonkey reverts tied sets in another order than V8/JSC and
     leaves frame-0 inline styles behind (measured: the post kept pose A, the clips and
     counters their mid-play values, and a rebuild then read pose A as the rest pose).
     Snapshot every element's style attribute before the first set; cleanup — which runs
     after the revert — restores them verbatim, so a rebuild starts from the rest markup in
     every engine. (SVG <g>s keep the identity `transform` attribute GSAP's revert leaves:
     removing it and re-adding the same matrix on a rebuild is not repainted by WebKit —
     measured, the ring stayed unstretched.) */
  const snapshot = Array.from(root.querySelectorAll<Element>("*"), (el) => ({ el, style: el.getAttribute("style") }));

  /* carets: one per typed run, in the run's positioned PARENT (the run itself is clipped to
     the typed glyphs; a child caret would be clipped with it) — copied from buildF2 */
  type Caret = { el: HTMLElement; ox: number; oy: number };
  const mkCaret = (p: HTMLElement): Caret => {
    const c = document.createElement("i");
    c.className = "lp-sm-caret";
    c.style.color = getComputedStyle(p).color;
    (p.offsetParent ?? p.parentElement!).appendChild(c);
    created.push(c);
    return { el: c, ox: p.offsetLeft, oy: p.offsetTop };
  };
  const bodyCaret = mkCaret(body);
  const msgCaret = mkCaret(msg);

  /* glyphs: the post body, then the message in its two states — A as Pancake writes it
     ("…call Friday?", the old word inline) and B as corrected ("…call Thursday?", the rest
     markup). Both arrays span every character of the run (text + old + new); a character
     hidden in that state measures zero and repeats its predecessor. */
  const bodyGlyphs = measureGlyphs(body);
  gsap.set(fixOld, { display: "none" }); // state B, whatever the markup was left in
  gsap.set(fixNew, { display: "inline" });
  const glyphsB = measureGlyphs(msg);
  gsap.set(fixOld, { display: "inline" });
  gsap.set(fixNew, { display: "none" });
  const glyphsA = measureGlyphs(msg); // frame 0 stays in state A
  const nOld = Array.from(fixOld.textContent || "").length;
  const nNew = Array.from(fixNew.textContent || "").length;
  const nText = glyphsA.length - nOld - nNew;
  const charsA = Array.from(msg.textContent || "").slice(0, nText + nOld);

  /* counters: the final number is the in-flow text (server-rendered), the earlier states are
     stacked over it and it waits for its tick — copied from buildF2 */
  const mkCounter = (el: HTMLElement) => {
    const fin = el.querySelector<HTMLElement>(".lp-sm-n--final")!;
    const max = Number(fin.textContent) || 0;
    const ns: HTMLElement[] = [];
    gsap.set(fin, { opacity: 0 });
    for (let k = 0; k < max; k++) {
      const n = document.createElement("span");
      n.className = "lp-sm-n" + (k === 0 ? " lp-sm-n--zero" : "");
      n.textContent = String(k);
      el.appendChild(n);
      created.push(n);
      ns.push(n);
    }
    ns.push(fin);
    return { ns, max };
  };
  const counts = $$(".lp-sm-count");
  const counters = counts.map(mkCounter);
  // ticking counter: tick times on a quad-out curve (fast first, settling into the final number)
  const tick = ({ ns, max }: { ns: HTMLElement[]; max: number }, t0: number, dur: number) => {
    for (let k = 1; k <= max; k++) {
      const tk = t0 + dur * (1 - Math.sqrt(1 - k / max));
      tl.set(ns[k - 1], { opacity: 0 }, tk);
      tl.set(ns[k], { opacity: 1 }, tk);
    }
  };

  /* ring draw masks: dash lengths from the actual squircle geometry (font-independent) */
  const drawPaths = $$<SVGPathElement>(".lpsm-drawp");
  drawPaths.forEach((p) => {
    const L = p.getTotalLength() + 2;
    gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
  });

  /* ── frame 0 ── */
  const poseB = new DOMMatrixReadOnly(getComputedStyle(post).transform).a || 1;
  const postA = { x: P.postA.left - post.offsetLeft, y: P.postA.top - post.offsetTop };
  const avatar = $(".lp-sm-avatar");
  const name = $(".lp-sm-name");
  const headline = $(".lp-sm-headline");
  const time = $(".lp-sm-time");
  const globe = $("#lpsm-pi-globe");
  const bars = $$(".lp-sm-skelgrp i");
  const rowEls: Element[] = [];
  ["#lpsm-pi-like", "#lpsm-pi-comment", "#lpsm-pi-repost", "#lpsm-pi-send"].forEach((s, i) =>
    rowEls.push($(s), counts[i]),
  );
  gsap.set(convo, { autoAlpha: 1, scale: 1, transformOrigin: P.convoOrigin });
  gsap.set(world, { autoAlpha: 0 });
  gsap.set(cam, { scale: CAM_FROM });
  gsap.set(post, { x: postA.x, y: postA.y, scale: P.postA.scale, autoAlpha: 0 });
  gsap.set([avatar, name, headline, time, globe, ...bars, ...rowEls], { opacity: 0 });
  gsap.set([body, msg], { clipPath: HIDDEN_CLIP });
  gsap.set([bodyCaret.el, msgCaret.el], { opacity: 0 });
  gsap.set(draftgrp, { autoAlpha: 0, y: groupY(FIRST_LINES) });
  gsap.set(card, { height: cardH(FIRST_LINES) });
  gsap.set(ring, { autoAlpha: 1 });
  gsap.set(ringMid, { scaleY: (156 + ringExtra(FIRST_LINES)) / 156, svgOrigin: "0 64" });
  gsap.set(ringBot, { y: ringExtra(FIRST_LINES) });
  gsap.set([ebDraft, ebSent], { opacity: 0 });
  gsap.set(send, { scale: 1 });

  /* caret helpers */
  const caretAt = (c: Caret, x: number, g: Glyph, t: number, extra: gsap.TweenVars = {}) =>
    tl.set(c.el, { x: c.ox + x, y: c.oy + g.top, height: g.bottom - g.top, ...extra }, t);
  // types a run from t: the caret sits at the line start, then rides each glyph's right edge;
  // returns each glyph's time and the moment after the last glyph
  const typeIn = (
    t: number,
    el: HTMLElement,
    caret: Caret,
    glyphs: Glyph[],
    chars: string[],
    base: number,
    pause: (c: string, n: string) => number,
  ) => {
    const times: number[] = [];
    caretAt(caret, 0, glyphs[0], t - 0.25, { opacity: 1 });
    glyphs.forEach((g, i) => {
      times.push(t);
      tl.set(el, { clipPath: clipTo(g) }, t);
      caretAt(caret, g.right + 1, g, t);
      t += base + pause(chars[i] ?? "", chars[i + 1] ?? "");
    });
    return { times, end: t };
  };
  const typeDone = (el: HTMLElement, caret: Caret, t: number) => {
    tl.set(caret.el, { opacity: 0 }, t + 0.4);
    tl.set(el, { clipPath: "none" }, t + 0.45); // the run paints exactly like the static site
  };
  const lineOf = (g: Glyph) => Math.round((g.top - glyphsA[0].top) / LINE);

  /* — A · the post rises at pose A, its author lands, its text types (0 – 2.8 s) — */
  tl.fromTo(
    post,
    { y: postA.y + 28, autoAlpha: 0 },
    { y: postA.y, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
    SM_T.postIn,
  );
  tl.fromTo(
    avatar,
    { scale: 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(1.6)", immediateRender: false },
    SM_T.avatar,
  );
  tl.fromTo(
    [name, headline, time],
    { y: 10, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", stagger: 0.06, immediateRender: false },
    SM_T.meta,
  );
  tl.fromTo(
    globe,
    { y: 10, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", immediateRender: false },
    SM_T.globe,
  );
  const bodyRun = typeIn(SM_T.bodyType, body, bodyCaret, bodyGlyphs, Array.from(body.textContent || ""), POST_MS, (c) =>
    c === "." ? 0.05 : 0,
  );
  typeDone(body, bodyCaret, bodyRun.end);
  tl.fromTo(
    bars,
    { scaleX: 0.6, autoAlpha: 0, transformOrigin: "0 50%" },
    { scaleX: 1, autoAlpha: 1, duration: 0.35, ease: "power3.out", stagger: 0.05, immediateRender: false },
    SM_T.skel,
  );
  // one sheen sweep: bar lefts inside the 345-wide skeleton row, sheen 100 wide
  const SKEL_LEFT = [0, 18, 97, 115, 175, 193];
  $$(".lp-sm-skelgrp i b").forEach((b, i) =>
    tl.fromTo(b, { x: -100 - SKEL_LEFT[i] }, { x: 345 - SKEL_LEFT[i], duration: 0.6, ease: "power1.inOut" }, SM_T.sheen),
  );
  tl.fromTo(
    rowEls,
    { y: 8, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.35, ease: "power3.out", stagger: 0.05, immediateRender: false },
    SM_T.row,
  );
  tick(counters[0], SM_T.likes, 0.6);
  counters.slice(1).forEach((c, i) => tick(c, SM_T.others + i * 0.08, 0.4));
  tl.addLabel("f1", SM_T.f1);

  /* — B · the post moves to the top, the draft card rises in its ring, Pancake types — */
  tl.to(post, { x: 0, y: 0, scale: poseB, duration: 0.7, ease: "power3.inOut" }, SM_T.postToB);
  tl.fromTo(
    draftgrp,
    { y: groupY(FIRST_LINES) + 44, autoAlpha: 0 },
    { y: groupY(FIRST_LINES), autoAlpha: 1, duration: 0.6, ease: "power3.out", immediateRender: false },
    SM_T.draftIn,
  );
  drawPaths.forEach((p, i) =>
    tl.to(p, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, SM_T.ringDraw + i * 0.1),
  );
  tl.fromTo(
    ebDraft,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    SM_T.eyebrowIn,
  );
  const typed = glyphsA.slice(0, nText + nOld);
  const msgRun = typeIn(SM_T.msgType, msg, msgCaret, typed, charsA, PANCAKE_MS, (c, n) =>
    c === "." && n === " " ? 0.06 : c === "," ? 0.035 : 0,
  );
  // the card grows a line as the caret reaches it (the Send button rides its bottom edge)
  typed.forEach((g, i) => {
    const line = lineOf(g);
    if (i === 0 || line < FIRST_LINES || line === lineOf(typed[i - 1])) return;
    const lines = line + 1;
    const at = msgRun.times[i];
    const grow = { duration: 0.22, ease: "power2.out" };
    tl.to(draftgrp, { y: groupY(lines), ...grow }, at);
    tl.to(card, { height: cardH(lines), ...grow }, at);
    tl.to(ringMid, { scaleY: (156 + ringExtra(lines)) / 156, ...grow }, at);
    tl.to(ringBot, { y: ringExtra(lines), ...grow }, at);
  });
  // f2: mid line 2 (Figma: "…sends rem|"), the ring complete, the card still two lines
  const firstOfLine3 = typed.findIndex((g) => lineOf(g) >= 2);
  const f2Glyph = Math.min(54, (firstOfLine3 > 0 ? firstOfLine3 : typed.length) - 1);
  tl.addLabel("f2", msgRun.times[f2Glyph] + 0.001);
  const tTyped = msgRun.end;
  typeDone(msg, msgCaret, tTyped);
  tl.addLabel("f3", tTyped + SM_T.f3After);

  /* — D · the hand-over: the ring goes, a member corrects the last word, Send — */
  tl.to(ring, { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, tTyped + SM_T.ringOut);
  const lastA = typed[typed.length - 1];
  const tFix = tTyped + SM_T.fixCaret;
  tl.set(msg, { clipPath: clipTo(lastA) }, tFix); // the same picture as clip "none"
  caretAt(msgCaret, lastA.right + 1, lastA, tFix, { opacity: 1 });
  // backspace: the caret sits at the left edge of the glyph just deleted
  const leftEdge = (gs: Glyph[], j: number) =>
    j > 0 && Math.abs(gs[j].top - gs[j - 1].top) < 1 ? { x: gs[j - 1].right + 1, g: gs[j - 1] } : { x: 0, g: gs[j] };
  let t = tTyped + SM_T.backspace;
  for (let k = 1; k <= nOld; k++) {
    const j = nText + nOld - k; // the glyph removed at this step
    tl.set(msg, { clipPath: j > 0 ? clipTo(glyphsA[j - 1]) : HIDDEN_CLIP }, t);
    const e = leftEdge(glyphsA, j);
    caretAt(msgCaret, e.x, e.g, t);
    t += SM_T.backspaceStep;
  }
  // swap the run to its corrected state (same text up to here; the new word is red)
  t += SM_T.swapAfter - SM_T.backspaceStep;
  tl.set(fixOld, { display: "none" }, t);
  tl.set(fixNew, { display: "inline" }, t);
  tl.set(msg, { clipPath: clipTo(glyphsB[nText - 1]) }, t);
  t += SM_T.retypeAfter;
  for (let k = 0; k < nNew; k++) {
    const g = glyphsB[nText + nOld + k];
    tl.set(msg, { clipPath: clipTo(g) }, t);
    caretAt(msgCaret, g.right + 1, g, t);
    t += SM_T.retypeStep;
  }
  const tRetyped = t - SM_T.retypeStep; // the last letter's moment
  // the member's caret leaves the field as they reach for Send
  tl.set(msgCaret.el, { opacity: 0 }, tRetyped + SM_T.caretOff);
  tl.set(msg, { clipPath: "none" }, tRetyped + SM_T.caretOff + 0.01);
  tl.addLabel("f4", tRetyped + SM_T.caretOff + 0.02);
  const tSend = tRetyped + SM_T.sendAfter;
  tl.to(send, {
    keyframes: [
      { scale: 0.96, duration: 0.09, ease: "power2.out" },
      { scale: 1, duration: 0.3, ease: "back.out(2)" },
    ],
  }, tSend);
  const tSent = tSend + SM_T.sentAfter;
  tl.to(ebDraft, { y: -6, opacity: 0, duration: 0.18, ease: "power2.in" }, tSent);
  tl.fromTo(
    ebSent,
    { y: 6, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
    tSent + 0.06,
  );

  /* — E · zoom out to more accounts: the card hands over to the account's card, the camera
     pulls back from 1.6 to the artboard (f5 = the end picture = the server markup) — */
  const tZoom = tSent + 0.06 + SM_T.zoomAfter;
  tl.to(convo, { scale: 0.85, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, tZoom);
  tl.to(world, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, tZoom);
  tl.to(cam, { scale: 1, duration: SM_T.zoom, ease: "power3.inOut" }, tZoom);
  tl.addLabel("f5", tZoom + SM_T.zoom);
  tl.to({}, { duration: 0.001 }, tZoom + SM_T.zoom);

  const cleanup = () => {
    created.forEach((n) => n.parentNode?.removeChild(n));
    snapshot.forEach(({ el, style }) => {
      if (style === null) el.removeAttribute("style");
      else if (el.getAttribute("style") !== style) el.setAttribute("style", style);
    });
  };

  // first scene: the post in place (author, avatar, time), its text not typed yet
  return { tl, cleanup, cue: SM_T.cue };
}
