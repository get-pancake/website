"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SUPERPOWERS } from "./ag-copy";
import { AG_SP_MOCKS, AG_SP_MOCK_LABELS } from "./AgSuperpowersMocks";
import { useInView, useReducedMotion } from "./useInView";

/**
 * /agents — Superpowers: "What if your agent could download GTM?" + the
 * draft's four-slide carousel (#prims). Two modes, chosen by CSS and
 * mirrored in JS through the same media query:
 *
 * ≥1025 (draft geometry): a transform track — 1120px slides, gap 24, the
 * ACTIVE slide centered, neighbors dimmed/scaled (the draft's carousel
 * focus, kept on purpose), autoplay every 11s while the section is on
 * screen and nothing holds it (keyboard focus inside the section, a pointer
 * resting on the carousel); a click on a neighbor, a dot, an arrow, a ≥40px
 * pointer swipe or an arrow key (controls focused) navigates and restarts
 * the timer.
 *
 * ≤1024: native scroll-snap on the track (no dimming, no autoplay — a phone
 * swipes), dots follow the centered slide (IntersectionObserver), arrows
 * scroll the container. The scroller is parked on the SSR'd active slide at
 * mount so the dots and the scroller agree from the first frame.
 *
 * Each mock re-mounts (React key = per-slide activation count) when its
 * slide becomes active, so its one-shot animations replay; every mock
 * animation is PAUSED by the stylesheet until the section intersects
 * (`data-inview` from useInView → CSS animation-play-state, with a
 * <noscript> escape below) and never runs under prefers-reduced-motion
 * (final states instead). Styles: superpowers.css.
 */

const SLIDES = SUPERPOWERS.slides;
const N = SLIDES.length;
const AUTOPLAY_MS = 11000; // draft: setInterval(…, 11000)
const SWIPE_PX = 40; // draft: |dx| > 40
const SNAP_MQ = "(max-width: 1024px)"; // must match superpowers.css
const SNAP_RATIO = 0.6; // a slide owns the dots once ≥60% of it is inside the track

const wrap = (k: number) => ((k % N) + N) % N;

