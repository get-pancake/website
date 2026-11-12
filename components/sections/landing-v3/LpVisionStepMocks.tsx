import type { CSSProperties } from "react";

import { PancakeMark } from "./LpClaudeScene";
import { DbTableIcon } from "./LpVisionDb";
import { s1Graph } from "./lp-step-data";
import {
  VSTEP_ACCOUNT,
  VSTEP_BRAIN,
  VSTEP_SIGNALS,
  VSTEP_SOURCES,
  VSTEP_TABLES,
  type VisionStepVariant,
} from "./lp-vision-data";

/**
 * The three pictures of the vision homepage's 1-2-3 (LpVisionSteps.tsx, 2026-11-11), each on the
 * designer's 464 × 426 step stage (steps.css .lp-step-stage: it scales as pixels with its card).
 * They are built from the step cards' own pieces: the white pill and its hairline, the infra
 * wire, the kit's pancake face as a hub and the Play's pink tile (the "Ask anything" card), and
 * the designer's Brain itself (the "Watch it get better" card's graph, lp-step-data.ts s1Graph,
 * drawn by steps.css .lp-s1-*, in the pose it took beside its leads, cards to its right).
 *   v1  your sources, as four marks, wired into Pancake, which fills two tables
 *   v2  six kinds of market signal, each beside a well-known source; four land as dots on one
 *       account, and a line connects the dots
 *   v3  that account comes up beside the Brain; the Brain pings and grows; the next best Play
 *       comes up under the account, with who, when and why
 * The markup is each picture's END (lp-play-once restIsEnd: reduced motion and a page without
 * script rest on it); lp-vision-step-timelines.ts sets the first frame and plays it once.
 * Styles: vision.css (.lp-vs*). No "use client": rendered inside LpVisionStepAnim.
 */

/** the kit's pancake face (pancake-top-bordered-1's front, as LpStepMocks' S4_FACE: the white,
    flat, imperfect round the "Ask anything" card puts Claude on), cropped to the face's bounds */
const FACE = {
  viewBox: "1.174 0 45.644 44",
  d: "M25.8574 44C32.9581 44 38.6359 39.0738 42.5251 34.0941C45.1946 30.676 46.7768 26.3604 46.8178 21.5257C46.9187 9.59842 37.0065 -6.85743e-06 24.912 -6.85743e-06C12.8175 -6.85743e-06 2.53285 8.45015 1.27222 21.5257C0.507207 29.4599 4.33637 33.7665 8.65839 37.3008C12.9509 40.8109 19.8905 44 25.8574 44Z",
} as const;

