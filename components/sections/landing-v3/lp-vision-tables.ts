/**
 * The vision homepage's pictures (2026-11-09): each one is a real table, as a database tool shows
 * it. A name bar, typed columns, row numbers, a full grid, NULL where nothing is known, a count
 * under it. The founder, on the first pictures: "quand on construit des tables, des viz de db,
 * prends vraiment des tableaux … faut que ça fasse sérieux, genre de la vraie db".
 *
 * The table's look follows real ones (Mobbin): Glide's data grid (typed column heads, every line
 * of the grid drawn), Retool's table (flat tags, a count under the rows), Airtable's "sources
 * into one table" (two tables joined into a third).
 * A data provider is named only if the product uses it, with its own mark, unmodified.
 *
 * Rules kept: no person and no real company is named. A row is an id, and what its columns say.
 * "30+ data providers" is written exactly so. Read by scripts/homepage-lint.mjs (FILES); drawn by
 * LpVisionDb.tsx.
 */

export type DbCellObj = {
  v: string;
  /** how the value is drawn: a flat tag (one value of a few), a reference to another row, a live
   *  state, a ticked or an empty box */
  as?: "tag" | "ref" | "live" | "check" | "uncheck";
  /** the cell the picture points at */
  hit?: true;
  /** a value that no longer holds, struck out */
  cut?: true;
  /** a value that comes while the picture plays: NULL and the value share the cell (the hero's
   *  table). The key is the one the take knows the cell by (lp-vision-curtain-timeline.ts) */
  land?: string;
  /** such a value is NULL until the take lands it, and the value at rest */
  nil?: "take";
  /** the agent that works from this cell: its ring and its mark on the ring's corner, as a shared
   *  canvas shows a collaborator's selection (the hero's table: the cells Claude ran) */
  by?: string;
  /** a state the value takes once the agent has acted on it, printed after it (the hero's table) */
  state?: string;
  /** the agent has moved on from this cell: its ring and its mark are not on it at rest (the
   *  hero's table: they are on the last cell it ran) */
  idle?: true;
  /** a vendor's own mark before the value */
  logo?: string;
};
/** null is drawn as NULL */
export type DbCell = string | null | DbCellObj;

export type DbCol = {
  name: string;
  type?: string;
  /** width on a desktop, in px or as a share of the table ("7.4%"); a column without one takes
   *  what is left */
  w?: number | string;
  /** width on a tablet, when it differs: a share, or "auto" for the column that takes what is
   *  left there (the hero's table) */
  wm?: string;
  /** width in px on a phone, when it differs */
  wp?: number;
  /** numbers sit on the right */
  end?: true;
  /** where the column comes from, printed over its name (the hero's table) */
  src?: string;
  /** not shown on a phone, or on a tablet ("mid": the hero's table, which has no room there) */
  hide?: "phone" | "mid" | "phone mid";
  /** the hero's table. "play": the column a command adds while the picture plays (shut until
   *  then). "deal", "signal": columns a narrow window folds away when that one opens */
  join?: "deal" | "signal" | "play";
};

export type DbRow = {
  c: readonly DbCell[];
  /** hit: the row the picture points at · new: a row just added · cut: a row merged away ·
   *  sum: the line under the others */
  mark?: "hit" | "new" | "cut" | "sum";
  /** the name the take knows the row by (the hero's table) */
  key?: string;
  /** a row that is in the table before the commands and not in the view they end on (the hero's
   *  table): not shown at rest */
  out?: true;
  /** what the row-number cell prints instead of the number */
  n?: string;
};

export type DbTableData = {
  name: string;
  /** what the table sits under, printed before its name */
  path?: string;
  /** the right end of the bar: how many rows */
  meta?: string;
  numbered?: boolean;
  cols: readonly DbCol[];
  rows: readonly DbRow[];
  foot?: string;
  footEnd?: string;
};

const tag = (v: string, hit?: true): DbCellObj => ({ v, as: "tag", ...(hit ? { hit } : {}) });
const hit = (v: string): DbCellObj => ({ v, hit: true });

/* ── hero: Pancake's companies table, alive, and Claude at work on it (the curtain, LpVisionCurtain.tsx) ── */

