import { Fragment } from "react";

import { LpDive } from "./LpDive";
import { DbChat, DbTable, DbTableIcon, type DbTone } from "./LpVisionDb";
import {
  VISION_AGENT,
  VISION_PROBLEMS,
  VISION_PROBLEMS_BODY,
  VISION_PROBLEMS_TITLE,
  VISION_ROWS,
  VISION_STATEMENT,
  VISION_WAREHOUSE,
  type VisionProblemId,
  type VisionRowId,
} from "./lp-vision-data";
import type { DiveItem } from "./lp-dive-data";
import type { DiveItemId } from "./lp-dive-stages";
import {
  DB_ASK,
  DB_CROSS,
  DB_EXTERNAL,
  DB_LAYERS,
  DB_PLUG,
  DB_SOURCES,
  DB_WAREHOUSE,
} from "./lp-vision-tables";

/**
 * The vision homepage's own sections (2026-11-09; in the designer's forms since 2026-11-11, when
 * the founder asked for the current page's graphic pieces back: "les petits nuages", "l'arc-en-ciel
 * qui vibre dans le hero", "composants design … qu'il faut evidemment remettre", "ca ne change pas
 * le contenu mais la forme"). The page (app/page.tsx) is:
 *   LpHero            the designer's hero, with the vision's headline and lede
 *   LpVisionCurtain   the window under it: Claude's window, Pancake's table, a curtain between (its own file)
 *   LpMarquee         the customers, on cream
 *   LpVisionRows      the statement and the four rows: a title, two lines, a framed real table
 *   LpSteps           today's product at work, the designer's three animated steps
 *   the sky           the six hard problems (LpDive with the vision's six stories), then
 *   LpVisionWarehouse / LpVisionAgent, the cards, and LpCta, the close on its hill
 * Every table is a real one (LpVisionDb.tsx, data in lp-vision-tables.ts): the founder asked for
 * "de la vraie db" after a first set of drawn mock-ups.
 * Copy: lp-vision-data.ts. Styles: vision.css.
 */

/* ── the statement, then the four rows ────────────────────────────────────── */

export function LpVisionRows() {
  return (
    <section className="lp-vc lp-vrows" aria-labelledby="lp-vrows-title">
      <div className="lp-v__inner">
        <h2 id="lp-vrows-title" className="lp-title-section lp-v__title lp-vrows__statement">
          {VISION_STATEMENT.map((line, i) => (
            <Fragment key={line}>
              {i > 0 ? <br /> : null}
              {line}{" "}
            </Fragment>
          ))}
        </h2>
        <ol className="lp-vrows__list">
          {VISION_ROWS.map((row) => (
            <li key={row.id} className="lp-vrows__row" data-tone={row.tone}>
              <div className="lp-vrows__text">
                <h3 className="lp-vrows__title">{row.title}</h3>
                <p className="lp-vrows__body">{row.body}</p>
              </div>
              <div className="lp-vrows__side">
                <p className="lp-v__label">{row.label}</p>
                <div className="lp-vrows__frame" aria-hidden="true">
                  <RowPic id={row.id} tone={row.tone} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function RowPic({ id, tone }: { id: VisionRowId; tone: DbTone }) {
  switch (id) {
    case "sources":
      return <DbTable table={DB_SOURCES} tone={tone} />;
    case "external":
      return <DbTable table={DB_EXTERNAL} tone={tone} />;
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

/* ── the six hard problems: the designer's deep dive, on the sky ──────────── */

/** each problem's story in the dive's registry (lp-dive-stages.ts): five drawn for this page, and
    the lineage story for crossing (your own data and outside signals meeting on one lead) */
const PROBLEM_STORY: Record<VisionProblemId, DiveItemId> = {
  sources: "p-sources",
  dedup: "p-dedup",
  matching: "p-matching",
  history: "p-history",
  lineage: "p-moves",
  crossing: "lineage",
};

/** In the list: the problem in plain words as the title; under it, once open, what Pancake does
    about it (the problem's first line, then its two lines). */
const PROBLEM_ITEMS: readonly DiveItem[] = VISION_PROBLEMS.map((problem) => ({
  id: PROBLEM_STORY[problem.id],
  title: problem.short,
  body: `${problem.line} ${problem.body}`,
  status: "final",
}));

export function LpVisionProblems() {
  return <LpDive items={PROBLEM_ITEMS} title={VISION_PROBLEMS_TITLE.join(" ")} lede={VISION_PROBLEMS_BODY} skyTop />;
}

/* ── what Pancake is: three cards ─────────────────────────────────────────── */

export function LpVisionWarehouse() {
  return (
    <section className="lp-vc lp-vsky lp-vware" aria-labelledby="lp-vware-title">
      <div className="lp-v__inner">
        <h2 id="lp-vware-title" className="lp-title-section lp-v__title">
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
    <section className="lp-vc lp-vsky lp-vagent" aria-labelledby="lp-vagent-title">
      <div className="lp-v__inner">
        <h2 id="lp-vagent-title" className="lp-title-section lp-v__title">
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