export function AgSuperpowers() {
  const [sectionRef, inView] = useInView<HTMLElement>();
  const reduced = useReducedMotion();
  const [snap, setSnap] = useState(false);
  const [active, setActive] = useState(1); // the draft opens on slide 02 (go(1))
  const [epoch, setEpoch] = useState<number[]>(() => Array.from({ length: N }, () => 0));
  const [kbFocus, setKbFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const [moving, setMoving] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef(false);
  const reducedRef = useRef(false);
  const activeRef = useRef(active);
  const swipeX = useRef<number | null>(null);
  const swiped = useRef(false);
  const lastActive = useRef(active);
  const moveTimer = useRef<number>();

  reducedRef.current = reduced;
  activeRef.current = active;

  /* the track/slide transitions exist only for the 0.7s of a slide change
     (data-moving): at rest there is no transition to catch mid-flight — a
     headless capture's beyond-viewport pass restarts idle transitions, and
     a window resize must snap, not glide (same as the draft's percentages) */
  const arm = useCallback(() => {
    setMoving(true);
    window.clearTimeout(moveTimer.current);
    moveTimer.current = window.setTimeout(() => setMoving(false), 700);
  }, []);
  useEffect(() => () => window.clearTimeout(moveTimer.current), []);

  /* scroll-snap mode: park the scroller on slide k (centered, like the
     draft's go()) — smooth for a navigation, instant for a mount/resize */
  const scrollToSlide = useCallback((k: number, behavior: ScrollBehavior) => {
    const track = trackRef.current;
    const slide = track?.children[k] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior,
    });
  }, []);

  /* layout mode = the stylesheet's breakpoint. Entering snap mode (a ≤1024
     mount, or a resize into it) parks the scroller on the active slide: the
     SSR markup opens on slide 02 like the draft's go(1) on every width, and
     a scroller resting on 01 would light the wrong dot until the observer
     flipped it — and the flip re-mounted mock 01 (review #40) */
  useEffect(() => {
    const mq = window.matchMedia(SNAP_MQ);
    const sync = () => {
      snapRef.current = mq.matches;
      setSnap(mq.matches);
      if (mq.matches) scrollToSlide(activeRef.current, "auto");
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [scrollToSlide]);

  /* a slide becoming active restarts its mock — compared against the last
     seen index, so neither the SSR'd first slide nor StrictMode's second
     effect pass in dev bumps an epoch (that re-mounted mock 02 at mount) */
  useEffect(() => {
    if (lastActive.current === active) return;
    lastActive.current = active;
    setEpoch((e) => e.map((v, i) => (i === active ? v + 1 : v)));
  }, [active]);

  const goTo = useCallback(
    (k: number) => {
      const next = wrap(k);
      setActive(next);
      arm();
      if (snapRef.current) scrollToSlide(next, reducedRef.current ? "auto" : "smooth");
    },
    [arm, scrollToSlide],
  );

  /* autoplay: desktop track only, in view, motion allowed, no keyboard focus
     inside the section, no pointer resting on the carousel; `active` in the
     deps = every navigation restarts it */
  useEffect(() => {
    if (snap || reduced || !inView || kbFocus || hover) return;
    const t = window.setTimeout(() => {
      setActive((a) => wrap(a + 1));
      arm();
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [snap, reduced, inView, kbFocus, hover, active, arm]);

  /* scroll-snap mode: the dots follow whichever slide is ≥60% inside the
     track (the ratio is checked too — an observer's first pass reports the
     8px of a peeking neighbor as intersecting in some engines) */
  useEffect(() => {
    if (!snap) return;
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < SNAP_RATIO) continue;
          const i = Number((e.target as HTMLElement).dataset.i);
          if (!Number.isNaN(i)) setActive(i);
        }
      },
      { root: track, threshold: SNAP_RATIO },
    );
    Array.from(track.children).forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [snap]);

  /* pointer swipe on the transform track (native scrolling covers ≤1024) */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swiped.current = false;
    if (snapRef.current) return;
    swipeX.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swipeX.current === null) return;
    const dx = e.clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > SWIPE_PX) {
      swiped.current = true; // the click that follows must not re-navigate
      goTo(dx < 0 ? active + 1 : active - 1);
    }
  };
  const onPointerCancel = () => {
    swipeX.current = null;
  };
  const onSlideClick = (i: number) => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    if (!snapRef.current && i !== active) goTo(i);
  };

  /* a pointer resting on the carousel holds the autoplay (WCAG 2.2.2: the
     slide must not move under a reader's mouse — review #20); a touch
     pointer leaves as soon as the finger lifts, so a tap never parks it */
  const onPointerEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") setHover(true);
  };
  const onPointerLeave = () => setHover(false);

  /* arrow keys while a control is focused */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    }
  };

  /* keyboard focus inside the section holds the autoplay (a11y: the slide
     must not move under a keyboard user); mouse clicks on the arrows don't
     match :focus-visible, so they keep the draft's restart behavior */
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    let visible = true;
    try {
      visible = (e.target as HTMLElement).matches(":focus-visible");
    } catch {
      /* older engines: treat any focus as keyboard focus */
    }
    if (visible) setKbFocus(true);
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKbFocus(false);
  };

  return (
    <section
      ref={sectionRef}
      className="ag-sec ag-superpowers"
      aria-labelledby="ag-superpowers-title"
      data-moving={moving ? "" : undefined}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {/* no JS = no data-inview: the stylesheet's paused default would leave
          every mock at its empty first frame — let them play to their
          settled states (superpowers.css reads --ag-sp-play) */}
      <noscript>
        <style>{`.ag-superpowers{--ag-sp-play:running}`}</style>
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
        className="ag-superpowers__viewport"
        role="group"
        aria-roledescription="carousel"
        aria-label={SUPERPOWERS.kicker}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <div
          ref={trackRef}
          className="ag-superpowers__track"
          style={{ "--ag-sp-i": active } as CSSProperties}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          {SLIDES.map((slide, i) => {
            const Mock = AG_SP_MOCKS[i] ?? AG_SP_MOCKS[0];
            const on = i === active;
            return (
              /* the dimmed neighbors (opacity .45, founder-kept) are
                 decorative for AT: hidden until the dots/arrows bring them
                 to the front (review #41). Nothing focusable lives inside
                 a slide, and `inert` would kill the neighbor click. */
              <article
                key={slide.num}
                id={`ag-superpowers-slide-${i}`}
                className="ag-card ag-superpowers__slide"
                data-i={i}
                data-on={on ? "" : undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${N}`}
                aria-hidden={on ? undefined : true}
                onClick={() => onSlideClick(i)}
              >
                <div className="ag-superpowers__text">
                  <p className="ag-kicker ag-superpowers__num">{slide.num}</p>
                  <h3 className="ag-title-step">{slide.title}</h3>
                  <p className="ag-superpowers__body">{slide.body}</p>
                </div>
                <div
                  className={i === 3 ? "ag-superpowers__mock ag-superpowers__mock--wf" : "ag-superpowers__mock"}
                  role="img"
                  aria-label={AG_SP_MOCK_LABELS[i]}
                >
                  <p className="ag-sp-bubble">{slide.prompt}</p>
                  <Mock key={epoch[i]} />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="ag-superpowers__controls" onKeyDown={onKeyDown}>
        <button type="button" className="ag-superpowers__arrow" aria-label={SUPERPOWERS.prev} onClick={() => goTo(active - 1)}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <div className="ag-superpowers__dots">
          {SLIDES.map((slide, i) => (
            <button
              type="button"
              key={slide.num}
              className="ag-superpowers__dot"
              aria-label={`Go to slide ${i + 1}`}
              aria-controls={`ag-superpowers-slide-${i}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="ag-superpowers__arrow" aria-label={SUPERPOWERS.next} onClick={() => goTo(active + 1)}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" focusable="false">
            <path d="M6 3l5 5-5 5" />
          </svg>
        </button>
      </div>
    </section>
  );
}
