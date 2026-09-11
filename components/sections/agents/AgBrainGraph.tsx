"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { BRAIN } from "./ag-copy";
import { useInView, useReducedMotion } from "./useInView";

/**
 * /agents — the GTM brain card (right column of AgBrain). Two renders of the
 * same graph, one DOM box:
 *
 * 1. STATIC (SSR / no JS / reduced motion): the draft's `brain-static.svg`
 *    drawing — 8 hubs r13 with their leaves r6, root "Pancake" r16 plum bold,
 *    hairline edges, the `bdrift` 7s sway per hub group (brain.css) — with
 *    the draft's Fono labels and hex fills swapped for Geist + tokens. Two
 *    variants are SSR'd and CSS picks one: the draft's 860×600 geometry, and
 *    a phone one (600×600, labels 27 units UNDER the hubs) so labels render
 *    ≥11px on a 320 phone's 256px-wide svg where the draft's 15-unit labels
 *    would be 6px. Both are integer constants: the phone layout is the settled
 *    state of the live simulation below, baked once in Node — the
 *    simulation itself is never run during render (Math.hypot / Math.sin
 *    can differ across engines by an ulp → hydration mismatch risk).
 *
 * 2. LIVE (JS ran, motion allowed): the draft's "live GTM brain" force graph,
 *    ported 1:1 from draft-scripts.js — seeded LCG (11), hubs from
 *    BRAIN.hubs on a ring 150–190 from the root, leaves 55–85 from their hub,
 *    400 settle steps at alpha 1 then alpha .25 per frame with the sinusoidal
 *    jitter, hub breathing (±6 % at 1.6 rad/s), five blue-40 signal dots
 *    running along random edges, a leaf spawned every 2.6 s (cap 90 nodes)
 *    with a ripple ring on its hub. Attributes are written imperatively on
 *    SVG elements React does not manage (the live <svg> is rendered empty
 *    and filled in a layout effect — 60 fps × 90 nodes is not a React
 *    reconciliation job). The rAF loop runs only while the card intersects
 *    (useInView, the draft's 200px rootMargin) and is torn down under a
 *    mid-visit reduced-motion flip (the statics come back).
 *
 * Fonts: labels read in Geist via brain.css (`.ag-brain__svg text`) — the
 * kit's `* { font-family }` rule would otherwise beat inheritance. Colors:
 * `var(--lp-*)` inline styles only (SVG presentation attributes are not a
 * safe home for var() in every engine).
 */

type Geo = {
  /** viewBox */
  w: number;
  h: number;
  /** root position */
  cx: number;
  cy: number;
  /** hub ring / leaf / spawned-leaf distances: base + rnd() × spread */
  ring: [number, number];
  leaf: [number, number];
  spawn: [number, number];
  /** a spawned leaf starts this far from its hub and springs out */
  spawnAt: number;
  rootR: number;
  hubR: number;
  leafR: [number, number];
  /** signal dot radius; ripple ring r = ripple[0] + t × ripple[1] */
  sigR: number;
  ripple: [number, number];
  /** soft walls [x0, x1, y0, y1] — the draft leaves 140 units of label room on the right */
  bounds: [number, number, number, number];
  /** label placement: the draft's `x + r + 8` to the right, or centred under the node (phones) */
  labels: "right" | "below";
  /** label font size in viewBox units — mirrors brain.css (used for the "below" offset) */
  font: number;
  /** the static drawing's node sizes (draft: hubs r13, leaves r6 at .7) */
  staticHubR: number;
  staticLeafOpacity: number;
};

/** the draft's geometry, verbatim (860×600 box, labels to the right) */
const WIDE: Geo = {
  w: 860,
  h: 600,
  cx: 430,
  cy: 300,
  ring: [150, 40],
  leaf: [55, 30],
  spawn: [50, 35],
  spawnAt: 14,
  rootR: 16,
  hubR: 12,
  leafR: [4, 2.5],
  sigR: 2.6,
  ripple: [12, 30],
  bounds: [40, 720, 30, 570],
  labels: "right",
  font: 15,
  staticHubR: 13,
  staticLeafOpacity: 0.7,
};
/** phones (≤767): a square box, a tighter ring, bigger nodes, 27-unit labels
    under the hubs (eight right-hand labels at that size collide on a 600-wide
    ring — the top and bottom pairs run across each other's hub). 27 = 11.5px
    on a 320 viewport's 256px svg (README floor ≥11; 24 rendered 10.2). */
