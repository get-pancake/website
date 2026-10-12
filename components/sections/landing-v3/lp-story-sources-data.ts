import type { ContentStatus } from "@/lib/placeholders";

/**
 * Deep-dive story "Sources you can trust" — its copy and data. Owner: story-sources package.
 * Storyboard of 2026-10-11 (Figma 4964:1287 / 5024:7457 / 5024:7601 / 5024:8172, designer note
 * 4964:1650): "Leads show up / Click on one / Lead details open / Zoom into 'Why they fit' with
 * top data sources appearing". Spec: specs/updates/sources-v2.md; decisions 2026-10-11 §9.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Entries that may only show in
 * dev and on Vercel previews carry `status: "placeholder"` (lib/placeholders.ts ContentStatus) and
 * are gated by the server parent, never by this module.
 *
 * What the designer's frames carry and this file does NOT (truth rules):
 *   - the people and companies of a real workspace → the homepage demo's invented Acme
 *     leads (lib/verticals/home-demo.ts), Elena Marchetti picked;
 *   - a platform's mark after each name and its name on a panel row → a neutral tile, and the
 *     row reads "Profile" → "View" (founder 2026-09-23, PR #305 wording);
 *   - six third-party logos the designer labels "placeholder logos" → generic line glyphs
 *     (lp-story-sources-art.ts), status "placeholder";
 *   - a counted data-source claim on the hub's label → a plain label, status "placeholder".
 *
 * STORY_SOURCES_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: this module must NOT import lib/verticals/home-demo.ts (server
 * data). Its rows and the reason mirror that file: KEEP IN SYNC if the demo's leads change.
 */

export type StorySourcesLead = {
  initials: string;
  name: string;
  role: string;
  company: string;
  /** the table's "Why they fit" cell (the demo's signal wording) */
  why: string;
  /** the lead the story opens (exactly one) */
  picked?: boolean;
};

export type StorySourcesPropId = "industry" | "location" | "seniority" | "profile" | "email";

export type StorySourcesProp = {
  id: StorySourcesPropId;
  label: string;
  value: string;
  /** the cell of the app's two-column property grid (sources-v2 §4.4) */
  row: 1 | 2 | 3;
  col: 1 | 2;
};

/** Generic source glyphs (lp-story-sources-art.ts) — never a platform or data-provider logo. */
export type StorySourcesGlyph = "post" | "briefcase" | "stack" | "coin" | "globe" | "people";

/** Figma Ellipse 115–120 */
export type StorySourcesHubNodeId = "e115" | "e116" | "e117" | "e118" | "e119" | "e120";

export type StorySourcesHubNode = {
  id: StorySourcesHubNodeId;
  /** "placeholder" renders only when the server parent passes placeholders (dev / preview) */
  status: ContentStatus;
  /** what the source is (the stage is aria-hidden: kept for review and for the alt) */
  label: string;
  /** the disc's art: a generic glyph, or (a source the founder approved by name) a square file
      under /lp/story-sources/. One of the two. */
  glyph?: StorySourcesGlyph;
  logo?: string;
  /** disc top-left and diameter, desktop stage px */
  x: number;
  y: number;
  size: number;
  /** reveal order, top to bottom */
  order: number;
  /** painted above the wires (Figma z-order: Ellipse 118) */
  over?: boolean;
  /** start cap: the disc's right magnet (x + size, y + size / 2), stage px */
  cap: { x: number; y: number };
  /** the connector from the cap to the hub point (391, 246.77): one cubic with horizontal
      handles, c = 0.426667 × the distance (sources-v2 §4.6; written out, never computed at render) */
  wire: string;
};

export type StorySourcesHubLabel = { text: string; status: ContentStatus };

export type StorySourcesDot = {
  /** the brand token after `--lp-` (foundation.css) */
  color: "green-20" | "purple-30" | "yellow-30" | "blue-30" | "pink-30";
  x: number;
  y: number;
  size: number;
};

export type StorySourcesStory = {
  head: { title: string };
  columns: readonly [string, string, string, string];
  rows: readonly StorySourcesLead[];
  detail: {
    initials: string;
    name: string;
    role: string;
    company: string;
    props: readonly StorySourcesProp[];
    whyLabel: string;
    whyHead: string;
    whyBody: string;
    add: string;
    pass: string;
  };
  hub: {
    label: StorySourcesHubLabel | null;
    /** the hub point, stage px: where every wire lands, left of the zoomed "Why they fit" */
    point: { x: number; y: number };
    /** array order = Figma paint order */
    nodes: readonly StorySourcesHubNode[];
    /** the connectors' paint order (Figma z-order) */
    wireOrder: readonly StorySourcesHubNodeId[];
    dots: readonly StorySourcesDot[];
  };
};

