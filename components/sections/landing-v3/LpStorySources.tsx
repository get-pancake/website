import type { CSSProperties } from "react";

import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_SOURCES_CHECK, STORY_SOURCES_CURSOR, STORY_SOURCES_GLYPHS } from "./lp-story-sources-art";
import { STORY_SOURCES, type StorySourcesProp } from "./lp-story-sources-data";

/**
 * Deep-dive story "Sources you can trust" — the stage markup (Figma 4964:1287 / 1294 / 1311).
 * Owner: story-sources package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="sources" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-sources.css, the timeline in
 * lp-story-sources-timeline.ts).
 *
 * Layers, back to front (Figma's document order):
 *   .lp-src-leads   scene A: the demo's Leads page (frame 1) + the pointer; the dolly zooms it.
 *                   Hidden at rest (the end picture is the card).
 *   .lp-src-card    the white property card (frame 3)
 *   .lp-src-props   the picked lead's seven properties, each with a green tick
 *   .lp-src-tags    "Tags" + the seven sources, the one that found her highlighted
 *   .lp-src-dbs / .lp-src-wires   "potential source DBs ?": preview-only placeholders
 *                   (data-placeholder), generic glyphs; never on phones.
 */

/** "PMM role open" with its bold run: the only bold in a value (trap T3) */
function Value({ prop }: { prop: StorySourcesProp }) {
  const at = prop.bold ? prop.value.indexOf(prop.bold) : -1;
  if (!prop.bold || at < 0) return <>{prop.value}</>;
  return (
    <>
      {prop.value.slice(0, at)}
      <b>{prop.bold}</b>
      {prop.value.slice(at + prop.bold.length)}
    </>
  );
}

export function LpStorySourcesStage({ placeholders }: DiveStageProps) {
  const { head, rows, props, tagsLabel, tags } = STORY_SOURCES;
  const dbs = STORY_SOURCES.dbs.filter((db) => db.status === "final" || placeholders);
  const anyPlaceholder = dbs.some((db) => db.status === "placeholder");

  return (
    <div className="lp-src" data-lp-story="sources" aria-hidden="true">
      <div className="lp-src-leads">
        <div className="lp-src-page">
          <p className="lp-src-title">{head.title}</p>
          <p className="lp-src-sub">{head.sub}</p>
          <div className="lp-src-table">
            {rows.map((row, i) => (
              <div className="lp-src-row" key={row.name} data-selected={i === 0 ? "" : undefined}>
                <span className="lp-src-av">{row.initials}</span>
                <span className="lp-src-name">{row.name}</span>
                <span className="lp-src-role">
                  {row.role} @ {row.company}
                </span>
                <span className="lp-src-chip" data-kind={row.kind}>
                  {row.kindLabel}
                </span>
                <span className="lp-src-detail">{row.signal}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="lp-src-cursor">
          <svg width="18" height="22" viewBox="0 0 18 22">
            <path d={STORY_SOURCES_CURSOR} fill="currentColor" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="lp-src-card" />

      <div className="lp-src-props">
        {props.map((prop) => (
          <div className="lp-src-prop" key={prop.label}>
            <span className="lp-src-k">{prop.label}</span>
            <span className="lp-src-v">
              <span className="lp-src-tick">
                <svg viewBox="0 0 24 24">
                  <path d={STORY_SOURCES_CHECK} fill="currentColor" />
                </svg>
              </span>
              <span className="lp-src-val">
                <Value prop={prop} />
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="lp-src-tags">
        <span className="lp-src-k">{tagsLabel}</span>
        <span className="lp-src-chips">
          {tags.map((tag) => (
            <span
              className="lp-src-tag"
              key={tag.label}
              data-matched={tag.matched ? "" : undefined}
              style={{ "--w": `${tag.w}px` } as CSSProperties}
            >
              {tag.label}
            </span>
          ))}
        </span>
      </div>

      {dbs.length > 0 && (
        <>
          <div className="lp-src-dbs" data-placeholder={anyPlaceholder ? "" : undefined}>
            {dbs.map((db) => (
              <span
                className="lp-src-db"
                key={db.id}
                data-placeholder={db.status === "placeholder" ? "" : undefined}
                style={{ left: `${db.x}px`, top: `${db.y}px` }}
              >
                <svg
                  className="lp-src-glyph"
                  viewBox="0 0 24 24"
                  style={{
                    left: `${(db.gx - db.x - db.gs / 2).toFixed(3)}px`,
                    top: `${(db.gy - db.y - db.gs / 2).toFixed(3)}px`,
                    width: `${db.gs}px`,
                    height: `${db.gs}px`,
                  }}
                >
                  <path d={STORY_SOURCES_GLYPHS[db.glyph]} />
                </svg>
              </span>
            ))}
          </div>
          <svg
            className="lp-src-wires"
            data-placeholder={anyPlaceholder ? "" : undefined}
            viewBox="0 0 752 489"
            width="752"
            height="489"
          >
            {dbs.map((db) => (
              <path key={db.id} transform={`translate(${db.wire.x} ${db.wire.y})`} d={db.wire.d} />
            ))}
          </svg>
        </>
      )}
    </div>
  );
}