const COMPACT: Geo = {
  w: 600,
  h: 600,
  cx: 300,
  cy: 300,
  ring: [140, 25],
  leaf: [48, 24],
  spawn: [44, 28],
  spawnAt: 16,
  rootR: 20,
  hubR: 15,
  leafR: [5, 3],
  sigR: 3.4,
  ripple: [15, 36],
  bounds: [40, 560, 30, 560],
  labels: "below",
  font: 27,
  staticHubR: 15,
  staticLeafOpacity: 0.75,
};
/** the phone breakpoint of the page (foundation.css) — the CSS shows the
    compact static at the same query, so both renders agree */
const COMPACT_MQ = "(max-width: 767px)";

/* ── static drawings: [hub x, hub y, leaves [x, y, r][]] in BRAIN.hubs order ── */
type StaticHub = { x: number; y: number; leaves: readonly (readonly [number, number, number])[] };

/** draft-assets/brain-static.svg, coordinates verbatim (three leaves per hub, r6) */
const WIDE_STATIC: readonly StaticHub[] = [
  { x: 300, y: 170, leaves: [[231, 178, 6], [326, 114, 6], [343, 218, 6]] },
  { x: 470, y: 120, leaves: [[469, 60, 6], [531, 150, 6], [409, 150, 6]] },
  { x: 640, y: 150, leaves: [[710, 157, 6], [598, 198, 6], [613, 95, 6]] },
  { x: 700, y: 300, leaves: [[753, 339, 6], [634, 319, 6], [714, 241, 6]] },
  { x: 640, y: 440, leaves: [[710, 447, 6], [598, 488, 6], [613, 385, 6]] },
  { x: 300, y: 430, leaves: [[231, 438, 6], [326, 374, 6], [343, 478, 6]] },
  { x: 160, y: 300, leaves: [[158, 360, 6], [101, 268, 6], [222, 272, 6]] },
  { x: 470, y: 470, leaves: [[469, 410, 6], [531, 500, 6], [409, 500, 6]] },
];
/** the COMPACT simulation after its 400 settle steps (seed 11), rounded —
    i.e. exactly the frame the live graph opens on, so the swap is invisible */
const COMPACT_STATIC: readonly StaticHub[] = [
  { x: 322, y: 142, leaves: [[357, 200, 6.6], [285, 190, 7.1], [280, 81, 6.1], [373, 95, 6.7]] },
  { x: 444, y: 189, leaves: [[520, 184, 5], [463, 132, 6.8]] },
  { x: 461, y: 296, leaves: [[398, 297, 5.5], [543, 321, 7.4], [511, 264, 7.9]] },
  { x: 427, y: 404, leaves: [[497, 436, 6.5], [435, 482, 6.3], [476, 373, 5.2]] },
  { x: 301, y: 462, leaves: [[351, 420, 5.5], [285, 403, 7.9], [249, 501, 7.6], [336, 521, 5.8]] },
  { x: 182, y: 410, leaves: [[116, 419, 7.5], [157, 476, 5.7], [213, 357, 7.3]] },
  { x: 127, y: 316, leaves: [[64, 287, 7.4], [157, 264, 7.3], [70, 352, 5.8]] },
  { x: 173, y: 188, leaves: [[224, 238, 7.4], [118, 134, 6.1], [195, 130, 6.5], [95, 200, 7.5]] },
];

const tone = (name: string) => `var(--lp-${name})`;

/** where a node's label sits (shared by the static JSX and the live loop) */
function labelAt(geo: Geo, x: number, y: number, r: number) {
  return geo.labels === "below"
    ? { x, y: y + r + 6 + geo.font / 2, anchor: "middle" as const }
    : { x: x + r + 8, y, anchor: "start" as const };
}

const ARIA_LABEL = `Diagram of the Pancake GTM brain: a Pancake node linked to ${BRAIN.hubs
  .map((h) => h[0])
  .join(", ")}, each with its own memories.`;