/** the tables of the data layer (the companies' count is the table's own, the view bar's) */
export const DB_HERO_TABS = [
  { name: "companies", rows: "4,812" },
  { name: "people", rows: "12,960" },
  { name: "signals", rows: "38,204" },
] as const;

const lost = tag("closed_lost");
/** a value that lands while the take plays: NULL until then, the value at rest */
const lands = (key: string, v: string, more: Partial<DbCellObj> = {}): DbCellObj => ({ v, land: key, nil: "take", ...more });
/** a Play the Brain writes and Claude runs while the take plays: its name, then its state.
 *  Claude's ring is on the last one it ran (`idle` on the others) */
const play = (row: string, v: string, more: Partial<DbCellObj> = {}): DbCellObj => ({ ...lands(`${row}-play`, v), by: "Claude", state: "live", idle: true, ...more });
type Cells = readonly [
  id: string,
  industry: string,
  deal: DbCell,
  signal: DbCell,
  fit: DbCell,
  play: DbCell,
  headcount: string,
  touch: DbCell,
  reason: DbCell,
  source: string,
  region: string,
  created: string,
];
/** a row's cells, in the columns' order (the id is kept here for the record, not shown) */
const row = (key: string, c: Cells, more: Pick<DbRow, "mark" | "out"> = {}): DbRow => {
  const [, industry, deal, signal, fit, play, headcount, touch, reason, source, region, created] = c;
  return { key, ...more, c: [industry, signal, fit, play, deal, headcount, touch, reason, tag(source), region, created] };
};
const out = { out: true } as const;

/** The hero's table (2026-11-11). The founder, on the takes before this one: "plus de dynamisme:
 *  filtrage, ajout de colonne, merge de rows", "un data model underneath mon Claude"; on a take
 *  where five commands each moved the table once: "tu fais des commandes one shot qui touchent à
 *  la base, il faut qu'on retrouve un côté plus autonome et dynamique où la base vit seule"; and
 *  on what is asked: "je veux plus être sur quels accounts on veut work on, et tous les dérivés"
 *  (a first take asked for the lost deals: "super passive, no go").
 *  So the table LIVES, asked or not: it is ranked by the Brain's `fit`, and while the take plays
 *  signals land in it, the Brain rescores the account and its row goes to its new rank, two rows
 *  that are one company are merged, a lost deal reopens. Claude, beside it, is asked which
 *  accounts to work: the view narrows to the ones that have a signal, and from then on an account
 *  ENTERS the view by itself the moment a signal lands on it. Then a standing order (work every
 *  account that passes 90) opens the Brain's `next_best_play` column, and a Play is written and
 *  goes live each time a row passes 90, unasked.
 *  THE ROWS, in the markup's order: first the sixteen accounts the take ends on, in their final
 *  order (their fit, falling); then the rows that are in the table while the take plays and not
 *  in the view it ends on (`out`, not shown at rest): a duplicate, and the accounts that have no
 *  signal. DB_HERO_STORY says where each row stands at each moment.
 *  THE COLUMNS: a name and a type, as a database tool prints them, nothing over them (founder,
 *  2026-11-11: "évite les mots type fioriture genre 'The Brain', il faut simplifier les mots
 *  inutiles"). `next_best_play` is shut until the standing order (`join: "play"`). Its width is
 *  that of what it pushes out of sight (crm_deal and headcount: 224 px), so the card's edge falls
 *  on a column's line before and after: at rest the window shows the four columns of the story
 *  (industry, signal, fit and the Play: 504 px, vision.css --vc-cols), the rest on hover. The table is half as wide again as the card: what is
 *  pushed right stays in it, past the edge. A narrow window (a tablet on its side, a phone: widths
 *  `wm`, shares of the card, and `wp`) has no room for all of them: there the deal's and the
 *  signal's columns fold away as the Plays' opens (vision.css).
 *  No company is named: a row is an id and what its columns say. */
