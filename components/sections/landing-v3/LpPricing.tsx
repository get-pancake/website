import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { BASE_LEVEL, formatCredits } from "@/lib/pricing";
import { TRIAL_OFFER } from "@/lib/trial";

/**
 * Landing v3 — Pricing (Figma node 4257:5083, 1654×890, bg #000).
 * The grouped rainbow art (lp-pancakes-pricing.svg, 1654×1039) paints the cream
 * top area + wave over the black section; its 148px spill below the section is
 * black-on-black against the footer, so the section clips it safely.
 */

/* Six lines, so the layout holds. The card shows the plan's first level
   (lib/pricing.ts BASE_LEVEL); /pricing has the picker for the others.
   2026-10-13, the credit plan (pancake-cmo PR #1220). Every line says what
   the buyer gets, never how the plan is built (founder, same day, on a first
   draft that listed credits, Plays and seats: "not all fully value oriented
   for the user"):
   1. the outcome first: what Pancake is built for, not a promise (founder
      2026-10-04: prospects kept asking how we can guarantee customers; the
      Terms promise no results);
   2. what the price buys and what a lead is worth: the credits, and that
      every lead is checked against your ICP (a researched buyer, not a
      name). No estimate of leads beside the price (founder 2026-10-13: "ça
      fait poser des questions"; "sinon ça fait cher juste le lead"): it is
      on /pricing, after the section that says what one lead is. "…and leads
      as you want" left with the flat plan;
   3. rollover, said as the month it saves (up to one month of credits is
      kept at renewal; /pricing has the detail);
   4. Plays, said as the freedom they give: creating and testing a Play is
      free in the app, only a search uses credits;
   5. and 6. the message and the control line, unchanged in substance: you
      approve every lead before anyone is contacted (message review is
      optional, so never "approvals on messages").
   No spend cap (founder 2026-09-19). Same facts in pricingV2.value
   (lib/copy.ts) and the /for checklist. */
const CHECKLIST = [
  // \u00a0 keeps the last two words together when a narrow phone wraps the line.
  "Built to land 2 to 3 customers\u00a0a\u00a0month.",
  `${formatCredits(BASE_LEVEL.credits)} credits a month. Every lead checked against your\u00a0ICP.`,
  "Slow month? Unused credits roll\u00a0over.",
  "Try any GTM idea. Building a Play is\u00a0free.",
  "A personal message for each lead, in your\u00a0voice.",
  "You approve every lead before anyone is\u00a0contacted.",
];

/** No JS: no canvas will ever draw the rainbow and nothing sets [data-lp-gl-off],
 *  so the static rings are shown (anim.css hides them until a script decides).
 *  One class more specific than that rule. 2026-10-13. */
const NOSCRIPT_CSS = "<style>.lp-price .lp-price-art .lp-anim-box{visibility:visible}</style>";

/**
 * Optional `checklist` (the /for pages, spec §2.10): omitted, the homepage
 * CHECKLIST above renders unchanged.
 */
export function LpPricing({ checklist = CHECKLIST }: { checklist?: readonly string[] } = {}) {
  return (
    <section id="pricing" className="lp-price">
      <div className="lp-price-frame">
        <h2 className="lp-title-section lp-price-title">Simple, transparent pricing</h2>
        <div className="lp-price-body">
          <div className="lp-price-price">
            {/* Founder copy (2026-09-03): "$99/month" replaces the artboard's
                "99 USD" + "per month, flat" — the number keeps the display
                size, "/month" rides the old per-line style inline.
                2026-10-13: "From" in the same per-line style, because the
                plan has higher levels of monthly credits. */}
            <p className="lp-price-amount">
              <span className="lp-price-per lp-price-from">From </span>${BASE_LEVEL.dollars}
              <span className="lp-price-per">/month</span>
            </p>
          </div>
          <ul className="lp-price-list">
            {checklist.map((item) => (
              <li key={item} className="lp-price-item">
                <img src="/lp/lp-p-check.svg" alt="" width={24} height={24} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Pricing keeps the primary only (founder 2026-09-03, "enlève Book a
            demo du pricing") — the one surface without the secondary pill. */}
        <div className="lp-price-ctas">
          <LpFxLink
            href={APP_ORIGIN}
            size="lg"
            className="lp-price-cta"
            data-analytics-id="app_pricing_card"
          >
            Start free
          </LpFxLink>
        </div>
        <p className="lp-price-note">{TRIAL_OFFER}</p>
        {/* The route to /pricing (2026-10-07: the homepage linked it from the
            footer only). A text link, not a pill, so Start free stays this
            card's one CTA. */}
        <p className="lp-price-more">
          <a className="lp-textlink" href="/pricing">
            See how credits work<span aria-hidden="true"> →</span>
          </a>
        </p>
      </div>
      {/* Animated pancakes group: 1654×1039 canvas where the old composite img
          sat (top -0.66px, centered); the 2622×1039 container's left offset
          within it is -272px (see anim.css .lp-anim-box--pricing). */}
      {/* NOTE: no opaque backing may live in this canvas — the art overlaps
          the footer by design (arcs sweep over its black), so anything
          opaque here covers the footer's logo (learned 2026-09-01: a black
          "floor" div blanked the Pancake logo). The wrapper's cream disc
          (pricing.css, 2026-10-13) stays above the section's bottom edge
          and under the rings' ink. */}
      <div className="lp-price-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--pricing">
          <LpPancakes variant="pricing" />
        </div>
        {/* desktop rotation on one WebGL canvas (LpRainbowGL.tsx); the DOM
            rings above stay as the static fallback */}
        <LpRainbowGL variant="pricing" />
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
      </div>
    </section>
  );
}
