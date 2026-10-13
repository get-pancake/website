/**
 * Deep-dive story "A personal message for every lead" — its copy, data and stage geometry.
 * Figma V2 storyboard, as the designer finished it on 2026-10-12 (six frames, 752×489):
 *
 *   f1  4964:1469   a lead's post, wired to her lead card
 *   f2  4964:1471   the post is gone: her card, wired to the message Pancake drafts for her
 *   f3  4964:1729   more conversations around, nearer and further (one drafting, two answered)
 *   f4  5061:1002   the view pulls back: they all belong to one sending account
 *   f5  5061:1091   that account's leads, each with where it stands
 *   f6  5061:1209   the view pulls back again: more accounts, out of focus  (= the REST picture)
 *
 * Owner: story-message package. In scripts/homepage-lint.mjs FILES: every string here is linted.
 * Nothing here is a placeholder (no `status: "placeholder"` entries), so the stage renders the
 * same in production and preview. STORY_MESSAGE_ALT is fixed (lp-dive-stages.ts imports it):
 * what the animation shows, the only copy a screen reader gets (the shell's host aria-label).
 *
 * Copy decisions — the storyboard's strings are the designer's fillers ("Anna Lellman" on every
 * card, mike@acme.com), replaced under decisions 2026-10-09 §6 and the page's truth rules:
 * - ONE story, the page's since 2026-10-13: Acme is a studio that designs websites for
 *   startups, its sender is Astrid Norling, its Plays are "Funded startups hiring a marketing
 *   lead" and "Startups posting about a rebrand" (lp-step-data.ts S1_ROWS / S2_PLAYS). Every
 *   lead here is a founder or a marketing head at a small funded startup. The names and
 *   companies are the page's cast (the demo tour's leads, lib/verticals/home-demo.ts, and Sarah
 *   Velasquez of Shift, the post's author since 2026-09-03); the positions and the messages are
 *   this file's own, written for that story — nothing is copied from home-demo.ts any more (its
 *   positions and signals are still the launch-video story's).
 *   One person, one position on the page: the leads step 02's table and the "sources" story
 *   also show keep the ones those give them (lp-step-data.ts SX_LEADS, lp-story-sources-data.ts).
 * - The section's line for this story names the signals a message opens with ("a post, an open
 *   role, a new tool"): the story shows a POST (Sarah's, about her seed round, then the message
 *   that says "just saw your post"), an OPEN ROLE (Nate's company is hiring a marketing lead),
 *   a funding round (Tamsin) and a post about a rebrand (Elena, the far conversation). No two
 *   messages share a sentence: "a personal message for every lead" is the story's title.
 * - The lead who answers is Tamsin Okafor, with the message and the reply step 03 of "How it
 *   works" shows, word for word (lp-step-data.ts S3_THREAD): keep the two in sync.
 * - "Hey Sarah" — the message greets the post's author (the storyboard's post and message are
 *   both "Anna"; before that it greeted the wrong person, fixed in production 2026-09-03).
 * - No network mark next to a name (the storyboard draws one), no connection degree, no
 *   reaction bubbles, no brand blue on the post (2026-09-29 / 2026-10-07: the network is never
 *   named or drawn).
 * - Accounts are labelled with sender NAMES, not the storyboard's mailbox addresses: Pancake
 *   sends from the customer's own social accounts, never email. A mailbox address said by
 *   itself that it is an account; a bare name did not (the audit pass of 2026-10-13: nothing on
 *   the stage said who "Astrid Norling" is). So each block's title is "<name>’s account", in
 *   the page's own words (step 03: "sent from your account"). This suffix is this package's
 *   addition, not the designer's nor a founder decision: SM_STORY.labels.account, one string.
 *   Astrid Norling is Acme's sender on the whole page; the six others are invented, unused in
 *   the repo and web-checked (one standard search per name found no person of that exact name;
 *   not exhaustive — check any new name the same way).
 * - "Waiting for a reply" for the storyboard's "Waiting response" (grammar). "Reached out" and
 *   "Booked" are the storyboard's ("Booked" is also the calendar's badge in step 03). The
 *   story's account lists the three leads the view has just shown, front to back: Nate (his
 *   message has just been sent: "Reached out"), Tamsin (she is free Thursday: "Booked") and
 *   Sarah (hers went first: "Waiting for a reply").
 *
 * MEASURED COPY — each string below fills the box its card was drawn for, at every depth it is
 * shown (a conversation is ONE layout, scaled as pixels): a message is three lines at 327px
 * (weight 500 for the two Pancake types, 400 for the two already sent), a reply two lines at
 * 279px, the post's body one line within 372px. Re-measure after any rewording (the line
 * count, in Chromium, WebKit and Firefox), never by eye.
 */

