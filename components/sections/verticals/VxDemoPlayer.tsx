"use client";

// VxDemoPlayer — the ONLY client island of a /for page (spec §4.2, §4.8).
//
// Renders the demo card shell (prompt cards, tablist, stage, controls) and receives the
// four product surfaces as SERVER-rendered children (`app`, `slack`), so the island's
// props are only this vertical's PlayerModel (≈2 KB) and the pane markup costs no JS.
//
// State split:
//   React state — prompt / tab (+ a nonce), paused, tablist orientation. Changes only on
//                 switches, never per frame.
//   Refs (ctl)  — the clock `t`, autoplay / one-shot flags, holds, rAF id. Per-frame work
//                 writes ONLY: data-armed / data-snap on the card, .is-on / .is-sw / .is-mk /
//                 .is-press / .has-text / .is-streaming classes, --p on the active rail, the
//                 cursor transform, and the text of two React-empty spans (typed, live).
//                 React-owned attributes and text are never mutated.
// SSR / first client render = prompt 0, Brief, final frame, no data-armed, no data-ready.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { PlayerModel } from "@/lib/verticals/demo-model";
import { CURSOR_ENTRY, DWELL, endOf, frameAt, type DemoFrame, type DemoTab } from "@/lib/verticals/demo-timeline";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface PaneCache {
  el: HTMLElement;
  cues: HTMLElement[];
  swaps: HTMLElement[];
  marks: HTMLElement[];
  targets: HTMLElement[];
  msgs: HTMLElement[];
}

interface Ctl {
  prompt: number;
  tab: DemoTab;
  prevTab: DemoTab;
  t: number;
  autoplay: boolean;
  oneShot: boolean;
  started: boolean;
  armed: boolean;
  inView: boolean;
  hover: boolean;
  focusHold: boolean;
  hidden: boolean;
  paused: boolean;
  reduced: boolean;
  seeking: boolean;
  /** A view switch is waiting for React's commit: the clock must not tick the old pane. */
  pending: boolean;
  raf: number;
  last: number;
  frames: number;
  sig: string;
  panes: (PaneCache | null)[];
  pos: Map<string, { x: number; y: number }>;
}

type View = { prompt: number; tab: DemoTab; n: number };

const TABS: DemoTab[] = [0, 1, 2, 3];

