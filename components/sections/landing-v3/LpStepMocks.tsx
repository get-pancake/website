import {
  S1_ROWS,
  S1_SKELETON_TOPS,
  S2_BLOB,
  S2_CHECK_D,
  S2_ITEMS,
  S2_PROC,
  S2_ROWS,
  S2_ROW_TOP,
  S3_CHIPS,
  S3_DAYS,
  S3_RULE_TOPS,
  S3_TICK_TOPS,
  s1Graph,
  type S2Row,
} from "./lp-step-data";
import type { StepVariant } from "./lp-step-timelines";

/**
 * The three step mock UIs — the pancake-studio compositions' markup
 * (shorts/brain-research-loop, pipeline-checklist-loop, meetings-calendar-
 * loop) as DOM, with their geometry in steps.css. Rest state = the
 * composition's FRAME 0, i.e. what the mp4's poster showed (the empty URL
 * input, the Agents list, the empty week): every animation-only layer is
 * invisible at rest and driven by lp-step-timelines.ts from there. Purely
 * decorative — the host carries the alt text (LpStepAnim.tsx).
 */

/* ── step 01 · URL input → the knowledge graph → the market profile ── */

function S1Stage() {
  const { edges, dots } = s1Graph();
  return (
    <div className="lp-step-stage lp-step-stage--s1" aria-hidden="true">
      <div className="lp-s1-ui">
        <div className="lp-s1-input">
          <span className="lp-s1-ph">example.com</span>
          {/* revealed glyph by glyph with a clip inset (advance widths in lp-step-data.ts) */}
          <span className="lp-s1-typed">studio-pelican.com</span>
          <i className="lp-s1-caret" />
        </div>
        <div className="lp-s1-btn">
          <span className="lp-s1-btntxt">Start research</span>
        </div>
        <i className="lp-s1-ring" />
        <img className="lp-s1-cursor" src="/lp/lp-s1-cursor.svg" alt="" width={51} height={53} loading="lazy" decoding="async" />
      </div>

      <div className="lp-s1-graph">
        {/* edges draw in from the hub end: dash = the line's own length, fully offset at rest */}
        <svg className="lp-s1-edges" viewBox="0 0 464 426" xmlns="http://www.w3.org/2000/svg">
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              data-len={e.len}
              style={{ strokeDasharray: e.len, strokeDashoffset: e.len }}
            />
          ))}
        </svg>
        <div className="lp-s1-nodes">
          {dots.map((d, i) => (
            <i
              key={i}
              className="lp-s1-dot"
              style={{ left: d.x - d.r, top: d.y - d.r, width: 2 * d.r, height: 2 * d.r, background: d.fill }}
            />
          ))}
        </div>
        <i className="lp-s1-bping" />
        <i className="lp-s1-center" />
        <p className="lp-s1-clabel">Studio Pelican</p>
      </div>

      <div className="lp-s1-panel">
        <p className="lp-s1-ptitle">Market profile</p>
        <p className="lp-s1-psub lp-s1-sub-a">Researching...</p>
        <p className="lp-s1-psub lp-s1-sub-b">5 insights</p>
        {S1_SKELETON_TOPS.map((top) => (
          <div key={top} className="lp-s1-srow" style={{ top }}>
            <i className="lp-s1-skel lp-s1-skel--sq" />
            <i className="lp-s1-skel lp-s1-skel--bar" />
          </div>
        ))}
        {S1_ROWS.map((r) => (
          <div key={r.name} className="lp-s1-row" style={{ top: r.top }}>
            <i className="lp-s1-rdot" />
            <p className="lp-s1-rname">{r.name}</p>
            <p className="lp-s1-rsub">{r.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── step 02 · the Agents list → the Pipeline checklist, worked through → back ── */

/** an agent's pancake face: blob + masked pancake stack + two eyes (the eye
    groups are what the timeline blinks) */
function S2Face({ r, i }: { r: S2Row; i: number }) {
  const id = `lps2-fm${i}`;
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={S2_BLOB} fill={r.blob} />
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
          <path d={S2_BLOB} fill="#fff" />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        {/* pancakes box at (4.8,4.8): sides at (0.01,py), top at (0.71,py) — Figma "pancakes" group */}
        <path
          d={r.sides.d}
          fill={r.sidesFill}
          transform={`translate(4.81 ${(4.8 + r.py).toFixed(2)})`}
          opacity={r.sidesOpacity ?? 1}
        />
        <path d={r.top.d} fill={r.topFill} transform={`translate(5.51 ${(4.8 + r.py).toFixed(2)})`} />
        {r.eyes.map((e, k) => {
          const cx = e.x + e.w / 2;
          const cy = e.y + e.h / 2;
          const rx = k === 0 ? 5.74958 / 2 : 4.49892 / 2;
          const ry = k === 0 ? 3.95939 / 2 : 3.09814 / 2;
          return (
            <g key={k} transform={`translate(${cx.toFixed(4)} ${cy.toFixed(4)})`}>
              <g className="lp-s2-eye">
                <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#2C002A" transform={`rotate(${e.rot})`} />
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function S2Stage() {
  return (
    <div className="lp-step-stage lp-step-stage--s2" aria-hidden="true">
      {/* card body: an SVG rect so its y/height can be tweened while the corner radius + stroke stay true */}
      <svg className="lp-s2-cardsvg" viewBox="0 0 464 426" xmlns="http://www.w3.org/2000/svg">
        <rect className="lp-s2-cardrect" x="68.75" y="101" width="327.5" height="356" rx="32.25" />
      </svg>

      <p className="lp-s2-title">Agents</p>

      <div className="lp-s2-rows">
        {S2_ROWS.map((r, i) => (
          <div key={r.name} className="lp-s2-arow" style={{ top: S2_ROW_TOP(i) }}>
            {i === 0 && <i className="lp-s2-pill" />}
            <div className="lp-s2-face">
              <S2Face r={r} i={i} />
            </div>
            <div className="lp-s2-txt">
              <span className="lp-s2-name">{r.name}</span>
              <span className="lp-s2-count">{r.count}</span>
            </div>
            {i === 0 && (
              <div className="lp-s2-chev">
                <svg viewBox="0 0 8.5 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 4.25L4.25 0.5L8 4.25" stroke="#85687C" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0.5 8.75L4.25 12.5L8 8.75" stroke="#85687C" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="lp-s2-items">
        {S2_ITEMS.map((it) => (
          <div key={it.label} className="lp-s2-crow" style={{ top: it.top }}>
            <div className="lp-s2-cb">
              <i className="lp-s2-cb-off" />
              <div className="lp-s2-cb-on">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d={S2_CHECK_D} />
                </svg>
              </div>
            </div>
            <span className={"lp-s2-lbl" + (it.muted ? " lp-s2-lbl--muted" : "")}>
              {it.label}
              <i className="lp-s2-strike" />
            </span>
          </div>
        ))}
      </div>

      {/* the travelling highlight card: one label per processed item, shown while the card sits on that row */}
      <div className="lp-s2-hl">
        <i className="lp-s2-hcb" />
        {S2_PROC.map((k) => (
          <p key={k} className="lp-s2-hlbl">
            {S2_ITEMS[k].label}
          </p>
        ))}
        <div className="lp-s2-spin">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10.5" stroke="#B0CBFF" strokeWidth="3" />
            <path
              d="M17.25 2.90673C18.8462 3.8283 20.1717 5.1538 21.0933 6.75C22.0148 8.3462 22.5 10.1569 22.5 12"
              stroke="#4660E7"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── step 03 · the October week fills up, day by day ── */

function S3Stage() {
  return (
    <div className="lp-step-stage lp-step-stage--s3" aria-hidden="true">
      <div className="lp-s3-card">
        <p className="lp-s3-title">October 2026</p>

        {S3_DAYS.map((d, i) => (
          <div key={d.name} className={"lp-s3-day" + (i === 0 ? " lp-s3-day--today" : "")} style={{ left: d.left }}>
            <span className="lp-s3-dname">{d.name}</span>
            {/* regular + semibold copies of the number: the day in the circle shows the semibold one */}
            <span className="lp-s3-num" style={{ left: d.numLeft }}>
              <span className="lp-s3-rg">{d.num}</span>
              <span className="lp-s3-sb">{d.num}</span>
            </span>
          </div>
        ))}
        <i className="lp-s3-circle" />

        <i className="lp-s3-rule-h" />
        {S3_RULE_TOPS.map((top) => (
          <i key={top} className="lp-s3-rule" style={{ top }} />
        ))}
        {S3_TICK_TOPS.map((top) => (
          <i key={top} className="lp-s3-tick" style={{ top }} />
        ))}

        <div className="lp-s3-chips">
          {S3_CHIPS.map((c) => (
            <div
              key={c.id}
              className={`lp-s3-chip lp-s3-chip--${c.color} lp-s3-chip--h${c.h}`}
              style={{ left: c.x, top: c.top }}
            >
              <i className="lp-s3-bar" />
              <div className="lp-s3-ctxt">
                {c.lines.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
              {/* outcome badge, stamped on the chip's top-right corner once the meeting is past */}
              <div className={"lp-s3-badge " + (c.outcome === "closed" ? "lp-s3-badge--closed" : "lp-s3-badge--follow")}>
                {c.outcome === "closed" ? (
                  <>
                    <svg viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1.6 4.3 3.3 5.9 6.5 2.2"
                        stroke="#ffffff"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Closed</span>
                  </>
                ) : (
                  <span>→ follow-up</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STAGES: Record<StepVariant, () => JSX.Element> = {
  s1: S1Stage,
  s2: S2Stage,
  s3: S3Stage,
};

export function LpStepStage({ variant }: { variant: StepVariant }) {
  const Stage = STAGES[variant];
  return <Stage />;
}
