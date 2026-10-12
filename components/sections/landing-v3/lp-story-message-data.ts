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
 * - ONE company, the homepage's: Acme makes SaaS launch videos
 *   (lib/verticals/home-demo.ts). The post is a launch, the message asks how she will show it.
 *   Every other lead, message and company is home-demo.ts's, verbatim (validate.ts checks that
 *   file; it is server-only, hence the copies). The lead who answers is Tamsin Okafor, with the
 *   reply step 03 of "How it works" already shows (lp-step-data.ts S3_THREAD): one story.
 * - "Hey Sarah" — the message greets the post's author (the storyboard's post and message are
 *   both "Anna"; before that it greeted the wrong person, fixed in production 2026-09-03).
 * - No network mark next to a name (the storyboard draws one), no connection degree, no
 *   reaction bubbles, no brand blue on the post, the plain role "Design lead at Shift"
 *   (2026-09-29 / 2026-10-07: the network is never named or drawn).
 * - Accounts are labelled with sender NAMES, not the storyboard's mailbox addresses: Pancake
 *   sends from the customer's own social accounts, never email. Astrid Norling is Studio
 *   Acme's sender in home-demo.ts; the six others are invented, unused in the repo and
 *   web-checked (one standard search per name found no person of that exact name; not
 *   exhaustive — check any new name the same way).
 * - "Waiting for a reply" for the storyboard's "Waiting response" (grammar). "Reached out" and
 *   "Booked" are the storyboard's ("Booked" is also the calendar's badge in step 03).
 */

/* ══ the cast ════════════════════════════════════════════════════════════════════════════ */

/** a lead as her card shows her: initials in the disc, name, then company over role */
export type SmLead = { name: string; initials: string; company: string; role: string };

