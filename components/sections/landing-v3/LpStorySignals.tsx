import type { DiveStageProps } from "./lp-dive-stages";
import { SkDisc, SkName, skF3 } from "./LpStoryKit";
import { STORY_SIGNALS } from "./lp-story-signals-data";

/**
 * Deep-dive story "signals" (block 2, "Buying signal + enrichment") — the stage markup, which IS
 * the END picture. Founder, 2026-10-28: "ban UI things from motions and try to abstract things
 * … graphic simple and on brand (you can reuse components)", then "no UI should not mean text it
 * should mean abstraction of what our infrastructure does". One left-to-right flow: the six
 * providers of the hub he loves (the old sources story's, LpStorySources.tsx at 630bb8e) draw
 * into Pancake's near-black point, and four short wires fan out of it to four brand-coloured
 * stops, Hiring, Funding, Site visits and Work email. No big text: small labels only, in the
 * kit's name style, hidden on phones. Words and geometry: lp-story-signals-data.ts.
 *
 * Contract: lp-dive-stages.ts — server-safe (no hooks, no "use client", no lib/placeholders: every
 * provider is final, so `placeholders` changes nothing), ONE root with data-lp-story="signals" +
 * aria-hidden (the shell's host carries the ALT), rest markup = the END picture, nothing painted
 * behind the scene. The parts are the story kit's (LpStoryKit.tsx, story-kit.css); this story's
 * own pieces are app/_styles/landing-v3/story-signals.css, its motion
 * lp-story-signals-timeline.ts. It imports nothing from lp-story-kit.ts: that module pulls GSAP
 * into the server graph (the caps' 5.333 is its SK_CAP_R, written out).
 *
 * Layers, back to front, all inside .lp-sk-scene (the scene wrapper, never transformed; the
 * providers stand from frame 0 and never pop):
 *   .lp-ssig-dot      the five flat confetti dots
 *   .lp-sk-disc       the discs under the wires: each vendor's own mark on a white disc
 *   svg.lp-sk-wires   per provider a <g data-node data-order>: its start cap, then its wire (the
 *                     timeline draws them in data-order), painted in the data's wireOrder (Figma
 *                     z-order); per output a <g data-out>: its wire out of the hub (multiply, as
 *                     the providers'); the four stops, children of the svg itself so the kit's
 *                     `> g > *` multiply never reaches them and each covers the end of its wire;
 *                     then the near-black hub dot over every wire's end and start
 *   .lp-sk-disc       TheirStack, over the wires (Figma: Ellipse 118 sits above them)
 *   .lp-sk-name       each provider's name, under its disc (Dealroom's above); phones hide them
 *   .lp-ssig-out      each output's label, right of its stop; phones hide them
 *   .lp-ssig-count    "30+ data providers", over the providers; phones hide it
 * Every box is placed inline from the data (stage px, three decimals at most: skF3). Nothing
 * here is focusable.
 */

/** a line box's top-left, stage px */
const at = (x: number, y: number) => ({ left: `${skF3(x)}px`, top: `${skF3(y)}px` });

export function LpStorySignalsStage(_props: DiveStageProps) {
  const { label, point, nodes, wireOrder, dots, outputs, stopR } = STORY_SIGNALS;
  const under = nodes.filter((node) => !node.over);
  const over = nodes.filter((node) => node.over);
  const wires = wireOrder.flatMap((id) => nodes.filter((node) => node.id === id));

  return (
    <div className="lp-sk lp-ssig" data-lp-story="signals" aria-hidden="true">
      <div className="lp-sk-scene">
        {dots.map((dot) => (
          <span
            key={dot.color}
            className="lp-ssig-dot"
            style={{
              background: `var(--lp-${dot.color})`,
              left: `${skF3(dot.x)}px`,
              top: `${skF3(dot.y)}px`,
              width: `${skF3(dot.size)}px`,
              height: `${skF3(dot.size)}px`,
            }}
          />
        ))}
        {under.map((node) => (
          <SkDisc key={node.id} node={node.id} x={node.x} y={node.y} size={node.size} logo={node.logo} />
        ))}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {wires.map((node) => (
            <g key={node.id} data-node={node.id} data-order={node.order}>
              <circle className="lp-sk-cap" cx={skF3(node.cap.x)} cy={skF3(node.cap.y)} r="5.333" />
              <path d={node.d} />
            </g>
          ))}
          {outputs.map((output) => (
            <g key={output.id} data-out={output.id}>
              <path d={output.d} />
            </g>
          ))}
          {outputs.map((output) => (
            <circle
              key={output.id}
              className="lp-ssig-stop"
              data-out={output.id}
              cx={skF3(output.x)}
              cy={skF3(output.y)}
              r={skF3(stopR)}
              style={{ fill: `var(--lp-${output.color})` }}
            />
          ))}
          <g>
            <circle className="lp-sk-hub" cx={skF3(point.x)} cy={skF3(point.y)} r="5.333" />
          </g>
        </svg>
        {over.map((node) => (
          <SkDisc key={node.id} node={node.id} x={node.x} y={node.y} size={node.size} logo={node.logo} />
        ))}
        {nodes.map((node) => (
          <SkName key={node.id} node={node.id} x={node.x} y={node.y} size={node.size} above={node.nameAbove}>
            {node.name}
          </SkName>
        ))}
        {outputs.map((output) => (
          <span key={output.id} className="lp-ssig-out lp-sk-rise" data-out={output.id} style={at(output.at.x, output.at.y)}>
            {output.text}
          </span>
        ))}
        <p className="lp-ssig-count lp-sk-rise" style={at(label.x, label.y)}>
          {label.text}
        </p>
      </div>
    </div>
  );
}
