/**
 * Homepage pricing teaser — a full-width pink band (Figma-less, net-new for
 * landing v4). The homepage never mentioned price, yet the honest $49-flat
 * pricing is Pancake's sharpest differentiator — this strip surfaces it and
 * routes to /pricing + signup.
 *
 * Visual intent: the band sits on `--weak-branded-surface` (pink-10) so it
 * deliberately breaks the plain/alt (`--surface`/`--alt-surface`) rhythm of
 * the surrounding `home-landing-section`s and reads as a moment, not a section.
 *
 * All numbers derive from the `pricing` copy block in `lib/copy.ts` (single
 * source of truth — no hardcoded dollars):
 *   - headline   ← pricing.manifesto.title        ("No tiers. No tricks.")
 *   - $49        ← pricing.infrastructureDollars
 *   - trial chips ← shared trial disclosure in lib/trial.ts
 *
 * Styles live in `app/_styles/home-pricing-teaser.css` (imported below —
 * App Router allows global CSS imports from any component, so the section
 * stays self-contained and needs no layout.tsx wiring).
 */

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { H2 } from "@/components/ui/Headings";
import { pricing } from "@/lib/copy";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { TRIAL_CARD_REQUIREMENT, TRIAL_LABEL } from "@/lib/trial";
import "@/app/_styles/home-pricing-teaser.css";

/**
 * Trial disclosures match the closing CTA; cancellation wording remains
 * consistent with the existing pricing copy.
 */
const PROOF_CHIPS = [
  TRIAL_LABEL,
  TRIAL_CARD_REQUIREMENT,
  "Cancel anytime",
] as const;

/** 16×16 check — `currentColor` so it inherits the chip's chrome-100 text. */
function ChipCheckIcon() {
  return (
    <svg
      className="home-pricing-teaser__chip-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
      focusable="false"
    >
      <path
        d="M3 8.5 6.5 12 13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Decorative two-tone pancake — same side + top silhouette as
 * `public/pancake-svgs/angled-1.svg` (and `DecorPancake` in HomeLandingBody,
 * which isn't exported — paths duplicated on purpose). Fills reference the
 * `--home-pricing-teaser-pancake-{side,top}` CSS vars (declared in the CSS
 * file) so the orchestrator can rewire the shared pancake palette later
 * without touching this markup. This blob is the section's one pancake wink.
 */
function TeaserPancake() {
  return (
    <svg
      className="home-pricing-teaser__pancake"
      viewBox="0 0 49 48"
      aria-hidden
      focusable="false"
    >
      {/* Side (lighter tint — the back/under disc) */}
      <path
        d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
        fill="var(--home-pricing-teaser-pancake-side)"
      />
      {/* Top (darker tint — the top disc) */}
      <path
        d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
        fill="var(--home-pricing-teaser-pancake-top)"
      />
    </svg>
  );
}

export function HomePricingTeaser() {
  return (
    <section
      className="home-landing-section home-pricing-teaser"
      aria-labelledby="home-pricing-teaser-heading"
    >
      <TeaserPancake />
      <div className={`${HOME_PAGE_CONTAINER_CLASS} home-pricing-teaser__inner`}>
        {/* LEFT (desktop) / TOP (mobile) — the promise */}
        <div className="home-pricing-teaser__copy">
          {/*
            Deviates from the usual `home-landing-section__title text-center`
            pattern on purpose: `text-center` is a tw-utility (last layer) and
            would beat the component-layer left-align at `lg`, so alignment is
            handled entirely in home-pricing-teaser.css (center < lg, left ≥ lg).
          */}
          <H2
            id="home-pricing-teaser-heading"
            className="heading home-landing-section__title home-pricing-teaser__title"
          >
            {pricing.manifesto.title}
          </H2>
          <p className="home-pricing-teaser__lede">
            <strong>
              {pricing.currencySymbol}
              {pricing.infrastructureDollars}/month flat
            </strong>{" "}
            for your always-on AI coworker. Tokens at the labs’ public price.
          </p>
        </div>

        {/* RIGHT (desktop) / BELOW (mobile) — proof chips + CTAs */}
        <div className="home-pricing-teaser__panel">
          {/* `role="list"` restores list semantics lost to `list-style: none` (Safari/VO) */}
          <ul className="home-pricing-teaser__chips" role="list">
            {PROOF_CHIPS.map((chip) => (
              <li key={chip} className="home-pricing-teaser__chip">
                <ChipCheckIcon />
                {chip}
              </li>
            ))}
          </ul>
          <div className="home-pricing-teaser__cta">
            {/*
              Signup CTA MUST stay a real <a href={APP_ORIGIN}>
              anchor — analytics fires on the hostname (no buttons/router).
              Class string mirrors the closing CTA in HomeLandingBody.
            */}
            <a
              href={APP_ORIGIN}
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Get started for free
            </a>
            <a
              href="/pricing"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-variant="outline"
              data-size="lg"
            >
              See pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
