"use client";

import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";

/**
 * Deep-dive story "A personal message for every lead" — its build-up as ONE paused, seek-safe GSAP timeline on the
 * stage root (Figma 4964:1469 / 1471 / 1729 / 1821 / 1899). Owner: story-message package. Contract: lp-dive-stages.ts and
 * code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens
 * only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the first composed
 * scene. Reached only through DIVE_STAGES.message.load() (lazy chunk).
 *
 * Phase 0 stub: an empty timeline (duration 0).
 */
export function buildStoryMessage(root: HTMLElement): BuiltStory {
  void root;
  const tl = gsap.timeline({ paused: true });
  return { tl, cleanup: () => {}, cue: 0 };
}
