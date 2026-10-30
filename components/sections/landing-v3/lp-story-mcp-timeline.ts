import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  SK_LANDED,
  skBump,
  skHidePop,
  skHideR,
  skHideRise,
  skHideWire,
  skPop,
  skQuery,
  skRise,
  skWire,
} from "./lp-story-kit";

/**
 * Deep-dive story "Built for Claude and Codex" (block 4, the founder's "mcp first", 2026-10-28)
 * — its build-up as ONE paused, seek-safe GSAP timeline on the stage root. Owner: story-mcp
 * package. Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's gsap.context reverts
 * it), sets and tweens only (no callbacks, no randomness), progress(1) = the server markup
 * (LpStoryMcp.tsx), `cue` = the first composed scene. Reached only through DIVE_LOADERS.mcp
 * (lp-dive-loaders.ts, lazy chunk).
 *
 * No "use client" on purpose (2026-10-09): Next makes every "use client" module a server graph
 * reaches, even through an import(), an EAGER client entry. It imports GSAP and the story kit
 * (lp-story-kit.ts) only: the verbs are the kit's (a disc pops, a wire draws, a dot takes a bump,
 * a label rises), plus plain tweens on an SVG attribute (the eyes' `d`), on opacity and on two
 * CSS variables (the kit's --lp-sk-pop, the lockup's --lp-smcp-pop).
 *
 * Founder, on the four blocks: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)"; on a still opening: "this is not motion like
 * it's plain text"; on a big kicker over a big value: "no UI should not mean text it should mean
 * abstraction of what our infrastructure does". Then, 2026-10-30: make the four stories juicier,
 * graphic and simple, with a moment that moves the reader; on this block "the claude and codex
 * part can be very much 10xed"; and "the 4 blocks of the deep dive are the right ones but i am
 * looking for ideas to improve motions": the picture and its END stay as they were. The same
 * evening, on short dashes riding the wires: "pas sur des signaux qui voyagent ca fait un peu
 * sloppy", so nothing travels but a wire drawing itself the first time, and a node reacts as a
 * wire's drawing tip reaches it. The craft: quick, quick, then hold the climax before the
 * release; stops switching on in sequence; follow-through (neighbours settle a beat after); what
 * is not acting steps back.
 *
 * The story, one chain reaction: both agents come online and wire into Pancake; Pancake takes
 * them in (its mascot blinks once as Claude's wire lands: the brand's own character, the one
 * emotional beat; "Thinking…" under the lockup as Codex's lands; the climax holds); then it lets
 * go (the lockup pops, six wires shoot out of it top to bottom and each tool's stop lands with
 * its bump as its wire's tip arrives, while the agents step back); "About 100 tools" rises; and
 * the agents wake one after the other, the answer received, before it all settles on the END.
 * Times (s):
 *
 *   0.00       cue = f1: the Pancake lockup in its END place, alone; never an empty frame
 *   0.30–0.75  Claude's disc pops; its name rises (0.40–0.80); its wire draws in 0.40–1.00
 *   0.55–1.00  Codex's disc pops; its name rises (0.65–1.05); its wire draws in 0.65–1.15
 *   1.00–1.27  Claude's wire lands: the mascot blinks (shut 0.07 s, held 0.05 s, open 0.15 s)
 *                                                               → f2 at 1.09: the eyes shut
 *   1.15–1.45  Codex's lands: "Thinking…" rises under the lockup; the climax holds
 *                                                               → f3 at 1.46: the held beat
 *   1.50–2.01  the release: the lockup pops (×1.06, 0.12 s up, 0.38 s down), then lets go
 *   1.52–2.14  the fan: six wires shoot out top to bottom 0.06 s apart (0.32 s each); each stop
 *              lands with its bump (×1.35, from r 0) as its wire's tip arrives: 1.84 1.90 1.96
 *              2.02 2.08 2.14, settling by 2.60                   → f4 at 1.96: mid-cascade
 *   1.52–1.82  the agents step back to 0.5 (discs, names, wires)
 *   1.84–2.04  "Thinking…" fades as the first stop lands
 *   2.14–2.54  "About 100 tools" rises as the last one does
 *   2.30–2.71  Claude wakes, the answer received: its wire, disc and name back to full (0.25 s),
 *              its disc's tiny pop (×1.06, 0.1 s up, 0.3 s down, let go 2.71)
 *   2.42–2.83  Codex wakes, the same (let go 2.83)
 *   3.00       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Nothing moves by GSAP's own transform. The discs pop and take their tiny pop by the kit's
 * --lp-sk-pop, the lockup by --lp-smcp-pop (story-mcp.css), the names and the labels rise by
 * --lp-sk-rise, each let go SK_LANDED after it lands by a 1 ms tween; the stops land and bump by
 * their `r` attribute (skBump from r 0: their landing), the eyes shut by their `d` attribute
 * (shutEye below). A pop only ever grows (never under 1): a disc's or the lockup's edge is where a
 * wire meets it, and a smaller node would open a gap there (no dot on an edge, founder
 * 2026-10-28: "ca fait un peu vibe coded"; so no dip before a pop either: the held beat is the
 * anticipation). Every step-back is back to 1 by 2.67, so the END is the markup. Nothing loops,
 * glows or rings; no will-change; the root's opacity is never tweened. The lockup never moves
 * but for its pop.
 */

