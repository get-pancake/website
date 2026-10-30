import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  SK_LANDED,
  SK_PULSE_LEN,
  SK_PULSE_OUT,
  skBump,
  skHidePop,
  skHidePulse,
  skHideR,
  skHideRise,
  skHideWire,
  skPop,
  skPulse,
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
 * (lp-story-kit.ts) only: the verbs are the kit's (a disc pops, a wire draws, a pulse rides a
 * wire, a dot takes a bump, a label rises), plus plain tweens on an SVG attribute (the eyes' `d`),
 * on opacity and on two CSS variables (the kit's --lp-sk-pop, the lockup's --lp-smcp-pop).
 *
 * Founder, on the four blocks: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)"; on a still opening: "this is not motion like
 * it's plain text"; on a big kicker over a big value: "no UI should not mean text it should mean
 * abstraction of what our infrastructure does". Then, 2026-10-30: make the four stories juicier,
 * graphic and simple, with a moment that moves the reader; on this block "the claude and codex
 * part can be very much 10xed"; and "the 4 blocks of the deep dive are the right ones but i am
 * looking for ideas to improve motions": the picture and its END stay as they were, the motion
 * becomes a live system. The patterns: the marble run (a packet rides a tube from machine to
 * machine and each machine sets off the next), status lights switching on in sequence, an
 * agent's thinking beat
 * before its answer lands; and the craft: quick, quick, then hold the climax before the release;
 * follow-through (neighbours settle a beat after); what is not acting steps back.
 *
 * The story, one chain reaction: both agents come online and ask at once, a pulse riding in on
 * each wire behind its drawing tip; Pancake takes it in (its mascot blinks once as the first
 * request lands: the brand's own character, the one emotional beat; "Thinking…" under the lockup
 * while both are in; the climax holds); then it lets go (the lockup pops, six wires shoot out of
 * it top to bottom, a pulse behind each tip, each tool's stop switching on with its bump as its
 * pulse arrives, while the agents step back); "About 100 tools" rises; the answers ride home to
 * both agents, each waking as its answer lands; and a second, faster exchange starts over the
 * first one's end before it all settles on the END. Times (s):
 *
 *   0.00       cue = f1: the Pancake lockup in its END place, alone; never an empty frame
 *   0.30–0.75  Claude's disc pops; its name rises (0.40–0.80); its wire draws 0.40–1.00
 *   0.52–1.10  its request: a pulse rides in behind the drawing tip (at the lockup ≈ 0.99)
 *   0.55–1.00  Codex's disc pops; its name rises (0.65–1.05); its wire draws 0.65–1.15
 *   0.78–1.24  its request, quicker (at the lockup ≈ 1.15): two pulses ride at once
 *   1.10–1.37  Claude's request is in: the mascot blinks (shut 0.07 s, held 0.05 s, open 0.15 s)
 *                                                               → f2 at 1.19: the eyes shut
 *   1.24–1.54  Codex's is in: "Thinking…" rises under the lockup; the climax holds
 *                                                               → f3 at 1.56: the held beat
 *   1.60–2.11  the release: the lockup pops (×1.06, 0.12 s up, 0.38 s down), then lets go
 *   1.62–2.27  the fan: six wires shoot out top to bottom 0.06 s apart (0.32 s each), a pulse
 *              0.05 s behind each tip (0.30 s); each stop switches on with its bump (×1.35) as
 *              its pulse arrives, ≈ 1.92 1.97 2.03 2.09 2.15 2.22, settling by 2.68
 *                                                               → f4 at 2.06: mid-cascade
 *   1.62–1.92  the agents step back to 0.5 (discs, names, wires)
 *   1.92–2.12  "Thinking…" fades as the first stop lights
 *   2.22–2.62  "About 100 tools" rises as the last stop lights
 *   2.32–2.77  the answer to Claude rides home; its wire wakes as it leaves (2.32–2.62), its
 *              disc and name as it nears (2.48–2.68); the disc takes a tiny pop as it lands
 *              (≈ 2.68, ×1.06, let go 3.09)
 *   2.42–2.82  the answer to Codex, the same (wire 2.42–2.72, disc 2.54–2.74, pop ≈ 2.74)
 *   2.86–3.24  the second exchange, quicker: Claude asks again as its answer is home (in
 *              ≈ 3.10), Codex 0.1 s after (in ≈ 3.19)
 *   3.22–3.63  the lockup's small pop (×1.035) as both are in
 *   3.26–4.08  the tools' second wave: a pulse to each stop 0.04 s apart (0.22 s), each stop
 *              bumps (×1.22) as its pulse goes under it, ≈ 3.42 … 3.62
 *   3.64–4.36  the answers home again (0.30 s, 0.28 s), each disc's tiny pop (≈ 3.88, ≈ 3.95)
 *   4.50       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Nothing moves by GSAP's own transform. The discs pop and take their tiny pop by the kit's
 * --lp-sk-pop, the lockup by --lp-smcp-pop (story-mcp.css), the names and the labels rise by
 * --lp-sk-rise, each let go SK_LANDED after it lands by a 1 ms tween; the stops grow and bump by
 * their `r` attribute (skBump: from r 0 the first time, which is their landing), the eyes shut by
 * their `d` attribute (shutEye below). A pop only ever grows (never under 1): a disc's or the
 * lockup's edge is where a wire meets it, and a smaller node would open a gap there (no dot on an
 * edge, founder 2026-10-28: "ca fait un peu vibe coded"; so no dip before a pop either: the held
 * beat is the anticipation). Every pulse hides when it lands (skPulse) and every step-back is
 * back to 1 by 2.74, so the END is the markup. Nothing loops, glows or rings; no will-change; the
 * root's opacity is never tweened. The lockup never moves but for its two pops.
 */

