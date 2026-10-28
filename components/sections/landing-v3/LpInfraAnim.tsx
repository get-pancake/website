"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { mountPlayOnce, type PlayOnceRuntime } from "./lp-play-once";

/**
 * The infra section's motion (LpInfra.tsx), in two versions:
 *
 *   scroll — desktop layouts (from 1025 wide), motion allowed (founder 2026-10-26:
 *            "show that pancake brings all 3 of them when scrolling", then "the flow supersmooth
 *            every movement well calibrated getting inspired by best in class website"). The
 *            stage pins and the scroll drives buildInfraScroll: the three bricks (Context, Data,
 *            Tools) come up first, then the details of a go-to-market pop up all over the screen
 *            and fly into them, then Pancake comes up over them, branches down to all three and
 *            connects to your agent (founder 2026-10-27: "insister sur les 3 briques … les faire
 *            arriver en premier puis faire arriver les petits details"; 2026-10-28: no closing
 *            up, no canvas). The scroll's progress is smoothed (an exponential follow, τ
 *            0.15 s, frame-rate independent), so a wheel's notches and a trackpad's flick both
 *            glide, as a scrubbed timeline does on the best scroll-driven pages. The whole stage
 *            stays in the window: on a short one (a laptop with its dock and bookmarks bar) the
 *            card scales down to fit and the heading keeps its size.
 *   once   — everywhere else (phones, tablets, very short windows, reduced motion): the card's
 *            build-up, played once by lp-play-once.ts like the step cards (prepared ahead, cued
 *            below the fold, played at the focus line, the picture on a fly-by).
 *
 * Either way the markup is the END picture: no JS, reduced motion and a fly-by show it finished.
 * Timelines in lp-infra-timeline.ts, fetched with GSAP only when needed. Every move is opacity or
 * a transform: nothing changes size on screen while it plays. After it, only the leads queue
 * moves (buildInfraLoop).
 */

/** the scroll version: the desktop layout (infra.css), motion allowed */
const SCROLL_MQ = "(min-width: 1025px) and (prefers-reduced-motion: no-preference)";
/** the stage's gap between the heading and the card in the scroll version (infra.css) */
const SCROLL_GAP = 40;
/** the least room above and below the pinned stage */
const SCROLL_MARGIN = 24;
/** the smallest the card may be scaled to fit a short window: a 1440 × 900 laptop with its dock
    and bookmarks bar (≈ 700 px of window) gets 0.88; under ≈ 660 px, the build-up instead */
const MIN_FIT = 0.8;
/** the scroll the stage stays pinned for: 1.6 windows, within 1300–1800 px (three moves: the
    buckets, the pieces into them, Pancake down to them and up to the agent) */
const pinLength = (vh: number) => Math.round(Math.min(1800, Math.max(1300, vh * 1.6)));
/** the timeline starts as the stage's top comes 45% down the window, before the pin, so the
    pieces move from the first notch on (founder 2026-10-27: "je scroll rien se passe puis d un
    coup tout se met en place"); it ends where the pin lets go */
const START = 0.45;
/** the smoothing's time constant (s): the picture is 95% caught up with the scroll after 3τ */
const TAU = 0.15;
/** from here the picture is assembled and the leads queue may run (a little lower to stop it,
    so a visitor resting on the edge does not start and stop it) */
const ASSEMBLED = 0.95;
const UNASSEMBLED = 0.9;

type QaRegistry = Record<string, Record<string, unknown> | undefined>;

const loadFlow = (): Promise<PlayOnceRuntime> =>
  Promise.all([import("@/lib/gsap"), import("./lp-infra-timeline")]).then(([{ gsap }, { buildInfraFlow }]) => ({
    gsap,
    build: buildInfraFlow,
  }));

type Parts = { section: HTMLElement; pin: HTMLElement; stage: HTMLElement; head: HTMLElement; card: HTMLElement };

/** The window top the desktop floating bar takes (nav.css --lp-nav-reserve; 0 under it, and in
    the agents view, which has no floating bar): the pinned stage fits and centres in the room
    under it. Read off the section, which inherits the view's value. */
const navReserve = (section: HTMLElement) =>
  parseFloat(getComputedStyle(section).getPropertyValue("--lp-nav-reserve")) || 0;

/** The stage in the scroll version: its layout height, and the card's scale so the heading and
    the whole card fit the window under the bar (transforms leave offsetHeight alone: no feedback) */
