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
  /** a value that lands while the picture plays: NULL until then (the hero's table) */
  live?: true;
  /** a vendor's own mark before the value */
  logo?: string;
};
/** null is drawn as NULL */
export type DbCell = string | null | DbCellObj;

export type DbCol = {
  name: string;
  type?: string;
  /** width in px on a desktop; a column without one takes what is left */
  w?: number;
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
const ref = (v: string, hit?: true): DbCellObj => ({ v, as: "ref", ...(hit ? { hit } : {}) });
const hit = (v: string): DbCellObj => ({ v, hit: true });
const cut = (v: string): DbCellObj => ({ v, cut: true });
const LIVE: DbCellObj = { v: "live", as: "live" };

/* ── hero: the companies table under Claude's answer (the curtain, LpVisionCurtain.tsx) ────── */

export const DB_HERO_TABS = [
  { name: "companies", rows: "4,812" },
  { name: "people", rows: "12,960" },
  { name: "signals", rows: "38,204" },
] as const;

const live = (v: string): DbCellObj => ({ v, live: true });

/** One row per company: what you know, what the outside says, what to do next. The widths place
 *  each column on the 1136 px card: Claude covers the left of it, so the two columns that carry
 *  the answer (signal, next_best_play) are the ones on show. Rows 3 to 5 are the three accounts
 *  Claude names: its lines sit on theirs. Row 2 takes a datapoint while the picture plays. */
export const DB_HERO: DbTableData = {
  name: "companies",
  numbered: true,
  cols: [
    { name: "id", type: "pk", w: 90, wp: 60, src: "Key" },
    { name: "industry", type: "text", w: 130, src: "Profile", hide: "phone mid" },
    { name: "crm_deal", type: "enum", w: 150, src: "Your CRM", hide: "phone" },
    { name: "last_touch", type: "text", w: 180, src: "Calls, events", hide: "phone mid" },
    { name: "signal", type: "text", w: 190, wp: 112, src: "Data providers" },
    { name: "next_best_play", type: "text", src: "The Brain" },
  ],
  rows: [
    { c: ["c_08fa", "Edtech", tag("closed_lost"), null, null, null] },
    { c: ["c_d5a1", "Legal tech", null, null, live("new funding"), live("Reach out on the round")], mark: "new" },
    { c: ["c_4f2a", "Fintech", tag("closed_lost", true), null, hit("hiring SDRs"), hit("Reach back out")], mark: "hit" },
    { c: ["c_91be", "Dev tools", tag("open"), "asked pricing", "funding Series B", hit("Send the pricing follow-up")], mark: "hit" },
    { c: ["c_27d0", "Logistics", null, "attended event", "new VP Sales", hit("Follow up on the event")], mark: "hit" },
    { c: ["c_a6c3", "Health tech", tag("closed_won"), null, "headcount up", "Offer the team plan"] },
    { c: ["c_5e18", "Retail", null, null, "uses a rival tool", "Start with the comparison"] },
    { c: ["c_c0d9", "Insurance", null, "asked for a demo", "new CMO", "Send the demo recap"] },
    { c: ["c_3b7e", "HR software", tag("open"), null, null, null] },
    { c: ["c_e214", "Security", null, "attended event", "headcount up", "Send the event recap"] },
    { c: ["c_77b2", "Travel", tag("closed_lost"), null, null, null] },
    { c: ["c_1f6d", "Proptech", null, null, "new CRO", "Introduce yourself"] },
    { c: ["c_9a40", "Gaming", tag("open"), "asked pricing", null, null] },
    { c: ["c_62ce", "Biotech", null, null, "uses a rival tool", null] },
    { c: ["c_b81e", "Media", tag("closed_won"), null, "new funding", "Offer the team plan"] },
  ],
};

/** the rows an agent gets back: in the agent card's chat, and as the view Claude draws */
export const DB_RESULT: DbTableData = {
  name: "result",
  cols: [{ name: "id", w: 68 }, { name: "industry", w: 86 }, { name: "why" }],
  rows: [
    { c: ["c_4f2a", "Fintech", "lost deal, now hiring"], mark: "hit" },
    { c: ["c_91be", "Dev tools", "asked pricing, new funding"] },
    { c: ["c_27d0", "Logistics", "your event, new VP Sales"] },
  ],
};

/** the view Claude draws from them, beside its answer (seen once the curtain is slid right) */
export const DB_ARTIFACT: DbTableData = {
  name: "accounts",
  cols: [{ name: "id", w: 70 }, { name: "industry", w: 92 }, { name: "next_best_play" }],
  rows: [
    { c: ["c_4f2a", "Fintech", hit("Reach back out")], mark: "hit" },
    { c: ["c_91be", "Dev tools", "Send the pricing follow-up"] },
    { c: ["c_27d0", "Logistics", "Follow up on the event"] },
  ],
};

/* ── the four rows ─────────────────────────────────────────────────────────── */

/** 01: your own sources, one row each, with how much came in and when */
export const DB_SOURCES: DbTableData = {
  name: "sources",
  meta: "4 connected",
  numbered: true,
  cols: [
    { name: "source", type: "text" },
    { name: "records", type: "int", w: 104, end: true, hide: "phone" },
    { name: "updated", w: 110, wp: 96 },
    { name: "status", w: 76, wp: 58 },
  ],
  rows: [
    { c: [{ v: "CRM", logo: "/lp/vendor-logos/hubspot.svg" }, "18,240", "2 min ago", LIVE] },
    { c: ["Calls", "1,312", "14 min ago", LIVE] },
    { c: [{ v: "Events", logo: "/lp/vendor-logos/luma.svg" }, "2,406", "1 h ago", LIVE] },
    { c: ["Your database", "96,115", "3 min ago", LIVE] },
  ],
  foot: "4 of your sources",
  footEnd: "connectors built by Pancake",
};

/** 02: the outside sources Pancake fetches, one row per kind of signal, with the provider it
 *  comes from. Every provider named is one the product uses; each mark is the vendor's own. */
export const DB_EXTERNAL: DbTableData = {
  name: "external_sources",
  meta: "fetched by Pancake",
  numbered: true,
  cols: [
    { name: "signal", type: "text" },
    { name: "provider", type: "text", w: 142, wp: 112 },
    { name: "records", type: "int", w: 96, end: true, hide: "phone" },
    { name: "updated", w: 100, hide: "phone" },
    { name: "status", w: 72, wp: 58 },
  ],
  rows: [
    { c: ["Job posts", { v: "TheirStack", logo: "/lp/story-sources/theirstack.svg" }, "7,930", "6 min ago", LIVE] },
    { c: ["Funding rounds", { v: "Dealroom", logo: "/lp/story-sources/dealroom.svg" }, "412", "1 h ago", LIVE] },
    { c: ["Headcount", { v: "Coresignal", logo: "/lp/story-sources/coresignal.svg" }, "4,812", "22 min ago", LIVE] },
    { c: ["Tech stack", { v: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg" }, "4,812", "2 h ago", LIVE] },
    { c: ["Posts", { v: "Apify", logo: "/lp/story-sources/apify.svg" }, "12,406", "9 min ago", LIVE] },
    { c: ["Websites", { v: "Firecrawl", logo: "/lp/story-sources/firecrawl.png" }, "4,812", "3 h ago", LIVE] },
  ],
  foot: "6 of 30+ data providers",
};

/** 03: a row of yours and a row from outside, joined on the company */
export const DB_CROSS = {
  own: {
    name: "deals",
    path: "crm",
    cols: [
      { name: "company_id", w: 82 },
      { name: "stage" },
      { name: "closed_on", w: 84, hide: "phone" },
    ],
    rows: [
      { c: [ref("c_4f2a", true), tag("closed_lost", true), "2025-11-04"], mark: "hit" },
      { c: [ref("c_a6c3"), tag("closed_won"), "2025-09-30"] },
    ],
  } satisfies DbTableData,
  outside: {
    name: "job_posts",
    path: "signals",
    cols: [
      { name: "company_id", w: 82 },
      { name: "role" },
      { name: "seen_on", w: 84, hide: "phone" },
    ],
    rows: [
      { c: [ref("c_4f2a", true), hit("SDR"), "2026-11-06"], mark: "hit" },
      { c: [ref("c_27d0"), "AE", "2026-11-02"] },
    ],
  } satisfies DbTableData,
  join: "joined on company_id",
  result: {
    name: "companies",
    meta: "1 row has both",
    cols: [
      { name: "company_id", type: "id", w: 110, wp: 82 },
      { name: "crm_deal", type: "enum", w: 118, wp: 98 },
      { name: "hiring", type: "text" },
      { name: "crossed_on", type: "date", w: 118, hide: "phone" },
    ],
    rows: [{ c: [hit("c_4f2a"), tag("closed_lost", true), hit("SDR roles"), hit("2026-11-06")], mark: "hit" }],
  } satisfies DbTableData,
} as const;

/** 04: the layers, top to bottom. The data layer holds the tables; the Brain is the context layer
 *  on top of it; the next best Play comes out of the top (founder: "the brain is a context layer
 *  on top of a datalayer (enabling next best play)"). */
export const DB_LAYERS = {
  plays: {
    name: "next_best_plays",
    meta: "picked by your agent",
    cols: [
      { name: "", w: 34, wp: 30 },
      { name: "next_best_play", type: "text" },
      { name: "why", type: "text", w: 176, hide: "phone" },
      { name: "runs_in", type: "text", w: 118, hide: "phone" },
    ],
    rows: [
      { c: [{ v: "", as: "check" }, hit("Reach back out"), "lost deal + hiring", "Your sequencer"], mark: "hit" },
      { c: [{ v: "", as: "uncheck" }, "Send the pricing follow-up", "asked pricing + funding", "Your sequencer"] },
    ],
  } satisfies DbTableData,
  brain: {
    name: "brain",
    path: "context layer",
    cols: [
      { name: "context", w: 96, wp: 84 },
      { name: "what_it_knows", type: "text" },
      { name: "learned_from", type: "text", w: 150, hide: "phone" },
    ],
    rows: [
      { c: [tag("icp"), "B2B software, 50 to 500 people", "your won deals"] },
      { c: [tag("persona"), "Head of Sales, owns the pipeline", "your calls"] },
      { c: [tag("lesson", true), hit("Lost deals come back when they hire"), hit("what got meetings")], mark: "hit" },
    ],
  } satisfies DbTableData,
  /** the data layer: its bar alone, naming the tables it holds */
  data: { name: "data layer", tables: DB_HERO_TABS },
} as const;

/* ── what Pancake is: three cards ──────────────────────────────────────────── */

export const DB_WAREHOUSE = {
  builds: {
    name: "tables",
    meta: "built by Pancake",
    cols: [
      { name: "table", type: "text" },
      { name: "rows", w: 78, end: true },
      { name: "columns", w: 78, end: true },
    ],
    rows: [
      { c: ["companies", "4,812", "24"] },
      { c: ["people", "12,960", "18"] },
      { c: ["employments", "14,377", "6"] },
      { c: ["signals", "38,204", "9"] },
      { c: ["datapoints", "212,640", "5"] },
    ],
  },
  fresh: {
    name: "signals",
    meta: "added the same day",
    cols: [
      { name: "observed", w: 98 },
      { name: "kind", type: "text" },
      { name: "company_id", w: 90 },
    ],
    rows: [
      { c: [hit("today 09:41"), hit("hiring SDRs"), ref("c_4f2a", true)], mark: "new" },
      { c: ["today 08:15", "funding Series B", ref("c_91be")] },
      { c: ["yesterday", "new VP Sales", ref("c_27d0")] },
      { c: ["Mon", "headcount 200", ref("c_4f2a")] },
      { c: ["Mon", "uses a rival tool", ref("c_5e18")] },
    ],
  },
  bill: {
    name: "bill",
    meta: "one bill",
    cols: [
      { name: "line", type: "text" },
      { name: "before", w: 70 },
      { name: "now", w: 78 },
    ],
    rows: [
      { c: ["A warehouse", cut("yours"), "Pancake"] },
      { c: ["A tool to get data in", cut("yours"), "Pancake"] },
      { c: ["A tool to get data out", cut("yours"), "Pancake"] },
      { c: ["Keeping the tables right", cut("yours"), "Pancake"] },
      { c: ["Bills to pay", cut("3"), hit("1")], mark: "sum" },
    ],
  },
} as const satisfies Record<string, DbTableData>;

/* ── how it gets used: two cards ───────────────────────────────────────────── */

export const DB_ASK = {
  question: "Which of my accounts have an inbound signal?",
  status: "Read 3 tables in one call",
  answer: "Three accounts. The fintech you lost is hiring SDRs.",
  box: "Ask about your market",
  result: DB_RESULT,
} as const;

export const DB_PLUG: DbTableData = {
  name: "connections",
  meta: "connected to Pancake",
  cols: [
    { name: "tool", type: "text", w: 132, wp: 118 },
    { name: "reads", type: "text", hide: "phone" },
    { name: "writes_back", type: "text", w: 152 },
    { name: "status", w: 72, hide: "phone" },
  ],
  rows: [
    { c: ["Your agent", "every table", "the Play it picked", LIVE] },
    { c: ["Your sequencer", "Plays, people", "replies, meetings", LIVE] },
    { c: ["Your CRM", "Plays, companies", "deals, stages", LIVE] },
  ],
  foot: "What they send comes back as signals",
};
