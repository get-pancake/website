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

/* ── hero: Pancake's tables, alive, and Claude at work on them (the curtain, LpVisionCurtain.tsx) ── */

/** the tables of the data layer, each a tab of the window's bar. The signals' count is the one at
 *  the take's end: it starts 12 lower and ticks up as the batches land */
export const DB_HERO_TABS = [
  { name: "companies", rows: "4,812" },
  { name: "people", rows: "12,960" },
  { name: "signals", rows: "38,216" },
] as const;

const lost = tag("closed_lost");
const open = tag("open");
const won = tag("closed_won");
/** a value that lands while the take plays: NULL until then, the value at rest */
const lands = (key: string, v: string, more: Partial<DbCellObj> = {}): DbCellObj => ({ v, land: key, nil: "take", ...more });
/** a Play written and run while the take plays: NULL, then its name, then live (in one batch) */
const play = (row: string, v: string, more: Partial<DbCellObj> = {}): DbCellObj => ({ ...lands(`${row}-play`, v), state: "live", ...more });
type Rest = readonly [deal: DbCell, signal: DbCell, fit: DbCell, play: DbCell, segment: string, touch: DbCell, reason: DbCell, source: string, region: string, created: string];
/** a row: the company, its industry, then what the visitor's data says of it */
const row = (key: string, company: DbCell, industry: string, rest: Rest, more: Pick<DbRow, "mark" | "out"> = {}): DbRow => {
  const [deal, signal, fit, play, segment, touch, reason, source, region, created] = rest;
  return { key, ...more, c: [company, signal, fit, play, industry, deal, tag(segment), touch, reason, tag(source), region, created] };
};
const out = { out: true } as const;
/** an account with no signal: the filter drops it (it fills the table when the camera pulls back) */
const quiet = (key: string, company: string, industry: string, fit: string, deal: DbCell, segment: string, source: string, region: string, created: string) =>
  row(key, company, industry, [deal, null, fit, null, segment, null, null, source, region, created], out);

/** The hero's companies table (2026-11-11, reworked 2026-11-12). The founder, on the takes before
 *  this one: "plus de dynamisme: filtrage, ajout de colonne, merge de rows", "un data model
 *  underneath mon Claude", "il faut qu'on retrouve un côté plus autonome et dynamique où la base vit
 *  seule", "je veux plus être sur quels accounts on veut work on", then "I don't want to see line
 *  by line actions, more bulk stuff, and the mono selection of cells makes think it's a gsheet",
 *  and on the window's side: "it switches from tables, scroll right, sometimes unzoom to show much
 *  more cells, not reproduce a human scrolling an excel".
 *  So everything that happens here happens IN BULK: a batch of signals lands on several accounts
 *  at once, the fit column is recomputed for all of them, the whole table re-sorts in one move,
 *  duplicates merge together, a column opens and fills at once, five Plays go live together. No
 *  cell is ever selected on its own. The window moves over the data like a camera
 *  (lp-vision-curtain-timeline.ts): it pulls back to show thousands of cells, pans right to the
 *  CRM's columns, and switches to the people and signals tables (DB_PEOPLE, DB_SIGNALS).
 *  THE COMPANIES are well-known ones, by name, the industry in its own column (founder,
 *  2026-11-12: "what does it mean to put categories in the name of companies? put hot companies
 *  instead"). None is a customer of Pancake (the logo strip's) and none a tool of its own field.
 *  What the table says of them is the visitor's own data in an example (their deal, their fit, a
 *  signal), not a fact about them: no size, no figure, no date of theirs.
 *  THE ROWS, in the markup's order: first the sixteen accounts the take ends on, in their final
 *  order (their fit, falling); then the rows that are in the table while the take plays and not in
 *  the view it ends on (`out`, not shown at rest): three duplicates, and the accounts with no
 *  signal. DB_HERO_STORY gives the fit and the signal of every row that changes, moment by moment;
 *  the take sorts the rows from them.
 *  THE COLUMNS: a name and a type, as a database tool prints them, nothing over them (founder,
 *  2026-11-11: "évite les mots type fioriture"). `next_best_play` is shut until Claude runs the
 *  Plays (`join: "play"`). Its width is that of what it pushes out of sight (industry and crm_deal:
 *  224 px), so the card's edge falls on a column's line before and after: at rest the window
 *  shows the four columns of the story (company, signal, fit and the Play: 504 px, vision.css
 *  --vc-cols). The table is half as wide again as the card: what is pushed right stays in it, past
 *  the edge, for the camera to pan to. A narrow window (a tablet on its side, a phone: widths `wm`,
 *  shares of the card, and `wp`) has no room for all of them: there the deal's and the signal's
 *  columns fold away as the Plays' opens (vision.css). */
