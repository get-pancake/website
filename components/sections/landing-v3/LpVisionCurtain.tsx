"use client";

import { Fragment, useEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { ClaudeMark, PancakeMark } from "./LpClaudeScene";
import { DbTable, DbTableIcon } from "./LpVisionDb";
import { lpClaudeSerif } from "./lp-claude-font";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import { VISION_CURTAIN } from "./lp-vision-data";
import { DB_ARTIFACT, DB_HERO, DB_HERO_TABS } from "./lp-vision-tables";

/**
 * The window under the hero (2026-11-11), in the demo film's slot (the .lp-video section and
 * card: the same place, width and first-screen peek, video.css + hero.css). The founder: "un
 * espece de petit rideau qu'on peut deglisser a droite a gauche qui montre Claude d'un cote et
 * l'infra de l'autre", to show that Claude runs on Pancake; then: "Je mettrai Pancake a gauche et
 * Claude a droite. J'animerai Claude et la database pour montrer que c'est dynamique."
 *
 * The picture is a known one (Mobbin: Rows' AI Analyst and Twenty's assistant, a chat docked on
 * the right of a table).
 *
 * Two layers on one card:
 *   under   Pancake's companies table, the whole card wide (LpVisionDb's real table)
 *   over    Claude's window, drawn as the page's Claude scene draws it (LpClaudeScene: the
 *           greeting, the composer with its Pancake connector, the bubble, one white card per
 *           tool call, the serif answer). It is a whole window as wide as the card, its
 *           conversation on its left, and it SLIDES: --cut is where its left edge stands. At rest
 *           the conversation is on show beside the table's first columns; pulled left, the window
 *           covers the table and shows the view Claude drew; pushed right, the table is bare.
 * On a phone the two stack: the table on top, Claude a sheet under it (no curtain there: 358 px is
 * too narrow to share).
 *
 * One take plays once (lp-play-once: prepared ahead, played when the card's top crosses 60 % of
 * the window, the picture on fly-by, never twice): lp-vision-curtain-timeline.ts. A signal lands
 * in the table and the Brain writes its Play; Claude's window slides in; the question is typed
 * and sent; Claude reads the tables and names three accounts while their rows light; told to, it
 * runs the first Play and the row goes live under its flag; the table keeps taking datapoints.
 * The server markup is the END picture, with the window shut (data-shut): the card's top peeks
 * over the first screen's fold, and a shut window is what the take's first frame shows there, so
 * nothing moves on the first screen when the code arrives. Without script (the <noscript> below)
 * and under reduced motion (vision.css) the END rests with the window at its rest.
 *
 * --cut is var(--cut-user, var(--cut-auto, var(--vc-rest))): the take writes --cut-auto, the
 * handle writes --cut-user and from then on the curtain is the visitor's (the take plays on).
 * Copy: lp-vision-data.ts VISION_CURTAIN; rows: lp-vision-tables.ts DB_HERO.
 */

/** how far a drag or a key may take the curtain, % of the card: the handle stays on it */
const MIN = 3;
const MAX = 97;
/** where it rests, for the slider's first value (vision.css --vc-rest) */
const REST = 56;
/** a page opened with the card's top above this share of the window has it in front of the
    visitor already: it rests on its END (lp-play-once `seenAbove`) */
const SEEN_ABOVE = 0.45;

const NOSCRIPT_CSS = "<style>.lp-vcut__card[data-shut]{--cut-auto:initial!important}</style>";

/** The take measures what it types and how tall Claude's lines are: it is built once the faces
    they are set in have arrived (the serif is fetched when its first line renders), or after
    2 s without them. */
const fontsIn = () =>
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((resolve) => window.setTimeout(resolve, 2000))]);

const loadTake = (): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-vision-curtain-timeline"), fontsIn()]).then(([{ gsap }, { buildVisionCurtain }]) => ({
    gsap,
    build: buildVisionCurtain,
  }));

