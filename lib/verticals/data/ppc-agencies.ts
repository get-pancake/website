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
    h1: ["You run paid media", "We bring you clients"],
    lede: "Pancake finds growth leads posting about rising CAC or hiring for paid media. Reach them before they pick who runs the ads.",
  },

  workspace: { name: "Brennick Media", sender: "Aria Brennick" },

  demo: {
    h2: "Aim Pancake at your next ad account.",
    prompts: [
      {
        kind: "hiring",
        text: "We run paid media. Find US e-commerce brands with 10 to 150 staff hiring a paid media manager.",
        reply: "I'll watch job posts for paid media roles at US e-commerce brands that size.",
        proposal: [
          { kind: "hiring", items: ["Paid media manager", "PPC specialist", "Paid social specialist"] },
          { kind: "stack", items: ["Google Ads", "Meta Ads Manager"] },
          { kind: "keyword", items: ["rising CAC", "scaling paid social"] },
          { kind: "competitor", items: ["Ridgebid Media"] },
        ],
        leads: [
          { name: "Talia Brookshire", role: "Head of Growth", company: "Peppertrail", kind: "hiring", signal: "Paid media manager role" },
          { name: "Emeka Hollins", role: "VP Marketing", company: "Tansy Home", kind: "hiring", signal: "PPC specialist role open" },
          { name: "Luz Carranza", role: "E-commerce Lead", company: "Pawsmith", kind: "keyword", signal: "Posted about rising CAC" },
          { name: "Graham Whitlock", role: "Growth Director", company: "Marblecove", kind: "stack", signal: "Google Ads in job posts" },
          { name: "Anika Sorensen", role: "CMO", company: "Emberly Candles", kind: "competitor", signal: "Liked a Ridgebid post" },
        ],
        featured: {
          why: "Peppertrail is a 60-person US e-commerce brand with a paid media manager role open. Talia heads growth there.",
          confidence: 91,
          seniority: "Head",
        },
        message:
          "Hi Talia, saw Peppertrail is hiring a paid media manager. Whoever you hire inherits the account as it stands today. We audit and rebuild Google and Meta accounts for e-commerce brands, so a new manager starts clean. Want that audit before they start?",
      },
      {
        kind: "keyword",
        text: "My agency fixes rising CAC. Find US growth leads posting about CAC or Performance Max.",
        reply: "I'll watch growth leads’ posts about CAC and Performance Max at US companies.",
        proposal: [
          { kind: "keyword", items: ["rising CAC", "Performance Max", "blended ROAS"] },
          { kind: "influencer", items: ["Marisol Vance", "Deshawn Pike"] },
          { kind: "hiring", items: ["Growth marketing manager"] },
        ],
        leads: [
          { name: "Dante Echols", role: "VP Marketing", company: "Fernwick Apparel", kind: "keyword", signal: "Posted about Meta CAC" },
          { name: "Naomi Vrabel", role: "Head of Growth", company: "Loomstead", kind: "keyword", signal: "Posted about PMax" },
          { name: "Darius Oyenuga", role: "Performance Lead", company: "Oatmoss", kind: "influencer", signal: "Liked Vance’s CAC post" },
          { name: "Petra Soderquist", role: "Growth Manager", company: "Harbor & Hue", kind: "influencer", signal: "Replied to Pike’s post" },
          { name: "Jamal Prescott", role: "CEO", company: "Indigrove Denim", kind: "hiring", signal: "Growth marketing role" },
        ],
        featured: {
          why: "Fernwick Apparel is a 90-person US e-commerce brand. Dante runs marketing and wrote this week that CAC on Meta keeps climbing.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Dante, saw your post about CAC climbing on Meta. We run paid social for apparel brands, and creative testing is usually where we start. Want the first three tests we’d run on your account?",
      },
      {
        kind: "stack",
        text: "I manage B2B ad accounts. Find US SaaS teams whose job posts ask for LinkedIn Ads skills.",
        reply: "I'll look for LinkedIn Ads in US SaaS job posts, then find each team's growth lead.",
        proposal: [
          { kind: "stack", items: ["LinkedIn Ads", "Google Ads"] },
          { kind: "hiring", items: ["Demand gen manager", "Paid acquisition lead"] },
          { kind: "own_brand", items: ["Brennick Media"] },
          { kind: "keyword", items: ["paid pipeline"] },
        ],
        leads: [
          { name: "Monique Treadwell", role: "Demand Gen Director", company: "Quorvia", kind: "stack", signal: "Job post: LinkedIn Ads" },
          { name: "Stefan Rendell", role: "Head of Growth", company: "Stratavine", kind: "stack", signal: "Google Ads in job posts" },
          { name: "Adaeze Obiora", role: "VP Marketing", company: "Kilnworth", kind: "hiring", signal: "Demand gen role open" },
          { name: "Colin Maheswaran", role: "Marketing Director", company: "Brightkeel", kind: "own_brand", signal: "Liked a Brennick post" },
          { name: "Sasha Petrakis", role: "Growth Lead", company: "Tessary", kind: "keyword", signal: "Posted on paid pipeline" },
        ],
        featured: {
          why: "Quorvia is a 150-person US B2B software company whose job posts name LinkedIn Ads. Monique leads demand generation there.",
          confidence: 89,
          seniority: "Director",
        },
        message:
          "Hi Monique, saw Quorvia’s job posts ask for LinkedIn Ads experience. That channel gets expensive fast without tight audiences. We run LinkedIn and Google Ads for B2B SaaS teams your size. Want the audience template we start from?",
      },
    ],
  },

  signals: {
    h2: "Growth leads post when CAC climbs.",
    cards: [
      {
        kind: "keyword",
        title: "Posts about CAC and ROAS",
        body: "Pancake finds growth leads posting about ad costs and returns, and shows you the post.",
        watching: ["ROAS", "rising CAC", "PMax"],
        more: 2,
      },
      {
        kind: "hiring",
        title: "Teams hiring paid media",
        body: "When a company posts a paid search or social role, Pancake finds its growth lead.",
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
        body: "Pancake watches the paid acquisition experts you name and keeps the growth leads who engage.",
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
      a: "No. Pancake has no news signal and can't see which agency a brand uses. It finds growth leads who post about CAC or hire for paid media.",
    },
    {
      q: "Can I target brands by ad platform?",
      a: "Yes, through job posts. The Stack signal finds companies whose job posts name Google Ads, Meta Ads Manager or LinkedIn Ads. Brands that aren't hiring won't show up this way.",
    },
    {
      q: "Will a company hiring in-house want an agency?",
      a: "Some won't. The job post still shows paid media is a priority now. Pitch coverage while they hire, or support for the new hire.",
    },
  ],

  related: ["marketing-agencies", "seo-agencies", "shopify-agencies", "martech-startups"],

  cta: { title: "Run their ads next." },
};
