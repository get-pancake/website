// lib/verticals/data/martech-startups.ts — martech startups (merged: adtech startups).
// Every person, company, rival platform, expert and workspace below is invented.
// Caveat (brief): no conversion or pipeline claims (the evidence customer reports volume
// without conversion). Stack = tools named in job posts.
import type { VerticalConfig } from "../types";

export const martechStartups: VerticalConfig = {
  slug: "martech-startups",
  status: "approved",
  category: "Startups & solo founders",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "martech startups",
    title: "Martech startups",
    short: "martech founders",
    badge: "For martech startups",
  },

  meta: { seoTitle: "Pancake for Martech Startups: Reach Marketing Ops Teams" },

  hubLine: "Find marketers hiring ops roles or posting about attribution.",

  hero: {
    title: "Find growth leads reacting to attribution experts.",
    h1: ["You sell to marketers", "We bring you customers"],
    lede: "Pancake reads marketing ops openings and job posts naming Marketo, then shows why each buyer fits. Pitch the switch.",
  },

  workspace: { name: "Adwhistle", sender: "Vivienne Okereke" },

  demo: {
    h2: "Pick the gap your tool closes.",
    prompts: [
      {
        kind: "hiring",
        text: "We automate ad reporting. Find US insurers and SaaS firms hiring marketing ops managers.",
        reply: "I’ll watch job posts for marketing ops roles at US insurers and SaaS firms.",
        proposal: [
          { kind: "hiring", items: ["Marketing ops manager", "Paid media analyst"] },
          { kind: "stack", items: ["Google Ads", "Meta Ads", "Looker Studio"] },
          { kind: "keyword", items: ["ad reporting", "weekly reporting"] },
        ],
        leads: [
          { name: "Lorraine Tuttle", role: "VP Marketing", company: "Brookhale", kind: "hiring", signal: "Marketing ops role" },
          { name: "Hamza Sheikh", role: "CMO", company: "Vantaloop", kind: "hiring", signal: "Paid media analyst role" },
          { name: "Maribel Arriola", role: "Head of Growth", company: "Tidelock", kind: "keyword", signal: "Posted on ad reporting" },
          { name: "Takeshi Ogura", role: "Paid Media Lead", company: "Plumwater", kind: "stack", signal: "Meta Ads in job posts" },
          { name: "Oluwaseun Adebisi", role: "VP Growth", company: "Larkhollow", kind: "hiring", signal: "Paid media role open" },
        ],
        featured: {
          why: "Brookhale, a 600-person US insurer, is hiring a marketing operations manager. Lorraine leads its marketing team.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Lorraine, appreciate the connect. We build software that automates ad reporting. How long does the weekly marketing report take your team?",
      },
      {
        kind: "stack",
        text: "We replace Marketo. Find US B2B companies whose marketing job posts still list it.",
        reply: "I’ll find US B2B companies whose job posts name Marketo and keep the marketing leads.",
        proposal: [
          { kind: "stack", items: ["Marketo", "Pardot"] },
          { kind: "keyword", items: ["marketing automation", "Marketo migration"] },
          { kind: "competitor", items: ["Funnelwick"] },
          { kind: "hiring", items: ["Marketing automation lead"] },
        ],
        leads: [
          { name: "Sabine Thorvaldsen", role: "Marketing Director", company: "Quelltide", kind: "stack", signal: "Marketo in job posts" },
          { name: "Darnell Swinton", role: "CMO", company: "Northwold", kind: "stack", signal: "Pardot in job posts" },
          { name: "Noemi Carrasco", role: "Demand Gen Lead", company: "Glassreed", kind: "keyword", signal: "Marketo migration post" },
          { name: "Crispin Yates", role: "VP Marketing", company: "Fairlock", kind: "competitor", signal: "Liked a Funnelwick post" },
          { name: "Ayesha Rangwala", role: "Growth Manager", company: "Merriton", kind: "hiring", signal: "Automation lead role" },
        ],
        featured: {
          why: "Quelltide, a 900-person US B2B software company, asks for Marketo in its marketing job posts. Sabine leads marketing there.",
          confidence: 87,
          seniority: "Director",
        },
        message:
          "Hi Sabine, good to connect. I work on marketing automation software. Which campaign takes your team the longest to build?",
      },
      {
        kind: "influencer",
        text: "We sell attribution software. Find US growth leads engaging with measurement experts.",
        reply: "I’ll watch who engages with measurement experts’ posts and keep US growth leads.",
        proposal: [
          { kind: "influencer", items: ["Vesna Dykstra", "Kwame Dunleavy"] },
          { kind: "keyword", items: ["attribution", "marketing mix modeling"] },
          { kind: "competitor", items: ["Tallyloop"] },
        ],
        leads: [
          { name: "Dashiell Crane", role: "Head of Growth", company: "Thimbleway", kind: "influencer", signal: "Commented on a post" },
          { name: "Zainab Olatunji", role: "Growth Lead", company: "Saltbrook", kind: "influencer", signal: "Liked a Dunleavy post" },
          { name: "Gustavo Pimentel", role: "VP Growth", company: "Sunmere", kind: "keyword", signal: "Posted on attribution" },
          { name: "Phoebe Lanning", role: "Analytics Lead", company: "Ospreyline", kind: "keyword", signal: "Posted about MMM" },
          { name: "Lamar Radcliffe", role: "CMO", company: "Canterbrook", kind: "competitor", signal: "Liked a Tallyloop post" },
        ],
        featured: {
          why: "Dashiell leads growth at Thimbleway, a 150-person US ecommerce software company. He commented on a Vesna Dykstra post about attribution.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Dashiell, you commented on Vesna Dykstra’s post about attribution. Which channel gets argued over most at Thimbleway?",
      },
    ],
  },

  signals: {
    h2: "Marketers post what’s broken.",
    cards: [
      {
        kind: "hiring",
        title: "Teams hiring marketing ops",
        body: "Open marketing ops and paid media roles lead you to the marketing head at that company.",
        watching: ["Marketing ops manager", "Paid media analyst"],
        more: 3,
      },
      {
        kind: "stack",
        title: "Marketo in the job post",
        body: "When a marketing job post asks for Marketo or Pardot experience, that company lands on your list.",
        watching: ["Marketo", "Pardot"],
        more: 1,
      },
      {
        kind: "keyword",
        title: "The attribution argument",
        body: "Marketers who write about broken attribution or reporting land in your queue, post attached.",
        watching: ["attribution", "first-party data", "marketing reporting"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Fans of attribution experts",
        body: "Pancake keeps the growth and ops leads who comment on or like posts from measurement experts.",
        watching: ["Vesna Dykstra", "Kwame Dunleavy"],
        more: 3,
      },
    ],
  },

  faq: [
    {
      q: "Marketers get pitched daily. How is this different?",
      a: "The connection request carries no pitch. When a marketer posted, or engaged with an expert’s post, the first message starts from it. Job-post leads get a message in your voice.",
    },
    {
      q: "Can you find agencies as well as brands?",
      a: "Yes. Tell Pancake you sell to agencies and it keeps them. Tell it you don’t, and it skips them.",
    },
    {
      q: "Can it find Marketo users who are unhappy?",
      a: "Only the ones who say so in public. Job posts show the tool. Their own posts show the pain.",
    },
    {
      q: "Will these leads turn into pipeline?",
      a: "Pancake finds the people and opens the conversation on LinkedIn. Your offer decides what converts. Every approval and rejection sharpens who it finds next.",
    },
  ],

  related: ["saas-startups", "ppc-agencies", "ai-startups", "revops-consultants"],

  cta: { title: "Marketing ops is hiring." },
};