export const DB_HERO: DbTableData = {
  name: "companies",
  numbered: true,
  cols: [
    { name: "company", type: "text", w: 100, wm: "12.5%", wp: 90 },
    { name: "signal", type: "text", w: 112, wm: "15%", wp: 104, join: "signal" },
    { name: "fit", type: "int", w: 68, wm: "9%", wp: 42, end: true },
    { name: "next_best_play", type: "text", w: 224, wm: "28.5%", wp: 202, join: "play" },
    { name: "industry", type: "text", w: 120, wm: "13.5%", wp: 98 },
    { name: "crm_deal", type: "enum", w: 104, wm: "13.5%", wp: 98, join: "deal" },
    { name: "segment", type: "enum", w: 120, wm: "10%", wp: 84 },
    { name: "last_touch", type: "text", w: 132, wm: "13.8%", wp: 104 },
    { name: "lost_reason", type: "enum", w: 132, wm: "14.3%", wp: 100 },
    { name: "source", type: "enum", w: 104, wm: "11%", wp: 84 },
    { name: "region", type: "text", w: 88, wm: "10%", wp: 72 },
    { name: "created", type: "date" },
  ],
  rows: [
    // the accounts to work, ranked as the take ends. The first is the one it turns on: a lost
    // deal, no signal until its new VP Sales lands; its deal is open again at the end
    row(
      "fi",
      hit("Ramp"),
      "Fintech",
      [open, lands("fi-signal", "new VP Sales", { hit: true }), hit("96"), play("fi", "Reach back out", { hit: true }), "growth", "replied", tag("timing"), "crm", "US", "2025-03-11"],
      { mark: "hit" },
    ),
    row("dv", "Linear", "Dev tools", [null, "new signup", "93", lands("dv-play", "Book a demo"), "growth", "asked pricing", null, "website", "US", "2025-06-02"]),
    row("lg", "Supabase", "Database", [lost, "new funding", "92", null, "growth", null, tag("timing"), "crm", "US", "2025-01-27"]),
    row("lo", "Mercury", "Fintech", [open, "hiring SDRs", "91", play("lo", "Event follow-up"), "growth", "follow-up sent", null, "event", "US", "2024-11-19"]),
    row("ro", "Lovable", "AI", [null, lands("ro-signal", "new funding"), "89", play("ro", "Event follow-up"), "growth", "follow-up sent", null, "event", "EU", "2025-10-03"]),
    row("ba", "Deel", "HR software", [open, lands("ba-signal", "hiring SDRs"), "88", play("ba", "Demo follow-up"), "enterprise", "follow-up sent", null, "product", "US", "2025-10-20"]),
    row("pp", "Dust", "AI agents", [lost, "new CRO", "86", play("pp", "Pricing follow-up"), "enterprise", "follow-up sent", tag("no budget"), "website", "US", "2025-08-14"]),
    row("rt", "Framer", "Design", [null, lands("rt-signal", "new CMO"), "84", null, "growth", null, null, "crm", "EU", "2024-09-03"]),
    row("in", "Retool", "Internal tools", [open, "visits up", "81", null, "growth", "demo request", null, "website", "US", "2025-04-22"]),
    row("hr", "Rippling", "HR software", [null, "headcount up", "77", null, "enterprise", null, null, "crm", "US", "2025-02-08"]),
    row("se", "Vanta", "Security", [null, lands("se-signal", "headcount up"), "74", null, "growth", "attended event", null, "event", "US", "2025-05-30"]),
    row("tr", "Brex", "Fintech", [lost, lands("tr-signal", "new CFO"), "71", null, "enterprise", null, tag("no budget"), "crm", "US", "2024-12-12"]),
    row("ga", "Replit", "Dev tools", [open, "new funding", "68", null, "growth", "asked pricing", null, "product", "US", "2025-07-01"]),
    row("bi", "Runway", "AI video", [null, "visits up", "61", null, "growth", null, null, "crm", "US", "2025-03-25"]),
    row("ed", "Descript", "Media", [lost, "new CMO", "58", null, "growth", null, tag("timing"), "crm", "US", "2024-10-16"]),
    row("te", "Pitch", "Productivity", [null, "visits up", "49", null, "growth", "attended event", null, "event", "EU", "2025-07-23"]),
    // the same accounts, entered twice: merged into their rows
    row("in2", "Retool", "Internal tools", [open, "visits up", "81", null, "growth", null, null, "crm", "US", "2025-04-29"], out),
    row("bi2", "Runway", "AI video", [null, "visits up", "61", null, "growth", null, null, "website", "US", "2025-08-02"], out),
    row("te2", "Pitch", "Productivity", [null, "visits up", "49", null, "growth", null, null, "crm", "EU", "2025-09-15"], out),
    // no signal: not in the accounts to work
    quiet("ht", "Notion", "Productivity", "97", won, "enterprise", "crm", "US", "2024-08-21"),
    quiet("ec", "Cursor", "AI coding", "95", open, "growth", "website", "US", "2025-09-12"),
    quiet("f1", "Airtable", "No-code", "94", null, "enterprise", "crm", "US", "2024-06-30"),
    quiet("ad", "Perplexity", "AI search", "92", open, "enterprise", "crm", "US", "2025-09-28"),
    quiet("cl", "Mistral", "AI", "90", won, "enterprise", "crm", "EU", "2025-02-17"),
    quiet("f2", "Miro", "Collaboration", "87", lost, "enterprise", "event", "EU", "2024-05-14"),
    quiet("f3", "Webflow", "Web", "83", null, "growth", "website", "US", "2025-01-09"),
    quiet("f4", "Zapier", "Automation", "80", open, "growth", "crm", "US", "2024-12-01"),
    quiet("f5", "Intercom", "Support", "76", null, "enterprise", "crm", "US", "2024-07-22"),
    quiet("f6", "Mixpanel", "Analytics", "72", lost, "growth", "event", "US", "2025-03-03"),
    quiet("f7", "Calendly", "Scheduling", "69", null, "growth", "website", "US", "2024-10-28"),
    quiet("f8", "Typeform", "Forms", "66", null, "growth", "crm", "EU", "2025-05-06"),
    quiet("f9", "Loom", "Video", "63", won, "growth", "crm", "US", "2024-03-19"),
    quiet("me", "Hex", "Data", "55", lost, "growth", "event", "US", "2025-06-18"),
    quiet("f10", "Grammarly", "Writing", "46", null, "enterprise", "website", "US", "2024-02-12"),
  ],
};

