/**
 * Agents-view ASCII rainbow, animated (founder 2026-10-12: "let's animate this thing"). Owner:
 * agents-view package.
 *
 * Same logic as the humans rainbow: the six ring vectors LpPancakes renders rotate ±360° on the
 * 20 s master loop, and the ASCII is that rotating rainbow sampled one character per cell — which
 * is how the designer made the static node (lp-agents-ascii.ts: yellow → ":", pink / purple → "=",
 * blue → "*", green → "-", the page-coloured disc → blank). Nothing is re-derived: each ring's
 * layout box, pose matrix, spin direction and path are read from the DOM rings (they stay in the
 * tree, hidden, in the agents view), exactly as LpArcCanvas does for phones.
 *
 * One fill per ring into a scratch canvas of ONE PIXEL PER CELL (276×40 on desktop): the
 * rasteriser's coverage is then the area-majority rule for free. Rings are painted in ONE channel,
 * with codes spaced in band order (":" 0, "=" 85, "*" 170, "-" 255), so a cell two neighbouring
 * bands share averages to the one that covers more of it; alpha says ink or blank, and the cream
 * disc is painted with destination-out so it erases. About 0.2 ms a sample.
 *
 * FIT: the designer sampled his rainbow frame (Figma 4911:2621) a little smaller and lower than
 * the page's rings sit. Fitted on the 276×40 node at cycle 0 (scale, then offset, design px): the
 * sample then equals his characters on 98.3 % of the cells (93.9 % of the inked ones; the rest are
 * band edges one cell off and his "+" / "-" edge marks). Cycle 0 is therefore his picture.
 */

import { ASCII_PITCH } from "./lp-agents-ascii";

/** The Figma master loop the rings turn on (anim.css lp-anim-spin-*, LpRainbowGL LOOP_MS). */
export const ASCII_LOOP_MS = 20000;

/** Art design width the rings are laid out in (hero.css .lp-hero-art, anim.css). */
const DESIGN_W = 1654;
/** .lp-anim-box--hero inside the art (anim.css): left / top. */
const BOX_X = -435;
const BOX_Y = -61.65;
/** The ASCII node's top inside the art (audience-agents.css .lp-agents-ascii) and its 40 rows. */
const NODE_TOP = 172.354;
const NODE_HEIGHT = 40 * ASCII_PITCH;
/** Least-squares fit of the sample to the designer's node at cycle 0 (see the header). */
const FIT = { scale: 0.974, x: -27, y: 30 };

/** Band order, outermost first: the code step in the red channel. */
const GLYPHS = [":", "=", "*", "-"] as const;
const CODE_STEP = 255 / (GLYPHS.length - 1);
const RING_CODE: Record<string, number> = { yellow: 0, pink: 1, purple: 1, blue: 2, green: 3 };

interface Ring {
  /** glyph index, or −1 for the page-coloured disc (erases) */
  code: number;
  /** ring centre in art design px */
  cx: number;
  cy: number;
  /** static pose matrix (a, b, c, d) */
  pose: [number, number, number, number];
  dir: 1 | -1;
  /** half the ring's own canvas */
  hw: number;
  hh: number;
  path: Path2D;
}

export interface AsciiSpin {
  /** The grid at a cycle fraction (0 = the designer's picture), as `rows` strings of `cols`. */
  sample(cols: number, rows: number, cycle: number): string[];
}

/**
 * Reads the hero rings under `art` (.lp-hero-art). Null when they are not there or not readable:
 * the caller then keeps the static grid.
 */
export function readAsciiSpin(art: HTMLElement): AsciiSpin | null {
  const box = art.querySelector<HTMLElement>(".lp-anim-box--hero");
  if (!box || typeof Path2D === "undefined") return null;
  const rings: Ring[] = [];
  for (const arc of Array.from(box.querySelectorAll<HTMLElement>(".lp-anim-arc"))) {
    const pose = arc.querySelector<HTMLElement>(".lp-anim-pose");
    const spin = arc.querySelector<HTMLElement>(".lp-anim-spin");
    const d = arc.querySelector("path")?.getAttribute("d");
    const name = arc.dataset.lpRing ?? "";
    const matrix = pose?.style.transform.match(/matrix\(([^)]+)\)/)?.[1].split(",").map(Number);
    if (!pose || !spin || !d || !matrix || matrix.length < 4 || matrix.some(Number.isNaN)) return null;
    const code = name === "cream" ? -1 : RING_CODE[name];
    if (code === undefined) return null;
    const left = parseFloat(arc.style.left);
    const top = parseFloat(arc.style.top);
    const width = parseFloat(arc.style.width);
    const height = parseFloat(arc.style.height);
    const iw = parseFloat(pose.style.width);
    const ih = parseFloat(pose.style.height);
    if ([left, top, width, height, iw, ih].some(Number.isNaN)) return null;
    rings.push({
      code,
      cx: BOX_X + left + width / 2,
      cy: BOX_Y + top + height / 2,
      pose: [matrix[0], matrix[1], matrix[2], matrix[3]],
      dir: spin.classList.contains("lp-anim-spin--cw") ? 1 : -1,
      hw: iw / 2,
      hh: ih / 2,
      path: new Path2D(d),
    });
  }
  if (rings.length === 0) return null;

  const scratch = document.createElement("canvas");
  const g = scratch.getContext("2d", { willReadFrequently: true });
  if (!g) return null;

  return {
    sample(cols, rows, cycle) {
      if (scratch.width !== cols || scratch.height !== rows) {
        scratch.width = cols;
        scratch.height = rows;
      } else {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalCompositeOperation = "source-over";
        g.clearRect(0, 0, cols, rows);
      }
      const sx = cols / DESIGN_W;
      const sy = rows / NODE_HEIGHT;
      const turn = cycle * Math.PI * 2;
      for (const ring of rings) {
        g.setTransform(sx, 0, 0, sy, FIT.x * sx, (FIT.y - NODE_TOP) * sy);
        g.scale(FIT.scale, FIT.scale);
        g.translate(ring.cx, ring.cy);
        g.transform(ring.pose[0], ring.pose[1], ring.pose[2], ring.pose[3], 0, 0);
        g.rotate(ring.dir * turn);
        g.translate(-ring.hw, -ring.hh);
        if (ring.code < 0) {
          g.globalCompositeOperation = "destination-out";
          g.fillStyle = "#000";
        } else {
          g.globalCompositeOperation = "source-over";
          g.fillStyle = `rgb(${Math.round(ring.code * CODE_STEP)},0,0)`;
        }
        g.fill(ring.path, "evenodd");
      }
      const px = g.getImageData(0, 0, cols, rows).data;
      const out: string[] = [];
      for (let y = 0; y < rows; y++) {
        let line = "";
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          line += px[i + 3] < 128 ? " " : GLYPHS[Math.round(px[i] / CODE_STEP)];
        }
        out.push(line);
      }
      return out;
    },
  };
}