/** the take, in seconds (see the table above); the arrivals (≈) are computed from each wire's
    length (ride below) */
const T = {
  /** Pancake alone: the cue */
  f1: 0,
  /** Claude's disc pops; its name rises and its wire draws 0.1 s later; its request leaves
      behind the drawing tip */
  claude: 0.3,
  claudeAsk: 0.52,
  /** Codex, 0.25 s later and quicker: both requests ride at once */
  codex: 0.55,
  codexAsk: 0.78,
  /** Claude's request is in (its pulse's end, 0.52 + 0.58): the blink */
  blink: 1.1,
  /** the eyes shut, Codex's request still riding in */
  f2: 1.19,
  /** Codex's is in (0.78 + 0.46): "Thinking…" rises; the climax holds */
  think: 1.24,
  f3: 1.56,
  /** the release: the lockup pops; the fan fires 0.02 s later and the agents step back */
  release: 1.6,
  fan: 1.62,
  /** two stops on, the lower pulses still riding */
  f4: 2.06,
  /** the answers leave Pancake, Claude's first */
  claudeAnswer: 2.32,
  codexAnswer: 2.42,
  /** the second exchange: each agent asks again as its answer is home */
  claudeAgain: 2.86,
  codexAgain: 2.96,
  /** both are in: the lockup's small pop, then the tools' second wave */
  again: 3.22,
  wave: 3.26,
  /** the answers home again */
  claudeAnswer2: 3.64,
  codexAnswer2: 3.72,
  /** the END: the take's length (the last disc lets go at ≈ 4.36 and holds) */
  end: 4.5,
} as const;
/** how long a wire draws, s: Claude's the kit's 0.6, Codex's quicker; the fan's short ones 0.32,
    0.06 s apart top to bottom, each pulse leaving 0.05 s after its wire (behind its tip, never
    ahead of it); the second wave's pulses 0.04 s apart */
const DRAW = { afterPop: 0.1, claude: 0.6, codex: 0.5, fan: 0.32, fanGap: 0.06, fanLag: 0.05, waveGap: 0.04 } as const;
/** how long a pulse rides, s: the first requests behind their drawing tips, a fan pulse behind
    its tip, the answers home; the second exchange's quicker */
const RIDE = {
  claudeAsk: 0.58,
  codexAsk: 0.46,
  fan: 0.3,
  claudeAnswer: 0.45,
  codexAnswer: 0.4,
  claudeAgain: 0.3,
  codexAgain: 0.28,
  wave: 0.22,
  claudeAnswer2: 0.3,
  codexAnswer2: 0.28,
} as const;
/** a name or a label rises from 8 px below its place in 0.4 s (the kit's skRise, as the signals
    story's count label); "Thinking…" from 5 px in 0.3 s, and fades in 0.2 s */
const RISE = { y: 8, duration: 0.4, afterPop: 0.1, thinkY: 5, think: 0.3, thinkFade: 0.2 } as const;
/** the blink: the eyes shut in 0.07 s, stay shut 0.05 s, open in 0.15 s. Shut, an eye is its own
    path pressed to `shut` of its height onto a lid line `line` of the way down it (the upper lid
    travels further) */