/** the take, in seconds (see the table above). The blink, "Thinking…" and each stop's landing are
    not here: each comes as a wire's draw ends (the builder adds them from DRAW) */
const T = {
  /** Pancake alone: the cue */
  f1: 0,
  /** Claude's disc pops; its name rises and its wire draws 0.1 s later */
  claude: 0.3,
  /** Codex, 0.25 s later, its wire quicker */
  codex: 0.55,
  /** the eyes shut (Claude's wire landed at 1.00) */
  f2: 1.09,
  /** the held beat: both wired in, "Thinking…" up (Codex's wire landed at 1.15) */
  f3: 1.46,
  /** the release, 0.35 s after Codex's wire lands: the lockup pops; the fan fires 0.02 s later
      and the agents step back */
  release: 1.5,
  fan: 1.52,
  /** three stops in, three wires still drawing */
  f4: 1.96,
  /** the agents wake one after the other, the answer received (the last stop landed at 2.14) */
  claudeWakes: 2.3,
  codexWakes: 2.42,
  /** the END: the take's length (Codex's disc lets go at 2.83 and holds) */
  end: 3.0,
} as const;
/** how long a wire draws, s: Claude's the kit's 0.6, Codex's quicker; the fan's short ones 0.32,
    0.06 s apart top to bottom */
const DRAW = { afterPop: 0.1, claude: 0.6, codex: 0.5, fan: 0.32, fanGap: 0.06 } as const;
/** a name or a label rises from 8 px below its place in 0.4 s (the kit's skRise, as the signals
    story's count label); "Thinking…" from 5 px in 0.3 s, and fades in 0.2 s */
const RISE = { y: 8, duration: 0.4, afterPop: 0.1, thinkY: 5, think: 0.3, thinkFade: 0.2 } as const;
/** the blink: the eyes shut in 0.07 s, stay shut 0.05 s, open in 0.15 s. Shut, an eye is its own
    path pressed to `shut` of its height onto a lid line `line` of the way down it (the upper lid
    travels further) */
const BLINK = { close: 0.07, hold: 0.05, open: 0.15, shut: 0.14, line: 0.6 } as const;
/** a pop by a CSS variable: up to its peak, back to 1, never under it. The release ×1.06 in
    0.12 s + 0.38 s; a disc's as its agent wakes ×1.06, in 0.1 s + 0.3 s */
const POP = { release: 1.06, releaseUp: 0.12, releaseDown: 0.38, disc: 1.06, up: 0.1, down: 0.3 } as const;
/** a stop lands by the kit's skBump from r 0: ×1.35 (its default), then settles on its radius */
const BUMP = 1.35;
/** staging: the agents step back to 0.5 in 0.3 s while the tools fire, and wake back to full in
    0.25 s */
