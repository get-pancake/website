"use client";

// VxDemoPlayer — the ONLY client island of a /for page (spec §4.2, §4.8).
//
// Renders the demo shell (the horizontal tab bar, the stage, then the foot: the active step's
// caption + Pause / Replay, the honesty note under them) and receives the four product surfaces as SERVER-rendered children
// (`app`, `slack`), so the island's props are only this vertical's PlayerModel (≈2 KB) and the
// pane markup costs no JS.
//
// The example prompts are NOT in the island: they are the hero's server-rendered rows
// (`a[data-vx-prompt]`, VxHero), real links to #vx-demo. On mount the island takes their
// clicks over (select the prompt, scroll the demo in, play it from the Brief tab) and keeps
// their `data-active` / `aria-current` on the prompt the demo shows — attributes React never
// renders after the server pass, so nothing fights over them.
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
//
// Holds (critics 2026-09-22): the demo never parks on an EMPTY frame.
//   · hover = a real mouse move over the app window (the stage), not a pointer the page
//     scrolled under it (Chrome fires movement-less pointer events on scroll), and not the
//     tab bar / foot: the controls must not pause what they control;
//   · a click (prompt row, Replay, Play) clears the hover: the visitor asked to watch;
//   · a tab that ends under a hover / keyboard hold keeps its FINAL frame (the next tab's
//     first frame is empty until its cues arrive);
//   · the first start waits until the Brief's composer is on screen, so the prompt is typed
//     where the visitor can see it.
// Rail: the active tab's underline is full unless the clock has run on this view; then it
// shows the dwell's progress (paused progress stays) on a faint full-width track.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import type { PlayerModel } from "@/lib/verticals/demo-model";
import { CURSOR_ENTRY, DWELL, endOf, frameAt, type DemoFrame, type DemoTab } from "@/lib/verticals/demo-timeline";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface PaneCache {
  el: HTMLElement;
  cues: HTMLElement[];
  /** Reverse cues: shown while armed until their cue id is reached (`[data-uncue]` → `.is-off`). */
  uncues: HTMLElement[];
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
  /** The first start waits for the Brief composer to be on screen (any click opens it). */
  gate: boolean;
  /** The clock has run on the current view (the rail shows progress, not the full bar). */
  ran: boolean;
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

  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
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
    gate: true,
    ran: false,
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
      uncues: q("[data-uncue]"),
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
      // full bar (the CSS default) until the clock has run on this view: at load, on a held
      // final frame, under reduced motion
      if (i !== x.tab || x.reduced || !x.started || !x.ran) {
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
        for (const e of p.uncues) e.classList.toggle("is-off", on.has(e.dataset.uncue ?? ""));
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
        if (typed && typed.textContent !== txt) {
          typed.textContent = txt;
          // input-like: once the text outgrows the field, keep its end in view. A transform, not
          // layout (a right-anchored line would move its start on every keystroke: layout shifts)
          const line = typed.parentElement;
          const field = line?.parentElement;
          if (line && field) {
            const over = line.offsetWidth - field.clientWidth;
            line.style.transform = over > 0 ? `translateX(${-over}px)` : "";
          }
        }
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
          const from = a ? { x: a.x + c.fromD[0], y: a.y + c.fromD[1] } : entry;
          const to = b ? { x: b.x + c.toD[0], y: b.y + c.toD[1] } : from;
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
      for (const e of p.uncues) e.classList.add("is-off");
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
      typed?.parentElement?.style.removeProperty("transform");
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
      x.ran = true;
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

  /** Whether the clock should tick now (pending excluded: the view commit asks before clearing it). */
  const willRun = useCallback(() => {
    const x = ctl.current;
    return (
      x.started &&
      !x.reduced &&
      !x.paused &&
      !x.hidden &&
      !x.seeking &&
      !x.gate &&
      x.inView &&
      (x.oneShot || (x.autoplay && !x.hover && !x.focusHold))
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
  }, [stop, tick, willRun]);

  const go = useCallback((prompt: number, tab: DemoTab) => {
    ctl.current.pending = true;
    nonce.current += 1;
    setView({ prompt, tab, n: nonce.current });
  }, []);

  advanceRef.current = () => {
    const x = ctl.current;
    // a hero-row start plays its Brief tab even under the pointer (oneShot); from the next
    // tab on, autoplay's normal holds (hover, keyboard focus) apply again
    x.oneShot = false;
    if (x.hover || x.focusHold) {
      // held: keep this tab's final frame (t stays at the dwell's end, so the demo moves on as
      // soon as the hold ends) instead of cutting to the next tab's empty first frame
      x.t = DWELL[x.tab];
      setRail();
      sync();
      return;
    }
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
    // A prompt change (the autoplay wrap from Slack to the next prompt's Brief, or a prompt
    // click) swaps windows / pages with NO crossfade: data-prompt already points at the next
    // prompt, so an outgoing window fading out would show the next prompt's names.
    // Set before anything reads layout, so the first style pass sees it.
    if (promptChanged) card.setAttribute("data-cut", "");
    if (prev !== view.tab) finalize(prev);
    x.sig = "";
    // a view the clock will play shows its progress from its first frame (no one-frame full bar)
    x.ran = x.armed && willRun();
    card.setAttribute("data-snap", "");
    setArmedAttr(x.armed);
    apply(frameAt(view.tab, x.t, lensOf(view.prompt)), true);
    void card.offsetHeight; // commit the snapped state before transitions come back
    card.removeAttribute("data-snap");
    card.removeAttribute("data-cut");
    setRail();
    if (promptChanged) markRows(view.prompt);
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
      x.gate = false;
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

  /** The hero's prompt rows mirror the prompt the demo shows (server HTML: prompt 0). */
  const markRows = useCallback((prompt: number) => {
    document.querySelectorAll<HTMLElement>("[data-vx-prompt]").forEach((row) => {
      const on = row.dataset.vxPrompt === String(prompt);
      row.toggleAttribute("data-active", on);
      if (on) row.setAttribute("aria-current", "true");
      else row.removeAttribute("aria-current");
    });
  }, []);

  /** A hero prompt row: that prompt, from the Brief tab's first frame. The Brief tab plays even
   *  under the pointer (oneShot), then autoplay carries on through Leads, Outreach and Slack.
   *  Reduced motion (or ?still): the Brief tab's final frame. An explicit play unpauses. */
  const playPrompt = useCallback(
    (prompt: number) => {
      const x = ctl.current;
      stop();
      x.started = true;
      x.seeking = false;
      x.gate = false;
      x.hover = false; // a click means "show me": a pointer resting on the window must not hold it
      if (x.paused) {
        x.paused = false;
        setPaused(false);
      }
      if (x.reduced) {
        x.autoplay = false;
        x.oneShot = false;
        x.armed = false;
        x.t = endOf(0, lensOf(prompt));
      } else {
        x.autoplay = true;
        x.oneShot = true;
        x.armed = true;
        x.t = 0;
      }
      go(prompt, 0);
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
    if (!x.paused) {
      // Play: the visitor asked to watch — no hover hold, no first-start gate
      x.hover = false;
      x.gate = false;
    }
    setPaused(x.paused);
    setRail();
    sync();
  };

  const onReplay = () => {
    const x = ctl.current;
    stop();
    x.paused = false;
    setPaused(false);
    x.autoplay = true;
    x.oneShot = true; // the Brief replays even under the pointer, then autoplay carries on
    x.hover = false;
    x.gate = false;
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

    // the hero's prompt rows (server-rendered links to #vx-demo): play the prompt, bring the
    // demo in. Modified clicks keep the link's own behaviour. A keyboard activation (detail 0)
    // moves focus to the stage, so the next Tab continues inside the demo instead of back in
    // the hero.
    // The scroll CENTRES the band in the viewport under the sticky phone nav (64 once
    // compacted; the desktop nav scrolls away): on a 900-tall desktop the band lands ~110 below
    // the top instead of pinning its hairline to the edge over a strip of the next section; a
    // band taller than the viewport (phones) starts right under the nav.
    const section = card.closest<HTMLElement>("section") ?? card;
    const mqPhone = window.matchMedia("(max-width: 767px)");
    const onRow = (e: MouseEvent) => {
      const row = (e.target as Element | null)?.closest?.<HTMLElement>("[data-vx-prompt]");
      if (!row || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const i = Number(row.dataset.vxPrompt);
      if (!(i >= 0 && i < model.prompts.length)) return;
      e.preventDefault();
      playPrompt(i);
      const r = section.getBoundingClientRect();
      const nav = mqPhone.matches ? 64 : 0;
      const top = window.scrollY + r.top - nav - Math.max(0, (window.innerHeight - nav - r.height) / 2);
      window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: x.reduced ? "auto" : "smooth" });
      if (e.detail === 0) stage.focus({ preventScroll: true });
    };
    document.addEventListener("click", onRow);

    // Rule 4.8.2 — arm (play the Brief from its first frame) unless a real part of the app
    // window already shows. The WINDOW, not the card: the tab bar sits right under the hero (in
    // view at load on most screens) and never changes when armed. A strip of up to 160px (the
    // app bar and the page title: 1440×900 shows ~60, a 768 tablet ~70) still arms; more than
    // that holds the SSR final frame for the rest of the dwell (nothing already seen empties).
    const ARM_STRIP = 160;
    const approach = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (x.started) {
          approach.disconnect();
          return;
        }
        if (!e.isIntersecting) return;
        const r = e.boundingClientRect;
        const visibleNow = r.top < window.innerHeight - ARM_STRIP && r.bottom > 0;
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
    if (!x.reduced) approach.observe(stage);

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

    // The FIRST start also waits for the Brief's composer (where the prompt is typed) to be on
    // screen: at 390 the 35% rule alone started the typing 330px below the fold. Any click on
    // a prompt row, a tab, Play or Replay opens the gate at once.
    const composer = card.querySelector<HTMLElement>('[data-pane="0"] .vx-composer');
    const gateObs = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1];
        if (!x.gate) {
          gateObs.disconnect();
          return;
        }
        if (e.isIntersecting && e.intersectionRatio >= 0.9) {
          x.gate = false;
          gateObs.disconnect();
          sync();
        }
      },
      { threshold: [0, 0.5, 0.9, 1] },
    );
    if (composer) gateObs.observe(composer);
    else x.gate = false;

    const onVis = () => {
      x.hidden = document.hidden;
      sync();
    };
    x.hidden = document.hidden;
    document.addEventListener("visibilitychange", onVis);

    // hover = the mouse MOVING over the app window. Scrolling the page under a resting pointer
    // fires pointerover / pointermove at the same client position (zero movement): not a hover.
    // movementX/Y alone is not enough (WebKit may report 0 for real moves), so a move also
    // counts when the client position differs from the last one seen anywhere on the page.
    let lastX = NaN;
    let lastY = NaN;
    const onAnyMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || x.hover) return;
      const moved = e.movementX !== 0 || e.movementY !== 0 || (!Number.isNaN(lastX) && (e.clientX !== lastX || e.clientY !== lastY));
      if (!moved) return;
      x.hover = true;
      sync();
    };
    // bubble phase: runs after the stage's own listener, so onMove compares with the previous position
    window.addEventListener("pointermove", onAnyMove, { passive: true });
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !x.hover) return;
      x.hover = false;
      sync();
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);

    const holdZones = () => [card.querySelector<HTMLElement>(".vx-tabs")];
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
        /** What a hero prompt row does (without the scroll): prompt i from the Brief tab. */
        pick(prompt: number) {
          flushSync(() => playPrompt(prompt));
        },
        /** Resume autoplay from the current tab at t = 0. */
        play() {
          x.seeking = false;
          x.gate = false;
          x.hover = false;
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
            gate: x.gate,
            ran: x.ran,
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
      gateObs.disconnect();
      ro.disconnect();
      mqReduce.removeEventListener("change", onReduce);
      document.removeEventListener("click", onRow);
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointermove", onAnyMove);
      stage.removeEventListener("pointerleave", onLeave);
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
      {/* Origami's bar: four equal tabs, the active one underlined in ink (the underline shows
          the step's progress once the clock has run on it); no rule under the others */}
      <div className="vx-tabs" role="tablist" aria-label={L.tablist} aria-orientation="horizontal" onKeyDown={onTabKey}>
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
            aria-describedby={`vx-tab-${i}-d`}
            aria-selected={i === tab}
            tabIndex={i === tab ? 0 : -1}
            onClick={() => userGo(ctl.current.prompt, TABS[i])}
          >
            <span className="vx-tab__label">
              <span className="vx-tab__num">{t.num}</span> {t.label}
            </span>
            <span className="vx-tab__rail" aria-hidden="true">
              <i
                ref={(el) => {
                  railRefs.current[i] = el;
                }}
              />
            </span>
          </button>
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

      {/* the foot, under the window (so the window starts right under the tab bar): the active
          step's caption, Pause / Replay on the right, the honesty note under the caption */}
      <div className="vx-demo__foot">
        {/* the active step in one line (phones: two or three): all four stacked in one cell, the
            inactive ones visibility: hidden, so the caption never changes height. Each is its
            tab's description (referenced hidden text still counts). */}
        <div className="vx-tabtext">
          {model.tabs.map((t, i) => (
            <p key={t.num} id={`vx-tab-${i}-d`} data-t={i} aria-hidden={i === tab ? undefined : true}>
              <b className="vx-tabtext__title">{t.title}</b> <span className="vx-tabtext__body">{t.body}</span>
            </p>
          ))}
        </div>
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
        <p className="vx-note">{L.note}</p>
      </div>
    </div>
  );
}
