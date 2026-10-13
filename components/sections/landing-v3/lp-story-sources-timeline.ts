import { gsap } from "@/lib/gsap";

import type { BuiltStory, DiveStageLayout } from "./lp-dive-stages";

/**
 * Deep-dive story "Sources you can trust" — its build-up as ONE paused, seek-safe GSAP timeline
 * on the stage root. Storyboard of 2026-10-11 (Figma 4964:1287 / 5024:7457 / 5024:7601 /
 * 5024:8172; spec specs/updates/sources-v2.md §8). Owner: story-sources package. Contract:
 * lp-dive-stages.ts and code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts
 * it), sets and tweens only (no callbacks, no randomness), progress(1) = the server markup,
 * `cue` = the first composed scene. Reached only through DIVE_LOADERS.sources
 * (lp-dive-loaders.ts, lazy chunk).
 *
 * No "use client" on purpose (2026-10-09): Next makes every "use client" module a server graph
 * reaches, even through an import(), an EAGER client entry. As a plain module this builder is
 * fetched only when the carousel approaches with motion allowed, never under reduced motion.
 *
 * Designer note 4964:1650: "Leads show up / Click on one / Lead details open / Zoom into 'Why
 * they fit' with top data sources appearing". Paced to be READ (founder 2026-10-13: the first
 * take, 4.85 s, went by too fast): every scene lands, then holds. Times (s), the T table below:
 *
 *   0.10–1.19  scene A: the table lands, then its rows (stagger 0.08)
 *   0.55       cue: the title, the table and four rows — composed, never empty
 *   1.25       f1: the frame 1 picture, every row in. It HOLDS 1.35 s
 *   2.60–3.35  scene B: the hand glides onto the picked row (clear of the lead's name); the
 *              row takes the hover tint as it arrives
 *   3.45       f2: the frame 2 picture, the hand on the tinted row
 *   3.65–3.90  the click: the hand presses, a pulse spreads under the fingertip, the row
 *              flashes darker and stays selected. Phones: no hand, the row itself presses
 *   3.85–4.73  scene C: the lead's details slide in over the dimmed Leads page (a solid sheet
 *              within 0.14 s, never a ghost the table reads through), head → grid → why →
 *              actions; the hand fades
 *   4.80       f3: the frame 3 picture (the shell's artboard pose seeks this label). It HOLDS
 *              1.7 s, so "Why they fit" can be read. = the END when no hub node renders
 *              (data-end="details")
 *   6.50–7.60  scene D, with data-end="sources" (production: every hub node is final): ONE
 *              move, the camera pushes ×3.89 into "Why they fit" while the Leads page fades
 *   7.20–7.75  the colour dots, then the label
 *   7.50–9.99  the data providers, ONE BY ONE: a white disc with the vendor's mark pops, its
 *              name fades in by it, its wire draws from the disc into the hub dot. The two
 *              behind this lead first (0.35 s apart), a beat, then the four others 0.28 s
 *              apart; the hub dot lands with the first wire
 *   9.99       f4: the frame 4 picture = the END with the hub (the carousel then holds it 2 s)
 *
 * Performance: force3D:false on the camera, so its zoom stays a 2D matrix (text re-rasterises
 * crisp at ×3.89, phones never hold a 1603×1836 composited layer); no will-change; the zoomed
 * paint is bounded by the stage clip. The wires' caps animate their `r` attribute, never a
 * transform (a CSS transform-origin on an SVG circle plus GSAP's own origin handling
 * double-shifted the dot).
 */

/** the take, in seconds (see the table above) */
const T = {
  table: 0.1,
  rows: 0.2,
  rowGap: 0.08,
  f1: 1.25,
  /** the hand shows and starts its glide: 1.35 s after the last row has landed */
  hand: 2.6,
  glide: 0.75,
  f2: 3.45,
  click: 3.65,
  /** the panel starts to open, as the hand lifts */
  open: 3.85,
  f3: 4.8,
  /** scene D starts: the frame 3 picture has held 1.7 s */
  zoom: 6.5,
  zoomS: 1.1,
  /** the first provider, as the camera settles */
  first: 7.5,
  /** each provider's start after the first: the two behind this lead, a beat, the other four */
  reveal: [0, 0.35, 0.85, 1.13, 1.41, 1.69],
} as const;
/** the picked row's tints: hovered, pressed, selected (black at these alphas) */
const ROW = {
  none: "rgba(0, 0, 0, 0)",
  hover: "rgba(0, 0, 0, 0.04)",
  press: "rgba(0, 0, 0, 0.1)",
  selected: "rgba(0, 0, 0, 0.06)",
} as const;
/** the wires' cap and hub-dot radius (Figma connector caps) */
const CAP_R = 5.333;
/** a hub element drops its inline transform this long after its tween ends (never on the same
    float as the tween's last render) */