const STAGE = { dim: 0.5, fade: 0.3, wake: 0.25 } as const;

/** numbers in path data (the eyes: absolute coordinates, no exponent) */
const NUM = /-?\d*\.?\d+/g;
/** An eye shut: its own path with each y pressed to BLINK.shut of its distance from the lid line,
    BLINK.line of the way down the eye; each x kept. The art's eyes are M and C commands of
    absolute x y pairs closed by Z (lp-pancake-avatar-art.ts), so the numbers alternate x, y: the
    same commands and the same count of numbers, so GSAP tweens it number by number and writes
    the open path back verbatim at the tween's end */
function shutEye(d: string): string {
  const ys = (d.match(NUM) ?? []).map(Number).filter((_, i) => i % 2 === 1);
  const top = Math.min(...ys);
  const line = top + (Math.max(...ys) - top) * BLINK.line;
  let i = 0;
  return d.replace(NUM, (n) => {
    const y = i % 2 === 1;
    i += 1;
    return y ? String(Number((line + (Number(n) - line) * BLINK.shut).toFixed(4))) : n;
  });
}

/** The builder in one go. In slices: `buildStoryMcpSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and the
    only things it reads after its first write (the wires' lengths) depend on nothing it
    writes. */
export function buildStoryMcp(root: HTMLElement): BuiltStory {
  const steps = buildStoryMcpSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryMcpSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "mcp");

  // an agent's disc, wire and name share its data-node (LpStoryMcp)
  const agent = (id: "claude" | "codex") => ({
    disc: $(`.lp-sk-disc[data-node="${id}"]`),
    wire: $<SVGPathElement>(`.lp-sk-wires g[data-node="${id}"] > path`),
    name: $(`.lp-sk-name[data-node="${id}"]`),
  });
  const claude = agent("claude");
  const codex = agent("codex");
  // the fan, in reveal order (data-order 0…n−1, the data's order: top to bottom)
  const count = $$(".lp-sk-wires g[data-order]").length;
  const fan = Array.from({ length: count }, (_, k) => {
    const stop = $<SVGCircleElement>(`.lp-smcp-stop[data-order="${k}"]`);
    return {
      wire: $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] > path`),
      stop,
      // each stop lands on the markup's radius (the END picture's): read before frame 0 writes it
      r: Number(stop.getAttribute("r")),
    };
  });
  const brand = $(".lp-smcp-brand");
  // the mascot's two eyes (data-eye), each with its own path (the END's) and that path shut
  $(".lp-smcp-pk [data-eye]");
  const eyes = $$<SVGPathElement>(".lp-smcp-pk [data-eye]").map((eye) => {
    const open = eye.getAttribute("d") ?? "";
    return { eye, open, shut: shutEye(open) };
  });
  const label = $('.lp-sk-name[data-node="tools"]');
  const thinking = $('.lp-sk-name[data-node="thinking"]');

  /* ── frame 0 (the markup rests on the END picture). Each block leaves a composed picture, the
     END less what is hidden so far ── */
  // the wires first: each reads its length before it is dashed away (opacity 0 until it draws)
  [claude.wire, codex.wire, ...fan.map((f) => f.wire)].forEach(skHideWire);
  yield;
  // the discs wait small and unseen, the names and the labels below their places, unseen
  // ("Thinking…" also rests hidden: story-mcp.css); the stops at r 0
  skHidePop([claude.disc, codex.disc]);
  skHideRise([claude.name, codex.name, label], RISE.y);
  skHideRise(thinking, RISE.thinkY);
  skHideR(fan.map((f) => f.stop));
  yield;

  const tl = gsap.timeline({ paused: true });

  /** An HTML piece pops by a CSS variable (a disc's --lp-sk-pop, the lockup's --lp-smcp-pop): up
      to `peak` and back to 1, from explicit values (a variable the kit has let go reads empty),
      then let go SK_LANDED after it lands by a 1 ms tween, as the kit's skPop lets go (a tween,
      not a set: the revert order, lp-story-kit.ts skLetGo) */
  const pop = (el: Element, prop: string, at: number, peak: number, up: number = POP.up, down: number = POP.down) => {
    tl.fromTo(el, { [prop]: 1 }, { [prop]: peak, duration: up, ease: "power2.out", immediateRender: false }, at);
    tl.fromTo(el, { [prop]: peak }, { [prop]: 1, duration: down, ease: "power2.inOut", immediateRender: false }, at + up);
    tl.to(el, { [prop]: 1, clearProps: prop, duration: 0.001, ease: "none" }, at + up + down + SK_LANDED);
  };
  /** what steps back and comes back: opacity, between explicit values */
  const fade = (els: Element[], from: number, to: number, at: number, duration: number) =>
    tl.fromTo(els, { opacity: from }, { opacity: to, duration, ease: "power1.inOut", immediateRender: false }, at);

  /* ── 1. the agents come online: each disc pops, its name rises, its wire draws into the
     lockup's left edge. Each wire's tip reaches the lockup as its draw ends ── */
  skPop(tl, claude.disc, T.claude);
  skRise(tl, claude.name, T.claude + RISE.afterPop, RISE.duration);
  skWire(tl, claude.wire, T.claude + DRAW.afterPop, DRAW.claude);
  const claudeIn = T.claude + DRAW.afterPop + DRAW.claude;
  skPop(tl, codex.disc, T.codex);
  skRise(tl, codex.name, T.codex + RISE.afterPop, RISE.duration);
  skWire(tl, codex.wire, T.codex + DRAW.afterPop, DRAW.codex);
  const codexIn = T.codex + DRAW.afterPop + DRAW.codex;

  /* ── 2. Pancake takes them in: its mascot blinks as Claude's wire lands (the eyes' own paths,
     shut and open again), "Thinking…" rises as Codex's does, and the climax holds ── */
  eyes.forEach(({ eye, open, shut }) => {
    tl.fromTo(eye, { attr: { d: open } }, { attr: { d: shut }, duration: BLINK.close, ease: "power2.in", immediateRender: false }, claudeIn);
    tl.fromTo(
      eye,
      { attr: { d: shut } },
      { attr: { d: open }, duration: BLINK.open, ease: "power2.out", immediateRender: false },
      claudeIn + BLINK.close + BLINK.hold,
    );
  });
  skRise(tl, thinking, codexIn, RISE.think);

  /* ── 3. the release: the lockup pops, its six wires shoot out top to bottom, each stop lands
     with its bump as its wire's tip arrives, and the agents step back. "Thinking…" fades as the
     first stop lands; "About 100 tools" rises as the last one does ── */
  pop(brand, "--lp-smcp-pop", T.release, POP.release, POP.releaseUp, POP.releaseDown);
  fade([claude.disc, claude.name, claude.wire, codex.disc, codex.name, codex.wire], 1, STAGE.dim, T.fan, STAGE.fade);
  fan.forEach(({ wire, stop, r }, k) => {
    const at = T.fan + DRAW.fanGap * k;
    skWire(tl, wire, at, DRAW.fan);
    const lands = at + DRAW.fan;
    skBump(tl, stop, r, lands, BUMP);
    if (k === 0) tl.to(thinking, { autoAlpha: 0, duration: RISE.thinkFade, ease: "power1.in" }, lands);
    if (k === fan.length - 1) skRise(tl, label, lands, RISE.duration);
  });

  /* ── 4. the agents wake one after the other, the answer received: wire, disc and name back to
     full, the disc's tiny pop ── */
  const wake = (a: typeof claude, at: number) => {
    fade([a.wire, a.disc, a.name], STAGE.dim, 1, at, STAGE.wake);
    pop(a.disc, "--lp-sk-pop", at, POP.disc);
  };
  wake(claude, T.claudeWakes);
  wake(codex, T.codexWakes);

  // the END holds to the take's length (a set on nothing, as the steps' timelines hold theirs)
  tl.set({}, {}, T.end);

  /* QA labels = the beats' composed pictures (the shell's pose() and the harness seek them) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
