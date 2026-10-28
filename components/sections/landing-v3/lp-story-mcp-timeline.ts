import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import {
  SK_CAM_END,
  skCamera,
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
 * simple and on brand (you can reuse components)"; on the opening the kit gives every story, his
 * infra bricks' ask: "prendre toute la place au debut … puis ouvrir la fenetre". Times (s), the T
 * table below:
 *
 *   0.00       cue = f1: "IN THE CHAT / About 100 tools" fills the stage (the camera at ×1.4),
 *              composed at once, never an empty frame. It HOLDS 1.8 s
 *   1.80–3.00  the camera pulls back to ×1 (its variable is cleared at 3.01: plain layout from
 *              there); the Pancake lockup, at rest just under the stage, rises into view with it
 *                                                                              → f2 at 3.00
 *   3.20–3.65  Claude's disc pops
 *   3.40–4.00  its cap lands, then its wire draws from the disc into the point
 *   3.90–4.15  the point lands as that wire arrives (its end − 0.1, the loved hub's timing)
 *                                                                              → f3 at 4.15
 *              the first pair holds 0.65 s
 *   4.80–5.25  Codex's disc pops
 *   5.00–5.60  its cap lands, then its wire draws into the same point          → f4 at 5.60
 *              both agents hold 0.7 s
 *   6.30–6.75  the stem draws from the point into Pancake (the infra hairline's 0.45 s,
 *              lp-infra-timeline.ts)
 *   7.00       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Never moves: the claim (only the camera moves it, once), the lockup (no build, no nudge), the
 * discs once they have popped. The direction is always the agents into Pancake. Nothing loops,
 * glows or pulses; no will-change; the root's opacity is never tweened. The discs pop by the
 * kit's variable and let go of it SK_LANDED after they land (skPop); the dots grow by their `r`
 * attribute, never a transform (skCap / skDot).
 */

/** the take, in seconds (see the table above) */
const T = {
  /** the claim, full stage: the cue */
  f1: 0,
  /** the pull-back has landed (the kit's SK_CAM: held 1.8, pulled back in 1.2) */
  f2: SK_CAM_END,
  /** Claude's disc pops; its cap lands and its wire starts 0.2 s later */
  claude: 3.2,
  claudeWire: 3.4,
  /** the point lands as Claude's wire arrives: 3.4 + 0.6 − 0.1 */
  point: 3.9,
  f3: 4.15,
  /** Codex, the same two beats 1.6 s later */
  codex: 4.8,
  codexWire: 5.0,
  f4: 5.6,
  /** the stem, from the point into Pancake */
  stem: 6.3,
  /** the END: the take's length (the stem lands at 6.75 and holds) */
  end: 7.0,
} as const;
/** how long a wire draws, s: the kit's 0.6 for the agents' wires, the infra hairline's 0.45 for
    the stem */
const DRAW = { wire: 0.6, stem: 0.45 } as const;

/** The builder in one go. In slices: `buildStoryMcpSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and the
    only things it reads after its first write (the wires' lengths, the stylesheet's camera
    scale) depend on nothing it writes. */
export function buildStoryMcp(root: HTMLElement): BuiltStory {
  const steps = buildStoryMcpSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryMcpSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $ } = skQuery(root, "mcp");

  const cam = $(".lp-sk-cam");
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

  /* ── the opening: the claim fills the stage, holds, then the camera pulls back and the
     lockup comes up into view (the kit's camera, the same in all four stories) ── */
  skCamera(tl, cam);

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
