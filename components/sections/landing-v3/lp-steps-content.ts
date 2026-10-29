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
 * - 2026-10-13 (a first-time reader's review, forwarded by the founder: "Comment tu définis un
 *   Play ? Important d'être explicite en quelques mots, c'est très central", and "Run it from
 *   Claude or Codex: très important, je le mentionnerais plus haut"): step 02's body opens on
 *   what a Play is, in the H1's words (a GTM idea, put to work), and names Claude and Codex as
 *   places to start one, where until then the page first named them in its last story. The
 *   three facts it carried stay: it keeps searching, you approve each lead, Pancake writes
 *   under your name.
 * - 2026-10-11 (Figma V2, "How it works" storyboards; the notes now read "Deltas: New" and
 *   "Deltas: New intro before calendar"): the designer delivered both rows. Step 02 has a new
 *   title, "Say who you want. / Pancake builds the Play." (V2 4911:480), and a new animation
 *   (the chat request, one question, the Play taking shape, the leads, the Play card); step
 *   03 gains an intro in front of its calendar (a lead, the message drafted and sent, her
 *   reply, the meeting). Bodies, and step 03's title, stay production's: V2 still shows V1
 *   strings there ("ready to buy", "found on Google and ChatGPT"), which are not deltas and
 *   break the truth rules. The mocks' strings are the homepage's invented Acme
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
  /** the in-page DOM + CSS + GSAP mock (LpStepAnim; today s0, s4, s1) */
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
  /* Founder 2026-10-27: "the 3 parts should be 1/ Connect your agent (claude codex) 2/ Ask
     anything (= play you want to create) 3/ Un truc genre get better everyday", then "Refine a
     bit the motion for 1 / 2 / 3 reusing when possible components that should be reused,
     creating the ones that should be recreated so that it makes sense" and "Not sure 'Pancake
     learns your business' is the right thing after 'Connect your agent'". So: 01 is a new
     motion built from step 02's Claude window (Pancake connected, what Claude can now do);
     02 is the designer's storyboard as before; 03 is the brain-research-loop Brain, grown by
     the leads' verdicts. "Every day" is out: the homepage lint keeps fixed frequencies off the
     page (#332). */
  {
    num: "01",
    // founder 2026-10-28: "Connect your agent. => Connect Pancake to your agent"
    title: "Connect Pancake to your agent.\nNow it can sell.",
    body: "One sign-in adds Pancake to Claude or Codex. Your agent gets your Brain, 30+ data providers and the tools to reach out.",
    art: [{ kind: "anim", variant: "s0", status: "final" }],
    // retells S0_CONNECT (lp-step-data.ts): keep in sync
    alt: "Animation: in Claude, the pointer opens Connectors in the composer and connects Pancake, then allows it on Pancake's sign-in card for the Acme workspace. The Pancake connector appears in the composer, and Claude answers: Pancake is connected. I can now: read your Brain, search 30+ data providers, run Plays and reach out.",
  },
  /* Founder 2026-10-28, on step 02's end picture (the Play card "Funded startups hiring a
     marketing lead · 13 leads found · Review 13 leads"): "not sure we should show here the UI but
     maybe a juicy things showing claude + like plein de petites enveloppes qui partent de claude
     dans tous les sens dans le carré". So step 02 plays s4: the Claude mark in the middle, the
     envelopes bursting out of it. The designer's storyboard (s2) stays in the code, unused; its
     alt was: "Animation: in Claude, with Pancake connected, the request “Find founders who just
     raised a seed round” is typed and sent… and the Play card “Funded startups hiring a
     marketing lead” shows 13 leads found." */
  {
    num: "02",
    title: "Ask anything.\nPancake turns it into a Play.",
    body: "Describe the customers you want, in your own words. Pancake finds them, checks they fit and keeps the search running.",
    art: [{ kind: "anim", variant: "s4", status: "final" }],
    // retells S4_ASK and S4_MAIL (lp-step-data.ts): keep in sync
    alt: "Animation: in Claude, the request “Find founders who just raised a seed round” is typed. Pancake turns it into a Play, “Funded startups hiring a marketing lead”, which switches on, and a burst of small envelopes flies out of Claude in every direction.",
  },
  {
    num: "03",
    title: "Watch it get better.\nEvery lead teaches your Brain.",
    body: "It writes from your own accounts and follows up. Approve a lead or get a reply, and the next search lands closer to who buys.",
    art: [{ kind: "anim", variant: "s1", status: "final" }],
    // retells S1_LEADS, S1_VERDICTS, S1_LEARN, S1_ROWS and S1_HUBS[].label (lp-step-data.ts): keep in sync
    alt: "Animation: a young brain for Acme sits beside three leads. A founder who just raised a seed round is approved, the VP Marketing of a design agency is marked not a fit and a Head of Growth hiring a marketing lead replies; each verdict pings the brain and grows new branches. A panel, Who fits, fills in: Ideal clients, seed-stage founders; Best signal, hiring a marketing lead; Skip, agencies. The whole brain stays, its branches labeled Competitors, ICPs, Outreach, Influencers and Market Research.",
  },
];