// the homepage demo's leads (name, role, company copied verbatim from lib/verticals/home-demo.ts)
const L = {
  // the story's own lead: the post's author (production f2's fictional author since 2026-09-03)
  sarah: { name: "Sarah Velasquez", initials: "SV", company: "Shift", role: "Design lead" },
  tamsin: { name: "Tamsin Okafor", initials: "TO", company: "Quillfern", role: "Director of PMM" },
  wes: { name: "Wes Pomeroy", initials: "WP", company: "Stackhollow", role: "VP Marketing" },
  imani: { name: "Imani Coldwell", initials: "IC", company: "Ferngate", role: "CMO" },
  anders: { name: "Anders Forsythe", initials: "AF", company: "Loomwise", role: "PMM Lead" },
  rosa: { name: "Rosa Hartigan", initials: "RH", company: "Cindermoor", role: "Founder & CEO" },
  nate: { name: "Nate Trevino", initials: "NT", company: "Quorra Labs", role: "Head of Content" },
  chloe: { name: "Chloe Abelard", initials: "CA", company: "Hexfield", role: "Brand Director" },
  omar: { name: "Omar Tessaro", initials: "OT", company: "Gridwell", role: "VP Marketing" },
  bea: { name: "Bea Soriano", initials: "BS", company: "Cloudnook", role: "CMO" },
  jonah: { name: "Jonah Stoddard", initials: "JS", company: "Signalry", role: "Content Lead" },
  elena: { name: "Elena Marchetti", initials: "EM", company: "Harborlane", role: "VP Marketing" },
  leopold: { name: "Leopold Fairbairn", initials: "LF", company: "Parcelry", role: "CMO" },
  ruth: { name: "Ruth Adeyinka", initials: "RA", company: "Brimstack", role: "Head of Growth" },
  lucian: { name: "Lucian Ashcombe", initials: "LA", company: "Oakhatch", role: "PMM Director" },
  nell: { name: "Nell Lowenthal", initials: "NL", company: "Tallowby", role: "VP Marketing" },
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
  /** three lines at 327px, as every message card of the storyboard */
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
/** One sending account: its sender over three of its leads. `place` = where the block sits in
    frame 6, the rest picture (stage px: its rows' left edge, its header's top) and its scale
    (k: 1 = frame 5's size); `dim` = its opacity, `blur` = Figma's layer blur radius, in stage
    px (CSS blurs by half of it: Figma's radius is two standard deviations). */
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
  labels: { drafting: string; sent: string; status: Record<SmStatus, string> };
  /** in paint order, bottom → top (Figma 4964:1729): the two answered ones, the story's lead,
      then the one being drafted in front */
  convos: readonly SmConvo[];
  /** in paint order, bottom → top (Figma 5061:1209); the first is the story's own account */
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
    headline: "Design lead at Shift",
    time: "3h •",
    body: "Launch day is next week...",
    counts: [34, 5, 5, 5],
  },
  labels: {
    drafting: "Drafting...",
    sent: "Sent",
    status: { reached: "Reached out", booked: "Booked", waiting: "Waiting for a reply" },
  },
  convos: [
    {
      // Figma 5061:933 / 919 / 924 — right, further away, answered
      id: "answered",
      lead: L.tamsin,
      state: "sent",
      message:
        "Hi Tamsin, saw you teased a release at Quillfern this week. How will you show it on launch day, a video or screenshots?",
      reply: "Hey, sounds interesting. I’m free Thursday 3pm!",
      place: { x: 563.676, y: 97.945, s: 0.681942 },
      dim: 0.5,
      wire: 0.8,
    },
    {
      // Figma 5061:990 / 976 / 981 — below, far away, answered (it runs off the stage's bottom edge)
      id: "far",
      lead: L.elena,
      state: "sent",
      message: "Hi Elena, we make launch videos for SaaS teams. When your team ships a feature, who makes the video?",
      reply: "Nobody owns video yet. Can you send an example?",
      place: { x: 415.426, y: 419.945, s: 0.355553 },
      dim: 0.5,
      wire: 0.8,
    },
    {
      // Figma 5061:950 / 945 — frames 1–2's conversation, moved aside in frame 3
      id: "lead",
      lead: L.sarah,
      state: "typed",
      message:
        "Hey Sarah, saw your launch is next week. How will you show it, a video or screenshots? Free for a call Thursday?",
      place: { x: -55.574, y: 97.945, s: 1 },
      dim: 0.6,
      wire: 1,
    },
    {
      // Figma 5061:966 / 961 — the next one, in front (1.5×), being drafted
      id: "next",
      lead: L.nate,
      state: "typed",
      message:
        "Hi Nate, saw you liked Bramble Reels’ post on explainer videos. Is video on Quorra Labs’ content plan this year?",
      place: { x: 106.426, y: 70.945, s: 1.5 },
      dim: 1,
      wire: 1,
    },
  ],
  accounts: [
    // Figma Group 88 5061:1396 — the story's account: the three conversations just seen
    {
      id: "main",
      sender: "Astrid Norling",
      rows: rows(L.sarah, L.tamsin, L.nate),
      place: { x: 220.426, y: 159, k: 0.624 },
      dim: 1,
      blur: 0,
    },
    // Group 89 5061:1397 — top-left
    { id: "s1", sender: "Theo Marchand", rows: rows(L.wes, L.imani, L.anders), place: { x: -21.574, y: 60.744, k: 0.356 }, dim: 1, blur: 2 },
    // Group 93 5061:1401 — top, far
    { id: "s2", sender: "Runa Halvick", rows: rows(L.rosa, L.chloe, L.omar), place: { x: 383.426, y: 4, k: 0.324 }, dim: 0.2, blur: 2 },
    // Group 94 5061:1411 — the furthest (84px wide; nothing of it can be read). The demo has 13
    // leads left for these 18 rows: this block's three and the last block's last two are repeats
    { id: "s3", sender: "Dario Pellegrin", rows: rows(L.bea, L.jonah, L.elena), place: { x: 188.426, y: 81, k: 0.168 }, dim: 0.2, blur: 1.037 },
    // Group 91 5061:1399 — bottom-right
    { id: "s4", sender: "Hana Morrow", rows: rows(L.elena, L.leopold, L.ruth), place: { x: 449.426, y: 361, k: 0.528 }, dim: 0.32, blur: 2 },
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
  pullBack: { scale: 0.5721, origin: "376.8px 259.98px" },
  /** the account's name in frame 4 (5061:1085): its left edge and top. In frame 5 it is centred
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
  "Animation: Sarah Velasquez, a design lead at Shift, posts that her launch day is next week. " +
  "Pancake drafts her a personal message and sends it, while other leads get their own and one answers. " +
  "The view pulls back to the sending account’s leads, one reached out to, one booked, one waiting for a reply, " +
  "then to more sending accounts, each working its own leads.";