const LANDED = 0.01;

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
  const phone = layoutOf(root) === "phone";
  const hubOn = root.dataset.end === "sources";
  const { $, $$ } = query(root);

  const cam = $(".lp-src-cam");
  const leads = $(".lp-src-leads");
  const table = $(".lp-src-table");
  const rows = $$(".lp-src-row");
  const picked = $(".lp-src-row[data-picked]");
  // phones: the hand is display:none, the picked row presses instead
  const cursor = phone ? null : root.querySelector<HTMLElement>(".lp-src-cursor");
  const cursorSvg = cursor?.querySelector("svg") ?? null;
  const pulse = cursor?.querySelector<HTMLElement>(".lp-src-pulse") ?? null;
  const panel = $(".lp-src-panel");
  const parts = [$(".lp-src-phead"), $(".lp-src-grid"), $(".lp-src-why"), $(".lp-src-acts")];
  const rules = $$(".lp-src-rule");

  /* ── frame 0 (the markup rests on the end picture) ── */
  gsap.set(leads, { autoAlpha: 1 });
  // the camera only moves in scene D. force3D:false must outlive every seek: the camera is never
  // in a clearProps (that resets GSAP's cached force3D to "auto", and the shell seeks back from
  // progress(1) before it plays), so its zoom stays a 2D matrix and the text stays crisp
  if (hubOn) gsap.set(cam, { scale: 1, force3D: false });
  gsap.set(table, { autoAlpha: 0, y: 8 });
  gsap.set(rows, { autoAlpha: 0, y: 6 });
  gsap.set(picked, { backgroundColor: ROW.none });
  if (cursor) gsap.set(cursor, { autoAlpha: 0, x: 96, y: 78 });
  if (pulse) gsap.set(pulse, { autoAlpha: 0, scale: 0.2 });
  gsap.set(panel, { autoAlpha: 0, x: phone ? 0 : 40, y: phone ? 60 : 0 });
  gsap.set([...parts, ...rules], { autoAlpha: 0 });
  gsap.set(parts, { y: 6 });

  const tl = gsap.timeline({ paused: true });

  /* ── scene A: leads show up, then hold ── */
  tl.to(table, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power4.out" }, T.table);
  rows.forEach((row, i) =>
    tl.to(row, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power4.out" }, T.rows + T.rowGap * i),
  );

  /* ── scene B: click on one ── */
  const press = (target: Element, depth: number) =>
    tl.to(
      target,
      {
        keyframes: [
          { scale: depth, duration: 0.09, ease: "power1.out" },
          { scale: 1, duration: 0.16, ease: "power2.out" },
        ],
      },
      T.click,
    );
  if (cursor && cursorSvg) {
    tl.to(cursor, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, T.hand);
    tl.to(cursor, { x: 0, y: 0, duration: T.glide, ease: "power2.inOut" }, T.hand);
    // the row answers the hand as it arrives
    tl.to(picked, { backgroundColor: ROW.hover, duration: 0.15, ease: "power1.out" }, T.hand + T.glide - 0.15);
    press(cursorSvg, 0.86);
    if (pulse) {
      tl.to(pulse, { autoAlpha: 1, duration: 0.08, ease: "none" }, T.click + 0.05);
      tl.to(pulse, { scale: 1, duration: 0.45, ease: "power2.out" }, T.click + 0.05);
      tl.to(pulse, { autoAlpha: 0, duration: 0.3, ease: "power1.in" }, T.click + 0.2);
    }
    tl.to(cursor, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, T.open + 0.15);
  } else {
    press(picked, 0.985);
  }
  // the click is seen on the row: it flashes darker, then stays selected while its panel is open
  tl.to(picked, { backgroundColor: ROW.press, duration: 0.09, ease: "power1.out" }, T.click);
  tl.to(picked, { backgroundColor: ROW.selected, duration: 0.3, ease: "power1.out" }, T.click + 0.09);

  /* ── scene C: lead details open, then hold ── */
  // solid almost at once: a sheet sliding in, never a ghost the table reads through
  tl.to(panel, { autoAlpha: 1, duration: 0.14, ease: "power1.out" }, T.open);
  tl.to(panel, { x: 0, y: 0, duration: 0.55, ease: "power3.out" }, T.open);
  tl.to(leads, { opacity: 0.5, duration: 0.45, ease: "power1.out" }, T.open);
  tl.to(rules, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, T.open + 0.12);
  parts.forEach((part, i) =>
    tl.to(part, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, T.open + 0.12 + 0.12 * i),
  );

  /* Each element drops the transform its tweens leave inline (translate(0px, 0px), scale(1, 1))
     as soon as it has landed, here for scenes A–C: Gecko snaps text inside a transformed box
     differently, so progress(1) would sit off the server markup in Firefox, and under the ×3.89
     camera that snap is a visible 2 px jump if it waits for the last instant. Seek-safe: a
     cleared transform IS the identity, and any seek back re-renders the tweens it crosses.
     The camera is the exception (see frame 0): its end scale is the stylesheet's rest scale. */
  const landed: Element[] = [table, ...rows, panel, ...parts, picked];
  if (cursor && cursorSvg) landed.push(cursor, cursorSvg);
  if (pulse) landed.push(pulse);
  tl.set(landed, { clearProps: "transform" }, tl.duration() + LANDED);

  /* QA labels = the storyboard's frames (the shell's artboard pose seeks "f3", the frame the V2
     and mobile artboards draw in the carousel; a label past the end clamps to the end) */
  tl.addLabel("f1", T.f1).addLabel("f2", T.f2).addLabel("f3", T.f3);

  /* ── scene D: zoom into "Why they fit"; the data providers appear one by one (only when a
     hub node renders) ── */
  if (hubOn) {
    // discs in reveal order (data-order); a disc's wire and name share its data-node
    const nodes = $$(".lp-src-node").sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    const sources = nodes.map((node) => {
      const g = root.querySelector<SVGGElement>(`.lp-src-wires g[data-node="${node.dataset.node}"]`);
      const cap = g?.querySelector<SVGCircleElement>("circle") ?? null;
      const path = g?.querySelector<SVGPathElement>("path") ?? null;
      const name = root.querySelector<HTMLElement>(`.lp-src-nname[data-node="${node.dataset.node}"]`);
      // +1: the full stroke shows at offset 0 whatever the length's rounding
      return { node, name, cap, path, len: path ? path.getTotalLength() + 1 : 0 };
    });
    const dots = $$(".lp-src-dot");
    const hubdot = $<SVGCircleElement>(".lp-src-hubdot");
    const label = root.querySelector<HTMLElement>(".lp-src-hublabel"); // absent when no label renders
    // one source for the desktop and phone compositions: the stylesheet (story-sources.css)
    const camScale = parseFloat(getComputedStyle(root).getPropertyValue("--src-cam-s")) || 1;

    gsap.set(nodes, { autoAlpha: 0, scale: 0.6 });
    gsap.set(dots, { autoAlpha: 0, scale: 0 });
    sources.forEach(({ name, cap, path, len }) => {
      if (name) gsap.set(name, { autoAlpha: 0, y: 4 });
      // opacity 0: a zero-length dash would still paint a speck at the path's start
      if (path) gsap.set(path, { opacity: 0, strokeDasharray: len, strokeDashoffset: len });
      if (cap) gsap.set(cap, { attr: { r: 0 } });
    });
    gsap.set(hubdot, { attr: { r: 0 } });
    if (label) gsap.set(label, { autoAlpha: 0, y: 4 });

    // one move: the camera, while the Leads page clears out of its way
    tl.to(cam, { scale: camScale, duration: T.zoomS, ease: "power2.inOut" }, T.zoom);
    tl.to(leads, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, T.zoom);
    tl.set(picked, { backgroundColor: ROW.none }, T.zoom + 0.3 + LANDED); // unseen: back to the markup

    dots.forEach((dot, k) => {
      const at = T.first - 0.3 + 0.05 * k;
      tl.to(dot, { autoAlpha: 1, duration: 0.1, ease: "power1.out" }, at);
      tl.to(dot, { scale: 1, duration: 0.35, ease: "back.out(2)" }, at);
      tl.set(dot, { clearProps: "transform" }, at + 0.35 + LANDED);
    });
    if (label) {
      tl.to(label, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, T.first - 0.1);
      tl.set(label, { clearProps: "transform" }, T.first + 0.2 + LANDED);
    }

    sources.forEach(({ node, name, cap, path }, k) => {
      const at = T.first + (T.reveal[k] ?? T.reveal[T.reveal.length - 1] + 0.28 * (k - T.reveal.length + 1));
      tl.to(node, { autoAlpha: 1, duration: 0.18, ease: "power1.out" }, at);
      tl.to(node, { scale: 1, duration: 0.45, ease: "back.out(1.6)" }, at);
      tl.set(node, { clearProps: "transform" }, at + 0.45 + LANDED);
      if (name) {
        tl.to(name, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, at + 0.12);
        tl.set(name, { clearProps: "transform" }, at + 0.42 + LANDED);
      }
      if (cap && path) {
        const draw = at + 0.2;
        tl.to(cap, { attr: { r: CAP_R }, duration: 0.15, ease: "back.out(2)" }, draw);
        tl.set(path, { opacity: 1 }, draw + 0.02); // the cap covers the first 0.02 s of the draw
        tl.to(path, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, draw);
      }
    });
    // as the first wire lands
    tl.to(hubdot, { attr: { r: CAP_R }, duration: 0.25, ease: "back.out(2.5)" }, T.first + 0.2 + 0.6 - 0.1);
    tl.addLabel("f4", tl.duration());
  }

  return { tl, cleanup: () => {}, cue: 0.55 };
}
