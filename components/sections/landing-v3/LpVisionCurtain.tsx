"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { ClaudeMark, PancakeMark } from "./LpClaudeScene";
import { DbTable, DbTableIcon } from "./LpVisionDb";
import { lpClaudeSerif } from "./lp-claude-font";
import { VISION_CURTAIN } from "./lp-vision-data";
import { DB_ARTIFACT, DB_HERO, DB_HERO_TABS } from "./lp-vision-tables";

/**
 * The window under the hero (2026-11-11), in the demo film's slot (the .lp-video section and
 * card: the same place, width and first-screen peek, video.css + hero.css). The founder: "un
 * espece de petit rideau qu'on peut deglisser a droite a gauche qui montre Claude d'un cote et
 * l'infra de l'autre", to show that Claude runs on Pancake.
 *
 * Two layers on one card, and a curtain between them:
 *   under   Pancake's companies table, the whole card wide (LpVisionDb's real table)
 *   over    Claude's window, drawn as the page's Claude scene draws it (its ground, its bubble,
 *           its serif, one white card per tool call under the Pancake mark), cut at --cut
 * Both share one grid of lines (--vc-head, --vc-row): each account Claude names sits on the line
 * of its own row in the table, so sliding the curtain over a line turns Claude's sentence into
 * the row it came from. The handle is a slider (pointer drag, arrow keys).
 *
 * It plays once, when its top crosses 60 % of the window (the page's play-once rule): the
 * question holds, the read and the answer come in line by line, then the curtain opens to its
 * rest and one datapoint lands in the table. Nothing loops and nothing replays. The server
 * markup is the END (every line in, the datapoint landed) with the curtain shut, which is what
 * the first screen's 70 px peek shows; reduced motion and no JS rest on the END with the curtain
 * at its rest (vision.css, the <noscript> below). A page opened already scrolled onto it gets the
 * END at once. Grabbing the handle ends the take.
 *
 * --cut is written on the card by hand (never through React state: a drag would re-render two
 * tables a frame); the reply's progress is --step, which each line compares to its own --at
 * (vision.css). Copy: lp-vision-data.ts VISION_CURTAIN; rows: lp-vision-tables.ts DB_HERO.
 */

/** where the curtain rests, % of the card from its left edge (Claude's share) */
const REST = 52;
/** how far a drag or a key may take it: the handle stays on the card */
const MIN = 3;
const MAX = 97;
/** the reply's last step (the markup's) */
const END = 6;
/** the take, ms from the moment it starts */
const T = { read: 900, say: 1500, picks: [1900, 2150, 2400], open: 3000, glide: 950, next: 4100, land: 4500 } as const;

const NOSCRIPT_CSS = `<style>.lp-vcut__card{--cut:${REST}%!important}</style>`;

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));
/** power2.inOut: no overshoot */
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

