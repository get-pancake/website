// lib/verticals/data/ppc-agencies.ts — Pancake for PPC agencies.
// Every person, company, rival agency, expert and workspace below is invented.
// Caveat (brief): no ad-spend, ad-account or pixel data. Stack = ad platforms named in job posts only.
import type { VerticalConfig } from "../types";

export const ppcAgencies: VerticalConfig = {
  slug: "ppc-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "seo-bet",
  updated: "2026-09-22",

  name: {
    plural: "PPC agencies",
    title: "PPC agencies",
    short: "PPC agencies",
    badge: "For PPC agencies",
  },

  meta: { seoTitle: "Pancake for PPC Agencies: Growth Teams Hiring Paid Media" },

  hubLine: "Find growth teams hiring paid media or posting about CAC.",

  hero: {
    title: "Find e-commerce brands staffing up paid media.",
    lede: "Google Ads in job posts and CAC debates on LinkedIn lead to the head of growth. Run their ads while the role sits open.",
  },

  workspace: { name: "Brennick Media", sender: "Aria Brennick" },

  demo: {
    h2: "Aim Pancake at your next ad account.",
    prompts: [
      {
        kind: "hiring",
        text: "We run paid media. Find US e-commerce brands with 10 to 150 staff hiring a paid media manager.",
        reply: "I’ll watch job posts for paid media roles at US e-commerce brands that size.",
        proposal: [
          { kind: "hiring", items: ["Paid media manager", "PPC specialist", "Paid social specialist"] },
          { kind: "stack", items: ["Google Ads", "Meta Ads Manager"] },
          { kind: "keyword", items: ["rising CAC", "scaling paid social"] },
          { kind: "competitor", items: ["Ridgebid Media"] },
        ],
        leads: [
          { name: "Talia Brookshire", role: "Head of Growth", company: "Brackenhue", kind: "hiring", signal: "Paid media manager role" },
          { name: "Emeka Hollins", role: "VP Marketing", company: "Clovermoor", kind: "hiring", signal: "PPC specialist role open" },
          { name: "Luz Carranza", role: "E-commerce Lead", company: "Kibblecrest", kind: "keyword", signal: "Posted about rising CAC" },
          { name: "Graham Whitlock", role: "Growth Director", company: "Marblecove", kind: "stack", signal: "Google Ads in job posts" },
          { name: "Anika Sorensen", role: "CMO", company: "Wickfern Candle Co.", kind: "competitor", signal: "Liked a Ridgebid post" },
        ],
        featured: {
          why: "Brackenhue is a 60-person US e-commerce brand with a paid media manager role open. Talia heads growth there.",
          confidence: 91,
          seniority: "Head",
        },
        message:
          "Hi Talia, thanks for accepting. I live inside ad accounts, so I’m always curious what’s working for other brands. Which channel carries the most weight for you right now?",
      },
      {
        kind: "keyword",
        text: "My agency fixes rising CAC. Find US heads of growth posting about CAC or Performance Max.",
        reply: "I’ll watch posts about CAC and Performance Max from heads of growth at US companies.",
        proposal: [
          { kind: "keyword", items: ["rising CAC", "Performance Max", "blended ROAS"] },
          { kind: "influencer", items: ["Marisol Vance", "Deshawn Pike"] },
          { kind: "hiring", items: ["Growth marketing manager"] },
        ],
        leads: [
          { name: "Dante Echols", role: "VP Marketing", company: "Fernwick Apparel", kind: "keyword", signal: "Posted about Meta CAC" },
          { name: "Naomi Vrabel", role: "Head of Growth", company: "Spindlecove", kind: "keyword", signal: "Posted about PMax" },
          { name: "Darius Oyenuga", role: "Performance Lead", company: "Oatmoss", kind: "influencer", signal: "Liked a Vance post" },
          { name: "Petra Soderquist", role: "CMO", company: "Quillmere Home", kind: "influencer", signal: "Commented on a post" },
          { name: "Jamal Prescott", role: "CEO", company: "Indigrove Denim", kind: "hiring", signal: "Growth marketing role" },
        ],
        featured: {
          why: "Fernwick Apparel is a 90-person US e-commerce brand. Dante runs marketing and wrote this week that CAC on Meta keeps climbing.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Dante, saw your post about CAC climbing on Meta. Did the creative or the audiences stop working first?",
      },
      {
        kind: "stack",
        text: "I manage B2B ad accounts. Find US SaaS teams whose job posts ask for Google Ads skills.",
        reply: "I’ll look for Google Ads in US SaaS job posts, then find each team’s head of growth.",
        proposal: [
          { kind: "stack", items: ["Google Ads", "LinkedIn Ads"] },
          { kind: "hiring", items: ["Demand gen manager", "Paid acquisition lead"] },
          { kind: "own_brand", items: ["Brennick Media"] },
          { kind: "keyword", items: ["paid pipeline"] },
        ],
        leads: [
          { name: "Monique Treadwell", role: "Demand Gen Director", company: "Quorvia", kind: "stack", signal: "Google Ads in job posts" },
          { name: "Stefan Rendell", role: "Head of Growth", company: "Stratavine", kind: "stack", signal: "Google Ads in job posts" },
          { name: "Adaeze Obiora", role: "VP Marketing", company: "Kilnworth", kind: "hiring", signal: "Demand gen role open" },
          { name: "Colin Maheswaran", role: "Marketing Director", company: "Brightkeel", kind: "own_brand", signal: "Liked a Brennick post" },
          { name: "Sasha Petrakis", role: "Growth Lead", company: "Tessary", kind: "keyword", signal: "Posted on paid pipeline" },
        ],
        featured: {
          why: "Quorvia is a 150-person US B2B software company whose job posts name Google Ads. Monique leads demand generation there.",
          confidence: 89,
          seniority: "Director",
        },
        message:
          "Hi Monique, nice to connect. I manage B2B ad accounts. Where does most of your budget go these days, search or social?",
      },
    ],
  },

  signals: {
    h2: "Growth marketers post when CAC climbs.",
    cards: [
      {
        kind: "keyword",
        title: "Posts about CAC and ROAS",
        body: "Pancake finds growth marketers posting about ad costs and returns, and shows you the post.",
        watching: ["ROAS", "rising CAC", "PMax"],
        more: 2,
      },
      {
        kind: "hiring",
        title: "Teams hiring paid media",
        body: "When a company posts a paid search or social role, Pancake finds its head of growth.",
        watching: ["PPC specialist", "Paid media manager"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Ad platforms in job posts",
        body: "A job post that names Google Ads or LinkedIn Ads puts that company on your list.",
        watching: ["Google Ads", "LinkedIn Ads", "Meta Ads Manager"],
        more: 1,
      },
      {
        kind: "influencer",
        title: "Fans of paid media experts",
        body: "Pancake watches the paid acquisition experts you name and keeps the heads of growth who engage.",
        watching: ["Marisol Vance", "Deshawn Pike"],
      },
    ],
  },

  faq: [
    {
      q: "Can you see how much they spend on ads?",
      a: "No. Pancake reads job posts and LinkedIn activity, not ad accounts, pixels or spend. You size the budget on the first call.",
    },
    {
      q: "Can it find brands that fired their agency?",
      a: "No. Pancake has no news signal and can’t see which agency a brand uses. It finds growth marketers who post about CAC or hire for paid media.",
    },
    {
      q: "Can I target brands by ad platform?",
      a: "Yes, through job posts. The Stack signal finds companies whose job posts name Google Ads, Meta Ads Manager or LinkedIn Ads. Brands that aren’t hiring won’t show up this way.",
    },
    {
      q: "Will a company hiring in-house want an agency?",
      a: "Some won’t. The job post still shows paid media is a priority now. Pitch coverage while they hire, or support for the new hire.",
    },
  ],

  related: ["marketing-agencies", "seo-agencies", "shopify-agencies", "martech-startups"],

  cta: { title: "Take over their ads." },
};
