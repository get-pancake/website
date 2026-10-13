"use client";

import { useId, useState, type ReactNode } from "react";

import { FxPillLink } from "@/components/sections/landing/FxPill";
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
 * /pricing — the one plan card. A "Monthly credits" picker (five radios drawn
 * as one segmented row) sets the price, the credits line and where Start free
 * goes: the app opens onboarding on the chosen level (lib/pricing.ts
 * `appHrefForLevel`). Everything under the credits line is the same at every
 * level, so it comes in as `children` from the server page, which also hands
 * over every string: lib/copy.ts stays out of the client bundle.
 *
 * The server HTML is the first level ($99, 60,000 credits), so the page reads
 * right before hydration and without JavaScript. Native radios give arrow-key
 * selection for free. The short labels ("60k") replace the long ones on
 * narrow screens in CSS; each radio carries its full name for screen readers.
 */
export function PlanCard({
  pickerLabel,
  perMonth,
  creditsLine,
  saveLabels,
  demoHref,
  fine,
  children,
}: {
  pickerLabel: string;
  perMonth: string;
  creditsLine: string;
  /** "Save 4.5% per credit" per level key; absent for the first level. */
  saveLabels: Partial<Record<CreditLevel["key"], string>>;
  demoHref: string;
  fine: string;
  children: ReactNode;
}) {
  const [key, setKey] = useState<CreditLevel["key"]>(BASE_LEVEL.key);
  const level = CREDIT_LEVELS.find((l) => l.key === key) ?? BASE_LEVEL;
  const name = useId();
  const save = saveLabels[level.key];

  return (
    <div className="lv2-price-card">
      <fieldset className="lv2-credit-picker">
        <legend className="lv2-credit-picker-label">{pickerLabel}</legend>
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

      {children}

      {/* Start free → Book a demo, like the nav (founder 2026-09-03: primary
          first, everywhere). */}
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
  );
}
