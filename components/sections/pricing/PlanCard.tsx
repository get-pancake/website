"use client";

import { MotionConfig } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { FxPillLink } from "@/components/sections/landing/FxPill";
import { PancakeStack } from "@/components/sections/pricing/PancakeStack";
import { isLevelKey, usePricingLevel } from "@/components/sections/pricing/PricingLevel";
import {
  BASE_LEVEL,
  CREDIT_LEVELS,
  appHrefForLevel,
  formatCredits,
  formatDollars,
  shortCredits,
  type CreditLevel,
} from "@/lib/pricing";

/**
 * /pricing — the one plan card, composed like the V1 pricing hero (2026-05):
 * what you choose on the left, the pancake stack on the right, growing by one
 * pancake per level (founder 2026-10-13: "reuse the animation from pancake v1
 * … growing the package stacked the pancake"). Under both, across the card,
 * what every level includes: it comes in as `children` from the server page,
 * which also hands over every string, so lib/copy.ts stays out of the client
 * bundle.
 *
 * The "Monthly credits" picker (five radios drawn as one segmented row) sets
 * the price, the credits line, the stack and where Start free goes: the app
 * opens onboarding on the chosen level (lib/pricing.ts `appHrefForLevel`).
 * The level lives in PricingLevel.tsx, which the closing band's Start free
 * reads too. The server HTML is the first level ($99, 60,000 credits, one
 * pancake), so the page reads right before hydration and without JavaScript.
 * The browser can hold another radio by then (Firefox restores the form on a
 * reload, a visitor can tap a level before hydration), and the highlight
 * follows that radio: on mount the level is read back from it. Native radios
 * give arrow-key selection for free. The short labels ("60k") replace the
 * long ones on narrow screens in CSS; each radio carries its full name for
 * screen readers. The stack is decoration (aria-hidden) and stands still for
 * visitors who ask for reduced motion.
 */
export function PlanCard({
  pickerLabel,
  pickerHint,
  perMonth,
  creditsLine,
  saveLabels,
  demoHref,
  fine,
  children,
}: {
  pickerLabel: string;
  /** "Start on any level. Change anytime.", on the label's line. */
  pickerHint: string;
  perMonth: string;
  creditsLine: string;
  /** "Save 4.5% per credit" per level key; absent for the first level. */
  saveLabels: Partial<Record<CreditLevel["key"], string>>;
  demoHref: string;
  fine: string;
  children: ReactNode;
}) {
  const { level: key, setLevel: setKey } = usePricingLevel();
  const picker = useRef<HTMLFieldSetElement>(null);
  // Hydration keeps the radio the browser has checked; start from it, or the
  // price and Start free stay on the first level under another highlighted pill.
  useEffect(() => {
    const checked = picker.current?.querySelector<HTMLInputElement>("input:checked")?.value;
    if (checked && isLevelKey(checked)) setKey(checked);
  }, [setKey]);
  const index = Math.max(
    0,
    CREDIT_LEVELS.findIndex((l) => l.key === key),
  );
  const level = CREDIT_LEVELS[index] ?? BASE_LEVEL;
  const name = useId();
  const save = saveLabels[level.key];

  return (
    <div className="lv2-price-card">
      <div className="lv2-price-info">
        <fieldset ref={picker} className="lv2-credit-picker">
          <legend className="lv2-credit-picker-label">
            <span>{pickerLabel}</span>
            <span className="lv2-credit-picker-hint">{pickerHint}</span>
          </legend>
          <div className="lv2-credit-options">
            {CREDIT_LEVELS.map((l) => (
              <label key={l.key} className="lv2-credit-option">
                <input
                  type="radio"
                  name={name}
                  value={l.key}
                  checked={l.key === key}
                  onChange={() => setKey(l.key)}
                  aria-label={`${formatCredits(l.credits)} ${creditsLine}, ${formatDollars(l.dollars)}`}
                />
                <span className="lv2-credit-option-face" aria-hidden="true">
                  <span className="lv2-credit-long">{formatCredits(l.credits)}</span>
                  <span className="lv2-credit-short">{shortCredits(l.credits)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* One live region for the price and what it buys: a screen reader
            hears the new figures when the level changes. */}
        <div className="lv2-price-now" aria-live="polite" aria-atomic="true">
          <p className="lv2-price-figure">
            <span className="lv2-price-amount">{formatDollars(level.dollars)}</span>
            <span className="lv2-price-cycle">{perMonth}</span>
          </p>
          <p className="lv2-price-sub">
            <span>
              <strong className="lv2-price-credits">{formatCredits(level.credits)}</strong> {creditsLine}
            </span>
            {save ? (
              <span className="badge lv2-price-save" data-variant="success">
                {save}
              </span>
            ) : null}
          </p>
        </div>

        {/* Start free → Book a demo, like the nav (founder 2026-09-03: primary
            first, everywhere). */}
        <div className="lv2-price-actions">
          <div className="lv2-button-group">
            <FxPillLink href={appHrefForLevel(level.key)} data-analytics-id="app_pricing_page">
              Start free
            </FxPillLink>
            <FxPillLink variant="outline" href={demoHref} data-analytics-id="call_pricing_page">
              Book a demo
            </FxPillLink>
          </div>
          <p className="lv2-price-fine">{fine}</p>
        </div>
      </div>

      {/* One pancake per level: 1 at 60,000 credits, 5 at 960,000. */}
      <div className="lv2-price-mascot" aria-hidden="true">
        <MotionConfig reducedMotion="user">
          <PancakeStack count={(index + 1) as 1 | 2 | 3 | 4 | 5} />
        </MotionConfig>
      </div>

      <div className="lv2-price-perks">{children}</div>
    </div>
  );
}
