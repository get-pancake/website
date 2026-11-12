"use client";

import type { gsap } from "@/lib/gsap";

/**
 * The play-once driver behind the homepage's animated mock UIs: the three
 * step cards (LpStepAnim). One seek-safe GSAP timeline per card, built on the
 * card's stage. It was written for the four feature cards (LpFeatAnim), which
 * the V2 deep-dive carousel replaced (2026-10-11): the carousel driver
 * (lp-dive-carousel.ts) reuses this file's constants and helpers for its
 * first start, so the two surfaces keep one contract. "Feature cards" below
 * is that history. `restIsEnd: true` (the server picture is the END picture)
 * is what the deep dive's PHONE STACK uses since 2026-10-12: on phones the
 * four stories are four cards of this driver (lp-dive-carousel.ts
 * mountDiveStack; designWidth 752, registry "__lpStory").
 *
 * Founder 2026-09-30: "les motions apparaissent de manière molle… quand tu
 * scrolles rapidement tu fais face à beaucoup de vides… il faut que l'écran
 * reste blanc le moins longtemps possible", then, on the first version of
 * this driver (which played from below the fold): "tu commences les
 * animations un peu trop vite quand mon écran n'est pas focus dessus". The
 * video-era contract (wait for 60 % in view, fetch the code on first touch,
 * start from an empty frame, pause half-built when scrolled away) left every
 * feature card blank for 0.5–0.9 s after it entered at a reading scroll, and
 * blank for good at a flick. The contract now — a card is never empty on
 * screen, and its build-up plays where the visitor is looking:
 *
 * - PREPARE ahead of time: the timeline code is fetched and the timeline
 *   built as soon as the card is laid out (a content-visibility:auto section
 *   skips its subtree's layout: f2 measures its glyphs). Until then, and
 *   while it waits far away, the card is the server-rendered picture
 *   (restIsEnd — the feature cards) or its own first frame (steps).
 *   WHEN (2026-10-13, the bug check's S2 and S4): the builds were queued one
 *   per animation frame as each card came within a viewport, so the work
 *   landed while the visitor scrolled towards it (one long frame per card,
 *   four in a row for the stories on phones). Now, from the visitor's first
 *   input, every card on the page is prepared in page order during idle time
 *   (requestIdleCallback with a timeout; Safari: a task of its own after the
 *   frame), a slice of a build per idle slot, and a section that skips its
 *   rendering is rendered ahead in a slot of its own (`holdRendered`). A card that
 *   comes within a viewport before its turn is prepared by the same queue,
 *   as before (on phones still only after the first input, `whenTouched`:
 *   nothing is fetched while the page rests untouched at its top), and a
 *   card already on screen or within the cue margin still builds at once.
 *   Nothing the visitor sees changes: only the moment of the work.
 * - CUE below the fold: as the card comes within 15 % of a viewport of the
 *   fold, it switches — unseen — to its FIRST SCENE (the builder's `cue`: a
 *   composed frame, never empty — the Signals card with its toggles off, the
 *   post before its text types…) and enters the screen on it.
 * - PLAY where the visitor looks: once the card's top crosses 60 % of the
 *   viewport height — or, for a visitor who stopped scrolling short of that
 *   line, after 1 s with at least half the card on screen (a card that only
 *   peeks in at the bottom waits). Once, then it holds its last frame (the
 *   designer's picture) and never restarts.
 * - FLYING PAST (> 2.5 px/ms, or a jump of half a viewport) shows the
 *   picture instead of a build-up nobody would see.
 * - ARRIVING is not flying past (2026-10-13, the bug check's M1): "Product"
 *   in the nav scrolls to the steps with a fast smooth scroll, the cards read
 *   that speed as a fly-by, jumped to their picture and never played. A link
 *   that scrolls to an anchor announces where it lands (LpNavScroll, the
 *   `lp:arrive` event): the cards that will be on screen there are cued on
 *   the way and play once the scroll has landed, by the rules above. Cards
 *   passed on the way still show their picture, and a scroll the visitor
 *   makes is read as before.
 * - LEAVING THROUGH THE TOP while unfinished fast-forwards it to the picture
 *   (~0.35 s): the part still on screen is the card's lower half, which the
 *   build-ups fill last. Gone after it played: it finishes, so a visitor who
 *   comes back finds the picture, never a half-built card. Cued but never
 *   reached: back to rest, unseen.
 * - NEVER EMPTY WHAT IS ON SCREEN: a card that is already on screen in its
 *   resting picture (reload mid-page, an anchor, the code arriving late,
 *   scrolling back up into it) keeps it. Reduced motion keeps it too,
 *   without downloading any animation code.
 * - TOUCH SCREENS, A FLICK (2026-11-03): a thumb flick is the normal way to scroll there and it
 *   flies past whole sections (two flicks cross the three steps). A card a flick carries in
 *   does NOT jump to its picture: it stays on its first scene, and once the scroll comes to rest
 *   it plays by the rules above (at once past the focus line, after the dwell short of it), so a
 *   card the visitor stops on always builds up in front of them (founder 2026-10-13: "they are
 *   not animated which is a bug"). A card is never played twice: the 2026-10-13 rule that
 *   cleared a card already showing its picture and played it again where the scroll stopped is
 *   gone (founder 2026-11-03, on a phone: "des restarts bizarre sur les animations"; measured
 *   in the iOS simulator: a story replayed after a flick back up). A card already on screen in
 *   its resting picture keeps it, as above. Mouse and trackpad keep the rules above unchanged.
 * - OWED ITS TAKE (2026-11-12, `playWhenStopped`, the vision homepage's 1-2-3): on a card that
 *   asks for it, the pictures above ("flying past", "never empty what is on screen") are not the
 *   end of it. A card that got its picture without playing plays the first time the scroll comes
 *   to rest with half of it on screen. Reported on the 1-2-3 on a laptop: "ils ne sont pas
 *   animés": one step of a trackpad flick or a page key crosses the cue margin, and the card
 *   was on screen before it could be cued. A card that has played is still never played again.
 * - GOING ROUND (2026-11-12, `loop`, the vision homepage's 1-2-3 and the deep dive's phone
 *   stack): a card that asks for it does not stop on its last frame. Its take starts again
 *   after a hold, from the builder's `loop` time, for as long as the card can be seen; out of
 *   sight it pauses where it is. A take whose `loop` time is inside it is an opening, then a
 *   round: once past that time it is going round (it is never rushed, and it waits out of
 *   sight). A card left during its first round shows its picture and owes a round, which
 *   starts when half of it is back on screen. "Played once, never restarts" still holds for
 *   every card that does not ask.
 * - prefers-reduced-motion = the picture; lifting it mid-visit lets a card
 *   that has not finished play its build-up (the steps rest on their first
 *   frame, so they still need the timeline to show their picture).
 *
 * Geometry: the stage is the card at design size and scales as pixels with
 * the card (--lp-fit = card width / designWidth, via ResizeObserver; never
 * zoom). data-lp-fit marks the measured value: below the fixed-artboard
 * widths the stage waits for it, because iOS WebKit mis-resolves the CSS
 * trig fallback (LpFitVars).
 */