/** What the take needs to know of DB_HERO's rows (their keys). It happens in four moments: before
 *  anything (0), after the first batch of signals (1), after three people changed jobs (2), after
 *  the second batch of signals (3). The table is ranked by fit all along: the take sorts the rows
 *  it shows by these fits at each moment (ties keep the markup's order).
 *  `rows`: the fit and the signal of every row that changes, at the four moments (NULL: none); the
 *  last are the cells' own. A row whose signal is NULL at first lands it (its cell is a `lands`
 *  one); another has it replaced.
 *  `pairs`: [the row that stays, its duplicate]. `runs`: the five accounts Claude runs the Plays
 *  on: the first gets its own Play; the four others are the follow-ups the visitor owes, each
 *  fitted to its last touch (an event, a demo, a pricing visit), sent in one HeyReach sequence.
 *  Their names fit the column's first 120 px with the live dot (the split once scrolled onto,
 *  vision.css data-wide). `drafted`: the Play written and not run. `crm`: what the visitor's CRM says of five accounts when it syncs, before → after.
 *  `count`: what the view bar's count says: filtered, deduplicated, after the people's moves.
 *  `status`: what the table's status line says as each thing happens. */
export const DB_HERO_STORY = {
  rows: {
    fi: { fit: [64, 64, 96, 96], signal: [null, null, "new VP Sales", "new VP Sales"] },
    dv: { fit: [82, 82, 82, 93], signal: ["visits up", "visits up", "visits up", "new signup"] },
    lg: { fit: [79, 79, 79, 92], signal: ["headcount up", "headcount up", "headcount up", "new funding"] },
    lo: { fit: [78, 91, 91, 91], signal: ["visits up", "hiring SDRs", "hiring SDRs", "hiring SDRs"] },
    ro: { fit: [85, 89, 89, 89], signal: [null, "new funding", "new funding", "new funding"] },
    ba: { fit: [80, 88, 88, 88], signal: [null, "hiring SDRs", "hiring SDRs", "hiring SDRs"] },
    pp: { fit: [83, 83, 86, 86], signal: ["visits up", "visits up", "new CRO", "new CRO"] },
    rt: { fit: [76, 84, 84, 84], signal: [null, "new CMO", "new CMO", "new CMO"] },
    se: { fit: [70, 74, 74, 74], signal: [null, "headcount up", "headcount up", "headcount up"] },
    tr: { fit: [66, 66, 71, 71], signal: [null, null, "new CFO", "new CFO"] },
    ga: { fit: [62, 68, 68, 68], signal: ["visits up", "new funding", "new funding", "new funding"] },
  },
  pairs: [
    ["in", "in2"],
    ["bi", "bi2"],
    ["te", "te2"],
  ],
  hero: "fi",
  runs: ["fi", "lo", "ro", "ba", "pp"],
  drafted: "dv",
  crm: {
    fi: { touch: ["demo call", "replied"], deal: ["closed_lost", "open"] },
    lo: { touch: ["attended event", "follow-up sent"] },
    ro: { touch: ["attended event", "follow-up sent"] },
    ba: { touch: ["demo call", "follow-up sent"] },
    pp: { touch: ["visited pricing", "follow-up sent"] },
  },
  count: ["86 rows", "83 rows", "85 rows"],
  status: {
    idle: "Synced",
    batch1: "6 signals in",
    rescore1: "6 accounts rescored",
    merge: "3 duplicates merged",
    moves: "3 people moved",
    rescore2: "3 accounts rescored",
    plays: "5 Plays live",
    batch2: "3 signals in",
    rescore3: "2 accounts rescored",
    crm: "Your CRM: 5 accounts updated",
  },
} as const;

