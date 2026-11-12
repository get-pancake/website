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

/** the value itself, as its kind is drawn */
function Value({ cell }: { cell: DbCell }) {
  if (cell === null) return <span className="lp-db__null">NULL</span>;
  if (typeof cell === "string") return <>{cell}</>;
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

/** `wrap`: the value stands in a span of its own (the hero's table: the column a command adds) */
function Cell({ cell, wrap }: { cell: DbCell; wrap: boolean }) {
  const own = fields(cell);
  // A value that comes while the picture plays (the hero's table): NULL and the value are both in
  // the markup, on one spot.
  const value = own?.land ? (
    <span className="lp-db__lands">
      <span className="lp-db__was lp-db__null">NULL</span>
      <span className="lp-db__now">{own.v}</span>
    </span>
  ) : wrap || own?.state ? (
    <span className="lp-db__in">
      <Value cell={cell} />
    </span>
  ) : (
    <Value cell={cell} />
  );
  return (
    <>
      {value}
      {/* the state the agent gave the value, after it; on the cell's corner, the agent's mark */}
      {own?.state ? (
        <span className="lp-db__state">
          <i />
          <span>{own.state}</span>
        </span>
      ) : null}
      {own?.by ? (
        <span className="lp-db__by">
          <ClaudeMark />
        </span>
      ) : null}
    </>
  );
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
              <th key={i} data-col={col.name} data-join={col.join} data-hide={col.hide} data-end={col.end ? "" : undefined} style={colStyle(col)}>
                {sourced ? <span className="lp-db__src">{col.src}</span> : null}
                <span className="lp-db__col">{col.name}</span>
                {col.type ? <span className="lp-db__type">{col.type}</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} data-mark={row.mark} data-row={row.key} data-out={row.out ? "" : undefined}>
              {numbered ? <td className="lp-db__n">{row.n ?? r + 1}</td> : null}
              {row.c.map((cell, i) => (
                <td
                  key={i}
                  data-col={cols[i]?.name}
                  data-join={cols[i]?.join}
                  data-hide={cols[i]?.hide}
                  data-end={cols[i]?.end ? "" : undefined}
                  data-hit={isHit(cell) ? "" : undefined}
                  data-cut={isCut(cell) ? "" : undefined}
                  data-land={fields(cell)?.land}
                  data-late={fields(cell)?.nil === "take" ? "" : undefined}
                  data-by={fields(cell)?.by ? "" : undefined}
                  data-state={fields(cell)?.state ? "" : undefined}
                  data-idle={fields(cell)?.idle ? "" : undefined}
                >
                  <Cell cell={cell} wrap={cols[i]?.join === "play"} />
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
