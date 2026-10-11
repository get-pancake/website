/**
 * "Pancake fills your pipeline." — the three steps' copy and their art slots (owner:
 * logos-steps; in scripts/homepage-lint.mjs FILES). Rendered by LpSteps.tsx (server).
 *
 * Copy history (moved here verbatim from LpSteps.tsx, 2026-10-09):
 * - Copy follows the artboard (Figma 4636:3164) except casing: founder rule (2026-08-28),
 *   no capitals on common nouns mid-sentence ("sells it", "your business", "GTM brain").
 * - Step 03's artboard copy was overridden by the founder in the brief (2026-09-02):
 *   "Pancake gets you the meeting. / You close it." + the follow-up body.
 * - Founder copy pass (2026-09-03): the step 01 body ("From your website, Pancake
 *   learns…") is his words verbatim, not the artboard's.
 * - 2026-09-30, AI SEO retired (pancake-cmo PR #1037): step 01 ends on "where to find
 *   them" (was "where to show up"), step 02 talks Plays + lead approval + outreach (was
 *   "gets you found on Google and ChatGPT"), and the step 02 Agents list swaps its
 *   Content / AI search rows for Plays / Messages (S2_ROWS in lp-step-data.ts).
 * - 2026-10-07: step 02 says each Play keeps searching for people who fit (it named an
 *   intent the product can't see, an overclaim validate.ts bans), and its checklist
 *   learns from every review, not every reply (the brain learns from the leads you
 *   approve or reject; reply signals are deferred, pancake-cmo ADR 0043).
 * - 2026-10-07 (founder): step 03 keeps its title, its body describes what Pancake does
 *   after the first message (follows up, reads the reply, answers a yes with your
 *   calendar link, hands back the rest) instead of promising a qualified meeting, and the
 *   calendar chips say "Booked", not "Closed": Pancake can't know a deal closed.
 * - 2026-10-09 (Figma V2 4911:346): step 01's graph names its five hubs (red note
 *   "Labels in 2nd level dots", S1_HUBS[].label) and its alt says so. Rows 02 and 03 carry
 *   the red note "Content (still tbd)": V2 draws their art cards EMPTY and keeps V1 copy
 *   in their text cards, i.e. the designer will redo both rows. Production keeps its
 *   shipped, founder-approved copy and animations (no regression to empty cards, no V1
 *   copy); `pending` records the note, and each row's art is an explicit slot below.
 *
 * Filling a "still tbd" row when the designer delivers it: replace `title` / `body` /
 * `alt`; for a still, put `{ kind: "image", src, width: 464, height: 426, status: "final" }`
 * first in `art` (SVG/AVIF/PNG drawn at the card's design size, contain-fit); for an
 * animation, add an `s4`-style variant to lp-step-timelines.ts + LpStepMocks.tsx and use
 * `{ kind: "anim", variant: "s4", status: "final" }`; then delete `pending`. To show new art
 * on dev and Vercel previews only (production keeps the shipped one), put it FIRST with
 * `status: "placeholder"` and keep the final entry after it. `{ kind: "empty" }` is the V2
 * artboard's literal empty card: placeholder-only by type, and a production build with no
 * final art in a row fails (LpSteps) — an empty step card never ships.
 */

import type { ContentStatus } from "@/lib/placeholders";

import type { StepVariant } from "./lp-step-timelines";

/** One candidate for a step's 464×426 art card. */
export type StepArt =
  /** the in-page DOM + CSS + GSAP mock (LpStepAnim; today s1, s2, s3) */
  | { kind: "anim"; variant: StepVariant; status: ContentStatus }
  /** a designer still at the card's design size (464×426, contain-fit) — for art that
      lands before its animation (the 2026-09-02 /public/how/step-*.svg precedent) */
  | { kind: "image"; src: string; width: 464; height: 426; status: ContentStatus }
  /** the V2 artboard's empty card (Figma 4911:433 / 4911:488): dev + preview only */
  | { kind: "empty"; status: "placeholder" };

export type StepContent = {
  num: "01" | "02" | "03";
  /** "\n" = desktop line break (white-space: pre-line) */
  title: string;
  body: string;
  /** the slot's candidates, in priority order: the first one the environment may show
      wins (lib/placeholders visibleEntries: "final" always, "placeholder" in dev and on
      Vercel previews only). Production needs at least one "final" entry. */
  art: readonly StepArt[];
  /** what the art shows — its only copy for screen readers (the card is role="img") */
  alt: string;
  /** Figma V2 red note "Content (still tbd)": the designer will replace this row's copy
      and art; production keeps the shipped content until the new one is delivered */
  pending?: { figma: string; note: string };
};

export const STEPS: readonly StepContent[] = [
  {
    num: "01",
    title: "Add your website.\nPancake builds your GTM brain.",
    body: "From your website, Pancake learns who buys from you, what to say, and where to find them. Always up to date.",
    art: [{ kind: "anim", variant: "s1", status: "final" }],
    // names S1_HUBS[].label (lp-step-data.ts) in hub order: keep in sync
    alt: "Animation: a website address is typed and researched; from the Studio Pelican node a knowledge graph blooms, its five branches labeled Competitors, ICPs, Outreach, Influencers and Market Research, then a market profile fills in: Company, Offering, Ideal clients.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Each Play keeps searching for people who fit. You approve each one. Pancake writes to them under your name.",
    art: [{ kind: "anim", variant: "s2", status: "final" }],
    // lists S2_ROWS and S2_ITEMS (lp-step-data.ts) in order: keep in sync
    alt: "Animation: an Agents list with Pipeline (24 warm leads), Signals (48 detected), Plays (3 active), Replies (12 received), Messages (72 sent). The Pipeline agent opens its checklist by itself and works through it: monitor buying signals, find people who fit your ICP, enrich every prospect, score leads for ICP fit, write outreach in your voice, follow up automatically. Each item loads, then ticks.",
    pending: { figma: "4911:432 (text 4911:477, art 4911:433)", note: "Content (still tbd), V2 2026-10-09" },
  },
  {
    num: "03",
    title: "Pancake gets you the meeting.\nYou close it.",
    body: "Pancake follows up until they answer, then reads the reply. A yes gets your calendar link, sent from your account. Every other answer comes back to you.",
    art: [{ kind: "anim", variant: "s3", status: "final" }],
    alt: "Animation: a calendar week in October 2026 fills up day by day with meetings — Samantha M., Julien Aubert, Martin Torres and Studio P, Lumen Collective, Fernhollow Studio, a Martin C. follow-up — each past meeting marked booked or follow-up as the days go by.",
    pending: { figma: "4911:482 (text 4911:483, art 4911:488)", note: "Content (still tbd), V2 2026-10-09" },
  },
];
