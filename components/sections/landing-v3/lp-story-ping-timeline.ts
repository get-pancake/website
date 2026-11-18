import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";
import { skHideRise, skQuery, skRise } from "./lp-story-kit";

/**
 * Deep-dive story "ping" (LpStoryPing.tsx): the conversation, message by message, as ONE paused,
 * seek-safe GSAP timeline on the stage root. Contract: lp-dive-stages.ts (frame 0 via gsap.set,
 * which the caller's gsap.context reverts; sets and tweens only; progress(1) = the server
 * markup; `cue` = the first composed scene). Reached only through DIVE_LOADERS.ping (lazy chunk).
 * No "use client" on purpose (the note in lp-story-mcp-timeline.ts).
 *
 *   0     the conversation, empty: the contact, the field (never a blank card)
 *   0.3   the time, then the three dots: the agent is typing, unasked
 *   1.3   its first message, in the dots' place; the dots again, its second message
 *   …     your answer rises from the field, "Delivered" under it
 *   …     the dots, then its last message
 * A message waits long enough to be read before the next one (about a second). Nothing loops:
 * each dot lights once, in turn, per message.
 */

/** the dots show this long before the message takes their place */
const TYPING = 0.75;
/** a message that has come is read before anything else moves */
const READ = 0.95;

export function buildStoryPing(root: HTMLElement): BuiltStory {
  const steps = buildStoryPingSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

/** The same builder in slices (lp-play-once's `steps`): it may yield after any block. */
export function* buildStoryPingSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const { $, $$ } = skQuery(root, "ping");
  const time = $(".lp-sping-time");
  const delivered = $(".lp-sping-delivered");
  const rows = $$(".lp-sping-row").map((row) => {
    const bubble = row.querySelector<HTMLElement>(".lp-sping-bubble");
    if (!bubble) throw new Error("lp-story-ping: a row without its message");
    return {
      mine: row.dataset.from === "me",
      bubble,
      typing: row.querySelector<HTMLElement>(".lp-sping-typing"),
      dots: Array.from(row.querySelectorAll<HTMLElement>(".lp-sping-typing i")),
    };
  });
  if (!rows.length) throw new Error("lp-story-ping: no message");

  // frame 0: the conversation before its first message
  gsap.set([time, delivered], { autoAlpha: 0 });
  for (const row of rows) {
    skHideRise(row.bubble, 10);
    if (row.typing) gsap.set(row.typing, { autoAlpha: 0 });
  }
  yield;

  const tl = gsap.timeline({ paused: true });
  tl.to(time, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 0.3);
  let t = 0.55;
  for (const row of rows) {
    if (row.mine) {
      // you answer: the message rises from the field, then it is delivered
      t += 0.35;
      skRise(tl, row.bubble, t, 0.3);
      tl.to(delivered, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, t + 0.45);
      t += READ;
    } else {
      // the agent is typing (each dot lights once, in turn), then its message takes the dots' place
      const typing = row.typing;
      if (typing) {
        tl.to(typing, { autoAlpha: 1, duration: 0.15, ease: "power1.out" }, t);
        row.dots.forEach((dot, k) =>
          tl.to(dot, { keyframes: [{ opacity: 1, duration: 0.18, ease: "none" }, { opacity: 0.35, duration: 0.18, ease: "none" }] }, t + 0.1 + k * 0.14),
        );
        tl.to(typing, { autoAlpha: 0, duration: 0.001, ease: "none" }, t + TYPING);
      }
      skRise(tl, row.bubble, t + TYPING, 0.32);
      t += TYPING + READ;
    }
  }
  yield;
  return { tl, cleanup: () => {}, cue: 0 };
}
