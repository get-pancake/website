import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { SK_LANDED, skHideR, skHideRise, skHideWire, skQuery, skRise, skStop, skWire } from "./lp-story-kit";
import { STORY_MCP } from "./lp-story-mcp-data";

/**
 * Deep-dive story 4, "One ask, the right tools, your approval" (the founder's "mcp first",
 * 2026-10-28; this story 2026-10-30, founder: "Yes, prototype it") — its build-up as ONE paused,
 * seek-safe GSAP timeline on the stage root. Owner: story-mcp package. Contract: lp-dive-stages.ts
 * — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens only (no
 * callbacks, no randomness), progress(1) = the server markup (LpStoryMcp.tsx), `cue` = the first
 * composed scene. Reached only through DIVE_LOADERS.mcp (lp-dive-loaders.ts, lazy chunk).
 *
 * No "use client" on purpose (2026-10-09): Next makes every "use client" module a server graph
 * reaches, even through an import(), an EAGER client entry. It imports GSAP, the story kit
 * (lp-story-kit.ts) and its own data (the gate's spoke and place) only: the verbs are the kit's (a wire draws, a dot lands, a label rises),
 * plus plain tweens on colours (a wire's stroke, a dot's fill, a name's ink), on an SVG attribute
 * (the eyes' `d`) and on opacity.
 *
 * Founder, on the four blocks: "ban UI things from motions and try to abstract things … graphic
 * simple and on brand (you can reuse components)"; on a still opening: "this is not motion like
 * it's plain text"; on a big kicker over a big value: "no UI should not mean text it should mean
 * abstraction of what our infrastructure does". On 2026-10-30, on short dashes riding the wires:
 * "pas sur des signaux qui voyagent ca fait un peu sloppy", so nothing travels but a wire drawing
 * itself the first time; on the swells: "j aime pas trop les effets de bounce que tu mets a chaque
 * fois", so nothing grows past its size and comes back; on lineage's two darker wires: "j aime
 * bien le noir plus intense", so the route is that near-black, each wire turning at once. Then
 * this story, the same evening: "Yes, prototype it". It answers a GTM buyer's two questions, what
 * about 100 tools do for them and whether the agent writes to people on its own: one ask lights
 * only the groups the job needs, and a person approves before anything goes out.
 *
 * The story: everyone is in place (the agents, Pancake, six grey groups); the wires draw in, grey;
 * Claude asks (its wire turns near-black, the mascot blinks, "Thinking…" rises); the route lights
 * group by group, each spoke near-black as a whole and its stop in its colour: Signals, Leads,
 * Brain; then the approval (the ring fills, "You approve" rises, "Thinking…" fades); then Plays and
 * the CRM. Enrichment never lights: Pancake picks what the job needs. Times (s):
 *
 *   0.00       cue = f1: the lockup, both agents with their names, the six stops grey with their
 *              names (the used ones' at ink-80), the caption; no wire yet
 *   0.25–0.75  Claude's wire draws in, grey; Codex's 0.35–0.85
 *   0.80–1.40  the six spokes draw out, grey, top to bottom 0.06 s apart (0.3 s each); the ring
 *              lands on the Plays spoke as its tip passes it (≈ 1.12–1.47, hollow: grey stroke)
 *                                                               → f2 at 1.48: all wired, grey
 *   1.50–1.70  the ask: Claude's wire turns near-black, the whole wire at once
 *   1.70–1.97  the mascot blinks (shut 0.07 s, held 0.05 s, open 0.15 s)
 *   1.72–2.02  "Thinking…" rises under the lockup                → f3 at 1.80: the ask, eyes shut
 *   2.05–2.65  the route, 0.2 s a group: Signals 2.05, Leads 2.25, Brain 2.45; each spoke turns
 *              near-black, its stop takes its colour and its name its ink, together in 0.2 s
 *   2.70–2.90  the approval: the ring fills near-black; "Thinking…" fades
 *   2.75–3.15  "You approve" rises                               → f4 at 2.95: approved
 *   3.05–3.45  Plays 3.05, then the CRM 3.25, as the route
 *   3.55       f5 = the END = the server markup (the carousel then holds it 2 s)
 *
 * Nothing moves by GSAP's own transform and nothing overshoots: the wires draw by
 * strokeDashoffset (skWire), the ring lands by its `r` (skStop, power2.out), the labels rise by
 * --lp-sk-rise (skRise, let go after it lands), the eyes shut by their `d` attribute (shutEye
 * below). Every colour rests in story-mcp.css (T6: the route's near-black, a stop's tone, a name's
 * ink, the ring's fill): frame 0 writes the start colours inline, the tweens reach the rest ones
 * and a 1 ms clearProps tween lets go (a tween, not a set: the revert order, lp-story-kit.ts
 * skLetGo), so the END is the markup. The lockup, the discs and the stops never move. Nothing
 * loops, glows or rings; no will-change; the root's opacity is never tweened.
 */

