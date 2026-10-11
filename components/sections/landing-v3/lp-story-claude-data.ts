import type { ContentStatus } from "@/lib/placeholders";

/**
 * Deep-dive story "Run it from Claude or Codex" — its copy and data (Figma 4964:2575 / 3930 / 3981). Owner: story-claude package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev/preview carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and are gated by
 * the server parent, never by this module.
 *
 * Truth (public/llms.txt, /guides/claude): Claude, Claude Code and Codex connect to Pancake over
 * MCP with a browser sign-in; from the chat you create and run Plays and review leads. Cursor
 * can't connect yet, so the corner pair is Codex + Claude (Figma drew Cursor's cube, 4964:4029).
 * No time claim anywhere near this stage: "Connecting..." → "11 leads found" takes about a second
 * in the animation, an illustration only.
 *
 * STORY_CLAUDE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 */

export const STORY_CLAUDE = {
  /** Claude's home greeting (a food pun: lowercase "pancakes" is not the brand) */
  greeting: "Let’s flip some pancakes",
  /** typed in the composer, then the user bubble. Figma: "…in Germany" — the /for truth rule
      NON_US (outreach language can't be changed, lib/verticals/validate.ts) forbids it
      (decision 2026-10-09 §6) */
  prompt: "Create a Play to find heads of growth at B2B SaaS companies in the US",
  /** composer chrome (Claude UI). A model label ages: swap it here when Claude's UI moves on */
  modeOff: "Chat",
  modeOn: "Cowork",
  model: "Opus 5",
  effort: "High",
  below: ["Project", "Manual"],
  /** Claude's answer, streamed word by word (one em dash, as drawn) */
  reply: "Absolutely — let me use Pancake for that",
  /** the connector row while the Pancake tool runs (three ASCII dots, as in Figma) */
  status: "Connecting...",
  /** the tool's result (true: a Play search keeps up to 50 leads, reviewable from the agent) */
  result: "11 leads found",
  /** Claude's follow-up line. V2's frame 3 repeats the reply here (a stand-in), so the line is a
      proposal until the founder approves it (Q3): preview/dev only, production ends on
      "11 leads found". */
  followUp: {
    text: "Each comes with a line on why they fit. Want to review them?",
    status: "placeholder" as ContentStatus,
  },
} as const;

export const STORY_CLAUDE_ALT: string =
  "Animation: in Claude, the request “Create a Play to find heads of growth at B2B SaaS companies in the US” is typed and sent. Claude answers “Absolutely, let me use Pancake for that”, connects to Pancake and reports 11 leads found.";
