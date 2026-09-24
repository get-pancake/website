// Demo tour — the product demo of the /for pages, on the homepage (founder 2026-09-23, relaying
// the team: "blown away by this part, should probably be on the normal landing page"). Right
// after the customer logos: the hero promises, the logos vouch, then the product shows itself
// working before LpSteps explains the three steps behind it.
//
// Just the four tabs (founder 2026-09-24, on the preview: "remove this part but only keep the 4
// tabs"): no eyebrow, H2, lede or example-prompt rows here — the tab bar is the section's visible
// head, and autoplay walks the three prompts on its own (Slack → the next prompt's Brief). The H2
// stays for screen readers and the document outline, visually hidden.
//
// NOT a fork: the /for demo as-is. VxDemo (tab bar, app window, foot; its VxDemoPlayer is the only
// client island, ~6 KB gz) fed by HOME_DEMO (lib/verticals/home-demo.ts: Studio Pelican, the
// homepage's own fictional customer, validated with the 40 /for configs). `headless` = no second
// hidden H2 inside the band and a lazy Slack avatar (the demo sits below the fold here).
//
// Scope: `lp-vx` on this section only (every /for rule is `.lp-vx .x`, so nothing leaks onto the
// other homepage sections); styles = app/_styles/home-demo.css (foundation, demo +
// landing-v3/demo-tour.css for the spacing). A direct <section> child of main: the agents view
// hides it with every other human section (audience.css), and the island's clock stops there
// (display: none never intersects).

import { VxDemo } from "@/components/sections/verticals/VxDemo";
import { HOME_DEMO } from "@/lib/verticals/home-demo";

export function LpDemoTour() {
  return (
    <section className="lp-vx lp-tour" aria-labelledby="lp-tour-title">
      <h2 id="lp-tour-title" className="lp-sr-only">
        {HOME_DEMO.demo.h2}
      </h2>
      {/* the first start waits for the app window (≥768), not the composer */}
      <VxDemo v={HOME_DEMO} headless gate="window" />
    </section>
  );
}
