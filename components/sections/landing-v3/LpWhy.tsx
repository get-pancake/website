/**
 * Section — "Your go-to-market waits for you. / On Pancake, it works on its own." (the infra-first
 * landing, 2026-10-21; founder: "simplify narrative, taking story from other competitors doing
 * infra for gtm").
 *
 * The contrast every infrastructure-for-AI-GTM page opens on, right after its proof: Cargo's
 * "A go-to-market that waits for people. Or one that drives itself." (today vs on Cargo),
 * Crustdata's answers without and with its data, Octave's stale and siloed context, Landbase's
 * table against Apollo and Clay. Here: today on the left, a Play that ran on its own on the
 * right. Claims, from the codebase teardown of 2026-10-21: runs on the schedule you pick on
 * Pancake's servers, retried when a step fails (durable jobs, §3.2), every action in the feed
 * your agent reads (§3.1, §3.10), one sealed workspace per customer (§3.5, §3.9).
 */

const TODAY = [
  "Ten tabs to find one good lead",
  "Lists that go stale in a week",
  "Follow-ups that wait until you remember",
  "Nothing moves while your laptop is closed",
] as const;

/** the tools a founder juggles today, by kind (no product names) */
const TABS = [
  "Lead database",
  "Spreadsheet",
  "Enrichment",
  "Email tool",
  "Signals",
  "CRM",
  "Sequencer",
  "Notes",
  "Calendar",
  "Data vendor",
  "+6 tabs",
] as const;

const TRACE = [
  { time: "09:00", text: "Found 48 new companies" },
  { time: "09:03", text: "Kept the 13 that fit" },
  { time: "09:05", text: "Found their founders", note: "Retried once" },
  { time: "09:06", text: "Wrote 13 messages" },
] as const;

const ON_PANCAKE = [
  "Runs on its own, on your schedule",
  "Picks itself back up when a step fails",
  "Shows you and your agent everything it did",
  "Keeps your data in your workspace",
] as const;

export function LpWhy() {
  return (
    <section id="today" className="lp-why" aria-labelledby="lp-why-title">
      <div className="lp-why__org">
        <header className="lp-why__head">
          <p className="lp-why__kicker">Your go-to-market waits for you.</p>
          <h2 id="lp-why-title" className="lp-why__title lp-title-section">
            On Pancake, it works on its own.
          </h2>
        </header>
        <div className="lp-why__grid">
          <div className="lp-why__card" data-side="today">
            <p className="lp-why__label">Today</p>
            <div className="lp-why__art" aria-hidden="true">
              <div className="lp-why__tabs">
                {TABS.map((tab) => (
                  <span key={tab} className="lp-why__tab">
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <ul className="lp-why__list">
              {TODAY.map((item) => (
                <li key={item} className="lp-why__item">
                  <Glyph kind="x" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-why__card" data-side="pancake">
            <p className="lp-why__label">On Pancake</p>
            <div className="lp-why__art" aria-hidden="true">
              <p className="lp-why__run-head">
                <span className="lp-why__live" />
                Funded startups
                <span className="lp-why__run-sched">Ran at 09:00, laptop closed</span>
              </p>
              {TRACE.map((row) => (
                <p key={row.time} className="lp-why__row">
                  <span className="lp-why__time">{row.time}</span>
                  <span className="lp-why__row-text">{row.text}</span>
                  {"note" in row ? <span className="lp-why__note">{row.note}</span> : null}
                </p>
              ))}
            </div>
            <ul className="lp-why__list">
              {ON_PANCAKE.map((item) => (
                <li key={item} className="lp-why__item">
                  <Glyph kind="check" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Glyph({ kind }: { kind: "x" | "check" }) {
  return (
    <svg className="lp-why__glyph" data-kind={kind} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      {kind === "check" ? <path d="M3.5 8.5l3 3 6-7" /> : <path d="M5 5l6 6M11 5l-6 6" />}
    </svg>
  );
}
