import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { SITE_DESCRIPTION } from "@/lib/copy";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

import { LpVisionProblemTabs } from "./LpVisionProblemTabs";
import { DbChat, DbSchema, DbTable, DbTableIcon, type DbTone } from "./LpVisionDb";
import {
  VISION_AGENT,
  VISION_CLOSE,
  VISION_H1,
  VISION_HERO_ALT,
  VISION_MID,
  VISION_PROBLEMS_BODY,
  VISION_PROBLEMS_TITLE,
  VISION_ROWS,
  VISION_STATEMENT,
  VISION_WAREHOUSE,
  type VisionRowId,
} from "./lp-vision-data";
import {
  DB_ASK,
  DB_CHAT,
  DB_CROSS,
  DB_HERO,
  DB_HERO_TABS,
  DB_LAYERS,
  DB_PLUG,
  DB_SCHEMA,
  DB_SCHEMA_BAR,
  DB_SOURCES,
  DB_WAREHOUSE,
} from "./lp-vision-tables";

/**
 * The vision homepage (2026-11-09): Pancake as the revenue data warehouse.
 *
 * Its components and their order follow the reference page the founder picked for this look
 * (its latest version), rebuilt with Pancake's tokens, type and marks:
 *   hero        a centred claim, one line under it, the buttons, the product window with its
 *               chat panel hanging over its right edge
 *   statement   two lines, left-aligned, opening the dark band
 *   rows        four numbered rows that swap sides, the text on one and a framed picture on the
 *               other, then one centred line and a button
 *   problems    a warm band: a title, a few lines beside it, a list and the card of the open item
 *   warehouse   a title over three cards, each a picture, a line in bold and two lines of text
 *   agent       a title over two wide cards, the same way
 *   close       a dark band, one line, a few words, the buttons
 * Left out because Pancake has nothing true to put in them yet: the two quote cards with a
 * figure, the film with a quote, the research log.
 *
 * Every picture is a real table (LpVisionDb.tsx, data in lp-vision-tables.ts): the founder asked
 * for "de la vraie db" after a first set of drawn mock-ups. Nothing moves. Only the problems'
 * list needs JavaScript (LpVisionProblemTabs).
 * Copy: lp-vision-data.ts. Styles: vision.css.
 */

/* ── hero ─────────────────────────────────────────────────────────────────── */

export function LpVisionHero() {
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
      {/* the product: the companies table, and the agent reading it. One picture, read out by its label */}
      <div className="lp-vh__stage" role="img" aria-label={VISION_HERO_ALT}>
        <div className="lp-vh__window" aria-hidden="true">
          <ul className="lp-vh__bar">
            {DB_HERO_TABS.map((tab, i) => (
              <li key={tab.name} className="lp-vh__tab" data-on={i === 0 ? "" : undefined}>
                <DbTableIcon />
                {tab.name}
                <small>{tab.rows}</small>
              </li>
            ))}
          </ul>
          <DbTable table={DB_HERO} bar={false} tone="yellow" />
        </div>
        <div className="lp-vh__chat" aria-hidden="true">
          <DbChat {...DB_CHAT} />
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
                  <RowPic id={row.id} tone={row.tone} />
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

function RowPic({ id, tone }: { id: VisionRowId; tone: DbTone }) {
  switch (id) {
    case "sources":
      return <DbTable table={DB_SOURCES} tone={tone} />;
    case "tables":
      return <DbSchema boxes={DB_SCHEMA} bar={DB_SCHEMA_BAR} tone={tone} />;
    case "crossing":
      return <CrossingPic tone={tone} />;
    case "play":
      return <LayersPic tone={tone} />;
  }
}

/** a row of yours and a row from outside, joined on the company into one */
function CrossingPic({ tone }: { tone: DbTone }) {
  return (
    <div className="lp-vjoin">
      <div className="lp-vjoin__in">
        <DbTable table={DB_CROSS.own} tone={tone} />
        <DbTable table={DB_CROSS.outside} tone={tone} />
      </div>
      <p className="lp-vjoin__on">
        <span>{DB_CROSS.join}</span>
      </p>
      <DbTable table={DB_CROSS.result} tone={tone} />
    </div>
  );
}

/** one line up, an open arrowhead: from a layer to the one it feeds */
function LayerUp() {
  return (
    <svg className="lp-vlayers__up" viewBox="0 0 12 20" aria-hidden="true" focusable="false">
      <path d="M6 19V2M2 6l4-4 4 4" />
    </svg>
  );
}

/** the data layer at the bottom, the Brain on top of it, the next best Play out of the top */
function LayersPic({ tone }: { tone: DbTone }) {
  const { plays, brain, data } = DB_LAYERS;
  return (
    <div className="lp-vlayers">
      <DbTable table={plays} tone={tone} />
      <LayerUp />
      <DbTable table={brain} tone={tone} />
      <LayerUp />
      <div className="lp-db lp-vlayers__base" data-tone={tone}>
        <p className="lp-db__bar">
          <span className="lp-db__path">{data.name}</span>
          {data.tables.map((table) => (
            <span key={table.name} className="lp-vlayers__table">
              <DbTableIcon />
              <b>{table.name}</b>
              <i>{table.rows}</i>
            </span>
          ))}
        </p>
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
              <div className="lp-vware__pic" aria-hidden="true">
                <DbTable table={DB_WAREHOUSE[card.id]} theme="light" tone={card.tone} />
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
              <DbChat
                ask={DB_ASK.question}
                status={DB_ASK.status}
                answer={DB_ASK.answer}
                result={DB_ASK.result}
                box={DB_ASK.box}
                theme="light"
              />
            </div>
            <h3 className="lp-vware__title">{ask.title}</h3>
            <p className="lp-vware__body">{ask.body}</p>
          </li>
          <li className="lp-vagent__card">
            <div className="lp-vagent__pic" data-pic="plug" aria-hidden="true">
              <DbTable table={DB_PLUG} theme="light" tone="purple" />
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
          <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--outline lp-v__pill-line" data-analytics-id="call_final">
            Talk to sales
          </LpFxLink>
        </div>
      </div>
    </section>
  );
}
