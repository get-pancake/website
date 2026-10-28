import type { DiveStageProps } from "./lp-dive-stages";
import { SkDisc, SkName, skF3 } from "./LpStoryKit";
import { STORY_SIGNALS } from "./lp-story-signals-data";

/**
 * Deep-dive story "signals" (block 2, "Buying signal + enrichment") — the stage markup. Founder,
 * 2026-10-28: "ban UI things from motions and try to abstract things … graphic simple and on
 * brand (you can reuse components)", pointing at the one picture he loves, the old sources
 * story's end hub. This stage IS that hub (LpStorySources.tsx at 630bb8e, its `.lp-src-hub`),
 * with the spec's changes (lp-story-signals-data.ts): its six providers, no panel, the claim in
 * the display face. Build spec: the design panel's §3.2.
 *
 * Contract: lp-dive-stages.ts — server-safe (no hooks, no "use client", no lib/placeholders: every
 * provider is final, so `placeholders` changes nothing), ONE root with data-lp-story="signals" +
 * aria-hidden (the shell's host carries the ALT), rest markup = the END picture, nothing painted
 * behind the scene. The parts are the story kit's (LpStoryKit.tsx, story-kit.css); this story's
 * own geometry is app/_styles/landing-v3/story-signals.css, its motion
 * lp-story-signals-timeline.ts. It imports nothing from lp-story-kit.ts: that module pulls GSAP
 * into the server graph (the caps' 5.333 is its SK_CAP_R, written out).
 *
 * Layers, back to front (spec §3.2 z1–z9), all inside .lp-sk-cam (the camera: frame 0 scales it
 * ×2 about a point right of the claim, so everything but the claim starts off-frame to the left
 * and slides in as it pulls back; the providers never pop):
 *   .lp-ssig-dot     the five flat confetti dots
 *   .lp-sk-disc      the discs under the wires: each vendor's own mark on a white disc
 *   svg.lp-sk-wires  per provider a <g data-node data-order>: its start cap, then its wire (the
 *                    timeline draws them in data-order), painted in the data's wireOrder (Figma
 *                    z-order); then the near-black hub dot, in the svg as in the loved markup
 *                    (the spec lists it after TheirStack's disc: the two never overlap)
 *   .lp-sk-disc      TheirStack, over the wires (Figma: Ellipse 118 sits above them)
 *   .lp-sk-name      each provider's name, under its disc (Dealroom's above); phones hide them
 *   .lp-ssig-count   "30+ data providers"
 *   .lp-ssig-k/-v    the claim: "WHY THEY FIT" over "Just raised", beside the hub dot
 */
export function LpStorySignalsStage(_props: DiveStageProps) {
  const { claim, label, point, nodes, wireOrder, dots } = STORY_SIGNALS;
  const under = nodes.filter((node) => !node.over);
  const over = nodes.filter((node) => node.over);
  const wires = wireOrder.flatMap((id) => nodes.filter((node) => node.id === id));

  return (
    <div className="lp-sk lp-ssig" data-lp-story="signals" aria-hidden="true">
      <div className="lp-sk-cam">
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
        <p className="lp-ssig-count lp-sk-rise">{label.text}</p>
        <p className="lp-sk-k lp-ssig-k">{claim.kicker.text}</p>
        <p className="lp-sk-v lp-ssig-v">{claim.value.text}</p>
      </div>
    </div>
  );
}
