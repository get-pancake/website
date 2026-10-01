"use client";

import type { gsap } from "@/lib/gsap";

/**
 * The play-once driver behind the homepage's animated mock UIs: the four
 * feature cards (LpFeatAnim) and the three step cards (LpStepAnim). One
 * seek-safe GSAP timeline per card, built on the card's stage.
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
 * - PREPARE one viewport ahead (above or below): the timeline code is
 *   fetched, and the timeline built as soon as the card is laid out
 *   (a content-visibility:auto section skips its subtree's layout, so the
 *   build waits for the section to be rendered — f2 measures its glyphs).
 *   Builds queue one per frame, so phones never take one long task. Until
 *   then, and while it waits far away, the card is the server-rendered
 *   picture (restIsEnd — the feature cards) or its own first frame (steps).
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
 * - LEAVING THROUGH THE TOP while unfinished fast-forwards it to the picture
 *   (~0.35 s): the part still on screen is the card's lower half, which the
 *   build-ups fill last. Gone after it played: it finishes, so a visitor who
 *   comes back finds the picture, never a half-built card. Cued but never
 *   reached: back to rest, unseen.
 * - NEVER EMPTY WHAT IS ON SCREEN: a card that is already on screen in its
 *   resting picture (reload mid-page, an anchor, the code arriving late,
 *   scrolling back up into it) keeps it. Reduced motion keeps it too,
 *   without downloading any animation code.
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
/** cue: the timeline time of the card's first scene (0 = its first frame) */
type Built = { tl: Timeline; cleanup: () => void; cue?: number };
export type PlayOnceRuntime = {
  gsap: typeof import("@/lib/gsap").gsap;
  build: (stage: HTMLElement) => Built;
};

export type PlayOnceOptions = {
  /** the card: observed, carries data-lp-anim / data-lp-fit / --lp-fit */
  host: HTMLElement;
  /** the timeline's root */
  stage: HTMLElement;
  /** the stage's design width in px (560 feature zone, 464 step card) */
  designWidth: number;
  /** fetches GSAP + the card's builder (kept out of the initial bundle, PR #283) */
  load: () => Promise<PlayOnceRuntime>;
  /** the server-rendered stage is the end picture (true) or the first frame (false) */
  restIsEnd: boolean;
  /** QA hook: window[registry][key] = the timeline (seek it to any moment) */
  qa: { registry: "__lpFeat" | "__lpStep"; key: string };
  /** content-visibility:auto ancestor: prepare when IT nears the viewport
      (a skipped subtree reports no intersections), build once it renders */
  layoutRoot?: HTMLElement | null;
  /** playback rate (timeline time stays the composition's for QA seeks) */
  speed?: number;
};

/** px per ms: faster than this when a card arrives = flying past it */
const FAST_SCROLL = 2.5;
/** prepare this far ahead of the viewport, above and below */
const PREPARE_MARGIN = "100% 0px 100% 0px";
/** switch to the first scene this far below the fold (unseen) */
const CUE_MARGIN = "0px 0px 15% 0px";
/** play once the card's top is above this share of the viewport height */
const FOCUS_MARGIN = "0px 0px -40% 0px"; // the top 60 %
/** half the card on screen this long, short of the focus line (scrolling stopped): play */
const DWELL_MS = 1000;
const DWELL_MIN_RATIO = 0.5;
/** leaving through the top unfinished: the rest of the build-up plays in this long */
const RUSH_S = 0.35;

/* ── scroll speed: recent scroll positions (one passive listener) ── */
const samples: { t: number; y: number }[] = [];
let speedUsers = 0;
const onScroll = () => {
  const t = performance.now();
  samples.push({ t, y: window.scrollY });
  while (samples.length > 2 && t - samples[0].t > 500) samples.shift();
};
function trackScroll(): () => void {
  if (speedUsers++ === 0) window.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    if (--speedUsers === 0) {
      window.removeEventListener("scroll", onScroll);
      samples.length = 0;
    }
  };
}
/** px per ms over the last 150 ms; Infinity for a jump (one scroll event of
    half a viewport or more: a flick, Page Down, an anchor); 0 when idle */
