"use client";

// LpDemoPlayer — the homepage demo window's ONLY client island (LpDemo.tsx renders the two views
// on the server and hands them over as children; the island's props are four strings).
// Structure mirrors VxDemoPlayer (refs, a rAF clock, IntersectionObserver gates) without its
// prompt rows, four tabs or Slack. Spec: demo-scroll.md §6.4, §7.
//
// Views: 0 Pancake, 1 Claude & Codex, stacked in one grid cell (zero CLS); the incoming view
// fades in on top (240 ms) while the outgoing one stays under it, then hides; a view is re-armed
// to its first frame only while hidden (never rewound on screen). Loop: Pancake (DWELL 7720) →
// Claude & Codex (8600) → … while the clock runs.
//
// The clock runs while: started, ≥35 % of the stage on screen (of the viewport for a taller
// stage), the tab visible, not paused, motion allowed, no keyboard focus held in the pills or on
// the chip link. It pauses in place otherwise. data-run on the card mirrors it (the Claude tool
// spinner only turns then).
//
// First start:
//   · the hero scroll assembles the window (desktop ≥1025 × ≥640 tall, motion allowed): when it
//     completes (p = 1: the section's top at 141 px), or at load if the page is already past it;
//   · otherwise (phones, tablets, short windows, Firefox-free of nothing — every engine runs the
//     assembly through ScrollTrigger): once the window's top crosses 60 % of the viewport, or
//     after 1 s with half of it on screen (lp-play-once's rule).
//   A pill click starts it at once. Nothing autoplays on a half-built window.
// Lock: data-hs-done on the section — the first start, a pill click or keyboard focus in the
// stage. The window then stays assembled for the visit (never disassembled by scrolling back).
//
// Reduced motion (or ?still): no clock and no GSAP download; the Pancake view is its rest
// picture (the V2 design), the Claude view its end picture; the pills switch views instantly.
//
// SSR / first client render = Pancake view at rest (frame 0 = the server markup, no class set).
// Per-frame work writes ONLY: .is-on / .is-off / .is-sw / .is-press classes, the cursor
// transform, and --p on the active pill's fill. React-owned attributes are never mutated.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { CURSOR_ENTRY, DWELL, END, frameAt, type LpDemoFrame, type LpDemoView } from "./lp-demo-timeline";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The hero scroll runs here only (demo.css uses the same query). */
const HS_QUERY = "(min-width: 1025px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

