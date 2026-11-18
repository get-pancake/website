import type { CSSProperties } from "react";

import { SkDisc, skF3 } from "./LpStoryKit";
import type { DiveStageProps } from "./lp-dive-stages";
import { PROBLEM_SCENE, type ProblemStoryId, type SpScene } from "./lp-story-problems-data";

/**
 * The six hard problems' stories (the vision homepage, 2026-11-11) — the stage markup, which IS
 * each story's END picture. One renderer for the five scenes of lp-story-problems-data.ts (the
 * sixth problem, crossing, is the lineage story's own stage). Motion: lp-story-problems-timeline.ts;
 * look: story-kit.css and story-problems.css.
 *
 * Contract (lp-dive-stages.ts): server-safe (no hooks, no "use client"), ONE root with
 * data-lp-story="<id>" and aria-hidden (the shell's host carries the ALT), rest markup = the
 * timeline's progress(1), nothing painted behind the scene. It imports nothing from
 * lp-story-kit.ts, which pulls GSAP into the server graph.
 *
 * Layers, back to front, inside .lp-sk-scene (the 752×489 box):
 *   .lp-sk-disc       the marks on white discs (SkDisc)
 *   svg.lp-sk-wires   the flat stops, under the wires; the wires in one <g> (they multiply: the
 *                     kit's `> g > *`); then the dots, flat, each over the end of its wire
 *   .lp-sk-name       a node's name under it, and the scene's own lines of type
 * Every piece the timeline moves carries data-sp="<id>" (a node's name: "<id>-name"). A line the
 * timeline raises carries .lp-sk-rise; a piece that is not in the END carries data-gone, one
 * that has stepped back data-dim (story-problems.css holds both at rest).
 */

/** the kit's name box (story-kit.css .lp-sk-name) whose line box starts at y: that rule's top is
    --nb + 5 */
const labelAt = (x: number, y: number) => ({ "--nx": skF3(x), "--nb": skF3(y - 5) }) as CSSProperties;

function Stage({ scene }: { scene: SpScene }) {
  const rises = new Set(scene.steps.flatMap((step) => ("rise" in step ? [step.rise] : [])));
  const cls = (id: string, extra?: string) =>
    ["lp-sk-name", rises.has(id) ? "lp-sk-rise" : "", extra ?? ""].filter(Boolean).join(" ");
  return (
    <div className="lp-sk lp-sp" data-lp-story={scene.id} aria-hidden="true">
      <div className="lp-sk-scene">
        {scene.nodes.map((node) =>
          node.kind === "disc" ? (
            <SkDisc key={node.id} node={node.id} x={node.x - node.r} y={node.y - node.r} size={2 * node.r} logo={node.logo} />
          ) : null,
        )}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {scene.nodes.map((node) =>
            node.kind === "stop" ? (
              <circle
                key={node.id}
                className="lp-sp-stop"
                data-sp={node.id}
                cx={skF3(node.x)}
                cy={skF3(node.y)}
                r={skF3(node.r)}
                style={{ fill: `var(--lp-${node.tone})` }}
              />
            ) : null,
          )}
          <g>
            {scene.wires.map((wire) =>
              "d" in wire ? (
                <path key={wire.id} data-sp={wire.id} data-ink={wire.ink ? "" : undefined} d={wire.d} />
              ) : (
                <line
                  key={wire.id}
                  data-sp={wire.id}
                  data-ink={wire.ink ? "" : undefined}
                  x1={skF3(wire.line[0])}
                  y1={skF3(wire.line[1])}
                  x2={skF3(wire.line[2])}
                  y2={skF3(wire.line[3])}
                />
              ),
            )}
          </g>
          {scene.nodes.map((node) =>
            node.kind === "dot" ? (
              <circle
                key={node.id}
                className="lp-sp-dot"
                data-sp={node.id}
                data-ink={node.ink ? "" : undefined}
                data-gone={node.gone ? "" : undefined}
                data-dim={node.dim ? "" : undefined}
                cx={skF3(node.x)}
                cy={skF3(node.y)}
                r={skF3(node.r)}
              />
            ) : null,
          )}
        </svg>
        {scene.nodes.map((node) =>
          node.name ? (
            <span
              key={node.id}
              className={cls(`${node.id}-name`)}
              data-sp={`${node.id}-name`}
              data-dim={node.kind === "dot" && node.dim ? "" : undefined}
              style={labelAt(node.x, node.y + node.r + 5)}
            >
              {node.name}
            </span>
          ) : null,
        )}
        {scene.labels.map((label) => (
          <span
            key={label.id}
            className={cls(label.id, label.group ? "lp-sp-group" : undefined)}
            data-sp={label.id}
            data-gone={label.gone ? "" : undefined}
            style={labelAt(label.x, label.y)}
          >
            {label.text}
          </span>
        ))}
      </div>
    </div>
  );
}

const stageOf = (id: ProblemStoryId) =>
  function LpStoryProblemStage(_props: DiveStageProps) {
    return <Stage scene={PROBLEM_SCENE[id]} />;
  };

export const LpStorySourcesAllStage = stageOf("p-sources");
export const LpStoryDedupStage = stageOf("p-dedup");
export const LpStoryMatchingStage = stageOf("p-matching");
export const LpStoryHistoryStage = stageOf("p-history");
export const LpStoryMovesStage = stageOf("p-moves");
