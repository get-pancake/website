// lp-demo-timeline.ts — the homepage demo window's shared constants. No DOM, no strings, no
// React: imported by the client island (LpDemoPlayer) and the scroll effect, and safe anywhere.
//
// Two views play in turn in ONE app window, each a GSAP timeline of its own that the player
// seeks with its clock (since 2026-10-13 for both; the class-cue tables that lived here went
// with the old Claude view):
//   0 Pancake        — lp-demo-pancake-timeline.ts
//   1 Claude & Codex — lp-demo-claude-timeline.ts
// A run's length is its timeline's duration; the player holds the end picture 2.2 s, then
// crossfades to the other view.

export type LpDemoView = 0 | 1;

/* ── the one scroll effect: the window grows a little (founder 2026-10-12, _decisions §10) ────
   The window is assembled from the first frame. On desktop the card (window + pills) grows from
   GROW_FROM to 1 about its top centre, linked to the scroll: g = 0 → 1 while the window's top
   travels from where it sits at the top of the page (the fold at most: on a first load its top
   bar peeks 70 px above the fold) up to GROW_END_AT of the viewport height, and back
   when the visitor scrolls up. lp-demo-scroll.ts writes g as --lp-demowin-grow on the card; demo.css turns it into the
   card's scale. */
/** The card's scale at g = 0 (demo.css repeats it: `0.94 + 0.06 * g`). */
export const GROW_FROM = 0.94;
/** g = 1 when the window's top reaches this share of the viewport height. */
export const GROW_END_AT = 0.35;
/** The tallest viewport the effect runs in (px). From 1450 the whole window (hero 777 + 26 +
 *  647) sits in the first viewport: it is drawn at 1. demo.css repeats it in its media query. */
export const GROW_MAX_HEIGHT = 1449;
/** Where the effect runs (demo.css uses the same query). */
export const GROW_QUERY = `(min-width: 1025px) and (max-height: ${GROW_MAX_HEIGHT}px) and (prefers-reduced-motion: no-preference)`;
/** A page that opens already scrolled: the first value eases in over this long (ms; demo.css
 *  `[data-grow-settle]` transition, 300 ms). */
export const GROW_SETTLE_MS = 300;

/* ── phones ≤767: the mobile artboard's card (5024:8631 → 5024:9506) ─────────────────────────
   The Pancake view is a fixed design box scaled as pixels (demo.css "phones"). */
/** The phone layout's media query (demo.css uses the same breakpoint). */
export const PHONE_QUERY = "(max-width: 767px)";
/** The design box's width in du (218 px ÷ 0.399025); demo.css `.lp-demowin__view { width }`. */
export const PHONE_BOX_W = 546.33;
/** F2 (decision §9, 2026-10-11): on phones the artboard draws ONE card and no pills, so the
 *  Pancake view plays once and holds its end picture, and the Claude & Codex view is never
 *  shown there. `false` brings the pills and the two-view loop back on phones (the card gets
 *  no `data-phone-solo`; demo.css keeps the rules for it). */
export const PHONE_SOLO = true;
