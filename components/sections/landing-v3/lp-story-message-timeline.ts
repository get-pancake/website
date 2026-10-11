// No "use client" on purpose (2026-10-11, as lp-story-sources-timeline.ts): Next makes every
// "use client" module a server graph reaches, even through an import(), an EAGER client entry —
// this builder shipped inside app/page.js while the loaders sat in the server registry. They now
// live in the client-only lp-dive-loaders.ts; keep this a plain module, fetched only when the
// carousel approaches with motion allowed. Browser-only code runs inside buildStoryMessage()
// alone. Nothing is imported at runtime from the registry (types only): the five-line layout
// helper and the typing helpers are copied below.
import { gsap } from "@/lib/gsap";

import type { BuiltStory, DiveStageLayout } from "./lp-dive-stages";
import { SM_RING_SLICE, smRingMarkup, type SmRingId } from "./lp-story-message-art";
import { SM_POSE } from "./lp-story-message-data";
import { prepareSmTail, type SmCaret, type SmGlyph } from "./lp-story-message-tail";

/**
 * Deep-dive story "A personal message for every lead" — its build-up as ONE paused, seek-safe
 * GSAP timeline on the stage root (Figma V2 storyboard 4964:1469 / 1471 / 1729, then the
 * interim tail 4964:1821 / 1899). Owner: story-message package. Contract: lp-dive-stages.ts
 * and code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and
 * tweens only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the
 * first composed scene. Reached only through DIVE_LOADERS.message (lp-dive-loaders.ts, lazy).
 *
 * THIS FILE = frames 1–3, final: A the post rises at pose A and types (label f1) → B it
 * shrinks to the top, the draft card rises in its rainbow ring and Pancake types the message,
 * the card growing a line at a time (f2 mid line 2, f3 fully written).
 * THE TAIL = frames 4–5, interim (the designer marked them WIP on 2026-10-11): the manual
 * correction, Send, MESSAGE SENT and the zoom-out live in lp-story-message-tail.ts, which
 * appends its beats (labels f4, f5) after ours. See that file for the hand-over contract.
 *
 * Production f2's machinery (lp-feat-timelines.ts buildF2), copied: the typed runs are
 * revealed with a clip staircase over the real text + a caret riding the glyph edges (no
 * per-character spans: WebKit kerning), the counts tick on stacked digits, the ring's bands
 * draw through their masks. Glyphs are measured at build (Range rects), so the stage must be
 * laid out (never display:none; visibility:hidden is fine — the conversation rests hidden).
 *
 * The ring: Figma draws it twice, around the two-line card (frame 2) and around the four-line
 * card (frame 3), and the two are different drawings (the stroke profile re-flows along the
 * outline). Both are injected here from lp-story-message-art.ts as 3-slice groups: the
 * two-line one draws in, each grows with the card by stretching its straight middle band, and
 * the four-line one fades in over it at the first growth step. So frame 2 and frame 3 are each
 * Figma's own art, and none of it weighs on the page HTML.
 */

/** every beat time of frames 1–3, in timeline seconds (founder pace knob; the tail has its own) */
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
  ringDrawStagger: 0.1,
  ringDrawDur: 0.9,
  eyebrowIn: 3.4,
  msgType: 3.7,
  /** a line of growth (card, group and ring together) */
  grow: 0.22,
  /** after the typing ends (caret off at +0.40, clip released at +0.45) */
  f3After: 0.46,
} as const;

const PANCAKE_MS = 0.012; // per message glyph (+60 ms after ". ", +35 ms after ",")
const POST_MS = 0.02; // per post glyph (+50 ms after ".")
/** the message's line pitch (story-message.css .lp-sm-msg) */
const LINE = 29;
/** the draft group's geometry per number of message lines (Figma frame 2 = 2 lines, frame 3 = 4):
    card h = 139.217 + 29·L, group y = 32.591·(4 − L) */
