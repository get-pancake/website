// lib/verticals/data/recruiting-agencies.ts — the reference config copywriters imitate.
// Every person, company, rival agency and workspace below is invented.
import type { VerticalConfig } from "../types";

export const recruitingAgencies: VerticalConfig = {
  slug: "recruiting-agencies",
  status: "approved",
  category: "Sales, GTM & recruiting",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "recruiting agencies",
    title: "Recruiting agencies",
    short: "recruiters",
    badge: "For recruiting agencies",
  },

  meta: { seoTitle: "Pancake for Recruiting Agencies: Find Companies Hiring" },

  hubLine: "Find companies hiring the roles you place.",

  hero: {
    title: "Find hiring managers with open roles you can fill.",
    lede: "Pancake reads employer job posts, never agency listings, and names who owns each search. Reach them ahead of rival recruiters.",
  },

  workspace: { name: "Ferro Talent", sender: "Nadia Ferro" },

  demo: {
    h2: "From job post to first message.",
    prompts: [
      {
        kind: "hiring",
        text: "I place backend engineers. Find US SaaS companies with 50 to 200 people hiring them.",
        reply: "I’ll watch job posts for those roles and skip listings from other agencies.",
        proposal: [
          { kind: "hiring", items: ["Backend engineer", "Senior backend engineer", "Platform engineer"] },
          { kind: "stack", items: ["Go", "Kubernetes"] },
          { kind: "keyword", items: ["hiring backend engineers", "growing our platform team"] },
          { kind: "competitor", items: ["Northpeak Talent", "Wrenfield Search"] },
        ],
        leads: [
          { name: "Dana Whitfield", role: "VP Engineering", company: "Brindlecloud", kind: "hiring", signal: "3 backend roles open" },
          { name: "Marcus Oyelowo", role: "Head of Talent", company: "Quaystack", kind: "hiring", signal: "Senior backend role" },
          { name: "Priya Natarajan", role: "CTO & Co-founder", company: "Fernhollow", kind: "keyword", signal: "Posted “we’re hiring”" },
          { name: "Tomás Reyes", role: "Engineering Lead", company: "Tallowmere", kind: "stack", signal: "Kubernetes in job posts" },
          { name: "Leah Brandt", role: "Talent Lead", company: "Orbitleaf", kind: "competitor", signal: "Liked a Northpeak post" },
        ],
        featured: {
          why: "Brindlecloud, a 140-person US SaaS company, opened three backend engineer roles this month. Dana runs engineering and owns those hires.",
          confidence: 91,
          seniority: "VP",
        },
        message:
          "Hi Dana, thanks for connecting. I place backend engineers with software teams, so I like getting to know the people who build them. Which engineers are hardest to find on your side right now?",
      },
      {
        kind: "keyword",
        text: "I place early sales hires. Find US founders posting that they’re building a sales team.",
        reply: "I’ll watch founders’ posts about sales hiring, plus the sales roles they open.",
        proposal: [
          { kind: "keyword", items: ["building our sales team", "hiring our first AE"] },
          { kind: "hiring", items: ["Account executive", "Sales development rep"] },
          { kind: "competitor", items: ["Launchline Recruiting"] },
        ],
        leads: [
          { name: "Owen Castellano", role: "Founder & CEO", company: "Pollenworks", kind: "keyword", signal: "Posted about sales hires" },
          { name: "Ines Alvarado", role: "COO", company: "Cadrelane", kind: "hiring", signal: "Account executive role" },
          { name: "Kofi Mensah", role: "Co-founder", company: "Hearthmark", kind: "hiring", signal: "AE and SDR roles open" },
          { name: "Rachel Imura", role: "Head of People", company: "Lumenfold", kind: "competitor", signal: "Liked a Launchline post" },
          { name: "Theo Lindgren", role: "Founder", company: "Nimbleroot", kind: "keyword", signal: "Posted “first AE hire”" },
        ],
        featured: {
          why: "Pollenworks is a 32-person B2B software company. Owen posted this week that he’s building a sales team, and he still runs hiring himself.",
          confidence: 88,
          seniority: "Founder",
        },
        message:
          "Hi Owen, read your post about building the sales team at Pollenworks. Is the first hire a closer, or someone to book meetings?",
      },
      {
        kind: "competitor",
        text: "I recruit compliance teams for US fintechs. Find heads of talent engaging with rival recruiters.",
        reply: "I’ll watch posts from the agencies you compete with and keep people at fintechs.",
        proposal: [
          { kind: "competitor", items: ["Crestmoor Search", "Ledgerline Talent"] },
          { kind: "hiring", items: ["Compliance analyst", "Risk analyst", "AML investigator"] },
          { kind: "keyword", items: ["growing our compliance team"] },
        ],
        leads: [
          { name: "Grace Adebayo", role: "Head of Talent", company: "Halvard Pay", kind: "competitor", signal: "Liked a Crestmoor post" },
          { name: "Julian Mercer", role: "VP People", company: "Keelwater", kind: "competitor", signal: "Liked a Ledgerline post" },
          { name: "Hannah Obi", role: "Recruiter", company: "Ashgrove Ledger", kind: "hiring", signal: "2 compliance roles open" },
          { name: "Victor Salas", role: "COO", company: "Clearbeck", kind: "keyword", signal: "Posted on compliance" },
          { name: "Mei Tanaka", role: "Talent Partner", company: "Tarnfield", kind: "hiring", signal: "Risk analyst role open" },
        ],
        featured: {
          why: "Grace leads talent at Halvard Pay, a 210-person US fintech. She liked a Crestmoor Search post this week on why compliance searches drag on.",
          confidence: 90,
          seniority: "Head",
        },
        message:
          "Hi Grace, noticed you liked a post on why compliance searches drag on. Does that match what you’re seeing at Halvard?",
      },
    ],
  },

  signals: {
    h2: "An open role is a buying signal.",
    cards: [
      {
        kind: "hiring",
        title: "Companies hiring your roles",
        body: "Pancake reads job posts for the roles you fill and keeps the employer, never an agency posting for a client.",
        watching: ["Backend engineer", "Account executive", "Data engineer"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "Founders who say “we’re hiring”",
        body: "Pancake finds people posting about growing their team and brings the post with the lead.",
        watching: ["we’re hiring", "growing the team", "hard-to-fill roles"],
      },
      {
        kind: "competitor",
        title: "Fans of rival agencies",
        body: "People who comment on or react to a rival agency’s posts become your leads.",
        watching: ["Northpeak Talent", "Wrenfield Search"],
      },
      {
        kind: "stack",
        title: "Tools named in job posts",
        body: "Pancake finds companies whose job posts name the tools your candidates know.",
        watching: ["Kubernetes", "Snowflake", "Salesforce"],
      },
    ],
  },

  faq: [
    {
      q: "Will I get other agencies’ job posts?",
      a: "No. The hiring signal skips jobs posted by agencies, so every company is the employer itself.",
    },
    {
      q: "Can Pancake find candidates too?",
      a: "No. Pancake finds clients: the people who buy your service, not the people you place.",
    },
    {
      q: "Does it plug into my ATS?",
      a: "No. There’s no ATS connection and no export. You review and approve leads in Pancake or Slack.",
    },
    {
      q: "Can I run two desks, like tech and finance?",
      a: "Yes, with one workspace per desk, each with its own Brain and $99 plan. Each desk also needs its own account to send from.",
    },
  ],

  related: ["executive-search-firms", "hr-consultants", "gtm-agencies", "revops-consultants"],

  cta: { title: "Your next client is hiring." },
};
