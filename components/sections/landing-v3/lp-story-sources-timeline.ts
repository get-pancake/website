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
 * they fit' with top data sources appearing". Times (s):
 *
 *   0.10–1.00  scene A: the table lands, then its rows (stagger 0.06)
 *   0.50       cue: the title, the table and four rows — composed, never empty
 *   1.00       the frame 1 picture (QA seek)
 *   1.10–1.65  scene B: the hand glides onto the picked row; the row takes the hover tint
 *   1.70       the frame 2 picture (QA seek)
 *   1.75–2.10  the click (the hand presses, then fades). Phones: no hand, the row presses
 *   1.95–2.59  scene C: the lead's details slide in over the dimmed Leads page, head → grid →
 *              why → actions
 *   2.59       the frame 3 picture (QA seek 2.60) = the END when no hub node renders
 *              (data-end="details": production today)
 *   3.20–4.85  scene D, only with data-end="sources": the camera pushes ×3.89 into "Why they
 *              fit", the Leads page fades, the data-source discs pop top to bottom, the colour
 *              dots follow, each wire draws from its disc into the hub dot, the label lands
 *   4.85       the frame 4 picture = the END with the hub
 *
 * Performance: force3D:false on the camera, so its zoom stays a 2D matrix (text re-rasterises
 * crisp at ×3.89, phones never hold a 1603×1836 composited layer); no will-change; the zoomed
 * paint is bounded by the stage clip. The wires' caps animate their `r` attribute, never a
 * transform (a CSS transform-origin on an SVG circle plus GSAP's own origin handling
 * double-shifted the dot).
 */

