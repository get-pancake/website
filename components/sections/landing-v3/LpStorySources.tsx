import type { DiveStageProps } from "./lp-dive-stages";
import {
  STORY_SOURCES_GLYPHS,
  STORY_SOURCES_HAND,
  STORY_SOURCES_ICONS,
  STORY_SOURCES_PLUS,
  STORY_SOURCES_TILE,
} from "./lp-story-sources-art";
import { STORY_SOURCES, type StorySourcesHubNode, type StorySourcesProp } from "./lp-story-sources-data";

/**
 * Deep-dive story "Sources you can trust" — the stage markup, storyboard of 2026-10-11
 * (Figma 4964:1287 "Leads show up", 5024:7457 "Click on one", 5024:7601 "Lead details open",
 * 5024:8172 "Zoom into 'Why they fit' with top data sources appearing").
 * Owner: story-sources package. Contract: lp-dive-stages.ts (server-safe, one root with
 * data-lp-story="sources" + aria-hidden, rest markup = the END picture, paints nothing behind
 * the scene; geometry in app/_styles/landing-v3/story-sources.css, the timeline in
 * lp-story-sources-timeline.ts). Spec: specs/updates/sources-v2.md.
 *
 * Layers, back to front:
 *   .lp-src-cam      the camera (scene D scales it ×3.89 about a point by "Why they fit")
 *     .lp-src-leads  scenes A/B: the Leads page (title, table) and the hand cursor
 *     .lp-src-panel  scene C: the picked lead's details
 *   .lp-src-hub      scene D: the data-source discs, their wires, the colour dots, the label.
 *                    NOT inside the camera. Rendered only when a hub node renders.
 *
 * `data-end` names the END picture this build rests on: "sources" (the zoom with the hub) when
 * at least one hub node renders, else "details" (the open panel over the dimmed table). Every
 * hub node is a placeholder today (lp-story-sources-data.ts), so production rests on "details".
 * Mock controls are spans: nothing here is focusable.
 */

const f3 = (n: number) => Number(n.toFixed(3));

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

function LinkTile() {
  return (
    <svg className="lp-src-link" viewBox="0 0 16 16">
      <g transform="translate(2.668 2.797)">
        <path className="lp-src-link-bg" d={STORY_SOURCES_TILE.square} />
        <path className="lp-src-link-fg" d={STORY_SOURCES_TILE.arrow} />
      </g>
    </svg>
  );
}

function Prop({ prop }: { prop: StorySourcesProp }) {
  return (
    <div className="lp-src-prop" data-row={prop.row} data-col={prop.col}>
      <Icon className="lp-src-pico" d={STORY_SOURCES_ICONS[prop.id]} />
      <span className="lp-src-pk">{prop.label}</span>
      {prop.id === "email" ? (
        <span className="lp-src-find">
          <Icon d={STORY_SOURCES_ICONS.search} />
          {prop.value}
        </span>
      ) : (
        <span className={prop.id === "industry" ? "lp-src-pv lp-src-pv--2l" : "lp-src-pv"}>
          {prop.value}
          {prop.id === "profile" && <Icon d={STORY_SOURCES_ICONS.out} />}
        </span>
      )}
    </div>
  );
}

function HubNode({ node }: { node: StorySourcesHubNode }) {
  return (
    <span
      className="lp-src-node"
      data-node={node.id}
      data-order={node.order}
      data-placeholder={node.status === "placeholder" ? "" : undefined}
      style={{ left: `${node.x}px`, top: `${node.y}px`, width: `${node.size}px`, height: `${node.size}px` }}
    >
      {node.logo ? (
        // a square file under /lp/story-sources/: a stage mock, not content (the scene is aria-hidden)
        // eslint-disable-next-line @next/next/no-img-element
        <img src={node.logo} alt="" />
      ) : node.glyph ? (
        <Icon className="lp-src-glyph" d={STORY_SOURCES_GLYPHS[node.glyph]} />
      ) : null}
    </span>
  );
}

