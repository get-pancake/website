import type { SignalKind } from "@/lib/verticals/types";

/**
 * Deep-dive story "A personal message for every lead" — its copy and data (Figma V2 storyboard
 * 4964:1469 / 1471 / 1729 / 1821 / 1899). Owner: story-message package.
 * In scripts/homepage-lint.mjs FILES: every string here is linted. Nothing here is a placeholder
 * (no `status: "placeholder"` entries), so the stage renders the same in production and preview.
 *
 * STORY_MESSAGE_ALT is fixed (lp-dive-stages.ts imports it): what the animation shows, the only
 * copy a screen reader gets (the shell's host aria-label).
 *
 * Copy decisions (V2 replication, decisions 2026-10-09 §6, flagged in the PR):
 * - The coherent Studio Pelican story (spec C3) instead of V2's "Third no-show this week…" /
 *   "Pelican sends reminders patients actually open": Studio Pelican, the homepage's one
 *   fictional customer, makes SaaS launch videos (lib/verticals/home-demo.ts), so the post is a
 *   launch and the message asks how she'll show it. Same layout as V2: one-line post, a 4-line
 *   draft whose last word is corrected by hand ("Friday?" → "Thursday?").
 * - "Hey Sarah" (the post's author; V2 inherited "Hey Anna", fixed in production 2026-09-03).
 * - The accounts are labelled with sender NAMES, not V2's mike@studiopelican.com: Pancake sends
 *   from the customer's own social accounts, never email. Astrid Norling is Studio Pelican's
 *   sender in home-demo.ts; the other five are invented (unused in the repo, 2026-10-09).
 * - The post keeps production's neutral chrome: no connection degree, no reaction bubbles, no
 *   brand blue, the plain role "Design lead at Shift" (2026-09-29 / 2026-10-07).
 * - Lead rows: a DOM rebuild of V2's raster placeholder (one screenshot pasted 18 times), filled
 *   with the homepage demo's fictional leads (copied from home-demo.ts, which validate.ts
 *   checks; that file is server-only). Sarah's row is the lead the story just wrote to.
 */

export type SmLead = { name: string; role: string; company: string; kind: SignalKind; signal: string };
export type SmAccount = { sender: string; leads: readonly SmLead[] };

export type SmStory = {
  post: {
    author: string;
    headline: string;
    time: string;
    body: string;
    /** like, comment, repost, send */
    counts: readonly [number, number, number, number];
  };
  draft: {
    eyebrow: string;
    sentEyebrow: string;
    /** everything before the corrected word, ending in a space */
    text: string;
    /** the last word as Pancake writes it, then as the member corrects it (in red) */
    fix: { before: string; after: string };
    send: string;
  };
  accounts: {
    main: SmAccount;
    /** S1 top-right, S2 left, S3 top (far), S4 bottom-right, S5 bottom-left (Figma 4964:1899) */
    satellites: readonly [SmAccount, SmAccount, SmAccount, SmAccount, SmAccount];
  };
};

/** the app's chip label per signal kind (copied from components/sections/verticals/vx-copy.ts
    SIGNAL_LABEL — the demo's rows say the same) */
export const SM_KIND_LABEL: Record<SignalKind, string> = {
  keyword: "Keyword",
  competitor: "Competitor",
  influencer: "Influencer",
  own_brand: "Own brand",
  hiring: "Hiring",
  stack: "Stack",
};

// the homepage demo's leads (copied verbatim from lib/verticals/home-demo.ts)
const L = {
  tamsin: { name: "Tamsin Okafor", role: "Director of PMM", company: "Quillfern", kind: "keyword", signal: "Posted about a release" },
  wes: { name: "Wes Pomeroy", role: "VP Marketing", company: "Stackhollow", kind: "keyword", signal: "Posted on launch day" },
  imani: { name: "Imani Coldwell", role: "CMO", company: "Ferngate", kind: "influencer", signal: "Engaged with a post" },
  anders: { name: "Anders Forsythe", role: "PMM Lead", company: "Loomwise", kind: "competitor", signal: "Engaged with Bramble" },
  rosa: { name: "Rosa Hartigan", role: "Founder & CEO", company: "Cindermoor", kind: "keyword", signal: "Posted a product demo" },
  nate: { name: "Nate Trevino", role: "Head of Content", company: "Quorra Labs", kind: "competitor", signal: "Engaged with Bramble" },
  chloe: { name: "Chloe Abelard", role: "Brand Director", company: "Hexfield", kind: "competitor", signal: "Engaged with Ferrow" },
  omar: { name: "Omar Tessaro", role: "VP Marketing", company: "Gridwell", kind: "keyword", signal: "Posted a customer story" },
  bea: { name: "Bea Soriano", role: "CMO", company: "Cloudnook", kind: "influencer", signal: "Engaged with a post" },
  jonah: { name: "Jonah Stoddard", role: "Content Lead", company: "Signalry", kind: "competitor", signal: "Engaged with Bramble" },
  elena: { name: "Elena Marchetti", role: "VP Marketing", company: "Harborlane", kind: "hiring", signal: "PMM role open" },
  leopold: { name: "Leopold Fairbairn", role: "CMO", company: "Parcelry", kind: "hiring", signal: "Head of PMM role" },
  ruth: { name: "Ruth Adeyinka", role: "Head of Growth", company: "Brimstack", kind: "stack", signal: "Wistia in job posts" },
  lucian: { name: "Lucian Ashcombe", role: "PMM Director", company: "Oakhatch", kind: "hiring", signal: "PMM role open" },
  nell: { name: "Nell Lowenthal", role: "VP Marketing", company: "Tallowby", kind: "keyword", signal: "Posted release notes" },
} as const satisfies Record<string, SmLead>;