/* ── the static drawing ── */
function StaticBrain({ variant }: { variant: "wide" | "compact" }) {
  const geo = variant === "compact" ? COMPACT : WIDE;
  const hubs = variant === "compact" ? COMPACT_STATIC : WIDE_STATIC;
  const root = labelAt(geo, geo.cx, geo.cy, geo.rootR);
  return (
    <svg
      className={`ag-brain__svg ag-brain__svg--${variant}`}
      data-variant={variant}
      viewBox={`0 0 ${geo.w} ${geo.h}`}
      aria-hidden="true"
    >
      <g className="ag-brain__edges ag-brain__edges--static">
        {hubs.map((h, i) => (
          <g key={i}>
            <line x1={geo.cx} y1={geo.cy} x2={h.x} y2={h.y} />
            {h.leaves.map(([x, y], k) => (
              <line key={k} x1={h.x} y1={h.y} x2={x} y2={y} />
            ))}
          </g>
        ))}
      </g>
      {hubs.map((h, i) => {
        const [label, color] = BRAIN.hubs[i]!;
        const fill = { fill: tone(color) };
        const at = labelAt(geo, h.x, h.y, geo.staticHubR);
        return (
          /* the draft's per-group negative delay: 0, −1.3, −2.6 … so the
             eight groups sway out of phase */
          <g key={label} className="ag-brain__group" style={{ animationDelay: i ? `-${(i * 1.3).toFixed(1)}s` : "0s" }}>
            {h.leaves.map(([x, y, r], k) => (
              <circle key={k} cx={x} cy={y} r={r} fillOpacity={geo.staticLeafOpacity} style={fill} />
            ))}
            <circle cx={h.x} cy={h.y} r={geo.staticHubR} style={fill} />
            <text x={at.x} y={at.y} textAnchor={at.anchor} dominantBaseline="middle">
              {label}
            </text>
          </g>
        );
      })}
      <circle cx={geo.cx} cy={geo.cy} r={geo.rootR} style={{ fill: tone("ink-100") }} />
      <text x={root.x} y={root.y} textAnchor={root.anchor} dominantBaseline="middle" fontWeight={600}>
        {BRAIN.root}
      </text>
    </svg>
  );
}

/* ── the live force graph (draft-scripts.js "live GTM brain", ported) ── */
type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  tone: string;
  label?: string;
  fixed?: boolean;
  bold?: boolean;
  hub?: boolean;
  leaf?: boolean;
  phase: number;
  w: number;
  born?: number;
};
type Edge = { a: Node; b: Node; len: number };
type Sim = { start: () => void; stop: () => void; destroy: () => void };

const NS = "http://www.w3.org/2000/svg";