type Timeline = gsap.core.Timeline;
/** the window QA registries: step cards, and the deep-dive stories (window.__lpStory.<id>:
    registered by the carousel shell lp-dive-carousel.ts, by this driver for the phone stack,
    and by the /lp-dev/stages harness; V2 replication 2026-10-09). "__lpFeat" left with the
    feature cards. */
// __lpInfra: LpInfraAnim's diagram flow (2026-10-21)
// __lpVision: the window under the vision homepage's hero (LpVisionCurtain, 2026-11-11)
export type PlayOnceRegistry = "__lpStep" | "__lpStory" | "__lpInfra" | "__lpVision";
/** cue: the timeline time of the card's first scene (0 = its first frame).
    loop: on a surface that loops (PlayOnceOptions.loop), the time a new round starts from (the
    cue when unset): a take whose first round is an opening can start its later rounds after it.
    next: called before each new round, for a picture that changes between two rounds. */
type Built = { tl: Timeline; cleanup: () => void; cue?: number; loop?: number; next?: () => void };
/** A builder that can pause: it yields between two slices of its work and returns what the
    plain builder returns. Where it may yield is each builder's own business (its header). */
export type BuildSteps = Generator<void, Built, void>;
export type PlayOnceRuntime = {
  gsap: typeof import("@/lib/gsap").gsap;
  build: (stage: HTMLElement) => Built;
  /** the same builder in slices, for the builds that are spread over idle time (optional) */
  steps?: (stage: HTMLElement) => BuildSteps;
};

export type PlayOnceOptions = {
  /** the card: observed, carries data-lp-anim / data-lp-fit / --lp-fit */
  host: HTMLElement;
  /** the timeline's root */
  stage: HTMLElement;
  /** the stage's design width in px (464 step card, 752 deep-dive scene on phones) */
  designWidth: number;
  /** fetches GSAP + the card's builder (kept out of the initial bundle, PR #283) */
  load: () => Promise<PlayOnceRuntime>;
  /** the server-rendered stage is the end picture (true) or the first frame (false) */
  restIsEnd: boolean;
  /** QA hook: window[registry][key] = the timeline (seek it to any moment) */
  qa: { registry: PlayOnceRegistry; key: string };
  /** content-visibility:auto ancestor: prepare when IT nears the viewport
      (a skipped subtree reports no intersections), build once it renders */
  layoutRoot?: HTMLElement | null;
  /** playback rate (timeline time stays the composition's for QA seeks) */
  speed?: number;
  /** A card that got its picture without playing is OWED its take: a fast scroll flew it in,
      one step of the scroll brought it on screen (a page key, a trackpad flick: the cue margin
      is 15 % of a viewport), or its take was built while it was already there. Unset, such a
      card keeps its picture for the visit, and on a mouse or a trackpad most visitors never see
      it move (2026-11-12, on the preview of the 1-2-3: "ils ne sont pas animés"). Set, it plays the
      first time the scroll comes to rest with half of it on screen, on every pointer; several
      such cards start one after the other, in page order. Out of sight before that, it goes
      back to rest and the rules above play it when the visitor returns. A card that has played
      is never played again. */
  playWhenStopped?: boolean;
  /** The take starts again once it has ended, for as long as the card can be seen (asked on the
      preview of the 1-2-3, 2026-11-12: "pas qu'elles s'arrêtent à la fin, mais qu'elles
      redémarrent"). `hold`: seconds on the end picture before the next round (0 when the
      timeline holds its own). A round starts from the builder's `loop` time. Out of sight the
      take pauses where it is and carries on when the card is back. Reduced motion never loops:
      the picture. Unset: the card plays once, as every card did. */
  loop?: { hold: number };
  /** A card whose top shows on the first screen by design (the window under the hero: 70 px of
      it peek over the fold). For it, "already on screen in its resting picture" is its top above
      this share of the viewport's height, not its first pixel on screen: on a fresh page it is
      cued like a card below the fold and plays at the focus line. Unset: the rule as written. */
  seenAbove?: number;
};

/* The timing constants and the scroll/build helpers below are exported for the deep-dive
   carousel (lp-dive-carousel.ts), which plays its first item by this same contract: one
   implementation of "prepare, cue, play at the focus line, picture on fly-by". */
