import { gsap } from "@/lib/gsap";

import type { BuiltStory, DiveStageLayout } from "./lp-dive-stages";

/**
 * Deep-dive story "Sources you can trust" — its build-up as ONE paused, seek-safe GSAP timeline on the
 * stage root (Figma 4964:1287 / 1294 / 1311). Owner: story-sources package. Contract: lp-dive-stages.ts and
 * code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens
 * only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the first composed
 * scene. Reached only through DIVE_LOADERS.sources (lp-dive-loaders.ts, lazy chunk).
 *
 * No "use client" on purpose (2026-10-09): Next makes every "use client" module a server graph
 * reaches, even through an import(), an EAGER client entry — this builder shipped inside
 * app/page.js while the loaders sat in the server registry (they are in the client-only
 * lp-dive-loaders.ts since 2026-10-11). As a plain module it is fetched only when the carousel
 * approaches with motion allowed, never under reduced motion (verified on :3002).
 *
 * Designer note 4964:1650: "Leads show up / Dolly zoom into one / Lead properties get listed with
 * green ticks / (potential source DBs ?)". Times (s), spec story-sources §7 + decisions §6:
 *
 *   0.15–1.05  scene A: the table, then its three rows, land (frame 0 already shows "Leads")
 *   0.45       cue: the head, the table and Elena's row — composed, never empty
 *   1.05–1.84  the pointer glides to Elena's row and clicks; the row takes the selected tint
 *              (phones: no pointer, the row presses)
 *   1.88       the frame 1 picture (QA seek)
 *   1.90–2.10  the pointer fades after its click, before the zoom (decision §6)
 *   2.10–2.90  scene B, the dolly: the Leads page pushes ×5.9 into Elena's row and fades while her
 *              properties grow in, slower, in front (the parallax is the "dolly" feel)
 *   2.90       the frame 2 keyframe (QA seek)
 *   2.90–3.55  the properties settle on the white card at 1:1, the tick column opens
 *   3.55–4.39  scene C: a green tick lands on each property, row by row
 *   4.45–5.05  "Tags" and the seven sources
 *   4.85–5.15  Hiring, the source that found her, takes the highlight → production end
 *   4.90–5.82  preview only: the "source DB" circles pop and their wires draw to the card
 *
 * Performance (spec §7.2): force3D:false on the zoomed layer, the list and the card, so their
 * transforms stay 2D matrices (text re-rasterises crisp at ×5.9–×8, phones never hold a big GPU
 * layer); no will-change; the zoomed layer's paint is bounded by the stage clip.
 */

const K = 2.9; // the frame 2 keyframe: the dolly's crossing point

/** The dolly's geometry per composition (stage px, Figma relativeTransforms; story-sources spec §3.4).
    The phone numbers follow story-sources.css's 400×520 composition. */
const GEOM = {
  desktop: {
    /** the dolly's fixed point: on Elena's row, just right of her avatar (frame 1 → frame 2 derivation) */
    zoomOrigin: "165.114px 193.728px",
    /** frame 2 keyframe scale (3136.836 / 532) and the push-through scale */
    zoom: 5.896309,
    zoomEnd: 8,
    propsOrigin: "0 0",
    /** the property list as it emerges (tiny, behind the zoom) and at the frame 2 keyframe */
    propsFrom: { x: 152.717, y: 111.183, scale: 0.42 },
    propsKey: { x: 127.889, y: 98.0085, scale: 0.534944 },
    /** frame 2 has no tick column: values sit 49.87 px left (unscaled) */
    valsX: -49.87,
    /** per-row translateY (unscaled px) turning the card's 34.174 pitch into frame 2's even 18.645
        (scaled) pitch. Rows 3–5 carry +1.587 against the spec's table: the 1.6 px slip of Figma's
        frame 3 is evened out (decision §6), so frame 2 stays the same picture */
    dy: [0, 0.686, 1.365, 2.039, 2.724, 3.401, 4.086],
  },
  phone: {
    /** same point on Elena's row in the 400×520 phone composition (story-sources.css) */
    zoomOrigin: "75px 219.7px",
    zoom: 3,
    zoomEnd: 4.1,
    propsOrigin: "50% 50%",
    propsFrom: { x: 0, y: 0, scale: 0.45 },
    propsKey: { x: 0, y: 0, scale: 0.6 },
    /** tick 24 + gap 5 */
    valsX: -29,
    dy: [0, 0, 0, 0, 0, 0, 0],
  },
} as const;

