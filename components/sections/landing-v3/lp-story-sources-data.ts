import type { ContentStatus } from "@/lib/placeholders";

/**
 * Deep-dive story "Sources you can trust" — its copy and data. Owner: story-sources package.
 * Storyboard of 2026-10-11 (Figma 4964:1287 / 5024:7457 / 5024:7601 / 5024:8172, designer note
 * 4964:1650): "Leads show up / Click on one / Lead details open / Zoom into 'Why they fit' with
 * top data sources appearing". Spec: specs/updates/sources-v2.md; decisions 2026-10-11 §9.
 *
 * The cast is the page's one story (founder 2026-10-13): Acme, a studio that designs websites
 * for startups, runs the Play "Funded startups hiring a marketing lead" (and "Startups posting
 * about a rebrand"). The lead it opens is Tamsin Okafor, Founder & CEO at Quillfern, the same
 * lead the steps and the "message" story write to. Names, positions and companies match
 * lp-step-data.ts (SX_LEADS) and lp-story-message-data.ts: KEEP IN SYNC if that cast changes.
 *
 * In scripts/homepage-lint.mjs FILES: every string here is linted. A field must never be named
 * after a code key the lint skips (role, kind, icon, path, url, id, key, type…): hence
 * `position` and `name`. Only `logo` (a file path) is skipped on purpose.
 *
 * What the designer's frames carry and this file does NOT (truth rules):
 *   - the people and companies of a real workspace → the page's invented Acme leads;
 *   - a platform's mark after each name and its name on a panel row → a neutral tile, and the
 *     row reads "Profile" → "View" (founder 2026-09-23, PR #305 wording). No social platform is
 *     ever named or drawn here;
 *   - six third-party logos the designer labels "placeholder logos" → the six data providers the
 *     product itself names to its users (the app's vendor-logo.tsx), each with its own mark and
 *     its name (founder 2026-10-13: "use our most known data providers"). The marks are the
 *     vendors' trademarks: unmodified files under public/lp/story-sources/ (see its README);
 *   - a counted data-source claim on the hub's label → a plain label until 2026-10-13. The
 *     founder then asked for the count ("yes add 12 data providers to the zoom label"): twelve is
 *     the number of data providers wired into the product's job toolkit (pancake-cmo #1616: Apify,
 *     Coresignal, Crustdata, DataForSEO, Dealroom, Exa, Firecrawl, Linkup, Ocean.io, PredictLeads,
 *     TheirStack, Wappalyzer; its thirteenth provider is the model, not a data source). Later
 *     that day he set the figure himself ("Mets 30+ data provider sur pancake.ai"): the label
 *     reads "30+ data providers". The zoom draws six of the twelve named above.
 *
 * STORY_SOURCES_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * Client-safe literals only: this module must NOT import lib/verticals/home-demo.ts (server
 * data).
 */

