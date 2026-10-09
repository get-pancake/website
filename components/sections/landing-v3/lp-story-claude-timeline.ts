"use client";

import { gsap } from "@/lib/gsap";

import type { BuiltStory } from "./lp-dive-stages";

/**
 * Deep-dive story "Run it from Claude or Codex" — its build-up as ONE paused, seek-safe GSAP timeline on the
 * stage root (Figma 4964:2575 / 3930 / 3981). Owner: story-claude package. Contract: lp-dive-stages.ts and
 * code-map §6.2 — frame 0 via gsap.set (the caller's gsap.context reverts it), sets and tweens
 * only (no callbacks, no randomness), progress(1) = the server markup, `cue` = the first composed
 * scene. Reached only through DIVE_STAGES.claude.load() (lazy chunk).
 *
 * Phase 0 stub: an empty timeline (duration 0).
 */
export function buildStoryClaude(root: HTMLElement): BuiltStory {
  void root;
  const tl = gsap.timeline({ paused: true });
  return { tl, cleanup: () => {}, cue: 0 };
}
