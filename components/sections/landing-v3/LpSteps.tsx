// Steps — "Pancake fills your pipeline." (Figma 4636:3164, 1622×1741 — the 2026-09-02
// revision: the designer's vector illustrations, each replaced by its storyboard
// loop as the founder approved it; since 2026-09-07 the three loops animate IN PLACE
// as DOM + CSS + GSAP — LpStepAnim, the same treatment as the feature cards — instead
// of being served as mp4s). Heading block + 3 checkerboard rows: 656px text card +
// 464×426 media card. Copy follows the artboard except casing: founder rule
// (2026-08-28) — no capitals on common nouns mid-sentence ("sells it", "your
// business", "GTM brain") — and step 03, whose artboard copy the founder
// overrode in the brief (2026-09-02): "Pancake gets you the meeting. / You
// close it." + the follow-up body. Founder copy pass (2026-09-03): the
// section heading ("Pancake fills your pipeline.", was "Pancake sells it")
// and the step 01 body ("From your website, Pancake learns…") are his words
// verbatim — not the artboard's. 2026-09-30, AI SEO retired (pancake-cmo PR
// #1037): step 01 ends on "where to find them" (was "where to show up"), step
// 02 talks Plays + lead approval + outreach (was "gets you found on Google and
// ChatGPT"), and the step 02 Agents list swaps its Content / AI search rows
// for Plays / Messages (S2_ROWS in lp-step-data.ts). 2026-10-07: step 02
// says each Play keeps searching for people who fit (it named an
// intent the product can't see, an overclaim validate.ts bans), and its
// checklist learns from every review, not every reply (the brain learns from
// the leads you approve or reject; reply signals are deferred, pancake-cmo
// ADR 0043).
// 2026-10-07 (founder): step 03 keeps its title, its body describes what
// Pancake does after the first message (follows up, reads the reply, answers
// a yes with your calendar link, hands back the rest) instead of promising a
// qualified meeting, and the calendar chips say "Booked", not "Closed":
// Pancake can't know a deal closed.

import { LpStepAnim } from "./LpStepAnim";
import type { StepVariant } from "./lp-step-timelines";

type Step = {
  num: string;
  title: string;
  body: string;
  /** Storyboard animation (pancake-studio shorts/<name>, the composition the
      mp4 used to be rendered from) — in-page DOM + CSS + GSAP (LpStepAnim):
      plays once when the card comes into view and holds its last frame
      (the brain / the Agents view / the filled calendar); at rest the card
      is the composition's first frame. */
  variant: StepVariant;
  /** What the animation shows — the only copy a screen reader gets. */
  alt: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Add your website.\nPancake builds your GTM brain.",
    body: "From your website, Pancake learns who buys from you, what to say, and where to find them. Always up to date.",
    variant: "s1",
    alt: "Animation: a website address is typed and researched; from the Studio Pelican node a knowledge graph blooms — purple, green, pink, orange and blue branches — then a market profile fills in: Company, Offering, Ideal clients.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Each Play keeps searching for people who fit. You approve each one. Pancake writes to them under your name.",
    variant: "s2",
    // lists S2_ROWS and S2_ITEMS (lp-step-data.ts) in order: keep in sync
    alt: "Animation: an Agents list with Pipeline (24 warm leads), Signals (48 detected), Plays (3 active), Replies (12 received), Messages (72 sent). The Pipeline agent opens its checklist by itself and works through it: monitor buying signals, find people who fit your ICP, enrich every prospect, score leads for ICP fit, write outreach in your voice, follow up automatically. Each item loads, then ticks.",
  },
  {
    num: "03",
    title: "Pancake gets you the meeting.\nYou close it.",
    body: "Pancake follows up until they answer, then reads the reply. A yes gets your calendar link, sent from your account. Every other answer comes back to you.",
    variant: "s3",
    alt: "Animation: a calendar week in October 2026 fills up day by day with meetings — Samantha M., Julien Aubert, Martin Torres and Studio P, Lumen Collective, Fernhollow Studio, a Martin C. follow-up — each past meeting marked booked or follow-up as the days go by.",
  },
];

export function LpSteps() {
  return (
    <section className="lp-steps" id="how-it-works">
      <div className="lp-steps__org">
        <header className="lp-steps__head">
          <p className="lp-steps__kicker">While you run your business,</p>
          <h2 className="lp-steps__title lp-title-section">Pancake fills your pipeline.</h2>
        </header>
        <div className="lp-steps__list">
          {STEPS.map((step) => (
            <div className="lp-steps__row" key={step.num}>
              <div className="lp-steps__text">
                <p className="lp-steps__num lp-display">{step.num}</p>
                <span className="lp-steps__spacer" aria-hidden="true" />
                <h3 className="lp-steps__step-title lp-display">{step.title}</h3>
                <p className="lp-steps__body">{step.body}</p>
              </div>
              <LpStepAnim className="lp-steps__media" variant={step.variant} alt={step.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
