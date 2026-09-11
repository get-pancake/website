"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PLAYS, type PlayStatus } from "./ag-copy";
import { useInView, useReducedMotion } from "./useInView";

/**
 * /agents — Super plays: the org chart. Mascot (bobbing at the draft's 1.1s)
 * over the plum "Pancake / runs the squad" label, three dotted curves with a
 * dot travelling down each (the draft's org-connector.svg, SMIL animateMotion
 * 0.8 / 0.95 / 1.1s), then three tinted columns of plays with a status dot.
 *
 * Simulation = the draft's "plays org chart" script, modelled as React state
 * (columns → rows {id, name, status, fx}): every 900ms while the section is in
 * view, a burst of 2–3 rows (a red one favoured 60 % of the time) drifts
 * green→orange or orange→red with a `hit` pulse; a red one retires (`out`:
 * fade + 24px slide, 220ms) and a FRESH pool name takes a random seat in the
 * column, green, rising in (`in`, 300ms). Row count per column never changes,
 * so the columns keep their height while it plays. Math.random only runs in
 * timers started from effects — the initial render is deterministic (hydration
 * safe). Reduced motion → the static initial state (no timer, no SMIL).
 * Each row carries an sr-only status ("healthy" / "fading" / "retiring")
 * that follows its dot — no live region, so the bursts stay silent.
 * Layout in agents/plays.css (.ag-plays*).
 */

type Fx = "hit" | "out" | "in" | null;
type Row = { id: number; name: string; status: PlayStatus; fx: Fx };

const COLS = PLAYS.columns;
const BURST_MS = 900; // draft: setInterval(burst, 900)
const STAGGER_MS = 120; // draft: picks fire i*120ms apart
const HIT_MS = 380; // draft: .play.hit removed after 380ms
const OUT_MS = 220; // draft: retire → replace after 220ms
const IN_MS = 300; // draft: .play.in removed after 300ms

/* screen-reader status per row — the state was colour-only (review #31).
   Updates with the row, deliberately with NO aria-live: the 900ms bursts
   must never be announced. SR text is the README's copy exception. */
const SR_STATUS: Record<PlayStatus, string> = { green: "healthy", orange: "fading", red: "retiring" };

/* The connector geometry, verbatim from draft-assets/org-connector.svg:
   three cubic curves from the label's foot (568,0) to each column's head. */
const CONNECTOR = [
  { d: "M 568 0 C 568 70 190 60 190 130", dur: "0.80s", end: [190, 130] },
  { d: "M 568 0 C 568 70 568 60 568 130", dur: "0.95s", end: [568, 130] },
  { d: "M 568 0 C 568 70 946 60 946 130", dur: "1.10s", end: [946, 130] },
] as const;