function createSim(svg: SVGSVGElement, geo: Geo): Sim {
  const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, String(attrs[k]));
    return n;
  };
  const set = (n: Element, k: string, v: number) => n.setAttribute(k, String(v));

  svg.replaceChildren();
  const gE = el("g", { class: "ag-brain__edges ag-brain__edges--live" });
  const gR = el("g", { class: "ag-brain__ripples" });
  const gN = el("g");
  const gS = el("g");
  const gL = el("g");
  svg.append(gE, gR, gN, gS, gL);

  /* the draft's seeded LCG — same seed, same call order → the same graph on every visit */
  let seed = 11;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const { cx, cy } = geo;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const root: Node = { x: cx, y: cy, vx: 0, vy: 0, r: geo.rootR, tone: "ink-100", label: BRAIN.root, fixed: true, bold: true, phase: 0, w: 0 };
  nodes.push(root);
  BRAIN.hubs.forEach((h, i) => {
    const ang = -Math.PI / 2 + i * ((Math.PI * 2) / BRAIN.hubs.length) + (rnd() - 0.5) * 0.3;
    const d = geo.ring[0] + rnd() * geo.ring[1];
    const hub: Node = { x: cx + Math.cos(ang) * d, y: cy + Math.sin(ang) * d, vx: 0, vy: 0, r: geo.hubR, tone: h[1], label: h[0], hub: true, phase: rnd() * 6.28, w: 0.4 + rnd() * 0.5 };
    nodes.push(hub);
    edges.push({ a: root, b: hub, len: d });
    for (let k = 0; k < h[2]; k++) {
      const a2 = ang + (rnd() - 0.5) * 2.4;
      const dd = geo.leaf[0] + rnd() * geo.leaf[1];
      const leaf: Node = { x: hub.x + Math.cos(a2) * dd, y: hub.y + Math.sin(a2) * dd, vx: 0, vy: 0, r: geo.leafR[0] + rnd() * geo.leafR[1], tone: h[1], leaf: true, phase: rnd() * 6.28, w: 0.5 + rnd() * 0.8 };
      nodes.push(leaf);
      edges.push({ a: hub, b: leaf, len: dd });
    }
  });

  const [x0, x1, y0, y1] = geo.bounds;
  /* one integration step: n-body repulsion (hubs repel hubs harder), a pull
     to the root, soft walls, the ambient sinusoidal jitter once time runs,
     edge springs, damping .82, speed cap 4 */
  function step(alpha: number, t?: number) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!;
      if (n.fixed) continue;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const m = nodes[j]!;
        const dx = n.x - m.x;
        const dy = n.y - m.y;
        const d2 = dx * dx + dy * dy + 30;
        const kf = (n.hub && m.hub ? 2600 : 700) / d2;
        const d = Math.sqrt(d2);
        n.vx += (dx / d) * kf * alpha;
        n.vy += (dy / d) * kf * alpha;
      }
      n.vx += (cx - n.x) * 0.001 * alpha;
      n.vy += (cy - n.y) * 0.0016 * alpha;
      if (n.x < x0) n.vx += (x0 - n.x) * 0.05;
      if (n.x > x1) n.vx -= (n.x - x1) * 0.05;
      if (n.y < y0) n.vy += (y0 - n.y) * 0.05;
      if (n.y > y1) n.vy -= (n.y - y1) * 0.05;
      if (t !== undefined) {
        n.vx += Math.sin(t * n.w + n.phase) * 0.035;
        n.vy += Math.cos(t * n.w * 0.8 + n.phase) * 0.035;
      }
    }
    edges.forEach((e) => {
      const dx = e.b.x - e.a.x;
      const dy = e.b.y - e.a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - e.len) * 0.02 * alpha;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      if (!e.a.fixed) {
        e.a.vx += fx;
        e.a.vy += fy;
      }
      if (!e.b.fixed) {
        e.b.vx -= fx;
        e.b.vy -= fy;
      }
    });
    nodes.forEach((n) => {
      if (n.fixed) return;
      n.vx *= 0.82;
      n.vy *= 0.82;
      const sp = Math.hypot(n.vx, n.vy);
      if (sp > 4) {
        n.vx *= 4 / sp;
        n.vy *= 4 / sp;
      }
      n.x += n.vx;
      n.y += n.vy;
    });
  }
  for (let i = 0; i < 400; i++) step(1);

  const E: SVGLineElement[] = edges.map(() => {
    const l = el("line");
    gE.appendChild(l);
    return l;
  });
  const N: SVGCircleElement[] = nodes.map((n) => {
    const c = el("circle", { r: n.r, "fill-opacity": n.leaf ? 0.75 : 1 });
    c.style.fill = tone(n.tone);
    gN.appendChild(c);
    return c;
  });
  const L: (SVGTextElement | null)[] = nodes.map((n) => {
    if (!n.label) return null;
    const tx = el("text", { "dominant-baseline": "middle" });
    if (geo.labels === "below") tx.setAttribute("text-anchor", "middle");
    if (n.bold) tx.setAttribute("font-weight", "600");
    tx.textContent = n.label;
    gL.appendChild(tx);
    return tx;
  });
  const placeLabel = (tx: SVGTextElement, n: Node) => {
    const at = labelAt(geo, n.x, n.y, n.r);
    set(tx, "x", at.x);
    set(tx, "y", at.y);
  };

  /* five signal dots, each running along a random edge at its own speed */
  const sig = Array.from({ length: 5 }, () => {
    const s = { e: edges[Math.floor(rnd() * edges.length)]!, t: rnd(), sp: 0.004 + rnd() * 0.005, el: el("circle", { r: geo.sigR }) };
    s.el.style.fill = tone("blue-40");
    gS.appendChild(s.el);
    return s;
  });
  const ripples: { el: SVGCircleElement; n: Node; t: number }[] = [];

  /* a new memory: a leaf grows out of a random hub (cap 90 nodes) with a ripple */
  function spawn() {
    if (nodes.length > 90) return;
    const hs = nodes.filter((n) => n.hub);
    const hub = hs[Math.floor(rnd() * hs.length)]!;
    const a2 = rnd() * 6.28;
    const dd = geo.spawn[0] + rnd() * geo.spawn[1];
    const leaf: Node = { x: hub.x + Math.cos(a2) * geo.spawnAt, y: hub.y + Math.sin(a2) * geo.spawnAt, vx: 0, vy: 0, r: geo.leafR[0] + rnd() * geo.leafR[1], tone: hub.tone, leaf: true, phase: rnd() * 6.28, w: 0.6, born: performance.now() };
    nodes.push(leaf);
    edges.push({ a: hub, b: leaf, len: dd });
    const l = el("line");
    gE.appendChild(l);
    E.push(l);
    const c = el("circle", { r: 0, "fill-opacity": 0.75 });
    c.style.fill = tone(leaf.tone);
    gN.appendChild(c);
    N.push(c);
    L.push(null);
    const rp = el("circle", { r: 4, "stroke-width": 1.5, "stroke-opacity": 0.8 });
    rp.style.stroke = tone(hub.tone);
    gR.appendChild(rp);
    ripples.push({ el: rp, n: hub, t: 0 });
  }

  let active = false;
  let last = 0;
  let t = 0;
  let acc = 0;
  let raf = 0;
  function frame(now: number) {
    if (!active) return;
    const dt = Math.min(40, now - last || 16);
    last = now;
    t += dt / 1000;
    acc += dt;
    step(0.25, t);
    E.forEach((l, i) => {
      const e = edges[i]!;
      set(l, "x1", e.a.x);
      set(l, "y1", e.a.y);
      set(l, "x2", e.b.x);
      set(l, "y2", e.b.y);
    });
    N.forEach((c, i) => {
      const n = nodes[i]!;
      set(c, "cx", n.x);
      set(c, "cy", n.y);
      let r = n.r;
      if (n.hub) r = n.r * (1 + 0.06 * Math.sin(t * 1.6 + n.phase)); // breathing
      if (n.born) {
        const k = Math.min(1, (now - n.born) / 600); // a spawned leaf eases in over 600ms
        r = n.r * (1 - Math.pow(1 - k, 3));
      }
      set(c, "r", r);
    });
    L.forEach((tx, i) => {
      if (tx) placeLabel(tx, nodes[i]!);
    });
    sig.forEach((s) => {
      s.t += (s.sp * dt) / 16;
      if (s.t >= 1) {
        s.t = 0;
        s.e = edges[Math.floor(Math.random() * edges.length)]!;
      }
      set(s.el, "cx", s.e.a.x + (s.e.b.x - s.e.a.x) * s.t);
      set(s.el, "cy", s.e.a.y + (s.e.b.y - s.e.a.y) * s.t);
    });
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i]!;
      rp.t += dt / 900;
      set(rp.el, "cx", rp.n.x);
      set(rp.el, "cy", rp.n.y);
      set(rp.el, "r", geo.ripple[0] + rp.t * geo.ripple[1]);
      set(rp.el, "stroke-opacity", Math.max(0, 0.8 * (1 - rp.t)));
      if (rp.t >= 1) {
        rp.el.remove();
        ripples.splice(i, 1);
      }
    }
    if (acc > 2600) {
      acc = 0;
      spawn();
    }
    raf = requestAnimationFrame(frame);
  }
  /* the settled frame, drawn once so the card is never empty while off-screen */
  E.forEach((l, i) => {
    const e = edges[i]!;
    set(l, "x1", e.a.x);
    set(l, "y1", e.a.y);
    set(l, "x2", e.b.x);
    set(l, "y2", e.b.y);
  });
  N.forEach((c, i) => {
    set(c, "cx", nodes[i]!.x);
    set(c, "cy", nodes[i]!.y);
  });
  L.forEach((tx, i) => {
    if (tx) placeLabel(tx, nodes[i]!);
  });

  return {
    start() {
      if (active) return;
      active = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      active = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      active = false;
      cancelAnimationFrame(raf);
      svg.replaceChildren();
    },
  };
}

