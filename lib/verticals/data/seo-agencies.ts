// lib/verticals/data/seo-agencies.ts — SEO agencies (merged: GEO / AI-search and content-marketing agencies).
// Every person, company, expert and workspace below is invented.
// Caveat (brief): don't sell Pancake's own daily article here; no ranking, traffic or AI-citation claims for Pancake.
import type { VerticalConfig } from "../types";

export const seoAgencies: VerticalConfig = {
  slug: "seo-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "SEO agencies",
    title: "SEO agencies",
    short: "SEO agencies",
    badge: "For SEO agencies",
  },

  meta: { seoTitle: "Pancake for SEO Agencies: Find New SEO Clients" },

  hubLine: "Find marketers posting about lost organic traffic.",

  hero: {
    title: "Find marketers blaming a core update for lost traffic.",
    h1: ["You rank their sites", "We bring you clients"],
    lede: "Pancake follows zero-click threads and SEO job posts to whoever owns search. Sell the recovery while the drop stings.",
  },

  workspace: { name: "Crawlmere SEO", sender: "Rhea Montague" },

  demo: {
    h2: "From lost clicks to a warm lead.",
    prompts: [
      {
        kind: "keyword",
        text: "We fix organic traffic. Find heads of marketing at US SaaS firms posting about AI Overviews.",
        reply: "I’ll watch posts about AI Overviews and traffic drops, and keep SaaS marketing heads.",
        proposal: [
          { kind: "keyword", items: ["AI Overviews", "organic traffic drop", "zero-click search"] },
          { kind: "influencer", items: ["Mirela Olander"] },
          { kind: "hiring", items: ["SEO specialist"] },
        ],
        leads: [
          { name: "Yusuf Demirci", role: "Head of Growth", company: "Kelvary", kind: "keyword", signal: "Posted on AI Overviews" },
          { name: "Celeste Duchene", role: "Head of Content", company: "Gravelbeam", kind: "keyword", signal: "Posted on zero-click" },
          { name: "Andre Balogun", role: "VP Marketing", company: "Verrow", kind: "influencer", signal: "Liked an Olander post" },
          { name: "Lakshmi Pillai", role: "Content Lead", company: "Fablewise", kind: "hiring", signal: "SEO specialist role" },
          { name: "Grady Wetherell", role: "Growth Lead", company: "Oxleaf", kind: "keyword", signal: "Posted on traffic drop" },
        ],
        featured: {
          why: "Yusuf leads growth at Kelvary, an 80-person US SaaS company. This week he posted that AI Overviews are cutting its blog clicks.",
          confidence: 88,
          seniority: "Head",
        },
        message:
          "Hi Yusuf, read your post about AI Overviews cutting Kelvary’s blog clicks. Which pages took the biggest hit?",
      },
      {
        kind: "hiring",
        text: "We’re an SEO agency. Find US fintechs with 50 to 300 staff hiring an SEO or content manager.",
        reply: "I’ll watch job posts for SEO and content roles at US fintechs that size.",
        proposal: [
          { kind: "hiring", items: ["SEO manager", "Content marketing manager", "SEO specialist"] },
          { kind: "stack", items: ["Semrush", "Ahrefs"] },
          { kind: "keyword", items: ["SEO roadmap"] },
        ],
        leads: [
          { name: "Rosalind Teague", role: "Marketing Director", company: "Kelpstone", kind: "hiring", signal: "SEO manager role" },
          { name: "Emeka Ezeani", role: "VP Marketing", company: "Cobaltrow", kind: "hiring", signal: "2 SEO roles open" },
          { name: "Harper Vale", role: "CMO", company: "Harbright", kind: "stack", signal: "Semrush in job posts" },
          { name: "Ignacio Zubiri", role: "Growth Lead", company: "Quoinworks", kind: "hiring", signal: "Content marketing role" },
          { name: "Joy Takemoto", role: "Head of Content", company: "Pellam", kind: "keyword", signal: "Posted on SEO roadmap" },
        ],
        featured: {
          why: "Rosalind directs marketing at Kelpstone, a 60-person US fintech with an SEO manager role open.",
          confidence: 90,
          seniority: "Director",
        },
        message:
          "Hi Rosalind, appreciate the connection. We’re an SEO agency, and search has changed a lot this year. Is organic still growing for you, or holding flat?",
      },
      {
        kind: "stack",
        text: "We do e-commerce SEO. Find US online retailers whose job posts name Semrush or Ahrefs.",
        reply: "I’ll track retailers whose job posts name those tools, then find who runs e-commerce.",
        proposal: [
          { kind: "stack", items: ["Semrush", "Ahrefs"] },
          { kind: "hiring", items: ["E-commerce SEO specialist"] },
          { kind: "keyword", items: ["category page rankings"] },
        ],
        leads: [
          { name: "Nadine Brouwer", role: "VP E-commerce", company: "Burrowpaw", kind: "stack", signal: "Semrush in job posts" },
          { name: "Otis Kittredge", role: "Head of Growth", company: "Corkery Supply", kind: "stack", signal: "Ahrefs in job posts" },
          { name: "Marisela Duarte", role: "SEO Manager", company: "Loamwell Goods", kind: "hiring", signal: "E-commerce SEO role" },
          { name: "Arjun Bhattacharya", role: "Growth Lead", company: "Lanternly", kind: "keyword", signal: "Posted on category SEO" },
          { name: "Sofia Trevisan", role: "Founder", company: "Plumcork", kind: "stack", signal: "Ahrefs in job posts" },
        ],
        featured: {
          why: "Burrowpaw is a 150-person US pet supplies retailer. Its open job posts name Semrush, and Nadine runs e-commerce.",
          confidence: 84,
          seniority: "VP",
        },
        message:
          "Hi Nadine, great to connect. We do e-commerce SEO, so I think a lot about how stores get found. Which bring in more sales for you, category pages or product pages?",
      },
    ],
  },

  signals: {
    h2: "Rankings slip. Marketers post about it.",
    cards: [
      {
        kind: "keyword",
        title: "Posts about lost traffic",
        body: "Pancake finds marketers posting about core updates, AI Overviews or falling clicks.",
        watching: ["AI Overviews", "ChatGPT search"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Teams hiring SEO roles",
        body: "An SEO job post puts search on the roadmap, and Pancake finds who runs marketing there.",
        watching: ["SEO specialist", "SEO manager", "Content writer"],
      },
      {
        kind: "stack",
        title: "Semrush in the job post",
        body: "Pancake finds companies whose job posts ask for Semrush, Ahrefs or the other tools you work in.",
        watching: ["Semrush", "Ahrefs", "Google Search Console"],
      },
      {
        kind: "influencer",
        title: "Commenters on SEO experts",
        body: "Marketers who comment on posts by the search experts you name show up with the thread they joined.",
        watching: ["Mirela Olander", "Cormac Pryce"],
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake see a prospect’s rankings?",
      a: "No. Rankings and audits stay your job. Pancake reads LinkedIn posts and job posts, then brings you the person behind them.",
    },
    {
      q: "We serve SaaS and e-commerce. Can one setup cover both?",
      a: "Yes, if one pitch fits both, since your Brain can list several industries. If the pitches differ, run the second market in its own workspace at $99 a month.",
    },
    {
      q: "I sell GEO. Can it find people worried about ChatGPT answers?",
      a: "Yes. Add “ChatGPT search” or “AI Overviews” as keywords, and Pancake finds the people posting about them.",
    },
    {
      q: "Can Pancake send prospects a free SEO audit?",
      a: "No. Outreach is plain LinkedIn text, up to 500 characters a message, with no attachments. The audit comes after they reply.",
    },
  ],

  related: ["marketing-agencies", "web-design-agencies", "ppc-agencies", "pr-firms"],

  cta: { title: "They posted. You pitch." },
};
