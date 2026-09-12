"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * /agents — Super knowledge: the ROUTER DEMO's engine (founder 2026-09-11 on
 * the preview: the flat 4×4 wall of tiles was rejected — "je veux qu'on soit
 * plus créatifs pour intégrer ce composant intelligemment"). The sixteen tiles
 * are the SOURCES behind the lede's "one call": an agent's request pops in on
 * the left, Pancake ("one call") routes it, and the one source that answers
 * lights up on the right; a few seconds later the next request routes to
 * another source. Mobbin references: Apollo's integrations marketplace (a
 * central mark wired to its providers by circuit traces), Perplexity's model
 * orchestration (one hub, many small tiles, only the chosen path drawn) and
 * Lattice's integrations wall (a grid where the connected tiles light up).
 *
 * The markup is static copy rendered by the server component (AgKnowledge)
 * and passed in as children — none of it ships as client code (README rule
 * 7). This wrapper drives it imperatively (classes, inline transforms, the
 * two SVG legs and dots); knowledge.css owns every colour, easing and
 * keyframe. Nothing here is React state: the loop must not re-render sixteen
 * tiles four times a second.
 *
 * ONE REQUEST (≈4s, six requests = a 24s loop):
 *   0        the request row jumps to the active slot and its bubble pops
 *            (opacity 0→1, y 10→0, scale .96→1, 320ms back.out); the
 *            previous requests slide up one slot (320ms) and fade — a short
 *            history, never a hover dim; the previous route (legs, lit tile,
 *            result line) retires over 150ms.
 *   0.40     leg 1 is drawn (bubble edge → hub ring) and dot A travels it
 *            (420ms ease-in-out); on arrival it fades into the ring and the
 *            mascot hops (the request is taken in).
 *   0.92     leg 2 is drawn (ring → the tile's edge, through the grid's
 *            gutters — never across a tile) and dot B travels it (420ms).
 *   1.34     the dot lands ON the tile's edge: the tile lights (2px ring,
 *            label 600, its illustration hops once) and the result line
 *            fades in under the bubble ("→ Email addresses · cheapest of 4
 *            providers"). Hold 2.66s, then the next request.
 *
 * Geometry is measured live (getBoundingClientRect at each step, redrawn on
 * any resize through a ResizeObserver), so the same code draws the desktop
 * row (bubble → hub → tile, left to right, the traces running along the
 * middle row gutter and the target column's gutter) and the stacked layouts
 * (bubble → hub → tile, top to bottom, down the middle column gutter and
 * along the target row's gutter).
 *
 * Play state: runs while ≥25 % of the stage is on screen (IntersectionObserver)
 * and the tab is visible; off-screen it PAUSES (timers cleared) and resumes
 * the current phase on return — a clean restart of the leg in flight, never a
 * half-drawn route. prefers-reduced-motion (live): the first request shown
 * routed and static — bubble, both legs, lit tile, result — no dot, no loop.
 * SSR / no JS: that same first state minus the legs (they need layout).
 *
 * Stage height is constant: the tile grid sets the row layout's height, and
 * in the stacked layouts the requests box gets a fixed height from the
 * measured bubbles (the tallest N + gaps + the result reserve).
 *
 * QA hook: window.__agKnowledge = { go(i), pause(), play(), state() }.
 */

/* ── choreography (ms) ── */
const ARRIVE_MS = 400; // the bubble pops, then the dot leaves it
const TRAVEL_MS = 420; // one leg, ease-in-out
const HUB_BEAT_MS = 100; // Pancake holds the request for a beat (the hop) before the call goes out
const HOLD_MS = 2660; // lit tile + result line → 4.0s per request
const POP_MS = 320; // knowledge.css ag-knowledge-pop
const HOP_MS = 320; // knowledge.css ag-knowledge-hop
const ROW_GAP = 8; // between stacked request bubbles
const CORNER = 5; // trace elbow radius — fits inside a 12px gutter
const PLAY_RATIO = 0.25;

const ON = "is-on";
const LANDED = "is-landed";
const POP = "is-pop";
const HOP = "is-hop";

type Phase = "arrive" | "leg1" | "leg2" | "landed";
type Pt = readonly [number, number];
type Box = { left: number; right: number; top: number; bottom: number; cx: number; cy: number };

/** An element's box in the overlay's coordinates (the SVG covers the stage). */
function boxOf(el: Element, origin: DOMRect): Box {
  const r = el.getBoundingClientRect();
  const left = r.left - origin.left;
  const top = r.top - origin.top;
  return { left, right: left + r.width, top, bottom: top + r.height, cx: left + r.width / 2, cy: top + r.height / 2 };
}

const px = (v: number) => v.toFixed(1);

/** An orthogonal polyline as an SVG path with rounded elbows; repeated and
    collinear points are dropped so a straight route is one segment. */
function tracePath(points: Pt[], radius: number): string {
  const p: Pt[] = [];
  for (const q of points) {
    const last = p[p.length - 1];
    if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) > 0.5) p.push(q);
  }
  for (let i = p.length - 2; i > 0; i--) {
    const a = p[i - 1]!;
    const b = p[i]!;
    const c = p[i + 1]!;
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(cross) < 0.5) p.splice(i, 1);
  }
  if (p.length < 2) return "";
  const first = p[0]!;
  let d = `M${px(first[0])} ${px(first[1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1]!;
    const b = p[i]!;
    const c = p[i + 1]!;
    const inL = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const outL = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const r = Math.min(radius, inL / 2, outL / 2);
    const ux = (b[0] - a[0]) / inL;
    const uy = (b[1] - a[1]) / inL;
    const vx = (c[0] - b[0]) / outL;
    const vy = (c[1] - b[1]) / outL;
    d += ` L${px(b[0] - ux * r)} ${px(b[1] - uy * r)} Q${px(b[0])} ${px(b[1])} ${px(b[0] + vx * r)} ${px(b[1] + vy * r)}`;
  }
  const last = p[p.length - 1]!;
  d += ` L${px(last[0])} ${px(last[1])}`;
  return d;
}

/** Leg 1: the active bubble → the hub ring. Row layout: from the bubble's
    right edge, level with the ring (both are centred on the stage's middle;
    an elbow at the gap's midpoint covers any residual offset). Stacked: from
    the bubble's bottom edge straight down into the ring's top. */
function leg1Points(b: Box, h: Box, stacked: boolean): Pt[] {
  if (!stacked) {
    if (Math.abs(b.cy - h.cy) < 1.5) {
      const y = (b.cy + h.cy) / 2;
      return [
        [b.right, y],
        [h.left, y],
      ];
    }
    const mx = (b.right + h.left) / 2;
    return [
      [b.right, b.cy],
      [mx, b.cy],
      [mx, h.cy],
      [h.left, h.cy],
    ];
  }
  if (Math.abs(b.cx - h.cx) < 1.5) {
    const x = (b.cx + h.cx) / 2;
    return [
      [x, b.bottom],
      [x, h.top],
    ];
  }
  const my = (b.bottom + h.top) / 2;
  return [
    [b.cx, b.bottom],
    [b.cx, my],
    [h.cx, my],
    [h.cx, h.top],
  ];
}

/** Leg 2: the hub ring → the target tile, through the gutters. The hub is
    centred on the grid, and a 4×4 grid's centre is the middle of its middle
    gutter, so the trace runs along that gutter and turns into the target's
    own gutter (row layout: the row gutter then the column gutter, landing on
    the tile's left edge; stacked: the column gutter then the row gutter,
    landing on the tile's top edge). Column 0 / row 0 tiles use the hub gap. */
function leg2Points(h: Box, all: Box[], idx: number, cols: number, stacked: boolean): Pt[] {
  const t = all[idx]!;
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  if (!stacked) {
    const y = h.cy;
    const leftEdge = col === 0 ? h.right : all[idx - 1]!.right;
    const gx = (leftEdge + t.left) / 2;
    if (Math.abs(t.cy - y) < 1.5) {
      return [
        [h.right, y],
        [t.left, y],
      ];
    }
    return [
      [h.right, y],
      [gx, y],
      [gx, t.cy],
      [t.left, t.cy],
    ];
  }
  const x = h.cx;
  const topEdge = row === 0 ? h.bottom : all[idx - cols]!.bottom;
  const gy = (topEdge + t.top) / 2;
  if (Math.abs(t.cx - x) < 1.5) {
    return [
      [x, h.bottom],
      [x, t.top],
    ];
  }
  return [
    [x, h.bottom],
    [x, gy],
    [t.cx, gy],
    [t.cx, t.top],
  ];
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** element → end-now callback of its running one-shot animation */
const running = new WeakMap<HTMLElement, () => void>();

/** Play a one-shot CSS animation class once (a run already going is restarted);
    the class leaves on animationend, with a timeout fallback for throttled tabs. */
function once(el: HTMLElement, cls: string, ms: number) {
  running.get(el)?.();
  let timer = 0;
  const end = () => {
    window.clearTimeout(timer);
    el.removeEventListener("animationend", end);
    el.classList.remove(cls);
    running.delete(el);
  };
  running.set(el, end);
  el.addEventListener("animationend", end);
  timer = window.setTimeout(end, ms + 80);
  // a same-frame re-add would not restart the animation: reflow in between
  void el.offsetWidth;
  el.classList.add(cls);
}

type Api = {
  go: (i: number) => void;
  pause: () => void;
  play: () => void;
  state: () => { index: number; phase: Phase; running: boolean };
};

function mount(stage: HTMLElement): () => void {
  const reqs = stage.querySelector<HTMLElement>(".ag-knowledge__reqs");
  const ring = stage.querySelector<HTMLElement>(".ag-knowledge__hub-ring");
  const mascot = stage.querySelector<HTMLElement>(".ag-knowledge__mascot");
  const grid = stage.querySelector<HTMLElement>(".ag-knowledge__tiles");
  const svg = stage.querySelector<SVGSVGElement>(".ag-knowledge__route");
  const legs = Array.from(stage.querySelectorAll<SVGPathElement>(".ag-knowledge__leg"));
  const dots = Array.from(stage.querySelectorAll<SVGCircleElement>(".ag-knowledge__dot"));
  const isEl = (el: Element): el is HTMLElement => el instanceof HTMLElement;
  if (!reqs || !ring || !mascot || !grid || !svg || legs.length < 2 || dots.length < 2) return () => {};
  const rows = Array.from(reqs.children).filter(isEl);
  const tiles = Array.from(grid.children).filter(isEl);
  const bubbles: HTMLElement[] = [];
  const results: HTMLElement[] = [];
  for (const row of rows) {
    const bubble = row.querySelector<HTMLElement>(".ag-knowledge__bubble");
    const result = row.querySelector<HTMLElement>(".ag-knowledge__result");
    if (!bubble || !result) return () => {};
    bubbles.push(bubble);
    results.push(result);
  }
  const n = rows.length;
  if (n === 0 || tiles.length === 0) return () => {};
  const leg1 = legs[0]!;
  const leg2 = legs[1]!;
  const dotA = dots[0]!;
  const dotB = dots[1]!;
  const tileOf = (i: number) => tiles.find((t) => t.dataset.slug === rows[i]?.dataset.source) ?? tiles[0]!;
  const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const w = window as unknown as { __agKnowledge?: Api };

  let index = 0; // the SSR state: the first request, routed
  let phase: Phase = "landed";
  let running = false;
  let inView = false;
  let observed = false;
  let timer = 0;
  let raf = 0;
  let roRaf = 0;

  /* the hub sits right of the requests column in the row layout, under it when stacked */
  const stacked = () => ring.getBoundingClientRect().left < reqs.getBoundingClientRect().right - 1;

  /* Slots: the active row sits at slot 0 (centred on the stage's middle in
     the row layout — the CSS fallback translateY(50%) is the same pose for
     SSR — or at the bottom of the requests box, above the result reserve,
     when stacked); the previous requests stack above it, cyclically, 8px
     apart. Also the stage's two reserves, from the measured rows. */
  const layout = () => {
    const depth = Math.max(1, parseInt(getComputedStyle(stage).getPropertyValue("--ag-k-hist"), 10) || 4);
    const stack = stacked();
    const heights = rows.map((r) => r.offsetHeight);
    let y = stack ? 0 : heights[index]! / 2;
    for (let k = 0; k < n; k++) {
      const i = (index - k + n) % n;
      rows[i]!.dataset.slot = String(-k);
      rows[i]!.style.transform = `translateY(${y.toFixed(2)}px)`;
      y -= heights[i]! + ROW_GAP;
    }
    const reserve = ROW_GAP + Math.max(...results.map((r) => r.offsetHeight));
    const tallest = [...heights].sort((a, b) => b - a).slice(0, depth);
    const boxH = tallest.reduce((s, h) => s + h, 0) + (depth - 1) * ROW_GAP + reserve;
    stage.style.setProperty("--ag-k-res", `${reserve}px`);
    stage.style.setProperty("--ag-k-req-h", `${boxH}px`);
  };

  const draw = (which: 1 | 2): SVGPathElement => {
    const origin = svg.getBoundingClientRect();
    const stack = stacked();
    const h = boxOf(ring, origin);
    if (which === 1) {
      leg1.setAttribute("d", tracePath(leg1Points(boxOf(bubbles[index]!, origin), h, stack), CORNER));
      leg1.classList.add(ON);
      return leg1;
    }
    const all = tiles.map((t) => boxOf(t, origin));
    const cols = all.filter((b) => Math.abs(b.top - all[0]!.top) < 1).length || 1;
    leg2.setAttribute("d", tracePath(leg2Points(h, all, tiles.indexOf(tileOf(index)), cols, stack), CORNER));
    leg2.classList.add(ON);
    return leg2;
  };

  const place = (dot: SVGCircleElement, path: SVGPathElement, at: number) => {
    const pt = path.getPointAtLength(at);
    dot.setAttribute("cx", px(pt.x));
    dot.setAttribute("cy", px(pt.y));
  };

  /* the dot rides the path (sampled every frame, so a mid-flight resize that
     redraws the leg is followed), ease-in-out over TRAVEL_MS */
  const travel = (dot: SVGCircleElement, path: SVGPathElement, done: () => void) => {
    const total = path.getTotalLength();
    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / TRAVEL_MS);
      place(dot, path, total * easeInOut(p));
      if (p < 1) raf = window.requestAnimationFrame(frame);
      else done();
    };
    raf = window.requestAnimationFrame(frame);
  };

  const stop = () => {
    window.clearTimeout(timer);
    window.cancelAnimationFrame(raf);
  };

  /* the current route goes: result line, lit tile, legs and dots fade (150ms) */
  const retire = () => {
    results[index]!.classList.remove(LANDED);
    tileOf(index).classList.remove(ON);
    leg1.classList.remove(ON);
    leg2.classList.remove(ON);
    dotA.classList.remove(ON);
    dotB.classList.remove(ON);
  };

  /* the landed state (idempotent): both legs drawn, dots gone, tile lit,
     result shown; `fresh` = the dot just landed, so the illustration hops */
  const land = (fresh: boolean) => {
    draw(1);
    draw(2);
    dotA.classList.remove(ON);
    dotB.classList.remove(ON);
    const tile = tileOf(index);
    tile.classList.add(ON);
    results[index]!.classList.add(LANDED);
    if (fresh) {
      const hop = tile.querySelector<HTMLElement>(".ag-knowledge__hop");
      if (hop) once(hop, HOP, HOP_MS);
    }
  };

  const run = (p: Phase, fresh = false) => {
    phase = p;
    stop();
    if (p === "arrive") {
      timer = window.setTimeout(() => run("leg1"), ARRIVE_MS);
      return;
    }
    if (p === "leg1") {
      const path = draw(1);
      dotB.classList.remove(ON);
      place(dotA, path, 0);
      dotA.classList.add(ON);
      travel(dotA, path, () => {
        dotA.classList.remove(ON); // taken in by Pancake
        once(mascot, HOP, HOP_MS);
        timer = window.setTimeout(() => run("leg2"), HUB_BEAT_MS);
      });
      return;
    }
    if (p === "leg2") {
      draw(1); // resume-safe: leg 1 stays on
      const path = draw(2);
      place(dotB, path, 0);
      dotB.classList.add(ON);
      travel(dotB, path, () => run("landed", true));
      return;
    }
    land(fresh);
    timer = window.setTimeout(() => advance((index + 1) % n), HOLD_MS);
  };

  /* the next request: the previous route retires, the rows re-slot (the
     arriving row jumps, without a transition, from wherever it was to slot
     0, then its bubble pops; the others slide up one slot) */
  const advance = (i: number) => {
    stop();
    retire();
    index = i;
    const row = rows[i]!;
    row.style.transition = "none";
    row.dataset.arrived = "";
    layout();
    void row.offsetHeight;
    row.style.transition = "";
    once(bubbles[i]!, POP, POP_MS);
    run("arrive");
  };

  const sync = () => {
    const should = observed && inView && !motionMq.matches && !document.hidden;
    if (should === running) return;
    running = should;
    if (should) run(phase);
    else stop();
  };

  /* reduced motion: the current request, routed and static */
  const still = () => {
    stage.dataset.play = "still";
    stop();
    running = false;
    phase = "landed";
    land(false);
  };
  const onMotion = () => {
    if (motionMq.matches) still();
    else {
      stage.dataset.play = "live";
      sync();
    }
  };

  /* any resize (viewport, font swap changing a bubble's height): re-slot
     without sliding, redraw whatever is drawn */
  const relayout = () => {
    roRaf = 0;
    stage.dataset.resizing = "";
    layout();
    if (phase !== "arrive") {
      draw(1);
      if (phase !== "leg1") draw(2);
    }
    void stage.offsetHeight;
    delete stage.dataset.resizing;
  };
  const ro = new ResizeObserver(() => {
    if (!roRaf) roRaf = window.requestAnimationFrame(relayout);
  });

  const io = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      if (!e) return;
      inView = e.isIntersecting && e.intersectionRatio >= PLAY_RATIO - 1e-3;
      if (!observed) {
        observed = true;
        // not on screen yet: un-route the first request, so the first thing
        // a visitor sees is the dot leaving the bubble (a visitor already at
        // the stage keeps the landed state and the loop starts from its hold)
        if (!e.isIntersecting && !motionMq.matches) {
          retire();
          phase = "arrive";
        }
      }
      sync();
    },
    { threshold: [0, PLAY_RATIO] },
  );

  // take over from the SSR stylesheet state in one task: same pose, no flash
  results[0]!.classList.add(LANDED);
  tileOf(0).classList.add(ON);
  stage.dataset.resizing = "";
  layout();
  void stage.offsetHeight;
  delete stage.dataset.resizing;
  stage.dataset.play = "live";
  if (motionMq.matches) still();

  ro.observe(stage);
  ro.observe(grid);
  rows.forEach((r) => ro.observe(r));
  io.observe(stage);
  motionMq.addEventListener("change", onMotion);
  document.addEventListener("visibilitychange", sync);

  w.__agKnowledge = {
    go: (i) => {
      advance(((i % n) + n) % n);
      if (!running) stop();
    },
    pause: () => {
      running = false;
      stop();
    },
    play: () => {
      running = false;
      sync();
    },
    state: () => ({ index, phase, running }),
  };

  return () => {
    stop();
    window.cancelAnimationFrame(roRaf);
    io.disconnect();
    ro.disconnect();
    motionMq.removeEventListener("change", onMotion);
    document.removeEventListener("visibilitychange", sync);
    delete w.__agKnowledge;
    stage.dataset.play = "ssr";
  };
}

export function AgKnowledgeRouter({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    return mount(stage);
  }, []);
  return (
    <div ref={stageRef} className="ag-card ag-knowledge__stage" data-play="ssr">
      {children}
    </div>
  );
}
