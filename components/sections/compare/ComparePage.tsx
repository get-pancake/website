import { CompareAlternatives } from "@/components/sections/compare/CompareAlternatives";
import { CompareHubGrid } from "@/components/sections/compare/CompareHubGrid";
import { compareJsonLd } from "@/components/sections/compare/compare-jsonld";
import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";

/**
 * /compare — every comparison page in one place (2026-10-07; Alta links a /compare hub from its
 * footer, Origami a "Comparisons" footer column, Unify and Octave their resources menus). Built
 * like the /for hub from the /for kit (.lp-vx: text edge, section rhythm, VxHead, hub cards,
 * Related rows) and the homepage's nav, CTA card and footer:
 *
 *   Nav → Head (H1 + lede) → cards by group (GTM tools, AI agents) → the GTM "alternatives"
 *   guides → CTA card (homepage copy and ids, app_final / call_final, as on /for) → Footer
 *
 * No new CTA ids, so nothing to allow-list in lib/analytics/data-layer.ts. Every section is a
 * server component with zero JS of its own; the client islands are the shared landing-v3 ones.
 */
export function ComparePage() {
  return (
    // No id here: the skip link's #main-content target is the head section, past the nav.
    <main className="lp lp-vx lp-vx-compare">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd()) }} />
      {/* --lp-fit for the CTA slivers (iOS cqw-in-trig workaround) */}
      <LpFitVars />
      <LpNav />
      <CompareHubGrid />
      <CompareAlternatives />
      <LpCta />
      <LpFooter />
    </main>
  );
}