const BLINK = { close: 0.07, hold: 0.05, open: 0.15, shut: 0.14, line: 0.6 } as const;
/** a pop by a CSS variable: up to its peak, back to 1, never under it. The release ×1.06 in
    0.12 s + 0.38 s; the second exchange's ×1.035 and a disc's as its answer lands ×1.06, in
    0.1 s + 0.3 s */
const POP = { release: 1.06, releaseUp: 0.12, releaseDown: 0.38, again: 1.035, disc: 1.06, up: 0.1, down: 0.3 } as const;
/** a stop's bump (the kit's skBump): ×1.35 as it switches on from r 0, ×1.22 on the second wave;
    a pulse goes under a lit stop at its edge plus the dash's round cap (story-kit.css, 4 px) */
const BUMP = { on: 1.35, wave: 1.22, cap: 2 } as const;
/** staging: the agents step back to 0.5 in 0.3 s while the tools fire; each wire wakes in 0.3 s
    as its answer leaves, each disc and name in 0.2 s, reaching full as the answer lands */
const STAGE = { dim: 0.5, fade: 0.3, wake: 0.2 } as const;

/** how far past its path's ends the kit runs a pulse, stage px (the kit's), for the arrival
    times that ride below derives */
const PULSE_OUT = SK_PULSE_OUT;

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
    only things it reads after its first write (the wires' and pulses' lengths) depend on nothing
    it writes. */