export const STORY_SOURCES: StorySourcesStory = {
  head: { title: "Leads" },
  /** the app's default columns (Figma repeats "Position" three times: filler) */
  columns: ["Lead", "Position", "Company", "Why they fit"],
  /** lib/verticals/home-demo.ts: rows 1–5 = prompt 2 (the hiring Play), rows 6–9 = four leads of
      prompt 0 (the design draws nine rows; a Play has five). Elena is row 2: the designer clicks
      row 2. Rows 8–9 sit below the desktop stage. KEEP IN SYNC with home-demo.ts. */
  rows: [
    { initials: "LF", name: "Leopold Fairbairn", role: "CMO", company: "Parcelry", why: "Head of PMM role" },
    { initials: "EM", name: "Elena Marchetti", role: "VP Marketing", company: "Harborlane", why: "PMM role open", picked: true },
    { initials: "RA", name: "Ruth Adeyinka", role: "Head of Growth", company: "Brimstack", why: "Wistia in job posts" },
    { initials: "LA", name: "Lucian Ashcombe", role: "PMM Director", company: "Oakhatch", why: "PMM role open" },
    { initials: "NL", name: "Nell Lowenthal", role: "VP Marketing", company: "Tallowby", why: "Posted release notes" },
    { initials: "TO", name: "Tamsin Okafor", role: "Director of PMM", company: "Quillfern", why: "Posted about a release" },
    { initials: "WP", name: "Wes Pomeroy", role: "VP Marketing", company: "Stackhollow", why: "Posted on launch day" },
    { initials: "IC", name: "Imani Coldwell", role: "CMO", company: "Ferngate", why: "Engaged with a post" },
    { initials: "RH", name: "Rosa Hartigan", role: "Founder & CEO", company: "Cindermoor", why: "Posted a product demo" },
  ],
  detail: {
    initials: "EM",
    name: "Elena Marchetti",
    role: "VP Marketing",
    company: "Harborlane",
    props: [
      { id: "industry", label: "Industry", value: "Technology, Information and Internet", row: 1, col: 1 },
      { id: "location", label: "Location", value: "United States", row: 1, col: 2 },
      { id: "seniority", label: "Seniority", value: "VP", row: 2, col: 1 },
      // the app's platform row: never named here (founder 2026-09-23, PR #305 precedent)
      { id: "profile", label: "Profile", value: "View", row: 3, col: 1 },
      { id: "email", label: "Email", value: "Find email", row: 3, col: 2 },
    ],
    whyLabel: "Why they fit",
    /** the app's hiring phrase. 81 px wide: shows whole in the ×3.89 zoom ("PMM role open" would
        lose its last letter at the stage edge) */
    whyHead: "Hiring a PMM",
    /** home-demo.ts prompt 2 featured.why, verbatim */
    whyBody:
      "Harborlane is a 210-person US SaaS company with a product marketing role open. Elena runs the marketing team it joins.",
    add: "Add to sequence",
    pass: "Not a fit",
  },
  /** Scene D, "top data sources appearing". Every node is a PLACEHOLDER today (decision
      2026-10-11 §9): dev and Vercel previews end on the zoom with the hub; production renders no
      node, so its story ends on the open lead panel. To light the zoom up in production, set a
      node's status to "final" (a generic glyph is truth-safe; a named source with its `logo`
      needs the founder's OK). Nodes left as placeholders do not render, and their wires go with
      them. The label follows the same gate. Figma's label carries a counted claim the lint
      rejects: the founder decides the number and the words. */
  hub: {
    label: { text: "Data sources", status: "placeholder" },
    point: { x: 391, y: 246.77 },
    nodes: [
      {
        id: "e115", status: "placeholder", label: "Tech stack", glyph: "stack",
        x: 132.965, y: 188.794, size: 74.43, order: 2,
        cap: { x: 207.395, y: 226.009 },
        wire: "M207.395 226.009C286.232 226.009 312.163 246.77 391 246.77",
      },
      {
        id: "e116", status: "placeholder", label: "Open roles", glyph: "briefcase",
        x: 58.063, y: 88.794, size: 100, order: 1,
        cap: { x: 158.063, y: 138.794 },
        wire: "M158.063 138.794C267.608 138.794 281.455 246.77 391 246.77",
      },
      {
        id: "e117", status: "placeholder", label: "People like your customers", glyph: "people",
        x: 48, y: 285.484, size: 87.727, order: 3,
        cap: { x: 135.727, y: 329.347 },
        wire: "M135.727 329.347C250.201 329.347 276.526 246.77 391 246.77",
      },
      {
        id: "e119", status: "placeholder", label: "Posts", glyph: "post",
        x: 226.801, y: 59.665, size: 58.258, order: 0,
        cap: { x: 285.059, y: 88.794 },
        wire: "M285.059 88.794C366.215 88.794 309.844 246.77 391 246.77",
      },
      {
        id: "e120", status: "placeholder", label: "Funding", glyph: "coin",
        x: 108.063, y: 391.644, size: 62.117, order: 5,
        cap: { x: 170.18, y: 422.702 },
        wire: "M170.18 422.702C290.644 422.702 270.536 246.77 391 246.77",
      },
      {
        id: "e118", status: "placeholder", label: "The web", glyph: "globe",
        x: 208.063, y: 334.702, size: 100, order: 4, over: true,
        cap: { x: 308.063, y: 384.702 },
        wire: "M308.063 384.702C376.734 384.702 322.329 246.77 391 246.77",
      },
    ],
    wireOrder: ["e115", "e118", "e120", "e117", "e116", "e119"],
    /** brand-colour dots (Figma Ellipse 121–125) */
    dots: [
      { color: "green-20", x: 56.719, y: 213.137, size: 15.765 },
      { color: "purple-30", x: 214.094, y: 250.352, size: 25.418 },
      { color: "yellow-30", x: 30.238, y: 417.379, size: 28.18 },
      { color: "blue-30", x: -5.227, y: 278.754, size: 28.18 },
      { color: "pink-30", x: -5.227, y: -14.044, size: 40.547 },
    ],
  },
};

/** The production story (it ends on the open lead panel). When a hub node goes final, append:
    " The view then zooms into Why they fit, where lines run in from the data sources behind the
    answer." Not while the hub is a placeholder. */
export const STORY_SOURCES_ALT: string =
  "Animation: a Leads table lists the people a Play found, each with a position, a company and why they fit. One lead is opened: Elena Marchetti, VP Marketing at Harborlane. Her details show her industry, location and seniority, then why she fits: hiring a PMM. Harborlane is a 210-person US SaaS company with a product marketing role open, and Elena runs the marketing team it joins. Two buttons follow: Add to sequence and Not a fit.";
