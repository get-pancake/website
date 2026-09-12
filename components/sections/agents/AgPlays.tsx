"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { PLAYS, PLAY_STATE } from "./ag-copy";
import { useInView, useReducedMotion } from "./useInView";

/**
 * /agents — Super plays: the org chart, rebuilt around the RUN behind each
 * play (founder 2026-09-11 on the preview: the drifting status dots "don't
 * add value — get inspired by the Grok Bot page"). Grok Bot's device: pick a
 * team, open an example, read what the bot did overnight and what landed in
 * your lap. So: the mascot still "runs the squad" over three tinted lanes
 * (the dotted connector, the ≤1024 stem), but every play is a RUN CARD —
 * name + state (dot + word), what it does, and, when open, a three-line run
 * log whose last line is what lands in your lap (green marker).
 *
 * ONE card per lane is open at a time (a radio-like disclosure group, not a
 * toggle: a lane never shows zero runs). Rotation = one 2s clock while the
 * section intersects and motion is allowed: tick k advances lane k mod 3, so
 * each lane moves every 6s and the three lanes are 2s apart — only one card
 * opens at any moment. Holds are refs the tick reads: a pointer resting on
 * a lane (non-touch), keyboard focus inside it, and a fresh interaction
 * (click, tap, pointer-leave, blur → the lane rests ≥ REST_MS before its
 * next slot) all make the lane skip its slot; it rejoins on its own phase,
 * so the lanes never drift into opening together. Off-screen = no clock;
 * reduced motion / phones (≤767, tap to expand — a self-moving accordion
 * on a phone is a bug) = no clock, first card of each lane open.
 *
 * Lane height never moves: every card carries its log inside a clipped
 * box whose open height is ONE shared value — the tallest log across all
 * twelve (measured after mount and on any resize, `--ag-plays-log-h`) —
 * and the outgoing box collapses over the same 200ms curve the incoming
 * one expands with, so the sum is constant at every frame (plays.css).
 * SSR = first cards open with their log visible (no-JS readers see the
 * runs); the log lines' rise-in is gated on `data-inview` (a <noscript>
 * style lets them play without JS). No Math.random, no aria-live.
 */

const LANES = PLAYS.lanes;
const N_LANES = LANES.length;
const DWELL_MS = 6000; // a lane's period: 6s per open card
const STAGGER_MS = DWELL_MS / N_LANES; // 2s between lanes → one opening at a time
const REST_MS = 5500; // a lane rests this long after an interaction before its next slot (≈ one dwell, minus timer jitter)

type LaneState = { idx: number; epoch: number };

/* The connector geometry, verbatim from draft-assets/org-connector.svg:
   three cubic curves from the label's foot (568,0) to each lane's head. */
const CONNECTOR = [
  { d: "M 568 0 C 568 70 190 60 190 130", dur: "0.80s", end: [190, 130] },
  { d: "M 568 0 C 568 70 568 60 568 130", dur: "0.95s", end: [568, 130] },
  { d: "M 568 0 C 568 70 946 60 946 130", dur: "1.10s", end: [946, 130] },
] as const;

const cardId = (li: number, pi: number, part: string) => `ag-plays-${li}-${pi}-${part}`;

