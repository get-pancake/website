// No "use client" on purpose: a "use client" module that a server graph reaches, even through
// an import(), becomes a client ENTRY of app/page and ships eagerly in the homepage bundle (seen
// in the dev page chunk's flight-client-entry list, 2026-10-09, when the loaders sat in the
// server registry). The loaders now live in the client-only lp-dive-loaders.ts, so this is a
// lazy chunk of the carousel / harness import() only; keep it directive-free. Browser-only code
// runs inside build() alone.
import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";

/**
 * Deep-dive story "Run it from Claude or Codex" — its build-up as ONE paused, seek-safe GSAP timeline on the
 * stage root (Figma 4964:2575 / 3930 / 3981). Owner: story-claude package. Contract: lp-dive-stages.ts and
 * code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens
 * only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the first composed
 * scene. Reached only through DIVE_LOADERS.claude (lp-dive-loaders.ts, lazy chunk).
 *
 * The story (storyboard 01 → 02 → 03; times for the production copy, 69 prompt glyphs):
 *   0      cue: Claude's home, the composer empty (send at .5)
 *   0.30   the prompt types in, one glyph every 15 ms, a caret riding the glyph edges
 *          (clip-path staircase on the real text run, as f2: no per-char spans)
 *   1.42   typed (≈ frame 01) · 1.57 the send button is pressed
 *   1.67   SEND: the composer empties and docks down (+56), the greeting fades, home fades;
 *          the camera dollies in ×1.35 about the composer's centre (.75 s): home zooms 1 → 1.35
 *          while the chat zooms 1/1.35 → 1 about the same origin, with the same ease — the
 *          composite of the spec's camera + pre-scaled chat, without a camera transform to undo
 *          at rest; the bubble rises (48)
 *   2.47   Claude's reply streams word by word (75 ms)
 *   3.20   the connector row appears, one shimmer sweep on "Connecting..." (≈ frame 02 at 4.28)
 *   4.30   it resolves into "11 leads found"
 *   4.80   (dev/preview) the follow-up line streams in
 *   5.05   end (5.95 with the follow-up) = frame 03 = the server markup, pixel for pixel
 *          (Chromium, WebKit, Gecko: max channel diff 0): the visible chat ends with its
 *          transforms cleared (no text left in a transformed layer — Gecko rasters it
 *          differently), home and the connector row end invisible as in the markup.
 * Phones: the same timeline; the scene CSS sets --lp-sc-cam-s: 1 (no zoom).
 *
 * Two GSAP 3.15 traps this builder avoids (both reproduced in the harness):
 * - NO zero-duration tl.set: gsap.context's revert replays zero-duration tweens LAST, in an
 *   order that depends on the engine's sort (Gecko ≠ Blink), so a set's saved pre-value could
 *   win and leave the reply hidden after dispose.
 *   Every instant change is a 1 ms tween (`step`), reverted in time order, and every property
 *   the timeline touches also has a frame-0 gsap.set, reverted after them → the clean markup.
 * - clearProps only inside a 1 ms tween at the very end: in a zero-duration set it is not
 *   undone by a backward seek (seeking back from the end lost the zoom); in a tween it is.
 *
 * The reply and follow-up stream by toggling server-rendered word spans (font-independent: the
 * serif may still be loading when the shell builds a viewport ahead); the prompt's glyphs are
 * measured (Geist, the site's text face, is loaded with the page).
 */

/* Typing helpers — COPIED from production's lp-feat-timelines.ts (measureGlyphs, HIDDEN_CLIP,
   clipTo; that file went with the feature cards, 2026-10-11). story-message carries its own
   copy with an exact-scale fix, so the two are not merged. */
type Glyph = { right: number; top: number; bottom: number };
/** each glyph's right edge and line box, in the element's own unscaled px (Range rects) */
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

/** typing: first glyph, then one every 15 ms */
const T0 = 0.3;
const DT = 0.015;
/** word streams: one word every 75 ms */
const WORD = 0.075;
/** an "instant" step: 1 ms (a tween, so gsap.context reverts it in time order) */
const STEP = 0.001;

