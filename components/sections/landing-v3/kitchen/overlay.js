// The badges that float over the scene: small pills of real text, drawn in the page (not in the
// 3D canvas) so they stay sharp at any size and take the page's own font.
//
// The show gives a list of badges for the frame, each with a point of the kitchen to stand at;
// this file places them. A badge is `{ id, kind, icon, text, at: [x, y, z], scale, alpha, row }`.
//   kind   "in"    a signal coming in: a tool's logo and two words
//          "out"   what a plate becomes: dark pill, an icon on the order's tone
//          "late"  what comes out without Pancake
//          "warn"  something broke
//          "wait"  the warehouse, still loading
//   icon   a key of logos.js, or one of the glyphs below (user, event, chart, up and jobs stand
//          in for a tool's logo)
//   row    how many lines the badge is pushed up (the older badges of a small feed)

import { LOGOS, logoSvg } from "./logos.js";

const glyph = (inner) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
const stroke = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';

const GLYPHS = {
  // plain glyphs, to use in place of a tool's logo
  user: glyph(`<circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4.5 20.2c0-4.1 3.3-7 7.5-7s7.5 2.9 7.5 7z" fill="currentColor"/>`),
  event: glyph(`<rect x="3.5" y="5.5" width="17" height="15" rx="3" fill="currentColor"/><path d="M8 3.2v4M16 3.2v4" ${stroke}/>`),
  chart: glyph(`<rect x="4" y="12" width="4" height="8" rx="1.2" fill="currentColor"/><rect x="10" y="7.5" width="4" height="12.5" rx="1.2" fill="currentColor"/><rect x="16" y="3.5" width="4" height="16.5" rx="1.2" fill="currentColor"/>`),
  up: glyph(`<path d="M4 16.5l5.5-5.5 3.5 3.5L20 7.5M14.5 7.5H20V13" ${stroke}/>`),
  jobs: glyph(`<rect x="3.5" y="8" width="17" height="11.5" rx="2.6" fill="currentColor"/><path d="M9 8V6.6A1.6 1.6 0 0 1 10.6 5h2.8A1.6 1.6 0 0 1 15 6.6V8" ${stroke}/>`),
  lead: glyph(`<circle cx="9.5" cy="7.6" r="3.7" fill="currentColor"/><path d="M2.8 19.6c0-3.8 3-6.4 6.7-6.4s6.7 2.6 6.7 6.4z" fill="currentColor"/><path d="M19 5.5v6M16 8.5h6" ${stroke}/>`),
  play: glyph(`<path d="M8.2 5.6v12.8a.9.9 0 0 0 1.4.8l9.6-6.4a.9.9 0 0 0 0-1.5L9.6 4.8a.9.9 0 0 0-1.4.8z" fill="currentColor"/>`),
  message: glyph(`<path d="M5.5 4.5h13A2.5 2.5 0 0 1 21 7v7.5a2.5 2.5 0 0 1-2.5 2.5h-6.3L8 20.4V17H5.5A2.5 2.5 0 0 1 3 14.5V7a2.5 2.5 0 0 1 2.5-2.5z" fill="currentColor"/>`),
  late: glyph(`<circle cx="12" cy="12" r="8.4" ${stroke}/><path d="M12 7.4V12l3.1 2.1" ${stroke}/>`),
  warn: glyph(`<path d="M12 4.2 21 19.4H3z" ${stroke}/><path d="M12 10v4.2" ${stroke}/><circle cx="12" cy="16.9" r="1.1" fill="currentColor"/>`),
  wait: glyph(`<path d="M7 4h10M7 20h10M8 4c0 4.4 8 3.6 8 8s-8 3.6-8 8M16 4c0 4.4-8 3.6-8 8s8 3.6 8 8" ${stroke}/>`),
};

