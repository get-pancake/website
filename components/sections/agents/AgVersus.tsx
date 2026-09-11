import { VERSUS } from "./ag-copy";

/**
 * /agents — "Super addictive": the closing comparison, agent alone (cream
 * card, pink kicker) vs. agent + Pancake (black card, purple kicker). Draft
 * section 08 — centered head (kicker + H2, no lede), then two equal-height
 * cards. Static in the draft (no keyframes, no script), so this stays a
 * server component.
 *
 * The draft writes each card's four lines as one `.lp-title-step` span with
 * `<br>`s; here they are a `<ul>` (one `<li>` per line, same look) so a
 * screen reader announces four items under the card's own `<h3>`.
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

        <div className="ag-versus__grid">
          <VersusCard side="alone" kicker={VERSUS.alone.kicker} lines={VERSUS.alone.lines} />
          <VersusCard side="with" kicker={VERSUS.with.kicker} lines={VERSUS.with.lines} />
        </div>
      </div>
    </section>
  );
}

type VersusCardProps = {
  /** `alone` = cream `.ag-card`; `with` = the terminal-black card */
  side: "alone" | "with";
  kicker: string;
  lines: readonly string[];
};

function VersusCard({ side, kicker, lines }: VersusCardProps) {
  const cardClass =
    side === "alone"
      ? "ag-card ag-versus__card ag-versus__card--alone"
      : "ag-versus__card ag-versus__card--with";
  return (
    <div className={cardClass}>
      <h3 className="ag-kicker ag-versus__kicker">{kicker}</h3>
      <ul className="ag-versus__lines">
        {/* the step class sits on each item: the kit's universal font-family
            rule beats inheritance from the list (README, fonts) */}
        {lines.map((line) => (
          <li key={line} className="ag-title-step">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