interface ViewCache {
  el: HTMLElement;
  /** The window the cursor rides in (its offsetParent). */
  win: HTMLElement;
  cursor: HTMLElement | null;
  cues: HTMLElement[];
  uncues: HTMLElement[];
  swaps: HTMLElement[];
  presses: HTMLElement[];
  targets: HTMLElement[];
}

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
  /** QA seek: the clock is off until play(). */
  seeking: boolean;
  /** A view switch is waiting for React's commit: the clock must not tick the old view. */
  pending: boolean;
  /** QA fill override (ratio), null = computed. */
  fill: number | null;
  raf: number;
  last: number;
  frames: number;
  sig: [string, string];
  views: [ViewCache | null, ViewCache | null];
  pos: Map<string, { x: number; y: number }>;
}

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

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fillRefs = useRef<(HTMLElement | null)[]>([]);
  const nonce = useRef(0);
  const lockRef = useRef<() => void>(() => {});
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
    seeking: false,
    pending: false,
    fill: null,
    raf: 0,
    last: 0,
    frames: 0,
    sig: ["", ""],
    views: [null, null],
    pos: new Map(),
  });

  /* ── DOM helpers ─────────────────────────────────────────────────────────── */

  const cache = useCallback((v: LpDemoView): ViewCache | null => {
    const x = ctl.current;
    const hit = x.views[v];
    if (hit) return hit;
    const el = cardRef.current?.querySelector<HTMLElement>(`[data-v="${v}"]`);
    const win = el?.querySelector<HTMLElement>(v === 0 ? ".lp-demowin__win" : ".lp-demowin__cwin");
    if (!el || !win) return null;
    const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
    const c: ViewCache = {
      el,
      win,
      cursor: win.querySelector<HTMLElement>(".lp-demowin__cursor"),
      cues: q("[data-cue]"),
      uncues: q("[data-uncue]"),
      swaps: q("[data-swap]"),
      presses: q("[data-press]"),
      targets: q("[data-cursor]"),
    };
    x.views[v] = c;
    return c;
  }, []);

  /** A cursor target's centre in its window, from layout offsets (transforms ignored). */
  const targetPos = useCallback(
    (v: LpDemoView, id: string): { x: number; y: number } | null => {
      const x = ctl.current;
      const key = `${v}:${id}`;
      const hit = x.pos.get(key);
      if (hit) return hit;
      const c = cache(v);
      const el = c?.targets.find((e) => e.dataset.cursor === id);
      if (!c || !el) return null;
      let left = 0;
      let top = 0;
      let n: HTMLElement | null = el;
      while (n && n !== c.win) {
        left += n.offsetLeft;
        top += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      if (n !== c.win) return null;
      const out = { x: left + el.offsetWidth * 0.5, y: top + el.offsetHeight * 0.55 };
      x.pos.set(key, out);
      return out;
    },
    [cache],
  );

  /** Write one frame of view `v` into the DOM (class state diffed by frame.sig unless forced). */
  const applyTo = useCallback(
    (v: LpDemoView, f: LpDemoFrame, force = false) => {
      const x = ctl.current;
      const c = cache(v);
      if (!c) return;
      if (force || f.sig !== x.sig[v]) {
        const on = new Set(f.on);
        const sw = new Set(f.sw);
        for (const e of c.cues) e.classList.toggle("is-on", on.has(e.dataset.cue ?? ""));
        for (const e of c.uncues) e.classList.toggle("is-off", on.has(e.dataset.uncue ?? ""));
        for (const e of c.swaps) e.classList.toggle("is-sw", sw.has(e.dataset.swap ?? ""));
        for (const e of c.presses) e.classList.toggle("is-press", f.press === e.dataset.press);
        x.sig[v] = f.sig;
      }
      const cur = c.cursor;
      if (!cur) return;
      const k = f.cursor;
      const a = k.from ? targetPos(v, k.from) : null;
      const b = k.to ? targetPos(v, k.to) : null;
      if (!k.visible || (k.to && !b)) {
        cur.classList.remove("is-on", "is-click");
        return;
      }
      const entry = { x: c.win.clientWidth * CURSOR_ENTRY.x, y: c.win.clientHeight * CURSOR_ENTRY.y };
      const from = a ? { x: a.x + k.fromD[0], y: a.y + k.fromD[1] } : entry;
      const to = b ? { x: b.x + k.toD[0], y: b.y + k.toD[1] } : from;
      const px = from.x + (to.x - from.x) * k.k;
      const py = from.y + (to.y - from.y) * k.k;
      cur.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      cur.classList.add("is-on");
      cur.classList.toggle("is-click", k.click);
    },
    [cache, targetPos],
  );

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
      const p = x.started ? Math.max(0, Math.min(1, x.t / DWELL[x.view])) : 0;
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
      if (x.t >= DWELL[x.view]) {
        advanceRef.current();
        return;
      }
      applyTo(x.view, frameAt(x.view, x.t));
      setFills();
      x.raf = requestAnimationFrame(tick);
    },
    [applyTo, setFills],
  );

  const willRun = useCallback(() => {
    const x = ctl.current;
    return x.started && !x.reduced && !x.paused && !x.hidden && !x.seeking && x.inView && (x.oneShot || !x.focusHold);
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
    if (x.focusHold) {
      // held by keyboard focus: keep this view's end picture; it moves on once the hold ends
      x.t = DWELL[x.view];
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
    applyTo(view.v, frameAt(view.v, x.t), true);
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
      lockRef.current();
      x.started = true;
      x.seeking = false;
      x.fill = null;
      if (x.reduced || x.paused) {
        x.oneShot = false;
        x.t = x.reduced && v === 1 ? END[1] : x.paused ? END[v] : 0;
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

  /* ── mount: media queries, observers, gates, the hero scroll, QA hooks ───── */

  useEffect(() => {
    const x = ctl.current;
    const card = cardRef.current;
    const stage = stageRef.current;
    const section = card?.closest<HTMLElement>("section");
    if (!card || !stage || !section) return;
    card.setAttribute("data-ready", "");

    const still = /[?&]still\b/.test(window.location.search);
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqHs = window.matchMedia(HS_QUERY);
    let disposed = false;

    /* lock: the window stays assembled (state 03) for the rest of the visit */
    const lock = () => {
      if (section.hasAttribute("data-hs-done")) return;
      section.setAttribute("data-hs-done", "");
      section.style.removeProperty("--lp-hs");
    };
    lockRef.current = lock;

    const start = () => {
      if (x.started || disposed) return;
      x.started = true;
      lock();
      setFills();
      sync();
    };

    const setReduced = () => {
      const reduced = still || mqReduce.matches;
      x.reduced = reduced;
      card.toggleAttribute("data-reduced", reduced);
      stop();
      if (reduced) {
        x.oneShot = false;
        x.started = true;
        lock();
        // Pancake = its rest picture (the V2 design), Claude = its end picture
        x.t = x.view === 1 ? END[1] : 0;
        card.setAttribute("data-snap", "");
        applyTo(0, frameAt(0, 0), true);
        applyTo(1, frameAt(1, END[1]), true);
        void card.offsetHeight;
        card.removeAttribute("data-snap");
      } else if (x.started) {
        // motion allowed again: hold the current view's picture, then carry on
        x.t = x.view === 1 ? END[1] : 0;
        applyTo(1, frameAt(1, x.view === 1 ? END[1] : 0), true);
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
        sync();
      },
      { threshold: thresholds },
    );
    vis.observe(stage);

    /* first start without the hero scroll: the window's top crosses 60 % of the viewport, or
       1 s with half of it on screen (lp-play-once's FOCUS_MARGIN / DWELL_MS) */
    const win = card.querySelector<HTMLElement>(".lp-demowin__win");
    let dwell = 0;
    /** the hero scroll owns the first start, unless it is off here or failed to load */
    let hsFailed = false;
    const byScroll = () => mqHs.matches && !still && !hsFailed;
    const focusObs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !byScroll()) start();
      },
      { rootMargin: "0px 0px -40% 0px", threshold: 0 },
    );
    const halfObs = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        const vh = e.rootBounds?.height ?? window.innerHeight;
        const share = e.intersectionRect.height / Math.max(1, Math.min(e.boundingClientRect.height, vh));
        window.clearTimeout(dwell);
        if (e.isIntersecting && share >= 0.5 && !byScroll()) dwell = window.setTimeout(start, 1000);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    if (win && !x.reduced) {
      focusObs.observe(win);
      halfObs.observe(win);
    }

    /* the hero scroll (desktop, motion allowed): GSAP ScrollTrigger, lazy */
    let unmountHs: (() => void) | null = null;
    let loadingHs = false;
    const mountHs = () => {
      if (unmountHs || loadingHs || disposed || still || !mqHs.matches) return;
      loadingHs = true;
      // already past the end (reload mid-page, an anchor): no assembly for the window
      if (section.getBoundingClientRect().top <= 141) start();
      Promise.all([import("@/lib/gsap"), import("./lp-demo-scroll")])
        .then(([, mod]) => {
          loadingHs = false;
          if (disposed) return;
          unmountHs = mod.mountHeroScroll(section, (p) => {
            // not while the section is display:none (the agents view): its range is meaningless there
            if (p >= 1 && section.getClientRects().length > 0) start();
          });
        })
        .catch(() => {
          // no driver: show the assembled window, start by the 60 % rule
          loadingHs = false;
          hsFailed = true;
          lock();
        });
    };
    mountHs();
    const onHsChange = () => {
      if (mqHs.matches) mountHs();
    };
    mqHs.addEventListener("change", onHsChange);

    /* the tab's visibility */
    const onVis = () => {
      x.hidden = document.hidden;
      sync();
    };
    x.hidden = document.hidden;
    document.addEventListener("visibilitychange", onVis);

    /* keyboard focus: in the stage it locks the assembly; in the pills or on the chip link it
       holds the clock (WCAG 2.2.2 — Pause is the control, and what is focused must not vanish) */
    const holdZones = () => [card.querySelector(".lp-demowin__pills"), card.querySelector(".lp-demowin__agent")];
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (stage.contains(t)) lock();
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

    const ro = new ResizeObserver(() => x.pos.clear());
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
        lock();
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
        final: (v: LpDemoView) => seek(v, END[v]),
        /** Autoplay from the current view's first frame. */
        play() {
          x.seeking = false;
          x.paused = false;
          setPaused(false);
          x.started = true;
          lock();
          x.t = 0;
          flushSync(() => go(x.view));
        },
        /** Force the active pill's fill (V2's static picture shows 0.4333); null = computed. */
        fill(r: number | null) {
          x.fill = r;
          setFills();
        },
        lock,
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
            hs: section.getAttribute("data-hs"),
            hsDone: section.hasAttribute("data-hs-done"),
            hsDriver: unmountHs !== null,
          };
        },
      };
    }

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(dwell);
      vis.disconnect();
      focusObs.disconnect();
      halfObs.disconnect();
      ro.disconnect();
      unmountHs?.();
      mqReduce.removeEventListener("change", setReduced);
      mqHs.removeEventListener("change", onHsChange);
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
    <div className="lp-demowin__card" data-view={v} ref={cardRef}>
      <div
        className="lp-demowin__stage"
        id="lp-demowin-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`lp-demowin-tab-${v}`}
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