/* ══ the cast ════════════════════════════════════════════════════════════════════════════ */

/** a lead as her card shows her: initials in the disc, name, then company over position (never
    a field called `role`: the homepage lint takes that key for code and skips its string) */
export type SmLead = { name: string; initials: string; company: string; position: string };

// The cast: the page's names and companies, each a founder or a marketing head at a small funded
// startup. One person, one position on the page: Tamsin, Wes, Imani, Anders, Rosa and Elena
// carry step 02's (lp-step-data.ts SX_LEADS), Leopold, Ruth and Lucian the "sources" story's
// (lp-story-sources-data.ts rows). KEEP IN SYNC with both.
const L = {
  // the story's own lead: the post's author
  sarah: { name: "Sarah Velasquez", initials: "SV", company: "Shift", position: "Founder" },
  // step 03's lead, position and message (lp-step-data.ts S3_THREAD)
  tamsin: { name: "Tamsin Okafor", initials: "TO", company: "Quillfern", position: "Founder & CEO" },
  wes: { name: "Wes Pomeroy", initials: "WP", company: "Stackhollow", position: "VP Marketing" },
  imani: { name: "Imani Coldwell", initials: "IC", company: "Ferngate", position: "CMO" },
  anders: { name: "Anders Forsythe", initials: "AF", company: "Loomwise", position: "Co-founder" },
  rosa: { name: "Rosa Hartigan", initials: "RH", company: "Cindermoor", position: "Founder & CEO" },
  nate: { name: "Nate Trevino", initials: "NT", company: "Quorra Labs", position: "Co-founder & CEO" },
  chloe: { name: "Chloe Abelard", initials: "CA", company: "Hexfield", position: "Head of Brand" },
  omar: { name: "Omar Tessaro", initials: "OT", company: "Gridwell", position: "Head of Marketing" },
  bea: { name: "Bea Soriano", initials: "BS", company: "Cloudnook", position: "Founder" },
  jonah: { name: "Jonah Stoddard", initials: "JS", company: "Signalry", position: "Co-founder" },
  elena: { name: "Elena Marchetti", initials: "EM", company: "Harborlane", position: "VP Marketing" },
  leopold: { name: "Leopold Fairbairn", initials: "LF", company: "Parcelry", position: "CMO" },
  ruth: { name: "Ruth Adeyinka", initials: "RA", company: "Brimstack", position: "Head of Marketing" },
  lucian: { name: "Lucian Ashcombe", initials: "LA", company: "Oakhatch", position: "Founder & CEO" },
  nell: { name: "Nell Lowenthal", initials: "NL", company: "Tallowby", position: "Co-founder" },
} as const satisfies Record<string, SmLead>;

/* ══ frames 1–4 · the post and the conversations ═════════════════════════════════════════ */

export type SmPost = {
  author: string;
  headline: string;
  time: string;
  body: string;
  /** like, comment, repost, send */
  counts: readonly [number, number, number, number];
};

/** One conversation: a lead's card, wired to the message Pancake writes her, wired to her
    answer when she has answered. `place` = where it sits in frame 3 (stage px: the top-left of
    its lead card's Figma box) and how near (`s`: 1 = the size it is drawn at alone in frames
    1–2). `dim` / `wire` = the opacity Figma gives its cards and its wires there. */
export type SmConvo = {
  id: "lead" | "next" | "answered" | "far";
  lead: SmLead;
  /** three lines at 327px, as every message card of the storyboard. It opens with the lead's
      signal (a post, an open role, a round) */
  message: string;
  /** "typed" = Pancake types it on screen (it shows "Drafting…", then "Sent"); "sent" = it is
      already sent when the conversation comes into view */
  state: "typed" | "sent";
  /** two lines at 279px */
  reply?: string;
  place: { x: number; y: number; s: number };
  dim: number;
  wire: number;
};

