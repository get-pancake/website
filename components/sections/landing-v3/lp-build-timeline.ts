// No "use client": a plain module reached only through LpBuildAnim's loader (kept out of the
// initial bundle, as the step and story builders are).
import { gsap } from "@/lib/gsap";

import { registerTxtPlugin } from "./lp-gsap-txt";

/**
 * The "Your sentence becomes software." build-up (LpBuildAnim). progress(1) = the server markup
 * (restIsEnd); `cue` 0 = the first composed scene, never empty: the ask sent, Claude using
 * Pancake, the editor open on "Writing", the run waiting.
 *
 *   0.45        the code types itself, line by line (a stepped clip per line: typed, not faded)
 *   ~3.0        Writing → Testing on 25 companies
 *   +0.85       → Tested on 25 companies, v3, the run goes live
 *   +0.45 → +1.5  13 leads count up (brisk, then a soft landing); three rows come in
 *   end         Claude: "Your Play is live. 13 leads so far."
 *
 * Seek-safe both ways: frame 0 is set before the timeline exists, every move is a tween or a
 * `txt` set (no callbacks), and cleanup() restores the rest markup's inline styles and figure.
 */

const T = {
  type: 0.45, // first line starts
  lineGap: 0.05,
  testFor: 0.85, // Testing… shows this long
  liveIn: 0.15,
  countIn: 0.45, // after live: the count starts
  countSpan: 1.05,
  rowStep: 0.2,
} as const;

/** 13: the Play's figure in step 02 and on every card of the page */
const LEADS_FOUND = 13;

export function buildBuildTimeline(root: HTMLElement) {
  registerTxtPlugin();
  const $ = <E extends Element = HTMLElement>(sel: string) => {
    const el = root.querySelector<E>(sel);
    if (!el) throw new Error(`build: ${sel} is missing`);
    return el;
  };
  const lines = Array.from(root.querySelectorAll<HTMLElement>(".lp-build__ln"));
  const leads = Array.from(root.querySelectorAll<HTMLElement>(".lp-build__lead"));
  const stWriting = $('.lp-build__st[data-st="writing"]');
  const stTesting = $('.lp-build__st[data-st="testing"]');
  const stDone = $('.lp-build__st[data-st="done"]');
  const ver = $(".lp-build__ver");
  const working = $('.lp-build__say[data-say="working"]');
  const reply = $('.lp-build__say[data-say="reply"]');
  const wait = $(".lp-build__wait");
  const liveHead = $(".lp-build__live-head");
  const count = $(".lp-build__count");
  const n = $(".lp-build__n");
  const spin = $(".lp-build__spin");
  const toolDone = $<SVGSVGElement>(".lp-build__tool-st .lp-build__check");

  // the rest markup, for cleanup(): every element styled here, and the figure
  const touched: Element[] = [...lines, ...leads, stWriting, stTesting, stDone, ver, working, reply, wait, liveHead, count, spin, toolDone];
  const restStyle = touched.map((el) => el.getAttribute("style"));
  const restN = n.textContent;

  /* ── frame 0 = cue ── */
  gsap.set(lines, { clipPath: "inset(0% 100% 0% 0%)" });
  gsap.set(stWriting, { autoAlpha: 1 });
  gsap.set([stTesting, stDone, ver, reply, liveHead, count], { autoAlpha: 0 });
  gsap.set(reply, { y: 6 });
  gsap.set(working, { autoAlpha: 1 });
  gsap.set(wait, { autoAlpha: 1 });
  gsap.set(leads, { autoAlpha: 0, y: 8 });
  gsap.set(n, { txt: "0" });
  gsap.set(spin, { autoAlpha: 1 });
  gsap.set(toolDone, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });

  const tl = gsap.timeline({ paused: true });

  /* ── the code types itself ── */
  let t: number = T.type;
  for (const line of lines) {
    const chars = Math.max(1, (line.textContent ?? "").length);
    const dur = Math.min(0.4, 0.05 + chars * 0.0095);
    tl.to(line, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: `steps(${chars})` }, t);
    t += dur + T.lineGap;
  }

  /* ── Writing → Testing → Tested, and the run goes live ── */
  tl.to(stWriting, { autoAlpha: 0, duration: 0.2 }, t);
  tl.to(stTesting, { autoAlpha: 1, duration: 0.2 }, t);
  t += T.testFor;
  tl.to(stTesting, { autoAlpha: 0, duration: 0.2 }, t);
  tl.to(stDone, { autoAlpha: 1, duration: 0.2 }, t);
  tl.to(ver, { autoAlpha: 1, duration: 0.3 }, t);
  tl.to(spin, { autoAlpha: 0, duration: 0.15 }, t);
  tl.to(toolDone, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, t + 0.05);
  tl.to(wait, { autoAlpha: 0, duration: 0.25 }, t + T.liveIn);
  tl.to(liveHead, { autoAlpha: 1, duration: 0.3 }, t + T.liveIn + 0.1);
  tl.to(count, { autoAlpha: 1, duration: 0.3 }, t + T.liveIn + 0.15);

  /* ── 13 leads: brisk ticks, then a soft landing; the rows come in ── */
  const c0 = t + T.countIn;
  for (let i = 1; i <= LEADS_FOUND; i++) {
    tl.set(n, { txt: String(i) }, c0 + T.countSpan * Math.pow(i / LEADS_FOUND, 1.7));
  }
  leads.forEach((lead, i) => {
    tl.to(lead, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, c0 + 0.1 + T.rowStep * i);
  });

  /* ── Claude reports back ── */
  const c1 = c0 + T.countSpan;
  tl.to(working, { autoAlpha: 0, duration: 0.2 }, c1);
  tl.to(reply, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, c1 + 0.1);

  const cleanup = () => {
    touched.forEach((el, i) => {
      const style = restStyle[i];
      if (style === null) el.removeAttribute("style");
      else el.setAttribute("style", style);
    });
    n.textContent = restN;
  };

  return { tl, cleanup, cue: 0 };
}
