import { pricingV2 } from "@/lib/copy";

/**
 * The value list of the pricing card, Okara-shaped: an intro line, then what a
 * month buys with the figure up front (the founder's own ranges; an optional
 * `lead` goes before it). Shared by
 * the homepage card and /pricing. Server-rendered, zero JS.
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
            <span>
              {"lead" in v ? `${v.lead} ` : null}
              {"figure" in v && <strong className="lv2-price-value-figure">{v.figure}</strong>}
              {"figure" in v ? " " : null}
              {v.rest}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
