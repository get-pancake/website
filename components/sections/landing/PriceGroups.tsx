import { pricingV2 } from "@/lib/copy";

/**
 * The value list of the pricing card: an intro line, then one checked line
 * per thing every level includes (`pricingV2.value`, lib/copy.ts). The
 * figure-first lines of the flat plan left with it (2026-10-13). Rendered by
 * the server page and passed into the client PlanCard as children.
 * Server-rendered, zero JS.
 */
export function PriceGroups() {
  return (
    <div className="lv2-price-value">
      <p className="lv2-price-value-intro">{pricingV2.includedIntro}</p>
      <ul className="lv2-price-value-list">
        {pricingV2.value.map((v) => (
          <li key={v.rest}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M3 8.5 6.5 12 13 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{v.rest}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
