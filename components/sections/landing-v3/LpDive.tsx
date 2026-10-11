import { SHOW_PLACEHOLDERS, visibleEntries } from "@/lib/placeholders";

import { LpDiveCarousel } from "./LpDiveCarousel";
import { LpSkyParallax } from "./LpSkyParallax";
import { DIVE_FALLBACK_S, DIVE_HOLD_S, DIVE_ITEMS, DIVE_PAUSE_LABEL, DIVE_TITLE } from "./lp-dive-data";
import { DIVE_STAGES } from "./lp-dive-stages";

/**
 * Deep dive — "How Pancake finds customers" as an autoplaying, clickable vertical carousel
 * (V2 Figma 4939:3388; red note 4964:1644). Replaces the four stacked feature rows
 * (LpFeatures) on the homepage. Owner: blue-band package. A DIRECT <section> child of main.lp
 * (the agents view hides it with every other homepage section).
 *
 * On the blue sky (--lp-sky, = blue-10) that starts under the banner (lp-banner--sky) and ends
 * on the CTA's cream hill (LpCta sky): heading, a 1296×489 row = tab list (left, 272) + the
 * 752×489 stage card (right), three clouds — A and B at the page edges by the heading, C
 * behind the card's right edge — that drift at their own speeds on scroll (LpSkyParallax).
 *
 * Server markup = the rest picture (no JS, reduced motion, before hydration): item 1 selected,
 * its body open and its bar at the Figma pose; each stage panel holds its story's END picture
 * (the registry's Stage, lp-dive-stages.ts), the inactive ones hidden. Every title and body is
 * in the HTML (the collapsed ones folded, not removed). The tabs follow the APG vertical tabs
 * pattern (automatic activation, roving tabindex); LpDiveCarousel + lp-dive-carousel.ts run it.
 *
 * Copy: lp-dive-data.ts (homepage-lint FILES). CSS: dive.css (section, tabs, bar, stage) and
 * sky.css (clouds, parallax depths, the banner and CTA skies).
 */
export function LpDive() {
  const items = visibleEntries(DIVE_ITEMS);
  if (!items.length) return null;
  return (
    <section className="lp-dive" aria-labelledby="lp-dive-title">
      <div className="lp-dive-head">
        <h2 id="lp-dive-title" className="lp-title-section lp-dive-title">
          {DIVE_TITLE}
        </h2>
      </div>
      <LpDiveCarousel className="lp-dive-row" fallback={DIVE_FALLBACK_S}>
        <div className="lp-dive-list">
          <div className="lp-dive-tabs" role="tablist" aria-orientation="vertical" aria-labelledby="lp-dive-title">
            {items.map((item, i) => {
              const on = i === 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`lp-dive-tab-${item.id}`}
                  className="lp-dive-tab"
                  aria-controls={`lp-dive-panel-${item.id}`}
                  aria-selected={on}
                  aria-labelledby={`lp-dive-tab-${item.id}-t`}
                  aria-describedby={`lp-dive-tab-${item.id}-d`}
                  tabIndex={on ? 0 : -1}
                  data-id={item.id}
                  data-hold={item.hold ?? DIVE_HOLD_S}
                >
                  <span id={`lp-dive-tab-${item.id}-t`} className="lp-dive-tab__title">
                    {item.title}
                  </span>
                  {/* folded, never removed: the body stays in the HTML (it was the features'
                      indexable copy) and keeps describing its tab */}
                  <span className="lp-dive-tab__fold" aria-hidden={on ? undefined : true}>
                    <span className="lp-dive-tab__clip">
                      <span id={`lp-dive-tab-${item.id}-d`} className="lp-dive-tab__body">
                        {item.body}
                      </span>
                    </span>
                  </span>
                  <span className="lp-dive-tab__bar" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          {/* an item's quiet link sits under the list (a link can't live inside a tab button),
              shown while its item is active */}
          {items.map((item, i) =>
            item.more ? (
              <p key={item.id} className="lp-dive-more" data-for={item.id} data-on={i === 0 ? "" : undefined}>
                <span className="lp-dive-more__clip">
                  <span className="lp-dive-more__inner">
                    <a className="lp-textlink lp-dive-more__link" href={item.more.href}>
                      {item.more.label}
                      <span aria-hidden="true"> →</span>
                    </a>
                  </span>
                </span>
              </p>
            ) : null,
          )}
        </div>
        <div className="lp-dive-stagewrap">
          {/* WCAG 2.2.2: the carousel moves on its own — keyboard Pause, shown on focus or
              while it holds the carousel (the demo's .vx-ctrl recipe). The driver sets
              aria-pressed and the icon. */}
          <div className="lp-dive-ctrl">
            <button
              type="button"
              className="lp-dive-ctrl__btn"
              aria-pressed="false"
              aria-label={DIVE_PAUSE_LABEL}
              data-ico="pause"
            />
          </div>
          <span aria-hidden="true" className="lp-sky-cloud lp-sky-cloud--c" />
          <div className="lp-dive-stage">
            {items.map((item, i) => {
              const { Stage, alt } = DIVE_STAGES[item.id];
              return (
                <div
                  key={item.id}
                  role="tabpanel"
                  id={`lp-dive-panel-${item.id}`}
                  className="lp-dive-panel"
                  aria-labelledby={`lp-dive-tab-${item.id}`}
                  tabIndex={0}
                  data-state={i === 0 ? "active" : "idle"}
                >
                  <div className="lp-dive-scene" role="img" aria-label={alt || item.title.replace("\n", " ")}>
                    <Stage placeholders={SHOW_PLACEHOLDERS} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </LpDiveCarousel>
      {/* heading clouds, after the content (Figma paint order: they are the last children) */}
      <span aria-hidden="true" className="lp-sky-cloud lp-sky-cloud--a" />
      <span aria-hidden="true" className="lp-sky-cloud lp-sky-cloud--b" />
      <LpSkyParallax />
    </section>
  );
}