function scrollSpeed(): number {
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

/* ── builds: one per animation frame, so four cards never make one long task ── */
const buildQueue: (() => void)[] = [];
let pumping = false;
function pump() {
  buildQueue.shift()?.();
  if (buildQueue.length) requestAnimationFrame(pump);
  else pumping = false;
}
function enqueueBuild(run: () => void) {
  buildQueue.push(run);
  if (!pumping) {
    pumping = true;
    requestAnimationFrame(pump);
  }
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
  let loading = false;
  let queued = false;
  let runtime: PlayOnceRuntime | undefined;
  let tl: Timeline | undefined;
  let ctx: gsap.Context | undefined;
  let cleanupDom: (() => void) | undefined;

  const onScreen = () => {
    const r = host.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  // A content-visibility:auto ancestor that skips its contents gives them no
  // geometry: build only once it renders them (f2 measures glyph rects).
  const laidOut = () => {
    if (!o.layoutRoot) return true;
    const check = (stage as HTMLElement & {
      checkVisibility?: (opts: { contentVisibilityAuto: boolean }) => boolean;
    }).checkVisibility;
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
    tl.progress(1);
    phase = "done";
    host.dataset.lpAnim = "done";
  };
  // the visitor is moving on while the card is still building: fast-forward
  const rush = () => {
    if (!tl || phase !== "playing" || motionMq.matches || !tl.isActive()) return;
    const left = tl.duration() - tl.time();
    if (left > 0) tl.timeScale(Math.max(tl.timeScale(), left / RUSH_S));
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
    if (phase === "done") return;
    const fast = scrollSpeed() > FAST_SCROLL;
    if (phase === "rest") {
      if (!near) return; // far away: keep resting
      // flying past, or already showing its picture on screen (built late,
      // entering from above): the picture, never a frame that empties
      if (fast || (o.restIsEnd && visible)) return finish();
      toCue(); // still below the fold: the first scene, unseen
    }
    if (phase === "cued") {
      if (!near) return toRest(); // went away before reaching it: unseen
      if (focused) return fast ? finish() : play();
      if (visible && ratio >= DWELL_MIN_RATIO) {
        // half on screen but short of the focus line: a visitor who stopped
        dwell = window.setTimeout(() => {
          dwell = 0;
          if (phase === "cued" && visible && ratio >= DWELL_MIN_RATIO && !motionMq.matches) play();
        }, DWELL_MS);
      }
      return;
    }
    // playing: carry on while it can still be seen; gone, it finishes
    if (near) tl.play();
    else finish();
  };

  const build = () => {
    if (disposed || ctx || !runtime || !laidOut()) return;
    const { gsap: g, build: buildTimeline } = runtime;
    ctx = g.context(() => {
      try {
        const built = buildTimeline(stage);
        tl = built.tl;
        cleanupDom = built.cleanup;
        cue = Math.min(Math.max(built.cue ?? 0, 0), tl.duration());
        if (o.speed && o.speed !== 1) tl.timeScale(o.speed);
        tl.eventCallback("onComplete", () => {
          phase = "done";
          host.dataset.lpAnim = "done";
        });
        if (motionMq.matches) {
          tl.progress(1, true);
          host.dataset.lpAnim = "still";
        } else if (o.restIsEnd && onScreen()) {
          // never empty what is already on screen: keep the picture
          tl.progress(1, true);
          phase = "done";
          host.dataset.lpAnim = "done";
        } else {
          toRest();
        }
        const w = window as unknown as Record<string, Record<string, Timeline> | undefined>;
        w[o.qa.registry] = { ...w[o.qa.registry], [o.qa.key]: tl };
      } catch (err) {
        // never a broken card: the server-rendered stage stands as a still
        host.dataset.lpAnim = "static";
        if (process.env.NODE_ENV !== "production") console.error(err);
      }
    }, stage);
    decide();
  };
  const requestBuild = (urgent: boolean) => {
    if (disposed || ctx || !runtime || !laidOut()) return;
    if (urgent) {
      build();
    } else if (!queued) {
      queued = true;
      enqueueBuild(() => {
        queued = false;
        build();
      });
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
      host.dataset.lpAnim = "static";
      if (process.env.NODE_ENV !== "production") console.error(err);
    });
  };

  const last = (entries: IntersectionObserverEntry[]) => entries[entries.length - 1];
  const nearIo = new IntersectionObserver(
    (entries) => {
      if (last(entries).isIntersecting) prepare();
    },
    { rootMargin: PREPARE_MARGIN },
  );
  nearIo.observe(o.layoutRoot ?? host);
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
      if (tl) {
        tl.pause();
        tl.progress(1, true);
      }
      return;
    }
    // lifted mid-visit: a card that has not finished may play its build-up
    if (!tl) return prepare();
    if (phase === "rest" || phase === "cued") toRest();
    decide();
  };
  motionMq.addEventListener("change", onMotion);

  return () => {
    disposed = true;
    clearTimeout(dwell);
    nearIo.disconnect();
    cueIo.disconnect();
    focusIo.disconnect();
    viewIo.disconnect();
    ro.disconnect();
    untrack();
    o.layoutRoot?.removeEventListener("contentvisibilityautostatechange", onRendered);
    motionMq.removeEventListener("change", onMotion);
    ctx?.revert();
    cleanupDom?.();
    const w = window as unknown as Record<string, Record<string, Timeline> | undefined>;
    delete w[o.qa.registry]?.[o.qa.key];
    delete host.dataset.lpAnim;
    delete host.dataset.lpFit;
    host.style.removeProperty("--lp-fit");
  };
}