export function AgBrainGraph() {
  /* the draft observes the svg with rootMargin 200px: the loop starts a
     little before the card scrolls in, and the same stamp (data-inview on
     the card) runs the static drawing's sway */
  const [cardRef, inView] = useInView<HTMLDivElement>({ rootMargin: "200px" });
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [compact, setCompact] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<Sim | null>(null);

  useEffect(() => setMounted(true), []);
  useLayoutEffect(() => {
    const mq = window.matchMedia(COMPACT_MQ);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const live = mounted && !reduced;
  const geo = compact ? COMPACT : WIDE;

  /* build (and rebuild across the phone breakpoint) — a layout effect so the
     live svg is painted in the same frame the static one leaves */
  useLayoutEffect(() => {
    if (!live) return;
    const svg = svgRef.current;
    if (!svg) return;
    const sim = createSim(svg, geo);
    simRef.current = sim;
    return () => {
      sim.destroy();
      simRef.current = null;
    };
  }, [live, geo]);

  /* the rAF loop: only while the card intersects */
  useEffect(() => {
    const sim = simRef.current;
    if (!sim || !live || !inView) return;
    sim.start();
    return () => sim.stop();
  }, [live, inView, geo]);

  return (
    <div ref={cardRef} className="ag-card ag-brain__card" role="img" aria-label={ARIA_LABEL}>
      {live ? (
        <svg
          key="live"
          ref={svgRef}
          className="ag-brain__svg ag-brain__svg--live"
          data-variant={compact ? "compact" : "wide"}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          aria-hidden="true"
        />
      ) : (
        <>
          <StaticBrain variant="wide" />
          <StaticBrain variant="compact" />
        </>
      )}
    </div>
  );
}
