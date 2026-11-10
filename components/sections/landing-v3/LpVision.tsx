import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { SITE_DESCRIPTION } from "@/lib/copy";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

import { ClaudeMark, CodexMark } from "./LpAgentMarks";
import { LpVisionProblemTabs } from "./LpVisionProblemTabs";
import {
  VISION_AGENT,
  VISION_CLOSE,
  VISION_H1,
  VISION_MID,
  VISION_PICS,
  VISION_PROBLEMS_BODY,
  VISION_PROBLEMS_TITLE,
  VISION_ROWS,
  VISION_STATEMENT,
  VISION_WAREHOUSE,
  VISION_WINDOW,
  type VisionRowId,
} from "./lp-vision-data";

/**
 * The vision homepage (2026-11-09): Pancake as the revenue data warehouse.
 *
 * Its components and their order follow the reference page the founder picked for this look
 * (its latest version), rebuilt with Pancake's tokens, type and marks:
 *   hero        a centred claim, one line under it, the buttons, the product window with its
 *               chat panel hanging over its right edge
 *   statement   two lines, left-aligned, opening the dark band
 *   rows        four numbered rows that swap sides, the text on one and a framed card on the
 *               other, then one centred line and a button
 *   problems    a warm band: a title, a few lines beside it, a list and the card of the open item
 *   warehouse   a title over three cards, each a picture, a line in bold and two lines of text
 *   agent       a title over two wide cards, the same way
 *   close       a dark band, one line, a few words, the buttons
 * Left out because Pancake has nothing true to put in them yet: the two quote cards with a
 * figure, the film with a quote, the research log.
 * Nothing moves. Only the problems' list needs JavaScript (LpVisionProblemTabs).
 * Copy: lp-vision-data.ts. Styles: vision.css.
 */

/* ── hero ─────────────────────────────────────────────────────────────────── */