export type SmStatus = "reached" | "booked" | "waiting";
export type SmAccountRow = { lead: SmLead; status: SmStatus };
/** One sending account: its title (the sender's name + SM_STORY.labels.account) over three of
    its leads. `place` = where the block sits in frame 6, the rest picture (stage px: its rows'
    left edge, its title's top) and its scale (k: 1 = frame 5's size); `dim` = its opacity,
    `blur` = Figma's layer blur radius, in stage px (CSS blurs by half of it: Figma's radius is
    two standard deviations). */
export type SmAccount = {
  id: string;
  sender: string;
  rows: readonly [SmAccountRow, SmAccountRow, SmAccountRow];
  place: { x: number; y: number; k: number };
  dim: number;
  blur: number;
};

export type SmStory = {
  post: SmPost;
  labels: {
    drafting: string;
    sent: string;
    /** what follows a sender's name in a block's title */
    account: string;
    status: Record<SmStatus, string>;
  };
  /** in paint order, bottom → top (Figma 4964:1729): the two answered ones, the story's lead,
      then the one being drafted in front */
  convos: readonly SmConvo[];
  /** in paint order, bottom → top (Figma 5061:1209); the first is the story's own account: its
      rows are the leads of three of the conversations above, which the timeline turns into them */
  accounts: readonly SmAccount[];
};

/** the three leads of an account block, with the storyboard's three states in its order */
const rows = (a: SmLead, b: SmLead, c: SmLead): SmAccount["rows"] => [
  { lead: a, status: "reached" },
  { lead: b, status: "booked" },
  { lead: c, status: "waiting" },
];

export const SM_STORY: SmStory = {
  post: {
    author: L.sarah.name,
    headline: "Founder at Shift",
    time: "3h •",
    body: "We just raised our seed round...",
    counts: [34, 5, 5, 5],
  },
  labels: {
    drafting: "Drafting...",
    sent: "Sent",
    account: "’s account",
    status: { reached: "Reached out", booked: "Booked", waiting: "Waiting for a reply" },
  },
  convos: [
    {
      // Figma 5061:933 / 919 / 924 — right, further away, answered
      id: "answered",
      lead: L.tamsin,
      state: "sent",
      message:
        "Hi Tamsin, congrats on Quillfern’s seed round. Want a new website live before your marketing lead starts?",
      reply: "Hey, sounds interesting. I’m free Thursday 3pm!",
      place: { x: 563.676, y: 97.945, s: 0.681942 },
      dim: 0.5,
      wire: 0.8,
    },
    {
      // Figma 5061:990 / 976 / 981 — below, far away, answered (it runs off the stage's bottom
      // edge). Her signal is the sibling Play's: a post about a rebrand (as her row says in the
      // "sources" story)
      id: "far",
      lead: L.elena,
      state: "sent",
      message:
        "Hi Elena, read your post on Harborlane’s rebrand. Who is rebuilding the website? We do that for startups.",
      reply: "Nobody yet. Can you send me an example?",
      place: { x: 415.426, y: 419.945, s: 0.355553 },
      dim: 0.5,
      wire: 0.8,
    },
    {
      // Figma 5061:950 / 945 — frames 1–2's conversation, moved aside in frame 3. Her signal is
      // the post the story opens on
      id: "lead",
      lead: L.sarah,
      state: "typed",
      message:
        "Hey Sarah, just saw your post. Congrats on the seed round! Is Shift’s website ready for what comes next?",
      place: { x: -55.574, y: 97.945, s: 1 },
      dim: 0.6,
      wire: 1,
    },
    {
      // Figma 5061:966 / 961 — the next one, in front (1.5×), being drafted. His signal is an
      // open role (the Play's own: a funded startup hiring a marketing lead)
      id: "next",
      lead: L.nate,
      state: "typed",
      message:
        "Hi Nate, saw Quorra Labs is hiring a marketing lead. Will they start with today’s website, or a new one?",
      place: { x: 106.426, y: 70.945, s: 1.5 },
      dim: 1,
      wire: 1,
    },
  ],
  accounts: [
    // Figma Group 88 5061:1396 — the story's account: the three conversations just seen, front
    // to back (his message has just been sent, she is free Thursday, hers went first)
    {
      id: "main",
      sender: "Astrid Norling",
      rows: rows(L.nate, L.tamsin, L.sarah),
      place: { x: 220.426, y: 159, k: 0.624 },
      dim: 1,
      blur: 0,
    },
    /* The six around it are other senders' accounts: none of their leads is one of the four
       conversations above. The cast has twelve leads left for these eighteen rows; the three
       blocks a visitor can half-read (the 0.528 ones) share none, the repeats sit in the two
       faintest (Runa's and Dario's, 20 % and out of focus). */
    // Group 89 5061:1397 — top-left
    { id: "s1", sender: "Theo Marchand", rows: rows(L.anders, L.rosa, L.chloe), place: { x: -21.574, y: 60.744, k: 0.356 }, dim: 1, blur: 2 },
    // Group 93 5061:1401 — top, far
    { id: "s2", sender: "Runa Halvick", rows: rows(L.rosa, L.chloe, L.omar), place: { x: 383.426, y: 4, k: 0.324 }, dim: 0.2, blur: 2 },
    // Group 94 5061:1411 — the furthest (84px wide; nothing of it can be read)
    { id: "s3", sender: "Dario Pellegrin", rows: rows(L.bea, L.jonah, L.nell), place: { x: 188.426, y: 81, k: 0.168 }, dim: 0.2, blur: 1.037 },
    // Group 91 5061:1399 — bottom-right
    { id: "s4", sender: "Hana Morrow", rows: rows(L.leopold, L.ruth, L.omar), place: { x: 449.426, y: 361, k: 0.528 }, dim: 0.32, blur: 2 },
    // Group 90 5061:1398 — bottom-left
    { id: "s5", sender: "Felix Okoro", rows: rows(L.lucian, L.nell, L.bea), place: { x: -75.574, y: 295, k: 0.528 }, dim: 0.2, blur: 2 },
    // Group 92 5061:1400 — right
    { id: "s6", sender: "Juno Farraby", rows: rows(L.jonah, L.wes, L.imani), place: { x: 572.426, y: 144, k: 0.528 }, dim: 0.4, blur: 2 },
  ],
};

