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
// demo.h2 and whose eyebrow / lede are HOME_DEMO.head — so the demo band itself is `headless`
// (no second, hidden H2). On the homepage the band loses its cream stripe and hairlines
// (demo-tour.css): every other homepage surface is a rounded card, none is a full-bleed stripe.
//
// Scope: `lp-vx` on this section only (every /for rule is `.lp-vx .x`, so nothing leaks onto
// the other homepage sections); styles = app/_styles/home-demo.css (foundation, prompts, demo +
// landing-v3/demo-tour.css for the spacing). A direct <section> child of main: the agents view
// hides it with every other human section (audience.css), and the island's clock stops there
// (display: none never intersects).

import { Fragment } from "react";

import { VxDemo } from "@/components/sections/verticals/VxDemo";
import { VxPromptRows } from "@/components/sections/verticals/VxPromptRows";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { HOME_DEMO } from "@/lib/verticals/home-demo";

// the head's copy lives in HOME_DEMO.head, so the build lints it with the demo (banned claims,
// platform names) and the budget script measures the lede
const HEAD = HOME_DEMO.head;
// the H2 is two sentences on two lines (720 max): each sentence unbroken, so the line breaks
// between them ("One prompt in. / Leads every morning."), never inside one (≥360; demo-tour.css)
const H2_SENTENCES = HOME_DEMO.demo.h2.split(/(?<=\.)\s+/);

export function LpDemoTour() {
  return (
    <section className="lp-vx lp-tour" aria-labelledby="lp-tour-title">
      <div className="vx-col lp-tour__head">
        <p className="vx-eyebrow">{HEAD.eyebrow}</p>
        <div className="vx-head">
          <h2 id="lp-tour-title" className="vx-h2 lp-display">
            {H2_SENTENCES.map((t, i) => (
              <Fragment key={i}>
                {i ? " " : null}
                <span className="lp-tour__s">{t}</span>
              </Fragment>
            ))}
          </h2>
          <p className="vx-lede">{vxNoWidow(HEAD.lede)}</p>
        </div>
        {/* no visible "Example prompts" label here: the lede already says "pick one of its prompts"
            (critic 2026-09-23: two caps labels 156px apart, the second repeating the lede) */}
        <VxPromptRows prompts={HOME_DEMO.demo.prompts} label="hidden" />
      </div>
      {/* the first start waits for the app window (≥768), not the composer: the section head
          sits above it here, so the composer-only gate left laptops on the empty first frame */}
      <VxDemo v={HOME_DEMO} headless gate="window" />
    </section>
  );
}