export const DB_HERO: DbTableData = {
  name: "companies",
  numbered: true,
  cols: [
    { name: "industry", type: "text", w: 100, wm: "12.5%", wp: 90 },
    { name: "signal", type: "text", w: 112, wm: "15%", wp: 104, join: "signal" },
    { name: "fit", type: "int", w: 68, wm: "9%", wp: 42, end: true },
    { name: "next_best_play", type: "text", w: 224, wm: "28.5%", wp: 202, join: "play" },
    { name: "crm_deal", type: "enum", w: 104, wm: "13.5%", wp: 98, join: "deal" },
    { name: "headcount", type: "int", w: 120, wm: "9.4%", wp: 76, end: true },
    { name: "last_touch", type: "text", w: 124, wm: "13.8%", wp: 104 },
    { name: "lost_reason", type: "enum", w: 140, wm: "14.3%", wp: 100 },
    { name: "source", type: "enum", w: 104, wm: "11%", wp: 84 },
    { name: "region", type: "text", w: 96, wm: "10%", wp: 72 },
    { name: "created", type: "date" },
  ],
  rows: [
    // the accounts to work the take ends on, ranked. The first four passed 90 while it played.
    // The first is the one the take turns on: a lost deal at 64, out of the view until its signal
    // lands; its deal is open again when the take ends
    row(
      "fi",
      ["c_4f2a", "Fintech", tag("open"), lands("fi-signal", "new VP Sales", { hit: true }), hit("96"), play("fi", "Reach back out", { hit: true }), "200", "demo call", tag("timing"), "crm", "US", "2025-03-11"],
      { mark: "hit" },
    ),
    row("dv", ["c_91be", "Dev tools", null, "Series B", "93", play("dv", "Reach out on the round"), "40", "asked pricing", null, "website", "US", "2025-06-02"]),
    row("lg", ["c_d5a1", "Legal tech", lost, "new funding", "92", play("lg", "Reach out on the round", { idle: undefined }), "60", null, tag("timing"), "crm", "UK", "2025-01-27"]),
    row("lo", ["c_27d0", "Logistics", tag("open"), "hiring SDRs", "91", play("lo", "Follow up on the event"), "1,200", "attended event", null, "event", "EU", "2024-11-19"]),
    row("ro", ["c_0be5", "Robotics", null, lands("ro-signal", "new funding"), "89", null, "420", null, null, "event", "US", "2025-10-03"]),
    row("ba", ["c_84ad", "Banking", tag("open"), "hiring SDRs", "88", null, "900", "demo call", null, "product", "US", "2025-10-20"]),
    row("pp", ["c_1f6d", "Proptech", lost, "new CRO", "86", null, "55", "visited pricing", tag("no budget"), "website", "US", "2025-08-14"]),
    row("rt", ["c_5e18", "Retail", null, "new CMO", "84", null, "2,400", null, null, "crm", "EU", "2024-09-03"]),
    row("in", ["c_c0d9", "Insurance", tag("open"), "visits up", "81", null, "720", "demo request", null, "website", "US", "2025-04-22"]),
    row("hr", ["c_3b7e", "HR software", null, "headcount up", "77", null, "95", null, null, "crm", "US", "2025-02-08"]),
    row("se", ["c_e214", "Security", null, "headcount up", "74", null, "540", "attended event", null, "event", "EU", "2025-05-30"]),
    row("tr", ["c_77b2", "Travel", lost, lands("tr-signal", "new CFO"), "71", null, "140", null, tag("no budget"), "crm", "APAC", "2024-12-12"]),
    row("ga", ["c_9a40", "Gaming", tag("open"), "new funding", "68", null, "180", "asked pricing", null, "product", "US", "2025-07-01"]),
    row("bi", ["c_62ce", "Biotech", null, "visits up", "61", null, "30", null, null, "crm", "EU", "2025-03-25"]),
    row("ed", ["c_08fa", "Edtech", lost, "new CMO", "58", null, "85", null, tag("timing"), "crm", "UK", "2024-10-16"]),
    row("te", ["c_f602", "Telecom", null, "visits up", "49", null, "3,100", "attended event", null, "event", "APAC", "2025-07-23"]),
    // the same account, entered twice: merged into its row
    row("in2", ["c_e9c4", "Insurance", tag("open"), "visits up", "81", null, "720", null, null, "crm", "US", "2025-04-29"], out),
    // no signal: not in the accounts to work
    row("ht", ["c_a6c3", "Health tech", tag("closed_won"), null, "97", null, "310", "renewed", null, "crm", "US", "2024-08-21"], out),
    row("ec", ["c_7d21", "Ecommerce", tag("open"), null, "95", null, "75", "asked pricing", null, "website", "EU", "2025-09-12"], out),
    row("ad", ["c_c41a", "Adtech", tag("open"), null, "92", null, "65", "demo call", null, "crm", "UK", "2025-09-28"], out),
    row("cl", ["c_18f3", "Climate", tag("closed_won"), null, "90", null, "150", null, null, "crm", "EU", "2025-02-17"], out),
    row("me", ["c_b3d7", "Media", lost, null, "55", null, "230", "webinar", tag("rival"), "event", "US", "2025-06-18"], out),
  ],
};

