// lib/verticals/data/marketing-agencies.ts — B2B marketing agencies (merged: digital, growth, B2B marketing).
// Every person, company, rival agency, expert and workspace below is invented.
// Caveat (brief): no local-SMB prompts or examples; buyers are B2B people with public profiles.
import type { VerticalConfig } from "../types";

export const marketingAgencies: VerticalConfig = {
  slug: "marketing-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "marketing agencies",
    title: "Marketing agencies",
    short: "marketing agencies",
    badge: "For marketing agencies",
  },

  meta: { seoTitle: "Pancake for Marketing Agencies: Find New B2B Clients" },

  hubLine: "Find B2B teams hiring marketers or asking for an agency.",

  hero: {
    title: "Find B2B founders crowdsourcing their next agency.",
    lede: "Pancake reads “looking for an agency” posts, marketing job posts and rivals’ comment threads. Every morning, meet who holds the brief.",
  },

  workspace: { name: "Ybarra Growth", sender: "Carmen Ybarra" },

  demo: {
    h2: "From their post to your pitch.",
    prompts: [
      {
        kind: "hiring",
        text: "We do industrial marketing. Find US manufacturers with 50 to 500 staff hiring marketers.",
        reply: "I’ll watch marketing job posts from US manufacturers and skip staffing-firm listings.",
        proposal: [
          { kind: "hiring", items: ["Marketing manager", "Marketing coordinator", "Trade show coordinator"] },
          { kind: "stack", items: ["HubSpot", "Marketo"] },
          { kind: "keyword", items: ["trade show leads"] },
          { kind: "competitor", items: ["Pinwright Marketing"] },
        ],
        leads: [
          { name: "Colette Varnum", role: "Marketing Director", company: "Tarrowby", kind: "hiring", signal: "2 marketing roles open" },
          { name: "Rafferty Tuazon", role: "President", company: "Quenlin", kind: "hiring", signal: "Marketing manager role" },
          { name: "Shira Feldstein", role: "Marketing Manager", company: "Veltrona", kind: "keyword", signal: "Posted on trade shows" },
          { name: "Beau Arceneaux", role: "Marketing Director", company: "Brazeline", kind: "stack", signal: "HubSpot in job posts" },
          { name: "Ximena Barragán", role: "Brand Manager", company: "Hexley", kind: "competitor", signal: "Liked a Pinwright post" },
        ],
        featured: {
          why: "Tarrowby is a 240-person US valve maker hiring a marketing manager and a trade show coordinator. Colette directs its marketing.",
          confidence: 89,
          seniority: "Director",
        },
        message:
          "Hi Colette, good to connect. We do industrial marketing, so I like hearing which channels still pull their weight. Which one brings you the best leads today?",
      },
      {
        kind: "keyword",
        text: "Find US founders asking for marketing agency recommendations. We’re a B2B shop.",
        reply: "I’ll watch posts asking for a B2B agency and skip the agencies pitching in the comments.",
        proposal: [
          { kind: "keyword", items: ["looking for an agency", "agency recommendations"] },
          { kind: "hiring", items: ["Demand gen manager"] },
          { kind: "competitor", items: ["Oxcart Marketing"] },
        ],
        leads: [
          { name: "Tariq Sarraf", role: "Founder & CEO", company: "Coinrill", kind: "keyword", signal: "Asked for an agency" },
          { name: "Odessa Kincannon", role: "Head of Marketing", company: "Wrenlow", kind: "keyword", signal: "Asked for referrals" },
          { name: "Jerome Okonjo", role: "CEO", company: "Ardenwise", kind: "hiring", signal: "Demand gen role open" },
          { name: "Lucinda Espinal", role: "VP Marketing", company: "Dovecote Labs", kind: "competitor", signal: "Liked an Oxcart post" },
          { name: "Hollis Brightbill", role: "Co-founder", company: "Glowtide", kind: "keyword", signal: "Asked for agency picks" },
        ],
        featured: {
          why: "Coinrill is a 45-person US payments company. Tariq, its founder, posted this week asking for B2B marketing agency picks.",
          confidence: 92,
          seniority: "Founder",
        },
        message:
          "Hi Tariq, saw your post asking for B2B marketing agency picks. What would the agency own first: pipeline, content or the brand?",
      },
      {
        kind: "influencer",
        text: "We do demand gen for SaaS. Find US heads of marketing engaging with B2B experts’ posts.",
        reply: "I’ll watch posts from the experts your buyers follow and keep SaaS marketing heads.",
        proposal: [
          { kind: "influencer", items: ["Philippa Grange", "Lionel Dunaway"] },
          { kind: "keyword", items: ["pipeline target", "demand generation"] },
          { kind: "hiring", items: ["Field marketing manager"] },
        ],
        leads: [
          { name: "Imani Prewitt", role: "Head of Marketing", company: "Arbolade", kind: "influencer", signal: "Commented on a post" },
          { name: "Caleb Yoshimura", role: "VP Marketing", company: "Orchardly", kind: "influencer", signal: "Liked a Dunaway post" },
          { name: "Soraya Akinyemi", role: "Demand Gen Lead", company: "Kiteline", kind: "keyword", signal: "Posted on pipeline" },
          { name: "Tobin Mattingly", role: "Marketing Manager", company: "Tarnway", kind: "hiring", signal: "Field marketing role" },
          { name: "Ruth Abiodun", role: "CMO", company: "Pewterly", kind: "influencer", signal: "Liked a Grange post" },
        ],
        featured: {
          why: "Imani leads marketing at Arbolade, a 120-person US SaaS company, and commented on Philippa Grange’s post about pipeline targets.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Imani, noticed your comment on Philippa Grange’s post about pipeline targets. Who sets the pipeline number at Arbolade, marketing or sales?",
      },
    ],
  },

  signals: {
    h2: "Every marketing hire is a brief.",
    cards: [
      {
        kind: "hiring",
        title: "Teams hiring the work you do",
        body: "An open marketing role shows where the team is short, and Pancake finds the leader who owns it.",
        watching: ["Marketing manager", "Content marketer"],
        more: 3,
      },
      {
        kind: "keyword",
        title: "Founders asking for an agency",
        body: "When a founder posts asking for agency picks, Pancake brings you the post and the person.",
        watching: ["looking for an agency", "agency recommendations"],
        more: 2,
      },
      {
        kind: "own_brand",
        title: "Your posts, turned into leads",
        body: "Pancake checks who likes your agency’s recent posts and keeps the B2B marketers among them.",
        watching: ["Ybarra Growth", "Carmen Ybarra"],
      },
      {
        kind: "competitor",
        title: "Rival agencies’ audience",
        body: "Pancake watches posts from agencies you compete with and keeps the marketers who engage.",
        watching: ["Pinwright Marketing", "Oxcart Marketing"],
      },
    ],
  },

  faq: [
    {
      q: "Most of my clients are local businesses. Will it work?",
      a: "Only partly. Pancake finds people at B2B companies, and local shops rarely post or keep profiles. Aim it at your B2B buyers first.",
    },
    {
      q: "We have ten retainer clients. One account or ten?",
      a: "Ten workspaces, $99 each, under one login. Each client gets its own Brain, leads and sending account.",
    },
    {
      q: "Won’t I get the agencies pitching in the comments?",
      a: "Rarely. Pancake checks every person against your buyer profile, so agency staff pitching under a founder’s post get dropped.",
    },
    {
      q: "Can it tell when a company loses its marketing lead?",
      a: "No. Pancake doesn’t track people leaving jobs. It sees the replacement role once the company posts it.",
    },
  ],

  related: ["seo-agencies", "ppc-agencies", "branding-agencies", "fractional-cmos", "web-design-agencies"],

  cta: { title: "Get on the shortlist." },
};
