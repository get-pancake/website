// lib/verticals/data/shopify-agencies.ts — /for/shopify-agencies.
// Merged in: e-commerce agencies. Every person, brand, rival agency, influencer and workspace below is invented.
// Evidence: 3 trial+ (a Shopify/BigCommerce agency, a senior Shopify engineering shop, a Shopify studio), 0 paying.
// Caveat: never "every Shopify store" or store counts. Stack sees Shopify only through job posts,
// so solo and no-hire stores are invisible. "Shopify Plus" resolves in TheirStack's catalog
// (slug shopify-plus, checked 2026-09-22), as do Magento and BigCommerce.
import type { VerticalConfig } from "../types";

export const shopifyAgencies: VerticalConfig = {
  slug: "shopify-agencies",
  status: "approved",
  category: "Tech & build agencies",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "Shopify agencies",
    title: "Shopify agencies",
    short: "Shopify agencies",
    badge: "For Shopify agencies",
  },

  meta: { seoTitle: "Pancake for Shopify Agencies: Brands Hiring Shopify Devs" },

  hubLine: "Find brands whose job posts ask for Shopify help.",

  hero: {
    title: "Find brands whose job posts ask for Shopify Plus.",
    h1: ["You build on Shopify", "We bring you clients"],
    lede: "Pancake reads replatforming talk and developer openings, then names the head of e-commerce. You quote the build.",
  },

  workspace: { name: "Larkspire Commerce", sender: "Mina Oyelaran" },

  demo: {
    h2: "Your next build starts as a post.",
    prompts: [
      {
        kind: "stack",
        text: "We’re a Shopify Plus partner. Find US brands whose job posts mention Shopify Plus.",
        reply: "I’ll watch US job posts that name Shopify Plus and find who runs e-commerce.",
        proposal: [
          { kind: "stack", items: ["Shopify Plus", "Shopify"] },
          { kind: "hiring", items: ["Shopify developer", "E-commerce manager"] },
          { kind: "keyword", items: ["moving to Shopify Plus"] },
          { kind: "competitor", items: ["Brineworks Commerce"] },
        ],
        leads: [
          { name: "Camila Restrepo", role: "Head of E-commerce", company: "Tidelark", kind: "stack", signal: "Shopify in job posts" },
          { name: "Dominic Pellegrino", role: "Founder & CEO", company: "Saltbarrow", kind: "stack", signal: "Shopify in job posts" },
          { name: "Jada Covington", role: "E-commerce Director", company: "Brinely", kind: "hiring", signal: "Shopify developer role" },
          { name: "Hana Tomczak", role: "Head of Digital", company: "Goldwren", kind: "competitor", signal: "Liked a Brineworks post" },
          { name: "Rowan Aldridge", role: "VP E-commerce", company: "Cindercove", kind: "keyword", signal: "Posted on a Plus move" },
        ],
        featured: {
          why: "Tidelark is a 140-person US outdoor apparel brand. Two of its open job posts name Shopify Plus, and Camila leads e-commerce.",
          confidence: 90,
          seniority: "Head",
        },
        message:
          "Hi Camila, glad to connect. I build online stores, so checkouts are a bit of an obsession. Which store do you think has the best one?",
      },
      {
        kind: "hiring",
        text: "Find US brands with 20 to 200 staff hiring a Shopify developer. We do that work on retainer.",
        reply: "I’ll watch job posts for Shopify developers at US brands with 20 to 200 staff.",
        proposal: [
          { kind: "hiring", items: ["Shopify developer", "Shopify theme developer"] },
          { kind: "stack", items: ["Shopify"] },
          { kind: "influencer", items: ["Kit Ashdown", "Delia Pritchett"] },
        ],
        leads: [
          { name: "Priyanka Thakore", role: "Founder & CEO", company: "Hearthquill", kind: "hiring", signal: "Shopify dev role open" },
          { name: "Elliot Summerfield", role: "E-commerce Manager", company: "Larchly", kind: "hiring", signal: "Theme developer role" },
          { name: "Noor Bakhtiari", role: "Head of E-commerce", company: "Birchfold", kind: "stack", signal: "Shopify in job posts" },
          { name: "Wendell Prudhomme", role: "COO", company: "Fennerby", kind: "influencer", signal: "Liked an Ashdown post" },
          { name: "Leilani Mahoe", role: "Director of Digital", company: "Dewmarrow", kind: "influencer", signal: "Liked a Pritchett post" },
        ],
        featured: {
          why: "Hearthquill is a 45-person US home goods brand hiring a Shopify developer. Priyanka is the founder and CEO.",
          confidence: 88,
          seniority: "Founder",
        },
        message:
          "Hi Priyanka, thanks for accepting. Store development is what my team does all week, so I hear a lot of wish lists. If you could fix one thing on your store tomorrow, what would it be?",
      },
      {
        kind: "keyword",
        text: "Find US e-commerce managers posting about replatforming or conversion rate. We do both.",
        reply: "I’ll watch e-commerce posts about replatforming and conversion, plus who reacts.",
        proposal: [
          { kind: "keyword", items: ["replatforming", "conversion rate", "checkout speed"] },
          { kind: "stack", items: ["Magento", "BigCommerce"] },
          { kind: "competitor", items: ["Brasshold Studio"] },
        ],
        leads: [
          { name: "Sebastián Arroyo", role: "VP E-commerce", company: "Mossbright", kind: "keyword", signal: "Posted on replatforming" },
          { name: "Meredith Calder", role: "E-commerce Lead", company: "Sedgewren", kind: "keyword", signal: "Posted on conversion" },
          { name: "Anwar Mansour", role: "VP Digital", company: "Veldhaven", kind: "stack", signal: "Magento in job posts" },
          { name: "Sloane Tannenbaum", role: "CMO", company: "Larkfen", kind: "stack", signal: "Magento in job posts" },
          { name: "Joaquin Beltrán", role: "Founder", company: "Pinewhistle", kind: "competitor", signal: "Liked a Brasshold post" },
        ],
        featured: {
          why: "Mossbright is a 60-person US skincare brand. Sebastián leads e-commerce and posted this week about replatforming the store.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Sebastián, caught your post about replatforming Mossbright’s store. What’s pushing the move, cost or features?",
      },
    ],
  },

  signals: {
    h2: "Shopify job posts name the gap.",
    cards: [
      {
        kind: "hiring",
        title: "Brands hiring Shopify developers",
        body: "Pancake reads job posts for Shopify roles and brings you whoever runs e-commerce at the brand.",
        watching: ["Shopify developer", "Theme developer"],
        more: 3,
      },
      {
        kind: "stack",
        title: "Your platforms in job posts",
        body: "Pancake finds brands whose job posts name Shopify Plus, Magento or another platform you work with.",
        watching: ["Shopify Plus", "Shopify", "Magento", "BigCommerce"],
      },
      {
        kind: "keyword",
        title: "Posts about replatforming",
        body: "Pancake finds e-commerce managers posting about replatforming, checkout or site speed.",
        watching: ["replatforming", "site speed", "conversion rate"],
        more: 2,
      },
      {
        kind: "competitor",
        title: "Brands engaging with rivals",
        body: "People at brands who react to or comment on another Shopify partner’s posts become your leads.",
        watching: ["Brineworks Commerce", "Brasshold Studio"],
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake list every store on Shopify?",
      a: "No. Stack sees Shopify only when a brand’s job posts name it. Brands that never post jobs stay invisible to it.",
    },
    {
      q: "Will it find one-person stores?",
      a: "Rarely. A solo store seldom posts jobs or talks shop on LinkedIn, so Pancake has little to go on. Brands with a small team show up far more.",
    },
    {
      q: "Can it find brands on Magento or BigCommerce?",
      a: "Yes, when their job posts name the platform. Add it as a tool to watch, and Pancake brings you the brand’s e-commerce lead.",
    },
    {
      q: "Can outreach come from our agency page?",
      a: "No. It goes out from one person’s LinkedIn account, connected once. Your agency page still helps: people who engage with its posts become leads.",
    },
  ],

  related: ["web-design-agencies", "ppc-agencies", "retail-tech-startups", "marketing-agencies"],

  cta: { title: "Be their Plus partner." },
};
