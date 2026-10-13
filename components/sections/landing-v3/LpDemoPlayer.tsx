"use client";

// LpDemoPlayer — the homepage demo window's ONLY client island (LpDemo.tsx renders the two views
// on the server and hands them over as children; the island's props are four strings).
// Structure mirrors VxDemoPlayer (refs, a rAF clock, IntersectionObserver gates) without its
// prompt rows, four tabs or Slack. Spec: demo-scroll.md §6.4, §7.
//
// Views: 0 Pancake, 1 Claude & Codex, stacked in one grid cell (zero CLS); the incoming view
// fades in on top (240 ms) while the outgoing one stays under it, then hides; a view is re-armed
// to its first frame only while hidden (never rewound on screen). Loop: Pancake (its run + a
// 2.2 s hold, about 9.2 s) → Claude & Codex (8600) → … while the clock runs.
//
// One clock (ms since the view started), two GSAP timelines, each seeked every frame:
// lp-demo-pancake-timeline.ts and lp-demo-claude-timeline.ts. GSAP and the two builders are a
// lazy chunk, fetched on the visitor's first input or at the first start; until a view's
// timeline is built the view is its rest picture and the clock waits. A run's length is its
// timeline's own. Each view is built in tasks of its own, in idle time and in slices
// (lp-play-once's queue): the showing one first, the other after the page's cards, or as it is
// armed if it is picked before its turn (2026-10-13; the import's continuation built both back
// to back).
//
// The clock runs while: started, ≥35 % of the stage on screen (of the viewport for a taller
// stage), the tab visible, not paused, motion allowed, no keyboard focus held in the pills or on
// the chip link. It pauses in place otherwise. data-run on the card mirrors it (the Claude tool
// spinner only turns then).
//
// First start, ONE rule at every width (lp-play-once's rule, the page's "play at the focus
// line"): once the window's top crosses 60 % of the viewport, or after 1 s with half of the
// window on screen. A pill click starts it at once. On a desktop first screen only the window's
// top bar shows (70 px above the fold), so the demo waits for the visitor to scroll to it; on
// windows tall enough to show half of it at load it starts after the 1 s.
//
// The window itself is assembled and opaque from the first frame (founder 2026-10-12). Its one
// scroll effect, desktop only, is lp-demo-scroll.ts: the card grows from .94 to 1 while the
// visitor scrolls to it and goes back when they scroll up. It is independent of the clock:
// mounted here, nothing else.
//
// Reduced motion (or ?still): no clock; the Pancake view is its rest picture (the V2 design),
// the Claude view its end picture; the pills switch views instantly.
//
// Phones (≤767, the mobile artboard's card 5024:9506): the Pancake view is a fixed design box
// scaled as pixels (demo.css); the island writes the measured scale (--lp-demowin-fit on the
// stage; CSS has the same quotient as a trig fallback) and takes the chip link out of the tab
// order (the card is a picture there). Since 2026-10-13 both views play in turn there too,
// under the pills (founder: "yes as on desktop"); the Claude view has its own portrait
// geometry in demo.css. PHONE_SOLO = true is the earlier one-view card (decision §9 F2): no
// pills and no Claude & Codex view, the Pancake view plays once and holds its end picture
// (nothing rewinds on screen) for as long as any of the stage shows, and is re-armed once the
// stage has left the screen; a visitor who shrinks the window on the Claude view is then
// brought back to the Pancake view. With no pills the stage is not a tab panel there: its
// role, tab stop and label are dropped (state `solo`, React-owned), and the chip paragraph is
// aria-hidden (the mock's role="img" label describes the card) — verifiers M5 / TA-05.
//
// SSR / first client render = Pancake view at rest (frame 0 = the server markup, no class set).
// Per-frame work writes ONLY: .is-on / .is-off / .is-sw / .is-press classes, the cursor
// transform, and --p on the active pill's fill. React-owned attributes are never mutated.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { BuiltDemo } from "./lp-demo-pancake-timeline";
import { mountWindowGrow } from "./lp-demo-scroll";
import { enqueueBuild, startBuild, type BuildRun } from "./lp-play-once";
import { PHONE_BOX_W, PHONE_QUERY, PHONE_SOLO, type LpDemoView } from "./lp-demo-timeline";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** How long a view rests on its end picture before the other one comes (ms). */
const HOLD_MS = 2200;
/** A view's stay when the timelines could not be fetched: its rest picture, then on. */
const REST_ONLY_MS = 3000;

