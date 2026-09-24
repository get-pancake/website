// lib/verticals/data/fractional-cfos.ts — SEO bet (adjacent: a churned FP&A software + CFO service).
// Merged in: outsourced CFOs / part-time finance leaders.
// Caveat (brief): no revenue, funding or financial data, never "companies that just raised".
// Stack = accounting tools named in the company's job posts (company-level, OR): no "why" or
// message cites one specific post. US wording only ("board deck", not "board pack").
// Every person, company, expert and workspace below is invented.
import type { VerticalConfig } from "../types";

export const fractionalCfos: VerticalConfig = {
  slug: "fractional-cfos",
  status: "approved",
  category: "Consultants & advisors",
  evidence: "seo-bet",
  updated: "2026-09-22",

  name: {
    plural: "fractional CFOs",
    title: "Fractional CFOs",
    short: "fractional CFOs",
    badge: "For fractional CFOs",
  },

  meta: { seoTitle: "Pancake for Fractional CFOs: Founders Hiring Finance" },

  hubLine: "Find founders hiring a VP Finance or posting about runway.",

  hero: {
    title: "Find the CEO behind each VP Finance job post.",
    lede: "Pancake reads controller openings, QuickBooks in job posts and founders posting about cash runway. Step in as their part-time CFO.",
  },

  workspace: { name: "Corriveau Finance", sender: "Megan Corriveau" },

  demo: {
    h2: "Reach the CEO before the seat fills.",
    prompts: [
      {
        kind: "hiring",
        text: "Part-time CFO here. Find US companies with 20 to 150 people hiring a VP Finance or controller.",
        reply: "I’ll watch job posts for finance leaders at US companies with 20 to 150 people.",
        proposal: [
          { kind: "hiring", items: ["VP Finance", "Financial controller", "Head of Finance"] },
          { kind: "stack", items: ["QuickBooks", "NetSuite"] },
          { kind: "keyword", items: ["board reporting", "financial model"] },
        ],
        leads: [
          { name: "Philippa Grayson", role: "CEO", company: "Coppervale", kind: "hiring", signal: "VP Finance role open" },
          { name: "Andre Toussaint", role: "COO", company: "Northgild", kind: "hiring", signal: "Controller role open" },
          { name: "Sunita Raghavan", role: "Founder & CEO", company: "Brackenfield", kind: "keyword", signal: "Posted on board reports" },
          { name: "Callum Rourke", role: "President", company: "Stavewell Freight", kind: "stack", signal: "NetSuite in job posts" },
          { name: "Ifeoma Chukwu", role: "Co-founder", company: "Mapleward", kind: "hiring", signal: "Head of Finance role" },
        ],
        featured: {
          why: "Coppervale is a 90-person US software company with a VP Finance role open. Philippa is the CEO.",
          confidence: 91,
          seniority: "C-level",
        },
        message:
          "Hi Philippa, nice to connect. I work as a part-time CFO, so I like hearing how other companies plan ahead. Which number do you watch most closely each month?",
      },
      {
        kind: "stack",
        text: "Find US firms with 30 to 200 staff whose job posts name QuickBooks. I help them outgrow it.",
        reply: "I’ll find companies whose job posts name QuickBooks, then the leader who owns finance.",
        proposal: [
          { kind: "stack", items: ["QuickBooks", "Xero"] },
          { kind: "hiring", items: ["Accounting manager", "Staff accountant"] },
          { kind: "keyword", items: ["outgrowing QuickBooks", "ERP migration"] },
        ],
        leads: [
          { name: "Dominic Esterhuizen", role: "COO", company: "Wickhaven Supply", kind: "stack", signal: "QuickBooks in job posts" },
          { name: "Leilani Kahale", role: "CEO", company: "Brinewood Goods", kind: "stack", signal: "Xero in job posts" },
          { name: "Brendan Tillinghast", role: "Founder", company: "Cedarwright Studio", kind: "hiring", signal: "Accounting role open" },
          { name: "Mirela Dragomir", role: "VP Operations", company: "Pellston Labs", kind: "keyword", signal: "Posted on ERP migration" },
          { name: "Tariq Bensalem", role: "Owner", company: "Gannetbrook", kind: "hiring", signal: "Staff accountant role" },
        ],
        featured: {
          why: "Wickhaven Supply is a 120-person US distributor whose job posts name QuickBooks. Dominic is the COO.",
          confidence: 85,
          seniority: "C-level",
        },
        message:
          "Hi Dominic, great to connect. I help companies outgrow their first accounting setup, and month-end is where it shows first. How many days does your close take?",
      },
      {
        kind: "keyword",
        text: "Find US SaaS founders posting about runway or unit economics. I own those numbers, part-time.",
        reply: "I’ll watch founder posts about runway and unit economics at US SaaS companies.",
        proposal: [
          { kind: "keyword", items: ["cash runway", "unit economics", "13-week cash flow"] },
          { kind: "influencer", items: ["Delphine Marsh", "Oren Blackwell"] },
          { kind: "hiring", items: ["FP&A manager"] },
        ],
        leads: [
          { name: "Viktor Makela", role: "Founder & CEO", company: "Parapet Cloud", kind: "keyword", signal: "Posted on cash runway" },
          { name: "Janelle Beaudry", role: "CEO", company: "Cinderlane", kind: "keyword", signal: "Unit economics post" },
          { name: "Hector Zubizarreta", role: "COO", company: "Sprigwell", kind: "influencer", signal: "Liked a Marsh post" },
          { name: "Ayesha Rahman", role: "Co-founder", company: "Tesserafield", kind: "hiring", signal: "FP&A manager role" },
          { name: "Colin Ferreira", role: "Founder", company: "Duneglass", kind: "keyword", signal: "Posted on cash flow" },
        ],
        featured: {
          why: "Parapet Cloud is a 40-person US SaaS company. Viktor is the founder and posted this week about extending cash runway.",
          confidence: 88,
          seniority: "Founder",
        },
        message:
          "Hi Viktor, your post about stretching runway at Parapet Cloud made me curious. Which lever are you pulling first, spend or revenue?",
      },
    ],
  },

  signals: {
    h2: "Runway posts come before the CFO hire.",
    cards: [
      {
        kind: "hiring",
        title: "Companies hiring finance leaders",
        body: "Pancake matches each finance leadership job post to the CEO or founder behind the hire.",
        watching: ["VP Finance", "Financial controller", "Head of Finance"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Accounting tools in job posts",
        body: "A job post that asks for QuickBooks or NetSuite tells you which books you’d walk into.",
        watching: ["QuickBooks", "Xero", "NetSuite"],
      },
      {
        kind: "keyword",
        title: "Founders posting about runway",
        body: "Founders writing about cash, forecasts or board prep become leads when their company fits.",
        watching: ["cash runway", "13-week cash flow", "board reporting"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Where founders learn finance",
        body: "Pancake keeps the founders who like or comment on posts from the startup finance writers you name.",
        watching: ["Delphine Marsh", "Oren Blackwell"],
      },
    ],
  },

  faq: [
    {
      q: "Can it tell who still runs finance on a bookkeeper?",
      a: "Not directly. Pancake can’t see a company’s books. A controller or VP Finance job post is the tell, and each lead shows it.",
    },
    {
      q: "Can it find companies that raised a round?",
      a: "No. Pancake doesn’t see funding or financials. It finds finance job posts and founders posting about runway or board prep.",
    },
    {
      q: "Can I pause outreach during close week?",
      a: "Yes. Pausing the campaign stops sending right away, and scheduled steps hold. When you resume, each lead picks up where it left off.",
    },
  ],

  related: ["fractional-cmos", "consultants", "fintech-startups", "executive-search-firms"],

  cta: { title: "Take the seat part-time." },
};
