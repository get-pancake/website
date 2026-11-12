/**
 * Deep-dive story "ping" (the vision homepage's feature "Get the next move before you ask",
 * 2026-11-11). The founder, on the diagram this replaces (the context story's schema): "Moins fan
 * du schema 4", and what he would see in its place: a bot pinging you in a text-message UI,
 * "proactively reaching out to someone who signed up // on which we're working a lot". So the
 * picture is a text conversation: your agent writes first, and you say yes.
 * What it says changed on 2026-11-12 (founder, on the preview): "moins AI SDR en mode je
 * contacte, plus en mode: 24 personnes ICP ont signup suite à ton event d'hier, je te fais une
 * liste pour que tu les contactes ?". So the agent no longer offers to reach out by itself: it
 * tells you who showed up and builds the list, and you do the contacting. The same 24 people
 * as the Brain's Play in the 1-2-3 (lp-toy-data.ts TOY_BRAIN). Until that day: "The Head of
 * Sales at the fintech you're working just signed up. […] Want me to reach out?".
 * Who writes changed with it: a personal agent that lives in your messages, not Claude (he
 * named two, Hermes or OpenClaw; the page has both marks, LpAgentMarks.tsx).
 * Rules kept: no person is named, no real company in what is said. In scripts/homepage-lint.mjs
 * FILES. Drawn by LpStoryPing.tsx and LpToyStories.tsx; motion: lp-story-ping-timeline.ts and
 * lp-toy-story-timelines.ts.
 */
export const STORY_PING = {
  /** who writes: your agent */
  contact: "OpenClaw",
  time: "Today 9:41 AM",
  /** in order; "them" = the agent, "me" = you */
  messages: [
    { from: "them", text: "24 people in your ICP signed up after yesterday’s event." },
    { from: "them", text: "Want a list so you can contact them?" },
    { from: "me", text: "Yes, send it" },
    { from: "them", text: "Done. The list is in Pancake." },
  ],
  delivered: "Delivered",
  field: "iMessage",
} as const;

export const STORY_PING_ALT =
  "Animation: a text conversation with OpenClaw, your agent, which writes first: 24 people in your ICP signed up after yesterday’s event. Want a list so you can contact them? You answer: Yes, send it. OpenClaw replies: Done. The list is in Pancake.";
