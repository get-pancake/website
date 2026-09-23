import { LpAnimFreeze } from "@/components/sections/landing-v3/LpAnimFreeze";
import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { LpPricing } from "@/components/sections/landing-v3/LpPricing";
import { VxControl } from "@/components/sections/verticals/VxControl";
import { VxDemo } from "@/components/sections/verticals/VxDemo";
import { VxFaq } from "@/components/sections/verticals/VxFaq";
import { VxHero } from "@/components/sections/verticals/VxHero";
import { VxRelated } from "@/components/sections/verticals/VxRelated";
import { VxSignals } from "@/components/sections/verticals/VxSignals";
import {
  VX_CTA_BODY,
  VX_PRICING_CHECKLIST,
  VX_PRICING_MODE,
} from "@/components/sections/verticals/vx-copy";
import { verticalJsonLd } from "@/components/sections/verticals/vx-jsonld";
import type { VerticalConfig } from "@/lib/verticals/types";

/**
 * One /for/<slug> page from one VerticalConfig (spec §2, order D8):
 * Nav → Hero → How it works (demo) → Logos → Signals → Control → FAQ →
 * Related → CTA → Pricing → Footer. Every section is a server component;
 * the demo's VxDemoPlayer is the page's only client island (plus the
 * shared landing-v3 islands the homepage already ships: nav menu, pills,
 * rainbow canvases, marquee freeze).
 */
export function VxPage({ v }: { v: VerticalConfig }) {
  return (
    // No id here: the skip link's #main-content target is the hero (VxHero), so it lands past
    // the nav instead of on the logo; main.lp stays the kit's selector root.
    <main className="lp lp-vx">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(verticalJsonLd(v)) }}
      />
      {/* --lp-fit for the hero art + CTA slivers (iOS cqw-in-trig workaround) */}
      <LpFitVars />
      {/* frees the marquee's GPU layers off-screen (iPhone OOM guard) */}
      <LpAnimFreeze />
      <LpNav />
      <VxHero v={v} />
      <VxDemo v={v} />
      {/* D19: the homepage marquee as-is — no label, no vertical claim */}
      <div className="vx-sec vx-logos">
        <LpMarquee />
      </div>
      <VxSignals v={v} />
      <VxControl v={v} />
      <VxFaq v={v} />
      <VxRelated v={v} />
      <LpCta title={v.cta.title} body={VX_CTA_BODY} />
      <LpPricing checklist={VX_PRICING_MODE === "truthful" ? VX_PRICING_CHECKLIST(v.slug) : undefined} />
      <LpFooter />
    </main>
  );
}
