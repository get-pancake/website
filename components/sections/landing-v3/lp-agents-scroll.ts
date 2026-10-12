"use client";

/**
 * Agents view scroll assembly (decision 2026-10-09 §8; agents-view spec §6.1). Owner: agents-view
 * package. The humans view had the same assembly until 2026-10-12; its window now only grows
 * (lp-demo-scroll.ts, _decisions.md §10), so the range lives here alone.
 *
 * ONE progress p, 0 when the wall section's top
 * sits 299.42 px above the viewport's bottom (state 01: 656.58 on a 956-tall window) → 1 when it
 * reaches 141 px from the top (state 03). No pin: the section moves with the page.
 *
 * The driver writes p as custom properties and CSS draws every pose from them (agent-lab.css
 * "scroll assembly", audience-agents.css for the hero copy) — two or three style writes a frame:
 *   --lp-as       on the section: the card frame extends from its 690×74 prompt box to 690×562
 *                 (clip + travelling bottom edge), linear over the whole range;
 *   --lp-as-rows  on the section: wall rows printed, 4 → 79 (one 18 px row per step, 75 steps);
 *   --lp-as-hero  on each `.lp-hs-hero` (nav-hero's hook): the hero copy drifts 25.54 px·p and
 *                 fades out between p .5481 and .85.
 *   data-as-out   on each `.lp-hs-hero` from p ≥ .85 (the end of that fade): audience-agents.css
 *                 turns it into `visibility: hidden`, so the faded "Copy instruction" button and
 *                 the toggle are no longer hit-testable or tab stops (verifier DT-1). Scrolling
 *                 back up brings them back.
 * Lock: once p reaches 1 (or the page arrives past it) the section gets `data-as-done` and the
 * card and wall stay assembled for the visit — never rewind on screen. The hero copy keeps
 * following the scroll (scrolling back shows it again).
 *
 * Plain passive scroll + one rAF (no GSAP, nothing lazy to fetch): mounted only in the agents view
 * on desktop windows (≥1025 × ≥640) with motion allowed; everywhere else nothing is written and
 * CSS shows the rest picture, state 03 (= the V2 artboard).
 */

/** The assembly's range (the humans hero scroll's, until that one was retired on 2026-10-12). */
const START_FROM_BOTTOM = 299.42;
const END_FROM_TOP = 141;
/** Wall rows printed at state 01 and the rows added over the range (V2 wraps to 79 rows). */
export const AS_FIRST_ROWS = 4;
export const AS_ROWS = 75;
/** The hero copy has faded out from here (.5481 + .3019). */
const HERO_OUT = 0.85;
/** Where the effect runs: desktop windows, 640 tall or more, no height ceiling. */
export const AS_MEDIA = "(min-width: 1025px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

export function mountAgentsAssembly(section: HTMLElement): () => void {
  const heroes = Array.from(document.querySelectorAll<HTMLElement>(".lp-hs-hero"));
  let raf = 0;
  let lastP = "";
  let lastRows = -1;
  let lastHero = "";
  let out = false;

  const update = () => {
    raf = 0;
    const startTop = window.innerHeight - START_FROM_BOTTOM;
    const top = section.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, (startTop - top) / (startTop - END_FROM_TOP)));
    if (p >= 1) section.setAttribute("data-as-done", "");
    if (!section.hasAttribute("data-as-done")) {
      const v = p.toFixed(4);
      if (v !== lastP) {
        lastP = v;
        section.style.setProperty("--lp-as", v);
      }
      const rows = AS_FIRST_ROWS + Math.floor(AS_ROWS * p);
      if (rows !== lastRows) {
        lastRows = rows;
        section.style.setProperty("--lp-as-rows", String(rows));
      }
    }
    const h = p.toFixed(4);
    if (h !== lastHero) {
      lastHero = h;
      for (const hero of heroes) hero.style.setProperty("--lp-as-hero", h);
    }
    if ((p >= HERO_OUT) !== out) {
      out = !out;
      for (const hero of heroes) hero.toggleAttribute("data-as-out", out);
    }
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  section.setAttribute("data-as", "js");
  update(); // synchronous: the first picture is right (inside the switch's View Transition commit)
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    section.removeAttribute("data-as");
    section.style.removeProperty("--lp-as");
    section.style.removeProperty("--lp-as-rows");
    for (const hero of heroes) {
      hero.style.removeProperty("--lp-as-hero");
      hero.removeAttribute("data-as-out");
    }
  };
}
