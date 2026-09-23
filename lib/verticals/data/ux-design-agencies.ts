// lib/verticals/data/ux-design-agencies.ts — /for/ux-design-agencies.
// Every person, company, rival studio, design voice and workspace below is invented.
// Brief caveat: Pancake can't judge a product's UX or read its analytics. Claims stay on what
// product leaders post and the roles they hire for.
import type { VerticalConfig } from "../types";

export const uxDesignAgencies: VerticalConfig = {
  slug: "ux-design-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "UX design agencies",
    title: "UX design agencies",
    short: "UX studios",
    badge: "For UX design agencies",
  },

  meta: { seoTitle: "Pancake for UX Design Agencies: SaaS Redesign Clients" },

  hubLine: "Find SaaS teams posting about onboarding or hiring designers.",

  hero: {
    title: "Find product leaders posting about onboarding drop-off.",
    h1: ["You design products", "We bring you clients"],
    lede: "Activation threads and designer openings, not a stale database. Every morning, a SaaS team to pitch while the pain is fresh.",
  },

  workspace: { name: "Pembrook Studio", sender: "Rowan Pembrook" },

  demo: {
    h2: "Find the team behind the drop-off.",
    prompts: [
      {
        kind: "hiring",
        text: "We’re a UX studio. Find US SaaS companies of 30 to 300 people hiring product designers.",
        reply: "I’ll watch SaaS job posts for product and UX designers at companies that size.",
        proposal: [
          { kind: "hiring", items: ["Senior product designer", "UX designer", "Design lead"] },
          { kind: "stack", items: ["Maze", "Hotjar"] },
          { kind: "keyword", items: ["design debt", "design system"] },
        ],
        leads: [
          { name: "Sana Lakhani", role: "VP Product", company: "Sheerline", kind: "hiring", signal: "Product designer role" },
          { name: "Nate Eriksrud", role: "Head of Design", company: "Tenterhook", kind: "hiring", signal: "UX designer role" },
          { name: "Adaeze Nwachukwu", role: "CPO", company: "Mendwell Health", kind: "stack", signal: "Maze in job posts" },
          { name: "Marek Zielinski", role: "CTO", company: "Rotaloom", kind: "keyword", signal: "Posted on design debt" },
          { name: "Soledad Urquidi", role: "Head of Product", company: "Keystave", kind: "hiring", signal: "Design lead role" },
        ],
        featured: {
          why: "Sheerline is a 120-person US SaaS company with a senior product designer role open. Sana runs product and owns that hire.",
          confidence: 92,
          seniority: "VP",
        },
        message:
          "Hi Sana, good to be connected. We’re a UX studio, and onboarding is the flow we study most. Which product do you think gets it right?",
      },
      {
        kind: "keyword",
        text: "I run a UX studio. Find US heads of product posting about onboarding drop-off or activation.",
        reply: "I’ll watch product leaders’ posts about drop-off and activation at software companies.",
        proposal: [
          { kind: "keyword", items: ["onboarding drop-off", "activation rate", "time to value"] },
          { kind: "stack", items: ["Amplitude", "Pendo"] },
          { kind: "influencer", items: ["Vera Lund", "Anouk Brandsma"] },
        ],
        leads: [
          { name: "Maeve Donnelly", role: "Head of Product", company: "Wayfold", kind: "keyword", signal: "Posted about drop-off" },
          { name: "Chidi Ekwueme", role: "VP Product", company: "Loamcast", kind: "keyword", signal: "Posted on activation" },
          { name: "Solveig Lindqvist", role: "Product Director", company: "Bellwort", kind: "stack", signal: "Pendo in job posts" },
          { name: "Rajiv Subramani", role: "CPO", company: "Siskin Cloud", kind: "influencer", signal: "Liked a Lund post" },
          { name: "Tessa Marchbanks", role: "Head of Growth", company: "Hatchwick", kind: "keyword", signal: "Posted on time to value" },
        ],
        featured: {
          why: "Wayfold is a 90-person US SaaS company. Maeve leads product and posted this week about users dropping off in onboarding.",
          confidence: 90,
          seniority: "Head",
        },
        message:
          "Hi Maeve, caught your post about users dropping off in Wayfold’s onboarding. Which step loses the most people?",
      },
      {
        kind: "competitor",
        text: "We only do B2B SaaS. Find US product leaders engaging with rival design studios’ posts.",
        reply: "I’ll track who engages with rival studios’ posts and keep product leaders at B2B SaaS.",
        proposal: [
          { kind: "competitor", items: ["Crosshatch UX", "Gouache Studio"] },
          { kind: "hiring", items: ["Product designer", "UX researcher"] },
          { kind: "keyword", items: ["dashboard redesign", "user research"] },
        ],
        leads: [
          { name: "Pieter Achterberg", role: "CPO", company: "Beamline", kind: "competitor", signal: "Liked a Crosshatch post" },
          { name: "Ifeoma Ebube", role: "VP Product", company: "Bunting Labs", kind: "competitor", signal: "Commented on a post" },
          { name: "Ander Irigoyen", role: "Head of Design", company: "Oakhurst Cloud", kind: "hiring", signal: "UX researcher role" },
          { name: "Emiko Morimoto", role: "Head of Product", company: "Spokewise", kind: "keyword", signal: "Posted on a redesign" },
          { name: "Carter Blakely", role: "CTO", company: "Velvetrun", kind: "competitor", signal: "Liked a Gouache post" },
        ],
        featured: {
          why: "Beamline is a 150-person US B2B SaaS company. Pieter runs product and liked a Crosshatch UX post on dashboard redesigns.",
          confidence: 86,
          seniority: "C-level",
        },
        message:
          "Hi Pieter, noticed you liked a post about dashboard redesigns. What do your users ask for most in Beamline’s dashboard?",
      },
    ],
  },

  signals: {
    h2: "Onboarding pain gets posted.",
    cards: [
      {
        kind: "keyword",
        title: "Leaders posting about drop-off",
        body: "Pancake reads posts about stalled activation or clunky onboarding and keeps the product leaders behind them.",
        watching: ["onboarding drop-off", "time to value"],
        more: 4,
      },
      {
        kind: "hiring",
        title: "Teams hiring designers",
        body: "A product designer or UX researcher job post shows more design work than the team can cover.",
        watching: ["Product designer", "UX researcher", "Design lead"],
      },
      {
        kind: "stack",
        title: "Product tools in job posts",
        body: "Pancake finds SaaS companies whose job posts name Maze, Amplitude or Pendo.",
        watching: ["Maze", "Amplitude", "Pendo"],
      },
      {
        kind: "influencer",
        title: "Leaders engaging with UX voices",
        body: "Product leaders who engage with the designers and researchers in your Brain become leads.",
        watching: ["Vera Lund", "Anouk Brandsma"],
      },
    ],
  },

  faq: [
    {
      q: "Can it see which apps have bad UX?",
      a: "No. Pancake reads what product leaders post and the roles they hire for. It never grades a product’s design.",
    },
    {
      q: "We book up for months. Can we stop outreach?",
      a: "Yes. Pause the campaign when the studio is full and resume it when you have room.",
    },
    {
      q: "Our projects start at $50k. Can it skip tiny teams?",
      a: "Yes. Set a company size in your Brain, and Pancake checks every lead against it.",
    },
    {
      q: "Will it find teams that already have designers?",
      a: "Yes, when they fit your Brain. A team hiring a designer often needs help while the seat is open. Reject any lead you’d skip.",
    },
  ],

  related: ["branding-agencies", "web-design-agencies", "software-development-agencies", "saas-startups"],

  cta: { title: "Fix their onboarding." },
};
