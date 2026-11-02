import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { skHideRise, skQuery, skRise } from "./lp-story-kit";

/**
 * Deep-dive story 4, "Codex at work" (the item "Built for Claude and Codex"; 2026-11-01) — its
 * build-up as ONE paused, seek-safe GSAP timeline on the stage root. Owner: story-mcp package.
 * Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts it), sets
 * and tweens only (no callbacks, no randomness), progress(1) = the server markup (LpStoryMcp.tsx),
 * `cue` = the first composed scene. Reached only through DIVE_LOADERS.mcp (lp-dive-loaders.ts,
 * lazy chunk).
 *
 * No "use client" on purpose (2026-10-09): Next makes every "use client" module a server graph
 * reaches, even through an import(), an EAGER client entry. It imports GSAP and the story kit
 * (lp-story-kit.ts) only; the typing helpers below are COPIED from the homepage demo's timeline
 * (lp-demo-pancake-timeline.ts measureGlyphs / clipTo / HIDDEN_CLIP / STEP), never imported.
 *
 * Founder, 2026-11-01, on the diagram this replaces: "Maybe we could just do a screenshot of codex
 * doing stuff like in the h1... there's already too many of those schemas with arrows". So the
 * story is Codex's window doing one job, the homepage demo's Codex view told shorter: the ask
 * types in the composer, it is sent, Pancake's three steps tick in one after the other, and Codex
 * answers with the Play. The dive's motion rules hold (founder 2026-10-30): nothing grows past its
 * size and comes back ("j aime pas trop les effets de bounce"), nothing travels along the picture
 * ("pas sur des signaux qui voyagent"); it plays once and rests on the END. Times (s):
 *
 *   0.00       cue = f1: Codex's window, its name, its home line, the composer's placeholder
 *   0.30–1.34  the ask types in the composer (28 ms a glyph: a clip-path staircase on the real
 *              text, never a span a glyph), the caret stepping after it; the send darkens
 *                                                               → f2 at 1.00: typing
 *   1.70       sent: the composer empties to its follow-up placeholder, the home line fades and
 *              the ask rises into the thread as its bubble (1.72–2.07)
 *   2.00–3.10  Pancake's steps, one every 0.4 s: each rises in running ("Reading…",
 *              "Searching…", "Building…") and turns "Done" 0.3 s later
 *                                                               → f3 at 2.20: the first step
 *                                                               → f4 at 3.00: two done
 *   3.25–3.60  Codex's answer line rises in
 *   3.40–3.81  the Play's card rises in, its name and its two rows
 *   3.90       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Phones (≤767, story-mcp.css): no composer and no answer line in the window (its type is ×1.45
 * there, for the stack's ×0.47). The ask's bubble rises in as the home line goes (0.10–0.45) and
 * the ask types in it (0.30–1.34); the steps and the Play keep their times. The builder reads
 * which on the layout it builds on (the composer's display); crossing 767 rebuilds it (the dive
 * swaps its drivers there).
 *
 * Nothing moves by GSAP's own transform: the pieces rise by the kit's --lp-sk-rise (skRise, power3
 * out, let go after it lands), the ask types by clip-path, the caret steps by `left`; everything
 * else is opacity. Nothing loops (the demo's caret blink is not copied), nothing overshoots.
 */

/** the take, in seconds (see the table above) */
const T = {
  /** the window at home: the cue */
  f1: 0,
  /** the ask starts typing */
  type: 0.3,
  f2: 1.0,
  /** the ask is sent */
  send: 1.7,
  /** the first step rises in */
  steps: 2.0,
  f3: 2.2,
  f4: 3.0,
  /** Codex's answer, then the Play */
  say: 3.25,
  play: 3.4,
  /** the END: the take's length (the card lets go at 3.81 and holds) */
  end: 3.9,
} as const;
/** typing: one glyph every 28 ms; the typed ask clips to its full text 0.08 s after the last */
const DT = 0.028;
/** phones: the bubble rises in this long before its ask types */
const PHONE_LEAD = 0.2;
/** a step every 0.4 s; it runs 0.3 s, then turns "Done" */
const STEP_GAP = 0.4;
const STEP_RUN = 0.3;
/** the pieces rise from 6 px (the bubble, a step, the answer) or 8 px (the card), 0.3–0.4 s */
const RISE = { y: 6, card: 8, bubble: 0.35, step: 0.3, say: 0.35, play: 0.4 } as const;

/* ── typing helpers, COPIED from lp-demo-pancake-timeline.ts (first written for the deep dive's
   Claude story, removed with its story on 2026-10-28) ── */
type Glyph = { right: number; top: number; bottom: number };
/** each glyph's right edge and line box, in the element's own unscaled px (Range rects) */
function measureGlyphs(el: HTMLElement): Glyph[] {
  const box = el.getBoundingClientRect();
  const s = el.offsetWidth ? box.width / el.offsetWidth : 1; // the stage's scale, the phone fit
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
      glyphs.push({ right: (r.right - box.left) / s, top: (r.top - box.top) / s, bottom: (r.bottom - box.top) / s });
    }
  }
  return glyphs;
}
const HIDDEN_CLIP = "polygon(0 0, 0 0, 0 0, 0 0, 0 0, 0 0)";
const clipTo = (g: Glyph) =>
  `polygon(0 0, 100% 0, 100% ${g.top}px, ${g.right}px ${g.top}px, ${g.right}px ${g.bottom}px, 0 ${g.bottom}px)`;