/** px per ms: faster than this when a card arrives = flying past it */
export const FAST_SCROLL = 2.5;
/** the same on a touch screen, where a flick's momentum carries cards across the screen faster
    than a reader reads well under 2.5 px/ms: a card waits until the momentum has all but died
    (measured in the iOS simulator, 2026-11-03: at 2.5 a step card began its build-up while the
    tail of a flick carried it off the top) */
const FAST_TOUCH = 1;
/** prepare this far ahead of the viewport, above and below */
export const PREPARE_MARGIN = "100% 0px 100% 0px";
/** switch to the first scene this far below the fold (unseen) */
export const CUE_MARGIN = "0px 0px 15% 0px";
/** play once the card's top is above this share of the viewport height */
export const FOCUS_MARGIN = "0px 0px -40% 0px"; // the top 60 %
/** half the card on screen this long, short of the focus line (scrolling stopped): play */
export const DWELL_MS = 1000;
export const DWELL_MIN_RATIO = 0.5;
/** leaving through the top unfinished: the rest of the build-up plays in this long */
export const RUSH_S = 0.35;

/* ── scroll speed: recent scroll positions (one passive listener) ── */
const samples: { t: number; y: number }[] = [];
let speedUsers = 0;
/** the scroll has come to rest when no scroll event came for this long (ms) */
const SETTLE_MS = 160;
/** where the flick rule applies (a flick leaves a card on its first scene): touch is the main pointer */
const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";
const settleSubs = new Set<(landed: boolean) => void>();
let settleTimer = 0;
/* Cards that are owed their take (playWhenStopped) and start as a scroll comes to rest start
   one after the other, in page order (the order they were mounted in): how many have started
   at this rest, and the time between two. */
let startsThisRest = 0;
const OWED_STAGGER_MS = 320;
/* A scroll to an anchor is under way (LpNavScroll announces it before it scrolls): the scroll
   position it will land on. Cards that will be on screen there are arriving, not flown past. */
const ARRIVE_EVENT = "lp:arrive"; // = LpNavScroll.tsx
/** the announced scroll starts a frame later: it has this long to send its first scroll event (ms) */
const ARRIVE_GRACE_MS = 400;
let arrival: { y: number } | null = null;
const onSettled = () => {
  settleTimer = 0;
  const landed = arrival !== null;
  arrival = null;
  startsThisRest = 0;
  for (const run of Array.from(settleSubs)) run(landed);
};
const onArrive = (e: Event) => {
  const target = (e as CustomEvent<unknown>).detail;
  if (!(target instanceof Element) || !settleSubs.size) return;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  arrival = { y: Math.min(Math.max(target.getBoundingClientRect().top + window.scrollY - margin, 0), Math.max(max, 0)) };
  // a link to where the page already is scrolls nothing: the arrival ends by itself
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(onSettled, ARRIVE_GRACE_MS);
};
/* builds under way that must not be seen half-done (mountPlayOnce `approach`, the carousel's):
   told of every scroll */
const approachSubs = new Set<() => void>();
/** Calls `run` on every scroll, while a caller of trackScroll is mounted. Returns the cancel. */
export function onEveryScroll(run: () => void): () => void {
  approachSubs.add(run);
  return () => void approachSubs.delete(run);
}
const onScroll = () => {
  const t = performance.now();
  samples.push({ t, y: window.scrollY });
  while (samples.length > 2 && t - samples[0].t > 500) samples.shift();
  if (approachSubs.size) for (const run of Array.from(approachSubs)) run();
  if (settleSubs.size) {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(onSettled, SETTLE_MS);
  }
};
export function trackScroll(): () => void {
  if (speedUsers++ === 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(ARRIVE_EVENT, onArrive);
  }
  return () => {
    if (--speedUsers === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(ARRIVE_EVENT, onArrive);
      samples.length = 0;
      window.clearTimeout(settleTimer);
      settleTimer = 0;
      arrival = null;
    }
  };
}
/** px per ms over the last 150 ms; Infinity for a jump (one scroll event of
    half a viewport or more: a flick, Page Down, an anchor); 0 when idle */
export function scrollSpeed(): number {
  const now = performance.now();
  const n = samples.length;
  if (!n || now - samples[n - 1].t > 150) return 0;
  if (n > 1 && Math.abs(samples[n - 1].y - samples[n - 2].y) > window.innerHeight * 0.5) return Infinity;
  let ref = samples[0];
  for (let i = n - 1; i >= 0; i--) {
    if (samples[i].t <= now - 150) {
      ref = samples[i];
      break;
    }
  }
  return Math.abs(window.scrollY - ref.y) / Math.max(150, now - ref.t);
}

/* ── phones: nothing is fetched "a viewport ahead" while the page rests untouched at its top ──
   Verifier M3 (2026-10-12). V2's shorter phone demo card moved step 01 up, inside the prepare
   margin of tall phone viewports (412 × 823, the Lighthouse / PSI mobile viewport; 393 × 852;
   402 × 874): GSAP and the steps chunk were fetched and the timeline built at load, with no
   scroll, where production waits for the first one. So on phones the one-viewport-ahead prepare
   waits for the visitor's first input (a scroll, a touch, a key). A card that is on screen or
   within the cue margin at load still prepares at once, and so does a page that loads scrolled
   (reload mid-page, an anchor): this only removes the fetch nobody asked for yet. */
const PHONE_QUERY = "(max-width: 767px)";
/* pointermove is a visitor moving a mouse over the page (the demo window's own first-input list
   has it too); a touch screen sends none before its first touch */
const FIRST_INPUT = ["scroll", "touchstart", "pointerdown", "pointermove", "keydown", "wheel"] as const;
let touched = false;
const waiting = new Set<() => void>();
const onFirstInput = () => {
  touched = true;
  for (const type of FIRST_INPUT) window.removeEventListener(type, onFirstInput);
  const runs = Array.from(waiting);
  waiting.clear();
  for (const run of runs) run();
};
/** Runs `run` now, or at the visitor's first input while the page still rests untouched at its
    top (any width). Returns the cancel. */