export function AgPlays() {
  const [rootRef, inView] = useInView<HTMLElement>();
  const reduced = useReducedMotion();
  const [phone, setPhone] = useState(false);
  const [lanes, setLanes] = useState<LaneState[]>(() => LANES.map(() => ({ idx: 0, epoch: 0 })));
  const [logH, setLogH] = useState<number | null>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  /* holds, read by the clock (no re-render needed) */
  const hover = useRef<boolean[]>(LANES.map(() => false));
  const focus = useRef<boolean[]>(LANES.map(() => false));
  const restUntil = useRef<number[]>(LANES.map(() => 0));

  /* phones: tap to expand, no clock (matchMedia, live) */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* the shared open-log height: the tallest of the twelve logs, laid out at
     their natural height inside the clipped boxes (a wrapped line at a
     narrow width makes one taller — every box opens to that). Re-measured
     on any log resize (viewport, font swap). */
  useEffect(() => {
    const root = lanesRef.current;
    if (!root) return;
    const logs = Array.from(root.querySelectorAll<HTMLElement>(".ag-plays__log"));
    const measure = () => {
      let h = 0;
      for (const log of logs) h = Math.max(h, log.offsetHeight);
      setLogH(h);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    logs.forEach((log) => ro.observe(log));
    return () => ro.disconnect();
  }, []);

  const rest = useCallback((li: number) => {
    restUntil.current[li] = Date.now() + REST_MS;
  }, []);

  /* open card `pi` of lane `li`: bumps the lane's epoch so the run lines
     re-mount and rise in; a click on the already-open card only rests the
     lane (it stays open — one card per lane, always) */
  const openCard = useCallback(
    (li: number, pi: number) => {
      rest(li);
      setLanes((s) => (s[li]!.idx === pi ? s : s.map((v, i) => (i === li ? { idx: pi, epoch: v.epoch + 1 } : v))));
    },
    [rest],
  );

  /* the clock: first tick after one dwell (the first cards get their 6s),
     then every 2s → lane k mod 3. A held or resting lane skips its slot. */
  useEffect(() => {
    if (!inView || reduced || phone) return;
    let k = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const li = k % N_LANES;
      k += 1;
      if (hover.current[li] || focus.current[li] || Date.now() < restUntil.current[li]!) return;
      setLanes((s) =>
        s.map((v, i) => (i === li ? { idx: (v.idx + 1) % LANES[i]!.plays.length, epoch: v.epoch + 1 } : v)),
      );
    };
    const first = setTimeout(() => {
      tick();
      interval = setInterval(tick, STAGGER_MS);
    }, DWELL_MS);
    return () => {
      clearTimeout(first);
      if (interval) clearInterval(interval);
    };
  }, [inView, reduced, phone]);

  /* SMIL is outside CSS animation-play-state: pause the travelling dots off-screen */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView]);

  /* a pointer resting on a lane holds it (WCAG 2.2.2: the run must not
     switch under a reader's mouse); a touch pointer leaves as soon as the
     finger lifts, so a tap never parks a lane. Leaving = an interaction:
     the lane rests before its next slot instead of flipping under a
     pointer that just left. */
  const onPointerEnter = (li: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") hover.current[li] = true;
  };
  const onPointerLeave = (li: number) => () => {
    if (hover.current[li]) rest(li);
    hover.current[li] = false;
  };
  /* keyboard focus inside a lane holds it; a mouse click focuses a card
     without :focus-visible and is handled by the click's rest instead */
  const onFocus = (li: number) => (e: FocusEvent<HTMLDivElement>) => {
    let visible = true;
    try {
      visible = (e.target as HTMLElement).matches(":focus-visible");
    } catch {
      /* older engines: treat any focus as keyboard focus */
    }
    if (visible) focus.current[li] = true;
  };
  const onBlur = (li: number) => (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    if (focus.current[li]) rest(li);
    focus.current[li] = false;
  };

  return (
    <section ref={rootRef} id="ag-plays" className="ag-sec ag-plays" aria-labelledby="ag-plays-title">
      {/* no JS = no data-inview: the run lines' rise-in would sit paused on
          its first frame (opacity 0) — let them play to their settled state */}
      <noscript>
        <style>{`.ag-plays{--ag-plays-play:running}`}</style>
      </noscript>
      <div className="ag-sec__inner">
        <div className="ag-sec__head">
          <p className="ag-kicker">{PLAYS.kicker}</p>
          <h2 id="ag-plays-title" className="lp-title-section">
            {PLAYS.title}
          </h2>
          <p className="ag-lede">{PLAYS.lede}</p>
        </div>

        <div className="ag-plays__org">
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
                className="ag-plays__line-path"
                d={c.d}
                strokeWidth="2"
                strokeDasharray="1 7"
                strokeLinecap="round"
              />
            ))}
            {CONNECTOR.map((c, i) =>
              reduced ? (
                /* static: the dot rests at the lane end of its curve */
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

          <div
            ref={lanesRef}
            className="ag-plays__lanes"
            style={logH === null ? undefined : ({ "--ag-plays-log-h": `${logH}px` } as CSSProperties)}
          >
            {LANES.map((lane, li) => (
              <div
                key={lane.title}
                className={`ag-plays__lane ag-tint--${lane.tint}`}
                onPointerEnter={onPointerEnter(li)}
                onPointerLeave={onPointerLeave(li)}
                onFocus={onFocus(li)}
                onBlur={onBlur(li)}
              >
                <h3 className="ag-title-sm ag-plays__lane-title">{lane.title}</h3>
                <ul className="ag-plays__list">
                  {lane.plays.map((play, pi) => {
                    const open = lanes[li]!.idx === pi;
                    const epoch = lanes[li]!.epoch;
                    return (
                      <li
                        key={play.name}
                        className="ag-plays__card"
                        data-status={play.status}
                        data-open={open ? "" : undefined}
                      >
                        <button
                          type="button"
                          className="ag-plays__head"
                          aria-expanded={open}
                          aria-controls={cardId(li, pi, "log")}
                          aria-labelledby={cardId(li, pi, "name")}
                          aria-describedby={`${cardId(li, pi, "state")} ${cardId(li, pi, "does")}`}
                          onClick={() => openCard(li, pi)}
                        >
                          <span className="ag-plays__row">
                            <span id={cardId(li, pi, "name")} className="ag-plays__name">
                              {play.name}
                            </span>
                            <span id={cardId(li, pi, "state")} className="ag-plays__state">
                              <span className="ag-plays__dot" aria-hidden="true" />
                              {PLAY_STATE[play.status]}
                            </span>
                          </span>
                          <span id={cardId(li, pi, "does")} className="ag-plays__does">
                            {play.does}
                          </span>
                        </button>
                        {/* the run log: always in the DOM (measured, and the
                            SSR'd open card shows it), clipped to 0 when
                            closed. The open card's lines are keyed by the
                            lane's epoch so every opening re-mounts them and
                            replays the rise-in. */}
                        <div className="ag-plays__reveal">
                          <ol id={cardId(li, pi, "log")} className="ag-plays__log" aria-hidden={open ? undefined : true}>
                            {play.run.map((line, i) => (
                              <li
                                key={open ? `${epoch}-${i}` : `s-${i}`}
                                className="ag-plays__line"
                                style={{ "--ag-plays-i": i } as CSSProperties}
                              >
                                <span className="ag-plays__mark" aria-hidden="true" />
                                {line}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