export function LpVisionHero() {
  const { tabs, columns, rows, chat } = VISION_WINDOW;
  return (
    <section id="main-content" tabIndex={-1} className="lp-vh" aria-labelledby="lp-vh-title">
      <div className="lp-vh__copy">
        <h1 id="lp-vh-title" className="lp-display lp-vh__title">
          {VISION_H1[0]} <br />
          {VISION_H1[1]}
        </h1>
        <p className="lp-vh__lede">{SITE_DESCRIPTION}</p>
        <div className="lp-vh__btns">
          <LpFxLink href={APP_ORIGIN} data-analytics-id="app_hero">
            Start free
          </LpFxLink>
          <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--tinted lp-btn--demo" data-analytics-id="call_hero">
            Talk to sales
          </LpFxLink>
        </div>
      </div>
      {/* the product: the tables, and the agent reading them. One picture, read out by its label */}
      <div
        className="lp-vh__stage"
        role="img"
        aria-label="Pancake’s tables: each company with your own data, an outside signal and the next best Play. Beside it, Claude answers which accounts to work now."
      >
        <div className="lp-vh__window" aria-hidden="true">
          <div className="lp-vh__bar">
            <ul className="lp-vh__tabs">
              {tabs.map((tab, i) => (
                <li key={tab} className="lp-vh__tab" data-on={i === 0 ? "" : undefined}>
                  {tab}
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-vh__table">
            <div className="lp-vh__row lp-vh__row--head">
              {columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {rows.map((row) => (
              <div key={row.company} className="lp-vh__row" data-hot={row.hot ? "" : undefined}>
                <span className="lp-vh__co">
                  <i className="lp-vh__avatar">{row.initial}</i>
                  <span>
                    <b>{row.company}</b>
                    <small>{row.size}</small>
                  </span>
                </span>
                <span className="lp-vh__cell" data-kind="own">
                  {row.own}
                </span>
                <span className="lp-vh__cell" data-kind="outside">
                  {row.outside}
                </span>
                <span className="lp-vh__play">{row.play}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lp-vh__chat" aria-hidden="true">
          <p className="lp-vh__chat-head">
            <span className="lp-vh__mark">
              <ClaudeMark />
            </span>
            {chat.agent}
          </p>
          <p className="lp-vh__ask">{chat.ask}</p>
          <p className="lp-vh__status">{chat.status}</p>
          <p className="lp-vh__answer">{chat.answer}</p>
          <ul className="lp-vh__picks">
            {chat.picks.map((pick) => (
              <li key={pick.who}>
                <b>{pick.who}</b>
                <span>{pick.why}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── the statement, then the four numbered rows ───────────────────────────── */

export function LpVisionRows() {
  return (
    <section className="lp-vd lp-vrows" aria-labelledby="lp-vrows-title">
      <div className="lp-v__inner">
        <h2 id="lp-vrows-title" className="lp-v__statement lp-vrows__statement">
          {VISION_STATEMENT[0]} <br />
          {VISION_STATEMENT[1]}
        </h2>
        <ol className="lp-vrows__list">
          {VISION_ROWS.map((row) => (
            <li key={row.id} className="lp-vrows__row" data-tone={row.tone}>
              <div className="lp-vrows__text">
                <h3 className="lp-vrows__title">{row.title}</h3>
                <p className="lp-vrows__body">{row.body}</p>
              </div>
              <div className="lp-vrows__side">
                <p className="lp-v__label">
                  <span>{row.num}</span> {row.label}
                </p>
                <div className="lp-vrows__frame" aria-hidden="true">
                  <RowPic id={row.id} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="lp-vrows__mid">
          <p className="lp-vrows__mid-title">{VISION_MID.title}</p>
          <LpFxLink href={APP_ORIGIN} className="lp-v__pill-light" data-analytics-id="app_lead_finding">
            Start free
          </LpFxLink>
        </div>
      </div>
    </section>
  );
}

function RowPic({ id }: { id: VisionRowId }) {
  switch (id) {
    case "sources":
      return <SourcesPic />;
    case "tables":
      return <TablesPic />;
    case "crossing":
      return <CrossingPic />;
    case "play":
      return <PlayPic />;
  }
}

const PROVIDER_LOGOS = [
  "/lp/story-sources/apify.svg",
  "/lp/story-sources/theirstack.svg",
  "/lp/story-sources/coresignal.svg",
  "/lp/story-sources/wappalyzer.svg",
] as const;

function SourcesPic() {
  const pic = VISION_PICS.sources;
  return (
    <div className="lp-vcard">
      <p className="lp-vcard__kicker">{pic.own}</p>
      <ul className="lp-vsrc">
        {pic.rows.map((row) => (
          <li key={row.name} className="lp-vsrc__row">
            <i className="lp-vsrc__disc">
              {"logo" in row ? (
                // the vendor's own mark, unmodified
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.logo} alt="" width={16} height={16} loading="lazy" decoding="async" />
              ) : (
                row.name.charAt(0)
              )}
            </i>
            <span className="lp-vsrc__name">{row.name}</span>
            <span className="lp-vsrc__note">{row.note}</span>
            <span className="lp-vsrc__state">{pic.state}</span>
          </li>
        ))}
      </ul>
      <div className="lp-vsrc__out">
        <span className="lp-vsrc__logos">
          {PROVIDER_LOGOS.map((logo) => (
            <i key={logo} className="lp-vsrc__disc">
              {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
              <img src={logo} alt="" width={16} height={16} loading="lazy" decoding="async" />
            </i>
          ))}
        </span>
        <span className="lp-vsrc__name">{pic.outside}</span>
      </div>
    </div>
  );
}

function TablesPic() {
  const pic = VISION_PICS.tables;
  return (
    <div className="lp-vcard">
      <div className="lp-vrec__head">
        <i className="lp-vrec__avatar">{pic.who.charAt(0)}</i>
        <span className="lp-vrec__who">
          <b>{pic.who}</b>
          <small>{pic.where}</small>
        </span>
        <span className="lp-vrec__badge">{pic.record}</span>
      </div>
      <ul className="lp-vrec__points">
        {pic.points.map((point) => (
          <li key={point.what}>
            <span className="lp-vrec__when">{point.when}</span>
            <span className="lp-vrec__what">{point.what}</span>
            <span className="lp-vrec__from">{point.from}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CrossingPic() {
  const pic = VISION_PICS.crossing;
  return (
    <div className="lp-vcard">
      <div className="lp-vrec__head">
        <i className="lp-vrec__avatar">{pic.company.charAt(0)}</i>
        <span className="lp-vrec__who">
          <b>{pic.company}</b>
          <small>{pic.size}</small>
        </span>
      </div>
      <div className="lp-vcross">
        {[pic.own, pic.outside].map((side, i) => (
          <div key={side.label} className="lp-vcross__side" data-kind={i === 0 ? "own" : "outside"}>
            <span className="lp-vcross__label">{side.label}</span>
            <b>{side.what}</b>
            <small>{side.from}</small>
          </div>
        ))}
      </div>
      <p className="lp-vcross__result">{pic.result}</p>
    </div>
  );
}

function PlayPic() {
  const pic = VISION_PICS.play;
  return (
    <div className="lp-vcard">
      <p className="lp-vcard__kicker">{pic.kicker}</p>
      <p className="lp-vplay__play">{pic.play}</p>
      <div className="lp-vplay__foot">
        <span className="lp-vplay__agents">
          <i>
            <ClaudeMark />
          </i>
          <i>
            <CodexMark />
          </i>
          {pic.picks}
        </span>
        <span className="lp-vplay__plugs">
          {pic.plugs.map((plug) => (
            <span key={plug}>{plug}</span>
          ))}
        </span>
      </div>
    </div>
  );
}

/* ── the six hard problems ────────────────────────────────────────────────── */

export function LpVisionProblems() {
  return (
    <section className="lp-vw lp-vprob" aria-labelledby="lp-vprob-title">
      <div className="lp-v__inner">
        <div className="lp-vprob__head">
          <h2 id="lp-vprob-title" className="lp-v__statement">
            {VISION_PROBLEMS_TITLE[0]} <br />
            {VISION_PROBLEMS_TITLE[1]}
          </h2>
          <p className="lp-vprob__body">{VISION_PROBLEMS_BODY}</p>
        </div>
        <LpVisionProblemTabs />
      </div>
    </section>
  );
}

/* ── what Pancake is: three cards ─────────────────────────────────────────── */

export function LpVisionWarehouse() {
  return (
    <section className="lp-vc lp-vware" aria-labelledby="lp-vware-title">
      <div className="lp-v__inner">
        <h2 id="lp-vware-title" className="lp-v__statement">
          {VISION_WAREHOUSE.title}
        </h2>
        <ul className="lp-vware__grid">
          {VISION_WAREHOUSE.cards.map((card) => (
            <li key={card.id} className="lp-vware__card" data-tone={card.tone}>
              <div className="lp-vware__pic" data-pic={card.id} aria-hidden="true">
                <div className="lp-vware__chips">
                  {card.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
                <span className="lp-vware__note">{card.note}</span>
              </div>
              <h3 className="lp-vware__title">{card.title}</h3>
              <p className="lp-vware__body">{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── how it gets used: two wide cards ─────────────────────────────────────── */

export function LpVisionAgent() {
  const [ask, plug] = VISION_AGENT.cards;
  return (
    <section className="lp-vc lp-vagent" aria-labelledby="lp-vagent-title">
      <div className="lp-v__inner">
        <h2 id="lp-vagent-title" className="lp-v__statement">
          {VISION_AGENT.title}
        </h2>
        <ul className="lp-vagent__grid">
          <li className="lp-vagent__card">
            <div className="lp-vagent__pic" data-pic="ask" aria-hidden="true">
              <p className="lp-vagent__q">{VISION_AGENT.ask.question}</p>
              <p className="lp-vagent__a">
                <i>
                  <ClaudeMark />
                </i>
                {VISION_AGENT.ask.answer}
              </p>
              <p className="lp-vagent__box">{VISION_AGENT.ask.box}</p>
            </div>
            <h3 className="lp-vware__title">{ask.title}</h3>
            <p className="lp-vware__body">{ask.body}</p>
          </li>
          <li className="lp-vagent__card">
            <div className="lp-vagent__pic" data-pic="plug" aria-hidden="true">
              <div className="lp-vagent__plug">
                <p className="lp-vcard__kicker">{VISION_AGENT.plug.kicker}</p>
                <ul>
                  {VISION_AGENT.plug.tools.map((tool) => (
                    <li key={tool}>
                      <span>{tool}</span>
                      <b>{VISION_PICS.sources.state}</b>
                    </li>
                  ))}
                </ul>
                <p className="lp-vagent__back">{VISION_AGENT.plug.back}</p>
              </div>
            </div>
            <h3 className="lp-vware__title">{plug.title}</h3>
            <p className="lp-vware__body">{plug.body}</p>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ── the close ────────────────────────────────────────────────────────────── */

export function LpVisionClose() {
  return (
    <section className="lp-vd lp-vclose" aria-labelledby="lp-vclose-title">
      <div className="lp-v__inner lp-vclose__inner">
        <h2 id="lp-vclose-title" className="lp-display lp-vclose__title">
          {VISION_CLOSE.title}
        </h2>
        <p className="lp-vclose__body">{VISION_CLOSE.body}</p>
        <div className="lp-vclose__btns">
          <LpFxLink href={APP_ORIGIN} className="lp-v__pill-light" data-analytics-id="app_final">
            Start free
          </LpFxLink>
          <LpFxLink href={DEMO_PAGE_PATH} className="lp-v__pill-line" data-analytics-id="call_final">
            Talk to sales
          </LpFxLink>
        </div>
      </div>
    </section>
  );
}
