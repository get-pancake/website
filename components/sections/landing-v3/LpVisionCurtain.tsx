"use client";

import { Fragment, useEffect, useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";

import { ClaudeMark, PancakeMark } from "./LpClaudeScene";
import { DbTable, DbTableIcon } from "./LpVisionDb";
import { lpClaudeSerif } from "./lp-claude-font";
import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";
import { VISION_CURTAIN } from "./lp-vision-data";
import { DB_HERO, DB_HERO_STORY, DB_HERO_TABS, DB_PEOPLE, DB_SIGNALS } from "./lp-vision-tables";

/**
 * The window under the hero (2026-11-11), in the demo film's slot (the .lp-video section and
 * card: the same place, width and first-screen peek, video.css + hero.css). The founder: "un
 * espece de petit rideau qu'on peut deglisser a droite a gauche qui montre Claude d'un cote et
 * l'infra de l'autre", to show that Claude runs on Pancake; and, his last word on the sides:
 * "Claude sur la gauche finalement et Pancake sur la droite".
 *
 * The picture is a known one (Mobbin: Canva's sheet, its AI panel docked on the left of the grid
 * it works on; Remote's report builder, an assistant's steps beside the table it fills).
 *
 * Two layers on one card:
 *   under   Claude's window, drawn as the page's Claude scene draws it (LpClaudeScene: the
 *           greeting, the composer with its Pancake connector, the bubble, one white card per
 *           tool call, the serif answer). Its conversation is a real one to the hand: it scrolls
 *           (founder: "je dois pouvoir scroll up Claude, comme une réelle app"), it follows its
 *           last line while you have not scrolled up, and a round arrow brings you back to it
 *           (Mobbin: Searchable's assistant panel, the arrow over its composer).
 *   over    Pancake's companies table (LpVisionDb's real table), a whole window as wide as the
 *           card, and it SLIDES: --cut is where its left edge stands.
 * THE HANDLE between them resizes the two, as a split view's does (founder: "le bouton rideau
 * doit élargir Claude, pas révéler [une autre vue]"): pulled right, Claude's column is as wide as
 * what the table leaves (its conversation stays a centred column, as the app's does on a wide
 * window); pulled left, the table takes the card and shows every column. At rest the two share
 * the card about half and half; on a desktop, once the visitor has scrolled onto the window, the
 * split eases so that the table takes two thirds (founder: "la barre slider un poil … pour montrer
 * l'animation", then "c'est pas au hover la bascule, plutôt quand je scroll sur cette partie" and
 * "3/4 c'est trop, Claude est trop réduit, maybe 2/3"). Once the visitor has moved the handle,
 * the split is theirs.
 * On a phone the two stack in the same order: Claude on top, the table a sheet under it (no
 * handle there: 358 px is too narrow to share).
 *
 * What plays (lp-vision-curtain-timeline.ts). The table LIVES, asked or not (founder: "il faut
 * qu'on retrouve un côté plus autonome et dynamique où la base vit seule"): signals land in it,
 * the Brain rescores the account and its row goes to its new rank, two rows that are one company
 * merge, a deal reopens and leaves the view; its status line says each thing as it happens.
 * Claude steps in twice: asked which accounts to work, it narrows the view to the ones that have
 * a signal (from then on an account enters the view by itself when a signal lands on it); then,
 * when the table brings the account that stops you and Claude says so unasked, a standing order.
 * That order opens the Brain's column of Plays, and a Play goes live each time a row passes 90.
 * lp-play-once plays it once (prepared ahead, played when the card's top crosses 60 % of the
 * window, the picture on fly-by); then, for as long as the card is on screen, a new chat opens
 * and it plays again (this card's one exception to "nothing loops").
 * The table's pieces are known ones (Mobbin: Twenty's companies grid, Filter and Sort over the
 * rows, a count, a bar under them; folk's "you're about to merge 2 people", two rows that become
 * one; n8n's data table, a column added; Snowflake's lists, the sort in the view's bar).
 * The server markup is the END picture; from the first paint the stylesheet shows the take's
 * first frame instead where a take can play (data-pre, vision.css: the card's top peeks over the
 * first screen's fold, so nothing changes there when the code arrives). Without script and under
 * reduced motion the END stands.
 *
 * --cut is var(--cut-user, var(--vc-rest)): the handle writes --cut-user and from then on the
 * split is the visitor's (the take plays on).
 * Copy: lp-vision-data.ts VISION_CURTAIN; rows: lp-vision-tables.ts DB_HERO.
 */

/** how far a drag or a key may take the handle, % of the card: it stays on the card */
const MIN = 3;
const MAX = 97;
/** where it rests on a desktop, for the slider's first value (vision.css --vc-rest: about half) */
const REST = 52;
/** a page opened with the card's top above this share of the window has it in front of the
    visitor already: it rests on its END (lp-play-once `seenAbove`) */
const SEEN_ABOVE = 0.45;
/** the visitor has scrolled onto the window once its top passes this share of the window: the
    table takes two thirds of the card (vision.css data-wide) */
const WIDE_AT = 0.55;
/** the conversation follows its last line in this long (ms) */
const FOLLOW_MS = 380;
/** this close to its end (px), the conversation is on its last line */
const AT_END = 16;
/** a scroll this soon after a wheel, a touch, a press or a key is the visitor's (ms) */
const HAND_MS = 2500;

/** The take measures what it types: it is built once the faces are in (the serif is fetched
    when its first line renders), or after 2 s without them. */
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

/** the filter's mark: three lines, each shorter than the one above */
function FilterIcon() {
  return (
    <svg className="lp-vcut__ficon" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M1.5 3h9M3.25 6h5.5M5 9h2" />
    </svg>
  );
}

/** the sort's mark: one arrow down, one up */
function SortIcon() {
  return (
    <svg className="lp-vcut__ficon" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M3.75 2.25v7.5M1.75 7.75l2 2 2-2M8.25 9.75v-7.5M6.25 4.25l2-2 2 2" />
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
  const view = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  /** back to the conversation's last line (the round arrow) */
  const toLatest = useRef<() => void>(() => {});
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
    // Scrolled onto: the split eases from half to two thirds for the table, once (founder: "c'est
    // pas au hover la bascule, plutôt quand je scroll sur cette partie"). Not under reduced motion:
    // there the window keeps its half, the end picture whole
    let settle = 0;
    const wide = new IntersectionObserver(
      (entries) => {
        if (!entries[entries.length - 1].isIntersecting) return;
        wide.disconnect();
        el.setAttribute("data-wide", "");
        // (the slider says where it went once it is there)
        settle = window.setTimeout(() => {
          const h = handle.current;
          if (!h) return;
          const box = el.getBoundingClientRect();
          const at = h.getBoundingClientRect();
          if (box.width) h.setAttribute("aria-valuenow", String(Math.round(((at.left + at.width / 2 - box.left) / box.width) * 100)));
        }, 1000);
      },
      { rootMargin: `0px 0px -${Math.round((1 - WIDE_AT) * 100)}% 0px` },
    );
    if (!reduced) wide.observe(el);
    return () => {
      unmount();
      wide.disconnect();
      window.clearTimeout(settle);
      el.removeAttribute("data-open");
      el.removeAttribute("data-wide");
      el.style.removeProperty("--cut-user");
    };
  }, []);

  /* The conversation scrolls, as the app's does. While the visitor is on its last line it follows
     what arrives (each new line, the take's or a resize's); once they have scrolled up it stays
     where they left it (data-up on the view: the round arrow shows, and the take waits before it
     opens a new chat). Only the visitor's hand puts it up: a scroll that comes within HAND_MS of
     a wheel, a touch, a press or a key is theirs; any other is the layout's (a line in or out)
     or this code's own. */
  useEffect(() => {
    const box = view.current;
    const sc = scroller.current;
    const lines = thread.current;
    if (!box || !sc || !lines) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let onLast = true;
    let frame = 0;
    let handAt = -Infinity;
    const end = () => Math.max(0, sc.scrollHeight - sc.clientHeight);
    const halt = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const follow = (eased: boolean) => {
      halt();
      const from = sc.scrollTop;
      if (!eased || still.matches || Math.abs(end() - from) < 2) {
        sc.scrollTop = end();
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / FOLLOW_MS);
        // (the end is read each frame: more may have arrived)
        sc.scrollTop = from + (end() - from) * (1 - (1 - p) ** 3);
        frame = p < 1 ? requestAnimationFrame(tick) : 0;
      };
      frame = requestAnimationFrame(tick);
    };
    const mark = (last: boolean) => {
      onLast = last;
      box.toggleAttribute("data-up", !last);
    };
    const sized = new ResizeObserver(() => {
      if (onLast) follow(true);
    });
    sized.observe(lines);
    sized.observe(sc);
    const onScroll = () => {
      const last = end() - sc.scrollTop < AT_END;
      if (performance.now() - handAt < HAND_MS) {
        if (!last) halt();
        return mark(last);
      }
      if (last) mark(true);
      else if (onLast && !frame) follow(false);
    };
    /** the visitor takes the scroll: nothing of ours moves it under their hand */
    const onHand = () => {
      handAt = performance.now();
    };
    const hands = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown"] as const;
    sc.addEventListener("scroll", onScroll, { passive: true });
    for (const type of hands) sc.addEventListener(type, onHand, { passive: true });
    toLatest.current = () => {
      mark(true);
      follow(true);
    };
    follow(false);
    return () => {
      halt();
      sized.disconnect();
      sc.removeEventListener("scroll", onScroll);
      for (const type of hands) sc.removeEventListener(type, onHand);
      box.removeAttribute("data-up");
      toLatest.current = () => {};
    };
  }, []);

  /** where the handle stands now, % of the card */
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
    // (the split follows the hand at once: no easing while it is dragged, vision.css)
    card.current?.setAttribute("data-drag", "");
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => moveTo(event.clientX);
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    grab.current = null;
    card.current?.removeAttribute("data-drag");
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
      <div ref={card} className={`lp-video__card lp-vcut__card ${lpClaudeSerif.variable}`} data-pre="">
        {/* under: Claude's window */}
        <div className="lp-vcut__claude" aria-hidden="true">
          <div className="lp-vcut__col">
            {/* the window's bar: Claude's mark alone (founder 2026-11-11: "put right wordmarks or
                just logos here"; the name typed beside it was neither) */}
            <p className="lp-vcut__chead">
              <ClaudeMark id="spark" className="lp-vcut__spark" />
            </p>
            <div ref={view} className="lp-vcut__view">
              {/* a new chat's greeting: the take's first picture of Claude, gone once it is asked */}
              <p className="lp-vcut__greet">
                <ClaudeMark id="spark" className="lp-vcut__greet-spark" />
                {C.greeting}
              </p>
              <div ref={scroller} className="lp-vcut__scroll">
                <div ref={thread} className="lp-vcut__thread">
                  {C.thread.map((line) =>
                    "ask" in line ? (
                      <p key={line.id} className="lp-vcut__bubble" data-line={line.id}>
                        {line.ask}
                      </p>
                    ) : "say" in line ? (
                      <p key={line.id} className="lp-vcut__say" data-line={line.id}>
                        <Words text={line.say} />
                      </p>
                    ) : (
                      <p key={line.id} className="lp-vcut__tool" data-line={line.id} data-run={line.run ? "" : undefined}>
                        <PancakeMark className="lp-vcut__tool-mark" />
                        <span className="lp-vcut__tool-t">
                          {line.tool}
                          {line.name ? <i>{line.name}</i> : null}
                        </span>
                        <span className="lp-vcut__tool-r">
                          {line.doing ? <span className="lp-vcut__tool-doing">{line.doing}</span> : null}
                          <span className="lp-vcut__tool-done">
                            {line.count !== undefined ? (
                              <>
                                <b data-to={line.count}>{line.count.toLocaleString("en-US")}</b>{" "}
                              </>
                            ) : null}
                            {line.done}
                          </span>
                        </span>
                      </p>
                    ),
                  )}
                </div>
              </div>
              {/* back to the last line, once the visitor has scrolled up. Not a tab stop: the
                  window is a picture to assistive tech (the section's label tells it) */}
              <button type="button" className="lp-vcut__latest" tabIndex={-1} onClick={() => toLatest.current()}>
                <svg viewBox="0 0 13.9744 13.9744" focusable="false">
                  <path d="M6.9878 1.74672V12.2276M2.18408 7.42389L6.9878 12.2276L11.7915 7.42389" />
                </svg>
              </button>
            </div>
            {/* the composer, docked: its placeholder, what is typed in it, its controls */}
            <div className="lp-vcut__bar">
              <p className="lp-vcut__ph" data-n="1">
                {C.placeholder}
              </p>
              <p className="lp-vcut__ph" data-n="2">
                {C.reply}
              </p>
              {C.thread.map((line) =>
                "ask" in line ? (
                  <p key={line.id} className="lp-vcut__typed" data-line={line.id}>
                    {line.ask}
                  </p>
                ) : null,
              )}
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
        </div>

        {/* over: Pancake's tables; they slide with the handle. One tab a table (companies,
            people, signals): the take switches between them as a camera would, pulls back to
            show many more cells and pans to the columns past the edge. The END is the companies
            table, as the take leaves it */}
        <div className="lp-vcut__db" aria-hidden="true">
          <div className="lp-vcut__dbar">
            {/* Pancake's mark alone, as Claude's is */}
            <p className="lp-vcut__brand">
              <PancakeMark className="lp-vcut__pk" />
            </p>
            <ul className="lp-vcut__tabs">
              {DB_HERO_TABS.map((tab) => (
                <li key={tab.name} data-tab={tab.name} data-on={tab.name === DB_HERO.name ? "" : undefined}>
                  <DbTableIcon />
                  {tab.name}
                  <small>{tab.rows}</small>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-vcut__pane" data-pane="companies">
            {/* the view bar. The filter is a button until Claude sets it (data-filter: the END has
                it, the take flips it), then what was set; the table is sorted by fit all along;
                the count says how many rows the view holds. Both states of a piece are in the
                markup, one over the other */}
            <p className="lp-vcut__filter" data-filter="">
              <span className="lp-vcut__fset">
                <span className="lp-vcut__fidle">
                  <FilterIcon />
                  {C.filter.idle}
                </span>
                <span className="lp-vcut__chip">
                  <FilterIcon />
                  <b>{C.filter.column}</b>
                  <i>{C.filter.test}</i>
                  <em>{C.filter.value}</em>
                </span>
              </span>
              <span className="lp-vcut__chip" data-sort="">
                <SortIcon />
                <b>{C.sort.column}</b>
                <i>{C.sort.dir}</i>
              </span>
              <span className="lp-vcut__count">
                <span data-when="all">{C.filter.all}</span>
                <span data-when="some">{C.filter.some[2]}</span>
              </span>
            </p>
            {/* the lens: what the camera moves (it pulls back, it pans) */}
            <div className="lp-vcut__lens">
              <DbTable table={DB_HERO} bar={false} tone="yellow" />
            </div>
            {/* the frame around the rows Claude keeps when it filters (founder: "je lierais un peu
                les 86 en montrant que ça les entoure et les filtre dans la database"): the take
                shows it (data-ring on the pane) */}
            <span className="lp-vcut__ring" />
          </div>
          <div className="lp-vcut__pane" data-pane="people">
            <p className="lp-vcut__filter">
              <span className="lp-vcut__chip" data-sort="">
                <SortIcon />
                <b>{C.sorts.people.column}</b>
                <i>{C.sorts.people.dir}</i>
              </span>
              <span className="lp-vcut__count">{DB_HERO_TABS[1].rows} rows</span>
            </p>
            <div className="lp-vcut__lens">
              <DbTable table={DB_PEOPLE} bar={false} tone="yellow" />
            </div>
          </div>
          <div className="lp-vcut__pane" data-pane="signals">
            <p className="lp-vcut__filter">
              <span className="lp-vcut__chip" data-sort="">
                <SortIcon />
                <b>{C.sorts.signals.column}</b>
                <i>{C.sorts.signals.dir}</i>
              </span>
              <span className="lp-vcut__count">
                <span>
                  <span className="lp-vcut__scount">{DB_HERO_TABS[2].rows}</span> rows
                </span>
              </span>
            </p>
            <div className="lp-vcut__lens">
              <DbTable table={DB_SIGNALS} bar={false} tone="yellow" />
            </div>
          </div>
          {/* the status line, under the tables: the data is live, and what it last did */}
          <p className="lp-vcut__status">
            <i />
            <b>{C.live}</b>
            <span className="lp-vcut__status-t">{DB_HERO_STORY.status.crm}</span>
          </p>
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