function Mark({ src, className }: { src: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- a vendor's own mark, unmodified
  return <img className={className} src={src} alt="" width={30} height={30} loading="lazy" decoding="async" />;
}

/* ── 01 · your sources into Pancake, which fills the tables ── */

/** the four tiles' left edges, and the axis each one's wire drops on */
const TILE_X = [40, 140, 240, 340] as const;

function V1Stage() {
  return (
    <div className="lp-step-stage lp-step-stage--v1" aria-hidden="true">
      <i className="lp-sx-bg" />
      {VSTEP_SOURCES.map((source, i) => (
        <div key={source.id} className="lp-vs-piece lp-vs1-tile" style={{ left: TILE_X[i] }}>
          <Mark src={source.logo} />
          <span>{source.label}</span>
          {/* connected */}
          <i className="lp-vs1-on" />
        </div>
      ))}
      {/* each tile's wire down to the line they share, then the one wire into Pancake */}
      {TILE_X.map((x, i) => (
        <i key={x} className="lp-vs-wire lp-vs1-drop" data-i={i} style={{ left: x + 41.5 }} />
      ))}
      <i className="lp-vs-wire lp-vs1-bus" data-seg="a" />
      <i className="lp-vs-wire lp-vs1-bus" data-seg="b" />
      <i className="lp-vs-wire lp-vs1-bus" data-seg="c" />
      <i className="lp-vs-wire lp-vs1-trunk" data-at="in" />
      {/* out of Pancake: one wire, split to the two tables */}
      <i className="lp-vs-wire lp-vs1-trunk" data-at="out" />
      <i className="lp-vs-wire lp-vs1-split" data-side="l" />
      <i className="lp-vs-wire lp-vs1-split" data-side="r" />
      <i className="lp-vs-wire lp-vs1-leg" data-side="l" />
      <i className="lp-vs-wire lp-vs1-leg" data-side="r" />
      {VSTEP_TABLES.map((table, i) => (
        <div key={table.name} className="lp-vs-piece lp-vs1-table" data-side={i === 0 ? "l" : "r"}>
          <DbTableIcon />
          <b>{table.name}</b>
          <em data-to={table.rows}>{table.rows.toLocaleString("en-US")}</em>
        </div>
      ))}
      {/* Pancake, over its wires' ends */}
      <span className="lp-vs-hub">
        <svg className="lp-vs-hub__face" viewBox={FACE.viewBox} focusable="false">
          <path d={FACE.d} />
        </svg>
        <PancakeMark className="lp-vs-hub__mark" />
      </span>
    </div>
  );
}

/* ── 02 · market signals land on one account; a line connects the dots ── */

const DOTS = VSTEP_SIGNALS.flatMap((signal) => (signal.dot ? [{ ...signal.dot, id: signal.id, tone: signal.tone }] : [])).sort(
  (a, b) => a.order - b.order,
);
/** the line through the dots, then on past the last one, the way it was heading, to an open
    arrowhead (the brand's arrow: a round stroke and an open head, no dot on a node's edge) */
const LINE = (() => {
  const last = DOTS[DOTS.length - 1];
  const prev = DOTS[DOTS.length - 2];
  const len = Math.hypot(last.x - prev.x, last.y - prev.y);
  const ux = (last.x - prev.x) / len;
  const uy = (last.y - prev.y) / len;
  const tip = { x: last.x + ux * 34, y: last.y + uy * 34 };
  const wing = (turn: number) => {
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    return { x: tip.x - (ux * cos - uy * sin) * 9, y: tip.y - (ux * sin + uy * cos) * 9 };
  };
  const a = wing(0.52);
  const b = wing(-0.52);
  const n = (v: number) => Math.round(v * 10) / 10;
  return {
    path: `M${DOTS.map((dot) => `${dot.x} ${dot.y}`).join("L")}L${n(tip.x)} ${n(tip.y)}`,
    head: `M${n(a.x)} ${n(a.y)}L${n(tip.x)} ${n(tip.y)}L${n(b.x)} ${n(b.y)}`,
  };
})();

function V2Stage() {
  return (
    <div className="lp-step-stage lp-step-stage--v2" aria-hidden="true">
      <i className="lp-sx-bg" />
      {VSTEP_SIGNALS.map((signal, i) => (
        <div
          key={signal.id}
          className="lp-vs-piece lp-vs2-chip"
          data-id={signal.id}
          data-tone={signal.tone}
          data-quiet={signal.dot ? undefined : ""}
          style={{ left: 26 + 140 * (i % 3), top: 40 + 44 * Math.floor(i / 3) }}
        >
          <Mark src={signal.logo} />
          <span>{signal.label}</span>
          <i className="lp-vs2-led" />
        </div>
      ))}
      {/* the account: what you already know of it, and what the market now says */}
      <div className="lp-vs-piece lp-vs2-card">
        <p className="lp-vs2-name">
          <b>{VSTEP_ACCOUNT.name}</b>
          <span>{VSTEP_ACCOUNT.size}</span>
        </p>
        <span className="lp-vs2-own">{VSTEP_ACCOUNT.own}</span>
        <i className="lp-vs2-rule" />
      </div>
      <svg className="lp-vs2-line" viewBox="0 0 464 426" focusable="false">
        <path className="lp-vs2-path" d={LINE.path} pathLength={1} />
        <path className="lp-vs2-head" d={LINE.head} />
      </svg>
      {DOTS.map((dot) => (
        <div key={dot.id} className="lp-vs2-dot" data-id={dot.id} data-tone={dot.tone} style={{ left: dot.x, top: dot.y }}>
          <i />
          <span>{dot.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 03 · the designer's Brain; an account reaches it; the next best Play comes up ── */

function V3Stage() {
  const b = VSTEP_BRAIN;
  // The designer's graph, whole: every edge drawn, every dot there (the picture's END). `data-grow`
  // marks what the young Brain does not have yet: the take hides those, then grows them.
  const { edges, dots } = s1Graph();
  return (
    <div className="lp-step-stage lp-step-stage--v3" aria-hidden="true">
      <i className="lp-sx-bg" />
      <div className="lp-s1-graph">
        <svg className="lp-s1-edges" viewBox="0 0 464 426" xmlns="http://www.w3.org/2000/svg">
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              data-len={e.len}
              data-hub={e.hub}
              data-grow={e.rest ? undefined : ""}
              style={{ strokeDasharray: e.len, strokeDashoffset: 0 }}
            />
          ))}
        </svg>
        <div className="lp-s1-nodes">
          {dots.map((d, i) => (
            <i
              key={i}
              className="lp-s1-dot"
              data-rest=""
              data-hub={d.hub}
              data-grow={d.rest ? undefined : ""}
              style={{ left: d.x - d.r, top: d.y - d.r, width: 2 * d.r, height: 2 * d.r, background: d.fill }}
            />
          ))}
        </div>
        {/* the ping an account sends through the Brain, from its centre */}
        <i className="lp-s1-cping" />
        <i className="lp-s1-center" />
      </div>
      <p className="lp-vs3-brain">{b.brain}</p>
      {/* beside it (where its leads stood): the account and what crossed on it, then the Play */}
      <div className="lp-vs3-card lp-vs3-account">
        <b>{b.account.name}</b>
        <span>{b.account.facts}</span>
      </div>
      <div className="lp-vs3-card lp-vs3-play">
        <i className="lp-vs3-play-icon">
          <svg viewBox="0 0 16 16" focusable="false">
            <path d="M5.5 3.8v8.4L12 8z" />
          </svg>
        </i>
        <p className="lp-vs3-play-k">{b.play.kicker}</p>
        <p className="lp-vs3-play-n">{b.play.name}</p>
        <i className="lp-vs3-play-rule" />
        {b.play.rows.map((row, k) => (
          <p key={row.k} className="lp-vs3-play-row" style={{ top: 60 + 32 * k } as CSSProperties}>
            <span>{row.k}</span>
            <b>{row.v}</b>
          </p>
        ))}
      </div>
    </div>
  );
}

const STAGES: Record<VisionStepVariant, () => JSX.Element> = { v1: V1Stage, v2: V2Stage, v3: V3Stage };

export function LpVisionStepStage({ variant }: { variant: VisionStepVariant }) {
  const Stage = STAGES[variant];
  return <Stage />;
}
