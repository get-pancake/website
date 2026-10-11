// No "use client" on purpose — see lp-story-message-timeline.ts (a "use client" module the
// server registry can reach becomes an eager client entry of the homepage).
import { gsap } from "@/lib/gsap";

import type { DiveStageLayout } from "./lp-dive-stages";
import { SM_TAIL_POSE } from "./lp-story-message-data";

/**
 * Deep-dive story "A personal message for every lead" — the TAIL of its timeline: storyboard
 * frames 4 and 5 (Figma 4964:1821 "Manual correction then send", 4964:1899 "ZOOM OUT TO SHOW
 * MORE ACCOUNTS"). Owner: story-message package.
 *
 * INTERIM. On 2026-10-11 the designer marked these two frames WIP (the red box 5024:10646 at
 * the bottom of the column). What plays here is the 2026-10-09 storyboard as specced (decision
 * §6: manual correction, then Send, then MESSAGE SENT, then the zoom-out), kept so the story
 * has an ending; it is not pixel-chased. It is ISOLATED so the final design can replace it:
 *
 *   this file                     the beats after frame 3 (labels f4, f5)
 *   LpStoryMessage.tsx            SmTailSentEyebrow, SmTailLastWord, SmTailWorld
 *   lp-story-message-data.ts      everything under "INTERIM" (SM_TAIL, SM_TAIL_POSE, satellites)
 *   story-message.css             the block under "INTERIM"
 *
 * The contract with the core timeline (lp-story-message-timeline.ts), which owns frames 1–3:
 * 1. `prepareSmTail(root, kit)` runs BEFORE the core measures the message. It puts the
 *    tail-owned elements in their frame-0 state — in particular the message's last word shows
 *    as Pancake writes it — and measures the corrected state it will need.
 * 2. The core builds frames 1–3, then calls `tail.add({ tl, tTyped, typed, caret })` once: the
 *    tail appends its beats after `tTyped` (the moment Pancake's last glyph landed; the core
 *    takes its caret off at +0.40 and releases the clip at +0.45) and returns nothing. The
 *    timeline's end must be the server markup (the rest picture), whatever the tail shows.
 * Same rules as the core: gsap.set for frame 0 (the caller's gsap.context reverts it), sets and
 * tweens only, no callbacks, no randomness, no DOM left behind.
 */

/** one visible character of a typed run: its right edge and line box, in the run's own px */
export type SmGlyph = { ch: string; right: number; top: number; bottom: number };
/** a typing caret: its element and the run's offset inside the caret's positioned parent */
export type SmCaret = { el: HTMLElement; ox: number; oy: number };

/** the core's typing helpers, handed over so the tail types exactly like it */
export type SmTailKit = {
  layout: DiveStageLayout;
  measure: (el: HTMLElement) => SmGlyph[];
  clipTo: (g: SmGlyph) => string;
  hiddenClip: string;
};
export type SmTailHandoff = {
  tl: gsap.core.Timeline;
  /** the moment Pancake's last glyph landed */
  tTyped: number;
  /** the message's glyphs as Pancake typed them (the last word in its written state) */
  typed: SmGlyph[];
  /** the message's caret (the core's; off again by the time the tail starts) */
  caret: SmCaret;
};

