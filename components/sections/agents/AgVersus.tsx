import { VERSUS } from "./ag-copy";

/**
 * /agents — "Super addictive": the closing comparison, agent alone vs. agent
 * + Pancake. Draft section 08 had two side-by-side cards with four stacked
 * lines each; the founder (2026-09-11): "we can better show that we're
 * comparing thing by thing and that it's not just bloated text". So this is
 * now a real comparison TABLE inside one cream card: two equal columns, four
 * rows, each row = one theme (data / sending / follow-up / knowledge) with
 * its ✗ cell and its ✓ cell on the same baseline (`VERSUS.rows`). The
 * right column is the highlighted one — a black block spanning the header
 * and all rows (Function's / Height's highlighted plan column on Mobbin);
 * the row-aligned ✗/✓ cells follow Front's two-column comparison.
 *
 * Static (no keyframes, no script) → server component.
 *
 * A11y: a visually-hidden caption names the table; the two kickers are the
 * column headers (`<th scope="col">`), which is what gives each cell's mark
 * its meaning — the marks themselves are decorative (`aria-hidden`). The
 * table keeps its semantics on phones (where CSS re-flows rows into stacked
 * pairs and `display` changes would otherwise drop the implicit roles) via
 * explicit, redundant `role`s — the responsive-table pattern.
 */
export function AgVersus() {
  return (
    <section className="ag-sec ag-versus" aria-labelledby="ag-versus-title">
      <div className="ag-sec__inner">
        <div className="ag-sec__head">
          <p className="ag-kicker">{VERSUS.kicker}</p>
          <h2 id="ag-versus-title" className="lp-title-section">
            {VERSUS.title}
          </h2>
        </div>

        {/* the cream card is the table's frame (padding 16) */}
        <div className="ag-card ag-versus__frame">
          <table className="ag-versus__table" role="table">
            <caption className="lp-sr-only">
              Agent alone versus agent with Pancake, feature by feature
            </caption>
            <thead role="rowgroup">
              <tr role="row" className="ag-versus__row ag-versus__row--head">
                <HeadCell side="alone" label={VERSUS.alone.kicker} />
                <HeadCell side="with" label={VERSUS.with.kicker} />
              </tr>
            </thead>
            <tbody role="rowgroup">
              {VERSUS.rows.map(([alone, withPancake]) => (
                <tr key={alone} role="row" className="ag-versus__row">
                  <Cell side="alone" text={alone} />
                  <Cell side="with" text={withPancake} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

type Side = "alone" | "with";

/** Column header: the draft's kicker (pink-40 / purple-30). The mark inside
 *  is hidden on desktop/tablet (the columns speak for themselves) and shows
 *  on phones, where the header turns into the legend for the stacked pairs. */
function HeadCell({ side, label }: { side: Side; label: string }) {
  return (
    <th
      scope="col"
      role="columnheader"
      className={`ag-versus__th ag-versus__th--${side}`}
    >
      <span className="ag-versus__cell">
        <Mark side={side} />
        {/* the kicker class sits on the text itself: the kit's universal
            font-family rule beats inheritance (README, fonts) */}
        <span className="ag-kicker ag-versus__kicker">{label}</span>
      </span>
    </th>
  );
}

function Cell({ side, text }: { side: Side; text: string }) {
  return (
    <td role="cell" className={`ag-versus__td ag-versus__td--${side}`}>
      <span className="ag-versus__cell">
        <Mark side={side} />
        <span className="ag-title-step ag-versus__text">{text}</span>
      </span>
    </td>
  );
}

/** 24px disc + glyph: ✗ for the alone column (10 % ink disc, ink-70 stroke),
 *  ✓ for the Pancake column (green-20 disc, plum stroke). Decorative — the
 *  column headers carry the meaning. */
function Mark({ side }: { side: Side }) {
  return (
    <span className={`ag-versus__mark ag-versus__mark--${side}`} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {side === "alone" ? (
          <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />
        ) : (
          <path d="M7 12.5l3.5 3.5L17 8.5" />
        )}
      </svg>
    </span>
  );
}