export function buildStoryMcp(root: HTMLElement): BuiltStory {
  const steps = buildStoryMcpSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryMcpSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "mcp");

  // an agent's disc, wire, pulse and name share its data-node (LpStoryMcp)
  const agent = (id: "claude" | "codex") => ({
    disc: $(`.lp-sk-disc[data-node="${id}"]`),
    wire: $<SVGPathElement>(`.lp-sk-wires g[data-node="${id}"] > path:not(.lp-sk-pulse)`),
    pulse: $<SVGPathElement>(`.lp-sk-wires g[data-node="${id}"] > .lp-sk-pulse`),
    name: $(`.lp-sk-name[data-node="${id}"]`),
  });
  const claude = agent("claude");
  const codex = agent("codex");
  // the fan, in reveal order (data-order 0…n−1, the data's order: top to bottom)
  const count = $$(".lp-sk-wires g[data-order]").length;
  const fan = Array.from({ length: count }, (_, k) => {
    const g = `.lp-sk-wires g[data-order="${k}"]`;
    const stop = $<SVGCircleElement>(`.lp-smcp-stop[data-order="${k}"]`);
    return {
      wire: $<SVGPathElement>(`${g} > path:not(.lp-sk-pulse)`),
      pulse: $<SVGPathElement>(`${g} > .lp-sk-pulse`),
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
  // the wires first: each reads its length before it is dashed away (opacity 0 until it draws);
  // then the pulses, each hidden with its run's length for the verb
  [claude.wire, codex.wire, ...fan.map((f) => f.wire)].forEach(skHideWire);
  const run = new Map<SVGPathElement, number>();
  [claude.pulse, codex.pulse, ...fan.map((f) => f.pulse)].forEach((p) => run.set(p, skHidePulse(p)));
  yield;
  // the discs wait small and unseen, the names and the labels below their places, unseen
  // ("Thinking…" also rests hidden: story-mcp.css); the stops at r 0
  skHidePop([claude.disc, codex.disc]);
  skHideRise([claude.name, codex.name, label], RISE.y);
  skHideRise(thinking, RISE.thinkY);
  skHideR(fan.map((f) => f.stop));
  yield;

  const tl = gsap.timeline({ paused: true });

  /** A pulse rides its wire from `at` for `d` s (back to the wire's start with `home`); returns
      when its head is `short` px from the end of its run. The kit's skPulse moves the dash from
      PULSE_OUT px before the path's start to PULSE_OUT px past its end, len + SK_PULSE_LEN +
      2 × PULSE_OUT in all, by power1.inOut: this inverts that ease (pure arithmetic on the
      measured length, so the take stays deterministic) */
  const ride = (pulse: SVGPathElement, at: number, d: number, home = false, short = 0): number => {
    const len = run.get(pulse) ?? 0;
    skPulse(tl, pulse, len, at, d, home);
    const v = (len + PULSE_OUT - short) / (len + SK_PULSE_LEN + 2 * PULSE_OUT);
    return at + d * (v < 0.5 ? Math.sqrt(v / 2) : 1 - Math.sqrt((1 - v) / 2));
  };
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

  /* ── 1. the agents come online and ask at once: each disc pops, its name rises, its wire draws
     in and its request rides in behind the drawing tip ── */
  skPop(tl, claude.disc, T.claude);
  skRise(tl, claude.name, T.claude + RISE.afterPop, RISE.duration);
  skWire(tl, claude.wire, T.claude + DRAW.afterPop, DRAW.claude);
  ride(claude.pulse, T.claudeAsk, RIDE.claudeAsk);
  skPop(tl, codex.disc, T.codex);
  skRise(tl, codex.name, T.codex + RISE.afterPop, RISE.duration);
  skWire(tl, codex.wire, T.codex + DRAW.afterPop, DRAW.codex);
  ride(codex.pulse, T.codexAsk, RIDE.codexAsk);

  /* ── 2. Pancake takes it in: its mascot blinks as Claude's request lands (the eyes' own paths,
     shut and open again), "Thinking…" rises as Codex's does, and the climax holds ── */
  eyes.forEach(({ eye, open, shut }) => {
    tl.fromTo(eye, { attr: { d: open } }, { attr: { d: shut }, duration: BLINK.close, ease: "power2.in", immediateRender: false }, T.blink);
    tl.fromTo(
      eye,
      { attr: { d: shut } },
      { attr: { d: open }, duration: BLINK.open, ease: "power2.out", immediateRender: false },
      T.blink + BLINK.close + BLINK.hold,
    );
  });
  skRise(tl, thinking, T.think, RISE.think);

  /* ── 3. the release: the lockup pops, its six wires shoot out top to bottom with a pulse behind
     each tip, each stop switches on with its bump as its pulse arrives, and the agents step back.
     "Thinking…" fades as the first stop lights; "About 100 tools" rises as the last one does ── */
  pop(brand, "--lp-smcp-pop", T.release, POP.release, POP.releaseUp, POP.releaseDown);
  fade([claude.disc, claude.name, claude.wire, codex.disc, codex.name, codex.wire], 1, STAGE.dim, T.fan, STAGE.fade);
  fan.forEach(({ wire, pulse, stop, r }, k) => {
    const at = T.fan + DRAW.fanGap * k;
    skWire(tl, wire, at, DRAW.fan);
    const lands = ride(pulse, at + DRAW.fanLag, RIDE.fan);
    skBump(tl, stop, r, lands, BUMP.on);
    if (k === 0) tl.to(thinking, { autoAlpha: 0, duration: RISE.thinkFade, ease: "power1.in" }, lands);
    if (k === fan.length - 1) skRise(tl, label, lands, RISE.duration);
  });

  /* ── 4. the answers ride home: an agent's wire wakes as its answer leaves Pancake, its disc and
     name as the answer nears, and the disc takes a tiny pop as it lands ── */
  const answer = (a: typeof claude, at: number, d: number) => {
    fade([a.wire], STAGE.dim, 1, at, STAGE.fade);
    const lands = ride(a.pulse, at, d, true);
    fade([a.disc, a.name], STAGE.dim, 1, lands - STAGE.wake, STAGE.wake);
    pop(a.disc, "--lp-sk-pop", lands, POP.disc);
  };
  answer(claude, T.claudeAnswer, RIDE.claudeAnswer);
  answer(codex, T.codexAnswer, RIDE.codexAnswer);

  /* ── 5. the second exchange, quicker, over the first one's end: each agent asks again as its
     answer is home, the lockup pops a little as both are in, a second wave runs over the lit
     stops (each bumps as its pulse goes under it), and the answers ride home again ── */
  ride(claude.pulse, T.claudeAgain, RIDE.claudeAgain);
  ride(codex.pulse, T.codexAgain, RIDE.codexAgain);
  pop(brand, "--lp-smcp-pop", T.again, POP.again);
  fan.forEach(({ pulse, stop, r }, k) => {
    skBump(tl, stop, r, ride(pulse, T.wave + DRAW.waveGap * k, RIDE.wave, false, r + BUMP.cap), BUMP.wave);
  });
  pop(claude.disc, "--lp-sk-pop", ride(claude.pulse, T.claudeAnswer2, RIDE.claudeAnswer2, true), POP.disc);
  pop(codex.disc, "--lp-sk-pop", ride(codex.pulse, T.codexAnswer2, RIDE.codexAnswer2, true), POP.disc);

  // the END holds to the take's length (a set on nothing, as the steps' timelines hold theirs)
  tl.set({}, {}, T.end);

  /* QA labels = the beats' composed pictures (the shell's pose() and the harness seek them) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
