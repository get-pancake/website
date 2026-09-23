// lib/verticals/data/retail-tech-startups.ts — /for/retail-tech-startups.
// Buyers: heads of e-commerce, insights and digital at consumer brands and retailers.
// Prompts map to the evidence: shopper research sold to insights teams (paying), product-data
// checks sold to e-commerce teams (design partner), plus a returns tool for apparel brands.
// Caveat (brief): no marketplace, POS or sales data. Consumer brands are the buyers here, never
// consumers. Every person, company, rival vendor, influencer and workspace below is invented;
// Salsify, Akeneo and Syndigo are real PIM tools named in job posts (Stack signal).
import type { VerticalConfig } from "../types";

export const retailTechStartups: VerticalConfig = {
  slug: "retail-tech-startups",
  status: "approved",
  category: "Vertical software",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "retail tech startups",
    title: "Retail tech startups",
    short: "retail tech founders",
    badge: "For retail tech startups",
  },

  meta: { seoTitle: "Pancake for Retail Tech Startups: Brand and Retail Buyers" },

  hubLine: "Find e-commerce and insights leaders at consumer brands.",

  hero: {
    title: "Find e-commerce heads venting about apparel returns.",
    h1: ["You help brands sell", "We bring you customers"],
    lede: "Insights openings, Salsify or Akeneo in job posts and comments on your page. The buyer arrives by breakfast.",
  },

  workspace: { name: "Endaisle", sender: "Esteban Cordero" },

  demo: {
    h2: "Find who owns the shelf.",
    prompts: [
      {
        kind: "hiring",
        text: "We run shopper research for brands. Find US brands hiring consumer insights managers.",
        reply: "I’ll watch insights job posts at US consumer brands and skip agency listings.",
        proposal: [
          { kind: "hiring", items: ["Consumer insights manager", "Shopper insights analyst"] },
          { kind: "keyword", items: ["consumer insights", "shopper research"] },
          { kind: "competitor", items: ["Panelwise Research"] },
        ],
        leads: [
          { name: "Whitney Caldwell", role: "VP Insights", company: "Toastwell", kind: "hiring", signal: "Insights manager role" },
          { name: "Grant Ellingson", role: "Head of Insights", company: "Dalbey Foods", kind: "hiring", signal: "Shopper insights role" },
          { name: "Jae-won Hwang", role: "Brand Director", company: "Moxie Mill", kind: "keyword", signal: "Posted about research" },
          { name: "Rochelle Dumas", role: "CMO", company: "Lunetta Beauty", kind: "competitor", signal: "Liked a Panelwise post" },
          { name: "Colby Rasmussen", role: "Insights Lead", company: "Wagley Pet Co", kind: "hiring", signal: "Insights analyst role" },
        ],
        featured: {
          why: "Toastwell is a 600-person US snack brand hiring a consumer insights manager. Whitney leads insights and owns that hire.",
          confidence: 91,
          seniority: "VP",
        },
        message:
          "Hi Whitney, nice to be connected. We run shopper research, usually one-on-one interviews. What would you most like to learn about your shoppers?",
      },
      {
        kind: "stack",
        text: "We check product data. Find US consumer brands whose job posts name Salsify or Akeneo.",
        reply: "I’ll watch brand job posts that name Salsify or Akeneo and find who owns product data.",
        proposal: [
          { kind: "stack", items: ["Salsify", "Akeneo"] },
          { kind: "hiring", items: ["Product data specialist", "PIM manager"] },
          { kind: "keyword", items: ["product content", "listing errors"] },
        ],
        leads: [
          { name: "Aditi Deshmukh", role: "VP E-commerce", company: "Brisa Home", kind: "stack", signal: "Salsify in job posts" },
          { name: "Brett Kinsolving", role: "VP Digital", company: "Bittern Outdoor", kind: "stack", signal: "Akeneo in job posts" },
          { name: "Halina Wozniak", role: "Catalog Manager", company: "Galena Tools", kind: "hiring", signal: "Product data role open" },
          { name: "Kainoa Kahananui", role: "Brand Manager", company: "Tidehollow", kind: "keyword", signal: "Posted about listings" },
          { name: "Itzel Saucedo", role: "Digital Director", company: "Mirasol Skin", kind: "hiring", signal: "PIM manager role open" },
        ],
        featured: {
          why: "Brisa Home is a 450-person US housewares brand. Its product data job posts name Salsify, and Aditi runs e-commerce.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Aditi, happy to be connected. We build software that catches errors in product listings. How do bad listings usually come to your attention?",
      },
      {
        kind: "keyword",
        text: "Our fit tool cuts apparel returns. Find US heads of e-commerce posting about returns.",
        reply: "I’ll watch posts about returns and sizing from e-commerce leaders at US apparel brands.",
        proposal: [
          { kind: "keyword", items: ["apparel returns", "sizing issues", "return costs"] },
          { kind: "influencer", items: ["Marisa Quenneville"] },
          { kind: "hiring", items: ["Returns analyst", "E-commerce analyst"] },
        ],
        leads: [
          { name: "Simone Laurent", role: "VP E-commerce", company: "Heddle & Twill", kind: "keyword", signal: "Posted about returns" },
          { name: "Spencer Hollingsworth", role: "Head of Digital", company: "Stitchwell", kind: "keyword", signal: "Posted on return costs" },
          { name: "Layla Haddad", role: "Director of CX", company: "Solenne", kind: "influencer", signal: "Liked a Quenneville post" },
          { name: "Mallory Finch", role: "Head of DTC", company: "Bobbin & Hem", kind: "hiring", signal: "Returns analyst role" },
          { name: "Olufemi Bankole", role: "COO", company: "Marigold Knit", kind: "keyword", signal: "Posted about sizing" },
        ],
        featured: {
          why: "Heddle & Twill is a 300-person US apparel brand. Simone runs e-commerce and posted about return costs this week.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Simone, I noticed your post about return costs at Heddle & Twill. What’s the most common reason customers send things back?",
      },
    ],
  },

  signals: {
    h2: "Brand teams hire for their gaps.",
    cards: [
      {
        kind: "hiring",
        title: "Brands hiring insights roles",
        body: "Pancake keeps job posts from the brand itself and drops the ones recruiters post for clients.",
        watching: ["Insights manager", "Product data analyst"],
        more: 3,
      },
      {
        kind: "stack",
        title: "PIM tools named in job posts",
        body: "Pancake flags brands whose job posts ask for the PIM your product checks or feeds.",
        watching: ["Salsify", "Akeneo", "Syndigo"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "Brand leaders posting on returns",
        body: "When an e-commerce lead posts about return costs or listing errors, you get the post and the person.",
        watching: ["return costs", "product data", "shopper research"],
        more: 2,
      },
      {
        kind: "own_brand",
        title: "Your posts pull in brands",
        body: "Insights and e-commerce people who react to or comment on your company or founder posts become leads.",
        watching: ["Endaisle", "Esteban Cordero"],
      },
    ],
  },

  faq: [
    {
      q: "Can it reach store managers?",
      a: "Only if you pick them as buyers. Leads are judged against the roles in your Brain, like VP E-commerce or Head of Insights.",
    },
    {
      q: "Do you track which brands sell on Amazon?",
      a: "No. Marketplace, sales and POS data are out of reach. Pancake works from LinkedIn posts and job posts.",
    },
    {
      q: "Will it find shoppers for our research panels?",
      a: "No. Pancake finds the brand teams that buy your product. It never finds consumers.",
    },
    {
      q: "Can it find small DTC brands?",
      a: "Yes, when their team posts on LinkedIn or opens roles. Brands under 50 people show up less often than bigger ones.",
    },
  ],

  related: ["shopify-agencies", "logistics-tech-startups", "martech-startups", "saas-startups"],

  cta: { title: "Get to the brand first." },
};