/** scene D starts (the frame 3 picture holds 0.6 s first: reading time for the panel) */
const Z = 3.2;
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
  gsap.set(picked, { backgroundColor: "rgba(0, 0, 0, 0)" });
  if (cursor) gsap.set(cursor, { autoAlpha: 0, x: 110, y: 84 });
  gsap.set(panel, { autoAlpha: 0, x: phone ? 0 : 40, y: phone ? 60 : 0 });
  gsap.set([...parts, ...rules], { autoAlpha: 0 });
  gsap.set(parts, { y: 6 });

  const tl = gsap.timeline({ paused: true });

  /* ── scene A: leads show up ── */
  tl.to(table, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power4.out" }, 0.1);
  rows.forEach((row, i) => tl.to(row, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power4.out" }, 0.2 + 0.06 * i));

  /* ── scene B: click on one ── */
  const press = (target: Element, depth: number) =>
    tl.to(
      target,
      {
        keyframes: [
          { scale: depth, duration: 0.09, ease: "power1.out" },
          { scale: 1, duration: 0.12, ease: "power1.out" },
        ],
      },
      1.75,
    );
  if (cursor && cursorSvg) {
    tl.to(cursor, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, 1.1);
    tl.to(cursor, { x: 0, y: 0, duration: 0.55, ease: "power2.inOut" }, 1.1);
    press(cursorSvg, 0.88);
    tl.to(cursor, { autoAlpha: 0, duration: 0.15, ease: "power1.out" }, 1.95);
  } else {
    press(picked, 0.985);
  }
  tl.to(picked, { backgroundColor: "rgba(0, 0, 0, 0.04)", duration: 0.15, ease: "power1.out" }, 1.5);

  /* ── scene C: lead details open ── */
  tl.to(picked, { backgroundColor: "rgba(0, 0, 0, 0)", duration: 0.25, ease: "power1.out" }, 2.0);
  tl.to(panel, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 1.95);
  tl.to(panel, { x: 0, y: 0, duration: 0.5, ease: "power3.out" }, 1.95);
  tl.to(leads, { opacity: 0.5, duration: 0.4, ease: "power1.out" }, 1.95);
  tl.to(rules, { autoAlpha: 1, duration: 0.3, ease: "power1.out" }, 2.05);
  parts.forEach((part, i) => tl.to(part, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, 2.05 + 0.08 * i));

  /* Each element drops the transform its tweens leave inline (translate(0px, 0px), scale(1, 1))
     as soon as it has landed, here for scenes A–C: Gecko snaps text inside a transformed box
     differently, so progress(1) would sit off the server markup in Firefox, and under the ×3.89
     camera that snap is a visible 2 px jump if it waits for the last instant. Seek-safe: a
     cleared transform IS the identity, and any seek back re-renders the tweens it crosses.
     The camera is the exception (see frame 0): its end scale is the stylesheet's rest scale. */
  const landed: Element[] = [table, ...rows, panel, ...parts, picked];
  if (cursor && cursorSvg) landed.push(cursor, cursorSvg);
  tl.set(landed, { clearProps: "transform" }, tl.duration());

  /* QA labels = the storyboard's frames (the shell's artboard pose seeks "f3", the frame the V2
     and mobile artboards draw in the carousel; a label past the end clamps to the end) */
  tl.addLabel("f1", 1).addLabel("f2", 1.7).addLabel("f3", 2.6);

  /* ── scene D: zoom into "Why they fit"; the data sources appear (only when a hub node renders) ── */
  if (hubOn) {
    // discs in reveal order (data-order); a disc's wire shares its data-node
    const nodes = $$(".lp-src-node").sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    const wires = nodes.flatMap((node) => {
      const g = root.querySelector<SVGGElement>(`.lp-src-wires g[data-node="${node.dataset.node}"]`);
      const cap = g?.querySelector<SVGCircleElement>("circle");
      const path = g?.querySelector<SVGPathElement>("path");
      // +1: the full stroke shows at offset 0 whatever the length's rounding
      return cap && path ? [{ cap, path, len: path.getTotalLength() + 1 }] : [];
    });
    const dots = $$(".lp-src-dot");
    const hubdot = $<SVGCircleElement>(".lp-src-hubdot");
    const label = root.querySelector<HTMLElement>(".lp-src-hublabel"); // absent when no label renders
    // one source for the desktop and phone compositions: the stylesheet (story-sources.css)
    const camScale = parseFloat(getComputedStyle(root).getPropertyValue("--src-cam-s")) || 1;

    gsap.set(nodes, { autoAlpha: 0, scale: 0.6 });
    gsap.set(dots, { autoAlpha: 0, scale: 0 });
    wires.forEach((wire) => {
      // opacity 0: a zero-length dash would still paint a speck at the path's start
      gsap.set(wire.path, { opacity: 0, strokeDasharray: wire.len, strokeDashoffset: wire.len });
      gsap.set(wire.cap, { attr: { r: 0 } });
    });
    gsap.set(hubdot, { attr: { r: 0 } });
    if (label) gsap.set(label, { autoAlpha: 0, y: 4 });

    tl.to(cam, { scale: camScale, duration: 0.9, ease: "power3.inOut" }, Z);
    tl.to(leads, { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, Z);
    nodes.forEach((node, k) => {
      const at = Z + 0.5 + 0.06 * k;
      tl.to(node, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, at);
      tl.to(node, { scale: 1, duration: 0.4, ease: "back.out(1.6)" }, at);
      tl.set(node, { clearProps: "transform" }, at + 0.4 + LANDED);
    });
    dots.forEach((dot, k) => {
      const at = Z + 0.6 + 0.05 * k;
      tl.to(dot, { autoAlpha: 1, duration: 0.1, ease: "power1.out" }, at);
      tl.to(dot, { scale: 1, duration: 0.35, ease: "back.out(2)" }, at);
      tl.set(dot, { clearProps: "transform" }, at + 0.35 + LANDED);
    });
    wires.forEach((wire, k) => {
      const at = Z + 0.85 + 0.05 * k;
      tl.to(wire.cap, { attr: { r: CAP_R }, duration: 0.15, ease: "back.out(2)" }, at);
      tl.set(wire.path, { opacity: 1 }, at + 0.02); // the cap covers the first 0.02 s of the draw
      tl.to(wire.path, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, at);
    });
    if (label) {
      tl.to(label, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, Z + 1.1);
      tl.set(label, { clearProps: "transform" }, Z + 1.4 + LANDED);
    }
    // as the first wire lands
    tl.to(hubdot, { attr: { r: CAP_R }, duration: 0.25, ease: "back.out(2.5)" }, Z + 1.36);
    tl.addLabel("f4", tl.duration());
  }

  return { tl, cleanup: () => {}, cue: 0.5 };
}
