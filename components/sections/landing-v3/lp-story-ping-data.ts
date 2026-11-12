/**
 * Deep-dive story "ping" (the vision homepage's feature "Get the next move before you ask",
 * 2026-11-11). The founder, on the diagram this replaces (the context story's schema): "Moins fan
 * du schema 4 … i'd see more something like instinct or grok bot pinging in a iMessage ui about
 * proactively reaching out to someone who signed up // on which we're working a lot". So the
 * picture is a text conversation: your agent writes first, about someone who just signed up at an
 * account you are already working, and offers to reach out; you say yes.
 * Rules kept: no person is named (a role and a kind of company), no real company. In
 * scripts/homepage-lint.mjs FILES. Drawn by LpStoryPing.tsx; motion: lp-story-ping-timeline.ts.
 */
export const STORY_PING = {
  /** who writes: your agent */
  contact: "Claude",
  time: "Today 9:41 AM",
  /** in order; "them" = the agent, "me" = you */
  messages: [
    { from: "them", text: "The Head of Sales at the fintech you’re working just signed up." },
    { from: "them", text: "You had 3 calls with them this month. Want me to reach out?" },
    { from: "me", text: "Yes, go ahead" },
    { from: "them", text: "Done. Sent from your account." },
  ],
  delivered: "Delivered",
  field: "iMessage",
} as const;

export const STORY_PING_ALT =
  "Animation: a text conversation with Claude, which writes first: The Head of Sales at the fintech you’re working just signed up. You had 3 calls with them this month. Want me to reach out? You answer: Yes, go ahead. Claude replies: Done. Sent from your account.";