const fitOf = ({ section, head, card }: Parts) => {
  const headH = head.offsetHeight + SCROLL_GAP;
  const cardH = card.offsetHeight;
  const room = window.innerHeight - navReserve(section);
  const fit = Math.min(1, (room - 2 * SCROLL_MARGIN - headH) / cardH);
  return { layoutH: headH + cardH, cardH, fit, visualH: headH + cardH * fit };
};

/** The scroll version: pins the stage (data-scroll), builds buildInfraScroll and keeps the
    timeline on the smoothed scroll progress. Returns its teardown, which gives the markup back. */
function mountScroll(el: Parts): { dispose: () => void; measure: () => void } {
  const { section, pin, stage, card } = el;
  let disposed = false;
  let built: { tl: { progress: (p: number) => unknown; kill: () => unknown }; cleanup: () => void } | null = null;
  let raf = 0;
  let last = 0;
  let cur = -1;
  let top = SCROLL_MARGIN;
  let len = pinLength(window.innerHeight);
  let near = false;
  let layout = "";
  // the builder, once GSAP and the timelines have loaded
  let buildScroll: (root: HTMLElement) => typeof built = () => null;

  const measure = () => {
    const { layoutH, cardH, fit, visualH } = fitOf(el);
    const reserve = navReserve(section);
    top = reserve + Math.max(SCROLL_MARGIN, Math.round((window.innerHeight - reserve - visualH) / 2));
    len = pinLength(window.innerHeight);
    section.style.setProperty("--lp-infra-stage-h", `${layoutH}px`);
    section.style.setProperty("--lp-infra-top", `${top}px`);
    section.style.setProperty("--lp-infra-pin-len", `${len}px`);
    section.style.setProperty("--lp-infra-fit", fit.toFixed(4));
    section.style.setProperty("--lp-infra-trim", `${Math.round(cardH * (1 - fit))}px`);
    // how far the pieces beyond the title spread: to the window's edges, in the card's own px;
    // and above the heading and under the card when the window leaves room there
    const reach = (window.innerWidth / 2 / fit - 400) / 300;
    section.style.setProperty("--lp-infra-reach", Math.min(1.8, Math.max(0.35, reach)).toFixed(3));
    section.style.setProperty("--lp-infra-reach-y", Math.min(2, Math.max(1, 1 + (top - 110) / 120)).toFixed(3));
    // the timeline is built from the layout: a new layout, a new timeline at the same place
    const next = `${window.innerWidth}x${window.innerHeight}:${card.offsetWidth}x${cardH}`;
    if (built && next !== layout) {
      built.tl.kill();
      built.cleanup();
      built = buildScroll(stage);
      if (built && cur >= 0) built.tl.progress(cur);
    }
    layout = next;
    kick();
  };
  // how far the visitor has come, 0 → 1: from the stage's top half way up the window to the end
  // of the pin, linear in the scroll
  const goal = () => {
    const from = START * window.innerHeight;
    return Math.min(1, Math.max(0, (from - pin.getBoundingClientRect().top) / (from - top + len)));
  };
  const frame = (now: number) => {
    raf = 0;
    if (!built) return;
    const g = goal();
    if (cur < 0) {
      cur = g; // first frame: where the visitor already is, no catching up
    } else {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      cur += (g - cur) * (1 - Math.exp(-dt / TAU));
      if (Math.abs(g - cur) < 0.0005) cur = g;
    }
    last = now;
    built.tl.progress(cur);
    const state = cur >= ASSEMBLED ? "done" : cur < UNASSEMBLED ? "scroll" : card.dataset.lpAnim;
    if (state && card.dataset.lpAnim !== state) card.dataset.lpAnim = state;
    if (cur !== g) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  function kick() {
    if (!raf && !disposed && built) raf = requestAnimationFrame(frame);
  }
  const onScroll = () => {
    if (near) kick();
  };

  section.dataset.scroll = "";
  card.dataset.lpAnim = "scroll";
  measure();
  const seen = new IntersectionObserver(
    ([e]) => {
      near = e.isIntersecting;
      kick();
    },
    { rootMargin: "50% 0px 50% 0px" },
  );
  seen.observe(pin);
  const ro = new ResizeObserver(measure);
  ro.observe(el.head);
  ro.observe(card);
  window.addEventListener("scroll", onScroll, { passive: true });

  const unpin = () => {
    section.removeAttribute("data-scroll");
    for (const v of ["--lp-infra-stage-h", "--lp-infra-top", "--lp-infra-pin-len", "--lp-infra-fit", "--lp-infra-trim", "--lp-infra-reach", "--lp-infra-reach-y"])
      section.style.removeProperty(v);
  };
  Promise.all([import("@/lib/gsap"), import("./lp-infra-timeline")])
    .then(([, { buildInfraScroll }]) => {
      if (disposed) return;
      buildScroll = (root) => {
        try {
          const b = buildInfraScroll(root);
          const w = window as unknown as QaRegistry;
          w.__lpInfra = { ...w.__lpInfra, scroll: b.tl };
          return b;
        } catch (err) {
          // never a broken section: the markup stands, unpinned
          unpin();
          card.dataset.lpAnim = "static";
          if (process.env.NODE_ENV !== "production") console.error(err);
          return null;
        }
      };
      built = buildScroll(stage);
      kick();
    })
    .catch(() => {
      if (disposed) return;
      unpin();
      card.dataset.lpAnim = "static";
    });

  return {
    measure,
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      seen.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (built) {
        built.tl.kill();
        built.cleanup();
        delete (window as unknown as QaRegistry).__lpInfra?.scroll;
      }
      unpin();
      delete card.dataset.lpAnim;
    },
  };
}

