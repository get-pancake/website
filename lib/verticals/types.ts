// lib/verticals/types.ts — the per-vertical config for /for/<slug>.
// Everything a copywriter fills lives here; every string that is the SAME on all
// pages lives in components/sections/verticals/vx-copy.ts. Budgets in the comments
// are enforced by validateVerticals() (chars) and scripts/verticals-budget.mjs (px,
// real fonts). Only server components import this module and lib/verticals/*.
// No string here may name the outreach platform or its tools (founder 2026-09-23: PLATFORM in
// validate.ts, an error): say "from your own account", "profile", "invite", "people posting
// about …", "fans of …'s posts" instead.

/** The six executable signal kinds (product signal-copy.ts). No others exist. */
export type SignalKind = "keyword" | "competitor" | "influencer" | "own_brand" | "hiring" | "stack";

/** draft = built + reachable, noindex, off the sitemap and the production hub. */
export type VerticalStatus = "draft" | "approved";

/** Hub groups, in hub order. */
export type VerticalCategory =
  | "Sales, GTM & recruiting"
  | "Marketing & creative agencies"
  | "Tech & build agencies"
  | "Consultants & advisors"
  | "IT, cloud & security"
  | "Startups & solo founders"
  | "Vertical software"
  | "Energy & industry";

/** Seniority values the app's lead sheet uses (property grid). */
export type Seniority = "C-level" | "Founder" | "President" | "VP" | "Director" | "Head" | "Manager";

export interface VerticalConfig {
  /** kebab-case plural noun, stable forever (a rename needs a 308 in next.config.mjs). */
  slug: string;
  status: VerticalStatus;
  category: VerticalCategory;
  /** Internal only, never rendered. From design/verticals-brief.json. */
  evidence: "paying" | "trials" | "founder" | "seo-bet";
  /** Fixed ISO date for sitemap lastmod. Bump by hand when the copy changes. */
  updated: string;

  name: {
    /** Running-text plural, lowercase unless a proper noun: "recruiting agencies". ≤32 chars. */
    plural: string;
    /** Sentence-case label for breadcrumb, hub card and related rows: "Recruiting agencies". ≤32. */
    title: string;
    /** Plural audience noun for templates: "Questions {short} ask.", "matter most to {short}". ≤22. */
    short: string;
    /** "For recruiting agencies". ≤26 chars. NOT rendered since the 2026-09-22 hero redesign (the
     *  H1's label is VX_HERO.label = "Pancake for {plural}"); kept until the copy owners retire it. */
    badge: string;
  };

  meta: {
    /** Used ONLY when VX_TITLE_MODE === "descriptive". Starts "Pancake for ", ≤60 chars, no "AI". */
    seoTitle: string;
  };

  /** One sentence for the hub card and for related rows on OTHER pages. ≤64 chars, 1 line at 480px. */
  hubLine: string;

  hero: {
    /**
     * The functional H1 (founder 2026-09-22: "more functional than inspirational — check
     * Origami"). One sentence, starts with "Find", names the vertical's buyer and the signal
     * moment, ends with a period. ≤56 chars; ≤2 lines at the desktop H1 size (57.336px Aeonik
     * Condensed 600 at 880px), ≤3 at 326 (phones). Unique across configs. Rendered under the
     * "Pancake for {plural}" label inside the same <h1>.
     */
    title: string;
    /** = <meta name=description>. ≤150 chars, ≤30 words; ≤2 lines at 640px (Geist 19.2/28.8),
     *  ≤5 at 326px (phones, 16/24). */
    lede: string;
  };

  /** The fictional customer shown inside the mocks (Slack workspace, "Sends as"). Unique across configs. */
  workspace: {
    /** "Ferro Talent" — ≤20 chars, invented, not a real brand. */
    name: string;
    /** "Nadia Ferro" — first + last, invented. */
    sender: string;
  };

  demo: {
    /** The demo section's heading: visually hidden since 2026-09-22 (the tab bar is the visible
     *  head), read by screen readers and the document outline. ≤8 words, ≤40 chars. */
    h2: string;
    /** Exactly 3 example prompts (the hero's "Example prompts" rows + the demo). Their primary
     *  kinds must be pairwise different. */
    prompts: [DemoPrompt, DemoPrompt, DemoPrompt];
  };

  signals: {
    /** Section H2 under the "Signals" eyebrow. ≤8 words, ≤40 chars, ≤2 lines at 720px. */
    h2: string;
    /** Exactly 4 cards, 4 different kinds. Rendered in this order. */
    cards: [SignalCard, SignalCard, SignalCard, SignalCard];
  };

