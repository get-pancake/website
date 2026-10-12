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
// Two engines under one clock (ms since the view started):
//   · Pancake (since 2026-10-12): ONE GSAP timeline, seeked every frame
//     (lp-demo-pancake-timeline.ts). GSAP and the builder are a lazy chunk, fetched on the
//     visitor's first input or at the first start; until it is built the view is its rest
//     picture and the clock waits. Its length is the timeline's own.
//   · Claude & Codex: the class cues of lp-demo-timeline.ts (frameAt), as before.
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
// order (the card is a picture there). PHONE_SOLO (decision §9 F2): no pills and no Claude &
// Codex view on phones, so the Pancake view plays ONCE and holds its end picture (nothing
// rewinds on screen, no loop), and a visitor who shrinks the window on the Claude view is
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
import {
  CURSOR_ENTRY,
  DWELL,
  END,
  frameAt,
  PHONE_BOX_W,
  PHONE_QUERY,
  PHONE_SOLO,
  type LpDemoFrame,
  type LpDemoView,
} from "./lp-demo-timeline";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** How long a view rests on its end picture before the other one comes (ms). */
const HOLD_MS = 2200;
/** The Pancake view's stay when its timeline could not be fetched: its rest picture, then on. */
const REST_ONLY_MS = 3000;

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
  sig: [string, string];
  views: [ViewCache | null, ViewCache | null];
  pos: Map<string, { x: number; y: number }>;
  /** The Pancake view's GSAP timeline (lazy: GSAP + lp-demo-pancake-timeline), null until built. */
  pk: { tl: BuiltDemo["tl"]; dispose: () => void } | null;
  /** Its modules, kept to rebuild it after the stage's size changes. */
  pkMods: { gsap: typeof import("@/lib/gsap").gsap; build: (view: HTMLElement) => BuiltDemo } | null;
  pkLoading: boolean;
  /** The code could not be fetched: the view keeps its rest picture. */
  pkFailed: boolean;
  /** The geometry it measured is stale: rebuilt before the view next starts from its first frame. */
  pkDirty: boolean;
  /** The Pancake run's length (ms): the timeline's own, once built. */
  end0: number;
}

