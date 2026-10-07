import { COMPARE_HUB } from "@/components/sections/compare/compare-copy";
import { compareGroups, compareName, comparePath } from "@/components/sections/compare/compare-data";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";

/**
 * /compare head + cards: the /for hub's grid (VxHubGrid, hub.css), read-only reuse. The head is
 * the eyebrow, the H1 at H2 scale and the lede; then one group per COMPARE_GROUPS label, each a
 * grid of cream link cards (3 / 2 / 1 columns, equal heights, the whole card is the link). A card
 * reads its page's H1 ("Origami vs Pancake") and that page's own hero lede. Server, zero JS:
 * every link is in the HTML for crawlers.
 */
export function CompareHubGrid() {
  const groups = compareGroups();
  return (
    <section id="main-content" tabIndex={-1} className="vx-sec vx-hub vx-hub-head" aria-labelledby="cmp-title">
      <div className="vx-col">
        <VxHead as="h1" id="cmp-title" eyebrow={COMPARE_HUB.eyebrow} title={COMPARE_HUB.h1} lede={COMPARE_HUB.lede} />
        <div className="vx-hub__groups">
          {groups.map((g, gi) => (
            <div key={g.group} role="group" aria-labelledby={`cmp-g${gi}`}>
              <h2 id={`cmp-g${gi}`} className="vx-hub__group">
                {g.group}
              </h2>
              <ul className="vx-hub-grid">
                {g.items.map((c) => (
                  <li key={c.slug}>
                    <a className="vx-hubcard" href={comparePath(c)}>
                      <span className="vx-hubcard__name lp-display">
                        <span className="vx-hubcard__title">{vxNoWidow(compareName(c), 20)}</span>
                      </span>
                      <VxArrow className="vx-hubcard__arrow" />
                      <span className="vx-hubcard__line">{vxNoWidow(c.line)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
