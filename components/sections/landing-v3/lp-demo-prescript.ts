// lp-demo-prescript.ts — the hero scroll before its driver loads (verifier M-05, 2026-10-12).
// A string: LpDemo.tsx (server) inlines it as a <script> right after the section's markup, so it
// runs during the HTML parse, before the first paint and long before hydration fetches GSAP.
//
// Why: the driver (lp-demo-scroll.ts) is a lazy chunk. Until it mounts, demo.css' pre-script
// layer draws the window. Engines with view timelines (Chromium, Safari 26) get the exact pose
// from a CSS scroll-driven animation, but only the WINDOW's: the hero copy's variable is on other
// elements, so a reload mid-assembly showed the copy at full strength and then dropped it in
// one frame. Engines without view timelines (Firefox, Safari ≤ 18) had the static state 01:
// no window at all at any scroll position until the driver arrived.
//
// What it does: computes the driver's own progress p from the scroll position (same range,
// same clamp at scroll 0) and writes it as ONE custom property, `--lp-hs-pre`, on `.lp-demowin`
// and `.lp-hs-hero` through a constructed stylesheet (document.adoptedStyleSheets): NOT a DOM
// attribute or an inline style, so React's hydration sees the server markup untouched (an
// inline `style` written before hydration is an "Extra attributes from the server" error, and
// the hero's two blocks belong to another component). demo.css reads it as a FALLBACK only:
//   --lp-hs      : var(--lp-hs-pre, 0)                          (where no view timeline draws it)
//   hero opacity / drift : var(--lp-hs-hero, var(--lp-hs-pre, 0))
// so the driver's inline writes win the moment it mounts, and the lock (`data-hs-done`) ignores it.
//
// Lifetime: it installs nothing where the hero scroll does not run at parse time (HS_QUERY:
// phones, tablets, short or very tall windows, reduced motion). Elsewhere: scroll / resize /
// load listeners (passive) until `window.__lpHsPre()` is called by the player (LpDemoPlayer):
// as soon as the driver has mounted, or when it failed to load, or at mount if the window left
// the range meanwhile. Then the stylesheet is removed and nothing is left behind. No
// constructed stylesheets (Safari < 16.4): it does nothing and the page behaves as before. A
// soft navigation back to the homepage does not re-run it (React inserts the tag inert): the
// driver is cached by then.
//
// Kept as plain ES5 in one line: it is shipped as is, never bundled.

import { HS_END_FROM_TOP, HS_PRE_STOP, HS_QUERY, HS_START_FROM_BOTTOM } from "./lp-demo-timeline";

export const HS_PRE_SCRIPT =
  "(function(){" +
  "var d=document,w=window,s=d.getElementById('lp-demowin'),h;" +
  "if(!s||!w.matchMedia||!w.CSSStyleSheet||!('adoptedStyleSheets' in d))return;" +
  `var q=w.matchMedia(${JSON.stringify(HS_QUERY)}),l='';` +
  "if(!q.matches)return;" +
  "try{h=new CSSStyleSheet();h.replaceSync('.lp-demowin,.lp-hs-hero{--lp-hs-pre:0}');" +
  "d.adoptedStyleSheets=d.adoptedStyleSheets.concat(h)}catch(e){return}" +
  "function u(){" +
  "if(!q.matches)return;" +
  "var y=w.pageYOffset,t=s.getBoundingClientRect().top+y," +
  `a=Math.max(0,t-w.innerHeight+${HS_START_FROM_BOTTOM}),b=t-${HS_END_FROM_TOP},` +
  "p=b>a?Math.min(1,Math.max(0,(y-a)/(b-a))):1,v=p.toFixed(4);" +
  "if(v!==l){l=v;h.cssRules[0].style.setProperty('--lp-hs-pre',v)}" +
  "}" +
  "function x(){" +
  "w.removeEventListener('scroll',u);w.removeEventListener('resize',u);w.removeEventListener('load',u);" +
  "try{d.adoptedStyleSheets=d.adoptedStyleSheets.filter(function(k){return k!==h})}catch(e){}" +
  "}" +
  "w.addEventListener('scroll',u,{passive:true});w.addEventListener('resize',u,{passive:true});w.addEventListener('load',u);" +
  `w.${HS_PRE_STOP}=x;u()` +
  "})();";
