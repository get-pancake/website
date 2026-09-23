// lib/verticals/data/web-design-agencies.ts — web design agencies (merged: Webflow agencies, WordPress studios).
// Every person, company, rival studio, creator and workspace below is invented.
// Caveat (brief): never "companies still on Wix / Squarespace / an old WordPress site". Stack = tools named in
// job posts only; no site scanning. Most trial studios sell to local SMBs, so the page targets B2B buyers.
import type { VerticalConfig } from "../types";

export const webDesignAgencies: VerticalConfig = {
  slug: "web-design-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "web design agencies",
    title: "Web design agencies",
    short: "web studios",
    badge: "For web design agencies",
  },

  meta: { seoTitle: "Pancake for Web Design Agencies: Find Redesign Clients" },

  hubLine: "Find companies posting about a new site or hiring web roles.",

  hero: {
    title: "Find marketing heads scoping a website redesign.",
    lede: "Pancake scans LinkedIn posts and web design job posts, then names who owns the site. Win the rebuild before it goes in-house.",
  },

  workspace: { name: "Kernwell Studio", sender: "Malik Ostrander" },

  demo: {
    h2: "Their next site, your first message.",
    prompts: [
      {
        kind: "hiring",
        text: "We’re a Webflow studio. Find US B2B companies with 20 to 200 staff hiring a Webflow developer.",
        reply: "I’ll watch job posts for Webflow and web design roles at B2B firms that size.",
        proposal: [
          { kind: "hiring", items: ["Webflow developer", "Web designer", "Website manager"] },
          { kind: "stack", items: ["Webflow", "Framer"] },
          { kind: "keyword", items: ["website redesign"] },
          { kind: "competitor", items: ["Pixelmoor Studio"] },
        ],
        leads: [
          { name: "Joanna Kessler", role: "Head of Marketing", company: "Tillwright", kind: "hiring", signal: "Webflow developer role" },
          { name: "Bashir Sadeghi", role: "VP Marketing", company: "Lodgepole Labs", kind: "hiring", signal: "Web designer role" },
          { name: "Delphine Roux", role: "Brand Manager", company: "Quiltline", kind: "keyword", signal: "Posted on a redesign" },
          { name: "Evan Grabowski", role: "Growth Lead", company: "Cairnwell", kind: "stack", signal: "Webflow in job posts" },
          { name: "Mariana Esposito", role: "Marketing Lead", company: "Plinthly", kind: "competitor", signal: "Liked a Pixelmoor post" },
        ],
        featured: {
          why: "Joanna heads marketing at Tillwright, a 110-person US B2B software company with a Webflow developer role open.",
          confidence: 91,
          seniority: "Head",
        },
        message:
          "Hi Joanna, thanks for connecting. I run a web studio, so I’m forever looking at other companies’ sites. Which page on yours would you rebuild first?",
      },
      {
        kind: "keyword",
        text: "Find heads of marketing at US B2B firms with 10 to 100 staff posting about a website redesign.",
        reply: "I’ll watch posts about redesigns and site launches, and keep B2B marketing heads.",
        proposal: [
          { kind: "keyword", items: ["website redesign", "new website", "site migration"] },
          { kind: "influencer", items: ["Omar Ruskin"] },
          { kind: "hiring", items: ["Web developer"] },
        ],
        leads: [
          { name: "Ravi Chandrasekar", role: "VP Marketing", company: "Larkhaven", kind: "keyword", signal: "Posted about a new site" },
          { name: "Adeline Nkosi", role: "Founder & CEO", company: "Birchlight", kind: "keyword", signal: "Posted “new website”" },
          { name: "Wyatt Pennock", role: "Growth Marketer", company: "Lumkin", kind: "influencer", signal: "Liked a Ruskin post" },
          { name: "Leilani Nakoa", role: "Head of Marketing", company: "Greywick", kind: "hiring", signal: "Web developer role" },
          { name: "Simone Gallagher", role: "Brand Manager", company: "Vesperline", kind: "keyword", signal: "Posted on migration" },
        ],
        featured: {
          why: "Larkhaven is a 70-person US logistics software company. Ravi runs marketing and posted this week that the site lags the product.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Ravi, came across your post about Larkhaven’s site falling behind the product. What feels most out of date, the messaging or the design?",
      },
      {
        kind: "stack",
        text: "We rebuild sites in Webflow. Find US SaaS firms whose job posts mention WordPress.",
        reply: "I’ll find SaaS companies whose job posts name WordPress, like web or content roles.",
        proposal: [
          { kind: "stack", items: ["WordPress"] },
          { kind: "hiring", items: ["Website manager", "Web developer"] },
          { kind: "keyword", items: ["website migration"] },
        ],
        leads: [
          { name: "Terrence Akande", role: "VP Marketing", company: "Solvane", kind: "stack", signal: "WordPress in job posts" },
          { name: "Freya Gunderson", role: "Head of Content", company: "Oxlade", kind: "stack", signal: "WordPress in job posts" },
          { name: "Bennett Aguilar", role: "Marketing Ops Lead", company: "Cressline", kind: "hiring", signal: "Web developer role" },
          { name: "Farah Jaffery", role: "Marketing Lead", company: "Mirelight", kind: "hiring", signal: "Website manager role" },
          { name: "Cole Brannigan", role: "CEO", company: "Cobbleridge", kind: "keyword", signal: "Posted about migration" },
        ],
        featured: {
          why: "Solvane, a 130-person US SaaS company, has a web developer role open that names WordPress. Terrence runs marketing.",
          confidence: 83,
          seniority: "VP",
        },
        message:
          "Hi Terrence, happy to be connected. I rebuild websites, and who owns the site varies a lot between teams. Who updates yours day to day, marketing or engineering?",
      },
    ],
  },

  signals: {
    h2: "A web hire means a site project.",
    cards: [
      {
        kind: "hiring",
        title: "Companies hiring for the site",
        body: "A company hiring a Webflow developer is investing in its site, and Pancake finds who runs it.",
        watching: ["Webflow developer", "Web designer"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "Posts about a new website",
        body: "Pancake reads posts about redesigns and migrations, and keeps the founders and marketers in the thread.",
        watching: ["website redesign", "new website"],
        more: 1,
      },
      {
        kind: "stack",
        title: "The CMS in their job posts",
        body: "Pancake finds companies whose job posts name a site builder, from Webflow to WordPress.",
        watching: ["Webflow", "Framer", "WordPress"],
      },
      {
        kind: "competitor",
        title: "Engaged with rival studios",
        body: "When a marketer comments on a rival studio’s launch post, Pancake brings them to you.",
        watching: ["Pixelmoor Studio", "Halftone Web Co"],
      },
    ],
  },

  faq: [
    {
      q: "Can you find companies still on Wix or Squarespace?",
      a: "No. Stack sees only tools named in job posts, and small shops rarely post jobs.",
    },
    {
      q: "We build in Framer. Is this only for Webflow studios?",
      a: "No. Add Framer as a Stack tool and as a keyword, and Pancake looks for it in job posts and LinkedIn posts instead.",
    },
    {
      q: "Won’t a company hiring a Webflow developer build in-house?",
      a: "Some will. The post still shows the site is a priority now. Pitch the build while they hire, or support for the new developer.",
    },
    {
      q: "I white-label for other agencies. Can it find them?",
      a: "Yes. Name agencies as your buyers in your Brain, and Pancake keeps the agency staff it would otherwise drop.",
    },
  ],

  related: ["branding-agencies", "ux-design-agencies", "seo-agencies", "shopify-agencies"],

  cta: { title: "Own their site for good." },
};
