"use client";

// lp-demo-scroll.ts — the hero scroll driver (storyboard 4940:4919 → 4920 → 4981, decision
// 2026-10-09 §3: scroll-linked with GSAP ScrollTrigger, every browser). LAZY: LpDemoPlayer
// imports it with `import()` on desktop with motion allowed only, so GSAP stays out of the first
// bundle (PR #283) and phones / tablets / reduced motion never fetch it.
//
// ScrollTrigger maps the scroll to ONE progress p (0 = state 01, 1 = state 03) over the range
// "the WINDOW's top at 100vh − 299.42px" → "the window's top at 141px" (no pin: the section moves
// with the page). The trigger is the section, whose top is the 26 px inset above the window (V2
// 4939:2645), so the two constants carry that shift (lp-demo-timeline.ts: 325.42 / 115). The
// driver writes p as a custom property and CSS draws every pose from it (demo.css
// "hero scroll"): `--lp-hs` on the section (window scale / opacity, head offset, pills) and
// `--lp-hs-hero` on each `.lp-hs-hero` (the hero copy's drift and fade, hero package hook) — two
// or three style writes a frame, no transform strings to fight the hero's own transforms. The
// hero copy only reads its variable in the humans view (demo.css), so the agents view, where
// this section is display:none, is never touched.
//
// `data-hs="js"` on the section hands the poses over from demo.css' pre-script layer (a CSS
// scroll-driven animation of the same variable where supported, else lp-demo-prescript.ts'
// `--lp-hs-pre`) in the same frame as the first write. Lock (`data-hs-done`, set by the
// player): the section's variable stops being written and CSS shows state 03 for good; the hero
// copy keeps following the scroll.
//
// Tall windows (> 1102 px): the storyboard's start would sit at a negative scroll position, so
// the page would load part-assembled (and the headline dimmed above ~1905 px). `clamp()` pins
// the start to scroll 0: p = 0 at the top of the page at any height (verifier DT-2 / M-04).
//
// `data-hs-out` on each `.lp-hs-hero` from p ≥ HS_HERO_OUT (.85, the end of its fade): demo.css
// turns it into `visibility: hidden`, so the faded "Start free" / "Book a demo" / toggle are no
// longer hit-testable or tab stops in the blank band above the assembled window (DT-1). It
// follows the scroll like the copy itself: scrolling back up brings the copy, and its links, back.

import { ScrollTrigger } from "@/lib/gsap";
import { HS_END_FROM_TOP, HS_HERO_OUT, HS_START_FROM_BOTTOM } from "./lp-demo-timeline";

export function mountHeroScroll(section: HTMLElement, onProgress: (p: number) => void): () => void {
  const heroes = Array.from(document.querySelectorAll<HTMLElement>(".lp-hs-hero"));
  let last = "";
  let out = false;

  const write = (p: number) => {
    const v = p.toFixed(4);
    if (v === last) return;
    last = v;
    if (!section.hasAttribute("data-hs-done")) section.style.setProperty("--lp-hs", v);
    for (const h of heroes) h.style.setProperty("--lp-hs-hero", v);
    if ((p >= HS_HERO_OUT) !== out) {
      out = !out;
      for (const h of heroes) h.toggleAttribute("data-hs-out", out);
    }
    onProgress(p);
  };

  const st = ScrollTrigger.create({
    trigger: section,
    start: `clamp(top bottom-=${HS_START_FROM_BOTTOM})`,
    end: `top ${HS_END_FROM_TOP}px`,
    onUpdate: (self) => write(self.progress),
    onRefresh: (self) => write(self.progress),
  });
  section.setAttribute("data-hs", "js");
  write(st.progress);

  // the audience switch shows / hides this section (display): re-measure the range
  const main = section.parentElement;
  const mo = new MutationObserver(() => ScrollTrigger.refresh());
  if (main) mo.observe(main, { attributes: true, attributeFilter: ["data-audience"] });
  // the hero above can change height without a window resize (its 450 ms glide after
  // LpViewportVar settles, the short-window ladder): re-measure once it has settled
  let settle = 0;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(settle);
    settle = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  });
  const hero = document.querySelector(".lp-hero");
  if (hero) ro.observe(hero);

  return () => {
    window.clearTimeout(settle);
    ro.disconnect();
    mo.disconnect();
    st.kill();
    section.removeAttribute("data-hs");
    section.style.removeProperty("--lp-hs");
    for (const h of heroes) {
      h.style.removeProperty("--lp-hs-hero");
      h.removeAttribute("data-hs-out");
    }
  };
}