/** What the take needs to know of DB_HERO's rows (their keys).
 *  `orders`: the rows on show, top to bottom, at each moment (the window shows the first
 *  thirteen; the table is ranked by fit all along):
 *    base       before anything: every row
 *    rescored   a signal landed on Robotics, the Brain rescored it: it went up two places
 *    view       asked which accounts to work: the ones that have a signal
 *    merged     the duplicate has gone into its row
 *    logistics  a new signal on Logistics, its new fit: it went to the top
 *    entered    a signal landed on Fintech: it has one now, so it is in the view (at its old fit)
 *    fintech    ... and the Brain rescored it: the top
 *    travel     a signal landed on Travel: it is in the view
 *    devtools, legal   that account passed 90
 *  `legal` is the last: the markup's own order.
 *  `fits`: [before, after] for the accounts the Brain rescores while the take plays.
 *  `was`: the signal an account had before its new one landed.
 *  `status`: what the table's status line says as each thing happens. */
export const DB_HERO_STORY = {
  orders: {
    base: ["ht", "ec", "ad", "cl", "ba", "pp", "ro", "rt", "dv", "in", "in2", "lg", "lo", "hr", "se", "tr", "ga", "fi", "bi", "ed", "me", "te"],
    rescored: ["ht", "ec", "ad", "cl", "ro", "ba", "pp", "rt", "dv", "in", "in2", "lg", "lo", "hr", "se", "tr", "ga", "fi", "bi", "ed", "me", "te"],
    view: ["ro", "ba", "pp", "rt", "dv", "in", "in2", "lg", "lo", "hr", "se", "ga", "bi", "ed", "te"],
    merged: ["ro", "ba", "pp", "rt", "dv", "in", "lg", "lo", "hr", "se", "ga", "bi", "ed", "te"],
    logistics: ["lo", "ro", "ba", "pp", "rt", "dv", "in", "lg", "hr", "se", "ga", "bi", "ed", "te"],
    entered: ["lo", "ro", "ba", "pp", "rt", "dv", "in", "lg", "hr", "se", "ga", "fi", "bi", "ed", "te"],
    fintech: ["fi", "lo", "ro", "ba", "pp", "rt", "dv", "in", "lg", "hr", "se", "ga", "bi", "ed", "te"],
    travel: ["fi", "lo", "ro", "ba", "pp", "rt", "dv", "in", "lg", "hr", "se", "tr", "ga", "bi", "ed", "te"],
    devtools: ["fi", "dv", "lo", "ro", "ba", "pp", "rt", "in", "lg", "hr", "se", "tr", "ga", "bi", "ed", "te"],
    legal: ["fi", "dv", "lg", "lo", "ro", "ba", "pp", "rt", "in", "hr", "se", "tr", "ga", "bi", "ed", "te"],
  },
  pair: ["in", "in2"],
  hero: "fi",
  fits: { ro: [85, 89], lo: [78, 91], fi: [64, 96], dv: [82, 93], lg: [79, 92] },
  was: { lo: "visits up", dv: "visits up", lg: "headcount up" },
  status: {
    idle: "Synced",
    roSignal: "Robotics: new funding",
    roFit: "Robotics: fit 89",
    merge: "Insurance: 2 rows merged",
    loSignal: "Logistics: hiring SDRs",
    loFit: "Logistics: fit 91",
    fiSignal: "Fintech: new VP Sales",
    fiFit: "Fintech: fit 96",
    trSignal: "Travel: new CFO",
    plays: "2 Plays written",
    dvSignal: "Dev tools: Series B",
    dvFit: "Dev tools: fit 93",
    dvLive: "Dev tools: Play live",
    reopen: "Fintech: deal reopened",
    lgSignal: "Legal tech: new funding",
    lgFit: "Legal tech: fit 92",
    lgLive: "Legal tech: Play live",
  },
} as const;
