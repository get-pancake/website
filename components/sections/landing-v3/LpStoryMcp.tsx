import type { CSSProperties, ReactNode } from "react";

import type { DiveStageProps } from "./lp-dive-stages";
import { SkDisc, skF3 } from "./LpStoryKit";
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
 *
 * The picture is a flow, left to right, in the loved hub's parts: the agents' marks on white
 * discs, a wire from each into Pancake's left edge, and a fan of six short wires out of its right
 * edge to six stops in the infra section's three tones. No claim, no UI.
 *
 * Layers, back to front:
 *   .lp-sk-scene          the scene wrapper (the 752×489 box); nothing transforms it
 *     svg.lp-sk-wires     the wires: each agent's, from its disc's edge into the lockup's left
 *                         edge, then the fan's six, from its right edge to their stops. Each
 *                         <g> names the node its wire comes from (data-node: an agent, or
 *                         "pancake" with the stop's data-order for the fan) and holds, after
 *                         its wire, the wire's pulse (.lp-sk-pulse, the kit's: a copy of the
 *                         wire's path the timeline rides a short dash along, hidden at rest)
 *     .lp-smcp-brand      Pancake: the infra section's lockup at ×1.25 (LpInfra.tsx PancakeMark,
 *                         the footer's wordmark file; infra.css .lp-infra__brand). The mascot's
 *                         two eyes carry data-eye: the timeline blinks them
 *     .lp-sk-disc ×2      the agents: Claude's and Codex's glyphs (LpAgentMarks.tsx, copied) on
 *                         the kit's white discs
 *     svg.lp-sk-wires     over the discs and the lockup: the six stops (flat, over their
 *                         wires' ends). No dot on any edge: the wires meet the discs and the
 *                         lockup themselves (founder 2026-10-28, on the dots over the discs: "ca
 *                         fait un peu vibe coded")
 *     .lp-sk-name ×4      the agents' names under their discs and "About 100 tools" over the
 *                         fan: the kit's name style, risen into place (.lp-sk-rise); then
 *                         "Thinking…" under the lockup, the motion's only label, hidden at rest
 *                         (story-mcp.css T5). Phones hide them all (story-kit.css), the picture
 *                         reads without them
 *
 * Every element is in the markup: the timeline hides what comes later (frame 0) and never adds
 * one; the pulses and "Thinking…" rest hidden, so the END picture never shows them. Nothing here
 * is focusable, and nothing carries its own accessible name: the root is aria-hidden and the ALT
 * names Pancake and both agents.
 */

/** The Pancake mark, full colour: copied from LpInfra.tsx PancakeMark (step 02's, its three
    pancakes are the three layers). The view box is the avatar's, cropped to the mascot (the
    avatar keeps room around it). The art paints its two eyes last (lp-pancake-avatar-art.ts:
    ten shapes, the eyes the last two): they carry data-eye, which the timeline's blink reads
    (it tweens their own `d`, the art itself is never edited) */
function PancakeMark() {
  const eyes = PANCAKE_AVATAR.shapes.length - 2;
  return (
    <svg className="lp-smcp-pk" viewBox="3.9 4.9 24 24">
      {PANCAKE_AVATAR.shapes.map((shape, i) => (
        <path
          key={i}
          d={shape.d}
          fill={shape.fill}
          opacity={"opacity" in shape ? shape.opacity : undefined}
          data-eye={i >= eyes ? "" : undefined}
        />
      ))}
    </svg>
  );
}

/** A small label in the kit's name style, centred on x: under the box that ends at `bottom`, or
    over the one that starts at `top` (`above`). Copied from LpStoryKit.tsx SkName with the kit's
    rise class added (.lp-sk-rise: the timeline raises it into place); hidden on phones as every
    .lp-sk-name. */
function McpName({
  x,
  top,
  bottom,
  above,
  node,
  className,
  children,
}: {
  x: number;
  top: number;
  bottom: number;
  above?: boolean;
  node: string;
  className?: string;
  children: ReactNode;
}) {
  const place = { "--nx": skF3(x), "--nt": skF3(top), "--nb": skF3(bottom) } as CSSProperties;
  return (
    <span
      className={className ? `lp-sk-name lp-sk-rise ${className}` : "lp-sk-name lp-sk-rise"}
      data-node={node}
      data-above={above ? "" : undefined}
      style={place}
    >
      {children}
    </span>
  );
}

export function LpStoryMcpStage(_props: DiveStageProps) {
  const { brand, agents, tools, label, thinking } = STORY_MCP;
  const box = (x: number, y: number, w: number, h: number) => ({
    left: `${skF3(x)}px`,
    top: `${skF3(y)}px`,
    width: `${skF3(w)}px`,
    height: `${skF3(h)}px`,
  });

  return (
    <div className="lp-sk lp-smcp" data-lp-story="mcp" aria-hidden="true">
      <div className="lp-sk-scene">
        {/* the wires, under everything: the agents' into Pancake, then the fan out of it; each
            with its pulse after it (hidden at rest) */}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {agents.map((agent) => (
            <g key={agent.id} data-node={agent.id}>
              <path d={agent.d} />
              <path className="lp-sk-pulse" d={agent.d} />
            </g>
          ))}
          {tools.map((tool, k) => (
            <g key={k} data-node="pancake" data-order={k}>
              <path d={tool.d} />
              <path className="lp-sk-pulse" d={tool.d} />
            </g>
          ))}
        </svg>

        {/* Pancake, the brand's lockup on plum: the avatar's colour mascot and the footer's
            cream wordmark (the looped k is drawn, never typed). The img is the infra lockup's,
            eager as there: the infra section above has already fetched the file, so it costs no
            request and never paints late. Its alt is empty: the ALT names Pancake */}
        <div className="lp-smcp-brand" data-node="pancake" style={box(brand.x, brand.y, brand.w, brand.h)}>
          <PancakeMark />
          {/* eslint-disable-next-line @next/next/no-img-element -- the footer's wordmark file, as the nav's */}
          <img className="lp-smcp-wordmark" src="/lp/lp-footer-logo.svg" alt="" width={239.672} height={116.755} />
        </div>

        {/* the agents, each mark on a white disc */}
        {agents.map((agent) => (
          <SkDisc key={agent.id} x={agent.disc.x} y={agent.disc.y} size={agent.disc.size} node={agent.id}>
            <svg className="lp-smcp-glyph" viewBox={SMCP_MARKS[agent.id].viewBox} fill="currentColor" data-mark={agent.id}>
              <path d={SMCP_MARKS[agent.id].d} />
            </svg>
          </SkDisc>
        ))}

        {/* over the discs and the lockup: the stops, over their wires' ends */}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {tools.map((tool, k) => (
            <circle
              key={k}
              className="lp-smcp-stop"
              data-tone={tool.tone}
              data-order={k}
              cx={skF3(tool.stop.x)}
              cy={skF3(tool.stop.y)}
              r={tool.stop.r}
            />
          ))}
        </svg>

        {/* the names, under the agents' discs, the label over the fan, and "Thinking…" under
            the lockup (hidden at rest: the motion's only) */}
        {agents.map((agent) => (
          <McpName
            key={agent.id}
            node={agent.id}
            x={agent.disc.x + agent.disc.size / 2}
            top={agent.disc.y}
            bottom={agent.disc.y + agent.disc.size}
          >
            {agent.name}
          </McpName>
        ))}
        <McpName node="tools" x={label.x} top={label.top} bottom={label.top} above>
          {label.text}
        </McpName>
        <McpName
          node="thinking"
          className="lp-smcp-thinking"
          x={brand.x + brand.w / 2}
          top={brand.y}
          bottom={brand.y + brand.h}
        >
          {thinking.text}
        </McpName>
      </div>
    </div>
  );
}
