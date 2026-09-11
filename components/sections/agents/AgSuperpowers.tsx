"use client";

import {
  useCallback,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SUPERPOWERS } from "./ag-copy";
import { AG_SP_MOCKS, AG_SP_MOCK_LABELS } from "./AgSuperpowersMocks";
import { useInView } from "./useInView";

/**
 * /agents — Superpowers: "What if your agent could download GTM?" + the
 * draft's four slides (#prims) as FEATURE TABS (founder 2026-09-11: the
 * carousel with dimmed, peeking neighbors was rejected — "améliore ce
 * carrousel en utilisant des composants Mobbin"). Pattern: Anchor's product
 * section / Zoox's quiet feature list on Mobbin — a vertical list of
 * features on the left, the active one highlighted, one large stage on the
 * right that switches with it.
 *
 * ONE markup for every width, laid out by superpowers.css alone (no
 * matchMedia in JS, so SSR and the first paint agree on phones): the card
 * is the grid, the tablist is `display: contents`, the four tabs auto-place
 * in the left column and the four bubble+mock panes STACK in one right
 * cell — the stage is as tall as the tallest pane at every width, so the
 * card never changes height while tabs switch. ≤1024 the same items reflow
 * into one column (`order`) and only the active pane is displayed, right
 * under its row: an accordion, tap to switch, no autoplay (a layout that
 * opens and closes must not move by itself).
 *
 * Autoplay = the active tab's rail. The 2px fill is a 9s linear CSS
 * animation; its `animationend` activates the next tab (wrap around). One
 * clock: pausing the rail IS pausing the timer — a pointer resting on the
 * card (non-touch), keyboard focus inside the tablist, the section leaving
 * the viewport (useInView → data-inview) and prefers-reduced-motion (no
 * animation at all, a static rail) all hold it without drift. Every
 * activation bumps that tab's epoch: the rail and the mock re-mount (React
 * key), so the rail restarts from 0 and the mock's one-shot animation
 * replays — a click on the already-active tab restarts it too.
 *
 * WAI-ARIA tabs: vertical tablist, roving tabindex, ArrowUp/Down/Home/End
 * move the selection AND focus (selection follows focus). Mock animations
 * stay paused until the section intersects (stylesheet default; the
 * <noscript> style below lets them play to their settled states without
 * JS) and never run under reduced motion.
 */

const SLIDES = SUPERPOWERS.slides;
const N = SLIDES.length;
const RAIL_ANIMATION = "ag-sp-rail"; // must match the keyframes in superpowers.css

const wrap = (k: number) => ((k % N) + N) % N;
const tabId = (i: number) => `ag-superpowers-tab-${i}`;
const paneId = (i: number) => `ag-superpowers-pane-${i}`;
const titleId = (i: number) => `ag-superpowers-title-${i}`;
const bodyId = (i: number) => `ag-superpowers-body-${i}`;

/* the copy's "01 / 04" counter: in a list of four the "/ 04" is noise —
   only the index is shown (the copy module stays verbatim) */
const indexOf = (num: string) => num.split(" / ")[0] ?? num;