export function LpInfraFlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // the version: scroll where the desktop stage fits the window, the build-up played once
  // elsewhere; looked at again when the window or the motion setting changes
  useEffect(() => {
    const card = ref.current;
    const section = card?.closest<HTMLElement>(".lp-infra");
    const pin = card?.closest<HTMLElement>(".lp-infra__pin");
    const stage = card?.closest<HTMLElement>(".lp-infra__stage");
    const head = section?.querySelector<HTMLElement>(".lp-infra__head");
    if (!card || !section || !pin || !stage || !head) return;
    const el: Parts = { section, pin, stage, head, card };
    const mq = window.matchMedia(SCROLL_MQ);
    const canPin = typeof CSS !== "undefined" && CSS.supports("overflow", "clip"); // sticky under .lp's overflow-x
    let mode: "scroll" | "once" | null = null;
    let current: { dispose: () => void; measure?: () => void } | null = null;
    const evaluate = () => {
      const next = canPin && mq.matches && fitOf(el).fit >= MIN_FIT ? "scroll" : "once";
      if (next === mode) {
        current?.measure?.();
        return;
      }
      current?.dispose();
      mode = next;
      current =
        next === "scroll"
          ? mountScroll(el)
          : {
              dispose: mountPlayOnce({
                host: card,
                stage: card,
                designWidth: 1040,
                load: loadFlow,
                restIsEnd: true,
                qa: { registry: "__lpInfra", key: "diagram" },
              }),
            };
    };
    let pending = 0;
    const onResize = () => {
      if (!pending)
        pending = requestAnimationFrame(() => {
          pending = 0;
          evaluate();
        });
    };
    evaluate();
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", evaluate);
    return () => {
      cancelAnimationFrame(pending);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", evaluate);
      current?.dispose();
    };
  }, []);
  // After the build-up only the leads queue moves (buildInfraLoop: a lead comes up, is approved,
  // the next one comes up; founder 2026-10-26, "nothing should look vibe coded"): built once the
  // card is done (the build-up played, or the scroll version assembled), played while it is on
  // screen and the tab visible, never under reduced motion, and dropped (its end picture given
  // back) if the build-up plays again or the scroll takes the picture apart.
  useEffect(() => {
    const card = ref.current;
    if (!card || typeof IntersectionObserver === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let loop: { tl: { play: () => unknown; pause: () => unknown; kill: () => unknown }; cleanup: () => void } | null = null;
    let loading = false;
    let disposed = false;
    let onScreen = false;
    const drop = () => {
      if (!loop) return;
      loop.tl.kill();
      loop.cleanup();
      loop = null;
    };
    const sync = () => {
      if (disposed) return;
      if (card.dataset.lpAnim !== "done" || reduce.matches) {
        drop();
        return;
      }
      if (!loop) {
        if (loading) return;
        loading = true;
        import("./lp-infra-timeline")
          .then(({ buildInfraLoop }) => {
            loading = false;
            if (disposed || card.dataset.lpAnim !== "done" || reduce.matches || loop) return;
            loop = buildInfraLoop(card);
            sync();
          })
          .catch(() => {
            loading = false;
          });
        return;
      }
      if (onScreen && !document.hidden) loop.tl.play();
      else loop.tl.pause();
    };
    const watch = new MutationObserver(sync);
    watch.observe(card, { attributes: true, attributeFilter: ["data-lp-anim"] });
    const seen = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    seen.observe(card);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    sync();
    return () => {
      disposed = true;
      watch.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      drop();
    };
  }, []);
  return (
    <div ref={ref} className="lp-infra__card">
      {children}
    </div>
  );
}