export const SM_STORY: SmStory = {
  post: {
    author: "Sarah Velasquez",
    headline: "Design lead at Shift",
    time: "3h •",
    body: "Launch day is next week...",
    counts: [34, 5, 5, 5],
  },
  draft: {
    eyebrow: "Drafting",
    sentEyebrow: "Message sent",
    text: "Hey Sarah, saw your launch is next week. How will you show it, a video or screenshots? Free for a quick call ",
    fix: { before: "Friday?", after: "Thursday?" },
    send: "Send",
  },
  accounts: {
    main: {
      sender: "Astrid Norling",
      leads: [
        { name: "Sarah Velasquez", role: "Design lead", company: "Shift", kind: "keyword", signal: "Posted about a launch" },
        L.ruth, // V2's row, verbatim
        L.tamsin,
      ],
    },
    satellites: [
      { sender: "Theo Marchand", leads: [L.wes, L.imani, L.anders] },
      { sender: "Priya Venkat", leads: [L.nate, L.chloe, L.omar] },
      { sender: "Dario Pellegrin", leads: [L.bea, L.jonah, L.rosa] },
      { sender: "Hana Morrow", leads: [L.elena, L.leopold, L.lucian] },
      // its rows 2 and 3 sit at or past the stage's bottom edge (desktop); two repeats of the far
      // account's leads fill them (15 demo leads for 18 rows)
      { sender: "Felix Okoro", leads: [L.nell, L.bea, L.jonah] },
    ],
  },
};

/** "Ruth Adeyinka" → "RA" */
export const smInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const STORY_MESSAGE_ALT: string =
  "Animation: Sarah Velasquez, a design lead at Shift, posts that her launch day is next week. " +
  "Pancake drafts her a personal reply, it is corrected by hand from Friday to Thursday and sent, " +
  "then the view pulls back to more sending accounts, each working its own leads.";

/* ── geometry (stage px; the 752×489 desktop box and the 400×520 phone box) ──
   Kept here, not computed at render (doctrine: no layout math in components). The CSS
   (story-message.css) holds the REST pose of every element; the builder reads the values the
   CSS can't express (the post's pose A, the exit origin) from SM_POSE. Keep the two in sync. */

export type SmPose = {
  /** the post at pose A (f1): its top-left and scale; the rest pose B is the CSS */
  postA: { left: number; top: number; scale: number };
  /** the convo's exit origin (the draft card's centre at 4 lines), "x y" px */
  convoOrigin: string;
};

export const SM_POSE: Record<"desktop" | "phone", SmPose> = {
  // Figma: pose A 1.170614 at (139.535, 133.104) = centred; pose B .621658 at (234, 82.704)
  desktop: { postA: { left: 139.535, top: 133.104, scale: 1.170614 }, convoOrigin: "353.621px 291.126px" },
  // recomposed for 400×520: pose A .9 centred (363.6×171), pose B .7 at (58.6, 88) above the
  // draft card (draft group ×.92, card centred); exit origin = the 4-line card's centre
  phone: { postA: { left: 18.2, top: 174.5, scale: 0.9 }, convoOrigin: "200px 304px" },
};

/** where a satellite account block sits: its header's top-left and its scale (k = header size /
    25.393, Figma 4964:1899); `phone` = the 400×520 recomposition, null = not drawn on phones */
export type SmBlockPlace = { x: number; y: number; k: number };
export const SM_SATELLITES: readonly { desktop: SmBlockPlace; phone: SmBlockPlace }[] = [
  // S1 top-right (Group 83 4964:1989)
  { desktop: { x: 462.652, y: 73.882, k: 0.68956 }, phone: { x: 196, y: 40, k: 0.68956 } },
  // S2 left (Group 84 4964:1990)
  { desktop: { x: -139.504, y: 102.196, k: 0.981727 }, phone: { x: -150, y: 418, k: 0.981727 } },
  // S3 top, far (Group 85 4964:1995)
  { desktop: { x: 204.691, y: -16.982, k: 0.366361 }, phone: { x: 70, y: 12, k: 0.366361 } },
  // S4 bottom-right (4964:1978 + rows 1976/1979/1980) — its header passes under the main card
  { desktop: { x: 409.008, y: 365.983, k: 0.626 }, phone: { x: 214, y: 420, k: 0.626 } },
  // S5 bottom-left (4964:2003 + rows 2000/2001/2002)
  { desktop: { x: 2.496, y: 404.012, k: 0.626 }, phone: { x: -120, y: 30, k: 0.626 } },
];
/** paint order, bottom → top (Figma): S4, S5, S1, S2, S3, then the main card */
export const SM_SATELLITE_ORDER = [3, 4, 0, 1, 2] as const;
