/**
 * The toy pictures' words (the vision homepage's 1-2-3 and its four features, 2026-11-12): what
 * the badges say, and what each picture shows (its alt). In scripts/homepage-lint.mjs FILES:
 * every string here is linted. A code key (id, kind, tone, logo, icon…) is skipped by the lint,
 * so copy sits in `text`, `label`, `name`, `alt` and the like.
 *
 * The 1-2-3 keeps the page's own data (lp-vision-data.ts: the four sources, the two tables, the
 * six kinds of signal, the account, the Play); this file adds what the new pictures say on top.
 * The rules of lp-vision-data.ts hold: no person is named, a source or a kind of signal is shown
 * with a tool's own mark, a badge is three words at most.
 */
import { STORY_PING } from "./lp-story-ping-data";
import type { VisionStepVariant } from "./lp-vision-data";

/* ── 01 · your sources connect, the machine turns, the tables come up ── */
export const TOY_SOURCES = {
  /** what each source sends as it connects, in VSTEP_SOURCES' order (CRM, events, product, website) */
  sends: [{ text: "Deal updated" }, { text: "Attended your event" }, { text: "New signup" }, { text: "Pricing page viewed" }],
  alt: "Animation: your CRM, your events, your product and your website plug into Pancake one after the other. Each one sends what happened: a deal updated, someone attended your event, a new signup, a pricing page viewed. Beads run down the cables into the machine, which turns, and two piles of rows come up in front of it: companies and people.",
} as const;

/* ── 02 · a radar over one account: the page's own signals and account (VSTEP_SIGNALS,
   VSTEP_ACCOUNT); only the picture's alt is new ── */
export const TOY_RADAR = {
  alt: "Animation: a radar over one account, Ramp, a lost deal. Its beam turns once and four signals land round the account, each with the source that found it: a new VP Sales, new funding, visits up, hiring SDRs. A line then connects the dots, into the account.",
} as const;

/* ── 03 · the Brain as the app draws it, what it holds, and the ideas it comes up with. The
   founder's example for an idea (2026-11-12): "contact the 24 people who created an account
   after coming to your event last week". The two smaller ideas are the page's own (Ramp and its
   lost deal, the accounts hiring SDRs). ── */
export const TOY_BRAIN = {
  /** what the Brain holds, a hub each, in the hubs' order (toys/studio/scene-brain.js HUBS) */
  holds: [{ label: "ICP" }, { label: "Personas" }, { label: "Voice" }, { label: "Signals" }, { label: "Competitors" }, { label: "Objections" }],
  /** the ideas it comes up with, then the one it recommends (its kicker is VSTEP_BRAIN's) */
  ideas: [{ text: "Reach back out to Ramp" }, { text: "Work accounts hiring SDRs" }],
  play: { text: "Contact the 24 people who signed up after your event." },
  alt: "Animation: your Brain, a graph of coloured hubs round a dark centre: ICP, personas, voice, signals, competitors, objections. Signals run along its branches into the centre, and ideas come out: reach back out to Ramp, work accounts hiring SDRs. Then the next best Play: contact the 24 people who signed up after your event.",
} as const;

/** what each toy picture of the 1-2-3 shows: its stage's aria-label (LpVisionSteps.tsx) */
export const TOY_STEP_ALT: Partial<Record<VisionStepVariant, string>> = {
  t1: TOY_SOURCES.alt,
  t2: TOY_RADAR.alt,
  t3: TOY_BRAIN.alt,
};

/* ── "Remember every touch with every buyer": one buyer's touches, in the order they happened
   (the dates and the four touches are the history story's, lp-story-problems-data.ts), and the
   count of what was kept as each one is filed ── */
export const TOY_JOURNEY = {
  touches: [
    { when: "Sep 12", text: "Came to your event", logo: "/lp/vendor-logos/luma.svg" },
    { when: "Sep 30", text: "Signed up", logo: "/lp/vendor-logos/posthog.svg" },
    { when: "Oct 21", text: "Asked about pricing", icon: "chat" },
    { when: "Nov 4", text: "Replied to you", icon: "reply" },
  ],
  kept: [{ text: "1 touch kept" }, { text: "2 touches kept" }, { text: "3 touches kept" }, { text: "4 touches kept" }],
  alt: "Animation: one buyer goes from stop to stop along a track, and each touch keeps its date. Sep 12, came to your event. Sep 30, signed up. Oct 21, asked about pricing. Nov 4, replied to you. Under the track, a dot is kept for each one: 4 touches kept.",
} as const;

/* ── "See one buyer behind three emails": the same person as three sources know them (the
   meeting's own example, lp-story-problems-data.ts DEDUP: an event, a product signup, a social
   profile, under a work email and a personal one), back lane to front lane
   (toys/studio/scene-merge.js LANES), then the one record ── */
export const TOY_MERGE = {
  sightings: [
    { from: "Your event", text: "Work email", logo: "/lp/vendor-logos/luma.svg" },
    { from: "Your product", text: "Personal email", logo: "/lp/vendor-logos/posthog.svg" },
    { from: "Social profile", text: "No email", icon: "person" },
  ],
  one: { text: "One buyer" },
  alt: "Animation: the same person is seen three times. At your event, under a work email. In your product, under a personal email. On a social profile, with no email. Three pawns leave the three sources, meet on one stand and become one buyer, who keeps the colour of each source.",
} as const;

/* ── "Bring you the next deal before you ask": the conversation is the ping story's own
   (lp-story-ping-data.ts STORY_PING: the founder's words are there); this picture puts a phone
   beside it, which lights up by itself ── */
export const TOY_PING = {
  alt: `Animation: a phone lying on a table lights up by itself. ${STORY_PING.contact} writes first: ${STORY_PING.messages
    .map((message) => (message.from === "me" ? `You answer: ${message.text}.` : message.text))
    .join(" ")}`,
} as const;

/* ── "Run your revenue engine from Claude": Claude's window (its own words are the mcp story's,
   lp-story-mcp-data.ts) on a cable to the engine. The job is the page's own story, told from
   Claude: the three steps are the 1-2-3 (your Brain, your tables, the market's signals) and the
   answer is the Play the Brain's card names (VSTEP_BRAIN). No count, no person's name. ── */
export const TOY_ENGINE = {
  ask: { text: "Who should I contact today?" },
  /** the steps, each on a part of the engine (`id`: the part's drawing, toys/studio/scene-engine.js) */
  steps: [
    { id: "brain", text: "Read your Brain" },
    { id: "tables", text: "Query your tables" },
    { id: "radar", text: "Check market signals" },
  ],
  say: { text: "Start with Ramp." },
  /** the Play's two lines under its name */
  rows: [
    { name: "Who", value: "Head of Sales at Ramp" },
    { name: "Why", value: "Lost deal, now hiring SDRs" },
  ],
  alt: "Animation: in Claude, with the Pancake connector, someone types: Who should I contact today? A signal runs down a cable to the engine, where three parts light up in turn as Claude reads your Brain, queries your tables and checks market signals. Claude answers: Start with Ramp. The next best Play: reach back out to the Head of Sales at Ramp, a lost deal, now hiring SDRs.",
} as const;