export function buildStoryClaude(root: HTMLElement): BuiltStory {
  const $ = <T extends Element = HTMLElement>(sel: string): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`story-claude: ${sel} missing`);
    return el;
  };
  const home = $(".lp-sc-home");
  const chat = $(".lp-sc-chat");
  const hello = $(".lp-sc-hello");
  const composer = $(".lp-sc-composer");
  const below = $(".lp-sc-below");
  const prompt = $(".lp-sc-prompt");
  const send = $(".lp-sc-send");
  const bubble = $(".lp-sc-bubble");
  const status = $(".lp-sc-status");
  const conn = $(".lp-sc-conn");
  const result = $(".lp-sc-result");
  const replyWords = Array.from($(".lp-sc-reply").querySelectorAll<HTMLElement>(".lp-sc-w"));
  const more = root.querySelector<HTMLElement>(".lp-sc-more");
  const moreWords = more ? Array.from(more.querySelectorAll<HTMLElement>(".lp-sc-w")) : [];
  const words = [...replyWords, ...moreWords];

  // the camera: zoom from the scene CSS (desktop 1.350355, phones 1); its origin (the composer
  // card's centre) is the transform-origin of both scenes in the CSS
  const camS = parseFloat(getComputedStyle(root).getPropertyValue("--lp-sc-cam-s")) || 1;

  // the caret lives in the composer card (the prompt run itself is clipped), offset by the
  // run's position in it; glyph geometry in the run's own unscaled px (laid out: home is only
  // visibility-hidden at rest)
  const caret = document.createElement("i");
  caret.className = "lp-sc-caret";
  composer.appendChild(caret);
  const glyphs = measureGlyphs(prompt);
  const ox = prompt.offsetLeft;
  const oy = prompt.offsetTop;

  const tl = gsap.timeline({ paused: true });
  // an instant change as a 1 ms tween, not a zero-duration set (see the header: dispose order)
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) =>
    tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);

  /* ── frame 0 = cue: Claude's home, composer empty ── */
  gsap.set(home, { autoAlpha: 1, scale: 1 });
  gsap.set(chat, { autoAlpha: 0, scale: 1 / camS });
  gsap.set(hello, { opacity: 1 });
  gsap.set([composer, below], { y: 0 });
  gsap.set(prompt, { clipPath: HIDDEN_CLIP });
  gsap.set(send, { opacity: 0.5, scale: 1 });
  gsap.set(bubble, { autoAlpha: 0, y: 48 });
  gsap.set(words, { autoAlpha: 0 });
  gsap.set(status, { autoAlpha: 0, y: 4 });
  gsap.set(conn, { backgroundPosition: "100% 0%" });
  gsap.set(result, { autoAlpha: 0, y: 6 });

  /* ── 1 · the prompt types in ── */
  const first = glyphs[0];
  if (first) {
    step(caret, { x: ox, y: oy + first.top, height: first.bottom - first.top, opacity: 1 }, 0.1);
  }
  tl.to(send, { opacity: 1, duration: 0.2, ease: "power2.out" }, T0);
  glyphs.forEach((g, i) => {
    const t = T0 + i * DT;
    step(prompt, { clipPath: clipTo(g) }, t);
    step(caret, { x: ox + g.right + 1, y: oy + g.top, height: g.bottom - g.top }, t); // in step with the clip
  });
  const TYPED = T0 + Math.max(glyphs.length - 1, 0) * DT;
  step(prompt, { clipPath: "none" }, TYPED + 0.1); // the run paints exactly like the markup

  /* ── 2 · press, SEND: the message leaves the composer, the camera dollies in ── */
  const PRESS = TYPED + 0.25;
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
  step(caret, { opacity: 0 }, SEND);
  step(prompt, { clipPath: HIDDEN_CLIP }, SEND);
  tl.to(send, { opacity: 0.5, duration: 0.15, ease: "power1.out" }, SEND);
  tl.to(hello, { opacity: 0, duration: 0.2, ease: "power1.in" }, SEND);
  tl.to([composer, below], { y: 56, duration: 0.45, ease: "power2.in" }, SEND + 0.05); // docks down
  tl.to(home, { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, SEND + 0.1);
  // the dolly-in: home 1 → camS, chat 1/camS → 1, one origin, one ease (= camera ∘ chat)
  tl.to(home, { scale: camS, duration: 0.75, ease: "power3.inOut" }, SEND);
  tl.to(chat, { scale: 1, duration: 0.75, ease: "power3.inOut" }, SEND);
  tl.to(chat, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, SEND + 0.1);
  tl.to(bubble, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, SEND + 0.15);
  tl.to(bubble, { y: 0, duration: 0.6, ease: "power3.out" }, SEND + 0.15);
  // home stays as it left (faded, docked, zoomed): invisible from SEND + .45 to the end

  /* ── 3 · Claude's reply streams in ── */
  const stream = (list: HTMLElement[], t0: number) => {
    list.forEach((w, k) => step(w, { autoAlpha: 1 }, t0 + k * WORD));
    return t0 + Math.max(list.length - 1, 0) * WORD;
  };
  const REPLY = SEND + 0.8;
  const REPLIED = stream(replyWords, REPLY);

  /* ── 4 · the connector row, one shimmer sweep ── */
  const TOOL = REPLIED + 0.2;
  tl.to(status, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, TOOL);
  tl.to(conn, { backgroundPosition: "0% 0%", duration: 0.9, ease: "power1.inOut" }, TOOL + 0.1);

  /* ── 5 · it resolves into the result (+ the preview-only follow-up) ── */
  const RESULT = TOOL + 1.1;
  tl.to(status, { autoAlpha: 0, y: -4, duration: 0.2, ease: "power1.in" }, RESULT);
  tl.to(result, { autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(1.6)" }, RESULT + 0.15);
  const LAST = moreWords.length ? stream(moreWords, RESULT + 0.5) : RESULT + 0.5;

  /* ── end = frame 03 = the server markup, a short beat after the last change: the visible
     chat sheds its (identity) transforms, so no text rests in a transformed layer ── */
  step([chat, bubble, result], { y: 0, scale: 1, clearProps: "transform" }, LAST + 0.25 - STEP);

  // Dispose (the caller reverts its gsap.context first, then calls this): the caret goes, and so
  // does the empty style="" that gsap's revert leaves on everything it set — the server markup
  // has none, and "dispose restores the DOM" is then true to the attribute.
  const touched = [home, chat, hello, composer, below, prompt, send, bubble, status, conn, result, ...words];
  return {
    tl,
    cleanup: () => {
      caret.remove();
      for (const el of touched) if (el.getAttribute("style") === "") el.removeAttribute("style");
    },
    cue: 0,
  };
}
