"use client";

import type { gsap } from "@/lib/gsap";

import { DIVE_LOADERS } from "./lp-dive-loaders";
import type { DiveItemId } from "./lp-dive-stages";
import {
  AWAY_VIEWPORTS,
  CUE_MARGIN,
  DWELL_MIN_RATIO,
  DWELL_MS,
  FAST_SCROLL,
  FOCUS_MARGIN,
  PREPARE_MARGIN,
  enqueueBuild,
  holdRendered,
  mountPlayOnce,
  onEveryScroll,
  scrollSpeed,
  startBuild,
  trackScroll,
  warmSkippedSections,
  whenInput,
  type BuildRun,
  type PlayOnceRuntime,
} from "./lp-play-once";

/**
 * The deep-dive carousel's driver (V2 Figma 4939:3388, red note 4964:1644: "a clickable but
 * autoplaying vertical carousel"). Owner: blue-band package. LpDive renders every tab and every
 * panel on the server (item 1 active, each stage showing its END picture — the story's rest
 * markup); LpDiveCarousel mounts this on the row. It owns, from then on, the DOM state the
 * server rendered: aria-selected / tabindex on the tabs, data-state on the panels, the folds,
 * the progress bar, the pause control. React never re-renders that subtree.
 *
 * Playback, item by item: the active story plays its timeline from its cue to its end, holds the
 * end picture 2.0 s, then the next item takes over (4 → 1). One master GSAP timeline per turn
 * scrubs the story's timeline AND the progress bar (linear over (duration − cue) + hold — critic
 * C10), so pausing stops both together and the bar always tells the truth.
 *
 * - First start = lp-play-once's contract (its constants and helpers, exported for this):
 *   prepare ahead of time (fetch GSAP + the four builders from the visitor's first input, or a
 *   viewport ahead; build the four in idle time, one per slot, item 1 first, the section
 *   rendered ahead in a slot of its own while it still skips its rendering: lp-play-once's
 *   queue, 2026-10-13; item 1 at once when the stage is on screen or within the cue margin),
 *   switch item 1 unseen to its cue as the stage comes within 15 % below the fold,
 *   play once the stage's top crosses 60 % of the viewport (or after a 1 s dwell with half of it
 *   on screen); flying past keeps the picture. Already on screen in its picture when the code
 *   arrives (reload mid-page, an anchor): never rewound — its bar runs over the hold, then item 2.
 * - Runs only while ≥ 50 % of the stage is on screen (decision 2026-10-09 §5), the tab is
 *   visible, and the visitor has not pressed Pause; otherwise everything pauses where it is and
 *   resumes from there (never restarted, never rewound on screen).
 * - A click / arrow key selects an item at once: the outgoing panel keeps its frame and fades
 *   out (0.32 s), the incoming one is set to its cue while still hidden, fades in and plays; the
 *   bodies fold (CSS grid rows, 0.4 s) and the titles change weight (CSS). Autoplay continues.
 * - Keyboard focus (focus-visible) on a tab, on the selected item's link or on the stage holds
 *   the ADVANCE, not the story: the selected item plays to its end picture and waits there
 *   until focus leaves the row or goes to Pause. Until 2026-10-13 only the tab list held it:
 *   Tab from the fourth item to its "See how" link advanced the carousel, which hid the link
 *   under the focus and dropped it to <body> (the bug check's M14). A hovering mouse holds
 *   nothing — founder 2026-09-22 on the demo ("read as blocked while people looked at it").
 * - Pause (WCAG 2.2.2): a toggle every input can reach, under the card's bottom-right corner —
 *   shown on keyboard focus, while it holds the carousel, while a pointer is over the stage,
 *   and always on touch screens (dive.css; it is the only thing a mouse or a finger can stop
 *   the carousel with).
 * - Reduced motion: no GSAP fetched, no autoplay; tabs swap the panels' end pictures instantly
 *   and the bar rests at the Figma pose. Lifting it mid-visit starts the hold-then-advance run.
 * - Layout: the scene box is the desktop 752×489 design box, or the phone 400×520 box ≤599
 *   (decision §5), scaled as pixels (--lp-fit = stage width / box width; never zoom). Crossing
 *   599 rebuilds the stories: no current builder reads the layout (2026-10-28), the rebuild is
 *   kept for a future phone composition.
 *
 * Phones (≤767) with the stack switch on (the section's data-lp-phone="stack", lp-dive-data.ts
 * DIVE_PHONE_LAYOUT; mobile artboard 5024:8914, decision 2026-10-11 §9 F3): no carousel. `mountDive`
 * — what LpDiveCarousel mounts — runs `mountDiveStack` there instead: dive.css lays the same
 * markup out as four stacked items, each over its own stage card (the desktop scene, scaled),
 * and every stage is an independent lp-play-once card (prepared a viewport ahead, cued below
 * the fold, played once at the focus line, resting on its end picture, never rewound on
 * screen; reduced motion fetches nothing). The tab semantics are dropped while it lasts: four
 * headings with their copy and pictures. Crossing 767 disposes one driver and mounts the other
 * (each restores the server state on its way out).
 *
 * Freeze: GSAP only, self-gated (it pauses off screen), so not an LpAnimFreeze member.
 * QA: window.__lpDive = { mode, timelines, select(i), pause(), play(), pose(i, p, at), state() };
 * every built story timeline is also window.__lpStory.<id> (lp-play-once's registry key).
 * `pose(0)` is the V2 artboard's pose: item 1 with its bar at p = .509596, its story on its end
 * picture (no story has an artboard frame since 2026-10-28: ARTBOARD_AT is empty); `at` =
 * seconds, a timeline label, or "end".
 */