const cardH = (lines: number) => 139.217 + LINE * lines;
const groupY = (lines: number) => 32.591 * (4 - lines);
const FIRST_LINES = 2; // the card rises at two lines

// copied from lp-dive-stages.ts diveStageLayout (importing the registry would pull the four
// server Stage components and their data into this lazy chunk)
function layoutOf(root: HTMLElement): DiveStageLayout {
  const scene = root.closest<HTMLElement>("[data-lp-layout]");
  const declared = scene?.dataset.lpLayout;
  if (declared === "phone" || declared === "desktop") return declared;
  return (scene ?? root).offsetWidth < 600 ? "phone" : "desktop";
}

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
const clipTo = (g: SmGlyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;

/** how many screen px one of the element's own px covers (--lp-fit and every ancestor scale).
    The element's CSS width, not offsetWidth: that one is an integer, and a 337.391px run read
    as 337 shifted every glyph edge by 0.1 % (only for elements without padding or border). */
function scaleOf(el: HTMLElement, box: DOMRect): number {
  const w = parseFloat(getComputedStyle(el).width);
  if (w > 0) return box.width / w;
  return el.offsetWidth ? box.width / el.offsetWidth : 1;
}

/** Each VISIBLE character of a run — its right edge and line box, in the element's own
    unscaled px (Range rects). Copied from lp-feat-timelines.ts measureGlyphs, with two changes:
    the exact scale above, and a text node whose parent is not rendered (display:none — a
    state of the run that is not showing) is skipped instead of measured as zero-width. */
function measureRun(el: HTMLElement): SmGlyph[] {
  const box = el.getBoundingClientRect();
  const s = scaleOf(el, box);
  const glyphs: SmGlyph[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (parent && parent !== el && parent.getClientRects().length === 0) continue;
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

export function buildStoryMessage(root: HTMLElement): BuiltStory {
  const { $, $$ } = query(root);
  const layout = layoutOf(root);
  const P = SM_POSE[layout];
  const created: Node[] = [];
  const ring = $<SVGSVGElement>(".lp-sm-ring");

  /* Dispose must give back the server markup in every engine. gsap.context().revert() sorts
     its tweens with `b.g - a.g || -Infinity` (gsap-core 3.15), a comparator that is
     inconsistent for ties, so SpiderMonkey reverts tied sets in another order than V8/JSC and
     leaves frame-0 inline styles behind (measured: the post kept pose A, the clips and
     counters their mid-play values, and a rebuild then read pose A as the rest pose).
     Snapshot every element's style attribute before the first set; cleanup — which runs
     after the revert — restores them verbatim, so a rebuild starts from the rest markup in
     every engine. (The post's SVG icon groups keep the identity `transform` attribute GSAP's
     revert leaves; the ring's nodes are created per build and removed, so they never carry
     one over.) */
  const snapshot = Array.from(root.querySelectorAll<Element>("*"), (el) => ({ el, style: el.getAttribute("style") }));
  const cleanup = () => {
    created.forEach((n) => n.parentNode?.removeChild(n));
    created.length = 0;
    ring.replaceChildren();
    snapshot.forEach(({ el, style }) => {
      if (style === null) el.removeAttribute("style");
      else if (el.getAttribute("style") !== style) el.setAttribute("style", style);
    });
  };

  try {
    return { ...assemble(), cleanup };
  } catch (err) {
    // a half-run build must not leave the ring or the carets behind: the shell only gets a
    // cleanup from a build that returned
    cleanup();
    throw err;
  }

  function assemble(): Omit<BuiltStory, "cleanup"> {
    const tl = gsap.timeline({ paused: true });

    const convo = $(".lp-sm-convo");
    const post = $(".lp-sm-post");
    const body = $(".lp-sm-body");
    const draftgrp = $(".lp-sm-draftgrp");
    const card = $(".lp-sm-draft");
    const msg = $(".lp-sm-msg");
    const ebDraft = $(".lp-sm-eb-draft");

    /* the tail (frames 4–5, interim) first: it puts the message's last word in the state
       Pancake writes, which is what gets measured and typed below */
    const tail = prepareSmTail(root, { layout, measure: measureRun, clipTo, hiddenClip: HIDDEN_CLIP });

    /* the ring's two drawings (see the header), each a 3-slice: the middle band scales about
       its top cut, the bottom slice follows */
    ring.innerHTML = smRingMarkup();
    const rings = (Object.keys(SM_RING_SLICE) as SmRingId[]).map((id) => {
      const { top, bot, rest } = SM_RING_SLICE[id];
      const pose = (lines: number) => {
        const extra = LINE * (lines - rest);
        return { scaleY: (bot - top + extra) / (bot - top), y: extra };
      };
      const g = (sel: string) => $<SVGGElement>(`.lpsm-${id}${sel}`);
      return { id, top, rest, pose, g: g(""), slTop: g(" .lpsm-sl-top"), mid: g(" .lpsm-sl-mid"), bot: g(" .lpsm-sl-bot") };
    });
    type Ring = (typeof rings)[number];
    const [ring2, ring4] = [rings.find((r) => r.id === "r2")!, rings.find((r) => r.id === "r4")!];
    /* At the line count a drawing is exact at, it shows WHOLE: its top slice unclipped, the two
       others off. No slice seam then (an antialiased clip edge lets the bands under the top
       one show through on a one-device-pixel row whenever the ring sits on a fractional pixel
       — Chromium and WebKit, measured), and a third of the mask layers to paint. Sliced only
       while it is stretched. `at` undefined = frame 0. */
    const showWhole = (r: Ring, whole: boolean, at?: number) => {
      const clip = { clipPath: whole ? "none" : `url(#lpsm-${r.id}-top)` };
      const rest = { display: whole ? "none" : "inline" };
      if (at === undefined) {
        gsap.set(r.slTop, clip);
        gsap.set([r.mid, r.bot], rest);
      } else {
        tl.set(r.slTop, clip, at);
        tl.set([r.mid, r.bot], rest, at);
      }
    };

    /* the post is laid out for pose A from here on (its --b, story-message.css): the body is
       typed there, so its caret offset is measured there */
    gsap.set(post, { "--b": 0 });

    /* carets: one per typed run, in the run's positioned PARENT (the run itself is clipped to
       the typed glyphs; a child caret would be clipped with it) — after buildF2, with the
       run's offset read from its rects (offsetLeft/Top are integers: up to half a px off) */
    const mkCaret = (run: HTMLElement): SmCaret => {
      const host = (run.offsetParent as HTMLElement | null) ?? run.parentElement!;
      const c = document.createElement("i");
      c.className = "lp-sm-caret";
      c.style.color = getComputedStyle(run).color;
      host.appendChild(c);
      created.push(c);
      const rb = run.getBoundingClientRect();
      const hb = host.getBoundingClientRect();
      const s = scaleOf(run, rb);
      return { el: c, ox: (rb.left - hb.left) / s, oy: (rb.top - hb.top) / s };
    };
    const bodyCaret = mkCaret(body);
    const msgCaret = mkCaret(msg);

    /* glyphs: the post body, and the message as Pancake writes it */
    const bodyGlyphs = measureRun(body);
    const typed = measureRun(msg);
    if (!bodyGlyphs.length || !typed.length) throw new Error("lp-story-message: nothing to type (is the stage laid out?)");

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

    /* ring draw masks (the two-line drawing's): dash lengths from the actual outline */
    const drawPaths = $$<SVGPathElement>(".lpsm-drawp");
    drawPaths.forEach((p) => {
      const L = p.getTotalLength() + 2;
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
    });

    /* ── frame 0 ── */
    // the post's rest pose (B) is the CSS; pose A is data. Computed left/top, not offsetLeft/Top:
    // those are integers, and 82.704 read as 83 put pose A 0.3px high.
    const postCss = getComputedStyle(post);
    const poseB = new DOMMatrixReadOnly(postCss.transform).a || 1;
    const postA = { x: P.postA.left - parseFloat(postCss.left), y: P.postA.top - parseFloat(postCss.top) };
    const avatar = $(".lp-sm-avatar");
    const name = $(".lp-sm-name");
    const headline = $(".lp-sm-headline");
    const time = $(".lp-sm-time");
    const globe = $("#lpsm-pi-globe");
    const bars = $$(".lp-sm-skelgrp i");
    const rowEls: Element[] = [];
    ["#lpsm-pi-like", "#lpsm-pi-comment", "#lpsm-pi-repost", "#lpsm-pi-send"].forEach((s, i) => rowEls.push($(s), counts[i]));
    gsap.set(convo, { autoAlpha: 1 });
    gsap.set(post, { x: postA.x, y: postA.y, scale: P.postA.scale, autoAlpha: 0 });
    gsap.set([avatar, name, headline, time, globe, ...bars, ...rowEls], { opacity: 0 });
    gsap.set([body, msg], { clipPath: HIDDEN_CLIP });
    gsap.set([bodyCaret.el, msgCaret.el], { opacity: 0 });
    gsap.set(draftgrp, { autoAlpha: 0, y: groupY(FIRST_LINES) });
    // autoRound:false — GSAP rounds px values of layout properties to whole pixels by default,
    // which put the card's bottom edge and the Send button 0.2px off Figma (197 for 197.217)
    gsap.set(card, { height: cardH(FIRST_LINES), autoRound: false });
    rings.forEach((r) => {
      const at = r.pose(FIRST_LINES);
      gsap.set(r.mid, { scaleY: at.scaleY, svgOrigin: `0 ${r.top}` });
      gsap.set(r.bot, { y: at.y });
      showWhole(r, FIRST_LINES === r.rest);
    });
    // the four-line drawing waits, unpainted, for the first growth step
    gsap.set(ring4.g, { display: "none", opacity: 0 });
    gsap.set(ebDraft, { opacity: 0 });

    /* caret helpers */
    const caretAt = (c: SmCaret, x: number, g: SmGlyph, t: number, extra: gsap.TweenVars = {}) =>
      tl.set(c.el, { x: c.ox + x, y: c.oy + g.top, height: g.bottom - g.top, ...extra }, t);
    // types a run from t: the caret sits at the line start, then rides each glyph's right edge;
    // returns each glyph's time and the moment after the last glyph
    const typeIn = (t: number, el: HTMLElement, caret: SmCaret, glyphs: SmGlyph[], base: number, pause: (c: string, n: string) => number) => {
      const times: number[] = [];
      caretAt(caret, 0, glyphs[0], t - 0.25, { opacity: 1 });
      glyphs.forEach((g, i) => {
        times.push(t);
        tl.set(el, { clipPath: clipTo(g) }, t);
        caretAt(caret, g.right + 1, g, t);
        t += base + pause(g.ch, glyphs[i + 1]?.ch ?? "");
      });
      return { times, end: t };
    };
    const typeDone = (el: HTMLElement, caret: SmCaret, t: number) => {
      tl.set(caret.el, { opacity: 0 }, t + 0.4);
      tl.set(el, { clipPath: "none" }, t + 0.45); // the run paints exactly like the static site
    };
    const lineOf = (g: SmGlyph) => Math.round((g.top - typed[0].top) / LINE);

    /* — A · the post rises at pose A, its author lands, its text types (0 – 2.8 s) — */
    tl.fromTo(post, { y: postA.y + 28, autoAlpha: 0 }, { y: postA.y, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, SM_T.postIn);
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
    const bodyRun = typeIn(SM_T.bodyType, body, bodyCaret, bodyGlyphs, POST_MS, (c) => (c === "." ? 0.05 : 0));
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
    tl.to(post, { x: 0, y: 0, scale: poseB, "--b": 1, duration: 0.7, ease: "power3.inOut" }, SM_T.postToB);
    tl.fromTo(
      draftgrp,
      { y: groupY(FIRST_LINES) + 44, autoAlpha: 0 },
      { y: groupY(FIRST_LINES), autoAlpha: 1, duration: 0.6, ease: "power3.out", immediateRender: false },
      SM_T.draftIn,
    );
    drawPaths.forEach((p, i) =>
      tl.to(p, { strokeDashoffset: 0, duration: SM_T.ringDrawDur, ease: "power2.inOut" }, SM_T.ringDraw + i * SM_T.ringDrawStagger),
    );
    const tRingDrawn = SM_T.ringDraw + Math.max(0, drawPaths.length - 1) * SM_T.ringDrawStagger + SM_T.ringDrawDur;
    tl.fromTo(
      ebDraft,
      { y: 6, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
      SM_T.eyebrowIn,
    );
    const msgRun = typeIn(SM_T.msgType, msg, msgCaret, typed, PANCAKE_MS, (c, n) => (c === "." && n === " " ? 0.06 : c === "," ? 0.035 : 0));
    // the card grows a line as the caret reaches it (the Send button rides its bottom edge)
    let handedOver = false;
    let shown = FIRST_LINES;
    typed.forEach((g, i) => {
      const line = lineOf(g);
      if (i === 0 || line < FIRST_LINES || line === lineOf(typed[i - 1])) return;
      const lines = line + 1;
      const at = msgRun.times[i];
      const grow = { duration: SM_T.grow, ease: "power2.out" };
      tl.to(draftgrp, { y: groupY(lines), ...grow }, at);
      tl.to(card, { height: cardH(lines), autoRound: false, ...grow }, at);
      rings.forEach((r) => {
        const to = r.pose(lines);
        if (shown === r.rest) showWhole(r, false, at); // same picture, now in three slices
        tl.to(r.mid, { scaleY: to.scaleY, ...grow }, at);
        tl.to(r.bot, { y: to.y, ...grow }, at);
        if (lines === r.rest) showWhole(r, true, at + SM_T.grow);
      });
      shown = lines;
      if (!handedOver) {
        // the four-line drawing fades in OVER the two-line one (no dip in the bands' opacity),
        // which then leaves underneath; never before the draw-on has finished
        handedOver = true;
        const tSwap = Math.max(at, tRingDrawn);
        tl.set(ring4.g, { display: "inline" }, tSwap);
        tl.to(ring4.g, { opacity: 1, duration: SM_T.grow, ease: "none" }, tSwap);
        tl.to(ring2.g, { opacity: 0, duration: 0.15, ease: "none" }, tSwap + SM_T.grow);
        tl.set(ring2.g, { display: "none" }, tSwap + SM_T.grow + 0.15);
      }
    });
    // f2: mid line 2 (Figma: "…sends rem|"), the ring complete, the card still two lines
    const firstOfLine3 = typed.findIndex((g) => lineOf(g) >= 2);
    const f2Glyph = Math.min(54, (firstOfLine3 > 0 ? firstOfLine3 : typed.length) - 1);
    tl.addLabel("f2", Math.max(msgRun.times[f2Glyph], tRingDrawn) + 0.001);
    const tTyped = msgRun.end;
    typeDone(msg, msgCaret, tTyped);
    tl.addLabel("f3", tTyped + SM_T.f3After);

    /* — frames 4–5 · the interim tail: manual correction, Send, sent, zoom-out — */
    tail.add({ tl, tTyped, typed, caret: msgCaret });

    // first scene: the post in place (author, avatar, time), its text not typed yet
    return { tl, cue: SM_T.cue };
  }
}