function initialColumns(): Row[][] {
  return COLS.map((col, ci) =>
    col.plays.map(([name, status], i) => ({ id: ci * 10 + i, name, status, fx: null })),
  );
}

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export function AgPlays() {
  const [rootRef, inView] = useInView<HTMLElement>();
  const reduced = useReducedMotion();
  const [cols, setCols] = useState<Row[][]>(initialColumns);
  const model = useRef<Row[][]>(cols); // mutable source of truth for the timers
  const nextId = useRef(100);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);

  const publish = useCallback(() => {
    setCols(model.current.map((c) => c.slice()));
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  /* one row changes state (the draft's tick) */
  const tick = useCallback(
    (id: number, ci: number) => {
      const col = model.current[ci]!;
      const row = col.find((r) => r.id === id);
      if (!row || row.fx === "out") return;
      if (row.status === "green" || row.status === "orange") {
        row.status = row.status === "green" ? "orange" : "red";
        row.fx = "hit";
        publish();
        later(HIT_MS, () => {
          if (row.fx === "hit") row.fx = null;
          publish();
        });
        return;
      }
      // red → retire, then a fresh pool name takes a random seat
      row.fx = "out";
      publish();
      later(OUT_MS, () => {
        const current = model.current[ci]!;
        const at = current.indexOf(row);
        if (at < 0) return;
        const names = current.map((r) => r.name);
        const pool = COLS[ci]!.pool;
        const fresh = pool.filter((n) => !names.includes(n));
        const name = fresh.length ? pick(fresh) : pool[0]!;
        const seat: Row = { id: nextId.current++, name, status: "green", fx: "in" };
        current.splice(at, 1);
        current.splice(Math.floor(Math.random() * (current.length + 1)), 0, seat);
        publish();
        later(IN_MS, () => {
          if (seat.fx === "in") seat.fx = null;
          publish();
        });
      });
    },
    [later, publish],
  );

  /* a burst = 2–3 different plays changing in the same beat (draft) */
  const burst = useCallback(() => {
    const n = 2 + (Math.random() < 0.35 ? 1 : 0);
    const picks: { id: number; ci: number }[] = [];
    let tries = 0;
    while (picks.length < n && tries++ < 20) {
      const ci = Math.floor(Math.random() * model.current.length);
      const plays = model.current[ci]!.filter((r) => r.fx !== "out");
      if (!plays.length) continue;
      const reds = plays.filter((r) => r.status === "red");
      const p = reds.length && Math.random() < 0.6 ? pick(reds) : pick(plays);
      if (picks.some((k) => k.id === p.id)) continue;
      picks.push({ id: p.id, ci });
    }
    picks.forEach((k, i) => later(i * STAGGER_MS, () => tick(k.id, k.ci)));
  }, [later, tick]);

  /* the loop runs only while the section intersects, never under reduced motion */
  useEffect(() => {
    if (!inView || reduced) return;
    burst();
    const interval = setInterval(burst, BURST_MS);
    return () => clearInterval(interval);
    // in-flight short timers (≤ 620ms) are left to finish their animation
  }, [inView, reduced, burst]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  /* SMIL is outside CSS animation-play-state: pause the travelling dots off-screen */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView]);

  return (
    <section ref={rootRef} id="ag-plays" className="ag-sec ag-plays" aria-labelledby="ag-plays-title">
      <div className="ag-sec__inner">
        <div className="ag-sec__head">
          <p className="ag-kicker">{PLAYS.kicker}</p>
          <h2 id="ag-plays-title" className="lp-title-section">
            {PLAYS.title}
          </h2>
          <p className="ag-lede">{PLAYS.lede}</p>
        </div>

        <div
          className="ag-plays__org"
          role="group"
          aria-label="Org chart: Pancake runs three squads of plays. Each play's status drifts from green to orange to red; a red play retires and a fresh one takes its seat."
        >
          <div className="ag-plays__root">
            <div className="ag-plays__bob">
              <img
                className="ag-plays__mascot"
                src="/pancake-monster.png"
                alt=""
                width={104}
                height={107}
                loading="lazy"
              />
            </div>
            <p className="ag-plays__label">
              <b>{PLAYS.rootName}</b>
              <span>{PLAYS.rootRole}</span>
            </p>
          </div>

          {/* desktop connector (draft org-connector.svg); hidden ≤1024 */}
          <svg
            ref={svgRef}
            className="ag-plays__connector"
            viewBox="0 0 1136 130"
            width="1136"
            height="130"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            {CONNECTOR.map((c, i) => (
              <path
                key={`line-${i}`}
                className="ag-plays__line"
                d={c.d}
                strokeWidth="2"
                strokeDasharray="1 7"
                strokeLinecap="round"
              />
            ))}
            {CONNECTOR.map((c, i) =>
              reduced ? (
                /* static: the dot rests at the column end of its curve */
                <circle key={`spark-${i}`} className="ag-plays__spark" r="5" cx={c.end[0]} cy={c.end[1]} />
              ) : (
                <circle key={`spark-${i}`} className="ag-plays__spark" r="5">
                  <animateMotion dur={c.dur} repeatCount="indefinite" path={c.d} />
                </circle>
              ),
            )}
          </svg>
          {/* ≤1024 stand-in for the connector: one short dotted stem with its own travelling dot */}
          <div className="ag-plays__stem" aria-hidden="true" />

          <div className="ag-plays__cols">
            {COLS.map((col, ci) => (
              <div key={col.title} className={`ag-plays__col ag-tint--${col.tint}`}>
                <h3 className="ag-title-sm ag-plays__col-title">{col.title}</h3>
                <ul className="ag-plays__list">
                  {cols[ci]!.map((row) => (
                    <li
                      key={row.id}
                      className={`ag-plays__play${row.fx ? ` ag-plays__play--${row.fx}` : ""}`}
                    >
                      <span className="ag-plays__dot" data-status={row.status} aria-hidden="true" />
                      <span className="ag-plays__name">{row.name}</span>
                      {/* leading ", " so readers pause between name and state */}
                      <span className="lp-sr-only">{`, ${SR_STATUS[row.status]}`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