export function LpStorySourcesStage({ placeholders }: DiveStageProps) {
  const { head, columns, rows, detail, hub } = STORY_SOURCES;
  const nodes = hub.nodes.filter((node) => node.status === "final" || placeholders);
  const label = hub.label && nodes.length > 0 && (hub.label.status === "final" || placeholders) ? hub.label : null;
  const under = nodes.filter((node) => !node.over);
  const over = nodes.filter((node) => node.over);
  const wires = hub.wireOrder.flatMap((id) => nodes.filter((node) => node.id === id));

  return (
    <div className="lp-src" data-lp-story="sources" data-end={nodes.length > 0 ? "sources" : "details"} aria-hidden="true">
      <div className="lp-src-cam">
        <div className="lp-src-leads">
          <p className="lp-src-title">{head.title}</p>
          <div className="lp-src-table">
            <div className="lp-src-th">
              <span className="lp-src-cb" />
              {columns.map((column, i) => (
                <span key={column} className={i === 0 ? "lp-src-h lp-src-h--lead" : "lp-src-h"}>
                  {column}
                </span>
              ))}
            </div>
            {rows.map((row) => (
              <div className="lp-src-row" key={row.name} data-picked={row.picked ? "" : undefined}>
                <span className="lp-src-cb" />
                <span className="lp-src-lead">
                  <span className="lp-src-av">{row.initials}</span>
                  <span className="lp-src-who">
                    <span className="lp-src-name">{row.name}</span>
                    <LinkTile />
                  </span>
                </span>
                <span className="lp-src-c">{row.role}</span>
                <span className="lp-src-c">{row.company}</span>
                <span className="lp-src-c">{row.why}</span>
              </div>
            ))}
          </div>
          <span className="lp-src-cursor">
            <svg width="30" height="30" viewBox="0 0 30 30">
              <path
                transform="translate(3 3)"
                d={STORY_SOURCES_HAND.shape}
                fill="#fff"
                stroke="#171717"
                strokeWidth="1.125"
                strokeLinejoin="round"
              />
              <path d={STORY_SOURCES_HAND.knuckles} fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>

        <div className="lp-src-panel">
          <div className="lp-src-phead">
            <span className="lp-src-av lp-src-av--lg">{detail.initials}</span>
            <span className="lp-src-pwho">
              <span className="lp-src-name">{detail.name}</span>
              {/* two spaces after "@", as drawn (white-space: pre) */}
              <span className="lp-src-prole">
                {`${detail.role} @  `}
                <b>{detail.company}</b>
              </span>
            </span>
          </div>
          <span className="lp-src-rule lp-src-rule--1" />
          <div className="lp-src-grid">
            {detail.props.map((prop) => (
              <Prop key={prop.id} prop={prop} />
            ))}
          </div>
          <span className="lp-src-rule lp-src-rule--2" />
          <div className="lp-src-why">
            <p className="lp-src-why-k">{detail.whyLabel}</p>
            <p className="lp-src-why-h">{detail.whyHead}</p>
            <p className="lp-src-why-p">{detail.whyBody}</p>
          </div>
          <div className="lp-src-acts">
            <span className="lp-src-btn lp-src-btn--ink">
              <svg viewBox="0 0 13.333 13.333">
                <path d={STORY_SOURCES_PLUS} />
              </svg>
              <span>{detail.add}</span>
            </span>
            <span className="lp-src-btn lp-src-btn--line">
              <span>{detail.pass}</span>
            </span>
          </div>
        </div>
      </div>

      {nodes.length > 0 && (
        <div className="lp-src-hub">
          <div className="lp-src-hubart">
            {/* Figma paint order: the first disc, the colour dots, the other discs, the wires,
                then the disc that sits over the wires */}
            {under.slice(0, 1).map((node) => (
              <HubNode key={node.id} node={node} />
            ))}
            {hub.dots.map((dot) => (
              <span
                key={dot.color}
                className="lp-src-dot"
                style={{
                  background: `var(--lp-${dot.color})`,
                  left: `${dot.x}px`,
                  top: `${dot.y}px`,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                }}
              />
            ))}
            {under.slice(1).map((node) => (
              <HubNode key={node.id} node={node} />
            ))}
            <svg className="lp-src-wires" viewBox="0 0 752 489" width="752" height="489">
              {wires.map((node) => (
                <g key={node.id} data-node={node.id}>
                  <circle className="lp-src-cap" cx={f3(node.cap.x)} cy={f3(node.cap.y)} r="5.333" />
                  <path d={node.wire} />
                </g>
              ))}
              <g>
                <circle className="lp-src-hubdot" cx={hub.point.x} cy={hub.point.y} r="5.333" />
              </g>
            </svg>
            {over.map((node) => (
              <HubNode key={node.id} node={node} />
            ))}
          </div>
          {label && (
            <p className="lp-src-hublabel" data-placeholder={label.status === "placeholder" ? "" : undefined}>
              {label.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
