// Demo tour — the product demo of the /for pages, on the homepage (founder 2026-09-23, relaying
// the team: "blown away by this part, should probably be on the normal landing page"). Right
// after the customer logos: the hero promises, the logos vouch, then the product shows itself
// working before LpSteps explains the three steps behind it.
//
// NOT a fork: the /for demo as-is. VxPromptRows (the "Example prompts" rows) + VxDemo (tab bar,
// app window, foot; its VxDemoPlayer is the only client island, ~6 KB gz) fed by HOME_DEMO
// (lib/verticals/home-demo.ts: Studio Pelican, the homepage's own fictional customer, validated
// with the 40 /for configs). The section adds only its head: the /for section-head pattern
// (eyebrow = caps + pink bar, H2 left, lede right; foundation.css), whose H2 is HOME_DEMO's
// demo.h2 — so the demo band itself is `headless` (no second, hidden H2).
//
// Scope: `lp-vx` on this section only (every /for rule is `.lp-vx .x`, so nothing leaks onto
// the other homepage sections); styles = app/_styles/home-demo.css (foundation, prompts, demo +
// landing-v3/demo-tour.css for the spacing). A direct <section> child of main: the agents view
// hides it with every other human section (audience.css), and the island's clock stops there
// (display: none never intersects).

import { VxDemo } from "@/components/sections/verticals/VxDemo";
import { VxPromptRows } from "@/components/sections/verticals/VxPromptRows";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { HOME_DEMO } from "@/lib/verticals/home-demo";

const EYEBROW = "See it work";
const LEDE = "Studio Pelican makes launch videos for SaaS teams. Pick one of its prompts. Pancake turns it into signals, leads and a first message.";

export function LpDemoTour() {
  return (
    <section className="lp-vx lp-tour" aria-labelledby="lp-tour-title">
      <div className="vx-col lp-tour__head">
        <p className="vx-eyebrow">{EYEBROW}</p>
        <div className="vx-head">
          <h2 id="lp-tour-title" className="vx-h2 lp-display">
            {HOME_DEMO.demo.h2}
          </h2>
          <p className="vx-lede">{vxNoWidow(LEDE)}</p>
        </div>
        <VxPromptRows prompts={HOME_DEMO.demo.prompts} />
      </div>
      <VxDemo v={HOME_DEMO} headless />
    </section>
  );
}