export function AgSuperpowers() {
  const [sectionRef] = useInView<HTMLElement>();
  const [active, setActive] = useState(0);
  const [epoch, setEpoch] = useState<number[]>(() => Array.from({ length: N }, () => 0));
  const [hover, setHover] = useState(false);
  const [kbFocus, setKbFocus] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /* every activation (click, key, autoplay) bumps the tab's epoch: rail
     restarts, mock replays. Event-driven on purpose — an effect keyed on
     `active` bumped the SSR'd tab at mount under StrictMode (review #40) */
  const goTo = useCallback((k: number) => {
    const next = wrap(k);
    setActive(next);
    setEpoch((e) => e.map((v, i) => (i === next ? v + 1 : v)));
  }, []);

  /* the rail completing its 9s fill = the dwell is over */
  const onRailEnd = (e: AnimationEvent<HTMLSpanElement>) => {
    if (e.animationName !== RAIL_ANIMATION) return;
    goTo(active + 1);
  };

  /* selection follows focus (WAI-ARIA APG, automatic activation) */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowDown") next = active + 1;
    else if (e.key === "ArrowUp") next = active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = N - 1;
    if (next === null) return;
    e.preventDefault();
    const k = wrap(next);
    goTo(k);
    tabRefs.current[k]?.focus();
  };

  /* keyboard focus inside the tablist holds the autoplay (the selection
     must not move under a keyboard user); a mouse click focuses a tab
     without :focus-visible, so it restarts the rail and lets it run */
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    let visible = true;
    try {
      visible = (e.target as HTMLElement).matches(":focus-visible");
    } catch {
      /* older engines: treat any focus as keyboard focus */
    }
    if (visible) setKbFocus(true);
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKbFocus(false);
  };

  /* a pointer resting anywhere on the card holds the rail (WCAG 2.2.2: the
     stage must not switch under a reader's mouse); a touch pointer leaves
     as soon as the finger lifts, so a tap never parks it */
  const onPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") setHover(true);
  };
  const onPointerLeave = () => setHover(false);

  return (
    <section ref={sectionRef} className="ag-sec ag-superpowers" aria-labelledby="ag-superpowers-title">
      {/* no JS = no data-inview: the stylesheet's paused default would leave
          every mock at its empty first frame — let them play to their
          settled states, and make the rail a static mark (nothing advances
          the tabs without JS) */}
      <noscript>
        <style>{`.ag-superpowers{--ag-sp-play:running}.ag-superpowers__fill{animation:none;transform:none}`}</style>
      </noscript>
      <div className="ag-sec__head">
        <p className="ag-kicker">{SUPERPOWERS.kicker}</p>
        <h2 id="ag-superpowers-title" className="lp-title-section">
          {SUPERPOWERS.titleBefore}
          <span className="ag-accent">{SUPERPOWERS.titleAccent}</span>
          {SUPERPOWERS.titleAfter}
        </h2>
      </div>

      <div
        className="ag-card ag-superpowers__card"
        data-hold={hover || kbFocus ? "" : undefined}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div
          className="ag-superpowers__tabs"
          role="tablist"
          aria-orientation="vertical"
          aria-label={SUPERPOWERS.kicker}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {SLIDES.map((slide, i) => {
            const on = i === active;
            return (
              <button
                key={slide.num}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={tabId(i)}
                className="ag-superpowers__tab"
                style={{ "--ag-sp-i": i } as CSSProperties}
                aria-selected={on}
                aria-controls={paneId(i)}
                aria-labelledby={titleId(i)}
                aria-describedby={on ? bodyId(i) : undefined}
                tabIndex={on ? 0 : -1}
                data-on={on ? "" : undefined}
                onClick={() => goTo(i)}
              >
                {/* the rail fill exists on the active tab only; the key
                    re-mounts it on every activation so it restarts from 0 */}
                {on && <span key={epoch[i]} className="ag-superpowers__fill" aria-hidden="true" onAnimationEnd={onRailEnd} />}
                <span className="ag-superpowers__index" aria-hidden="true">
                  {indexOf(slide.num)}
                </span>
                <span id={titleId(i)} className="ag-title-sm ag-superpowers__title">
                  {slide.title}
                </span>
                {/* the body lives in every tab at 0 height (grid 0fr → 1fr,
                    200ms) so the list slides instead of jumping when the
                    selection moves; only the active one is visible to AT.
                    The inner span holds the 3-line floor that keeps the
                    list — and so the card — the same height whichever tab
                    is open (superpowers.css) */}
                <span className="ag-superpowers__reveal">
                  <span id={bodyId(i)} className="ag-superpowers__body">
                    <span className="ag-superpowers__copy">{slide.body}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {SLIDES.map((slide, i) => {
          const Mock = AG_SP_MOCKS[i] ?? AG_SP_MOCKS[0];
          const on = i === active;
          return (
            <div
              key={slide.num}
              id={paneId(i)}
              role="tabpanel"
              aria-labelledby={tabId(i)}
              aria-hidden={on ? undefined : true}
              data-on={on ? "" : undefined}
              className="ag-superpowers__pane"
              style={{ "--ag-sp-i": i } as CSSProperties}
            >
              <div
                className={i === 3 ? "ag-superpowers__mock ag-superpowers__mock--wf" : "ag-superpowers__mock"}
                role="img"
                aria-label={AG_SP_MOCK_LABELS[i]}
              >
                <p className="ag-sp-bubble">{slide.prompt}</p>
                <Mock key={epoch[i]} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
