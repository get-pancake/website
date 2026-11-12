import type { CSSProperties } from "react";

import { ClaudeMark } from "./LpAgentMarks";
import type { DbCell, DbCol, DbTableData } from "./lp-vision-tables";

/**
 * The vision homepage's pictures (2026-11-09): real tables, drawn as a database tool draws them.
 * One <table> per picture: a bar with the table's name, a head with each column's name and type,
 * numbered rows, every line of the grid, NULL where nothing is known, a count under the rows.
 * Nothing rounder than 4 px inside a table, no avatar, no pill: the founder asked for "de la vraie
 * db" after the first pictures read as toys. Data: lp-vision-tables.ts. Styles: vision.css (.lp-db).
 *
 * No "use client": the server sections and the problems' list (a client component) both draw
 * with it.
 */

export type DbTone = "yellow" | "purple" | "pink";

/** a table's own mark: a frame, a head line, one column line */
export function DbTableIcon() {
  return (
    <svg className="lp-db__icon" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <rect x="1" y="1.5" width="10" height="9" rx="1.5" />
      <path d="M1 4.75h10M4.75 4.75v5.75" />
    </svg>
  );
}

function colStyle(col: DbCol): CSSProperties | undefined {
  if (col.w === undefined && col.wm === undefined && col.wp === undefined) return undefined;
  return {
    ...(col.w !== undefined ? { "--w": typeof col.w === "number" ? `${col.w}px` : col.w } : {}),
    ...(col.wm !== undefined ? { "--wm": col.wm } : {}),
    ...(col.wp !== undefined ? { "--wp": `${col.wp}px` } : {}),
  } as CSSProperties;
}

/** the cell's own fields, when it has any */
function fields(cell: DbCell) {
  return typeof cell === "object" && cell !== null ? cell : undefined;
}

function isHit(cell: DbCell) {
  return typeof cell === "object" && cell !== null && cell.hit === true;
}

function isCut(cell: DbCell) {
  return typeof cell === "object" && cell !== null && cell.cut === true;
}

function Cell({ cell }: { cell: DbCell }) {
  if (cell === null) return <span className="lp-db__null">NULL</span>;
  if (typeof cell === "string") return <>{cell}</>;
  // A value that comes while the picture plays (the hero's table): NULL and the value are both in
  // the markup, on one spot (which one shows at rest: the cell's `nil`, vision.css). After it,
  // the state the agent gave it; on the cell's corner, the agent's mark.
  if (cell.land) {
    return (
      <>
        <span className="lp-db__lands">
          <span className="lp-db__was lp-db__null">NULL</span>
          <span className="lp-db__now">{cell.v}</span>
        </span>
        {cell.state ? (
          <span className="lp-db__state">
            <i />
            <span>{cell.state}</span>
          </span>
        ) : null}
        {cell.by ? (
          <span className="lp-db__by">
            <ClaudeMark />
          </span>
        ) : null}
      </>
    );
  }
  switch (cell.as) {
    case "tag":
      return <span className="lp-db__tag">{cell.v}</span>;
    case "ref":
      return <span className="lp-db__ref">{cell.v}</span>;
    case "live":
      return <span className="lp-db__live">{cell.v}</span>;
    case "check":
      return <span className="lp-db__box" data-on="" />;
    case "uncheck":
      return <span className="lp-db__box" />;
    default:
      return cell.logo ? (
        <span className="lp-db__logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
          <img src={cell.logo} alt="" width={14} height={14} loading="lazy" decoding="async" />
          {cell.v}
        </span>
      ) : (
        <>{cell.v}</>
      );
  }
}

export function DbTable({
  table,
  theme,
  tone,
  className,
  bar = true,
}: {
  table: DbTableData;
  /** dark by default (on plum); "light" on the cream bands */
  theme?: "light";
  tone?: DbTone;
  className?: string;
  /** the bar with the table's name; off when the table sits inside another panel */
  bar?: boolean;
}) {
  const { cols, rows, numbered } = table;
  const sourced = cols.some((col) => col.src !== undefined);
  return (
    <div className={className ? `lp-db ${className}` : "lp-db"} data-theme={theme} data-tone={tone}>
      <table>
        {bar ? (
          <caption>
            <span className="lp-db__bar">
              <DbTableIcon />
              {table.path ? <span className="lp-db__path">{table.path}</span> : null}
              <b>{table.name}</b>
              {table.meta ? <span className="lp-db__meta">{table.meta}</span> : null}
            </span>
          </caption>
        ) : null}
        <thead>
          <tr data-sourced={sourced ? "" : undefined}>
            {numbered ? <th className="lp-db__n" /> : null}
            {cols.map((col, i) => (
              <th key={i} data-col={col.name} data-hide={col.hide} data-end={col.end ? "" : undefined} style={colStyle(col)}>
                {sourced ? <span className="lp-db__src">{col.src}</span> : null}
                <span className="lp-db__col">{col.name}</span>
                {col.type ? <span className="lp-db__type">{col.type}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} data-mark={row.mark} data-row={row.key} data-dim={row.dim ? "" : undefined}>
              {numbered ? <td className="lp-db__n">{row.n ?? r + 1}</td> : null}
              {row.c.map((cell, i) => (
                <td
                  key={i}
                  data-hide={cols[i]?.hide}
                  data-end={cols[i]?.end ? "" : undefined}
                  data-hit={isHit(cell) ? "" : undefined}
                  data-cut={isCut(cell) ? "" : undefined}
                  data-land={fields(cell)?.land}
                  data-late={fields(cell)?.nil === "take" ? "" : undefined}
                  data-void={fields(cell)?.nil === "rest" ? "" : undefined}
                  data-by={fields(cell)?.by ? "" : undefined}
                  data-idle={fields(cell)?.idle ? "" : undefined}
                >
                  <Cell cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* under the table, not a <tfoot>: a cell spanning every column would keep the columns a
          phone hides */}
      {table.foot || table.footEnd ? (
        <p className="lp-db__foot">
          <span>{table.foot}</span>
          <span>{table.footEnd}</span>
        </p>
      ) : null}
    </div>
  );
}

/** the agent asking, and the rows it gets back */
export function DbChat({
  agent,
  tool,
  ask,
  status,
  answer,
  result,
  box,
  theme,
}: {
  agent?: string;
  tool?: string;
  ask: string;
  status: string;
  answer: string;
  result: DbTableData;
  box: string;
  theme?: "light";
}) {
  return (
    <div className="lp-chat" data-theme={theme}>
      {agent ? (
        <p className="lp-chat__head">
          <span className="lp-chat__mark">
            <ClaudeMark />
          </span>
          {agent}
          {tool ? <span className="lp-chat__tool">{tool}</span> : null}
        </p>
      ) : null}
      <div className="lp-chat__body">
        <p className="lp-chat__ask">{ask}</p>
        <p className="lp-chat__status">
          <DbTableIcon />
          {status}
        </p>
        <p className="lp-chat__answer">
          {agent ? null : (
            <span className="lp-chat__mark">
              <ClaudeMark />
            </span>
          )}
          {answer}
        </p>
        <DbTable table={result} theme={theme} bar={false} className="lp-chat__result" />
        <p className="lp-chat__box">{box}</p>
      </div>
    </div>
  );
}