/* ══ geometry the timeline needs (stage px on the 752×489 box; the CSS holds every rest pose) ══
   Kept in data, not computed at render (doctrine: no layout math in components). */
export const SM_POSE = {
  /** the story's conversation (its lead card's Figma box) under the post in frame 1 (5061:801)
      and alone in frame 2 (5061:908); its frame-3 place is its `place` above */
  leadF1: { x: 196.426, y: 347.785 },
  leadF2: { x: 196.426, y: 127.945 },
  /** frame 3 → frame 4: the view pulls back by Figma's 308.95 / 540, about this stage point
      (a fit over the thirteen card and wire origins of 4964:1729 and 5061:1002; the residual is
      0.02px). Four decimals: GSAP writes four. */
  pullBack: { scale: 0.5721, about: { x: 376.8, y: 259.98 } },
  /** where the next conversation (1.5×, in front) waits before frame 3, as its lead card's x:
      past the stage's right edge (752) by more than its shadow reaches (32 × 1.5) */
  offRight: 808,
  /** the account's title in frame 4 (5061:1085): its left edge and top. In frame 5 it is centred
      over the rows, 22.32px lower (5061:1169) — the CSS pose. */
  headF4: { left: 220.426, dy: -22.32 },
  /** where the name's centre sits in frame 5 (stage px): 237.426 + 277 / 2 */
  headF5Centre: 375.926,
  /** frame 5 → frame 6: the accounts are drawn at frame 6's size (the rest picture); frame 5 is
      the camera 500 / 312 closer, about the point story-message.css gives it */
  camF5: 1.6026,
} as const;

/* ══ the scene's text alternative ════════════════════════════════════════════════════════ */

export const STORY_MESSAGE_ALT: string =
  "Animation: Sarah Velasquez, founder at Shift, posts that they just raised their seed round. " +
  "Pancake drafts her a personal message that opens with it, and sends it. " +
  "The next lead’s company is hiring a marketing lead: his message opens with that. Two more leads have already answered. " +
  "The view pulls back: these conversations are all sent from one account, Astrid Norling’s. " +
  "They line up as its leads, one reached out to, one booked, one waiting for a reply. " +
  "Then more accounts appear around it, each with its own leads.";