export function LpVisionCurtain() {
  const C = VISION_CURTAIN;
  const card = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  /** the curtain's place, % (the DOM holds it: see the header) */
  const cut = useRef(100);
  const [step, setStep] = useState<number>(END);
  const [landed, setLanded] = useState(true);
  const timers = useRef<number[]>([]);
  const frame = useRef(0);
  const dragging = useRef(false);

  const place = useCallback((value: number) => {
    cut.current = value;
    card.current?.style.setProperty("--cut", `${value}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(value)));
  }, []);

  /** ends the take where it is: every line in, the datapoint landed */
  const settle = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    cancelAnimationFrame(frame.current);
    setStep(END);
    setLanded(true);
  }, []);

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // reduced motion, or a page opened already scrolled onto the card: the END, at rest
    if (reduced || el.getBoundingClientRect().top < window.innerHeight * 0.45) {
      place(REST);
      return;
    }
    // frame 0, set while the card's body is still under the fold: the question alone
    setStep(0);
    setLanded(false);

    const glide = (from: number, to: number, ms: number) => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        place(from + (to - from) * ease(p));
        if (p < 1) frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    };
    const at = (ms: number, run: () => void) => timers.current.push(window.setTimeout(run, ms));
    const play = () => {
      at(T.read, () => setStep(1));
      at(T.say, () => setStep(2));
      T.picks.forEach((ms, i) => at(ms, () => setStep(3 + i)));
      at(T.open, () => glide(cut.current, REST, T.glide));
      at(T.next, () => setStep(END));
      at(T.land, () => setLanded(true));
    };
    // its top crosses 60 % of the window's height
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        play();
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
      cancelAnimationFrame(frame.current);
    };
  }, [place]);

  const moveTo = (clientX: number) => {
    const el = card.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    place(clamp(((clientX - box.left) / box.width) * 100));
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    settle();
    moveTo(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(event.clientX);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const by = event.shiftKey ? 10 : 4;
    const to =
      event.key === "ArrowLeft"
        ? cut.current - by
        : event.key === "ArrowRight"
          ? cut.current + by
          : event.key === "Home"
            ? MIN
            : event.key === "End"
              ? MAX
              : null;
    if (to === null) return;
    event.preventDefault();
    settle();
    place(clamp(to));
  };

  return (
    <section className="lp-video lp-vcut" data-grow-done="" aria-label={C.label}>
      <div
        ref={card}
        className={`lp-video__card lp-vcut__card ${lpClaudeSerif.variable}`}
        style={{ "--cut": "100%", "--step": step } as CSSProperties}
        data-live={landed ? undefined : "0"}
      >
        {/* under: Pancake's table */}
        <div className="lp-vcut__db" aria-hidden="true">
          <ul className="lp-vcut__tabs">
            {DB_HERO_TABS.map((tab, i) => (
              <li key={tab.name} data-on={i === 0 ? "" : undefined}>
                <DbTableIcon />
                {tab.name}
                <small>{tab.rows}</small>
              </li>
            ))}
          </ul>
          <DbTable table={DB_HERO} bar={false} tone="yellow" />
        </div>
        {/* over: Claude, cut at the curtain */}
        <div className="lp-vcut__claude" aria-hidden="true">
          <p className="lp-vcut__cbar">
            <ClaudeMark id="spark" className="lp-vcut__spark" />
            <b>{C.claude}</b>
            <span className="lp-vcut__plug">
              <PancakeMark className="lp-vcut__pk" />
              {C.connector}
            </span>
          </p>
          <div className="lp-vcut__col">
            <p className="lp-vcut__ask">{C.ask}</p>
            <p className="lp-vcut__line lp-vcut__tool" style={{ "--r": 1, "--at": 1 } as CSSProperties}>
              <PancakeMark className="lp-vcut__pk" />
              <span>{C.tool.title}</span>
              <em>{C.tool.done}</em>
            </p>
            <p className="lp-vcut__line lp-vcut__say" style={{ "--r": 2, "--at": 2 } as CSSProperties}>
              {C.say}
            </p>
            {C.picks.map((pick, i) => (
              <p key={pick.who} className="lp-vcut__line lp-vcut__pick" style={{ "--r": 3 + i, "--at": 3 + i } as CSSProperties}>
                <b>
                  {pick.who}
                  <span className="lp-vcut__size">, {pick.size}</span>.
                </b>{" "}
                <span className="lp-vcut__why">{pick.why}</span> <span className="lp-vcut__play">{pick.play}</span>
              </p>
            ))}
            <p className="lp-vcut__line lp-vcut__say" style={{ "--r": 7, "--at": END } as CSSProperties}>
              {C.next}
            </p>
            <p className="lp-vcut__box">{C.box}</p>
          </div>
          {/* the view Claude draws from the rows: seen once the curtain is slid right */}
          <div className="lp-vcut__art" style={{ "--at": 5 } as CSSProperties}>
            <p className="lp-vcut__art-t">{C.artifact}</p>
            <DbTable table={DB_ARTIFACT} theme="light" tone="yellow" bar={false} />
          </div>
        </div>
        <div
          ref={handle}
          className="lp-vcut__handle"
          role="slider"
          tabIndex={0}
          aria-label={C.handle}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={REST}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <span className="lp-vcut__grip" aria-hidden="true">
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M8 6l-4 4 4 4M12 6l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
    </section>
  );
}
