import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  skCap,
  skDot,
  skHidePop,
  skHideR,
  skHideWire,
  skPop,
  skQuery,
  skWire,
} from "./lp-story-kit";

/**
 * Deep-dive story "Built for Claude and Codex" (block 4, the founder's "mcp first", 2026-10-28)
 * — its build-up as ONE paused, seek-safe GSAP timeline on the stage root. Owner: story-mcp
 * package. Spec: the design panel's final build spec, §3.0 (the camera, the verbs, the rules) and
 * §3.4 (the beats). Contract: lp-dive-stages.ts — frame 0 via gsap.set (the caller's
 * gsap.context reverts it), sets and tweens only (no callbacks, no randomness), progress(1) = the
 * server markup (LpStoryMcp.tsx), `cue` = the first composed scene. Reached only through
 * DIVE_LOADERS.mcp (lp-dive-loaders.ts, lazy chunk).
 *
 * No "use client" on purpose (2026-10-09): Next makes every "use client" module a server graph
 * reaches, even through an import(), an EAGER client entry. It imports GSAP and the story kit
 * (lp-story-kit.ts) only: every verb below is the kit's, copied from the loved sources story's end
 * hub (a disc pops, a cap lands, a wire draws into the near-black dot).
 *
 * Founder, on the four blocks: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)"; and on the claim zoomed to fill the stage and
 * held 1.8 s (the opening until the same evening): "this is not motion like it's plain text".
 * Times (s), the T table below:
 *
 *   0.00       cue = f1: "IN THE CHAT / About 100 tools" and the Pancake lockup, in their END
 *              places, never an empty frame
 *   0.30–0.75  Claude's disc pops
 *   0.50–1.10  its cap lands, then its wire draws from the disc into the point
 *   1.00–1.25  the point lands as that wire arrives (its end − 0.1, the loved hub's timing)
 *                                                                              → f2 at 1.25
 *   1.55–2.00  Codex's disc pops
 *   1.75–2.35  its cap lands, then its wire draws into the same point          → f3 at 2.35
 *   2.60–3.05  the stem draws from the point into Pancake (the infra hairline's 0.45 s,
 *              lp-infra-timeline.ts)                                           → f4 at 3.05
 *   3.30       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Never moves: the claim, the lockup (no build, no nudge), the discs once they have popped. The direction is always the agents into Pancake. Nothing loops,
 * glows or pulses; no will-change; the root's opacity is never tweened. The discs pop by the
 * kit's variable and let go of it SK_LANDED after they land (skPop); the dots grow by their `r`
 * attribute, never a transform (skCap / skDot).
 */

/** the take, in seconds (see the table above) */
const T = {
  /** the claim and the lockup: the cue */
  f1: 0,
  /** Claude's disc pops; its cap lands and its wire starts 0.2 s later */
  claude: 0.3,
  claudeWire: 0.5,
  /** the point lands as Claude's wire arrives: 0.5 + 0.6 − 0.1 */
  point: 1.0,
  f2: 1.25,
  /** Codex, the same two beats 1.25 s later */
  codex: 1.55,
  codexWire: 1.75,
  f3: 2.35,
  /** the stem, from the point into Pancake */
  stem: 2.6,
  f4: 3.05,
  /** the END: the take's length (the stem lands at 3.05 and holds) */
  end: 3.3,
} as const;
/** how long a wire draws, s: the kit's 0.6 for the agents' wires, the infra hairline's 0.45 for
    the stem */
const DRAW = { wire: 0.6, stem: 0.45 } as const;

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
  const { $ } = skQuery(root, "mcp");

  // an agent's disc, wire and cap share its data-node (LpStoryMcp); the stem's is "pancake"
  const agent = (id: "claude" | "codex") => ({
    disc: $(`.lp-sk-disc[data-node="${id}"]`),
    wire: $<SVGPathElement>(`.lp-sk-wires g[data-node="${id}"] > path`),
    cap: $<SVGCircleElement>(`.lp-sk-wires g[data-node="${id}"] > .lp-sk-cap`),
  });
  const claude = agent("claude");
  const codex = agent("codex");
  const stem = $<SVGPathElement>('.lp-sk-wires g[data-node="pancake"] > path');
  const point = $<SVGCircleElement>(".lp-sk-hub");

  /* ── frame 0 (the markup rests on the END picture) ── */
  // the wires first: each reads its length before it is dashed away (opacity 0 until it draws)
  [claude.wire, codex.wire, stem].forEach(skHideWire);
  yield;
  // the discs wait small and unseen; the caps and the point at r 0
  skHidePop([claude.disc, codex.disc]);
  skHideR([claude.cap, codex.cap, point]);
  yield;

  const tl = gsap.timeline({ paused: true });

  /* ── Claude: its disc pops, its cap lands, its wire draws into the point, and the point lands
     as the wire arrives ── */
  skPop(tl, claude.disc, T.claude);
  skCap(tl, claude.cap, T.claudeWire);
  skWire(tl, claude.wire, T.claudeWire, DRAW.wire);
  skDot(tl, point, T.point);

  /* ── Codex: the same, into the same point ── */
  skPop(tl, codex.disc, T.codex);
  skCap(tl, codex.cap, T.codexWire);
  skWire(tl, codex.wire, T.codexWire, DRAW.wire);

  /* ── one line from the point into Pancake ── */
  skWire(tl, stem, T.stem, DRAW.stem);

  // the END holds to the take's length (a set on nothing, as the steps' timelines hold theirs)
  tl.set({}, {}, T.end);

  /* QA labels = the beats' composed pictures (the shell's pose() and the harness seek them) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
