import type { ClaudeScript } from "./LpClaudeScene";

/**
 * Deep-dive story "Run it from Claude or Codex" — its script. In scripts/homepage-lint.mjs FILES:
 * every string here is linted.
 *
 * Redrawn 2026-10-13 (founder: "adjust wherever claude / codex is mentioned with the new
 * storyboard we just designed… should not be necessarily the same but reuse components"): the
 * demo window under the hero builds and deploys a Play from Claude; this story shows the other
 * half of the item's promise ("Build Plays, review leads and edit messages from the chat you
 * already use"): the week's leads reviewed and approved from Claude. Same components
 * (LpClaudeScene: connector chip, tool-call cards, a result card, the permission prompt), same
 * timeline builder, another script. It replaces the 2026-10-09 story ("Create a Play…",
 * "Connecting...", "11 leads found").
 *
 * Truth (public/llms.txt, /guides/claude): Claude, Claude Code and Codex connect to Pancake over
 * MCP with a browser sign-in; from the chat you create and run Plays and review leads. No person
 * or company is named: the three leads are initials and what made them fit (the homepage's three
 * suggested Plays: a seed round, a marketing hire, a rebrand).
 *
 * STORY_CLAUDE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 */
export const STORY_CLAUDE: ClaudeScript = {
  request: "Show me this week’s best leads.",
  say: "Pulling them from Pancake.",
  tools: [
    { title: "Read Plays", doing: "Reading…", count: 3, done: "live" },
    { title: "Read leads", doing: "Reading…", count: 25, done: "new" },
  ],
  found: "Three stand out. Each says why it fits.",
  card: {
    kicker: "Leads",
    title: "This week’s best fits",
    before: "To review",
    after: "Approved",
    rows: [
      { key: "MR", value: "Founder, raised a seed round" },
      { key: "JL", value: "CEO, hiring a marketing lead" },
      { key: "AS", value: "Founder, posted about a rebrand" },
    ],
  },
  ask: { lead: "Claude wants to use", tool: "Approve leads", from: "from", app: "Pancake" },
  action: { title: "Approve leads", doing: "Approving…", count: 3, done: "approved" },
  done: "Done. Pancake reaches out in your voice.",
};

export const STORY_CLAUDE_ALT: string =
  "Animation: in Claude, with the Pancake connector, the request “Show me this week’s best leads” is typed and sent. Claude reads the Plays and the leads through Pancake and shows the three best fits, each with why it fits. It asks for permission to approve them, approves them, and confirms that Pancake reaches out in your voice.";
