/**
 * When the ad and analytics tags start (2026-11-04, founder: "do what's best
 * practice and best for our perf").
 *
 * Google Tag Manager (and everything the container loads: GA4, Google Ads, X,
 * Reddit), the Meta pixel, the LinkedIn Insight tag and LeadJourney start on the
 * visitor's first interaction (scroll, tap, click, key, mouse move) or
 * TRACKER_FALLBACK_MS after the page has loaded, whichever comes first. Measured
 * on the homepage (Lighthouse mobile, the tags replayed offline): together they
 * cost about 0.6 s of a slow phone's processor while the page starts, and the
 * score went from ~79 to ~93 once they waited. Starting them right after the
 * first paint instead gained nothing: their work still landed in the window
 * PageSpeed measures.
 *
 * What does not wait: the first-party attribution cookie and the acquisition
 * bank (they record every visit and its ad click ids, which the app's server
 * uses to send sign-ups to Meta and GA4 itself), PostHog, and the queues the
 * tags read: `dataLayer`, `fbq` (init + PageView) and `lintrk` exist from the
 * first moment, so every event pushed before the tags arrive is kept and sent
 * when they do. What is lost: the page view, in those tools, of a visit that
 * leaves without touching the page within 10 s. 10 s is GA4's own threshold for
 * an engaged session, so the visits that go uncounted are exactly the
 * non-engaged ones.
 *
 * Plain .mjs so the inline payload is tested as shipped (scripts/tracker-gate.test.mjs).
 */

/** The fallback for a visitor who reads without touching anything. */
export const TRACKER_FALLBACK_MS = 10_000;

/** The global the inline tag snippets call: window[TRACKER_GATE](startFn). */
export const TRACKER_GATE = "__pancakeTrackers";

/** Interactions that start the tags (capture phase, passive: they never block input). A
 *  `scroll` counts only when the page itself scrolls: listening in the capture phase on the
 *  window also hears every element that scrolls, and a box the page scrolls by itself (the
 *  homepage window's conversation follows its last line from the first paint) started the tags
 *  at ~1.6 s with nobody on the page (2026-11-12, PageSpeed desktop 77, TBT 570 ms). */
export const TRACKER_START_EVENTS = ["pointerdown", "pointermove", "keydown", "touchstart", "scroll", "wheel"];

/**
 * The inline <head> payload: defines window[TRACKER_GATE](fn). Before the
 * visitor's first interaction (or the fallback) fn is queued; at that moment
 * the queue runs in an idle slot (a timer task where requestIdleCallback is
 * missing), so the tag insertions never sit inside the interaction itself;
 * after it, fn runs at once. Idempotent: a second copy of the payload is a no-op.
 *
 * @returns {string}
 */
export function trackerGateScript() {
  return `(function(){var w=window;if(w[${JSON.stringify(TRACKER_GATE)}])return;var q=[],started=false,ev=${JSON.stringify(TRACKER_START_EVENTS)},o={capture:true,passive:true};function run(){var f;while((f=q.shift())){try{f()}catch(_){}}}function start(e){if(e&&e.type==="scroll"&&e.target&&e.target!==document&&e.target!==w&&e.target!==document.documentElement)return;if(started)return;started=true;for(var i=0;i<ev.length;i++)w.removeEventListener(ev[i],start,o);if(typeof w.requestIdleCallback==="function")w.requestIdleCallback(run,{timeout:1000});else w.setTimeout(run,0)}w[${JSON.stringify(TRACKER_GATE)}]=function(fn){if(started&&!q.length){try{fn()}catch(_){}}else q.push(fn)};for(var i=0;i<ev.length;i++)w.addEventListener(ev[i],start,o);function fallback(){w.setTimeout(start,${TRACKER_FALLBACK_MS})}if(document.readyState==="complete")fallback();else w.addEventListener("load",fallback)})();`;
}

/**
 * An inline snippet that loads one external script through the gate.
 *
 * @param {string} src
 * @returns {string}
 */
export function gatedScriptLoader(src) {
  return `window[${JSON.stringify(TRACKER_GATE)}](function(){var s=document.createElement("script");s.async=true;s.src=${JSON.stringify(src)};document.head.appendChild(s)});`;
}