type Timeline = gsap.core.Timeline;
type Tween = gsap.core.Tween;
type Ctx = gsap.Context;
type Gsap = PlayOnceRuntime["gsap"];

/* The stories' loaders live in lp-dive-loaders.ts (client only). Never import the registry
   (lp-dive-stages.ts) at runtime here: it would pull the four server Stage components and their
   data into this client chunk. */
const LOADERS = DIVE_LOADERS;

/** the scene design boxes (= DIVE_STAGE_BOX in lp-dive-stages.ts) */
const BOX_WIDTH = { desktop: 752, phone: 400 } as const;
type Layout = keyof typeof BOX_WIDTH;
/* The phone box from 599 down (dive.css): wider, the 400 box would be blown up past ×1.4 (×1.84
   at 767) while the 752 box still reads at ×0.76 — the two cross at ~580. No current story
   reads the box: data-lp-layout is kept for a future phone composition, and the kit's phone
   rules (names hidden, no multiply) switch on the viewport at 767 (story-kit.css). */
const PHONE_MQ = "(max-width: 599px)";
/** the bar's drawn length in Figma (4939:3439 …: 138.61 of 272), its rest pose */
export const DIVE_REST_P = 0.509596;
/** the cross-fade between two stages and the outgoing bar's fade (s) */
const FADE_S = 0.32;
const BAR_OUT_S = 0.15;
/** the stack's widths (dive.css's stack block) */
const STACK_MQ = "(max-width: 767px)";
/** where the tab list is in the page's flow (dive.css: two fluid columns, then stacked) */
const FLOW_MQ = "(max-width: 1340px)";

/* QA: where the V2 artboard freezes a story when that is not its end picture. Until 2026-10-28
   item 1 (the Sources story) was drawn mid-play, on its frame 3 "Lead details open" (5024:8462).
   The four stories of 2026-10-28 have no designer frame: each poses on its end picture. A
   timeline label of an entry's name wins over its seconds. */
const ARTBOARD_AT: Partial<Record<DiveItemId, { label: string; s: number }>> = {};
/** QA: freeze a story at `at` — seconds, a label, "end"; nothing = its artboard frame (or its end) */
function seekStory(tl: Timeline, id: DiveItemId, at?: number | string) {
  const end = tl.duration();
  let t = end;
  if (typeof at === "number") t = at;
  else if (typeof at === "string") t = at === "end" ? end : (tl.labels[at] ?? end);
  else {
    const frame = ARTBOARD_AT[id];
    if (frame) t = tl.labels[frame.label] ?? frame.s;
  }
  tl.pause(Math.min(Math.max(t, 0), end), true);
}

type Item = {
  id: DiveItemId;
  tab: HTMLElement;
  fold: HTMLElement | null;
  bar: HTMLElement;
  panel: HTMLElement;
  scene: HTMLElement;
  more: HTMLElement | null;
  hold: number;
  runtime?: PlayOnceRuntime;
  /** its build, while it is under way (lp-play-once's startBuild) */
  run?: BuildRun;
  ctx?: Ctx;
  tl?: Timeline;
  cue: number;
  cleanup?: () => void;
  failed: boolean;
  queued: boolean;
};

export type DiveCarouselOptions = {
  /** s an item without a playable timeline keeps its picture before advancing */
  fallback: number;
};

type QaWindow = Window & {
  __lpDive?: Record<string, unknown>;
  __lpStory?: Record<string, Timeline>;
};

