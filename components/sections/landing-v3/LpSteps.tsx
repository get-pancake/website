// Steps — "Pancake fills your pipeline." (Figma 4636:3164, 1622×1741 — the 2026-09-02
// revision: the designer's vector illustrations, each replaced by its storyboard
// loop as the founder approved it; since 2026-09-07 the three loops animate IN PLACE
// as DOM + CSS + GSAP — LpStepAnim, the same treatment as the feature cards — instead
// of being served as mp4s). Heading block + 3 checkerboard rows: 656px text card +
// 464×426 media card. Copy follows the artboard except casing: founder rule
// (2026-08-28) — no capitals on common nouns mid-sentence ("sells it", "your
// business", "GTM brain"). Founder copy pass (2026-09-03): the section heading
// ("Pancake fills your pipeline.", was "Pancake sells it") is his words verbatim —
// not the artboard's (V2 4911:373 still shows V1's "While You Run your Business," /
// "Pancake Sells it": not a delta, production wins).
// The steps' copy, alt text and art slots live in lp-steps-content.ts (2026-10-09: each
// row's art is an explicit, data-driven slot; the copy history is there). 2026-10-11: the
// designer delivered rows 02 and 03 ("How it works" storyboards) — step 02 is a new
// animation under a new title, step 03 gains an intro in front of its calendar.

import { SHOW_PLACEHOLDERS, visibleEntries } from "@/lib/placeholders";

import { LpStepAnim } from "./LpStepAnim";
import { STEPS, type StepContent } from "./lp-steps-content";

/** A step's art card: the first candidate this environment may show (lp-steps-content.ts
    StepArt). Production with no final candidate fails the build: an empty step card
    never ships. */
function StepArtSlot({ step }: { step: StepContent }) {
  const art = visibleEntries(step.art, SHOW_PLACEHOLDERS)[0];
  if (!art) {
    throw new Error(`LpSteps: step ${step.num} has no final art — an empty step card never ships to production`);
  }
  const placeholder = art.status === "placeholder" ? "" : undefined;
  if (art.kind === "anim") {
    return (
      <LpStepAnim
        className="lp-steps__media"
        variant={art.variant}
        alt={step.alt}
        placeholder={art.status === "placeholder"}
        showPlaceholders={SHOW_PLACEHOLDERS}
      />
    );
  }
  if (art.kind === "image") {
    return (
      <div className="lp-steps__media lp-steps__media--image" role="img" aria-label={step.alt} data-placeholder={placeholder}>
        <img src={art.src} alt="" width={art.width} height={art.height} loading="lazy" decoding="async" />
      </div>
    );
  }
  // an empty card (dev + preview only: kind "empty" is placeholder by type)
  return <div className="lp-steps__media" aria-hidden="true" data-placeholder="" />;
}

export function LpSteps() {
  return (
    <section className="lp-steps" id="how-it-works">
      <div className="lp-steps__org">
        <header className="lp-steps__head">
          {/* one line, no kicker (founder 2026-10-28: "This stuff should be a one liner", on
              "With Pancake underneath, / Your agent runs your GTM."; before that "Find a better
              one liner here" and, on "Pancake fills your pipeline.", "this still sounds a bit like
              verticalized sdr agent"): the visitor's agent is the actor, Pancake what it runs on.
              At 57px the title holds one line up to ≈ 28 characters ("With Pancake underneath,
              your agent runs your GTM." and "…your GTM on Pancake." took two) */}
          <h2 className="lp-steps__title lp-title-section">Your agent runs on Pancake.</h2>
        </header>
        <div className="lp-steps__list">
          {STEPS.map((step) => (
            <div
              className="lp-steps__row"
              key={step.num}
              data-lp-slot={`step-${step.num}`}
              data-lp-pending={step.pending ? "" : undefined}
            >
              <div className="lp-steps__text">
                <p className="lp-steps__num lp-display">{step.num}</p>
                <span className="lp-steps__spacer" aria-hidden="true" />
                <h3 className="lp-steps__step-title lp-display">{step.title}</h3>
                <p className="lp-steps__body">{step.body}</p>
              </div>
              <StepArtSlot step={step} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