export function whenInput(run: () => void): () => void {
  if (touched || window.scrollY > 0) {
    run();
    return () => {};
  }
  if (waiting.size === 0) {
    for (const type of FIRST_INPUT) window.addEventListener(type, onFirstInput, { passive: true });
  }
  waiting.add(run);
  return () => {
    waiting.delete(run);
    if (waiting.size === 0 && !touched) {
      for (const type of FIRST_INPUT) window.removeEventListener(type, onFirstInput);
    }
  };
}
/** Runs `run` now, or at the first input when a phone page still rests untouched at its top.
    Returns the cancel. */
function whenTouched(run: () => void): () => void {
  if (matchMedia(PHONE_QUERY).matches) return whenInput(run);
  run();
  return () => {};
}

/* ── idle time ── */
/** an idle slot comes within this long, or the work runs anyway: a build can wait for a quiet
    moment, it cannot starve. Short on purpose: on a main thread that never idles (a slow device
    with a story playing on screen) the queue must still be done before its work is needed, or
    the build lands whole where it is needed, as it did before (ms) */
const IDLE_TIMEOUT_MS = 50;
type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type IdleWindow = Window & {
  requestIdleCallback?: (run: (deadline: IdleDeadline) => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};
/** Runs `run` in a task of its own, in the browser's next idle period (it gets the browser's
    deadline). Safari has no requestIdleCallback: there the task comes right after the next
    frame (or after the timeout in a hidden tab, where no frame comes), with no deadline.
    Returns the cancel. */
function idleSlot(run: (deadline?: IdleDeadline) => void, timeout = IDLE_TIMEOUT_MS): () => void {
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(run, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  let timer = 0;
  const frame = requestAnimationFrame(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => run(), 0);
  });
  timer = window.setTimeout(() => {
    cancelAnimationFrame(frame);
    run();
  }, timeout);
  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(timer);
  };
}

/* ── builds: in idle slots, in page order ──
   Until 2026-10-13 the queue ran one build per animation frame: four cards never made one long
   task, but each build was still one long frame, in consecutive frames, while the visitor
   scrolled (the bug check's S2: 206 + 505 + 126 + 114 ms in a row on a mid-range phone). The
   work now takes idle slots, and the queue is kept in page order (`at`: the element the work is
   for), so what the visitor reaches first is ready first. A job that returns true has more to
   do (a build in slices, `startBuild`): it keeps its place and is called again, in the same
   slot while idle time is left, else in the next one. */
type Job = { run: () => boolean | void; at: Element | null };
const jobs: Job[] = [];
let pumpAsked = false;
/** the most one slot works before it hands back, however long the browser says it is idle: about
    one slice of a build (SLICE_MS), so a slot is a short task even when what it runs is not (ms) */
const SLOT_MS = 4;
/** a slot the browser gave no idle time for (the timeout, or Safari): two slices (ms) */
const FORCED_SLOT_MS = 8;
function pump(deadline?: IdleDeadline) {
  pumpAsked = false;
  const t0 = performance.now();
  const left = () => {
    const spent = performance.now() - t0;
    if (!deadline || deadline.didTimeout) return FORCED_SLOT_MS - spent;
    return Math.min(deadline.timeRemaining(), SLOT_MS - spent);
  };
  while (jobs.length) {
    const job = jobs[0];
    if (!job.run()) {
      const k = jobs.indexOf(job);
      if (k >= 0) jobs.splice(k, 1);
    }
    if (left() <= 1) break;
  }
  askPump();
}
function askPump() {
  if (pumpAsked || !jobs.length) return;
  pumpAsked = true;
  idleSlot(pump);
}
/** Queues `run` for an idle slot. `at` places it in page order; without it, after everything
    that has a place. Returns the cancel. */
