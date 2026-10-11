import type { CSSProperties } from "react";

import type { DiveStageProps } from "./lp-dive-stages";
import { SL_CARD_RING } from "./lp-story-learns-art";
import { LEARNS, LEARNS_STATUS, type LearnsRow } from "./lp-story-learns-data";

/**
 * Deep-dive story "Pancake learns from what wins" — the stage markup (Figma 4964:2021 / 2404 / 2448 / 2490 / 4052).
 * Owner: story-learns package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="learns" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-learns.css).
 *
 * Two layers:
 * - `.lp-sl-scene`: the Plays list, its month axis and the brain disc, as drawn two months on
 *   (Figma frame 2: final shares, tones and labels). Hidden at rest (CSS); the timeline shows it
 *   for the build-up and hides it again before the end.
 * - `.lp-sl-cards`: the END picture E ("Brain learned" + "Brain updated" in its rainbow ring),
 *   visible at rest. Figma's frame 5 is empty: E is production f4's pair of cards (the
 *   reference image 4964:4094 and ring 4964:4097 placed beside the column), markup and rules
 *   COPIED from LpFeatMocks.tsx F4Stage / features.css .lp-f4-* (frozen) as .lp-sl-*.
 *
 * Paint order = Figma's frame 4: disc, back layer (title + the two rows that slide away), axis,
 * front layer (the two winners), "Brain" label, cards. The rows' order in the data is the list's
 * order; rows 1 and 3 sit in the back layer so the winners can lift above them.
 *
 * The card ring's SVG ids (lpsl-*) are document-unique: render this stage once per page.
 */

function Row({ row, i }: { row: LearnsRow; i: number }) {
  return (
    <div className={`lp-sl-row lp-sl-row--${i}`} data-tone={row.tone}>
      <p className="lp-sl-name">{row.name}</p>
      <span className="lp-sl-meta">
        <span className="lp-sl-rate">
          <span className="lp-sl-rlabel">{LEARNS.rateLabel}</span>
          <span className="lp-sl-val" style={{ width: row.valueWidth }}>
            {`${row.end}%`}
          </span>
        </span>
        <span className="lp-sl-status">{LEARNS_STATUS[row.tone]}</span>
      </span>
    </div>
  );
}

export function LpStoryLearnsStage({ placeholders }: DiveStageProps) {
  const rows = LEARNS.rows;
  return (
    <div data-lp-story="learns" className="lp-sl" data-placeholders={placeholders || undefined} aria-hidden="true">
      <div className="lp-sl-scene">
        <div className="lp-sl-disc">
          {/* the ring image (public/lp/story-learns/brain-ring.svg) is attached by the builder:
              the rest picture never shows the disc, so reduced motion and no-JS never fetch it */}
          <span className="lp-sl-discring" />
        </div>
        <div className="lp-sl-back">
          <p className="lp-sl-title">{LEARNS.title}</p>
          <Row row={rows[1]} i={1} />
          <Row row={rows[3]} i={3} />
        </div>
        <div className="lp-sl-axis">
          <span className="lp-sl-line" />
          <div className="lp-sl-strip">
            {LEARNS.months.map((m, j) => {
              const k = { "--k": j - 1 } as CSSProperties;
              return (
                <span key={m.label} className="lp-sl-mark">
                  <i className="lp-sl-tick lp-sl-tick--major" style={k} />
                  <i className="lp-sl-tick lp-sl-tick--minor" style={k} />
                  <span className="lp-sl-month" style={{ ...k, "--dx": `${m.dx}px` } as CSSProperties}>
                    {m.label}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="lp-sl-front">
          <Row row={rows[0]} i={0} />
          <Row row={rows[2]} i={2} />
        </div>
        <p className="lp-sl-brainlabel">{LEARNS.brainLabel}</p>
      </div>

      <div className="lp-sl-cards">
        <div className="lp-sl-card lp-sl-hair lp-sl-worked">
          <p className="lp-sl-ctitle">{LEARNS.learnedTitle}</p>
          <div className="lp-sl-chips">
            {LEARNS.learned.map((chip) => (
              <span key={chip} className="lp-sl-chip">
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="lp-sl-bgroup">
          <svg
            className="lp-sl-ring"
            viewBox="0 0 475 105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            dangerouslySetInnerHTML={{ __html: SL_CARD_RING }}
          />
          <div className="lp-sl-card lp-sl-braincard">
            <p className="lp-sl-ctitle">{LEARNS.updatedTitle}</p>
            <p className="lp-sl-brainsub">{LEARNS.updatedSub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
