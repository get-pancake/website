import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skCap,
  skDot,
  skHidePop,
  skHideR,
  skHideRise,
  skHideWire,
  skPop,
  skQuery,
  skRise,
  skStop,
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
 * (lp-story-kit.ts) only: every verb below is the kit's, copied from the loved sources story's end
 * hub (a disc pops, a cap lands, a wire draws into the near-black dot, a flat dot lands, a label
 * rises).
 *
 * Founder, on the four blocks: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)"; on a still opening: "this is not motion like
 * it's plain text"; on a big kicker over a big value: "no UI should not mean text it should mean
 * abstraction of what our infrastructure does". So the story opens on Pancake alone and draws the
 * flow through it, left to right. Times (s), the T table below:
 *
 *   0.00       cue = f1: the Pancake lockup in its END place, alone; never an empty frame
 *   0.30–0.75  Claude's disc pops; its name rises (0.40–0.80)
 *   0.40–1.00  its cap lands, then its wire draws from the disc into the in-port
 *   0.90–1.15  the in-port lands as that wire arrives (its end − 0.1, the loved hub's timing)
 *                                    → f2 at 1.15: Claude wired in, Codex already on its way
 *   0.90–1.35  Codex's disc pops as Claude's wire lands; its name rises (1.00–1.40)
 *   1.00–1.60  its cap lands, then its wire draws into the same in-port         → f3 at 1.60
 *   1.80–1.95  the out-port, the fan's shared start (the near-black dot), lands on Pancake's right
 *              edge as a start cap does (skCap)
 *   1.80–2.60  the fan: six wires out of it, top to bottom 0.08 s apart, 0.40 s each; each stop
 *              lands as its wire arrives (its end − 0.1), the last at 2.50–2.85  → f4 at 2.85
 *   2.85–3.25  "About 100 tools" rises over the fan
 *   3.40       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Never moves: the lockup (no build, no nudge), the discs once they have popped, the stops once
 * they have landed. The direction is always the agents into Pancake, then Pancake out to its
 * tools. Nothing loops, glows or pulses; no will-change; the root's opacity is never tweened. The
 * discs pop and the names rise by the kit's variables, each let go SK_LANDED after it lands
 * (skPop, skRise); the caps, the ports and the stops grow by their `r` attribute, never a
 * transform (skCap, skDot, skStop).
 */

/** the take, in seconds (see the table above) */
const T = {
  /** Pancake alone: the cue */
  f1: 0,
  /** Claude's disc pops; its name rises, its cap lands and its wire starts 0.1 s later */
  claude: 0.3,
  claudeWire: 0.4,
  /** the in-port lands as Claude's wire arrives: 0.4 + 0.6 − 0.1 */
  inPort: 0.9,
  f2: 1.15,
  /** Codex, the same beats 0.6 s later */
  codex: 0.9,
  codexWire: 1.0,
  f3: 1.6,
  /** the fan: its start cap, then its six wires 0.08 s apart (top to bottom) */
  fan: 1.8,
  fanGap: 0.08,
  /** the last stop lands: 1.8 + 5 × 0.08 + 0.4 − 0.1 + 0.35 */
  f4: 2.85,
  /** the label rises once the fan is in */
  label: 2.85,
  /** the END: the take's length (the label lands at 3.25 and holds) */
  end: 3.4,
} as const;
/** how long a wire draws, s: the kit's 0.6 for the agents' wires, 0.4 for the fan's short ones;
    a stop lands `stopLead` s before its wire arrives (the loved hub dot's timing) */
const DRAW = { wire: 0.6, fan: 0.4, stopLead: 0.1 } as const;
/** a name or the label rises from 8 px below its place in 0.4 s (the kit's skRise, as the signals
    story's count label) */
const RISE = { y: 8, duration: 0.4, afterPop: 0.1 } as const;

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

  // an agent's disc, wire, cap and name share its data-node (LpStoryMcp)
  const agent = (id: "claude" | "codex") => ({
    disc: $(`.lp-sk-disc[data-node="${id}"]`),
    wire: $<SVGPathElement>(`.lp-sk-wires g[data-node="${id}"] > path`),
    cap: $<SVGCircleElement>(`.lp-sk-wires g[data-node="${id}"] > .lp-sk-cap`),
    name: $(`.lp-sk-name[data-node="${id}"]`),
  });
  const claude = agent("claude");
  const codex = agent("codex");
  const inPort = $<SVGCircleElement>('.lp-sk-hub[data-port="in"]');
  const outPort = $<SVGCircleElement>('.lp-sk-hub[data-port="out"]');
  // the fan, in reveal order (data-order 0…n−1, the data's order: top to bottom)
  const count = $$(".lp-sk-wires g[data-order]").length;
  const fan = Array.from({ length: count }, (_, k) => {
    const wire = $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] > path`);
    const stop = $<SVGCircleElement>(`.lp-smcp-stop[data-order="${k}"]`);
    // each stop lands on the markup's radius (the END picture's): read before frame 0 writes it
    return { wire, stop, r: Number(stop.getAttribute("r")) };
  });
  const label = $('.lp-sk-name[data-node="tools"]');

  /* ── frame 0 (the markup rests on the END picture). Each block leaves a composed picture, the
     END less what is hidden so far ── */
  // the wires first: each reads its length before it is dashed away (opacity 0 until it draws)
  [claude.wire, codex.wire, ...fan.map((f) => f.wire)].forEach(skHideWire);
  yield;
  // the discs wait small and unseen, the names and the label below their places, unseen; the
  // caps, the ports and the stops at r 0
  skHidePop([claude.disc, codex.disc]);
  skHideRise([claude.name, codex.name, label], RISE.y);
  skHideR([claude.cap, codex.cap, inPort, outPort, ...fan.map((f) => f.stop)]);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── Claude: its disc pops and its name rises, its cap lands, its wire draws into the in-port,
     and the in-port lands as the wire arrives ── */
  skPop(tl, claude.disc, T.claude);
  skRise(tl, claude.name, T.claude + RISE.afterPop, RISE.duration);
  skCap(tl, claude.cap, T.claudeWire);
  skWire(tl, claude.wire, T.claudeWire, DRAW.wire);
  skDot(tl, inPort, T.inPort);

  /* ── Codex: the same, into the same in-port ── */
  skPop(tl, codex.disc, T.codex);
  skRise(tl, codex.name, T.codex + RISE.afterPop, RISE.duration);
  skCap(tl, codex.cap, T.codexWire);
  skWire(tl, codex.wire, T.codexWire, DRAW.wire);

  /* ── out of Pancake: the out-port lands as the fan's start cap, then the wires draw one by
     one, each stop landing as its wire arrives ── */
  skCap(tl, outPort, T.fan);
  fan.forEach(({ wire, stop, r }, k) => {
    const at = T.fan + T.fanGap * k;
    skWire(tl, wire, at, DRAW.fan);
    skStop(tl, stop, r, at + DRAW.fan - DRAW.stopLead);
  });

  /* ── the label ── */
  skRise(tl, label, T.label, RISE.duration);

  // the END holds to the take's length (a set on nothing, as the steps' timelines hold theirs)
  tl.set({}, {}, T.end);

  /* QA labels = the beats' composed pictures (the shell's pose() and the harness seek them) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