interface Ctl {
  view: LpDemoView;
  t: number;
  /** The first start happened (the gate opened). */
  started: boolean;
  /** A pill pick plays its view even under the pills' keyboard focus; the hold applies after. */
  oneShot: boolean;
  inView: boolean;
  hidden: boolean;
  paused: boolean;
  reduced: boolean;
  focusHold: boolean;
  /** Phones with PHONE_SOLO: one view, played once. */
  solo: boolean;
  /** The solo view reached its dwell: it holds its end picture (the clock is off). */
  soloDone: boolean;
  /** QA seek: the clock is off until play(). */
  seeking: boolean;
  /** A view switch is waiting for React's commit: the clock must not tick the old view. */
  pending: boolean;
  /** QA fill override (ratio), null = computed. */
  fill: number | null;
  raf: number;
  last: number;
  frames: number;
  /** Each view's GSAP timeline (lazy: GSAP + its builder), null until built. */
  tls: [Built | null, Built | null];
  /** The modules, kept to rebuild a timeline after the stage's size changes. `steps`: the same
   *  builders in slices (lp-play-once's startBuild). */
  mods: { gsap: typeof import("@/lib/gsap").gsap; build: [Builder, Builder]; steps: [Slicer, Slicer] } | null;
  loading: boolean;
  /** The code could not be fetched: the views keep their rest pictures. */
  failed: boolean;
  /** The geometry a timeline measured is stale: rebuilt before its view next starts from its first frame. */
  dirty: [boolean, boolean];
  /** Each run's length (ms): the timeline's own, once built. */
  ends: [number, number];
}
type Built = { tl: BuiltDemo["tl"]; dispose: () => void };
type Builder = (view: HTMLElement) => BuiltDemo;
type Slicer = (view: HTMLElement) => Generator<void, BuiltDemo, void>;

/** Last moment of a view's run (ms): its timeline's duration. */
const endOf = (x: Ctl, v: LpDemoView) => x.ends[v];
/** The run + the hold on its end picture. */
const dwellOf = (x: Ctl, v: LpDemoView) => x.ends[v] + HOLD_MS;

type ViewState = { v: LpDemoView; n: number };

