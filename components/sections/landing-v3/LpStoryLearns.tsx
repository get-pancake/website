import type { DiveStageProps } from "./lp-dive-stages";
import { SL_ARROW, SL_AVATAR, SL_CHECK } from "./lp-story-learns-art";
import { LEARNS } from "./lp-story-learns-data";

/**
 * Deep-dive story "Pancake learns from what wins" — the stage markup (Figma storyboard of
 * 2026-10-12: 5061:1443 / 5335 / 5399 / 5459 / 5509). Owner: story-learns package. Contract:
 * lp-dive-stages.ts (server-safe, one root with data-lp-story="learns" + aria-hidden, rest markup
 * = the END picture, paints nothing behind the scene; geometry in
 * app/_styles/landing-v3/story-learns.css).
 *
 * One camera, two layers that the timeline moves as one (lp-story-learns-timeline.ts):
 * - `.lp-sl-chart`: the chart card (frames 1-2), drawn at the stage's own scale. Hidden at rest
 *   (by then the camera has left it above the stage).
 * - `.lp-sl-notes`: the heading, the three checked lines and the status line, drawn at the END
 *   picture's scale (frame 5 = the chart's scale x 1.68919), so the picture a visitor rests on
 *   is plain layout with no transform. Frame 3 is this layer scaled back down.
 * The status line holds both of its texts in one place; "Updating Brain..." is hidden at rest.
 *
 * Icons are inline (the rest picture needs no request): each in a viewBox of its own stage size,
 * its drawing in a <g> the stylesheet nudges by the box's sub-pixel remainder.
 */

const AV = SL_AVATAR.size;
const CK = SL_CHECK.size;
const AR = SL_ARROW.size;
const PLOT = LEARNS.plot;

export function LpStoryLearnsStage({ placeholders }: DiveStageProps) {
  return (
    <div data-lp-story="learns" className="lp-sl" data-placeholders={placeholders || undefined} aria-hidden="true">
      <div className="lp-sl-chart">
        <div className="lp-sl-graph">
          <div className="lp-sl-stat">
            <span className="lp-sl-pct">{`${LEARNS.sharePrefix}${LEARNS.share.end}%`}</span>
            <svg className="lp-sl-arrow" viewBox={`0 0 ${AR} ${AR}`} fill="none" focusable="false">
              <path d={SL_ARROW.d} fill="currentColor" />
            </svg>
          </div>
          <p className="lp-sl-vs">{LEARNS.shareLabel}</p>
          {/* an SVG plot, not twelve boxes: its bars sit at fractional places (x 150.5 + 39.545·i,
              feet on y 338.5), which boxes would round to the pixel grid, unevenly */}
          <svg className="lp-sl-bars" viewBox={`0 0 ${PLOT.width} ${PLOT.height}`} fill="none" focusable="false">
            <g>
              {LEARNS.bars.map((height, i) => (
                <rect
                  key={i}
                  className="lp-sl-bar"
                  x={LEARNS.barX[i]}
                  y={PLOT.height - height}
                  width={PLOT.barWidth}
                  height={height}
                  rx={PLOT.barRadius}
                />
              ))}
            </g>
          </svg>
          <div className="lp-sl-weeks">
            {LEARNS.weeks.map((week) => (
              <span key={week}>{week}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="lp-sl-notes">
        <p className="lp-sl-title">{LEARNS.learnedTitle}</p>
        {LEARNS.learned.map((line, i) => (
          <div key={line} className={`lp-sl-item lp-sl-item--${i}`}>
            <svg className="lp-sl-check" viewBox={`0 0 ${CK} ${CK}`} fill="none" focusable="false">
              <g>
                <path d={SL_CHECK.d} fill="currentColor" transform={`scale(${SL_CHECK.scale})`} />
              </g>
            </svg>
            <span className="lp-sl-line">{line}</span>
          </div>
        ))}
        <div className="lp-sl-status">
          <svg className="lp-sl-avatar" viewBox={`0 0 ${AV} ${AV}`} fill="none" focusable="false">
            <g>
              {SL_AVATAR.shapes.map((shape, i) => (
                <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
              ))}
            </g>
          </svg>
          <span className="lp-sl-doing">{LEARNS.updating}</span>
          <span className="lp-sl-done">{LEARNS.updated}</span>
        </div>
      </div>
    </div>
  );
}
