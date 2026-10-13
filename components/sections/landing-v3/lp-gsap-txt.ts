// No "use client" on purpose: the deep-dive story builders import this, and they must stay
// plain modules reached only through the client loaders (see lp-dive-loaders.ts).
import { gsap } from "@/lib/gsap";

/**
 * GSAP `txt` plugin: a seek-safe text swap. `tl.set(el, { txt: "…" }, t)` shows the new text
 * at/after its position and the original text before it (a zero-duration tween renders ratio 1
 * at/after its position, 0 before it), with no callbacks, so a timeline that uses it can be
 * seeked both ways.
 *
 * Moved here unchanged from lp-feat-timelines.ts (production's f4 "Brain learned" card) when the
 * feature cards were removed in the V2 integration (2026-10-11). Registered once per page;
 * callers run `registerTxtPlugin()` before building.
 */
let txtPluginRegistered = false;
export function registerTxtPlugin() {
  if (txtPluginRegistered) return;
  txtPluginRegistered = true;
  gsap.registerPlugin({
    name: "txt",
    init(this: { t: Element; end: string; start: string | null }, target: Element, value: unknown) {
      this.t = target;
      this.end = String(value);
      this.start = target.textContent;
    },
    render(ratio: number, data: { t: Element; end: string; start: string | null }) {
      data.t.textContent = ratio >= 1 ? data.end : data.start;
    },
  });
}