/** Copied from lp-dive-stages.ts `diveStageLayout` (2026-10-09): importing it at runtime would pull
    the registry's four server Stage components and their copy into this lazy chunk (the carousel
    driver avoids the registry for the same reason). Keep the two in step. */
function layoutOf(root: HTMLElement): DiveStageLayout {
  const scene = root.closest<HTMLElement>("[data-lp-layout]");
  const declared = scene?.dataset.lpLayout;
  if (declared === "phone" || declared === "desktop") return declared;
  return (scene ?? root).offsetWidth < 600 ? "phone" : "desktop";
}

function query(root: HTMLElement) {
  return {
    $: <T extends Element = HTMLElement>(sel: string): T => {
      const el = root.querySelector<T>(sel);
      if (!el) throw new Error(`lp-story-sources: missing ${sel}`);
      return el;
    },
    $$: <T extends Element = HTMLElement>(sel: string): T[] => Array.from(root.querySelectorAll<T>(sel)),
  };
}

export function buildStorySources(root: HTMLElement): BuiltStory {
  const layout = layoutOf(root);
  const G = GEOM[layout];
  const desk = layout === "desktop";
  const { $, $$ } = query(root);

  const leads = $(".lp-src-leads");
  const table = $(".lp-src-table");
  const rows = $$(".lp-src-row");
  const cursor = desk ? root.querySelector<HTMLElement>(".lp-src-cursor") : null; // phones: display:none
  const cursorSvg = cursor?.querySelector("svg") ?? null;
  const card = $(".lp-src-card");
  const props = $(".lp-src-props");
  const propRows = $$(".lp-src-prop");
  const vals = $$(".lp-src-val");
  const ticks = $$(".lp-src-tick");
  const tagsK = $(".lp-src-tags > .lp-src-k");
  const tags = $$(".lp-src-tag");
  const matched = tags.filter((t) => t.hasAttribute("data-matched"));
  const quiet = tags.find((t) => !t.hasAttribute("data-matched"));
  // preview-only placeholders (none in production); hidden on phones
  const dbs = desk ? $$(".lp-src-db") : [];
  const wires = desk ? $$<SVGPathElement>(".lp-src-wires path") : [];
  // +1: the full stroke shows at offset 0 whatever the length's rounding
  const lens = wires.map((p) => p.getTotalLength() + 1);

  /* the highlight's two colours, read from the stylesheet before frame 0 is set
     (the markup rests on the end picture: the matched chip highlighted) */
  const hi = matched[0] ? getComputedStyle(matched[0]) : null;
  const lo = quiet ? getComputedStyle(quiet) : null;
  const hiBg = hi?.backgroundColor;
  const hiFg = hi?.color;
  const loBg = lo?.backgroundColor;
  const loFg = lo?.color;

  /* ── frame 0 (the markup rests on the end picture) ── */
  gsap.set(leads, { autoAlpha: 1, scale: 1, transformOrigin: G.zoomOrigin, force3D: false });
  gsap.set(table, { autoAlpha: 0, y: 6 });
  gsap.set(rows, { autoAlpha: 0, y: 6 });
  if (rows[0]) gsap.set(rows[0], { backgroundColor: "rgba(245, 243, 242, 0)" });
  if (cursor) gsap.set(cursor, { autoAlpha: 0, x: 150, y: 120 });
  gsap.set([card, props, tagsK, ...tags, ...dbs, ...ticks], { autoAlpha: 0 });
  gsap.set(props, { transformOrigin: G.propsOrigin, ...G.propsFrom, force3D: false });
  gsap.set(vals, { x: G.valsX });
  gsap.set(propRows, { y: (i: number) => G.dy[i] ?? 0 });
  gsap.set(ticks, { scale: 0.3 });
  gsap.set(card, { scale: 0.94, force3D: false });
  if (dbs.length) gsap.set(dbs, { scale: 0.6 });
  if (wires.length) {
    gsap.set(wires, {
      opacity: 0, // a round cap paints a dot at a zero-length dash
      strokeDasharray: (i: number) => lens[i],
      strokeDashoffset: (i: number) => lens[i],
    });
  }
  if (matched.length && loBg && loFg) gsap.set(matched, { backgroundColor: loBg, color: loFg });

  const tl = gsap.timeline({ paused: true });

  /* ── scene A: leads show up ── */
  tl.to(table, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power4.out" }, 0.15);
  rows.forEach((row, i) => tl.to(row, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power4.out" }, 0.15 + 0.3 * i));
  if (cursor && cursorSvg) {
    tl.to(cursor, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, 1.05);
    tl.to(cursor, { x: 0, y: 0, duration: 0.55, ease: "power2.inOut" }, 1.05);
    tl.to(
      cursorSvg,
      {
        keyframes: [
          { scale: 0.86, duration: 0.1, ease: "power1.out" },
          { scale: 1, duration: 0.12, ease: "power1.out" },
        ],
      },
      1.62,
    );
    // decision §6: the pointer leaves after its click, so the dolly never magnifies it
    tl.to(cursor, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, 1.9);
  } else if (rows[0]) {
    tl.to(
      rows[0],
      {
        keyframes: [
          { scale: 0.98, duration: 0.1, ease: "power1.out" },
          { scale: 1, duration: 0.14, ease: "power1.out" },
        ],
      },
      1.6,
    );
  }
  if (rows[0]) tl.to(rows[0], { backgroundColor: "rgba(245, 243, 242, 0.75)", duration: 0.2, ease: "power1.out" }, 1.66);

  /* ── scene B: the dolly zoom into the picked lead (t = K is the frame 2 keyframe) ── */
  tl.to(leads, { scale: G.zoom, duration: 0.8, ease: "power2.in" }, K - 0.8);
  tl.to(leads, { opacity: 0.32, duration: 0.8, ease: "power1.in" }, K - 0.8);
  tl.to(props, { autoAlpha: 0.32, ...G.propsKey, duration: 0.35, ease: "power1.in" }, K - 0.35);
  tl.to(leads, { scale: G.zoomEnd, duration: 0.4, ease: "power1.out" }, K);
  tl.to(leads, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, K);
  tl.to(props, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.65, ease: "power3.out" }, K);
  tl.to(vals, { x: 0, duration: 0.65, ease: "power3.out" }, K);
  tl.to(propRows, { y: 0, duration: 0.65, ease: "power3.out" }, K);
  tl.to(card, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" }, K + 0.1);

  /* ── scene C: green ticks row by row, then the tags ── */
  ticks.forEach((tick, i) => {
    const at = 3.55 + 0.14 * i;
    tl.to(tick, { scale: 1, duration: 0.3, ease: "back.out(2)" }, at);
    tl.to(tick, { autoAlpha: 1, duration: 0.1, ease: "power1.out" }, at);
  });
  tl.to(tagsK, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 4.45);
  tl.fromTo(
    tags,
    { y: 6 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out", stagger: 0.05, immediateRender: false },
    4.45,
  );
  // the source that found this lead lights up (decision §6: only the matched source is highlighted)
  if (matched.length && hiBg && hiFg) {
    tl.to(matched, { backgroundColor: hiBg, color: hiFg, duration: 0.3, ease: "power1.out" }, 4.85);
  }

  /* ── preview only: "potential source DBs ?" — circles clockwise from the top-left, each wire
     drawn from its circle to the card (markup order = reveal order, lp-story-sources-data.ts) ── */
  dbs.forEach((db, n) => tl.to(db, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }, 4.9 + 0.08 * n));
  wires.forEach((wire, n) => {
    tl.set(wire, { opacity: 1 }, 5.03 + 0.08 * n);
    tl.to(wire, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 5.0 + 0.08 * n);
  });

  /* the last instant drops the identity transforms the tweens leave inline (translate(0px, 0px)):
     Gecko snaps text inside a transformed box differently, so without this progress(1) sat
     0.46 % off the server markup in Firefox. Seek-safe: a cleared transform IS the identity, and
     any later seek back re-renders the tweens it crosses. */
  tl.set([card, props, ...propRows, ...vals, ...ticks, ...tags, ...dbs], { clearProps: "transform" }, tl.duration());

  return { tl, cleanup: () => {}, cue: 0.45 };
}
