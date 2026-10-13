import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";

/**
 * /pricing — the customer logos under the plan card (2026-10-07: no proof
 * sat next to the price). It renders the homepage marquee itself, so the
 * logos, their order, their optical sizing and the slow-on-hover behaviour
 * stay the founder's single list in LpMarquee.tsx. A moving strip since
 * 2026-10-13 (founder, on the frozen two-row version: "this => carousel").
 * The label claims use, never a result ("Used by teams at", not "Teams
 * finding customers with Pancake").
 */
export function PricingLogos() {
  return (
    <div className="lv2-pricing-logos">
      <p className="lv2-pricing-logos-label">Used by teams at</p>
      <LpMarquee />
    </div>
  );
}
