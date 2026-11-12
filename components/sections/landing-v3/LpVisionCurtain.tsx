"use client";

import { Fragment, useEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { ClaudeMark, PancakeMark } from "./LpClaudeScene";
import { DbTable, DbTableIcon } from "./LpVisionDb";
import { LpHeroInstall } from "./LpHeroInstall";
import { lpClaudeSerif } from "./lp-claude-font";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import { VISION_CURTAIN } from "./lp-vision-data";
import { DB_ARTIFACT, DB_HERO, DB_HERO_TABS } from "./lp-vision-tables";

/**
 * The window under the hero (2026-11-11), in the demo film's slot (the .lp-video section and
 * card: the same place, width and first-screen peek, video.css + hero.css). The founder: "un
 * espece de petit rideau qu'on peut deglisser a droite a gauche qui montre Claude d'un cote et
 * l'infra de l'autre", to show that Claude runs on Pancake; "J'animerai Claude et la database
 * pour montrer que c'est dynamique"; and, his last word on the sides: "Claude sur la gauche
 * finalement et Pancake sur la droite".
 *
 * The picture is a known one (Mobbin: Canva's sheet, its AI panel docked on the left of the
 * grid it works on).
 *
 * Two layers on one card:
 *   under   Claude's window, drawn as the page's Claude scene draws it (LpClaudeScene: the
 *           greeting, the composer with its Pancake connector, the bubble, one white card per
 *           tool call, the serif answer). The card wide: its conversation on the left, the view
 *           Claude drew beside it.
 *   over    Pancake's companies table (LpVisionDb's real table), a whole window as wide as the
 *           card, and it SLIDES: --cut is where its left edge stands. At rest its four leading
 *           columns are on show beside the conversation; pulled left it covers Claude and shows
 *           every column; pushed right, Claude's window is bare, its view on show.
 * On a phone the two stack in the same order: Claude on top, the table a sheet under it (no
 * curtain there: 358 px is too narrow to share).
 *
 * One take plays once (lp-play-once: prepared ahead, played when the card's top crosses 60 % of
 * the window, the picture on fly-by, never twice): lp-vision-curtain-timeline.ts. Both windows
 * are there from the first frame (founder: "le rideau Claude s'ouvre un peu tard, les gens auront
 * deja scroll down"). A signal lands in the table and the Brain writes its Play; the question is
 * typed and sent; Claude reads the tables and names three accounts while their rows light; told
 * to, it runs the first Play and the row goes live under its mark. Then the loop, for as long as
 * the card is on screen (founder: "Je prolongerai les animations en mode endless loop"): asked
 * for the next best Play, Claude names the next account and runs it, again and again, while the
 * table keeps taking signals. It is this card's one exception to "plays once, nothing loops".
 * The server markup is the END picture; from the first paint the stylesheet shows the take's
 * first frame instead where a take can play (data-pre, vision.css: the card's top peeks over the
 * first screen's fold, so nothing changes there when the code arrives). Without script and under
 * reduced motion the END stands.
 *
 * --cut is var(--cut-user, var(--vc-rest)): the handle writes --cut-user and from then on the
 * curtain is the visitor's (the take and the loop play on).
 * Copy: lp-vision-data.ts VISION_CURTAIN; rows: lp-vision-tables.ts DB_HERO.
 */

/** how far a drag or a key may take the curtain, % of the card: the handle stays on it */
const MIN = 3;
const MAX = 97;
/** where it rests, for the slider's first value (vision.css --vc-rest) */
const REST = 44;
/** a page opened with the card's top above this share of the window has it in front of the
    visitor already: it rests on its END (lp-play-once `seenAbove`) */
const SEEN_ABOVE = 0.45;

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
    // already in front of the visitor: the END, at once. Else the stylesheet's stand-in for the
    // take's first frame holds (data-pre) until the builder has set that frame and lifts it
    if (reduced || seen) el.setAttribute("data-open", "");
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
      {/* between the headline and the window: "Works in" Claude and Codex, the install's shortcut
          (the meeting, 2026-11-11: the install row "plus en avant", above the window) */}
      <div className="lp-vcut__works">
        <LpHeroInstall />
      </div>
      <div ref={card} className={`lp-video__card lp-vcut__card ${lpClaudeSerif.variable}`} data-pre="">
        {/* under: Claude's window */}
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
              {/* what the loop types, round after round */}
              <p className="lp-vcut__typed" data-n="3">
                {C.loop.ask}
              </p>
              <p className="lp-vcut__typed" data-n="4">
                {C.loop.go}
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
          {/* the view Claude drew from the rows: on show once the table is pushed off it */}
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

        {/* over: Pancake's table; it slides with the curtain */}
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
    </section>
  );
}