/** Last moment of a view's run (ms): the Pancake timeline's duration, the Claude cue table's END. */
const endOf = (x: Ctl, v: LpDemoView) => (v === 0 ? x.end0 : END[1]);
/** The run + the hold on its end picture. */
const dwellOf = (x: Ctl, v: LpDemoView) => (v === 0 ? x.end0 + HOLD_MS : DWELL[1]);

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
    sig: ["", ""],
    views: [null, null],
    pos: new Map(),
    pk: null,
    pkMods: null,
    pkLoading: false,
    pkFailed: false,
    pkDirty: false,
    end0: REST_ONLY_MS,
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

  /** The Pancake view at `t` ms: its timeline is seeked (the rest picture until it is built).
   *  data-live (t > 0) stops the chat bar's resting caret blink. */
  const renderPancake = useCallback((t: number) => {
    const x = ctl.current;
    const el = cardRef.current?.querySelector<HTMLElement>('[data-v="0"]');
    if (x.pk) x.pk.tl.time(Math.min(Math.max(t, 0), x.end0) / 1000);
    el?.toggleAttribute("data-live", !!x.pk && t > 0);
  }, []);
  /** (Re)build the Pancake timeline (set on mount). */
  const rebuildRef = useRef<() => void>(() => {});

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
      if (x.view === 0) renderPancake(x.t);
      else applyTo(1, frameAt(1, x.t));
      setFills();
      x.raf = requestAnimationFrame(tick);
    },
    [applyTo, renderPancake, setFills],
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
      // the Pancake view waits for its timeline (or plays its rest picture if it never comes)
      (x.view !== 0 || !!x.pk || x.pkFailed)
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
    if (view.v === 0) {
      // hidden until now: the moment to take a new measure of a resized stage
      if (x.pkDirty && x.t === 0) rebuildRef.current();
      renderPancake(x.t);
    } else {
      applyTo(1, frameAt(1, x.t), true);
    }
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
        x.t = x.reduced && v === 1 ? END[1] : x.paused ? endOf(x, v) : 0;
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

    /* the Pancake view's timeline: GSAP + its builder, fetched on the visitor's first input or
       at the first start, whichever comes first (nothing at load: phones rest untouched). Built
       on the laid-out view once the fonts are in (it measures the request's glyphs). */
    const view0 = card.querySelector<HTMLElement>('[data-v="0"]');
    const buildPk = () => {
      const mods = x.pkMods;
      if (!mods || !view0 || disposed) return;
      if (view0.getClientRects().length === 0) {
        x.pkDirty = true; // not rendered (the agents view hides the section): at the next arm
        return;
      }
      x.pk?.dispose();
      x.pk = null;
      const out: { b: BuiltDemo | null } = { b: null };
      const ctx = mods.gsap.context(() => {
        out.b = mods.build(view0);
      });
      const b = out.b;
      if (!b) {
        ctx.revert();
        return;
      }
      x.pk = {
        tl: b.tl,
        dispose: () => {
          ctx.revert();
          b.cleanup();
        },
      };
      x.pkDirty = false;
      x.end0 = b.tl.duration() * 1000;
      if (x.view === 0) renderPancake(x.reduced ? 0 : x.t);
      setFills();
      sync();
    };
    rebuildRef.current = buildPk;
    const ensurePk = () => {
      if (x.pkMods) {
        if (!x.pk) buildPk();
        return;
      }
      if (x.pkLoading || x.pkFailed || x.reduced || disposed) return;
      x.pkLoading = true;
      Promise.all([import("@/lib/gsap"), import("./lp-demo-pancake-timeline"), document.fonts ? document.fonts.ready : null])
        .then(([g, m]) => {
          x.pkLoading = false;
          if (disposed) return;
          x.pkMods = { gsap: g.gsap, build: m.buildDemoPancake };
          buildPk();
        })
        .catch(() => {
          x.pkLoading = false;
          x.pkFailed = true;
          sync();
        });
    };
    const INPUTS = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown"] as const;
    const onFirstInput = () => {
      for (const type of INPUTS) window.removeEventListener(type, onFirstInput);
      ensurePk();
    };
    for (const type of INPUTS) window.addEventListener(type, onFirstInput, { passive: true });

    const start = () => {
      if (x.started || disposed) return;
      x.started = true;
      ensurePk();
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
        // Pancake = its rest picture (the V2 design), Claude = its end picture
        x.t = x.view === 1 ? END[1] : 0;
        card.setAttribute("data-snap", "");
        renderPancake(0);
        applyTo(1, frameAt(1, END[1]), true);
        void card.offsetHeight;
        card.removeAttribute("data-snap");
      } else if (x.started) {
        // motion allowed again: hold the current view's picture, then carry on
        x.t = x.view === 1 ? END[1] : 0;
        applyTo(1, frameAt(1, x.view === 1 ? END[1] : 0), true);
        ensurePk();
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
      x.pos.clear();
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
    mqPhone.addEventListener("change", setPhone);

    /* a new stage width: the Claude cursor targets and the Pancake timeline measured the old one.
       The timeline is rebuilt once the size settles, at once if the view is at rest or hidden,
       else when it next starts from its first frame (never mid-run). */
    let stageW = stage.getBoundingClientRect().width;
    let resized = 0;
    const ro = new ResizeObserver(() => {
      x.pos.clear();
      writeFit();
      const w = stage.offsetWidth;
      if (Math.abs(w - stageW) < 0.5) return;
      stageW = w;
      x.pkDirty = true;
      window.clearTimeout(resized);
      resized = window.setTimeout(() => {
        if (x.pkDirty && x.pkMods && (x.view !== 0 || x.t === 0 || x.reduced)) buildPk();
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
        ensurePk();
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
            /** the Pancake timeline: built, and its run's length (ms) */
            pk: !!x.pk,
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
      x.pk?.dispose();
      x.pk = null;
      view0?.removeAttribute("data-live");
      vis.disconnect();
      focusObs.disconnect();
      halfObs.disconnect();
      ro.disconnect();
      grow.destroy();
      mqReduce.removeEventListener("change", setReduced);
      mqPhone.removeEventListener("change", setPhone);
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
