// lib/verticals/data/fractional-cmos.ts — SEO bet (adjacent: a freelance marketing-consultant trial).
// Kept apart from marketing agencies: the buyer is the founder and the hook is a leadership role.
// Caveat (brief): Hiring = public job posts only. Never imply Pancake knows a founder has no marketing
// leader or that a CMO left (no job-change signal). Featured reasons state only size, signal and role.
// Every person, company, rival firm, expert and workspace below is invented.
import type { VerticalConfig } from "../types";

export const fractionalCmos: VerticalConfig = {
  slug: "fractional-cmos",
  status: "approved",
  category: "Consultants & advisors",
  evidence: "seo-bet",
  updated: "2026-09-22",

  name: {
    plural: "fractional CMOs",
    title: "Fractional CMOs",
    short: "fractional CMOs",
    badge: "For fractional CMOs",
  },

  meta: { seoTitle: "Pancake for Fractional CMOs: Founders Hiring Marketing" },

  hubLine: "Find B2B founders hiring a Head of Marketing.",

  hero: {
    title: "Find founders whose next hire is a Head of Marketing.",
    h1: ["You lead marketing", "We bring you clients"],
    lede: "Leadership job posts, GTM questions and reactions to your content. Pitch part-time before a full-time offer goes out.",
  },

  workspace: { name: "Castaneda Growth", sender: "Lucia Castaneda" },

  demo: {
    h2: "Reach the founder before the hire.",
    prompts: [
      {
        kind: "hiring",
        text: "I’m a fractional CMO. Find US B2B startups with 10 to 80 people hiring a Head of Marketing.",
        reply: "I’ll watch senior marketing job posts at US B2B startups with 10 to 80 people.",
        proposal: [
          { kind: "hiring", items: ["Head of Marketing", "VP Marketing", "Marketing Director"] },
          { kind: "keyword", items: ["first marketing hire", "need a marketer"] },
          { kind: "competitor", items: ["Oxlip Fractional", "Thistledown CMO"] },
        ],
        leads: [
          { name: "Oluwaseun Bakare", role: "Founder & CEO", company: "Ledgerpine", kind: "hiring", signal: "Head of Marketing role" },
          { name: "Hailey Strand", role: "Co-founder", company: "Wrackham", kind: "hiring", signal: "VP Marketing role open" },
          { name: "Nikhil Sastry", role: "CEO", company: "Brambleway", kind: "keyword", signal: "Asked for a marketer" },
          { name: "Serena Whitlow", role: "COO", company: "Inkhollow", kind: "competitor", signal: "Liked an Oxlip post" },
          { name: "Diego Rinaldi", role: "Founder", company: "Tinplate Labs", kind: "hiring", signal: "Marketing Director role" },
        ],
        featured: {
          why: "Ledgerpine is a 45-person US B2B software company with a Head of Marketing role open. Oluwaseun is its founder and CEO.",
          confidence: 90,
          seniority: "Founder",
        },
        message:
          "Hi Oluwaseun, glad we’re connected. As a fractional CMO, I spend a lot of time on how startups find their first channel. Which one has brought you the most customers so far?",
      },
      {
        kind: "own_brand",
        text: "B2B founders like my posts on positioning. Turn the US ones with under 100 staff into leads.",
        reply: "I’ll track reactions to your posts and keep founders at US B2B firms under 100 people.",
        proposal: [
          { kind: "own_brand", items: ["Lucia Castaneda", "Castaneda Growth"] },
          { kind: "keyword", items: ["positioning", "messaging", "category design"] },
          { kind: "influencer", items: ["Marguerite Abiola", "Idris Callander"] },
        ],
        leads: [
          { name: "Tobias Engstrom", role: "Co-founder & CEO", company: "Glintmoor", kind: "own_brand", signal: "Liked a Castaneda post" },
          { name: "Adaora Ikwuemesi", role: "Founder", company: "Kettlerock", kind: "own_brand", signal: "Commented on a post" },
          { name: "Wren Haverford", role: "CEO", company: "Sableport", kind: "keyword", signal: "Posted on positioning" },
          { name: "Jasper Nettlefold", role: "Head of Growth", company: "Mintwhistle", kind: "influencer", signal: "Liked an Abiola post" },
          { name: "Noor Qadri", role: "Co-founder", company: "Kelpgate", kind: "keyword", signal: "Posted about messaging" },
        ],
        featured: {
          why: "Glintmoor is a 28-person US B2B software startup. Tobias is the CEO and liked your latest post on positioning.",
          confidence: 88,
          seniority: "Founder",
        },
        message:
          "Hi Tobias, noticed you liked my post on positioning. Who writes Glintmoor’s pitch today, you or someone on the team?",
      },
      {
        kind: "keyword",
        text: "Find US B2B founders posting about their go-to-market plan. I build it with them, part-time.",
        reply: "I’ll watch founder posts about go-to-market plans and keep US B2B companies.",
        proposal: [
          { kind: "keyword", items: ["go-to-market plan", "launch plan"] },
          { kind: "hiring", items: ["Marketing manager", "Demand generation manager"] },
          { kind: "stack", items: ["HubSpot", "Google Analytics"] },
        ],
        leads: [
          { name: "Mariela Fonseca", role: "Founder & CEO", company: "Gablefield", kind: "keyword", signal: "Posted on go-to-market" },
          { name: "Everett Kaplan", role: "Co-founder", company: "Pebblequay", kind: "keyword", signal: "Posted a launch plan" },
          { name: "Chioma Anyanwu", role: "COO", company: "Ravelstone", kind: "hiring", signal: "Marketing manager role" },
          { name: "Lars Pettersen", role: "Founder", company: "Stoatley", kind: "stack", signal: "HubSpot in job posts" },
          { name: "Tessa Morland", role: "CEO", company: "Quiverleaf", kind: "hiring", signal: "Demand gen role open" },
        ],
        featured: {
          why: "Gablefield is a 35-person US B2B software company. Mariela is the founder and posted this week about her go-to-market plan.",
          confidence: 86,
          seniority: "Founder",
        },
        message:
          "Hi Mariela, came across your post about Gablefield’s go-to-market plan. Which channel gets the first bet?",
      },
    ],
  },

  signals: {
    h2: "A job post is your opening.",
    cards: [
      {
        kind: "hiring",
        title: "Founders hiring a marketing lead",
        body: "When a startup posts a senior marketing role, Pancake brings you the founder making the call.",
        watching: ["Head of Marketing", "VP Marketing", "Marketing Director"],
        more: 1,
      },
      {
        kind: "keyword",
        title: "Founders posting about GTM",
        body: "Founders who write about positioning or go-to-market become leads, with the post that flagged them.",
        watching: ["positioning", "go-to-market plan", "first marketing hire"],
      },
      {
        kind: "own_brand",
        title: "Your audience, qualified",
        body: "Founders who react to your posts become leads, each shown with the post they reacted to.",
        watching: ["Lucia Castaneda", "Castaneda Growth"],
      },
      {
        kind: "competitor",
        title: "Founders on rival firms’ posts",
        body: "Pancake watches posts from other fractional marketing firms and keeps the founders who engage.",
        watching: ["Oxlip Fractional", "Thistledown CMO"],
      },
    ],
  },

  faq: [
    {
      q: "Am I competing with full-time candidates?",
      a: "Often, yes. Pancake brings you the founder while the role is open. That’s when a part-time option gets a fair hearing.",
    },
    {
      q: "Does Pancake know which startups have no CMO?",
      a: "No. It can’t see an org chart. It sees marketing leadership job posts and founders posting about marketing, and each lead shows which one.",
    },
    {
      q: "Will the messages sound like me?",
      a: "Each message is written for that lead in the voice saved in your Brain, and you can edit that voice.",
    },
    {
      q: "Will other marketers who like my posts become leads?",
      a: "Not unless you sell to them. Pancake checks every lead against the buyers in your Brain, so peers don’t pass.",
    },
  ],

  related: ["consultants", "marketing-agencies", "fractional-cfos", "gtm-agencies"],

  cta: { title: "Be their marketing lead." },
};