export function mountDiveCarousel(row: HTMLElement, o: DiveCarouselOptions): () => void {
  const section = row.closest<HTMLElement>("section") ?? row;
  const tablist = row.querySelector<HTMLElement>('[role="tablist"]');
  const stage = row.querySelector<HTMLElement>(".lp-dive-stage");
  const pauseBtn = row.querySelector<HTMLButtonElement>(".lp-dive-ctrl__btn");
  if (!tablist || !stage) return () => {};

  const items: Item[] = Array.from(tablist.querySelectorAll<HTMLElement>('[role="tab"]')).flatMap((tab) => {
    const id = tab.dataset.id as DiveItemId | undefined;
    const panel = id ? row.querySelector<HTMLElement>(`#lp-dive-panel-${id}`) : null;
    const scene = panel?.querySelector<HTMLElement>(".lp-dive-scene");
    const bar = tab.querySelector<HTMLElement>(".lp-dive-tab__bar");
    if (!id || !(id in LOADERS) || !panel || !scene || !bar) return [];
    return [
      {
        id,
        tab,
        fold: tab.querySelector<HTMLElement>(".lp-dive-tab__fold"),
        bar,
        panel,
        scene,
        more: row.querySelector<HTMLElement>(`.lp-dive-more[data-for="${id}"]`),
        hold: Number(tab.dataset.hold) || 2,
        cue: 0,
        failed: false,
        queued: false,
      },
    ];
  });
  if (!items.length) return () => {};
  const n = items.length;

  const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
  const phoneMq = matchMedia(PHONE_MQ);
  const untrack = trackScroll();
  const unwarm = warmSkippedSections();

  let active = Math.max(0, items.findIndex((it) => it.tab.getAttribute("aria-selected") === "true"));
  let layout: Layout = phoneMq.matches ? "phone" : "desktop";
  let disposed = false;
  let g: Gsap | undefined; // GSAP, once the first story chunk arrived
  let loading = false;
  let master: Timeline | null = null;
  let fades: Tween[] = [];
  /** the carousel has started: its first play, or a visitor's pick */
  let engaged = false;
  /** before engaging, item 1: its server picture (rest) or its cue, set unseen (cued) */
  let phase: "rest" | "cued" = "rest";
  let pendingAdvance = false;
  let held = false; // keyboard focus on a tab, the link or the stage: no advance
  let userPaused = false;
  let posed = false; // QA freeze (pose): nothing starts until select/play
  let docHidden = document.hidden;
  let near = false; // stage on screen or within 15 % below the fold
  let visible = false;
  let focused = false; // stage top above 60 % of the viewport height
  let ratio = 0;
  let dwell = 0;

  const isReduced = () => motionMq.matches;
  const dev = process.env.NODE_ENV !== "production";

  /* ── layout + fit ── */
  const applyLayout = () => {
    for (const it of items) it.scene.dataset.lpLayout = layout;
  };
  applyLayout();
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.contentBoxSize?.[0];
      const width = box ? box.inlineSize : entry.contentRect.width;
      if (!(width > 0)) continue;
      stage.style.setProperty("--lp-fit", String(width / BOX_WIDTH[layout]));
      stage.dataset.lpFit = "";
    }
    stageAt = null;
  });
  ro.observe(stage);

  /* ── no layout shift: on the in-flow layouts (≤1340: two fluid columns, or stacked) the
     list's height is part of the page, and items open bodies of 1–4 lines (+ item 4's link).
     Reserve the tallest open item, so an advance never moves what is below the carousel. ── */
  const list = row.querySelector<HTMLElement>(".lp-dive-list");
  let listWidth = 0;
  const reserveListHeight = () => {
    if (!list) return;
    if (getComputedStyle(list).position !== "static") {
      list.style.removeProperty("min-height"); // ≥1341: absolute in the fixed 489 row
      return;
    }
    // each tab closed (title + its two paddings), whatever its animation state: without its
    // fold, and with the bottom padding a selected item with a link hands over to the link's
    // row (dive.css; the paddings are symmetric, so the top one is the one at rest)
    let base = 0;
    let open = 0;
    for (const it of items) {
      const fold = it.fold?.getBoundingClientRect().height ?? 0;
      const cs = getComputedStyle(it.tab);
      const pad = parseFloat(cs.paddingTop) || 0;
      base += it.tab.getBoundingClientRect().height - fold - (parseFloat(cs.paddingBottom) || 0) + pad;
      const body = it.fold?.querySelector<HTMLElement>(".lp-dive-tab__body")?.getBoundingClientRect().height ?? 0;
      // the link's row ends with the padding its tab gave up: it adds its height minus that
      const more = it.more?.querySelector<HTMLElement>(".lp-dive-more__inner")?.getBoundingClientRect().height ?? 0;
      open = Math.max(open, body + (more ? more - pad : 0));
    }
    list.style.minHeight = `${Math.ceil(base + open)}px`;
  };
  const listRo = new ResizeObserver((entries) => {
    const width = entries[entries.length - 1].contentRect.width;
    if (width === listWidth) return; // folds animating: only a width change rewraps
    listWidth = width;
    reserveListHeight();
  });
  if (list) listRo.observe(list);
  /* 1340 ↔ 1341 the list keeps its 272 px and only changes mode (absolute in the fixed row ↔
     in flow, dive.css): the width guard above sees nothing, so a live resize across it left the
     in-flow list unreserved (the page under the carousel jumped at item 4) or a stale
     min-height on the absolute one. */
  const flowMq = matchMedia(FLOW_MQ);
  flowMq.addEventListener("change", reserveListHeight);
  void (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(() => {
    if (!disposed) reserveListHeight();
  });

  /* ── QA registry ── */
  const w = window as QaWindow;
  const registerStory = (it: Item) => {
    if (it.tl) w.__lpStory = { ...w.__lpStory, [it.id]: it.tl };
  };
  const unregisterStory = (it: Item) => {
    const reg = w.__lpStory;
    if (reg && it.tl && reg[it.id] === it.tl) delete reg[it.id];
  };

  /* ── builds ── */
  // a content-visibility:auto section that skips its subtree gives the stories no geometry
  const laidOut = (it: Item) => {
    const el = it.scene as HTMLElement & {
      checkVisibility?: (opts: { contentVisibilityAuto: boolean }) => boolean;
    };
    if (typeof el.checkVisibility === "function") return el.checkVisibility({ contentVisibilityAuto: true });
    return near || visible;
  };
  const storyRoot = (it: Item) => it.scene.querySelector<HTMLElement>("[data-lp-story]");
  /* A story is built in slices over idle slots (lp-play-once's startBuild: the builder, then the
     timeline taken to its end = the server picture, unseen for idle panels, identical for the
     active one). Under construction it is not that picture, so its build pauses between slices
     only where nobody can see it: in a panel that is not showing, or while the stage is
     AWAY_VIEWPORTS away from the screen (where the stage was when last measured, against the
     scroll position: no layout read). Otherwise it is built in one piece, as it always was. */
  let stageAt: { top: number; bottom: number } | null = null;
  const away = () => {
    if (!stageAt) {
      const r = stage.getBoundingClientRect();
      stageAt = { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
    }
    const vh = window.innerHeight;
    const y = window.scrollY;
    return stageAt.top - y > vh * (1 + AWAY_VIEWPORTS) || stageAt.bottom - y < -vh * AWAY_VIEWPORTS;
  };
  const unseen = (it: Item) => it.panel.dataset.state === "idle" || away();
  /** One slice of an item's build, or all that is left with `through`. "built" once it has its
      timeline, "more" while slices are left, "stop" when it cannot be built now. */
  const advance = (it: Item, through: boolean): "built" | "more" | "stop" => {
    if (it.tl) return "built";
    if (disposed || it.failed || !it.runtime || !laidOut(it)) return "stop";
    const root = storyRoot(it);
    if (!root) {
      it.failed = true;
      return "stop";
    }
    try {
      it.run ??= startBuild(it.runtime, root, true);
      const built = it.run.next(through || !unseen(it));
      if (!built) return "more";
      it.tl = built.tl;
      it.cleanup = built.cleanup;
      it.cue = Math.min(Math.max(built.cue ?? 0, 0), built.tl.duration());
    } catch (err) {
      it.failed = true;
      it.tl = undefined;
      it.run?.ctx.revert(); // a half-run builder leaves the server markup as it was
      it.run?.cleanup();
      it.run = undefined;
      if (dev) console.error(`lp-dive: the ${it.id} story failed to build`, err);
      return "stop";
    }
    it.ctx = it.run.ctx;
    it.run = undefined;
    registerStory(it);
    return "built";
  };
  const build = (it: Item): boolean => advance(it, true) === "built";
  const unbuild = (it: Item) => {
    unregisterStory(it);
    if (it.run) {
      // under way: finished first, the builder's cleanup comes with what it returns
      try {
        it.cleanup = it.run.next(true)?.cleanup;
      } catch {
        // half built: the revert below is all there is
      }
      it.ctx = it.run.ctx;
      it.run = undefined;
    }
    it.ctx?.revert();
    it.cleanup?.();
    it.ctx = undefined;
    it.cleanup = undefined;
    it.tl = undefined;
    it.cue = 0;
  };
  const afterActiveBuild = () => {
    if (engaged && !master && !posed && g && !isReduced()) startTurn("end");
    else decide();
  };
  /* The section skips its rendering while it is far away (content-visibility: auto), so the
     stories cannot be measured: it is rendered ahead of time in an idle slot of its own
     (lp-play-once's holdRendered) and kept rendered until the four are built. Asked once: a
     section that cannot be held (it is not below the screen) renders by itself as it nears. */
  let askedSection = false;
  let releaseSection: (() => void) | null = null;
  const renderSection = () => {
    if (askedSection) return;
    askedSection = true;
    enqueueBuild(() => {
      if (disposed) return;
      releaseSection = holdRendered(section);
      if (releaseSection) requestBuilds();
    }, section);
  };
  const settleSection = () => {
    if (!releaseSection || !items.every((it) => it.tl || it.failed)) return;
    releaseSection();
    releaseSection = null;
  };
  const requestBuilds = () => {
    if (disposed) return;
    const first = items[active];
    if (first.runtime && !first.tl && !first.failed && !laidOut(first)) return renderSection();
    // on screen or within the cue margin: the active story at once; the others, and the active
    // one while the stage is still away, take an idle slot each
    if (!first.tl && (near || visible) && build(first)) afterActiveBuild();
    for (const it of items) {
      if (it.tl || it.failed || it.queued || !it.runtime) continue;
      it.queued = true;
      enqueueBuild(() => {
        // (built at once in the meantime, the stage having come near: nothing left to do)
        const state = it.tl ? "stop" : advance(it, false);
        if (state === "more") return true;
        it.queued = false;
        if (state === "built" && it === items[active]) afterActiveBuild();
        settleSection();
      }, it.panel);
    }
    settleSection();
  };
  // a story under way that a scroll brings near the screen is finished at once (`unseen`)
  const unwatch = onEveryScroll(() => {
    for (const it of items) {
      if (!it.run || unseen(it)) continue;
      if (build(it) && it === items[active]) afterActiveBuild();
      settleSection();
    }
  });
  const loadRuntimes = () => {
    if (loading || disposed || isReduced()) return;
    loading = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts?.ready.catch(() => undefined);
    void Promise.all(
      items.map((it) =>
        LOADERS[it.id]()
          .then((rt) => {
            it.runtime = rt;
          })
          .catch((err) => {
            it.failed = true;
            if (dev) console.error(`lp-dive: the ${it.id} story failed to load`, err);
          }),
      ),
    )
      .then(() => fonts) // measure text on the real faces (the old story-claude spec, §5.3)
      .then(() => {
        if (disposed) return;
        const rt = items.find((it) => it.runtime)?.runtime;
        if (!rt) return;
        g = rt.gsap;
        requestBuilds();
        decide();
      });
  };

  /* ── the bar ── */
  const setBar = (it: Item, p: number | null) => {
    if (p === null) it.bar.style.removeProperty("--lp-dive-p");
    else it.bar.style.setProperty("--lp-dive-p", String(p));
  };
  const barNow = (it: Item) => {
    const v = parseFloat(it.bar.style.getPropertyValue("--lp-dive-p"));
    return Number.isFinite(v) ? v : DIVE_REST_P;
  };

  /* ── a turn: the active item's story + its bar, on one master timeline ── */
  const killMaster = () => {
    master?.kill();
    master = null;
  };
  /** cue: play from the cue · from: carry on from where the (cued) timeline is · end: the item
      shows its end picture and its bar runs over the hold only (never rewound on screen) */
  const startTurn = (mode: "cue" | "from" | "end") => {
    killMaster();
    pendingAdvance = false;
    const G = g;
    if (!G || isReduced()) return;
    const it = items[active];
    const tl = it.tl;
    const playable = !!tl && tl.duration() - it.cue > 0.01;
    let from = 0;
    let buildS = 0;
    let p0: number;
    let barS: number;
    if (tl && playable && mode !== "end") {
      from = mode === "cue" ? it.cue : Math.min(Math.max(tl.time(), it.cue), tl.duration());
      buildS = tl.duration() - from;
      // the bar is linear over (duration − cue) + hold: start it where the timeline already is
      p0 = (from - it.cue) / (tl.duration() - it.cue + it.hold);
      barS = buildS + it.hold;
    } else {
      tl?.progress(1, true);
      p0 = mode === "end" ? barNow(it) : 0;
      barS = playable ? it.hold : o.fallback;
    }
    const m = G.timeline({ paused: true, onComplete: onTurnEnd });
    if (tl && buildS > 0) m.add(tl.tweenFromTo(from, tl.duration(), { ease: "none" }), 0);
    m.fromTo(it.bar, { "--lp-dive-p": p0 }, { "--lp-dive-p": 1, duration: Math.max(0.05, barS), ease: "none" }, 0);
    master = m;
    sync();
  };
  const onTurnEnd = () => {
    if (held) pendingAdvance = true;
    else select((active + 1) % n, "auto");
  };
  /** play the turn while the carousel may run; pause it, where it is, otherwise */
  const sync = () => {
    const run =
      !!master && engaged && !posed && !userPaused && !docHidden && !isReduced() && visible && ratio >= DWELL_MIN_RATIO - 0.001;
    row.toggleAttribute("data-run", run);
    if (!master) return;
    if (run) master.play();
    else master.pause();
  };

  /* ── switching ── */
  const settleFades = () => {
    const pending = fades;
    fades = [];
    for (const t of pending) t.progress(1); // runs their onComplete: the outgoing panel goes idle
  };
  const paintTabs = () => {
    items.forEach((it, i) => {
      const on = i === active;
      it.tab.setAttribute("aria-selected", String(on));
      it.tab.tabIndex = on ? 0 : -1;
      if (on) it.fold?.removeAttribute("aria-hidden");
      else it.fold?.setAttribute("aria-hidden", "true");
      it.more?.toggleAttribute("data-on", on);
    });
  };
  const select = (next: number, how: "auto" | "user" | "pose") => {
    if (disposed || next === active || next < 0 || next >= n) return;
    const prev = items[active];
    const inc = items[next];
    killMaster();
    settleFades();
    pendingAdvance = false;
    active = next;
    paintTabs();
    if (how === "user") {
      engaged = true;
      posed = false;
    }
    if (inc.runtime && !inc.tl) build(inc); // picked before its queued build ran
    const G = g;
    const animate = !!G && !isReduced() && how !== "pose";
    if (animate && G) {
      const playable = !!inc.tl && inc.tl.duration() - inc.cue > 0.01;
      if (playable) inc.tl?.pause(inc.cue); // unseen: the panel is still idle
      setBar(inc, 0);
      prev.panel.dataset.state = "leaving";
      inc.panel.dataset.state = "active";
      prev.tab.dataset.barOut = "";
      fades = [
        G.fromTo(inc.panel, { opacity: 0 }, { opacity: 1, duration: FADE_S, ease: "power1.out", clearProps: "opacity" }),
        G.to(prev.panel, {
          opacity: 0,
          duration: FADE_S,
          ease: "power1.out",
          onComplete: () => {
            prev.panel.dataset.state = "idle";
            prev.panel.style.removeProperty("opacity");
            prev.tl?.progress(1, true); // unseen: back to its picture
          },
        }),
        G.to(prev.bar, {
          opacity: 0,
          duration: BAR_OUT_S,
          onComplete: () => {
            delete prev.tab.dataset.barOut;
            prev.bar.style.removeProperty("opacity");
            setBar(prev, null);
          },
        }),
      ];
      startTurn(playable ? "cue" : "end");
    } else {
      prev.panel.dataset.state = "idle";
      inc.panel.dataset.state = "active";
      prev.tl?.progress(1, true);
      inc.tl?.progress(1, true);
      setBar(prev, null);
      setBar(inc, null);
      delete prev.tab.dataset.barOut;
      if (G && !isReduced() && how !== "pose") startTurn("end");
    }
    sync();
  };

  /* ── first start (lp-play-once's contract) ── */
  const toCue = () => {
    const it = items[active];
    if (!it.tl) return;
    it.tl.pause(it.cue);
    setBar(it, 0);
    phase = "cued";
  };
  const toRest = () => {
    const it = items[active];
    it.tl?.progress(1, true);
    setBar(it, null);
    phase = "rest";
  };
  const engage = () => {
    if (engaged || posed) return;
    engaged = true;
    startTurn(phase === "cued" ? "from" : "end");
  };
  const armDwell = () => {
    clearTimeout(dwell);
    dwell = window.setTimeout(() => {
      dwell = 0;
      if (engaged || disposed || isReduced() || !visible || ratio < DWELL_MIN_RATIO) return;
      if (scrollSpeed() > FAST_SCROLL) armDwell();
      else engage();
    }, DWELL_MS);
  };
  const decide = () => {
    if (disposed) return;
    if (isReduced() || posed) return sync();
    if (engaged) return sync();
    const it = items[active];
    if (!g || (!it.tl && !it.failed)) return; // the server picture stands until the code is in
    clearTimeout(dwell);
    dwell = 0;
    const fast = scrollSpeed() > FAST_SCROLL;
    if (phase === "rest" && near && !visible && !fast && it.tl) toCue(); // below the fold, unseen
    if (phase === "cued" && !near) return toRest(); // went away before reaching it: unseen
    if (!visible) return;
    if (fast) {
      if (phase === "cued") toRest(); // flying past: the picture
      return armDwell(); // and start once the scroll settles on it
    }
    if (focused) return engage();
    if (ratio >= DWELL_MIN_RATIO) armDwell();
  };

  /* ── observers ── */
  const last = (entries: IntersectionObserverEntry[]) => entries[entries.length - 1];
  const prepareIo = new IntersectionObserver(
    (entries) => {
      if (last(entries).isIntersecting) loadRuntimes();
    },
    { rootMargin: PREPARE_MARGIN },
  );
  prepareIo.observe(section);
  // ahead of time: from the visitor's first input, wherever the carousel is on the page
  // (reduced motion fetches nothing: loadRuntimes)
  const cancelEager = whenInput(loadRuntimes);
  const cueIo = new IntersectionObserver(
    (entries) => {
      near = last(entries).isIntersecting;
      if (near) {
        loadRuntimes();
        requestBuilds();
      }
      decide();
    },
    { rootMargin: CUE_MARGIN },
  );
  cueIo.observe(stage);
  const focusIo = new IntersectionObserver(
    (entries) => {
      focused = last(entries).isIntersecting;
      decide();
    },
    { rootMargin: FOCUS_MARGIN },
  );
  focusIo.observe(stage);
  const viewIo = new IntersectionObserver(
    (entries) => {
      const e = last(entries);
      visible = e.isIntersecting;
      ratio = visible ? e.intersectionRatio : 0;
      if (visible) requestBuilds();
      decide();
    },
    { threshold: [0, 0.25, DWELL_MIN_RATIO, 0.75, 1] },
  );
  viewIo.observe(stage);
  const onRendered = (e: Event) => {
    if ((e as Event & { skipped?: boolean }).skipped === false) requestBuilds();
  };
  section.addEventListener("contentvisibilityautostatechange", onRendered);

  /* ── input ── */
  const tabIndexOf = (target: EventTarget | null) => {
    const tab = target instanceof Element ? target.closest('[role="tab"]') : null;
    return tab ? items.findIndex((it) => it.tab === tab) : -1;
  };
  const onClick = (e: MouseEvent) => {
    const i = tabIndexOf(e.target);
    if (i >= 0) select(i, "user"); // the active tab: no-op
  };
  const onKey = (e: KeyboardEvent) => {
    const i = tabIndexOf(e.target);
    if (i < 0) return;
    let next: number;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (i + 1) % n;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (i - 1 + n) % n;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = n - 1;
        break;
      case "Enter":
      case " ":
        next = i; // a div tab has no native activation (and Space must not scroll the page)
        break;
      default:
        return;
    }
    e.preventDefault();
    items[next].tab.focus();
    select(next, "user");
  };
  const focusVisible = (el: Element) => {
    try {
      return el.matches(":focus-visible");
    } catch {
      return false;
    }
  };
  /* what holds the advance under keyboard focus: everything in the row but Pause (the tabs, the
     selected item's link, which sits outside the tab list, and the stage). An advance would
     hide the link or the panel that has the focus. */
  const holdsAdvance = (el: EventTarget | null): el is Element =>
    el instanceof Element && row.contains(el) && !pauseBtn?.contains(el);
  const onFocusIn = (e: FocusEvent) => {
    if (holdsAdvance(e.target) && focusVisible(e.target)) held = true;
  };
  const onFocusOut = (e: FocusEvent) => {
    if (holdsAdvance(e.relatedTarget)) return;
    held = false;
    if (pendingAdvance) {
      pendingAdvance = false;
      select((active + 1) % n, "auto");
    }
  };
  tablist.addEventListener("click", onClick);
  tablist.addEventListener("keydown", onKey);
  row.addEventListener("focusin", onFocusIn);
  row.addEventListener("focusout", onFocusOut);

  const paintPause = () => {
    if (!pauseBtn) return;
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
    pauseBtn.dataset.ico = userPaused ? "play" : "pause";
  };
  const onPause = () => {
    userPaused = !userPaused;
    paintPause();
    if (!userPaused) {
      // Play: the visitor asked to watch
      posed = false;
      if (!engaged) {
        engaged = true;
        startTurn(phase === "cued" ? "from" : "end");
      } else if (!master) startTurn("end");
    }
    sync();
  };
  pauseBtn?.addEventListener("click", onPause);

  const onVisibility = () => {
    docHidden = document.hidden;
    sync();
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onMotion = () => {
    if (isReduced()) {
      killMaster();
      settleFades();
      for (const it of items) {
        it.tl?.progress(1, true);
        setBar(it, null);
      }
      phase = "rest";
      row.setAttribute("data-reduced", "");
    } else {
      row.removeAttribute("data-reduced");
      if (!g) loadRuntimes();
      else if (engaged) startTurn("end");
      else decide();
    }
    sync();
  };
  motionMq.addEventListener("change", onMotion);

  const onLayout = () => {
    const next: Layout = phoneMq.matches ? "phone" : "desktop";
    if (next === layout) return;
    layout = next;
    stageAt = null;
    applyLayout();
    // rebuild every story on the new box: no current builder reads the layout, the rebuild is
    // kept for a future phone composition
    killMaster();
    settleFades();
    for (const it of items) unbuild(it);
    if (engaged) {
      // the active one comes back on its picture and finishes its turn over the hold
      setBar(items[active], 0);
    } else {
      toRest();
    }
    requestBuilds();
  };
  phoneMq.addEventListener("change", onLayout);

  /* ── QA ── */
  w.__lpDive = {
    mode: "carousel",
    get timelines() {
      return Object.fromEntries(items.map((it) => [it.id, it.tl]));
    },
    get active() {
      return items[active].id;
    },
    select: (i: number) => select(i, "user"),
    pause: () => {
      if (!userPaused) onPause();
    },
    play: () => {
      if (userPaused) onPause();
      else if (posed) {
        posed = false;
        engaged = true;
        startTurn("end");
      }
    },
    /** freeze a pose: item i active, its bar at p, its story at `at` (seconds, a label, "end";
        nothing = its artboard frame, else its end picture). pose(0) = the V2 artboard's pose:
        item 1, the bar at DIVE_REST_P, its story on its end picture (ARTBOARD_AT is empty). */
    pose: (i: number, p: number = DIVE_REST_P, at?: number | string) => {
      posed = true;
      killMaster();
      settleFades();
      select(i, "pose");
      for (const it of items) it.tl?.progress(1, true);
      const it = items[active];
      if (it.tl) seekStory(it.tl, it.id, at);
      setBar(it, p);
      sync();
    },
    state: () => ({
      mode: "carousel",
      active: items[active].id,
      engaged,
      phase,
      posed,
      userPaused,
      held,
      visible,
      ratio,
      running: !!master && master.isActive(),
      progress: master ? master.progress() : null,
      built: items.filter((it) => it.tl).map((it) => it.id),
    }),
  };

  if (isReduced()) row.setAttribute("data-reduced", "");
  row.setAttribute("data-ready", "");
  paintPause();

  return () => {
    disposed = true;
    clearTimeout(dwell);
    cancelEager();
    unwatch();
    releaseSection?.();
    releaseSection = null;
    unwarm();
    prepareIo.disconnect();
    cueIo.disconnect();
    focusIo.disconnect();
    viewIo.disconnect();
    ro.disconnect();
    listRo.disconnect();
    flowMq.removeEventListener("change", reserveListHeight);
    list?.style.removeProperty("min-height");
    untrack();
    section.removeEventListener("contentvisibilityautostatechange", onRendered);
    tablist.removeEventListener("click", onClick);
    tablist.removeEventListener("keydown", onKey);
    row.removeEventListener("focusin", onFocusIn);
    row.removeEventListener("focusout", onFocusOut);
    pauseBtn?.removeEventListener("click", onPause);
    document.removeEventListener("visibilitychange", onVisibility);
    motionMq.removeEventListener("change", onMotion);
    phoneMq.removeEventListener("change", onLayout);
    killMaster();
    for (const t of fades) t.kill();
    fades = [];
    for (const it of items) unbuild(it);
    // back to the server state (a remount — HMR — reads it again)
    active = 0;
    paintTabs();
    items.forEach((it, i) => {
      it.panel.dataset.state = i === 0 ? "active" : "idle";
      it.panel.style.removeProperty("opacity");
      it.bar.style.removeProperty("opacity");
      delete it.tab.dataset.barOut;
      setBar(it, null);
      delete it.scene.dataset.lpLayout;
    });
    delete stage.dataset.lpFit;
    stage.style.removeProperty("--lp-fit");
    row.removeAttribute("data-ready");
    row.removeAttribute("data-reduced");
    row.removeAttribute("data-run");
    if (w.__lpDive) delete w.__lpDive;
  };
}

/**
 * Phones, stack switch on: the four items stacked (dive.css), each stage its own play-once
 * card. No carousel state: nothing is selected, nothing advances, nothing needs a pause.
 */
function mountDiveStack(row: HTMLElement): () => void {
  const section = row.closest<HTMLElement>("section") ?? row;
  const w = window as QaWindow;

  /* Semantics: a phone screen reader meets four headings, each with its copy and its picture,
     not a tab list whose panels are all open. Every attribute touched goes back on dispose (the
     carousel driver reads the server state when it mounts). */
  const undo: (() => void)[] = [];
  const attr = (el: Element | null | undefined, name: string, value: string | null) => {
    if (!el) return;
    const before = el.getAttribute(name);
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, value);
    undo.push(() => {
      if (before === null) el.removeAttribute(name);
      else el.setAttribute(name, before);
    });
  };
  const strip = (el: Element | null | undefined, names: string[]) => names.forEach((name) => attr(el, name, null));

  strip(row.querySelector(".lp-dive-tabs"), ["role", "aria-orientation", "aria-labelledby"]);
  const cards: { id: DiveItemId; panel: HTMLElement }[] = [];
  const stops: (() => void)[] = [];
  row.querySelectorAll<HTMLElement>(".lp-dive-tab").forEach((tab) => {
    const id = tab.dataset.id as DiveItemId | undefined;
    const title = tab.querySelector(".lp-dive-tab__title");
    strip(tab, ["role", "aria-controls", "aria-selected", "aria-labelledby", "aria-describedby", "tabindex"]);
    attr(title, "role", "heading");
    attr(title, "aria-level", "3");
    strip(tab.querySelector(".lp-dive-tab__fold"), ["aria-hidden"]);
    const panel = id ? row.querySelector<HTMLElement>(`#lp-dive-panel-${id}`) : null;
    if (!id || !panel) return;
    strip(panel, ["role", "aria-labelledby", "tabindex"]);
    // reading order = the order on screen (CSS `order` only moves the boxes): each item owns
    // its link and its picture, after its heading and copy
    const more = row.querySelector<HTMLElement>(`#lp-dive-more-${id}`);
    attr(tab, "aria-owns", more ? `${more.id} ${panel.id}` : panel.id);
    const scene = panel.querySelector<HTMLElement>(".lp-dive-scene");
    const root = scene?.querySelector<HTMLElement>("[data-lp-story]");
    if (!(id in LOADERS) || !scene || !root) return; // the server picture stands
    attr(scene, "data-lp-layout", "desktop"); // the desktop scene, scaled (never the 400×520 box)
    cards.push({ id, panel });
    stops.push(
      mountPlayOnce({
        host: panel,
        stage: root,
        designWidth: BOX_WIDTH.desktop,
        load: LOADERS[id],
        restIsEnd: true,
        qa: { registry: "__lpStory", key: id },
        layoutRoot: section, // content-visibility: auto (foundation.css)
      }),
    );
  });
  attr(row, "data-stack", "");

  const timelines = () => Object.fromEntries(cards.map(({ id }) => [id, w.__lpStory?.[id]]));
  w.__lpDive = {
    mode: "stack",
    get timelines() {
      return timelines();
    },
    // no carousel on phones: nothing to select, pause or resume
    select: () => {},
    pause: () => {},
    play: () => {},
    /** freeze item i's story at `at` (seconds, a label, "end"; nothing = its artboard frame) */
    pose: (i: number, _p?: number, at?: number | string) => {
      const card = cards[i];
      const tl = card && w.__lpStory?.[card.id];
      if (tl) seekStory(tl, card.id, at);
    },
    state: () => ({
      mode: "stack",
      built: cards.filter(({ id }) => w.__lpStory?.[id]).map(({ id }) => id),
      anim: Object.fromEntries(cards.map(({ id, panel }) => [id, panel.dataset.lpAnim ?? null])),
    }),
  };

  return () => {
    for (const stop of stops) stop();
    for (let i = undo.length - 1; i >= 0; i--) undo[i]();
    if (w.__lpDive?.mode === "stack") delete w.__lpDive;
  };
}

/**
 * What LpDiveCarousel mounts: the carousel, or — phones with the stack switch on — the stack.
 * One driver at a time; crossing 767 swaps them (each leaves the server state behind).
 */
export function mountDive(row: HTMLElement, o: DiveCarouselOptions): () => void {
  const section = row.closest<HTMLElement>("section") ?? row;
  if (section.dataset.lpPhone !== "stack") return mountDiveCarousel(row, o);
  const mq = matchMedia(STACK_MQ);
  let dispose: () => void = () => {};
  const mount = () => {
    dispose();
    dispose = mq.matches ? mountDiveStack(row) : mountDiveCarousel(row, o);
  };
  mount();
  mq.addEventListener("change", mount);
  return () => {
    mq.removeEventListener("change", mount);
    dispose();
  };
}
