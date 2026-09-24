// lib/verticals/data/saas-startups.ts — /for/saas-startups (flagship, the generic software page).
// Merged in: B2B SaaS startups, vertical SaaS startups. Sub-verticals (fintech, HR tech, dev tools…)
// take the specific buyers; this page stays on support and customer success teams.
// Every person, company, rival product, influencer and workspace below is invented.
// Evidence: largest paying group (12 paying vertical/ops SaaS, 33 trial+, 43 signups).
// Caveat: every example names a concrete problem and buyer. Competitor = engagement with a rival's
// posts, never "their customers". No homepage marquee logos as proof.
import type { VerticalConfig } from "../types";

export const saasStartups: VerticalConfig = {
  slug: "saas-startups",
  status: "approved",
  category: "Startups & solo founders",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "SaaS startups",
    title: "SaaS startups",
    short: "SaaS founders",
    badge: "For SaaS startups",
  },

  meta: { seoTitle: "Pancake for SaaS Startups: Buyers Already Feeling the Pain" },

  hubLine: "Find buyers engaging with your competitors’ posts.",

  hero: {
    title: "Find buyers engaging with your competitors’ posts.",
    lede: "Pancake reads posts about the problem you solve, your rivals’ pages and job ads naming the tools you replace. Demos start warm.",
  },

  workspace: { name: "Nookline", sender: "Farida Oyebanji" },

  demo: {
    h2: "Start where your buyers already talk.",
    prompts: [
      {
        kind: "competitor",
        text: "Find heads of support at US companies with 50 to 500 people who engage with our rivals’ posts.",
        reply: "I’ll watch posts from your rivals’ company pages and keep heads of support.",
        proposal: [
          { kind: "competitor", items: ["Tixwell", "Ticketmoor"] },
          { kind: "keyword", items: ["ticket backlog", "first response time"] },
          { kind: "hiring", items: ["Support operations analyst"] },
          { kind: "influencer", items: ["Celestine Obuya"] },
        ],
        leads: [
          { name: "Jolene Kaczmarek", role: "Head of Support", company: "Pantrywell", kind: "competitor", signal: "Commented on a post" },
          { name: "Andrés Solórzano", role: "VP Support", company: "Stayloft", kind: "competitor", signal: "Liked a Ticketmoor post" },
          { name: "Kendra Bellamy", role: "Head of CX", company: "Petalpost", kind: "keyword", signal: "Ticket backlog post" },
          { name: "Vivek Anantharaman", role: "COO", company: "Tuckbox Meals", kind: "hiring", signal: "Support ops role open" },
          { name: "Colleen Mulcahy", role: "Support Director", company: "Kindlewick", kind: "influencer", signal: "Liked an Obuya post" },
        ],
        featured: {
          why: "Pantrywell is a 240-person US grocery delivery company. Jolene leads support and commented on a Tixwell post about ticket routing.",
          confidence: 89,
          seniority: "Head",
        },
        message:
          "Hi Jolene, I came across your comment on Tixwell’s post about ticket routing. What decides which rep gets a ticket at Pantrywell?",
      },
      {
        kind: "stack",
        text: "Our helpdesk replaces Zendesk. Find US companies with 50 to 500 people whose job posts name it.",
        reply: "I’ll watch US job posts that name Zendesk and find who runs support at each company.",
        proposal: [
          { kind: "stack", items: ["Zendesk", "Freshdesk"] },
          { kind: "hiring", items: ["Customer support specialist", "Support team lead"] },
          { kind: "keyword", items: ["helpdesk migration"] },
        ],
        leads: [
          { name: "Paz Lozoya", role: "Director of CX", company: "Cinchbox", kind: "stack", signal: "Zendesk in job posts" },
          { name: "Ronan Weatherby", role: "COO", company: "Burrowly", kind: "stack", signal: "Freshdesk in job posts" },
          { name: "Keiko Stanhope", role: "Support Manager", company: "Fernmoor", kind: "hiring", signal: "Support lead role open" },
          { name: "Emmett Szalai", role: "Head of Support", company: "Tavernly", kind: "hiring", signal: "3 support roles open" },
          { name: "Adwoa Frimpong", role: "Head of CX", company: "Larchmere", kind: "keyword", signal: "Helpdesk migration post" },
        ],
        featured: {
          why: "Cinchbox is a 180-person US e-commerce company whose support job posts name Zendesk. Paz runs customer experience there.",
          confidence: 87,
          seniority: "Director",
        },
        message:
          "Hi Paz, great to be connected. I work on helpdesk software. How many tickets does your team handle on a busy day?",
      },
      {
        kind: "keyword",
        text: "We sell customer onboarding software. Find US customer success leads posting about churn.",
        reply: "I’ll watch posts about churn and onboarding and keep customer success leaders.",
        proposal: [
          { kind: "keyword", items: ["churn", "customer onboarding", "time to value"] },
          { kind: "hiring", items: ["Implementation specialist", "Onboarding manager"] },
          { kind: "influencer", items: ["Ottilie Marchand"] },
        ],
        leads: [
          { name: "Nia Brathwaite", role: "VP Customer Success", company: "Ferrule", kind: "keyword", signal: "Posted about churn" },
          { name: "Brody Kessinger", role: "Head of CS", company: "Waypost", kind: "keyword", signal: "Posted on onboarding" },
          { name: "Rasmus Kjeldsen", role: "COO", company: "Kelvinly", kind: "hiring", signal: "Implementation role" },
          { name: "Lupita Carbajal", role: "Director of CS", company: "Datawren", kind: "hiring", signal: "Onboarding role open" },
          { name: "Garrison Tully", role: "Founder & CEO", company: "Bellcourt", kind: "influencer", signal: "Liked a Marchand post" },
        ],
        featured: {
          why: "Ferrule is a 120-person US B2B software company. Nia runs customer success and posted this week about churn in the first 90 days.",
          confidence: 91,
          seniority: "VP",
        },
        message:
          "Hi Nia, you wrote about churn in the first 90 days. What’s the first sign an account is about to stall?",
      },
    ],
  },

  signals: {
    h2: "Rivals’ posts draw your buyers.",
    cards: [
      {
        kind: "competitor",
        title: "Buyers watching your rivals",
        body: "Pancake keeps the buyers who like or comment on a competitor’s posts and shows you which post.",
        watching: ["Tixwell", "Ticketmoor"],
        more: 1,
      },
      {
        kind: "keyword",
        title: "Buyers naming the pain",
        body: "Team leads who post about churn or a ticket backlog show up with the post that surfaced them.",
        watching: ["churn", "ticket backlog", "tool sprawl"],
        more: 2,
      },
      {
        kind: "stack",
        title: "The old tool, in job posts",
        body: "Pancake finds companies whose support job posts ask for Zendesk or Intercom, then brings you the support lead.",
        watching: ["Zendesk", "Freshdesk", "Intercom"],
      },
      {
        kind: "hiring",
        title: "Support teams that are hiring",
        body: "Pancake reads job posts for support and onboarding roles, then finds the leader those hires report to.",
        watching: ["Support specialist", "CS manager"],
        more: 2,
      },
    ],
  },

  faq: [
    {
      q: "We have no website yet. Can we start?",
      a: "Yes. Describe what you’re building in two short sentences, and Pancake builds your Brain from it.",
    },
    {
      q: "We’re self-serve, not demo-led. Does that work?",
      a: "Yes. Set your campaign objective to “Share your app”. Leads who reply with interest get your signup link, not a booking link.",
    },
    {
      q: "Won’t I reach my competitor’s happy customers?",
      a: "Some, and they already know the category. Pancake sees who engages with a rival’s posts, not who pays it. Each lead shows its signal, so you can skip the loyal fans.",
    },
    {
      q: "Our buyers run small businesses. Will this work?",
      a: "It works when your buyers post and comment about their work. Many owners of small shops don’t, so leads there will be sparse.",
    },
  ],

  related: ["ai-startups", "developer-tools", "martech-startups", "solopreneurs", "fintech-startups"],

  cta: { title: "Your buyers are posting." },
};