export function LpDemoPlayer({
  pills,
  tablist,
  pause,
  pancake,
  claude,
}: {
  pills: [string, string];
  tablist: string;
  /** Its label stays "Pause demo"; aria-pressed says it holds the demo (VxDemoPlayer's pattern). */
  pause: string;
  pancake: ReactNode;
  claude: ReactNode;
}) {
  const [view, setView] = useState<ViewState>({ v: 0, n: 0 });
  const [paused, setPaused] = useState(false);
  /** Phones with PHONE_SOLO (set after mount): no pills, so the stage is not a tab panel. */
  const [solo, setSolo] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fillRefs = useRef<(HTMLElement | null)[]>([]);
  const nonce = useRef(0);
  const ctl = useRef<Ctl>({
    view: 0,
    t: 0,
    started: false,
    oneShot: false,
    inView: false,
    hidden: false,
    paused: false,
    reduced: false,
    focusHold: false,
    solo: false,
    soloDone: false,
    seeking: false,
    pending: false,
    fill: null,
    raf: 0,
    last: 0,
    frames: 0,
    tls: [null, null],
    mods: null,
    loading: false,
    failed: false,
    dirty: [false, false],
    ends: [REST_ONLY_MS, REST_ONLY_MS],
  });

  /* ── DOM helpers ─────────────────────────────────────────────────────────── */

  const viewEl = useCallback((v: LpDemoView) => cardRef.current?.querySelector<HTMLElement>(`[data-v="${v}"]`) ?? null, []);

  /** View `v` at `t` ms: its timeline is seeked (the rest picture until it is built).
   *  data-live (t > 0) stops the composer's resting caret blink. */
  const render = useCallback(
    (v: LpDemoView, t: number) => {
      const x = ctl.current;
      const built = x.tls[v];
      if (built) built.tl.time(Math.min(Math.max(t, 0), x.ends[v]) / 1000);
      viewEl(v)?.toggleAttribute("data-live", !!built && t > 0);
    },
    [viewEl],
  );
  /** (Re)build a view's timeline (set on mount). */
  const rebuildRef = useRef<(v: LpDemoView) => void>(() => {});

  /** The pills' fills: the active one shows the dwell's progress once started; full (the CSS
   *  default) under reduced motion or pause; empty while the first start waits. */
  const setFills = useCallback(() => {
    const x = ctl.current;
    fillRefs.current.forEach((f, i) => {
      if (!f) return;
      if (i !== x.view) {
        f.style.setProperty("--p", "0");
        return;
      }
      if (x.fill !== null) {
        f.style.setProperty("--p", x.fill.toFixed(4));
        return;
      }
      if (x.reduced || x.paused) {
        f.style.removeProperty("--p");
        return;
      }
      const p = x.started ? Math.max(0, Math.min(1, x.t / dwellOf(x, x.view))) : 0;
      f.style.setProperty("--p", p.toFixed(4));
    });
  }, []);

  /* ── clock ───────────────────────────────────────────────────────────────── */

  const runAttr = useRef(false);
  const setRun = useCallback((on: boolean) => {
    if (runAttr.current === on) return;
    runAttr.current = on;
    cardRef.current?.toggleAttribute("data-run", on);
  }, []);

  const stop = useCallback(() => {
    const x = ctl.current;
    if (x.raf) cancelAnimationFrame(x.raf);
    x.raf = 0;
    setRun(false);
  }, [setRun]);

  const advanceRef = useRef<() => void>(() => {});

  const tick = useCallback(
    (now: number) => {
      const x = ctl.current;
      x.raf = 0;
      x.frames++;
      x.t += Math.min(Math.max(0, now - x.last), 100);
      x.last = now;
      if (x.t >= dwellOf(x, x.view)) {
        advanceRef.current();
        return;
      }
      render(x.view, x.t);
      setFills();
      x.raf = requestAnimationFrame(tick);
    },
    [render, setFills],
  );

  const willRun = useCallback(() => {
    const x = ctl.current;
    return (
      x.started &&
      !x.reduced &&
      !x.paused &&
      !x.hidden &&
      !x.seeking &&
      x.inView &&
      !(x.solo && x.soloDone) &&
      (x.oneShot || !x.focusHold) &&
      // a view waits for its timeline (or shows its rest picture if the code never comes)
      (!!x.tls[x.view] || x.failed)
    );
  }, []);

  const sync = useCallback(() => {
    const x = ctl.current;
    const run = willRun() && !x.pending;
    if (run && !x.raf) {
      x.last = performance.now();
      x.raf = requestAnimationFrame(tick);
    } else if (!run && x.raf) {
      stop();
    }
    setRun(run);
  }, [setRun, stop, tick, willRun]);

  const go = useCallback((v: LpDemoView) => {
    ctl.current.pending = true;
    nonce.current += 1;
    setView({ v, n: nonce.current });
  }, []);

  advanceRef.current = () => {
    const x = ctl.current;
    x.oneShot = false;
    if (x.focusHold || x.solo) {
      // held by keyboard focus: keep this view's end picture; it moves on once the hold ends.
      // Solo (phones): the one view played once and rests on its end picture for good.
      x.t = dwellOf(x, x.view);
      if (x.solo) x.soloDone = true;
      setFills();
      sync();
      return;
    }
    x.t = 0;
    go(x.view === 0 ? 1 : 0);
  };

  /** Enter the view (after React committed data-view): before paint. The incoming view was
   *  hidden until now, so (re)arming it here is never seen. */
  useIsoLayoutEffect(() => {
    const x = ctl.current;
    const card = cardRef.current;
    if (!card || view.n === 0) return;
    x.pending = false;
    x.view = view.v;
    card.setAttribute("data-snap", "");
    // hidden until now: the moment to take a new measure of a resized stage, or to build a view
    // that is armed before its idle slot came
    if ((x.dirty[view.v] || !x.tls[view.v]) && x.t === 0) rebuildRef.current(view.v);
    render(view.v, x.t);
    void card.offsetHeight; // commit the snapped state before transitions come back
    card.removeAttribute("data-snap");
    setFills();
    sync();
    // runs once per committed switch; every callback it uses is stable over refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  /* ── user actions ────────────────────────────────────────────────────────── */

  /** A pill: that view from its first frame (it plays even under the pills' keyboard focus),
   *  then autoplay carries on. Reduced motion / paused: its picture (Pancake rest, Claude end). */
  const pick = useCallback(
    (v: LpDemoView) => {
      const x = ctl.current;
      stop();
      x.started = true;
      x.seeking = false;
      x.fill = null;
      if (x.reduced || x.paused) {
        x.oneShot = false;
        x.t = x.paused && !x.reduced ? endOf(x, v) : 0;
      } else {
        x.oneShot = true;
        x.t = 0;
      }
      go(v);
    },
    [go, stop],
  );

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const x = ctl.current;
    let to: LpDemoView | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") to = x.view === 0 ? 1 : 0;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = 1;
    if (to === null) return;
    e.preventDefault();
    pick(to);
    tabRefs.current[to]?.focus();
  };

  const onPause = () => {
    const x = ctl.current;
    x.paused = !x.paused;
    if (!x.paused) x.started = true; // Play: the visitor asked to watch
    setPaused(x.paused);
    setFills();
    sync();
  };

  /* ── mount: media queries, observers, the first start, the grow effect, QA hooks ───── */

  useEffect(() => {
    const x = ctl.current;
    const card = cardRef.current;
    const stage = stageRef.current;
    const section = card?.closest<HTMLElement>("section");
    if (!card || !stage || !section) return;
    card.setAttribute("data-ready", "");

    const still = /[?&]still\b/.test(window.location.search);
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;

    /* the one scroll effect (desktop, motion allowed): the card's size follows the scroll, .94 ↔ 1 */
    const grow = mountWindowGrow(section, card);
    if (still) grow.lock();

    /* the two timelines: GSAP + the builders, fetched on the visitor's first input or at the
       first start, whichever comes first (nothing at load: phones rest untouched). Each is built
       on its laid-out view once the fonts are in (it measures the request's glyphs).
       A build runs in slices (lp-play-once's startBuild; `through`: all of it at once). A view
       rests on its first frame, which is what its builder's sets write (in ONE slice: the
       builders' headers), so a build can pause between two slices on screen. Returns whether
       slices are left. */
    const runs: [BuildRun | null, BuildRun | null] = [null, null];
    const build = (v: LpDemoView, through = true): boolean => {
      const mods = x.mods;
      const el = viewEl(v);
      if (!mods || !el || disposed) return false;
      if (el.getClientRects().length === 0) {
        x.dirty[v] = true; // not rendered (the agents view, the Claude view on phones): at the next arm
        return false;
      }
      let run = runs[v];
      if (!run) {
        x.tls[v]?.dispose();
        x.tls[v] = null;
        run = runs[v] = startBuild({ gsap: mods.gsap, build: mods.build[v], steps: mods.steps[v] }, el, false);
      }
      let b: BuiltDemo | undefined;
      try {
        b = run.next(through);
      } catch {
        // the view keeps its rest picture, as when the code cannot be fetched
        runs[v] = null;
        run.ctx.revert();
        run.cleanup();
        x.failed = true;
        sync();
        return false;
      }
      if (!b) return true;
      runs[v] = null;
      const { ctx } = run;
      const { cleanup } = b;
      x.tls[v] = {
        tl: b.tl,
        dispose: () => {
          ctx.revert();
          cleanup();
        },
      };
      x.dirty[v] = false;
      x.ends[v] = b.tl.duration() * 1000;
      render(v, x.reduced || x.view !== v ? 0 : x.t);
      setFills();
      sync();
      return false;
    };
    /** A build under way measured a layout that is gone: back to the markup (it is finished
     *  first, the builder's cleanup comes with what it returns). */
    const abort = (v: LpDemoView) => {
      const run = runs[v];
      if (!run) return;
      runs[v] = null;
      try {
        run.next(true);
      } catch {
        // half built: the revert is all there is
      }
      run.ctx.revert();
      run.cleanup();
    };
    const rebuild = (v: LpDemoView) => {
      if (x.dirty[v]) abort(v);
      build(v);
    };
    rebuildRef.current = rebuild;
    /* Each view is built in tasks of its own, in idle time (2026-10-13, the bug check's S1: the
       import's continuation built both views back to back in the task that had just evaluated
       the chunks, 455 ms at the first swipe on a mid-range phone). lp-play-once's queue: idle
       slots (one comes within 50 ms), in page order. The view that is showing has the stage's
       place, so it goes before the page's cards and the clock never waits long (the opening
       screen holds longer than that before anything moves); the other view has no place and
       comes after them: it is not needed before the first run ends, and a view that is armed
       before its turn is built as it is armed (the layout effect above). */
    const queued: [boolean, boolean] = [false, false];
    const unqueue: [() => void, () => void] = [() => {}, () => {}];
    const want = () => {
      for (const v of [0, 1] as const) {
        if (x.tls[v] || queued[v]) continue;
        queued[v] = true;
        unqueue[v] = enqueueBuild(
          () => {
            const more = !x.tls[v] && build(v, false);
            if (!more) queued[v] = false;
            return more;
          },
          v === x.view ? stage : null,
        );
      }
    };
    const ensure = () => {
      if (x.mods) return want();
      if (x.loading || x.failed || x.reduced || disposed) return;
      x.loading = true;
      Promise.all([
        import("@/lib/gsap"),
        import("./lp-demo-pancake-timeline"),
        import("./lp-demo-claude-timeline"),
        document.fonts ? document.fonts.ready : null,
      ])
        .then(([g, pancake, claude]) => {
          x.loading = false;
          if (disposed) return;
          x.mods = {
            gsap: g.gsap,
            build: [pancake.buildDemoPancake, claude.buildDemoClaude],
            steps: [pancake.buildDemoPancakeSteps, claude.buildDemoClaudeSteps],
          };
          want();
        })
        .catch(() => {
          x.loading = false;
          x.failed = true;
          sync();
        });
    };
    const INPUTS = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown"] as const;
    const onFirstInput = () => {
      for (const type of INPUTS) window.removeEventListener(type, onFirstInput);
      ensure();
    };
    for (const type of INPUTS) window.addEventListener(type, onFirstInput, { passive: true });

    const start = () => {
      if (x.started || disposed) return;
      x.started = true;
      ensure();
      setFills();
      sync();
    };

    const setReduced = () => {
      const reduced = still || mqReduce.matches;
      x.reduced = reduced;
      card.toggleAttribute("data-reduced", reduced);
      stop();
      if (reduced) {
        // no motion: each view is its rest picture, the pills switch them at once
        x.oneShot = false;
        x.started = true;
        x.t = 0;
        render(0, 0);
        render(1, 0);
      } else if (x.started) {
        // motion allowed again: the current view starts over
        x.t = 0;
        ensure();
      }
      setFills();
      sync();
    };
    setReduced();
    mqReduce.addEventListener("change", setReduced);

    /* data-inview (≥1px on screen) gates the caret's blink; the clock wants ≥35 % of the stage */
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const vis = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        const h = e.boundingClientRect.height;
        const vh = e.rootBounds?.height ?? window.innerHeight;
        const denom = Math.max(1, Math.min(h, vh));
        section.toggleAttribute("data-inview", e.isIntersecting);
        x.inView = e.isIntersecting && e.intersectionRect.height / denom >= 0.35;
        // Phones (solo): once its take is over and the whole stage has left the screen, the view
        // is re-armed to its first frame, hidden as every re-arm is. A visitor who scrolls back
        // to it sees it play again instead of finding a still for the rest of the visit.
        if (!e.isIntersecting && x.solo && x.soloDone && !x.reduced && !x.seeking) {
          x.soloDone = false;
          x.t = 0;
          if (x.dirty[0]) rebuildRef.current(0);
          render(0, 0);
          setFills();
        }
        sync();
      },
      { threshold: thresholds },
    );
    vis.observe(stage);

    /* first start: the window's top crosses 60 % of the viewport, or 1 s with half of it on
       screen (lp-play-once's FOCUS_MARGIN / DWELL_MS) */
    const win = card.querySelector<HTMLElement>(".lp-demowin__win");
    let dwell = 0;
    const focusObs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { rootMargin: "0px 0px -40% 0px", threshold: 0 },
    );
    const halfObs = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        const vh = e.rootBounds?.height ?? window.innerHeight;
        const share = e.intersectionRect.height / Math.max(1, Math.min(e.boundingClientRect.height, vh));
        window.clearTimeout(dwell);
        if (e.isIntersecting && share >= 0.5) dwell = window.setTimeout(start, 1000);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    if (win && !x.reduced) {
      focusObs.observe(win);
      halfObs.observe(win);
    }

    /* the tab's visibility */
    const onVis = () => {
      x.hidden = document.hidden;
      sync();
    };
    x.hidden = document.hidden;
    document.addEventListener("visibilitychange", onVis);

    /* keyboard focus in the pills or on the chip link holds the clock (WCAG 2.2.2 — Pause is the
       control, and what is focused must not vanish) */
    const holdZones = () => [card.querySelector(".lp-demowin__pills"), card.querySelector(".lp-demowin__agent")];
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      let visible = false;
      try {
        visible = t.matches(":focus-visible");
      } catch {
        visible = false;
      }
      x.focusHold = visible && holdZones().some((z) => z?.contains(t));
      sync();
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as HTMLElement | null;
      if (!next || !holdZones().some((z) => z?.contains(next))) {
        x.focusHold = false;
        sync();
      }
    };
    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);

    /* phones: the card is a design box scaled as pixels. The measured scale replaces the CSS
       trig quotient (same value; engines without trig, or that mis-resolve it, get it here). */
    const mqPhone = window.matchMedia(PHONE_QUERY);
    const chip = card.querySelector<HTMLElement>(".lp-demowin__chip");
    const chipLink = card.querySelector<HTMLElement>(".lp-demowin__agent");
    const writeFit = () => {
      if (!mqPhone.matches) return;
      const w = stage.getBoundingClientRect().width;
      if (w > 0) stage.style.setProperty("--lp-demowin-fit", (w / PHONE_BOX_W).toFixed(6));
    };
    const setPhone = () => {
      const phone = mqPhone.matches;
      x.solo = phone && PHONE_SOLO;
      // no pills: the stage drops its tabpanel role, tab stop and label (render below)
      setSolo(x.solo);
      if (phone) {
        writeFit();
        // a picture at this size (pointer-events: none in demo.css): not a tab stop either, and
        // not a link nobody can tap for assistive tech (the mock's role="img" label describes
        // the card). The guide stays linked from the deep dive, the nav and the footer.
        chipLink?.setAttribute("tabindex", "-1");
        chip?.setAttribute("aria-hidden", "true");
      } else {
        stage.style.removeProperty("--lp-demowin-fit");
        chipLink?.removeAttribute("tabindex");
        chip?.removeAttribute("aria-hidden");
      }
      if (x.solo && x.view === 1) {
        // the Claude view is not rendered on phones: back to the Pancake view, armed while hidden
        stop();
        x.oneShot = false;
        x.t = 0;
        go(0);
        return;
      }
      if (!x.solo) x.soloDone = false;
      sync();
    };
    setPhone();
    /* The breakpoint flips (a tablet turned, a window dragged across 767): the running view was
       measured on the other layout, its chat bar's place is written in px, and until 2026-10-13
       it kept that geometry to the end of its run (the bug check's L1). The view that shows is
       rebuilt at once on the new layout and starts over from its first frame; the hidden one is
       rebuilt by the resize pass below. */
    const onPhoneChange = () => {
      setPhone();
      if (!x.mods || !x.tls[x.view] || x.pending || x.seeking) return;
      stop();
      x.t = 0;
      card.setAttribute("data-snap", "");
      build(x.view);
      void card.offsetHeight; // commit the snapped state before transitions come back
      card.removeAttribute("data-snap");
    };
    mqPhone.addEventListener("change", onPhoneChange);

    /* a new stage width: the timelines measured the old one. Each is rebuilt once the size
       settles, at once if its view is at rest or hidden, else when it next starts from its first
       frame (never mid-run). */
    let stageW = stage.getBoundingClientRect().width;
    let resized = 0;
    const ro = new ResizeObserver(() => {
      writeFit();
      const w = stage.offsetWidth;
      if (Math.abs(w - stageW) < 0.5) return;
      stageW = w;
      x.dirty = [true, true];
      // a build under way measured the old width: it starts over with the pass below
      abort(0);
      abort(1);
      window.clearTimeout(resized);
      resized = window.setTimeout(() => {
        if (!x.mods) return;
        for (const v of [0, 1] as const) {
          if (x.dirty[v] && (x.view !== v || x.t === 0 || x.reduced)) build(v);
        }
      }, 200);
    });
    stageW = stage.offsetWidth;
    ro.observe(stage);

    /* QA hooks: ?lpqa, or any non-production build */
    const qa = /[?&]lpqa\b/.test(window.location.search) || process.env.NODE_ENV !== "production";
    const w = window as unknown as { __lpDemo?: unknown };
    if (qa) {
      const seek = (v: LpDemoView, ms: number) => {
        stop();
        x.seeking = true;
        x.oneShot = false;
        x.started = true;
        grow.lock(); // captures are compared with the full-size designs
        ensure();
        if (!x.tls[v]) build(v); // a seek does not wait for the view's idle slot
        x.t = ms;
        flushSync(() => go(v));
        // same view: the layout effect re-applies (new nonce)
      };
      w.__lpDemo = {
        /** Freeze view v at ms (no clock until play()). */
        seek,
        /** The rest picture (frame 0). */
        rest: (v: LpDemoView) => seek(v, 0),
        /** The end picture. */
        final: (v: LpDemoView) => seek(v, endOf(x, v)),
        /** Autoplay from the current view's first frame. */
        play() {
          x.seeking = false;
          x.paused = false;
          setPaused(false);
          x.started = true;
          grow.lock();
          x.t = 0;
          flushSync(() => go(x.view));
        },
        /** Force the active pill's fill (V2's static picture shows 0.4333); null = computed. */
        fill(r: number | null) {
          x.fill = r;
          setFills();
        },
        /** The grow effect at its end: the card at scale 1, locked (for full-size captures). */
        lock: grow.lock,
        state() {
          return {
            view: x.view,
            t: Math.round(x.t),
            started: x.started,
            paused: x.paused,
            reduced: x.reduced,
            inView: x.inView,
            focusHold: x.focusHold,
            seeking: x.seeking,
            running: x.raf !== 0,
            frames: x.frames,
            /** the timelines: built (Pancake, Claude), and the current run's length (ms) */
            pk: !!x.tls[0],
            ck: !!x.tls[1],
            end: Math.round(endOf(x, x.view)),
            /** the grow effect: { g, done } (lp-demo-scroll.ts) */
            grow: grow.state(),
          };
        },
      };
    }

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(dwell);
      window.clearTimeout(resized);
      for (const type of INPUTS) window.removeEventListener(type, onFirstInput);
      for (const v of [0, 1] as const) {
        unqueue[v]();
        abort(v);
        x.tls[v]?.dispose();
        x.tls[v] = null;
        viewEl(v)?.removeAttribute("data-live");
      }
      vis.disconnect();
      focusObs.disconnect();
      halfObs.disconnect();
      ro.disconnect();
      grow.destroy();
      mqReduce.removeEventListener("change", setReduced);
      mqPhone.removeEventListener("change", onPhoneChange);
      stage.style.removeProperty("--lp-demowin-fit");
      chipLink?.removeAttribute("tabindex");
      chip?.removeAttribute("aria-hidden");
      document.removeEventListener("visibilitychange", onVis);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
      if (qa) delete w.__lpDemo;
    };
    // mount-only: every dependency is a stable callback over refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── markup ──────────────────────────────────────────────────────────────── */

  const v = view.v;
  return (
    <div className="lp-demowin__card" data-view={v} data-phone-solo={PHONE_SOLO ? "" : undefined} ref={cardRef}>
      <div
        className="lp-demowin__stage"
        id="lp-demowin-panel"
        role={solo ? undefined : "tabpanel"}
        tabIndex={solo ? undefined : 0}
        aria-labelledby={solo ? undefined : `lp-demowin-tab-${v}`}
        data-nosnippet=""
        ref={stageRef}
      >
        <div className="lp-demowin__view lp-demowin__view--pancake" data-v="0">
          {pancake}
        </div>
        <div className="lp-demowin__view lp-demowin__view--claude" data-v="1">
          {claude}
        </div>
      </div>

      {/* the pills (V2 4939:2784): a two-view tablist; the fill is the dwell's progress */}
      <div className="lp-demowin__tabs">
        <div className="lp-demowin__pills" role="tablist" aria-label={tablist} onKeyDown={onTabKey}>
          {pills.map((label, i) => (
            <button
              key={label}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`lp-demowin-tab-${i}`}
              className="lp-demowin__pill"
              aria-controls="lp-demowin-panel"
              aria-selected={i === v}
              tabIndex={i === v ? 0 : -1}
              onClick={() => pick(i as LpDemoView)}
            >
              <i
                className="lp-demowin__fill"
                aria-hidden="true"
                ref={(el) => {
                  fillRefs.current[i] = el;
                }}
              />
              <span className="lp-demowin__pill-l">{label}</span>
            </button>
          ))}
        </div>
        {/* keyboard-only Pause (WCAG 2.2.2: the demo moves on its own for more than 5 s), revealed
            on focus or while it holds the demo paused — production's .vx-ctrl recipe */}
        <span className="lp-demowin__ctrl">
          <button
            type="button"
            className="lp-demowin__ctrl-btn"
            tabIndex={0}
            aria-pressed={paused}
            aria-label={pause}
            data-ico={paused ? "play" : "pause"}
            onClick={onPause}
          />
        </span>
      </div>
    </div>
  );
}