// The colors are the landing's tokens where the page defines them (inside .lp); the fallbacks
// are the same values, for a page that does not.
const CSS = `
.pk-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;font-weight:600;line-height:1;letter-spacing:-.005em;-webkit-font-smoothing:antialiased}
.pk-badge{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:.42em;padding:.3em .72em .3em .32em;border-radius:99em;white-space:nowrap;background:var(--lp-ink-0,#fff);color:var(--lp-ink-100,#2c002a);box-shadow:0 .06em .14em var(--lp-ink-tr-10,rgba(44,0,42,.1)),0 .45em 1.1em var(--lp-ink-tr-20,rgba(44,0,42,.2));will-change:transform,opacity;visibility:hidden}
.pk-ico{flex:none;display:grid;place-items:center;width:1.56em;height:1.56em;border-radius:.48em;background:var(--lp-page-bg,#fbf6f1)}
.pk-ico svg{display:block;width:1.06em;height:1.06em}
.pk-badge[data-kind=out]{background:var(--lp-ink-100,#2c002a);color:var(--lp-ink-20,#fff7ec)}
.pk-badge[data-kind=out] .pk-ico{border-radius:50%;background:var(--pk-tone,var(--lp-yellow-30,#ffbd7a));color:var(--lp-ink-100,#2c002a)}
.pk-badge[data-kind=late]{background:var(--lp-red-10,#ffd1c9);color:var(--lp-red-40,#ad001a)}
.pk-badge[data-kind=late] .pk-ico{border-radius:50%;background:var(--lp-red-40,#ad001a);color:var(--lp-ink-0,#fff)}
.pk-badge[data-kind=warn]{background:var(--lp-yellow-10,#ffe9d1);color:var(--lp-orange-40,#b20000)}
.pk-badge[data-kind=warn] .pk-ico{border-radius:50%;background:var(--lp-orange-20,#ffa45f);color:var(--lp-ink-100,#2c002a)}
.pk-badge[data-kind=wait]{color:var(--lp-ink-90,#6c4b65)}
.pk-badge[data-kind=wait] .pk-ico{border-radius:50%;background:var(--lp-blue-10,#d9e9ff);color:var(--lp-blue-40,#4660e7)}
.pk-num{font-variant-numeric:tabular-nums}
`;

let styled = null;

function style(doc) {
  if (styled === doc) return;
  if (!doc.getElementById("pk-style")) {
    const el = doc.createElement("style");
    el.id = "pk-style";
    el.textContent = CSS;
    doc.head.appendChild(el);
  }
  styled = doc;
}

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export function createOverlay(container, THREE) {
  const doc = container.ownerDocument;
  style(doc);
  if (getComputedStyle(container).position === "static") container.style.position = "relative";
  const layer = doc.createElement("div");
  layer.className = "pk-layer";
  layer.setAttribute("aria-hidden", "true");
  container.appendChild(layer);
  const els = new Map();
  const v = new THREE.Vector3();
  let font = 12;

  function element(id) {
    let e = els.get(id);
    if (!e) {
      const node = doc.createElement("div");
      node.className = "pk-badge";
      node.innerHTML = '<span class="pk-ico"></span><span class="pk-txt"></span>';
      layer.appendChild(node);
      e = { node, ico: node.firstChild, txt: node.lastChild, key: "", icon: "", half: 40, seen: false, shown: false };
      els.set(id, e);
    }
    return e;
  }

  /** places the badges of this frame; the ones not in the list are hidden */
  function draw(list, camera, width, height) {
    // the pills scale with the scene, and give way when it gets too small to read them
    const size = Math.max(10, Math.min(14, width / 90));
    const on = width >= 460;
    if (size !== font) {
      font = size;
      layer.style.fontSize = `${size}px`;
      els.forEach((e) => (e.half = 0));
    }
    els.forEach((e) => (e.seen = false));
    if (on) {
      for (const b of list) {
        if (!(b.alpha > 0.01) || !(b.scale > 0.01)) continue;
        const e = element(b.id);
        e.seen = true;
        if (e.icon !== b.icon) {
          e.icon = b.icon;
          e.ico.innerHTML = LOGOS[b.icon] ? logoSvg(b.icon) : GLYPHS[b.icon] || "";
        }
        const key = `${b.kind}|${b.text}|${b.tone || ""}`;
        if (e.key !== key) {
          e.key = key;
          e.node.dataset.kind = b.kind;
          e.txt.innerHTML = escape(b.text).replace(/(\d+%)/, '<span class="pk-num">$1</span>');
          if (b.tone) e.node.style.setProperty("--pk-tone", b.tone);
          e.half = 0;
        }
        v.set(b.at[0], b.at[1], b.at[2]).project(camera);
        // what it points at is out of the picture (a close-up): no badge
        if (Math.abs(v.x) > 1.04 || Math.abs(v.y) > 1.04) {
          e.seen = false;
          continue;
        }
        if (!e.half) e.half = e.node.offsetWidth / 2 || 40;
        const lift = (b.row || 0) * size * 2.5;
        // near an edge, it is nudged in so that it shows whole
        const x = Math.max(e.half + 6, Math.min(width - e.half - 6, (v.x * 0.5 + 0.5) * width));
        const y = Math.max(size * 1.4, (0.5 - v.y * 0.5) * height - lift);
        e.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${b.scale.toFixed(3)})`;
        e.node.style.opacity = Math.min(1, b.alpha).toFixed(3);
        if (!e.shown) {
          e.shown = true;
          e.node.style.visibility = "visible";
        }
      }
    }
    els.forEach((e) => {
      if (!e.seen && e.shown) {
        e.shown = false;
        e.node.style.visibility = "hidden";
      }
    });
  }

  return {
    draw,
    dispose() {
      layer.remove();
      els.clear();
    },
  };
}