/** The people table (a tab of the window): one row a person, by role, never by name; the company
 *  they are at, the one they were at, whether they bought from you there. Sorted by when they
 *  moved. Three people change jobs while the take plays, in one batch (DB_PEOPLE_STORY): the
 *  first is the take's turn, the VP Sales who bought from you at Notion, now at Ramp. */
export const DB_PEOPLE: DbTableData = {
  name: "people",
  numbered: true,
  cols: [
    { name: "id", type: "pk", w: 64, hide: "phone" },
    { name: "role", type: "text", w: 120, wp: 104 },
    { name: "company", type: "text", w: 100, wp: 80 },
    { name: "was_at", type: "text", w: 88, wp: 80 },
    { name: "bought", type: "bool", w: 88, wp: 70 },
    { name: "moved", type: "date", hide: "phone" },
  ],
  rows: [
    { key: "p1", mark: "hit", c: ["p_7c21", hit("VP Sales"), hit("Ramp"), lands("p1-was", "Notion", { hit: true }), { v: "", as: "check", hit: true }, "today"] },
    { key: "p2", c: ["p_9e04", "CFO", "Brex", lands("p2-was", "Mercury"), { v: "", as: "uncheck" }, "today"] },
    { key: "p3", c: ["p_2b7a", "CRO", "Dust", lands("p3-was", "Retool"), { v: "", as: "uncheck" }, "today"] },
    { key: "p4", c: ["p_0d3e", "Head of Growth", "Linear", null, { v: "", as: "uncheck" }, "2025-10-30"] },
    { key: "p5", c: ["p_e5c9", "Head of Sales", "Deel", null, { v: "", as: "check" }, "2025-10-12"] },
    { key: "p6", c: ["p_71aa", "VP Engineering", "Linear", null, { v: "", as: "uncheck" }, "2025-09-02"] },
    { key: "p7", c: ["p_8b62", "RevOps lead", "Supabase", null, { v: "", as: "uncheck" }, "2025-08-21"] },
    { key: "p8", c: ["p_3f07", "Founder", "Lovable", null, { v: "", as: "uncheck" }, "2025-07-14"] },
    { key: "p9", c: ["p_4a90", "VP Marketing", "Descript", null, { v: "", as: "uncheck" }, "2025-06-03"] },
    { key: "p10", c: ["p_c118", "CMO", "Framer", null, { v: "", as: "uncheck" }, "2025-05-19"] },
    { key: "p11", c: ["p_d2e6", "Head of Sales", "Mercury", null, { v: "", as: "check" }, "2025-04-08"] },
    { key: "p12", c: ["p_5f31", "CFO", "Vanta", null, { v: "", as: "uncheck" }, "2025-03-27"] },
    { key: "p13", c: ["p_b7c4", "Head of RevOps", "Rippling", null, { v: "", as: "uncheck" }, "2025-02-11"] },
  ],
};