const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

/** a line Claude streams: one span a word */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="lp-vcut__w">{word}</span>
        </Fragment>
      ))}
    </>
  );
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 13.9744 13.9744" aria-hidden="true" focusable="false">
      <path d="M6.9878 12.2276V1.74672M11.7915 6.55043L6.9878 1.74672L2.18408 6.55043" />
    </svg>
  );
}

function Plus() {
  return (
    <svg viewBox="0 0 17.4681 17.4681" aria-hidden="true" focusable="false">
      <path d="M3.05368 8.73358H14.4079M8.7308 3.05646V14.4107" />
    </svg>
  );
}

export function LpVisionCurtain() {
  const C = VISION_CURTAIN;
  const card = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  /** a drag under way: how far from the handle's centre it was grabbed (px) */
  const grab = useRef<number | null>(null);

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = el.getBoundingClientRect().top < window.innerHeight * SEEN_ABOVE;
    // the END at its rest, or the moment before the take until its own first frame is set (the
    // builder lifts data-live and sets data-open)
    if (reduced || seen) el.setAttribute("data-open", "");
    else el.setAttribute("data-live", "0");
    const unmount = mountPlayOnce({
      host: el,
      stage: el,
      designWidth: 1136,
      load: loadTake,
      restIsEnd: true,
      qa: { registry: "__lpVision", key: "curtain" },
      seenAbove: SEEN_ABOVE,
    });
    return () => {
      unmount();
      el.removeAttribute("data-open");
      el.removeAttribute("data-live");
      el.style.removeProperty("--cut-user");
    };
  }, []);

  /** where the curtain stands now, % of the card */
  const where = () => {
    const el = card.current;
    const h = handle.current;
    if (!el || !h) return REST;
    const box = el.getBoundingClientRect();
    const at = h.getBoundingClientRect();
    return box.width ? ((at.left + at.width / 2 - box.left) / box.width) * 100 : REST;
  };
  const place = (value: number) => {
    card.current?.style.setProperty("--cut-user", `${value}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(value)));
  };
  const moveTo = (clientX: number) => {
    const el = card.current;
    if (!el || grab.current === null) return;
    const box = el.getBoundingClientRect();
    if (box.width) place(clamp(((clientX - grab.current - box.left) / box.width) * 100));
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (event.pointerType === "mouse") event.preventDefault(); // no text selection, no image drag
    const at = event.currentTarget.getBoundingClientRect();
    grab.current = event.clientX - (at.left + at.width / 2);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => moveTo(event.clientX);
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    grab.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const by = event.shiftKey ? 10 : 4;
    const to =
      event.key === "ArrowLeft"
        ? where() - by
        : event.key === "ArrowRight"
          ? where() + by
          : event.key === "Home"
            ? MIN
            : event.key === "End"
              ? MAX
              : null;
    if (to === null) return;
    event.preventDefault();
    place(clamp(to));
  };

  return (
    <section className="lp-video lp-vcut" data-grow-done="" aria-label={C.label}>
      <div ref={card} className={`lp-video__card lp-vcut__card ${lpClaudeSerif.variable}`} data-shut="">
        {/* under: Pancake's table */}
        <div className="lp-vcut__db" aria-hidden="true">
          <div className="lp-vcut__dbar">
            <p className="lp-vcut__brand">
              <PancakeMark className="lp-vcut__pk" />
              {C.pancake}
            </p>
            <ul className="lp-vcut__tabs">
              {DB_HERO_TABS.map((tab, i) => (
                <li key={tab.name} data-tab={tab.name} data-on={i === 0 ? "" : undefined}>
                  <DbTableIcon />
                  {tab.name}
                  <small>{tab.rows}</small>
                </li>
              ))}
            </ul>
          </div>
          <DbTable table={DB_HERO} bar={false} tone="yellow" />
        </div>

        {/* over: Claude's window; it slides with the curtain */}
        <div className="lp-vcut__claude" aria-hidden="true">
          <div className="lp-vcut__col">
            <p className="lp-vcut__chead">
              <ClaudeMark id="spark" className="lp-vcut__spark" />
              {C.claude}
            </p>
            <div className="lp-vcut__view">
              {/* a new chat's greeting: the take's first picture of Claude, gone once it is asked */}
              <p className="lp-vcut__greet">
                <ClaudeMark id="spark" className="lp-vcut__greet-spark" />
                {C.greeting}
              </p>
              <div className="lp-vcut__thread">
                <p className="lp-vcut__bubble" data-n="1">
                  {C.ask}
                </p>
                <p className="lp-vcut__tool" data-n="1">
                  <PancakeMark className="lp-vcut__tool-mark" />
                  <span className="lp-vcut__tool-t">
                    <span data-full="">{C.tool.title}</span>
                    <span data-short="">{C.tool.short}</span>
                  </span>
                  <span className="lp-vcut__tool-r">
                    <span className="lp-vcut__tool-doing">{C.tool.doing}</span>
                    <span className="lp-vcut__tool-done">
                      <b data-to={C.tool.count}>{C.tool.count.toLocaleString("en-US")}</b> {C.tool.done}
                    </span>
                  </span>
                </p>
                <p className="lp-vcut__say" data-n="1">
                  <Words text={C.say} />
                </p>
                <ol className="lp-vcut__picks">
                  {C.picks.map((pick) => (
                    <li key={pick.who}>
                      <b className="lp-vcut__w">{pick.who}</b>
                      <span className="lp-vcut__w lp-vcut__size">, {pick.size}</span>
                      <span className="lp-vcut__w">.</span> <Words text={pick.why} />
                    </li>
                  ))}
                </ol>
                <p className="lp-vcut__say" data-n="2">
                  <Words text={C.next} />
                </p>
                <p className="lp-vcut__bubble" data-n="2">
                  {C.go}
                </p>
                <p className="lp-vcut__tool" data-n="2" data-run="">
                  <PancakeMark className="lp-vcut__tool-mark" />
                  <span className="lp-vcut__tool-t">
                    {C.run.title}
                    <i>{C.run.name}</i>
                  </span>
                  <span className="lp-vcut__tool-r">
                    <span className="lp-vcut__tool-doing">{C.run.doing}</span>
                    <span className="lp-vcut__tool-done">{C.run.done}</span>
                  </span>
                </p>
                <p className="lp-vcut__say" data-n="3">
                  <Words text={C.done} />
                </p>
              </div>
            </div>
            {/* the composer, docked: its placeholder, what is typed in it, its controls */}
            <div className="lp-vcut__bar">
              <p className="lp-vcut__ph" data-n="1">
                {C.placeholder}
              </p>
              <p className="lp-vcut__ph" data-n="2">
                {C.reply}
              </p>
              <p className="lp-vcut__typed" data-n="1">
                {C.ask}
              </p>
              <p className="lp-vcut__typed" data-n="2">
                {C.go}
              </p>
              <span className="lp-vcut__caret" />
              <p className="lp-vcut__ctrls">
                <span className="lp-vcut__plus">
                  <Plus />
                </span>
                <span className="lp-vcut__conn">
                  <PancakeMark className="lp-vcut__conn-mark" />
                  {C.connector}
                  <i />
                </span>
                <span className="lp-vcut__model">{C.model}</span>
                <span className="lp-vcut__send">
                  <ArrowUp />
                </span>
              </p>
            </div>
          </div>
          {/* the view Claude drew from the rows: on show once the window is pulled over the table */}
          <div className="lp-vcut__art">
            <p className="lp-vcut__art-h">
              <b>{C.artifact}</b>
              <span>
                <PancakeMark className="lp-vcut__pk" />
                {C.artifactFrom}
              </span>
            </p>
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
