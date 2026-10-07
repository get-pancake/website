import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { PlaysExamples } from "@/components/sections/plays/PlaysExamples";
import { PlaysFaq } from "@/components/sections/plays/PlaysFaq";
import { PlaysHead } from "@/components/sections/plays/PlaysHead";
import { PlaysWays } from "@/components/sections/plays/PlaysWays";
import { PLAYS_CTA } from "@/components/sections/plays/plays-copy";
import { playGroups, playsDescription } from "@/components/sections/plays/plays-data";
import { playsJsonLd } from "@/components/sections/plays/plays-jsonld";
import { VX_PRICING_CHECKLIST, VX_PRICING_MODE } from "@/components/sections/verticals/vx-copy";

/**
 * /plays — example Plays (audit plan 3.7, 2026-10-07; Origami has /flows, Unify /product/plays).
 * Built from the /for kit (.lp-vx: text edge, section rhythm, VxHead, kit badges, the Signals
 * card and FAQ recipes) and the homepage's nav, CTA card, pricing and footer, like the /for hub:
 *
 *   Nav → Head (H1 + CTA pair + jump links) → the 120 /for prompts by signal kind, each linking
 *   to its /for page → More ways (funding, lookalikes, role match, web evidence, one post) →
 *   FAQ → CTA card → Pricing (the /for checklist) → Footer
 *
 * Every section is a server component with zero JS of its own; the client islands are the shared
 * landing-v3 ones (nav menu, pills, the CTA and pricing rainbow canvases).
 */
export function PlaysPage() {
  const groups = playGroups();
  return (
    // No id here: the skip link's #main-content target is the head section (PlaysHead), past the nav.
    <main className="lp lp-vx lp-vx-plays">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(playsJsonLd(groups, playsDescription())) }}
      />
      {/* --lp-fit for the CTA slivers + pricing art (iOS cqw-in-trig workaround) */}
      <LpFitVars />
      <LpNav />
      <PlaysHead groups={groups} />
      <PlaysExamples groups={groups} />
      <PlaysWays />
      <PlaysFaq />
      <LpCta title={PLAYS_CTA.title} body={PLAYS_CTA.body} />
      <LpPricing checklist={VX_PRICING_MODE === "truthful" ? VX_PRICING_CHECKLIST : undefined} />
      <LpFooter />
    </main>
  );
}
