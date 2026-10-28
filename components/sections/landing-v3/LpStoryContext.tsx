import { skF3 } from "./LpStoryKit";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_CONTEXT } from "./lp-story-context-data";

/**
 * Deep-dive story "context" (block 1: Next best action + Unified GTM context) — the stage markup.
 * Founder 2026-10-28, on the section: "ban UI things from motions and try to abstract things …
 * graphic simple and on brand (you can reuse components)". Spec: the dive panel's final spec
 * §3.1; copy and geometry in lp-story-context-data.ts, the look in
 * app/_styles/landing-v3/story-context.css over the shared story-kit.css, the motion in
 * lp-story-context-timeline.ts.
 *
 * Contract (lp-dive-stages.ts): server-safe (no hooks, no "use client", no lib/placeholders: every
 * part is final, so the props are unused), ONE root carrying data-lp-story="context" and
 * aria-hidden (the shell's host carries the ALT), and this markup IS the END picture (rest = end):
 * the server HTML is never a blank card. Nothing is painted behind the scene.
 *
 * Layers, back to front, all inside the kit's scene wrapper (.lp-sk-scene, never transformed):
 *   svg.lp-sk-wires   z1 the wires: the exit (centre → kicker), then each spoke (dot → centre),
 *                        each in its own <g> (the kit multiplies `> g > *` from 768 px up)
 *                     z2 the Brain's centre (plum, r 20): the steps' .lp-s1-center
 *                     z3 the three parts (r 11, the brand tones): the steps' hubs
 *                     z4 the kicker's dot (the kit's near-black hub dot, r 5.333)
 *   p.lp-sctx-label   z5 each part's name, centred on its dot
 *   p.lp-sk-k         z6 the kicker, "NEXT BEST PLAY"
 *   p.lp-sk-v         z7 the value, the Play
 * `data-part` ties a part's dot, spoke and name together (the timeline pairs them by it).
 */
export function LpStoryContextStage(_props: DiveStageProps) {
  const { claim, center, parts, exit, dot } = STORY_CONTEXT;
  return (
    <div className="lp-sk lp-sctx" data-lp-story="context" aria-hidden="true">
      <div className="lp-sk-scene">
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          <g>
            <path className="lp-sctx-exit" d={exit.d} />
          </g>
          {parts.map((part) => (
            <g key={part.id}>
              <path className="lp-sctx-spoke" data-part={part.id} d={part.d} />
            </g>
          ))}
          {/* outside any <g>: the centre and the parts keep their own colours (no multiply) */}
          <circle className="lp-sctx-center" cx={skF3(center.x)} cy={skF3(center.y)} r={skF3(center.r)} />
          {parts.map((part) => (
            <circle
              key={part.id}
              className="lp-sctx-part"
              data-part={part.id}
              cx={skF3(part.x)}
              cy={skF3(part.y)}
              r={skF3(part.r)}
              style={{ fill: `var(--lp-${part.tone})` }}
            />
          ))}
          <circle className="lp-sk-hub" cx={skF3(dot.x)} cy={skF3(dot.y)} r={skF3(dot.r)} />
        </svg>
        {parts.map((part) => (
          <p
            key={part.id}
            className="lp-sctx-label lp-sk-rise"
            data-part={part.id}
            style={{ left: `${skF3(part.x)}px`, top: `${skF3(part.label.top)}px` }}
          >
            {part.label.text}
          </p>
        ))}
        <p className="lp-sk-k" style={{ left: `${skF3(claim.kicker.x)}px`, top: `${skF3(claim.kicker.y)}px` }}>
          {claim.kicker.text}
        </p>
        <p className="lp-sk-v" style={{ left: `${skF3(claim.value.x)}px`, top: `${skF3(claim.value.y)}px` }}>
          {claim.value.text}
        </p>
      </div>
    </div>
  );
}