/** the take, in seconds (see the table above) */
const T = {
  /** everyone in place, no wire: the cue */
  f1: 0,
  /** the agents' wires draw in */
  claude: 0.25,
  codex: 0.35,
  /** the spokes draw out, top to bottom */
  spokes: 0.8,
  /** all wired, grey; the ring in place */
  f2: 1.48,
  /** Claude asks: its wire turns near-black */
  ask: 1.5,
  /** the mascot blinks as the ask lands; "Thinking…" rises */
  blink: 1.7,
  think: 1.72,
  /** the ask in, the eyes shut */
  f3: 1.8,
  /** the route lights, a group every STEP */
  route: 2.05,
  /** the approval: the ring fills, "You approve" rises 0.05 s later, "Thinking…" fades */
  gate: 2.7,
  /** approved */
  f4: 2.95,
  /** Plays and the CRM light, as the route */
  act: 3.05,
  /** the END: the take's length (the CRM lands at 3.45 and holds) */
  end: 3.55,
} as const;
/** how long a wire draws, s: the agents' 0.5, a spoke 0.3, the spokes 0.06 s apart */
const DRAW = { agent: 0.5, spoke: 0.3, gap: 0.06 } as const;
/** a colour's change: the whole of a wire, a dot or a name at once, crisp (lineage's climax); a
    group lights every STEP */
const INK = 0.2;
const STEP = 0.2;
/** "You approve" rises from 8 px in 0.4 s, 0.05 s after the ring fills; "Thinking…" from 5 px in
    0.3 s, and fades in 0.2 s */
const RISE = { y: 8, duration: 0.4, afterGate: 0.05, thinkY: 5, think: 0.3, thinkFade: 0.2 } as const;
/** the blink: the eyes shut in 0.07 s, stay shut 0.05 s, open in 0.15 s. Shut, an eye is its own
    path pressed to `shut` of its height onto a lid line `line` of the way down it (the upper lid
    travels further) */
const BLINK = { close: 0.07, hold: 0.05, open: 0.15, shut: 0.14, line: 0.6 } as const;

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

/** When a wire drawn by skWire (strokeDashoffset from its length + 1 to 0, power2.inOut) has its
    tip `at` of its length from its start, as a fraction of the draw: that ease inverted */
function tipAt(at: number, len: number): number {
  const v = (at * len) / (len + 1);
  return v < 0.5 ? Math.cbrt(v / 4) : 1 - Math.cbrt((1 - v) / 4);
}

/** The builder in one go. In slices: `buildStoryMcpSteps`, which the carousel and the phone
    stack spread over idle slots (lp-play-once's startBuild). It may yield after any block: its
    frame-0 sets are written at once, its tweens write nothing until they are rendered, and what
    it reads (the rest colours, the wires' lengths) it reads before its first write. */