export function VxDemoPlayer({ model, app, slack }: { model: PlayerModel; app: ReactNode; slack: ReactNode }) {
  const [view, setView] = useState<View>({ prompt: 0, tab: 0, n: 0 });
  const [paused, setPaused] = useState(false);
  const [horiz, setHoriz] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRefs = useRef<(HTMLElement | null)[]>([]);
  const nonce = useRef(0);
  const ctl = useRef<Ctl>({
    prompt: 0,
    tab: 0,
    prevTab: 0,
    t: 0,
    autoplay: true,
    oneShot: false,
    started: false,
    armed: false,
    inView: false,
    hover: false,
    focusHold: false,
    hidden: false,
    paused: false,
    reduced: false,
    seeking: false,
    pending: false,
    raf: 0,
    last: 0,
    frames: 0,
    sig: "",
    panes: [null, null, null, null],
    pos: new Map(),
  });

  const lensOf = useCallback((p: number) => model.prompts[p].lens, [model]);

  /* ── DOM helpers ─────────────────────────────────────────────────────────── */

  const pane = useCallback((tab: DemoTab): PaneCache | null => {
    const x = ctl.current;
    const cached = x.panes[tab];
    if (cached) return cached;
    const el = cardRef.current?.querySelector<HTMLElement>(`[data-pane="${tab}"]`);
    if (!el) return null;
    const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
    const c: PaneCache = {
      el,
      cues: q("[data-cue]"),
      swaps: q("[data-swap]"),
      marks: q("[data-mark]"),
      targets: q("[data-cursor]"),
      msgs: q(".vx-msg"),
    };
    x.panes[tab] = c;
    return c;
  }, []);

  /** Cursor target centre relative to the stage, from layout offsets (transforms ignored). */
  const targetPos = useCallback(
    (id: string): { x: number; y: number } | null => {
      const x = ctl.current;
      const key = `${x.tab}:${x.prompt}:${id}`;
      const hit = x.pos.get(key);
      if (hit) return hit;
      const stage = stageRef.current;
      const p = pane(x.tab);
      if (!stage || !p) return null;
      const el = p.targets.find((e) => {
        if (e.dataset.cursor !== id) return false;
        const v = e.closest<HTMLElement>("[data-p]");
        return !v || (v.dataset.p ?? "").includes(String(x.prompt));
      });
      if (!el) return null;
      let left = 0;
      let top = 0;
      let n: HTMLElement | null = el;
      while (n && n !== stage) {
        left += n.offsetLeft;
        top += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      if (n !== stage) return null;
      const out = { x: left + el.offsetWidth * 0.5, y: top + el.offsetHeight * 0.55 };
      x.pos.set(key, out);
      return out;
    },
    [pane],
  );

  const setRail = useCallback(() => {
    const x = ctl.current;
    railRefs.current.forEach((r, i) => {
      if (!r) return;
      if (i !== x.tab || x.reduced || !x.started) {
        r.style.removeProperty("--p");
        return;
      }
      const lens = lensOf(x.prompt);
      const p = x.autoplay ? x.t / DWELL[x.tab] : x.t / endOf(x.tab, lens);
      r.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(4));
    });
  }, [lensOf]);

  /** Write one frame of the ACTIVE pane into the DOM (diffed by frame.sig unless forced). */
  const apply = useCallback(
    (f: DemoFrame, force = false) => {
      const x = ctl.current;
      const p = pane(x.tab);
      const card = cardRef.current;
      if (!p || !card) return;
      if (force || f.sig !== x.sig) {
        const on = new Set(f.on);
        const sw = new Set(f.sw);
        const mk = new Set(f.mk);
        for (const e of p.cues) e.classList.toggle("is-on", on.has(e.dataset.cue ?? ""));
        for (const e of p.swaps) e.classList.toggle("is-sw", sw.has(e.dataset.swap ?? ""));
        for (const e of p.marks) e.classList.toggle("is-mk", mk.has(e.dataset.mark ?? ""));
        for (const e of p.targets) e.classList.toggle("is-press", f.cursor.press === e.dataset.cursor);
        x.sig = f.sig;
      }
      const data = model.prompts[x.prompt];
      if (x.tab === 0) {
        const typed = p.el.querySelector<HTMLElement>(".vx-typed");
        const composer = p.el.querySelector<HTMLElement>(".vx-composer");
        const txt = data.text.slice(0, f.typed);
        if (typed && typed.textContent !== txt) typed.textContent = txt;
        composer?.classList.toggle("has-text", f.typed > 0);
      }
      if (x.tab === 2) {
        for (const m of p.msgs) {
          const mine = m.dataset.p === String(x.prompt);
          m.classList.toggle("is-streaming", f.stream !== null);
          const live = m.querySelector<HTMLElement>(".vx-msg__live");
          const txt = mine && f.stream !== null ? data.message.slice(0, f.stream) : "";
          if (live && live.textContent !== txt) live.textContent = txt;
        }
      }
      const cur = cursorRef.current;
      const stage = stageRef.current;
      if (cur && stage) {
        const c = f.cursor;
        const a = c.from ? targetPos(c.from) : null;
        const b = c.to ? targetPos(c.to) : null;
        if (!c.visible || (c.to && !b)) {
          cur.classList.remove("is-on", "is-click");
        } else {
          const entry = { x: stage.clientWidth * CURSOR_ENTRY.x, y: stage.clientHeight * CURSOR_ENTRY.y };
          const from = a ?? entry;
          const to = b ?? from;
          const px = from.x + (to.x - from.x) * c.k;
          const py = from.y + (to.y - from.y) * c.k;
          cur.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
          cur.classList.add("is-on");
          cur.classList.toggle("is-click", c.click);
        }
      }
    },
    [model, pane, targetPos],
  );

  /** Put a (non-active) pane in its final frame: every cue on, swaps after, no text. */
  const finalize = useCallback(
    (tab: DemoTab) => {
      const p = pane(tab);
      if (!p) return;
      for (const e of p.cues) e.classList.add("is-on");
      for (const e of p.swaps) e.classList.add("is-sw");
      for (const e of p.marks) e.classList.add("is-mk");
      for (const e of p.targets) e.classList.remove("is-press");
      for (const m of p.msgs) {
        m.classList.remove("is-streaming");
        const live = m.querySelector<HTMLElement>(".vx-msg__live");
        if (live && live.textContent) live.textContent = "";
      }
      const typed = p.el.querySelector<HTMLElement>(".vx-typed");
      if (typed && typed.textContent) typed.textContent = "";
      p.el.querySelector(".vx-composer")?.classList.remove("has-text");
    },
    [pane],
  );

  const setArmedAttr = useCallback((armed: boolean) => {
    cardRef.current?.toggleAttribute("data-armed", armed);
  }, []);

  /* ── clock ───────────────────────────────────────────────────────────────── */

  const stop = useCallback(() => {
    const x = ctl.current;
    if (x.raf) cancelAnimationFrame(x.raf);
    x.raf = 0;
  }, []);

  const advanceRef = useRef<() => void>(() => {});

  const tick = useCallback(
    (now: number) => {
      const x = ctl.current;
      x.raf = 0;
      x.frames++;
      x.t += Math.min(Math.max(0, now - x.last), 100);
      x.last = now;
      const lens = lensOf(x.prompt);
      if (x.autoplay) {
        if (x.t >= DWELL[x.tab]) {
          advanceRef.current();
          return;
        }
      } else if (x.oneShot) {
        const end = endOf(x.tab, lens);
        if (x.t >= end) {
          x.t = end;
          x.oneShot = false;
          apply(frameAt(x.tab, end, lens));
          setRail();
          return;
        }
      } else {
        return;
      }
      apply(frameAt(x.tab, x.t, lens));
      setRail();
      x.raf = requestAnimationFrame(tick);
    },
    [apply, lensOf, setRail],
  );

  const sync = useCallback(() => {
    const x = ctl.current;
    const run =
      x.started &&
      !x.reduced &&
      !x.paused &&
      !x.hidden &&
      !x.seeking &&
      !x.pending &&
      x.inView &&
      (x.oneShot || (x.autoplay && !x.hover && !x.focusHold));
    if (run && !x.raf) {
      x.last = performance.now();
      x.raf = requestAnimationFrame(tick);
    } else if (!run && x.raf) {
      stop();
    }
  }, [stop, tick]);

  const go = useCallback((prompt: number, tab: DemoTab) => {
    ctl.current.pending = true;
    nonce.current += 1;
    setView({ prompt, tab, n: nonce.current });
  }, []);

  advanceRef.current = () => {
    const x = ctl.current;
    let { prompt, tab } = x;
    if (tab === 3) {
      tab = 0;
      prompt = (prompt + 1) % model.prompts.length;
    } else {
      tab = (tab + 1) as DemoTab;
    }
    x.t = 0;
    x.armed = true;
    go(prompt, tab);
  };

  /** Enter the view (after React committed data-prompt / data-tab): before paint. */
  useIsoLayoutEffect(() => {
    const x = ctl.current;
    const card = cardRef.current;
    if (!card || view.n === 0) return;
    x.pending = false;
    const prev = x.prevTab;
    const promptChanged = x.prompt !== view.prompt;
    x.prompt = view.prompt;
    x.tab = view.tab;
    x.prevTab = view.tab;
    if (prev !== view.tab) finalize(prev);
    x.sig = "";
    card.setAttribute("data-snap", "");
    setArmedAttr(x.armed);
    apply(frameAt(view.tab, x.t, lensOf(view.prompt)), true);
    void card.offsetHeight; // commit the snapped state before transitions come back
    card.removeAttribute("data-snap");
    setRail();
    // keep the active prompt card in view inside its own strip (never scrolls the page),
    // only when the prompt changed (a peeking visitor's strip is left alone on tab changes)
    const strip = stripRef.current;
    if (promptChanged && strip && strip.scrollWidth > strip.clientWidth + 2) {
      const btn = strip.children[view.prompt] as HTMLElement | undefined;
      if (btn) {
        const pad = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
        strip.scrollTo({ left: btn.offsetLeft - pad, behavior: x.reduced ? "auto" : "smooth" });
      }
    }
    sync();
    // runs once per committed switch; every callback it uses is stable over refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  /* ── user actions ────────────────────────────────────────────────────────── */

  const userGo = useCallback(
    (prompt: number, tab: DemoTab) => {
      const x = ctl.current;
      stop();
      x.autoplay = false;
      x.started = true;
      x.seeking = false;
      if (x.reduced || x.paused) {
        x.oneShot = false;
        x.armed = false;
        x.t = endOf(tab, lensOf(prompt));
      } else {
        x.oneShot = true;
        x.armed = true;
        x.t = 0;
      }
      go(prompt, tab);
    },
    [go, lensOf, stop],
  );

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const x = ctl.current;
    const step: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let to: number | null = null;
    if (e.key in step) to = (x.tab + step[e.key] + 4) % 4;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = 3;
    if (to === null) return;
    e.preventDefault();
    userGo(x.prompt, to as DemoTab);
    tabRefs.current[to]?.focus();
  };

  const onPause = () => {
    const x = ctl.current;
    x.paused = !x.paused;
    setPaused(x.paused);
    sync();
  };

  const onReplay = () => {
    const x = ctl.current;
    stop();
    x.paused = false;
    setPaused(false);
    x.autoplay = true;
    x.oneShot = false;
    x.started = true;
    x.seeking = false;
    x.t = 0;
    x.armed = true;
    go(x.prompt, 0);
  };

  /* ── mount: media queries, observers, holds, QA hooks ────────────────────── */

  useEffect(() => {
    const x = ctl.current;
    const card = cardRef.current;
    const stage = stageRef.current;
    if (!card || !stage) return;
    card.setAttribute("data-ready", "");

    const still = /[?&]still\b/.test(window.location.search);
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqStrip = window.matchMedia("(max-width: 1180px)");

    const setReduced = () => {
      const reduced = still || mqReduce.matches;
      if (reduced === x.reduced && x.started) return;
      x.reduced = reduced;
      card.toggleAttribute("data-reduced", reduced);
      stop();
      if (reduced) {
        x.autoplay = false;
        x.oneShot = false;
        x.armed = false;
        x.started = true;
        x.t = endOf(x.tab, lensOf(x.prompt));
        setArmedAttr(false);
        finalize(x.tab);
        cursorRef.current?.classList.remove("is-on", "is-click");
        setRail();
      } else if (x.started) {
        // motion allowed again: hold the current final frame, then carry on
        x.autoplay = true;
        x.t = endOf(x.tab, lensOf(x.prompt));
        setRail();
        sync();
      }
    };
    setReduced();
    const onReduce = () => setReduced();
    mqReduce.addEventListener("change", onReduce);

    setHoriz(mqStrip.matches);
    const onStrip = () => setHoriz(mqStrip.matches);
    mqStrip.addEventListener("change", onStrip);

    // Rule 4.8.2 — arm only while the card is still below the viewport.
    const approach = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (x.started) {
          approach.disconnect();
          return;
        }
        if (!e.isIntersecting) return;
        const r = e.boundingClientRect;
        const visibleNow = r.top < window.innerHeight && r.bottom > 0;
        x.started = true;
        approach.disconnect();
        if (visibleNow) {
          x.armed = false;
          x.t = endOf(0, lensOf(x.prompt)); // hold the SSR final frame for the rest of the dwell
          setRail();
        } else {
          x.armed = true;
          x.t = 0;
          card.setAttribute("data-snap", "");
          setArmedAttr(true);
          apply(frameAt(x.tab, 0, lensOf(x.prompt)), true);
          void card.offsetHeight;
          card.removeAttribute("data-snap");
          setRail();
        }
        sync();
      },
      { rootMargin: "0px 0px 240px 0px", threshold: 0 },
    );
    if (!x.reduced) approach.observe(card);

    // Rule 4.8.3 — the clock runs while ≥35% of the card (or of the viewport, for a tall card) shows.
    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);
    const vis = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        const h = e.boundingClientRect.height;
        const vh = e.rootBounds?.height ?? window.innerHeight;
        const denom = Math.max(1, Math.min(h, vh));
        x.inView = e.isIntersecting && e.intersectionRect.height / denom >= 0.35;
        sync();
      },
      { threshold: thresholds },
    );
    vis.observe(card);

    const onVis = () => {
      x.hidden = document.hidden;
      sync();
    };
    x.hidden = document.hidden;
    document.addEventListener("visibilitychange", onVis);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.hover = true;
      sync();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.hover = false;
      sync();
    };
    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);

    const holdZones = () => [stripRef.current, card.querySelector<HTMLElement>(".vx-tabs")];
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const inZone = holdZones().some((z) => z?.contains(t));
      let visible = false;
      try {
        visible = t.matches(":focus-visible");
      } catch {
        visible = false;
      }
      x.focusHold = inZone && visible;
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

    // QA hooks (spec §4.8.9): ?vxqa, or any non-production build.
    const qa = /[?&]vxqa\b/.test(window.location.search) || process.env.NODE_ENV !== "production";
    const w = window as unknown as { __vx?: unknown };
    if (qa) {
      w.__vx = {
        /** Freeze on one frame (armed). No clock afterwards. */
        seek(prompt: number, tab: DemoTab, ms: number) {
          stop();
          x.seeking = true;
          x.autoplay = false;
          x.oneShot = false;
          x.started = true;
          x.armed = !x.reduced;
          x.t = x.reduced ? endOf(tab, lensOf(prompt)) : ms;
          flushSync(() => go(prompt, tab));
        },
        /** Show the unarmed final frame (= SSR / reduced motion) of prompt × tab. */
        final(prompt: number, tab: DemoTab) {
          stop();
          x.seeking = true;
          x.autoplay = false;
          x.oneShot = false;
          x.started = true;
          x.armed = false;
          x.t = endOf(tab, lensOf(prompt));
          flushSync(() => go(prompt, tab));
        },
        /** Resume autoplay from the current tab at t = 0. */
        play() {
          x.seeking = false;
          x.autoplay = true;
          x.started = true;
          x.armed = true;
          x.t = 0;
          flushSync(() => go(x.prompt, x.tab));
        },
        state() {
          return {
            prompt: x.prompt,
            tab: x.tab,
            t: Math.round(x.t),
            armed: x.armed,
            autoplay: x.autoplay,
            oneShot: x.oneShot,
            paused: x.paused,
            reduced: x.reduced,
            started: x.started,
            inView: x.inView,
            hover: x.hover,
            focusHold: x.focusHold,
            running: x.raf !== 0,
            frames: x.frames,
          };
        },
      };
    }

    return () => {
      stop();
      approach.disconnect();
      vis.disconnect();
      ro.disconnect();
      mqReduce.removeEventListener("change", onReduce);
      mqStrip.removeEventListener("change", onStrip);
      document.removeEventListener("visibilitychange", onVis);
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
      if (qa) delete w.__vx;
    };
    // mount-only: every dependency is a stable callback over refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── markup ──────────────────────────────────────────────────────────────── */

  const { prompt, tab } = view;
  const L = model.labels;
  return (
    <div className="vx-demo__card" data-prompt={prompt} data-tab={tab} ref={cardRef}>
      <p id="vx-prompts-label" className="vx-demo__label">
        {L.prompts}
      </p>
      <div className="vx-prompts" role="group" aria-labelledby="vx-prompts-label" ref={stripRef}>
        {model.prompts.map((p, i) => (
          <button
            key={i}
            type="button"
            className="vx-prompt"
            aria-pressed={i === prompt}
            data-i={i}
            onClick={() => userGo(i, ctl.current.tab)}
          >
            <span className="vx-badge" data-tone={p.kind}>
              {p.badge}
            </span>{" "}
            <span className="vx-prompt__text">{p.text}</span>
          </button>
        ))}
      </div>

      <div className="vx-demo__body">
        <div
          className="vx-tabs"
          role="tablist"
          aria-label={L.tablist}
          aria-orientation={horiz ? "horizontal" : "vertical"}
          onKeyDown={onTabKey}
        >
          {model.tabs.map((t, i) => (
            <button
              key={t.num}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`vx-tab-${i}`}
              className="vx-tab"
              aria-controls="vx-panel"
              aria-selected={i === tab}
              tabIndex={i === tab ? 0 : -1}
              onClick={() => userGo(ctl.current.prompt, TABS[i])}
            >
              <span className="vx-tab__rail" aria-hidden="true">
                <i
                  ref={(el) => {
                    railRefs.current[i] = el;
                  }}
                />
              </span>
              <span className="vx-tab__label">
                <span className="vx-tab__num">{t.num}</span> {t.label}
              </span>{" "}
              <span className="vx-tab__title">{t.title}</span>{" "}
              <span className="vx-tab__body">{t.body}</span>
            </button>
          ))}
        </div>

        <div className="vx-tabtext" aria-hidden="true">
          {model.tabs.map((t, i) => (
            <div key={t.num} data-t={i}>
              <p className="vx-tabtext__title">{t.title}</p>
              <p className="vx-tabtext__body">{t.body}</p>
            </div>
          ))}
        </div>

        <div
          className="vx-stage"
          id="vx-panel"
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={`vx-tab-${tab}`}
          ref={stageRef}
        >
          <div className="vx-win vx-app" data-win="app" role="img" aria-label={model.aria[prompt][Math.min(tab, 2)]}>
            {app}
          </div>
          <div className="vx-win vx-slack" data-win="slack" data-pane="3" role="img" aria-label={model.aria[prompt][3]}>
            {slack}
          </div>
          <span className="vx-cursor" aria-hidden="true" ref={cursorRef}>
            <svg width="18" height="22" viewBox="0 0 18 22" focusable="false">
              <path
                d="M1.5 1.5v16.2l4.3-4.1 2.9 6.6 3-1.3-2.9-6.5h6z"
                fill="currentColor"
                stroke="var(--lp-surface)"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="vx-demo__foot">
        <p className="vx-note">{L.note}</p>
        <div className="vx-ctrl">
          <button
            type="button"
            className="vx-ctrl__btn"
            aria-pressed={paused}
            aria-label={L.pause}
            data-ico={paused ? "play" : "pause"}
            onClick={onPause}
          />
          <button type="button" className="vx-ctrl__btn" aria-label={L.replay} data-ico="replay" onClick={onReplay} />
        </div>
      </div>
    </div>
  );
}