/** The people who change jobs while the take plays: where they were and since when, before the
 *  batch. Before it they stand where their old date ranks them (at the bottom); after it, at the
 *  top together */
export const DB_PEOPLE_STORY = {
  movers: {
    p1: { company: "Notion", moved: "2024-03-04" },
    p2: { company: "Mercury", moved: "2024-11-20" },
    p3: { company: "Retool", moved: "2025-01-15" },
  },
  before: ["p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12", "p13", "p3", "p2", "p1"],
  hero: "p1",
} as const;

/** The signals table (a tab of the window): every signal as it comes in, the newest first. Two
 *  batches arrive while the take plays (and one more lands while another table is on show):
 *  DB_SIGNALS_STORY. */
export const DB_SIGNALS: DbTableData = {
  name: "signals",
  numbered: true,
  cols: [
    { name: "at", type: "time", w: 60, wp: 52 },
    { name: "company", type: "text", w: 100, wp: 92 },
    { name: "signal", type: "text", w: 124, wp: 110 },
    { name: "source", type: "enum", wp: 80 },
  ],
  rows: [
    { key: "s5a", c: ["10:44", "Linear", "new signup", tag("your product")] },
    { key: "s5b", c: ["10:44", "Supabase", "new funding", tag("funding news")] },
    { key: "s5c", c: ["10:43", "Runway", "visits up", tag("your website")] },
    { key: "s3a", c: ["10:42", "Ramp", "new VP Sales", tag("team pages")] },
    { key: "s3b", c: ["10:42", "Brex", "new CFO", tag("team pages")] },
    { key: "s3c", c: ["10:42", "Dust", "new CRO", tag("team pages")] },
    { key: "s1a", c: ["10:41", "Mercury", "hiring SDRs", tag("job posts")] },
    { key: "s1b", c: ["10:41", "Lovable", "new funding", tag("funding news")] },
    { key: "s1c", c: ["10:40", "Deel", "hiring SDRs", tag("job posts")] },
    { key: "s1d", c: ["10:40", "Framer", "new CMO", tag("team pages")] },
    { key: "s1e", c: ["10:39", "Vanta", "headcount up", tag("team pages")] },
    { key: "s1f", c: ["10:39", "Replit", "new funding", tag("funding news")] },
    { key: "s0a", c: ["10:31", "Retool", "visits up", tag("your website")] },
    { key: "s0b", c: ["10:28", "Rippling", "headcount up", tag("team pages")] },
    { key: "s0c", c: ["10:26", "Descript", "new CMO", tag("team pages")] },
    { key: "s0d", c: ["10:22", "Pitch", "visits up", tag("your website")] },
    { key: "s0e", c: ["10:19", "Supabase", "headcount up", tag("team pages")] },
    { key: "s0f", c: ["10:15", "Linear", "visits up", tag("your website")] },
    { key: "s0g", c: ["10:12", "Mercury", "visits up", tag("your website")] },
    { key: "s0h", c: ["10:09", "Dust", "visits up", tag("your website")] },
    { key: "s0i", c: ["10:05", "Runway", "visits up", tag("your website")] },
    { key: "s0j", c: ["10:02", "Replit", "visits up", tag("your website")] },
  ],
};

/** the batches of signals, in the order they arrive (each lands on top of the ones before) */
export const DB_SIGNALS_STORY = {
  batches: [
    ["s1a", "s1b", "s1c", "s1d", "s1e", "s1f"],
    ["s3a", "s3b", "s3c"],
    ["s5a", "s5b", "s5c"],
  ],
  /** the signals' count before any batch */
  count: 38204,
} as const;