/** every beat of the tail, in seconds (founder pace knob) */
export const SM_TAIL_T = {
  ringOut: 0.5, // after the typing ends: the ring hands the card over
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

const count = (el: Element) => Array.from(el.textContent || "").length;

export function prepareSmTail(root: HTMLElement, kit: SmTailKit) {
  const $ = <T extends Element = HTMLElement>(sel: string): T => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`lp-story-message tail: missing ${sel}`);
    return el;
  };
  const pose = SM_TAIL_POSE[kit.layout];
  const convo = $(".lp-sm-convo");
  const world = $(".lp-sm-world");
  const cam = $(".lp-sm-cam");
  const ring = $<SVGSVGElement>(".lp-sm-ring");
  const msg = $(".lp-sm-msg");
  const fixOld = $(".lp-sm-fix-old");
  const fixNew = $(".lp-sm-fix-new");
  const ebDraft = $(".lp-sm-eb-draft");
  const ebSent = $(".lp-sm-eb-sent");
  const send = $(".lp-sm-send");

  /* The message in its corrected state (the rest markup: "…Thursday?"), measured first; then
     the state Pancake writes ("…Friday?"), which is frame 0 and what the core measures. The
     measure skips the hidden word, so each array is the visible run only. */
  gsap.set(fixOld, { display: "none" });
  gsap.set(fixNew, { display: "inline" });
  const corrected = kit.measure(msg);
  gsap.set(fixOld, { display: "inline" });
  gsap.set(fixNew, { display: "none" });
  const nOld = count(fixOld);
  const nNew = count(fixNew);

  /* frame 0 of what the tail owns */
  gsap.set(convo, { scale: 1, transformOrigin: pose.convoOrigin });
  gsap.set(world, { autoAlpha: 0 });
  gsap.set(cam, { scale: pose.camFrom });
  gsap.set(ebSent, { opacity: 0 });
  gsap.set(send, { scale: 1 });

  return {
    add({ tl, tTyped, typed, caret }: SmTailHandoff) {
      const T = SM_TAIL_T;
      const nText = typed.length - nOld;
      if (nText < 1 || corrected.length !== nText + nNew) {
        throw new Error("lp-story-message tail: the written and corrected messages don't line up");
      }
      const caretAt = (x: number, g: SmGlyph, t: number, extra: gsap.TweenVars = {}) =>
        tl.set(caret.el, { x: caret.ox + x, y: caret.oy + g.top, height: g.bottom - g.top, ...extra }, t);

      /* — frame 4 · the hand-over: the ring goes, a member corrects the last word, Send — */
      tl.to(ring, { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, tTyped + T.ringOut);
      const last = typed[typed.length - 1];
      const tFix = tTyped + T.fixCaret;
      tl.set(msg, { clipPath: kit.clipTo(last) }, tFix); // the same picture as clip "none"
      caretAt(last.right + 1, last, tFix, { opacity: 1 });
      // backspace: the caret sits at the left edge of the glyph just deleted
      const leftEdge = (gs: SmGlyph[], j: number) =>
        j > 0 && Math.abs(gs[j].top - gs[j - 1].top) < 1 ? { x: gs[j - 1].right + 1, g: gs[j - 1] } : { x: 0, g: gs[j] };
      let t = tTyped + T.backspace;
      for (let k = 1; k <= nOld; k++) {
        const j = typed.length - k; // the glyph removed at this step
        tl.set(msg, { clipPath: j > 0 ? kit.clipTo(typed[j - 1]) : kit.hiddenClip }, t);
        const e = leftEdge(typed, j);
        caretAt(e.x, e.g, t);
        t += T.backspaceStep;
      }
      // swap the run to its corrected state (same text up to here; the new word is red)
      t += T.swapAfter - T.backspaceStep;
      tl.set(fixOld, { display: "none" }, t);
      tl.set(fixNew, { display: "inline" }, t);
      tl.set(msg, { clipPath: kit.clipTo(corrected[nText - 1]) }, t);
      t += T.retypeAfter;
      for (let k = 0; k < nNew; k++) {
        const g = corrected[nText + k];
        tl.set(msg, { clipPath: kit.clipTo(g) }, t);
        caretAt(g.right + 1, g, t);
        t += T.retypeStep;
      }
      const tRetyped = t - T.retypeStep; // the last letter's moment
      // the member's caret leaves the field as they reach for Send
      tl.set(caret.el, { opacity: 0 }, tRetyped + T.caretOff);
      tl.set(msg, { clipPath: "none" }, tRetyped + T.caretOff + 0.01);
      tl.addLabel("f4", tRetyped + T.caretOff + 0.02);
      const tSend = tRetyped + T.sendAfter;
      tl.to(
        send,
        {
          keyframes: [
            { scale: 0.96, duration: 0.09, ease: "power2.out" },
            { scale: 1, duration: 0.3, ease: "back.out(2)" },
          ],
        },
        tSend,
      );
      const tSent = tSend + T.sentAfter;
      tl.to(ebDraft, { y: -6, opacity: 0, duration: 0.18, ease: "power2.in" }, tSent);
      tl.fromTo(
        ebSent,
        { y: 6, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)", immediateRender: false },
        tSent + 0.06,
      );

      /* — frame 5 · zoom out to more accounts: the card hands over to the account's card, the
         camera pulls back to the artboard (the end picture = the server markup) — */
      const tZoom = tSent + 0.06 + T.zoomAfter;
      tl.to(convo, { scale: 0.85, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, tZoom);
      tl.to(world, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, tZoom);
      tl.to(cam, { scale: 1, duration: T.zoom, ease: "power3.inOut" }, tZoom);
      tl.addLabel("f5", tZoom + T.zoom);
      tl.to({}, { duration: 0.001 }, tZoom + T.zoom);
    },
  };
}