export function enqueueBuild(run: () => boolean | void, at: Element | null = null): () => void {
  const job: Job = { run, at };
  let i = jobs.length;
  if (at) {
    const after = jobs.findIndex((j) => !j.at || (at.compareDocumentPosition(j.at) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
    if (after >= 0) i = after;
  }
  jobs.splice(i, 0, job);
  askPump();
  return () => {
    const k = jobs.indexOf(job);
    if (k >= 0) jobs.splice(k, 1);
  };
}

/* ── a build in slices ──
   One build is a builder (it measures, sets the frame-0 states, creates the tweens), then, for a
   surface that rests on its END picture, the timeline taken to its end. Both are long (the old
   deep-dive message story's took 154 + 152 ms on a mid-range phone) and both can be cut without
   changing what is built:
   - the builder, where it says so itself (`runtime.steps`: it yields between slices);
   - the end pass, child by child. `tl.progress(1, true)` renders the timeline's children in
     order, each to its own end, and a tween records its start values the first time it
     renders; taking the children to their end one by one, in that order, records the same
     values, provided GSAP writes as it goes. It does once its ticker has ticked (before the
     first tick it defers the first writes, "lazy"): until then the pass is not cut.
   `next(through)` runs one slice (about SLICE_MS), or all that is left with `through`, and
   returns what was built once nothing is left. Every slice runs inside the build's
   gsap.context, which the owner reverts. A build under way is NOT its resting picture when the
   surface rests on its end: the owner pauses it only where nobody can see it. */
/** how long one slice of a build works before it hands back (ms) */
const SLICE_MS = 4;
/** a surface that rests on its end picture builds in slices only while it is at least this many
    viewports away from the screen (exported for the carousel's stage) */
export const AWAY_VIEWPORTS = 2;
export type BuildRun = {
  ctx: gsap.Context;
  next: (through: boolean) => Built | undefined;
  /** the builder's own cleanup, if it has returned (for a build that failed after it) */
  cleanup: () => void;
};
export function startBuild(runtime: PlayOnceRuntime, root: HTMLElement, toEnd: boolean): BuildRun {
  const g = runtime.gsap;
  const ctx = g.context(() => {}, root);
  let steps: BuildSteps | undefined;
  let built: Built | undefined;
  let children: gsap.core.Animation[] | undefined;
  let at = 0;
  let done = false;
  const slice = (through: boolean) => {
    const t0 = performance.now();
    const more = () => through || performance.now() - t0 < SLICE_MS;
    if (!built) {
      if (!runtime.steps) built = runtime.build(root);
      else {
        steps ??= runtime.steps(root);
        do {
          const step = steps.next();
          if (step.done) built = step.value;
        } while (!built && more());
      }
      if (!built || (toEnd && !through)) return; // the end pass starts in a slice of its own
    }
    if (toEnd) {
      const tl = built.tl;
      tl.pause();
      if (!through && g.ticker.frame > 0) {
        children ??= tl.getChildren(false, true, true);
        while (at < children.length && more()) {
          const child = children[at++];
          if (!child.paused()) child.totalTime(child.totalDuration(), true);
        }
        if (at < children.length) return;
      }
      tl.progress(1, true);
    }
    done = true;
  };
  return {
    ctx,
    next(through) {
      // caught inside: gsap.context does not restore itself when its function throws
      let failure: unknown;
      ctx.add(() => {
        try {
          slice(through);
        } catch (err) {
          failure = err ?? new Error("lp-play-once: the build failed");
        }
      });
      if (failure) throw failure;
      return done ? built : undefined;
    },
    cleanup: () => built?.cleanup(),
  };
}

/* ── sections that skip their rendering (content-visibility: auto, foundation.css) ──
   The bug check's S4: such a section is styled, laid out and painted for the first time in the
   frame it nears the screen (87 and 48 ms mid-scroll on a mid-range phone), and the cards in it
   cannot be measured, so cannot be built, before that. `holdRendered` renders one ahead of time
   (style and layout, in the caller's task) and keeps it rendered until released: [data-lp-ahead]
   is `content-visibility: visible` with the containment `auto` applies, so nothing it paints
   changes. Released, the section is `auto` again and is skipped while it is far away, as before
   (the GPU budget that rule is there for), with its styles and layout already computed.
   Only a section BELOW the viewport: the real height replaces the estimate, and in an engine
   without scroll anchoring (Safari) a section above would move what is on screen. */
const AHEAD_ATTR = "data-lp-ahead";
/** = foundation.css's content-visibility list */
const SKIPPED_SECTIONS = ".lp-banner, .lp-dive, .lp-bento";
const holds = new WeakMap<Element, number>();
type Checkable = Element & { checkVisibility?: (options: { contentVisibilityAuto: boolean }) => boolean };
/** Returns the release, or null when the section is not rendered and cannot be yet. */
export function holdRendered(section: HTMLElement): (() => void) | null {
  if (!section.hasAttribute(AHEAD_ATTR)) {
    const probe = section.firstElementChild as Checkable | null;
    if (!probe || typeof probe.checkVisibility !== "function") return null;
    const skipped = !probe.checkVisibility({ contentVisibilityAuto: true });
    if (skipped && section.getBoundingClientRect().top < window.innerHeight) return null;
    // (a section `auto` renders right now is pinned as it is: it may be skipped again any frame)
    section.setAttribute(AHEAD_ATTR, "");
    if (skipped) void section.offsetHeight; // style and layout now, in this task
  }
  holds.set(section, (holds.get(section) ?? 0) + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const left = (holds.get(section) ?? 1) - 1;
    if (left > 0) return void holds.set(section, left);
    holds.delete(section);
    section.removeAttribute(AHEAD_ATTR);
  };
}
/* From the first input, each skipped section below the screen is rendered once in a slot of its
   own, so its first frame on screen has nothing left to compute but its paint. */
let warmUsers = 0;
let cancelWarm = () => {};
export function warmSkippedSections(): () => void {
  if (warmUsers++ === 0) {
    cancelWarm = whenInput(() => {
      document.querySelectorAll<HTMLElement>(SKIPPED_SECTIONS).forEach((section) => {
        enqueueBuild(() => holdRendered(section)?.(), section);
      });
    });
  }
  return () => {
    if (--warmUsers === 0) cancelWarm();
  };
}

export function mountPlayOnce(o: PlayOnceOptions): () => void {
  const { host, stage } = o;

  // fit scale: the layout content width of the card (immune to ancestor transforms)
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.contentBoxSize?.[0];
      const width = box ? box.inlineSize : entry.contentRect.width;
      if (!(width > 0)) continue;
      host.style.setProperty("--lp-fit", String(width / o.designWidth));
      host.dataset.lpFit = "";
    }
  });
  ro.observe(host);

  const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
  const untrack = trackScroll();
  const unwarm = warmSkippedSections();
  let disposed = false;
  let near = false; // on screen or within 15 % below the fold
  let visible = false; // on screen
  let focused = false; // its top above 60 % of the viewport height
  let ratio = 0; // share of the card on screen
  /** rest: the resting picture · cued: the first scene, waiting for focus ·
      playing: its build-up · done: the last frame holds */
  let phase: "rest" | "cued" | "playing" | "done" = "rest";
  let cue = 0;
  let dwell = 0;
  /** the card shows its picture without having played: with `playWhenStopped` it is owed its
      take (and `owedTimer`: its turn to start, when several are owed at one rest) */
  let owed = false;
  let owedTimer = 0;
  /** `loop`: the take has played through and goes round from here (`loopTimer`: the hold
      before the next round; `roundOwed`: that hold ended while the card could not be seen) */
  let looping = false;
  let loopTimer = 0;
  let roundOwed = false;
  let loopFrom = 0;
  /** where the first round ends: the builder's `loop` time when the take goes on past it (an
      opening, then the round), else the timeline's end */
  let firstEnd = 0;
  let nextRound: (() => void) | undefined;
  /** finish() is taking the timeline to its end: its onComplete is not the end of a round */
  let ending = false;
  const touchMq = matchMedia(TOUCH_QUERY);
  let loading = false;
  let queued = false;
  /** the layoutRoot was asked to render ahead of time (once), and the hold on it until the build */
  let askedSection = false;
  let releaseSection: (() => void) | null = null;
  let runtime: PlayOnceRuntime | undefined;
  let tl: Timeline | undefined;
  /** the build, from its first slice (startBuild); `ctx` is its gsap.context */
  let run: BuildRun | undefined;
  let ctx: gsap.Context | undefined;
  let failed = false;
  let cleanupDom: (() => void) | undefined;

  const onScreen = () => {
    const r = host.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  /** the visitor already has the card's picture in front of them (NEVER EMPTY WHAT IS ON SCREEN) */
  const seen = (observed: boolean) => {
    if (o.seenAbove === undefined) return observed || onScreen();
    const r = host.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight * o.seenAbove;
  };
  // A content-visibility:auto ancestor that skips its contents gives them no
  // geometry: build only once it renders them (f2 measures glyph rects).
  // Nor does a display:none one: the homepage's agents view hides every human
  // section, and a visitor whose first input is the toggle had the step cards
  // built there, measured at zero (2026-11-01: s4 threw, its card stayed a
  // still for the visit). Not laid out = not built now; the observers below
  // prepare the card again once its section shows and nears the screen.
  const laidOut = () => {
    const check = (stage as HTMLElement & {
      checkVisibility?: (opts?: { contentVisibilityAuto: boolean }) => boolean;
    }).checkVisibility;
    if (!o.layoutRoot) return typeof check === "function" ? check.call(stage) : stage.getClientRects().length > 0;
    if (typeof check === "function") return check.call(stage, { contentVisibilityAuto: true });
    return near || visible; // older engines: the card itself is intersecting
  };

  const toRest = () => {
    if (!tl) return;
    if (o.restIsEnd) tl.progress(1, true);
    else tl.pause(0);
    phase = "rest";
    host.dataset.lpAnim = "armed";
  };
  const toCue = () => {
    if (!tl) return;
    tl.pause(cue);
    phase = "cued";
    host.dataset.lpAnim = "cued";
  };
  const play = () => {
    if (!tl) return;
    tl.play();
    phase = "playing";
    host.dataset.lpAnim = "playing";
  };
  const finish = () => {
    if (!tl) return;
    ending = true;
    tl.progress(1);
    ending = false;
    phase = "done";
    host.dataset.lpAnim = "done";
  };
  /** half the card on screen: where a visitor who stopped is looking at it */
  const inView = () => visible && ratio >= DWELL_MIN_RATIO;
  /** the take's first round has played through: from here it goes round */
  const enterLoop = () => {
    looping = true;
    host.dataset.lpAnim = "looping";
    tl?.timeScale(o.speed ?? 1); // (a visitor moving on may have rushed the first round)
  };
  /** a new round of a looping take: what changes between two rounds, then from its loop point */
  const startRound = () => {
    if (!tl) return;
    roundOwed = false;
    nextRound?.();
    tl.play(loopFrom);
  };
  /** a looping take: it runs while the card can be seen, and waits where it is otherwise. A
      round that is owed starts once half of the card is on screen. (`near` too: the observers
      report one after the other, and on a jump away the one that says "half on screen" can
      still hold its old answer when the other has already said "gone".) */
  const syncLoop = () => {
    if (!tl || motionMq.matches) return;
    if (!near && !visible) return void tl.pause();
    if (roundOwed) {
      if (near && inView()) startRound();
      return;
    }
    if (!loopTimer && tl.progress() < 1) tl.play();
  };
  /** a looping take the visitor left during its first round: its picture, and a round owed */
  const park = () => {
    if (!tl) return;
    tl.pause();
    tl.progress(1, true);
    enterLoop();
    roundOwed = true;
  };
  /** the picture, for a card that did not play: it may be owed its take */
  const skip = () => {
    finish();
    owed = o.playWhenStopped === true;
  };
  /** an owed card's take, from its first scene, if the visitor is still stopped on it */
  const startOwed = () => {
    owedTimer = 0;
    if (disposed || !tl || !owed || phase !== "done" || motionMq.matches || !inView()) return;
    owed = false;
    tl.pause(cue);
    play();
  };
  // the visitor is moving on while the card is still building: fast-forward
  const rush = () => {
    if (!tl || phase !== "playing" || looping || motionMq.matches || !tl.isActive()) return;
    const left = firstEnd - tl.time();
    if (left > 0) tl.timeScale(Math.max(tl.timeScale(), left / RUSH_S));
  };
  /* The scroll has come to rest. A scroll to an anchor has landed: the cards it brought on
     screen play by the usual rules. On a touch screen, a card a flick left on its first scene
     (decide) plays now that the visitor has stopped on it: at once past the focus line, after
     the dwell short of it. A card that is done stays done (no replay, founder 2026-11-03). */
  const onSettle = (landed: boolean) => {
    // owed its take, and the visitor has stopped on it: it plays, in its turn
    if (owed && phase === "done" && !owedTimer && !motionMq.matches && inView()) {
      const wait = startsThisRest++ * OWED_STAGGER_MS;
      if (wait) owedTimer = window.setTimeout(startOwed, wait);
      else startOwed();
      return;
    }
    if (landed || (touchMq.matches && phase === "cued")) decide();
  };
  settleSubs.add(onSettle);

  /* A scroll to an anchor is under way and this card will be on screen (or within the cue
     margin) where it lands: it is arriving, whatever the speed. */
  const arriving = () => {
    if (!arrival) return false;
    const r = host.getBoundingClientRect();
    const top = r.top + window.scrollY - arrival.y;
    return r.height > 0 && top < window.innerHeight * 1.15 && top + r.height > 0;
  };

  const decide = () => {
    if (!tl || disposed) return;
    clearTimeout(dwell);
    dwell = 0;
    if (motionMq.matches) {
      tl.pause();
      tl.progress(1, true);
      return;
    }
    if (looping) return syncLoop();
    if (phase === "done") {
      // owed its take and out of sight again: back to rest, for the rules below to play it
      // when the visitor returns
      if (owed && !near && !visible && !owedTimer) {
        owed = false;
        toRest();
      }
      return;
    }
    const landing = arriving();
    // a touch screen flies past on a flick: the card waits on its first scene (onSettle plays it)
    const touch = touchMq.matches;
    const fast = !landing && scrollSpeed() > (touch ? FAST_TOUCH : FAST_SCROLL);
    if (phase === "rest") {
      if (!near) return; // far away: keep resting
      // already showing its picture on screen (built late, entering from above, an observer
      // that reports late in a flick): the picture, never a frame that empties
      if (o.restIsEnd && seen(visible)) return skip();
      if (fast && !touch) return skip(); // a mouse flying past: the picture
      toCue(); // still below the fold: the first scene, unseen
    }
    if (phase === "cued") {
      if (!near) return toRest(); // went away before reaching it: unseen
      if (landing) return; // on its way: it plays once the scroll has landed (onSettle)
      if (focused) {
        if (!fast) return play();
        // flying past: the picture on a mouse; a touch screen keeps the first scene until the
        // scroll stops on it (onSettle) or carries it away (toRest, unseen)
        if (!touch) skip();
        return;
      }
      if (visible && ratio >= DWELL_MIN_RATIO) {
        // half on screen but short of the focus line: a visitor who stopped
        dwell = window.setTimeout(() => {
          dwell = 0;
          // still carried by a flick on a touch screen: the scroll's rest plays it (onSettle)
          if (touchMq.matches && scrollSpeed() > FAST_TOUCH) return;
          if (phase === "cued" && visible && ratio >= DWELL_MIN_RATIO && !motionMq.matches) play();
        }, DWELL_MS);
      }
      return;
    }
    // playing: carry on while it can still be seen; gone, it finishes (a looping take keeps
    // its picture and owes a round)
    if (near) tl.play();
    else if (o.loop) park();
    else finish();
  };

  /* A build is spread over idle slots (startBuild). A card that rests on its first frame is that
     frame all along (the builder's sets ARE the resting picture), so its build can pause
     anywhere, on screen too. A card that rests on its END picture is not that picture while it
     builds: its build pauses between slices only while the card is AWAY_VIEWPORTS away from the
     screen (`away`: where it was when its build started, against the scroll position, no layout
     read), and from the scroll that brings it closer (`approach`) what is left is done at once.
     Within that distance the build is one piece, as it always was. */
  let builtAt = { top: 0, bottom: 0 };
  const away = () => {
    const vh = window.innerHeight;
    const y = window.scrollY;
    return builtAt.top - y > vh * (1 + AWAY_VIEWPORTS) || builtAt.bottom - y < -vh * AWAY_VIEWPORTS;
  };
  const approach = () => {
    if (!away()) advance(true);
  };
  /** One slice of the build, or with `through` all that is left. True once nothing is left
      (built, failed, or the card cannot be built now). */
  const advance = (through: boolean): boolean => {
    if (disposed || tl || failed || !runtime || !laidOut()) return true;
    try {
      if (!run) {
        run = startBuild(runtime, stage, o.restIsEnd);
        ctx = run.ctx;
        if (o.restIsEnd) {
          const r = host.getBoundingClientRect();
          builtAt = { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
          approachSubs.add(approach);
        }
      }
      const built = run.next(through || (o.restIsEnd && !away()));
      if (!built) return false;
      tl = built.tl;
      cleanupDom = built.cleanup;
      cue = Math.min(Math.max(built.cue ?? 0, 0), tl.duration());
      loopFrom = Math.min(Math.max(built.loop ?? cue, 0), tl.duration());
      nextRound = built.next;
      firstEnd = o.loop && loopFrom > cue ? loopFrom : tl.duration();
      if (o.speed && o.speed !== 1) tl.timeScale(o.speed);
      if (firstEnd < tl.duration()) {
        // an opening, then the round: past the opening the take is going round
        tl.eventCallback("onUpdate", () => {
          if (!looping && !ending && phase === "playing" && tl && tl.time() >= firstEnd) enterLoop();
        });
      }
      tl.eventCallback("onComplete", () => {
        if (o.loop && !ending && !motionMq.matches && !disposed && tl) {
          // a round has played through: the next one after the hold, if the card is looked at
          enterLoop();
          const again = () => {
            loopTimer = 0;
            if (disposed || motionMq.matches) return;
            if (near && inView()) startRound();
            else roundOwed = true;
          };
          if (o.loop.hold > 0) loopTimer = window.setTimeout(again, o.loop.hold * 1000);
          else again();
          return;
        }
        phase = "done";
        host.dataset.lpAnim = "done";
      });
      if (motionMq.matches) {
        tl.progress(1, true);
        host.dataset.lpAnim = "still";
      } else if (o.restIsEnd && seen(false)) {
        // never empty what is already on screen: keep the picture
        tl.progress(1, true);
        phase = "done";
        host.dataset.lpAnim = "done";
        owed = o.playWhenStopped === true;
      } else {
        toRest();
      }
      const w = window as unknown as Record<string, Record<string, Timeline> | undefined>;
      w[o.qa.registry] = { ...w[o.qa.registry], [o.qa.key]: tl };
    } catch (err) {
      // never a broken card: the server-rendered stage stands as a still
      failed = true;
      host.dataset.lpAnim = "static";
      if (process.env.NODE_ENV !== "production") console.error(err);
    }
    approachSubs.delete(approach);
    decide();
    // built: its section goes back to skipping its rendering while it is far away
    releaseSection?.();
    releaseSection = null;
    return true;
  };
  /* The card's section skips its rendering (content-visibility: auto), so the card cannot be
     measured: the section is rendered ahead of time, in an idle slot of its own, and the build
     follows in a later one. Asked once: a section that cannot be held (it is not below the
     screen) renders by itself as it nears, and `onRendered` builds the card then. */
  const renderSection = () => {
    const root = o.layoutRoot;
    if (!root || askedSection) return;
    askedSection = true;
    enqueueBuild(() => {
      if (disposed || tl || failed) return;
      releaseSection = holdRendered(root);
      if (releaseSection && laidOut()) requestBuild(near || visible);
    }, root);
  };
  const requestBuild = (urgent: boolean) => {
    if (disposed || tl || failed || !runtime) return;
    if (!laidOut()) return renderSection();
    if (urgent) {
      advance(true);
    } else if (!queued) {
      queued = true;
      enqueueBuild(() => {
        const more = !advance(false);
        if (!more) queued = false;
        return more;
      }, host);
    }
  };
  const prepare = () => {
    if (runtime) return requestBuild(near || visible);
    if (loading || disposed) return;
    // reduced motion over a picture that is already the end: nothing to fetch
    if (o.restIsEnd && motionMq.matches) return;
    loading = true;
    void o.load().then((loaded) => {
      if (disposed) return;
      runtime = loaded;
      requestBuild(near || visible);
    }).catch((err) => {
      if (disposed) return;
      releaseSection?.();
      releaseSection = null;
      host.dataset.lpAnim = "static";
      if (process.env.NODE_ENV !== "production") console.error(err);
    });
  };

  const last = (entries: IntersectionObserverEntry[]) => entries[entries.length - 1];
  // a viewport ahead: on a phone page still untouched at its top this waits for the first input
  let ahead = false;
  let cancelAhead = () => {};
  const nearIo = new IntersectionObserver(
    (entries) => {
      ahead = last(entries).isIntersecting;
      cancelAhead();
      cancelAhead = ahead
        ? whenTouched(() => {
            if (ahead && !disposed) prepare();
          })
        : () => {};
    },
    { rootMargin: PREPARE_MARGIN },
  );
  nearIo.observe(o.layoutRoot ?? host);
  // ahead of time: from the visitor's first input, wherever the card is on the page. Reduced
  // motion keeps the rule above (a card that needs its timeline fetches it a viewport ahead).
  const cancelEager = whenInput(() => {
    if (!disposed && !motionMq.matches) prepare();
  });
  const cueIo = new IntersectionObserver(
    (entries) => {
      near = last(entries).isIntersecting;
      if (near) prepare();
      decide();
    },
    { rootMargin: CUE_MARGIN },
  );
  cueIo.observe(host);
  const focusIo = new IntersectionObserver(
    (entries) => {
      focused = last(entries).isIntersecting;
      decide();
    },
    { rootMargin: FOCUS_MARGIN },
  );
  focusIo.observe(host);
  const viewIo = new IntersectionObserver(
    (entries) => {
      const e = last(entries);
      visible = e.isIntersecting;
      ratio = visible ? e.intersectionRatio : 0;
      if (visible) prepare();
      decide();
      // a tenth of the card already gone above the top edge
      if (visible && e.boundingClientRect.top < 0 && e.intersectionRatio < 0.9) rush();
    },
    { threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] },
  );
  viewIo.observe(host);

  // the section rendering its contents is when a card can be measured and built
  const onRendered = (e: Event) => {
    if ((e as Event & { skipped?: boolean }).skipped === false) requestBuild(near || visible);
  };
  o.layoutRoot?.addEventListener("contentvisibilityautostatechange", onRendered);

  const onMotion = () => {
    if (motionMq.matches) {
      clearTimeout(loopTimer);
      loopTimer = 0;
      if (tl) {
        tl.pause();
        tl.progress(1, true);
      }
      return;
    }
    // lifted mid-visit: a looping take starts a new round from its picture
    if (looping) roundOwed = true;
    // lifted mid-visit: a card that has not finished may play its build-up
    if (!tl) return prepare();
    if (phase === "rest" || phase === "cued") toRest();
    decide();
  };
  motionMq.addEventListener("change", onMotion);

  return () => {
    disposed = true;
    clearTimeout(dwell);
    clearTimeout(owedTimer);
    clearTimeout(loopTimer);
    settleSubs.delete(onSettle);
    cancelAhead();
    cancelEager();
    releaseSection?.();
    releaseSection = null;
    unwarm();
    nearIo.disconnect();
    cueIo.disconnect();
    focusIo.disconnect();
    viewIo.disconnect();
    ro.disconnect();
    untrack();
    o.layoutRoot?.removeEventListener("contentvisibilityautostatechange", onRendered);
    motionMq.removeEventListener("change", onMotion);
    approachSubs.delete(approach);
    // a build under way is finished first: the builder's cleanup comes with what it returns
    if (run && !tl && !failed) {
      try {
        cleanupDom = run.next(true)?.cleanup;
      } catch {
        // half built: the revert below is all there is
      }
    }
    ctx?.revert();
    cleanupDom?.();
    const w = window as unknown as Record<string, Record<string, Timeline> | undefined>;
    delete w[o.qa.registry]?.[o.qa.key];
    delete host.dataset.lpAnim;
    delete host.dataset.lpFit;
    host.style.removeProperty("--lp-fit");
  };
}
