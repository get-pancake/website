import { VxHead } from "@/components/sections/verticals/VxHead";
import { VX_RELATED } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { relatedFor, verticalPath } from "@/lib/verticals";
import type { VerticalConfig } from "@/lib/verticals/types";

export function VxArrow({ className = "vx-arrow" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

/**
 * Related (spec §2.8). The section eyebrow IS the visible breadcrumb
 * (Home / Industries / {vertical}), matching the BreadcrumbList JSON-LD;
 * links padded to 44px tap height. Rows = 3–5 siblings (relatedFor: approved
 * pages link to approved siblings only, backfilled from the category) + the
 * "All industries" row → /for. Each sibling row reads the sibling's OWN
 * name.title + hubLine — never copy written per linking page.
 */
export function VxRelated({ v }: { v: VerticalConfig }) {
  const rows = relatedFor(v);
  const crumbs = (
    <nav className="vx-eyebrow vx-crumbs" aria-label={VX_RELATED.crumbAria}>
      <ol>
        {/* separators trail their crumb, so a wrapped phone line ends with "/"
            and the page name starts the next one */}
        <li>
          <a href="/">{VX_RELATED.crumbs.home}</a>
          <span className="vx-crumbs__sep" aria-hidden="true">
            /
          </span>
        </li>
        <li>
          <a href="/for">{VX_RELATED.crumbs.hub}</a>
          <span className="vx-crumbs__sep" aria-hidden="true">
            /
          </span>
        </li>
        <li>
          <span aria-current="page">{v.name.title}</span>
        </li>
      </ol>
    </nav>
  );
  return (
    <section className="vx-sec vx-related" aria-labelledby="vx-related-title">
      <div className="vx-col">
        <VxHead id="vx-related-title" eyebrow={crumbs} title={VX_RELATED.h2} />
        <ul className="vx-rel">
          {rows.map((r) => (
            <li key={r.slug}>
              <a className="vx-rel__row" href={verticalPath(r)}>
                <span className="vx-rel__name lp-display">{r.name.title}</span>
                <span className="vx-rel__line">{vxNoWidow(r.hubLine)}</span>
                <VxArrow className="vx-rel__arrow" />
              </a>
            </li>
          ))}
          <li>
            <a className="vx-rel__row vx-rel__row--hub" href="/for">
              <span className="vx-rel__name lp-display">{VX_RELATED.hubRow.title}</span>
              <span className="vx-rel__line">{VX_RELATED.hubRow.line}</span>
              <VxArrow className="vx-rel__arrow" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
