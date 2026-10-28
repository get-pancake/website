import { SkDisc, skF3 } from "./LpStoryKit";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_LINEAGE } from "./lp-story-lineage-data";

/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — the stage markup, which IS
 * the END picture. Owner: story-lineage package (2026-10-28). The founder's third block, "3/
 * Lead lineage", drawn with no UI ("ban UI things from motions and try to abstract things …
 * graphic simple and on brand (you can reuse components)") in the parts of the picture he loves
 * (the old sources story's end hub): one trace runs back from a lead to the signal that found
 * her, then on to its source. Words and geometry: lp-story-lineage-data.ts; look:
 * app/_styles/landing-v3/story-kit.css (the kit) and story-lineage.css; motion:
 * lp-story-lineage-timeline.ts.
 *
 * Contract (lp-dive-stages.ts): server-safe (no hooks, no "use client", no lib/placeholders:
 * every part is final, so `placeholders` changes nothing), ONE root with
 * data-lp-story="lineage" and aria-hidden (the shell's host carries the ALT), rest markup = the
 * timeline's progress(1), nothing painted behind the scene (the shell paints the stage).
 *
 * Layers, back to front (the spec's z order):
 *   .lp-sk-scene                the scene wrapper (the 752×489 box); nothing transforms it
 *     svg.lp-sk-wires[traces]   the trace in two wires, each written from where it draws:
 *                               the lead → the signal, the signal → the source (multiply)
 *     .lp-sk-disc               TheirStack's own mark on a white disc (SkDisc)
 *     svg.lp-sk-wires[dots]     over the disc: the source's cap (multiply), the purple signal
 *                               stop and the lead's near-black dot (normal blend, so each
 *                               covers the wire it ends)
 *     .lp-slin-name             "Tamsin Okafor", her name by her dot
 *     .lp-sk-k / .lp-sk-v       the claim: "WHICH SIGNAL" over "Hiring a / marketing lead"
 *
 * Every box is placed inline from the data (stage px, three decimals at most: skF3), as SkDisc
 * places its disc; the stylesheets hold the look only. Nothing here is focusable.
 */

/** a line box's top-left, stage px */
const at = (x: number, y: number) => ({ left: `${skF3(x)}px`, top: `${skF3(y)}px` });

export function LpStoryLineageStage(_props: DiveStageProps) {
  const { kicker, value, lead, signal, source, traces } = STORY_LINEAGE;

  return (
    <div className="lp-sk lp-slin" data-lp-story="lineage" aria-hidden="true">
      <div className="lp-sk-scene">
        <svg className="lp-sk-wires" data-layer="traces" viewBox="0 0 752 489" width="752" height="489">
          {traces.map((trace) => (
            <g key={trace.id}>
              <path data-trace={trace.id} d={trace.d} />
            </g>
          ))}
        </svg>
        <SkDisc x={source.x} y={source.y} size={source.size} logo={source.logo} />
        <svg className="lp-sk-wires" data-layer="dots" viewBox="0 0 752 489" width="752" height="489">
          <g>
            <circle className="lp-sk-cap" cx={skF3(source.cap.x)} cy={skF3(source.cap.y)} r={source.cap.r} />
          </g>
          <circle className="lp-slin-stop" cx={skF3(signal.x)} cy={skF3(signal.y)} r={signal.r} />
          <circle className="lp-sk-hub" cx={skF3(lead.dot.x)} cy={skF3(lead.dot.y)} r={lead.dot.r} />
        </svg>
        <p className="lp-slin-name lp-sk-rise" style={at(lead.x, lead.y)}>
          {lead.name}
        </p>
        <p className="lp-sk-k" style={at(kicker.x, kicker.y)}>
          {kicker.text}
        </p>
        <p className="lp-sk-v lp-slin-v" style={at(value.x, value.y)}>
          {value.text}
        </p>
      </div>
    </div>
  );
}