export function buildStoryMcp(root: HTMLElement): BuiltStory {
  const steps = buildStoryMcpSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryMcpSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "mcp");

  // an agent's wire by its data-node (LpStoryMcp); the asking one carries .lp-smcp-ink
  const claudeWire = $<SVGPathElement>('.lp-sk-wires g[data-node="claude"] > path');
  const codexWire = $<SVGPathElement>('.lp-sk-wires g[data-node="codex"] > path');
  // the groups, top to bottom (data-order 0…n−1, the data's order): spoke, stop, name; a used
  // group's spoke carries .lp-smcp-ink, its name data-used="true"
  const count = $$(".lp-sk-wires g[data-order]").length;
  const groups = Array.from({ length: count }, (_, k) => {
    const name = $(`.lp-smcp-side[data-node="tool"][data-order="${k}"]`);
    return {
      spoke: $<SVGPathElement>(`.lp-sk-wires g[data-order="${k}"] > path`),
      stop: $<SVGCircleElement>(`.lp-smcp-stop[data-order="${k}"]`),
      name,
      used: name.getAttribute("data-used") === "true",
    };
  });
  const used = groups.filter((g) => g.used);
  // the approval: the ring on the spoke of the group STORY_MCP.gate.tool (Plays), and its name;
  // the used groups above it light before the approval, the others after
  const ring = $<SVGCircleElement>(".lp-smcp-gate");
  const approve = $('.lp-smcp-side[data-node="approve"]');
  const thinking = $('.lp-sk-name[data-node="thinking"]');
  // the mascot's two eyes (data-eye), each with its own path (the END's) and that path shut
  $(".lp-smcp-pk [data-eye]");
  const eyes = $$<SVGPathElement>(".lp-smcp-pk [data-eye]").map((eye) => {
    const open = eye.getAttribute("d") ?? "";
    return { eye, open, shut: shutEye(open) };
  });

  // the rest colours (story-mcp.css T6), read before frame 0 writes over them: the route's
  // near-black, each stop's tone, a used name's ink and a set-back name's (ink-80, as "Thinking…"),
  // the ring's fill; the kit's grey, the stage's own ground for the hollow ring
  const css = getComputedStyle(root);
  const grey = css.getPropertyValue("--sk-wire").trim();
  const ground = css.getPropertyValue("--lp-dive-stage-bg").trim();
  const ink = getComputedStyle(claudeWire).stroke;
  const tones = groups.map((g) => getComputedStyle(g.stop).fill);
  const nameInk = used.length ? getComputedStyle(used[0].name).color : "";
  const backInk = getComputedStyle(thinking).color;
  const ringR = Number(ring.getAttribute("r"));
  const ringInk = getComputedStyle(ring).fill;
  // the ring's spoke and its place on it, a fraction of its length from the lockup (the data's)
  const { tool: gateTool, at: gateAt } = STORY_MCP.gate;
  const gateLen = groups[gateTool]?.spoke.getTotalLength() ?? 0;

  /* ── frame 0 (the markup rests on the END picture): everyone in place, no wire. Each block
     leaves a composed picture ── */
  // the wires: each reads its length before it is dashed away (opacity 0 until it draws); the
  // route's draw in the grey of the others
  [claudeWire, codexWire, ...groups.map((g) => g.spoke)].forEach(skHideWire);
  yield;
  gsap.set([claudeWire, ...used.map((g) => g.spoke)], { stroke: grey });
  // the stops grey, the used names set back; the ring waits at r 0, hollow (the ground inside a
  // grey stroke); "You approve" and "Thinking…" below their places, unseen
  gsap.set(groups.map((g) => g.stop), { fill: grey });
  gsap.set(used.map((g) => g.name), { color: backInk });
  skHideR(ring);
  gsap.set(ring, { fill: ground, stroke: grey });
  skHideRise(approve, RISE.y);
  skHideRise(thinking, RISE.thinkY);
  yield;

  const tl = gsap.timeline({ paused: true });

  /** a colour change, the whole piece at once (INK s), then a 1 ms let-go to the rest value
      (clearProps), as lineage's climax; `prop` is a CSS property (stroke, fill, color) */
  const tint = (els: Element[], prop: string, to: string, at: number) => {
    tl.to(els, { [prop]: to, duration: INK, ease: "power2.out" }, at);
    tl.to(els, { [prop]: to, clearProps: prop, duration: 0.001, ease: "none" }, at + INK + SK_LANDED);
  };
  /** a group lights: its spoke near-black, its stop its tone, its name its ink */
  const light = (k: number, at: number) => {
    const g = groups[k];
    tint([g.spoke], "stroke", ink, at);
    tint([g.stop], "fill", tones[k], at);
    tint([g.name], "color", nameInk, at);
  };

  /* ── 1. the wires draw in, grey: the agents' into the lockup, then the six spokes out of it,
     top to bottom; the ring lands on the Plays spoke as its tip passes it ── */
  skWire(tl, claudeWire, T.claude, DRAW.agent);
  skWire(tl, codexWire, T.codex, DRAW.agent);
  groups.forEach(({ spoke }, k) => skWire(tl, spoke, T.spokes + DRAW.gap * k, DRAW.spoke));
  skStop(tl, ring, ringR, T.spokes + DRAW.gap * gateTool + DRAW.spoke * tipAt(gateAt, gateLen));

  /* ── 2. the ask: Claude's wire turns near-black; the mascot blinks as it lands (the eyes' own
     paths, shut and open again); "Thinking…" rises ── */
  tint([claudeWire], "stroke", ink, T.ask);
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

  /* ── 3. the route: the used groups above the gate light top to bottom, one every STEP; then the
     approval (the ring fills, "You approve" rises, "Thinking…" fades); then the used groups past
     the gate, as the route ── */
  const before = used.filter((g) => groups.indexOf(g) < gateTool);
  const after = used.filter((g) => groups.indexOf(g) >= gateTool);
  before.forEach((g, i) => light(groups.indexOf(g), T.route + STEP * i));
  tint([ring], "fill", ringInk, T.gate);
  tint([ring], "stroke", ringInk, T.gate);
  skRise(tl, approve, T.gate + RISE.afterGate, RISE.duration);
  tl.to(thinking, { autoAlpha: 0, duration: RISE.thinkFade, ease: "power1.in" }, T.gate);
  after.forEach((g, i) => light(groups.indexOf(g), T.act + STEP * i));

  // the caption never moves (in place from frame 0); the END holds to the take's length (a set
  // on nothing, as the steps' timelines hold theirs)
  tl.set({}, {}, T.end);

  /* QA labels = the beats' composed pictures (the shell's pose() and the harness seek them) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3).addLabel("f4", T.f4).addLabel("f5", T.end);

  return { tl, cleanup: () => {}, cue: T.f1 };
}
