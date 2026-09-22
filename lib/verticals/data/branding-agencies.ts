// lib/verticals/data/branding-agencies.ts — /for/branding-agencies (merges creative agencies and design studios).
// Every person, company, rival studio, strategist and workspace below is invented.
// Brief caveat: the reference customer and its numbers stay internal (no names, quotes or
// percentages), and no funding-stage words ("seed", "Series A") in targeting.
// Keyword note: many "rebrand" posts are reveals of finished work, so the watched phrases lean
// to planning ("renaming", "brand refresh") and FAQ 3 says how to reject the reveals.
import type { VerticalConfig } from "../types";

export const brandingAgencies: VerticalConfig = {
  slug: "branding-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "branding agencies",
    title: "Branding agencies",
    short: "brand studios",
    badge: "For branding agencies",
  },

  meta: { seoTitle: "Pancake for Branding Agencies: Startups Due a Rebrand" },

  hubLine: "Find startup founders planning a rebrand.",

  hero: {
    h1: ["You build brands", "We bring you clients"],
    lede: "Pancake finds startup founders who post about a rebrand or hire a brand designer. You meet them mid-decision.",
  },

  workspace: { name: "Wenlock Studio", sender: "Margot Wenlock" },

  demo: {
    h2: "Meet the founder behind the rebrand.",
    prompts: [
      {
        kind: "keyword",
        text: "We're a brand studio. Find founders at US startups of 10 to 100 people posting about a rebrand.",
        reply: "I'll watch founders' posts about a rebrand or a new name at startups that size.",
        proposal: [
          { kind: "keyword", items: ["rebrand", "brand refresh", "renaming"] },
          { kind: "hiring", items: ["Brand designer", "Head of Brand"] },
          { kind: "competitor", items: ["Oxenford Studio", "Kerning Brand Co."] },
        ],
        leads: [
          { name: "Samir Bitar", role: "Co-founder & CEO", company: "Wexley", kind: "keyword", signal: "Posted about a rebrand" },
          { name: "Allison Tebbetts", role: "COO", company: "Stiltwise", kind: "keyword", signal: "Posted on brand refresh" },
          { name: "Jonah Whitcombe", role: "Head of Marketing", company: "Transom", kind: "hiring", signal: "Brand designer role" },
          { name: "Noemi Lamothe", role: "Founder", company: "Almsbury Health", kind: "competitor", signal: "Liked an Oxenford post" },
          { name: "Esteban Ocampo", role: "CEO", company: "Hexmoor", kind: "keyword", signal: "Posted about renaming" },
        ],
        featured: {
          why: "Wexley is a 45-person US software company. Samir is the CEO and posted this week that a rebrand is next.",
          confidence: 89,
          seniority: "Founder",
        },
        message:
          "Hi Samir, saw your post that a rebrand is next at Wexley. We do positioning and identity for software startups your size, and we start with the story before the logo. Worth 20 minutes while you scope it?",
      },
      {
        kind: "hiring",
        text: "Find US startups hiring a senior brand designer or art director. We build the brand they'll use.",
        reply: "I'll watch startup job posts for brand designers and art directors.",
        proposal: [
          { kind: "hiring", items: ["Brand designer", "Art director", "Creative director"] },
          { kind: "stack", items: ["Figma", "Adobe Illustrator"] },
          { kind: "keyword", items: ["brand identity", "visual identity"] },
        ],
        leads: [
          { name: "Paloma Iturbe", role: "VP Marketing", company: "Ashlock", kind: "hiring", signal: "Senior brand designer" },
          { name: "Trevor Oyama", role: "Co-founder", company: "Plumbago Labs", kind: "hiring", signal: "Art director role" },
          { name: "Zainab Holloway", role: "Head of Growth", company: "Loomwright", kind: "stack", signal: "Figma in job posts" },
          { name: "Fergus Moorcroft", role: "COO", company: "Sundry Freight", kind: "keyword", signal: "Posted on brand identity" },
          { name: "Rania Khoury", role: "CMO", company: "Tenpenny", kind: "hiring", signal: "Creative director role" },
        ],
        featured: {
          why: "Ashlock is a 70-person US fintech with a senior brand designer role open. Paloma leads marketing and owns that hire.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Paloma, saw Ashlock is hiring a senior brand designer. A new designer ramps faster with a finished identity system to build on. We build those for fintech teams your size, then hand them over. Worth a call before your hire starts?",
      },
      {
        kind: "influencer",
        text: "I run a design studio. Find COOs at US startups who engage with brand strategists' posts.",
        reply: "I'll watch the brand strategists you name and keep startup COOs who engage.",
        proposal: [
          { kind: "influencer", items: ["Maren Solberg", "Nell Ortega", "Rhys Calloway"] },
          { kind: "keyword", items: ["brand strategy", "positioning"] },
          { kind: "own_brand", items: ["Wenlock Studio", "Margot Wenlock"] },
        ],
        leads: [
          { name: "Adwoa Quaye", role: "COO", company: "Mullion", kind: "influencer", signal: "Commented on Solberg" },
          { name: "Ambrose Keane", role: "COO", company: "Joinery Labs", kind: "influencer", signal: "Liked a Nell Ortega post" },
          { name: "Lucía Arredondo", role: "Head of Brand", company: "Mudlark Labs", kind: "keyword", signal: "Posted on positioning" },
          { name: "Thao Dinh", role: "CEO", company: "Quaddle", kind: "own_brand", signal: "Liked your case study" },
          { name: "Anneliese Vorhees", role: "COO", company: "Rookwell Robotics", kind: "influencer", signal: "Liked a Solberg post" },
        ],
        featured: {
          why: "Mullion is a 60-person US software company. Adwoa is COO and commented on a Maren Solberg post about brand strategy.",
          confidence: 84,
          seniority: "C-level",
        },
        message:
          "Hi Adwoa, saw your comment on Maren Solberg's post about brand strategy. We do strategy and identity for software startups your size, from positioning to the design system. Is a rebrand anywhere on Mullion's roadmap?",
      },
    ],
  },

  signals: {
    h2: "Founders post before they brief.",
    cards: [
      {
        kind: "keyword",
        title: "Founders planning a rebrand",
        body: "Pancake finds founders posting about a rebrand or a new name, and brings you the post.",
        watching: ["rebrand", "brand refresh", "renaming"],
        more: 4,
      },
      {
        kind: "hiring",
        title: "Startups hiring brand roles",
        body: "A brand designer or creative director job post shows a startup putting money into its brand.",
        watching: ["Brand designer", "Art director", "Creative director"],
      },
      {
        kind: "own_brand",
        title: "People who like your work",
        body: "Founders who react to case studies on your studio page or your own profile become leads.",
        watching: ["Wenlock Studio", "Margot Wenlock"],
      },
      {
        kind: "competitor",
        title: "Founders eyeing other studios",
        body: "A founder commenting on another studio's case study lands in your leads, post attached.",
        watching: ["Oxenford Studio", "Kerning Brand Co."],
      },
    ],
  },

  faq: [
    {
      q: "My work sells on the portfolio. Why outreach?",
      a: "Pancake starts the conversation on LinkedIn. A positive reply gets your booking link, and the portfolio comes to the call.",
    },
    {
      q: "Can it find startups whose brand looks dated?",
      a: "No. Pancake doesn't judge brands. It finds founders who post about a rebrand or hire for one.",
    },
    {
      q: "What if they already rebranded, or hired a studio?",
      a: "Reject the lead and add a reason, like “already rebranded”. Every rejection teaches your Brain who to skip.",
    },
  ],

  related: ["ux-design-agencies", "web-design-agencies", "video-production-companies", "marketing-agencies"],

  cta: { title: "Brand the next startup." },
};
