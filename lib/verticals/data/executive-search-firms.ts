// lib/verticals/data/executive-search-firms.ts
// Every person, company, rival firm, expert and workspace below is invented.
// Caveat (brief): Hiring only sees publicly posted roles, and most C-level searches never are.
// Never imply Pancake detects departures, appointments, ownership or job changes
// (no job-change signal, no "PE-backed" filter).
import type { VerticalConfig } from "../types";

export const executiveSearchFirms: VerticalConfig = {
  slug: "executive-search-firms",
  status: "approved",
  category: "Sales, GTM & recruiting",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "executive search firms",
    title: "Executive search firms",
    short: "headhunters",
    badge: "For executive search firms",
  },

  meta: { seoTitle: "Pancake for Executive Search Firms: Find New Mandates" },

  hubLine: "Reach CEOs hiring VP and C-level leaders.",

  hero: {
    h1: ["You fill the C-suite", "We bring you clients"],
    lede: "Pancake finds companies posting VP and C-level roles and reaches their CEOs from your LinkedIn. You pitch the search.",
  },

  workspace: { name: "Quarshie Search", sender: "Miriam Quarshie" },

  demo: {
    h2: "Start with the seat you fill.",
    prompts: [
      {
        kind: "hiring",
        text: "I place revenue leaders. Find US companies of 200 to 1,000 people hiring a CRO or VP Sales.",
        reply: "I'll watch employer job posts for CRO and VP Sales roles and find who owns each hire.",
        proposal: [
          { kind: "hiring", items: ["Chief Revenue Officer", "VP Sales", "SVP Sales"] },
          { kind: "keyword", items: ["hiring a CRO", "our next sales leader"] },
          { kind: "competitor", items: ["Tennant Hale"] },
        ],
        leads: [
          { name: "Elaine Brancato", role: "CEO", company: "Harlowmere Systems", kind: "hiring", signal: "CRO role posted" },
          { name: "Rashid Lateef", role: "VP People", company: "Dunmarsh Freight", kind: "hiring", signal: "VP Sales role open" },
          { name: "Brooke Hendry", role: "Founder & CEO", company: "Wexbridge Pay", kind: "keyword", signal: "Posted “hiring a CRO”" },
          { name: "Gideon Winterbourne", role: "Operating Partner", company: "Corranby", kind: "competitor", signal: "Liked a Tennant post" },
          { name: "Nkechi Obialo", role: "CEO", company: "Yarrowgate Logistics", kind: "hiring", signal: "SVP Sales role open" },
        ],
        featured: {
          why: "Harlowmere Systems, a 420-person US software company, posted a Chief Revenue Officer role. Elaine is the CEO, and a CRO reports to her.",
          confidence: 89,
          seniority: "C-level",
        },
        message:
          "Hi Elaine, saw Harlowmere posted a Chief Revenue Officer role. A CRO shapes the sales team for years, so the shortlist matters. We run retained searches for revenue leaders at software companies your size. Open to a call about the brief?",
      },
      {
        kind: "keyword",
        text: "I run senior searches. Find US founders posting about building their leadership team.",
        reply: "I'll watch for founders posting about their leadership team or succession.",
        proposal: [
          { kind: "keyword", items: ["building the exec team", "succession planning"] },
          { kind: "hiring", items: ["Chief Operating Officer", "Chief Financial Officer"] },
          { kind: "competitor", items: ["Mirefield Executive"] },
        ],
        leads: [
          { name: "Graham Birdsong", role: "Founder", company: "Carrowby Robotics", kind: "keyword", signal: "Posted on his exec team" },
          { name: "Adaeze Okonkwo", role: "CEO", company: "Fenwhistle Diagnostics", kind: "keyword", signal: "Posted on succession" },
          { name: "Silas Bergquist", role: "Founder", company: "Pellmoor Medical", kind: "hiring", signal: "COO role posted" },
          { name: "Yuki Harada", role: "CHRO", company: "Merrowdale Health", kind: "hiring", signal: "CFO role open" },
          { name: "Paloma Ruiz", role: "President", company: "Ambersill Foods", kind: "competitor", signal: "Liked a Mirefield post" },
        ],
        featured: {
          why: "Carrowby Robotics is a 260-person US manufacturer. Graham, its founder and CEO, posted this week about building his leadership team.",
          confidence: 87,
          seniority: "Founder",
        },
        message:
          "Hi Graham, read your post about building Carrowby’s leadership team. We run retained searches for founder-led companies at your stage, from COO to CFO. Would it help to talk through which seat to fill first?",
      },
      {
        kind: "influencer",
        text: "I run CEO and board searches. Find US chairs and directors engaging with governance experts.",
        reply: "I'll watch who reacts to the governance voices you name and keep chairs and directors.",
        proposal: [
          { kind: "influencer", items: ["Harriet Kimura", "Desmond Pryor"] },
          { kind: "keyword", items: ["CEO succession", "board effectiveness"] },
          { kind: "own_brand", items: ["Quarshie Search"] },
        ],
        leads: [
          { name: "Constance Wyeth", role: "Board Chair", company: "Lightfoot Mutual", kind: "influencer", signal: "Commented on Kimura" },
          { name: "Everett Nwosu", role: "Board Director", company: "Ottermoor Bank", kind: "influencer", signal: "Liked a Pryor post" },
          { name: "Lorraine Castellanos", role: "Board Member", company: "Quennell Bio", kind: "keyword", signal: "Posted on board reviews" },
          { name: "Tobias Kerrigan", role: "Board Member", company: "Brandwick", kind: "own_brand", signal: "Liked a Quarshie post" },
          { name: "Rosalind Thibodeaux", role: "Board Chair", company: "Thornlea Group", kind: "influencer", signal: "Liked a Kimura post" },
        ],
        featured: {
          why: "Lightfoot Mutual is a 900-person US insurer. Constance chairs its board and commented on a Harriet Kimura post about CEO succession.",
          confidence: 84,
          seniority: "C-level",
        },
        message:
          "Hi Constance, saw your comment on Harriet Kimura’s post about CEO succession. An outside slate helps a board test its inside candidates. We run CEO searches for insurers and banks your size. Open to a short call on how we’d scope one?",
      },
    ],
  },

  signals: {
    h2: "A posted role is half the story.",
    cards: [
      {
        kind: "hiring",
        title: "Companies posting senior roles",
        body: "Pancake reads employer job posts for the VP and C-level roles you fill, and skips other search firms.",
        watching: ["Chief Revenue Officer", "VP Engineering", "CFO"],
        more: 3,
      },
      {
        kind: "keyword",
        title: "CEOs who talk succession",
        body: "A CEO posting about succession or the exec team becomes a lead, with the post attached.",
        watching: ["succession planning", "exec team"],
        more: 3,
      },
      {
        kind: "influencer",
        title: "Followers of governance voices",
        body: "Pancake watches the board and governance experts you name and keeps the chairs and CEOs who engage.",
        watching: ["Harriet Kimura", "Desmond Pryor"],
        more: 2,
      },
      {
        kind: "competitor",
        title: "Fans of rival search firms",
        body: "Pancake reads the likes and comments on rival search firms’ posts and keeps the executives.",
        watching: ["Tennant Hale", "Mirefield Executive"],
      },
    ],
  },

  faq: [
    {
      q: "Most C-level roles are never posted. Does this still help?",
      a: "Partly. Hiring only sees posted roles, so it works best at VP level. Keyword and Influencer find CEOs posting or engaging on leadership topics, posted role or not.",
    },
    {
      q: "Can it tell me when a CFO or CEO steps down?",
      a: "No. There's no job-change signal, so Pancake can't see departures or appointments. It sees posted roles, and leaders posting about their team.",
    },
    {
      q: "Will it skip companies that already retained a search firm?",
      a: "No. Nobody can see who holds a mandate. Reject those leads with a reason, and the Brain learns your pattern.",
    },
    {
      q: "Can I target PE-backed companies?",
      a: "Not by ownership: Pancake can't see who backs a company. Add operating partners to the roles in your Brain, and Pancake finds the ones engaging with your topics.",
    },
  ],

  related: ["recruiting-agencies", "executive-coaches", "hr-consultants", "fractional-cfos"],

  cta: { title: "The C-suite is hiring." },
};