/** an "instant" step: 1 ms (a tween, so gsap.context reverts it in time order) */
const STEP = 0.001;

/** The builder in one go. In slices: `buildStoryMcpSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: what
    it reads (the composer's display, the ask's glyphs) it reads before its first write, its
    frame-0 sets are written at once, and its tweens write nothing until they are rendered. */
export function buildStoryMcp(root: HTMLElement): BuiltStory {
  const steps = buildStoryMcpSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryMcpSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "mcp");

  const greet = $(".lp-smcp-greet");
  const ph = $(".lp-smcp-ph");
  const typed = $(".lp-smcp-typed");
  const reply = $(".lp-smcp-reply");
  const caret = $(".lp-smcp-caret");
  const send = $(".lp-smcp-send");
  const bubble = $(".lp-smcp-bubble");
  const steps = $$(".lp-smcp-step").map((li) => ({
    li,
    doing: li.querySelector<HTMLElement>(".lp-smcp-doing")!,
    done: li.querySelector<HTMLElement>(".lp-smcp-done")!,
  }));
  const say = $(".lp-smcp-say");
  const play = $(".lp-smcp-play");
  const bar = $(".lp-smcp-bar");
  const bubbleText = $(".lp-smcp-bubble-t");

  // the ask types in the composer, or, where the window docks none (phones), in its bubble; its
  // glyphs on the rest layout (the typed line is laid out, hidden)
  const inBar = getComputedStyle(bar).display !== "none";
  const glyphs = measureGlyphs(inBar ? typed : bubbleText);
  yield;

  /* ── frame 0 (the markup rests on the END): Codex at home. The home line and the first
     placeholder show; the ask is laid out in the composer, clipped to nothing; the thread
     waits below its places, unseen; each step will run before it is done ── */
  gsap.set(greet, { autoAlpha: 1 });
  if (inBar) {
    gsap.set(ph, { autoAlpha: 1 });
    gsap.set(reply, { autoAlpha: 0 });
    gsap.set(typed, { autoAlpha: 1, clipPath: HIDDEN_CLIP });
  } else {
    gsap.set(bubbleText, { clipPath: HIDDEN_CLIP });
  }
  skHideRise([bubble, ...steps.map((s) => s.li), say], RISE.y);
  skHideRise(play, RISE.card);
  steps.forEach((s) => {
    gsap.set(s.doing, { autoAlpha: 1 });
    gsap.set(s.done, { autoAlpha: 0 });
  });
  yield;

  const tl = gsap.timeline({ paused: true });
  const step = (targets: gsap.TweenTarget, vars: gsap.TweenVars, t: number) =>
    tl.to(targets, { ...vars, duration: STEP, ease: "none" }, t);

  const typedAt = T.type + Math.max(glyphs.length - 1, 0) * DT;
  if (inBar) {
    /* ── 1 · the ask types in the composer: the placeholder goes, the caret steps after each
       glyph, the send darkens ── */
    step(ph, { autoAlpha: 0 }, T.type - STEP);
    step(caret, { autoAlpha: 1 }, T.type - STEP);
    tl.to(send, { opacity: 1, duration: 0.2, ease: "power2.out" }, T.type);
    glyphs.forEach((g, i) => {
      const t = T.type + i * DT;
      step(typed, { clipPath: clipTo(g) }, t);
      step(caret, { left: g.right + 1 }, t);
    });
    step(typed, { clipPath: "none" }, typedAt + 0.08);

    /* ── 2 · sent: the composer empties to its follow-up placeholder, the home line goes, the
       ask rises into the thread ── */
    step(caret, { autoAlpha: 0 }, T.send);
    tl.to(typed, { autoAlpha: 0, duration: 0.12, ease: "power1.in" }, T.send);
    tl.to(send, { opacity: 0.45, duration: 0.2, ease: "power1.out" }, T.send);
    tl.to(greet, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, T.send);
    tl.to(reply, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, T.send + 0.1);
    skRise(tl, bubble, T.send + 0.02, RISE.bubble);
  } else {
    /* ── 1–2 · phones: the bubble rises in as the home line goes, and the ask types in it ── */
    tl.to(greet, { autoAlpha: 0, duration: 0.2, ease: "power1.in" }, T.type - PHONE_LEAD);
    skRise(tl, bubble, T.type - PHONE_LEAD, RISE.bubble);
    glyphs.forEach((g, i) => step(bubbleText, { clipPath: clipTo(g) }, T.type + i * DT));
    step(bubbleText, { clipPath: "none" }, typedAt + 0.08);
  }

  /* ── 3 · Pancake's steps, one after the other: each rises in running, then turns "Done" ── */
  steps.forEach((s, k) => {
    const at = T.steps + STEP_GAP * k;
    skRise(tl, s.li, at, RISE.step);
    tl.to(s.doing, { autoAlpha: 0, duration: 0.1, ease: "power1.in" }, at + STEP_RUN);
    tl.to(s.done, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, at + STEP_RUN + 0.05);
  });

  /* ── 4 · Codex answers with the Play ── */
  skRise(tl, say, T.say, RISE.say);
  skRise(tl, play, T.play, RISE.play);

  // the END holds to the take's length (a set on nothing, as the steps' timelines hold theirs)
  tl.set({}, {}, T.end);

  /* QA labels = the beats' composed pictures (the shell's pose() and the harness seek them) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
