import type { DiveStageProps } from "./lp-dive-stages";
import { SkDisc } from "./LpStoryKit";
import { PANCAKE_AVATAR } from "./lp-pancake-avatar-art";
import { SMCP_MARKS } from "./lp-story-mcp-art";
import { STORY_MCP } from "./lp-story-mcp-data";

/**
 * Deep-dive story "Built for Claude and Codex" (block 4, the founder's "mcp first", 2026-10-28)
 * — the stage markup. Owner: story-mcp package. Contract: lp-dive-stages.ts (server-safe: no
 * hooks, no "use client", no lib/placeholders import; one root with data-lp-story="mcp" +
 * aria-hidden, the shell's host carries the ALT; the markup IS the END picture; it paints nothing
 * behind the scene). Copy and geometry: lp-story-mcp-data.ts; the two glyphs: lp-story-mcp-art.ts;
 * styles: story-kit.css (the shared kit) + story-mcp.css; motion: lp-story-mcp-timeline.ts.
 * Spec: the design panel's final build spec, §3.4.
 *
 * Layers, back to front (spec §3.4's z order):
 *   .lp-sk-scene          the scene wrapper (the 752×489 box); nothing transforms it
 *     svg.lp-sk-wires     the agents' wires into the point, and the stem from the point into
 *                         Pancake, which ends under the lockup's edge. Each wire's <g> names the
 *                         node it plugs in (data-node: its agent, or "pancake" for the stem)
 *     .lp-smcp-brand      Pancake: the infra section's lockup at ×1.25 (LpInfra.tsx PancakeMark,
 *                         the footer's wordmark file; infra.css .lp-infra__brand)
 *     .lp-sk-disc ×2      the agents: Claude's and Codex's glyphs (LpAgentMarks.tsx, copied) on the
 *                         kit's white discs, nothing written beside them
 *     svg.lp-sk-wires     the point (near-black) and the wires' start caps, over the discs' edges.
 *                         The spec paints the point under the discs; it is 80 px clear of them
 *                         (and 39 px clear of the lockup), so one layer carries both dots and the
 *                         picture is the same
 *     .lp-sk-k / .lp-sk-v the claim: "IN THE CHAT" over "About 100 tools"
 *
 * Every element is in the markup: the timeline hides what comes later (frame 0) and never adds
 * one. Nothing here is focusable, and nothing carries its own accessible name: the root is
 * aria-hidden and the ALT names Pancake and both agents.
 */

/** The Pancake mark, full colour: copied from LpInfra.tsx PancakeMark (step 02's, its three
    pancakes are the three layers). The view box is the avatar's, cropped to the mascot (the
    avatar keeps room around it) */
function PancakeMark() {
  return (
    <svg className="lp-smcp-pk" viewBox="3.9 4.9 24 24">
      {PANCAKE_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

export function LpStoryMcpStage(_props: DiveStageProps) {
  const { kicker, value, point, stem, agents } = STORY_MCP;

  return (
    <div className="lp-sk lp-smcp" data-lp-story="mcp" aria-hidden="true">
      <div className="lp-sk-scene">
        {/* z1: the wires, under Pancake */}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {agents.map((agent) => (
            <g key={agent.id} data-node={agent.id}>
              <path d={agent.d} />
            </g>
          ))}
          <g data-node="pancake">
            <path d={stem.d} />
          </g>
        </svg>

        {/* z2: Pancake, the brand's lockup on plum: the avatar's colour mascot and the footer's
            cream wordmark (the looped k is drawn, never typed). The img is the infra lockup's,
            eager as there: the infra section above has already fetched the file, so it costs no
            request and never paints late. Its alt is empty: the ALT names Pancake */}
        <div className="lp-smcp-brand" data-node="pancake">
          <PancakeMark />
          {/* eslint-disable-next-line @next/next/no-img-element -- the footer's wordmark file, as the nav's */}
          <img className="lp-smcp-wordmark" src="/lp/lp-footer-logo.svg" alt="" width={239.672} height={116.755} />
        </div>

        {/* z4: the agents, each mark on a white disc */}
        {agents.map((agent) => (
          <SkDisc key={agent.id} x={agent.disc.x} y={agent.disc.y} size={agent.disc.size} node={agent.id}>
            <svg className="lp-smcp-glyph" viewBox={SMCP_MARKS[agent.id].viewBox} fill="currentColor" data-mark={agent.id}>
              <path d={SMCP_MARKS[agent.id].d} />
            </svg>
          </SkDisc>
        ))}

        {/* z3 + z5: the point the wires land on, and each wire's start cap on its disc's edge
            (r = the kit's SK_CAP_R, written out: lp-story-kit.ts imports the "use client" GSAP
            module, which a server Stage must never reach) */}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          <g>
            <circle className="lp-sk-hub" cx={point.x} cy={point.y} r="5.333" />
          </g>
          {agents.map((agent) => (
            <g key={agent.id} data-node={agent.id}>
              <circle className="lp-sk-cap" cx={agent.cap.x} cy={agent.cap.y} r="5.333" />
            </g>
          ))}
        </svg>

        {/* the claim (z6, z7) */}
        <p className="lp-sk-k lp-smcp-k">{kicker.text}</p>
        <p className="lp-sk-v lp-smcp-v">{value.text}</p>
      </div>
    </div>
  );
}