export type StorySourcesLead = {
  initials: string;
  name: string;
  position: string;
  company: string;
  /** the table's "Why they fit" cell: a signal of the Play, or of its sibling Play */
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

/** Figma Ellipse 115–120 */
export type StorySourcesHubNodeId = "e115" | "e116" | "e117" | "e118" | "e119" | "e120";

export type StorySourcesHubNode = {
  id: StorySourcesHubNodeId;
  /** "placeholder" renders only when the server parent passes placeholders (dev / preview) */
  status: ContentStatus;
  /** the data provider, in the vendor's own spelling: written under its disc, so nobody has to
      recognise a logo */
  name: string;
  /** the vendor's own mark: an unmodified square file under /lp/story-sources/, drawn at half
      the disc's width on a white disc (as the app's vendor chip does). Never recoloured, never
      redrawn. */
  logo: string;
  /** disc top-left and diameter, desktop stage px */
  x: number;
  y: number;
  size: number;
  /** reveal order: the two providers behind THIS lead first, then top to bottom */
  order: number;
  /** the name sits ABOVE the disc (default: under it), where the next disc is too close under */
  nameAbove?: boolean;
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
    position: string;
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
  /** Nine founders and marketing heads at funded startups (the design draws nine rows). Each
      "Why they fit" is one of three signals, word for word the same every time it comes back:
      the Play's two (a seed round, an open marketing role) and its sibling Play's (a rebrand).
      Tamsin is row 2: the designer clicks row 2. Rows 8–9 sit below the desktop stage.
      Row 7's position, company and reason carry NO descender (no g, p, q, y): that row's text
      line ends 2 px above the open panel's bottom edge, and a tail would peek out under it. */
  rows: [
    { initials: "WP", name: "Wes Pomeroy", position: "VP Marketing", company: "Stackhollow", why: "Hiring a marketing lead" },
    { initials: "TO", name: "Tamsin Okafor", position: "Founder & CEO", company: "Quillfern", why: "Raised a seed round", picked: true },
    { initials: "IC", name: "Imani Coldwell", position: "CMO", company: "Ferngate", why: "Posted about a rebrand" },
    { initials: "AF", name: "Anders Forsythe", position: "Co-founder", company: "Loomwise", why: "Raised a seed round" },
    { initials: "RH", name: "Rosa Hartigan", position: "Founder & CEO", company: "Cindermoor", why: "Hiring a marketing lead" },
    { initials: "EM", name: "Elena Marchetti", position: "VP Marketing", company: "Harborlane", why: "Posted about a rebrand" },
    { initials: "LA", name: "Lucian Ashcombe", position: "Founder & CEO", company: "Oakhatch", why: "Raised a seed round" },
    { initials: "RA", name: "Ruth Adeyinka", position: "Head of Marketing", company: "Brimstack", why: "Hiring a marketing lead" },
    { initials: "LF", name: "Leopold Fairbairn", position: "CMO", company: "Parcelry", why: "Posted about a rebrand" },
  ],
  detail: {
    initials: "TO",
    name: "Tamsin Okafor",
    position: "Founder & CEO",
    company: "Quillfern",
    props: [
      { id: "industry", label: "Industry", value: "Technology, Information and Internet", row: 1, col: 1 },
      { id: "location", label: "Location", value: "United States", row: 1, col: 2 },
      { id: "seniority", label: "Seniority", value: "Founder", row: 2, col: 1 },
      // the app's platform row: never named here (founder 2026-09-23, PR #305 precedent)
      { id: "profile", label: "Profile", value: "View", row: 3, col: 1 },
      { id: "email", label: "Email", value: "Find email", row: 3, col: 2 },
    ],
    whyLabel: "Why they fit",
    /** the reason, named. It must show WHOLE in the ×3.89 zoom: the end picture shows 88 px of
        the panel's text column, and this is 68 px wide (measured on the end frame: 263.5 px
        drawn, 80 px short of the stage's right edge; 42 px short in the phone box) */
    whyHead: "Just raised",
    /** two lines in the open panel; the zoom shows the start of its first line */
    whyBody:
      "Quillfern raised a seed round this month and is hiring a marketing lead. Tamsin is its founder.",
    add: "Add to sequence",
    pass: "Not a fit",
  },
  /** Scene D, "top data sources appearing": the six data providers the product names to its
      users, each with its own mark and its name (founder 2026-10-13). All final: production ends
      on the zoom with the hub. The two biggest discs go to the providers behind THIS lead and
      come first: Dealroom (the seed round) and TheirStack (the open marketing role). Discs keep
      the designer's sizes and positions. Which of the other four sits on which disc is set by
      room for its name: the shortest names go where the next disc is closest (story-sources.css
      places the names; QA measured every name against discs, dots, wires and the panel). A node set back to "placeholder" does not render in
      production, and its wire and its name go with it; with no node left the story ends on the
      open lead panel. The label carries the founder's count ("30+", 2026-10-13). */
  hub: {
    label: { text: "30+ data providers", status: "final" },
    point: { x: 391, y: 246.77 },
    nodes: [
      {
        id: "e115", status: "final", name: "Apify", logo: "/lp/story-sources/apify.svg",
        x: 132.965, y: 188.794, size: 74.43, order: 3,
        cap: { x: 207.395, y: 226.009 },
        wire: "M207.395 226.009C286.232 226.009 312.163 246.77 391 246.77",
      },
      {
        id: "e116", status: "final", name: "Dealroom", logo: "/lp/story-sources/dealroom.svg",
        x: 58.063, y: 88.794, size: 100, order: 0, nameAbove: true,
        cap: { x: 158.063, y: 138.794 },
        wire: "M158.063 138.794C267.608 138.794 281.455 246.77 391 246.77",
      },
      {
        id: "e117", status: "final", name: "Firecrawl", logo: "/lp/story-sources/firecrawl.png",
        x: 48, y: 285.484, size: 87.727, order: 4,
        cap: { x: 135.727, y: 329.347 },
        wire: "M135.727 329.347C250.201 329.347 276.526 246.77 391 246.77",
      },
      {
        id: "e119", status: "final", name: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg",
        x: 226.801, y: 59.665, size: 58.258, order: 2,
        cap: { x: 285.059, y: 88.794 },
        wire: "M285.059 88.794C366.215 88.794 309.844 246.77 391 246.77",
      },
      {
        id: "e120", status: "final", name: "Coresignal", logo: "/lp/story-sources/coresignal.svg",
        x: 108.063, y: 391.644, size: 62.117, order: 5,
        cap: { x: 170.18, y: 422.702 },
        wire: "M170.18 422.702C290.644 422.702 270.536 246.77 391 246.77",
      },
      {
        id: "e118", status: "final", name: "TheirStack", logo: "/lp/story-sources/theirstack.svg",
        x: 208.063, y: 334.702, size: 100, order: 1, over: true,
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

/** The whole story, hub included (every hub node is final). Its last sentence names the six
    providers: the stage is aria-hidden, so their names are read from here only. If the hub ever
    goes back to placeholders, drop the last sentence: production then ends on the open panel. */
export const STORY_SOURCES_ALT: string =
  "Animation: a Leads table lists the people a Play found, each with a position, a company and why they fit. One lead is opened: Tamsin Okafor, Founder & CEO at Quillfern. Her details show her industry, location and seniority, then why she fits: just raised. Quillfern raised a seed round this month and is hiring a marketing lead, and Tamsin is its founder. Two buttons follow: Add to sequence and Not a fit. The view then zooms into Why they fit, where lines run in from the data sources behind the answer: Dealroom, TheirStack, Wappalyzer, Apify, Firecrawl and Coresignal.";
