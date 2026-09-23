// lib/verticals/data/ai-startups.ts — /for/ai-startups.
// AI products that take over a team's manual work (order desks, claims, document processing).
// AI infra and dev tools live on /for/developer-tools.
// Every person, company, legacy vendor, influencer and workspace below is invented.
// Evidence: paying (order-processing AI for distributors, AI qualitative research, legal-workflow AI,
// plus 3 AI-infra/dev-tool payers).
// Caveat: "AI" belongs to the reader's product, never to Pancake. No "AI" in the H1 (D2).
import type { VerticalConfig } from "../types";

export const aiStartups: VerticalConfig = {
  slug: "ai-startups",
  status: "approved",
  category: "Startups & solo founders",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "AI startups",
    title: "AI startups",
    short: "AI founders",
    badge: "For AI startups",
  },

  meta: { seoTitle: "Pancake for AI Startups: Teams Hiring for Manual Work" },

  hubLine: "Find teams hiring for the work your product automates.",

  hero: {
    title: "Find COOs posting a job your product already does.",
    lede: "Pancake reads threads on manual data entry, Kofax in hiring ads and your rival’s fans. Every lead brings a reason to pilot.",
  },

  workspace: { name: "Parselane", sender: "Zainab Mirza" },

  demo: {
    h2: "Find the team doing it by hand.",
    prompts: [
      {
        kind: "hiring",
        text: "Our AI processes purchase orders. Find US distributors hiring order entry specialists.",
        reply: "I’ll watch order entry job posts at US distributors and find who runs operations.",
        proposal: [
          { kind: "hiring", items: ["Order entry specialist", "Order processing clerk"] },
          { kind: "keyword", items: ["manual order entry", "PO processing"] },
          { kind: "stack", items: ["Prophet 21", "NetSuite"] },
        ],
        leads: [
          { name: "Damilare Adesanmi", role: "COO", company: "Bramlett Supply", kind: "hiring", signal: "2 order entry roles open" },
          { name: "Consuelo Barrientos", role: "VP Operations", company: "Kittering", kind: "hiring", signal: "Order clerk role open" },
          { name: "Russell Nakagawa", role: "Operations Director", company: "Hallock", kind: "keyword", signal: "Posted on manual entry" },
          { name: "Terrell Wofford", role: "CFO", company: "Oakum Supply", kind: "stack", signal: "Prophet 21 in job posts" },
          { name: "Latrice Gaskins", role: "President", company: "Farrier Supply", kind: "stack", signal: "NetSuite in job posts" },
        ],
        featured: {
          why: "Bramlett Supply is a 180-person US industrial distributor with two order entry roles open. Damilare is the COO and runs operations.",
          confidence: 90,
          seniority: "C-level",
        },
        message:
          "Hi Damilare, I work on software that reads purchase orders in whatever format they arrive. How do orders get into your system today?",
      },
      {
        kind: "keyword",
        text: "Find claims leaders at US insurers posting about AI pilots. Our product reads claim files.",
        reply: "I’ll watch posts about AI in claims and keep claims leaders at US insurers.",
        proposal: [
          { kind: "keyword", items: ["AI in claims", "claims backlog", "AI pilot"] },
          { kind: "hiring", items: ["Claims processor", "Claims examiner"] },
          { kind: "influencer", items: ["Leland Draycott"] },
        ],
        leads: [
          { name: "Madhuri Iyer", role: "VP Claims", company: "Grayhaven Mutual", kind: "keyword", signal: "Posted on AI pilots" },
          { name: "Jonas Pelletier", role: "Claims Director", company: "Northmere", kind: "keyword", signal: "Claims backlog post" },
          { name: "Hye-jin Seo", role: "COO", company: "Juneberry Insurance", kind: "hiring", signal: "Claims examiner role" },
          { name: "Siobhan Carvell", role: "Head of Claims", company: "Stillbrook", kind: "influencer", signal: "Liked a Draycott post" },
          { name: "Efraín Montalvo", role: "Claims Manager", company: "Otterbay", kind: "hiring", signal: "Claims processor roles" },
        ],
        featured: {
          why: "Grayhaven Mutual is a 900-person US property insurer. Madhuri leads claims and posted this week about running an AI pilot.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Madhuri, I read your post about running an AI pilot in claims at Grayhaven. Which part of the claim file did you start with?",
      },
      {
        kind: "competitor",
        text: "We replace Scanlith’s document capture. Find US ops leaders who engage with Scanlith’s posts.",
        reply: "I’ll watch Scanlith’s company page and keep ops leaders who react or comment.",
        proposal: [
          { kind: "competitor", items: ["Scanlith Systems", "Formcrest"] },
          { kind: "stack", items: ["Kofax", "UiPath"] },
          { kind: "keyword", items: ["manual data entry", "document processing"] },
        ],
        leads: [
          { name: "Marta Engebretsen", role: "VP Operations", company: "Lorwick", kind: "competitor", signal: "Commented on a post" },
          { name: "Reggie Whitsett", role: "COO", company: "Wickersham Foods", kind: "competitor", signal: "Liked a Scanlith post" },
          { name: "Duncan Arbuthnot", role: "VP Finance", company: "Tellico", kind: "stack", signal: "Kofax in job posts" },
          { name: "Latoya Brisbin", role: "Automation Lead", company: "Quarrow", kind: "stack", signal: "UiPath in job posts" },
          { name: "Paulina Wróbel", role: "Controller", company: "Fenmore Paper", kind: "keyword", signal: "Posted on data entry" },
        ],
        featured: {
          why: "Lorwick is a 300-person US freight company. Marta runs operations and commented on a Scanlith Systems post about document capture.",
          confidence: 85,
          seniority: "VP",
        },
        message:
          "Hi Marta, I saw your comment on Scanlith’s post about document capture. Which documents still get keyed in by hand on your side?",
      },
    ],
  },

  signals: {
    h2: "Busywork has a job title.",
    cards: [
      {
        kind: "hiring",
        title: "Teams hiring for manual work",
        body: "Pancake reads job posts for the manual roles your product covers, then finds the leader who owns that team.",
        watching: ["Order entry clerk", "Claims processor"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "Leaders piloting AI in public",
        body: "Claims, ops and finance people who post about pilots and backlogs become your leads.",
        watching: ["AI pilot", "manual data entry", "claims backlog"],
      },
      {
        kind: "competitor",
        title: "The vendor you replace",
        body: "Pancake keeps the ops leaders who comment on or like the incumbent vendor’s company posts.",
        watching: ["Scanlith Systems", "Formcrest"],
      },
      {
        kind: "stack",
        title: "Legacy tools in job posts",
        body: "Pancake finds companies whose job posts still ask for the capture and automation tools you replace.",
        watching: ["Kofax", "UiPath", "ABBYY"],
      },
    ],
  },

  faq: [
    {
      q: "Buyers are wary of AI claims. What do messages say?",
      a: "They start from the lead’s own post or comment when there is one. The rest comes from your Brain, so put hard proof there, like accuracy on real files.",
    },
    {
      q: "Can it find teams piloting a rival AI tool?",
      a: "Not directly. Pancake can’t see who runs a pilot. It finds people who engage with a rival’s posts, so add the rival as a competitor in your Brain.",
    },
    {
      q: "Should I target the budget holder or the evaluator?",
      a: "Both. Add each as a persona in your Brain, and Pancake checks every lead against them.",
    },
    {
      q: "Can it find companies with a fresh AI budget?",
      a: "No. There is no funding or budget signal. Pancake finds teams hiring for manual work and leaders posting about AI pilots.",
    },
  ],

  related: ["saas-startups", "developer-tools", "ai-automation-agencies", "industrial-tech-startups", "solopreneurs"],

  cta: { title: "Busywork is still hiring." },
};