  /** 3–4 vertical objections, answered truthfully. The 5 shared Q/As are appended from vx-copy. */
  faq: FaqItem[];

  /** 3–5 sibling slugs that exist (≠ self). Rows read the sibling's own name.title + hubLine. */
  related: string[];

  cta: {
    /** CTA card title (LpCta). ≤28 chars, 1 line ≤464px at 48px Condensed 600. Body is fixed copy. */
    title: string;
  };
}

/**
 * What the product demo reads (VxDemo, VxPromptRows, buildDemoModel): the workspace and the demo
 * block. Every VerticalConfig is one; the homepage demo (lib/verticals/home-demo.ts) is one with
 * no /for page behind it — same rules (validateVerticals' `demos`), not in the registry.
 */
export type DemoSource = Pick<VerticalConfig, "workspace" | "demo">;

export interface DemoPrompt {
  /** The primary signal: the hero row's badge. Must equal proposal[0].kind. */
  kind: SignalKind;
  /**
   * First person, what the owner would type. ≤96 chars; one line in the desktop hero row (≤760px
   * at Geist 15, the 1025px column), ≤3 lines in the phone row (badge inline, 280px at 390).
   * US geography only. Only filters that exist: roles, keywords, competitor pages, company
   * size, industry, US geography, tools named in job posts. No job-count thresholds, no
   * "hiring their first X", no funding/news/job changes. The 3 prompts within ±12 chars.
   */
  text: string;
  /** Pancake's one-sentence reply in the chat. ≤88 chars, starts "I'll". */
  reply: string;
  /** 3–4 rows of the "Signal settings · Proposed" card. Unique kinds; row 0 = kind. */
  proposal: ProposalRow[];
  /** Exactly 5 invented people. Lead 0 is the featured lead (drawer, journey, Slack, Control). */
  leads: [DemoLead, DemoLead, DemoLead, DemoLead, DemoLead];
  /** Lead 0's detail sheet. */
  featured: {
    /** "Why this lead fits": ≤2 sentences, ≤150 chars, ≤5 lines at 216px (Geist 13/19). Facts
     *  Pancake can see only (company size, the signal, the person's role). */
    why: string;
    /** "Confidence {n}%": integer 80–96. */
    confidence: number;
    seniority: Seniority;
  };
  /**
   * Follow-up message 1 to lead 0. Starts "Hi {first name},". ≤280 chars (app max 500),
   * ≤6 lines at 330px (Geist 13/20). Written only from the lead's signal + the customer's
   * offering (Brain voice). No private facts (no "our candidates free up", no bench claims).
   */
  message: string;
}

export interface ProposalRow {
  kind: SignalKind;
  /**
   * 1–3 items, each ≤28 chars; the row renders items joined by " · " and must fit ≤3 lines at 168px
   * (Geist 12/17), all rows together ≤9 lines. Keyword items are phrases (rendered in quotes), competitor items
   * are invented rival company pages, hiring items are job titles, stack items are tool names
   * (rendered "…, named in job posts"), influencer items are invented people.
   */
  items: string[];
}

export interface DemoLead {
  /** "Dana Whitfield" — invented, unique across ALL configs. */
  name: string;
  /** "VP Engineering". role + " · " + company ≤180px at 12px Geist (the desktop person column). */
  role: string;
  /** Invented company, unique across all configs, not a real brand or a marquee customer. */
  company: string;
  /** Signal chip. Across the 5 leads, only kinds that appear in this prompt's proposal. */
  kind: SignalKind;
  /** One-line detail under the chip. ≤24 chars and ≤136px at 12px Geist (signal column). No dates. */
  signal: string;
}

export interface SignalCard {
  kind: SignalKind;
  /** ≤32 chars, ≤2 lines at 224px (27.648px Condensed 600). No manual breaks. */
  title: string;
  /** Exactly 1 sentence, ≤110 chars, ≤4 lines at 224px (Geist 15/22). Stack → mentions "job post". */
  body: string;
  /** 1–4 watched items, each ≤22 chars. Keyword items get quotes at render. */
  watching: string[];
  /** Renders "+N more" after the items (app's SIGNAL_PREVIEW_LIMIT grammar). 0–9. */
  more?: number;
}

export interface FaqItem {
  /** ≤70 chars, a real buyer objection, ends with "?". */
  q: string;
  /** ≤240 chars, ≤3 sentences. Negations of banned features are allowed here ("No. …"). */
  a: string;
}
