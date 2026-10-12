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
 *   Content / AI search rows for Plays / Messages (that Agents list left on 2026-10-11).
 * - 2026-10-07: step 02 says each Play keeps searching for people who fit (it named an
 *   intent the product can't see, an overclaim validate.ts bans), and its checklist
 *   learns from every review, not every reply (the brain learns from the leads you
 *   approve or reject; reply signals are deferred, pancake-cmo ADR 0043).
 * - 2026-10-07 (founder): step 03 keeps its title, its body describes what Pancake does
 *   after the first message (follows up, reads the reply, answers a yes with your
 *   calendar link, hands back the rest) instead of promising a qualified meeting, and the
 *   calendar chips say "Booked", not "Closed": Pancake can't know a deal closed.
 * - 2026-10-09 (Figma V2 4911:346): step 01's graph names its five hubs (red note
 *   "Labels in 2nd level dots", S1_HUBS[].label) and its alt says so. Rows 02 and 03 carried
 *   the red note "Content (still tbd)" then (empty art cards, V1 copy): production kept its
 *   shipped copy and animations, and each row's art became an explicit slot (below).
 * - 2026-10-11 (Figma V2, "How it works" storyboards; the notes now read "Deltas: New" and
 *   "Deltas: New intro before calendar"): the designer delivered both rows. Step 02 has a new
 *   title, "Say who you want. / Pancake builds the Play." (V2 4911:480), and a new animation
 *   (the chat request, one question, the Play taking shape, the leads, the Play card); step
 *   03 gains an intro in front of its calendar (a lead, the message drafted and sent, her
 *   reply, the meeting). Bodies, and step 03's title, stay production's: V2 still shows V1
 *   strings there ("ready to buy", "found on Google and ChatGPT"), which are not deltas and
 *   break the truth rules. The mocks' strings are the homepage's invented Studio Pelican
 *   story, not the storyboard's sample copy (lp-step-data.ts).
 *
 * The art slot (unchanged mechanism). Each row's `art` lists candidates in priority order;
 * LpSteps shows the first one this environment may show. A still:
 * `{ kind: "image", src, width: 464, height: 426, status: "final" }` (SVG/AVIF/PNG drawn at
 * the card's design size, contain-fit); an animation: a new variant in lp-step-timelines.ts +
 * LpStepMocks.tsx and `{ kind: "anim", variant, status: "final" }`. To show new art on dev and
 * Vercel previews only (production keeps the shipped one), put it FIRST with
 * `status: "placeholder"` and keep the final entry after it. `{ kind: "empty" }` is an empty
 * card: placeholder-only by type, and a production build with no final art in a row fails
 * (LpSteps) — an empty step card never ships. `pending` marks a row the designer is redoing.
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
  /** an empty card (what V2 drew for rows 02 and 03 until 2026-10-11): dev + preview only */
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
  /** a Figma note saying the designer will replace this row's copy and art (the 2026-10-09
      "Content (still tbd)" on rows 02 and 03, delivered 2026-10-11): production keeps the
      shipped content until the new one lands. No row is pending today. */
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
    // V2 4911:480 (2026-10-11); "\n" = its desktop break, phones wrap it to three lines
    title: "Say who you want.\nPancake builds the Play.",
    body: "Each Play keeps searching for people who fit. You approve each one. Pancake writes to them under your name.",
    art: [{ kind: "anim", variant: "s2", status: "final" }],
    // retells S2_CHAT, S2_QUESTION, S2_DRAFT, S2_BAR and S2_PLAYS[0] (lp-step-data.ts): keep in sync
    alt: "Animation: in the Pancake chat, the request “Find people who match our target persona” gets an answer and one question, “What size of companies?”, answered 1-50 employees. A new Play takes shape: who it targets, how Pancake finds them, at most 25 per search. A Leads table fills with product marketers, all 13 are selected and added to the sequence, and the Play card “Product marketers at US SaaS startups” shows 13 leads found.",
  },
  {
    num: "03",
    title: "Pancake gets you the meeting.\nYou close it.",
    body: "Pancake follows up until they answer, then reads the reply. A yes gets your calendar link, sent from your account. Every other answer comes back to you.",
    art: [{ kind: "anim", variant: "s3", status: "final" }],
    // retells S3_THREAD, then lists S3_CHIPS (lp-step-data.ts): keep in sync
    alt: "Animation: from the selected leads, Pancake drafts a message to Tamsin Okafor at Quillfern and it is sent. She answers that she is free Thursday at 3pm, and the meeting appears: Tamsin and Studio Pelican, Thursday 3pm. Then a calendar week in October 2026 fills up day by day with meetings — Samantha M., Julien Aubert, Martin Torres and Studio P, Lumen Collective, Fernhollow Studio, a Martin C. follow-up — each past meeting marked booked or follow-up as the days go by.",
  },
];
