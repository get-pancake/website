import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { VX_HUB } from "@/components/sections/verticals/vx-copy";
import { hubGroups, verticalPath } from "@/lib/verticals";

/**
 * /for hub (spec §3): the head ("Industries" · "Pick your industry." as the
 * page's H1 at H2 scale · lede) and one group per category in
 * VerticalCategory order. Cards are cream links (name + the vertical's own
 * hubLine + arrow), equal heights per row, hover fill only. Visibility:
 * approved pages in production; drafts too elsewhere, with a neutral "Draft"
 * kit badge (lib/verticals isListed). Server, zero JS — every link is in the
 * HTML for crawlers.
 */
export function VxHubGrid() {
  const groups = hubGroups();
  return (
    <section className="vx-sec vx-hub vx-hub-head" aria-labelledby="vx-hub-title">
      <div className="vx-col">
        <VxHead as="h1" id="vx-hub-title" eyebrow={VX_HUB.eyebrow} title={VX_HUB.h1} lede={VX_HUB.lede} />
        {groups.length === 0 ? (
          <p className="vx-hub__soon">{VX_HUB.soon}</p>
        ) : (
          <div className="vx-hub__groups">
            {groups.map((g, gi) => (
              <div key={g.category} role="group" aria-labelledby={`vx-hub-g${gi}`}>
                <h2 id={`vx-hub-g${gi}`} className="vx-hub__group">
                  {g.category}
                </h2>
                <ul className="vx-hub-grid">
                  {g.items.map((v) => (
                    <li key={v.slug}>
                      <a className="vx-hubcard" href={verticalPath(v)}>
                        <span className="vx-hubcard__name lp-display">
                          {v.name.title}
                          {v.status === "draft" ? (
                            <span className="vx-badge" data-tone="neutral">
                              {VX_HUB.draft}
                            </span>
                          ) : null}
                        </span>
                        <VxArrow className="vx-hubcard__arrow" />
                        <span className="vx-hubcard__line">{v.hubLine}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
