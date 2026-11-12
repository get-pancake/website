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
   *  table). The key is the one the take and the loop after it know the cell by
   *  (lp-vision-curtain-timeline.ts: `<row>-signal`, `<row>-play`) */
  land?: string;
  /** when such a value is not there. "take": NULL until the take lands it, the value at rest.
   *  "rest": NULL at rest too, it comes once the loop runs. Unset: there all along (the loop can
   *  still take it away and land it again) */
  nil?: "take" | "rest";
  /** the agent that works in this cell: its ring around the cell and its mark on the ring's
   *  corner, as a shared canvas shows a collaborator (the hero's table) */
  by?: string;
  /** a state the value takes once the agent has acted on it, printed after it (the hero's table) */
  state?: string;
  /** the agent is not on this cell at rest: it comes to it once the loop runs */
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
};

export type DbRow = {
  c: readonly DbCell[];
  /** hit: the row the picture points at · new: a row just added · cut: a row merged away ·
   *  sum: the line under the others */
  mark?: "hit" | "new" | "cut" | "sum";
  /** the name the take knows the row by (the hero's table) */
  key?: string;
  /** a marked row that is not lit at rest: it lights when the loop comes to it (the hero's table) */
  dim?: true;
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

/* ── hero: Pancake's companies table, and Claude at work on it (the curtain, LpVisionCurtain.tsx) ── */

/** the tables of the data layer; the signals' count is the one the take ticks up (it is the
 *  count the take starts from: a datapoint that lands adds one) */
export const DB_HERO_TABS = [
  { name: "companies", rows: "4,812" },
  { name: "people", rows: "12,960" },
  { name: "signals", rows: "38,204" },
] as const;

type Landing = Pick<DbCellObj, "nil" | "hit" | "idle">;
/** a value that comes and goes (`land`) */
const land = (key: string, v: string, more: Landing = {}): DbCellObj => ({ v, land: key, ...more });
/** a row's signal, and its Play: the cell Claude works in */
const signal = (row: string, v: string, more: Landing = {}) => land(`${row}-signal`, v, more);
const play = (row: string, v: string, more: Landing = {}): DbCellObj => ({ ...land(`${row}-play`, v, more), by: "Claude", state: "live" });

/** One row per company: what the outside says, what to do next, what you know. The four columns
 *  on the left are the ones on show beside Claude (the curtain rests at 44 % of the card: their
 *  widths add up to what is left); the three others are past the card's edge until the curtain is
 *  slid.
 *  Rows a, b and c are the three accounts Claude names. Row a takes its signal and its Play while
 *  the take opens, then goes live when Claude runs the Play: Claude's mark is on that cell.
 *  m1 and m2 are datapoints that land while Claude answers (the database keeps working).
 *  Then the loop: asked for the next best Play again and again, Claude goes b, c, p1, p2, p3, a
 *  and round again. A row's signal and its Play land two rounds before its turn (p1, p2 and p3's
 *  Play are NULL at rest), and a Play that has run is cleared when the next round opens.
 *  THE FILTER (2026-11-11, the founder on this window: "des prompts qui sont envoyés et que ça
 *  va filtrer la database"): each time Claude reads, the table narrows to `next_best_play is not
 *  NULL`, and the whole table comes back once the Play is live. So a row has a Play only where
 *  the take or the loop gives it one (three at any time: the filter's rows); every other row's
 *  next_best_play is NULL. Fourteen rows: with the view bar over the head they fill the card. */
export const DB_HERO: DbTableData = {
  name: "companies",
  numbered: true,
  cols: [
    { name: "id", type: "pk", w: "7.4%", wm: "9.5%", wp: 60, src: "Key" },
    { name: "industry", type: "text", w: "10.4%", src: "Profile", hide: "phone mid" },
    { name: "signal", type: "text", w: "14.6%", wm: "17%", wp: 112, src: "Data providers" },
    { name: "next_best_play", type: "text", w: "20.4%", wm: "21.5%", src: "The Brain" },
    { name: "crm_deal", type: "enum", w: "13.2%", wm: "17%", src: "Your CRM", hide: "phone" },
    { name: "last_touch", type: "text", w: "15%", wm: "auto", src: "Calls, events", hide: "phone" },
    { name: "headcount", type: "int", end: true, src: "Data providers", hide: "phone mid" },
  ],
  rows: [
    { c: ["c_08fa", "Edtech", null, null, tag("closed_lost"), null, "85"] },
    {
      key: "a",
      mark: "hit",
      c: [
        "c_4f2a",
        "Fintech",
        signal("a", "hiring SDRs", { nil: "take", hit: true }),
        play("a", "Reach back out", { nil: "take", hit: true }),
        tag("closed_lost", true),
        null,
        "200",
      ],
    },
    {
      key: "b",
      mark: "hit",
      c: [
        "c_91be",
        "Dev tools",
        signal("b", "funding Series B", { hit: true }),
        play("b", "Send the pricing follow-up", { hit: true, idle: true }),
        tag("open"),
        hit("asked pricing"),
        "40",
      ],
    },
    {
      key: "c",
      mark: "hit",
      c: [
        "c_27d0",
        "Logistics",
        signal("c", "new VP Sales", { hit: true }),
        play("c", "Follow up on the event", { hit: true, idle: true }),
        null,
        hit("attended event"),
        "1,200",
      ],
    },
    {
      key: "p1",
      mark: "hit",
      dim: true,
      c: [
        "c_d5a1",
        "Legal tech",
        signal("p1", "new funding", { nil: "rest", hit: true }),
        play("p1", "Reach out on the round", { nil: "rest", hit: true, idle: true }),
        null,
        null,
        "60",
      ],
    },
    { c: ["c_a6c3", "Health tech", "headcount up", null, tag("closed_won"), null, "310"] },
    {
      key: "p3",
      mark: "hit",
      dim: true,
      c: [
        "c_5e18",
        "Retail",
        signal("p3", "uses a rival tool", { hit: true }),
        play("p3", "Start with the comparison", { nil: "rest", hit: true, idle: true }),
        null,
        null,
        "2,400",
      ],
    },
    { c: ["c_c0d9", "Insurance", "new CMO", null, null, "asked for a demo", "720"] },
    { c: ["c_3b7e", "HR software", signal("m1", "headcount up", { nil: "take" }), null, tag("open"), null, "95"] },
    { c: ["c_e214", "Security", signal("m2", "headcount up", { nil: "take" }), null, null, "attended event", "540"] },
    { c: ["c_77b2", "Travel", null, null, tag("closed_lost"), null, "140"] },
    {
      key: "p2",
      mark: "hit",
      dim: true,
      c: [
        "c_1f6d",
        "Proptech",
        signal("p2", "new CRO", { nil: "rest", hit: true }),
        play("p2", "Introduce yourself", { nil: "rest", hit: true, idle: true }),
        null,
        null,
        "55",
      ],
    },
    { c: ["c_9a40", "Gaming", "new funding", null, tag("open"), "asked pricing", "180"] },
    { c: ["c_62ce", "Biotech", "uses a rival tool", null, null, null, "30"] },
  ],
};

/** the view Claude draws of the three accounts it names, beside its answer (seen once the curtain
 *  is slid off it) */
export const DB_ARTIFACT: DbTableData = {
  name: "accounts",
  cols: [{ name: "id", w: 74 }, { name: "industry", w: 96 }, { name: "headcount", w: 92, end: true }, { name: "next_best_play" }],
  rows: [
    { c: ["c_4f2a", "Fintech", "200", { v: "Reach back out", hit: true }], mark: "hit" },
    { c: ["c_91be", "Dev tools", "40", "Send the pricing follow-up"] },
    { c: ["c_27d0", "Logistics", "1,200", "Follow up on the event"] },
  ],
};
