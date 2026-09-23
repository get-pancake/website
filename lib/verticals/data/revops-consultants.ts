// lib/verticals/data/revops-consultants.ts
// Every person, company, rival firm, practitioner and workspace below is invented.
// Merged in: HubSpot partner agencies and Salesforce consultants (same buyers, same Stack hook).
// Caveat (brief): Stack only sees CRMs named in job posts. Always "job posts name HubSpot",
// never "companies using HubSpot". No CRM sync.
import type { VerticalConfig } from "../types";

export const revopsConsultants: VerticalConfig = {
  slug: "revops-consultants",
  status: "approved",
  category: "Sales, GTM & recruiting",
  evidence: "seo-bet",
  updated: "2026-09-22",

  name: {
    plural: "RevOps consultants",
    title: "RevOps consultants",
    short: "RevOps consultants",
    badge: "For RevOps consultants",
  },

  meta: { seoTitle: "Pancake for RevOps Consultants: Find CRM Clients" },

  hubLine: "Find companies whose job posts name your CRM.",

  hero: {
    title: "Find sales leaders explaining a missed forecast.",
    h1: ["You fix the CRM", "We bring you clients"],
    lede: "Salesforce admin openings and HubSpot in job posts, not a stale contact list. Scope the cleanup before the new admin starts.",
  },

  workspace: { name: "Ledgewood RevOps", sender: "Anita Ferencz" },

  demo: {
    h2: "Find sales teams outgrowing their CRM.",
    prompts: [
      {
        kind: "stack",
        text: "I’m a HubSpot partner. Find US companies of 50 to 300 people whose job posts name HubSpot.",
        reply: "I’ll match HubSpot job posts to the sales or RevOps leader at each company.",
        proposal: [
          { kind: "stack", items: ["HubSpot"] },
          { kind: "hiring", items: ["HubSpot administrator", "Marketing operations manager"] },
          { kind: "keyword", items: ["HubSpot migration", "lead routing"] },
          { kind: "competitor", items: ["Ironbark RevOps"] },
        ],
        leads: [
          { name: "Gretchen Albrecht", role: "VP Sales", company: "Wainsford Supply", kind: "stack", signal: "HubSpot in job posts" },
          { name: "Omar Tahboub", role: "Head of RevOps", company: "Quoinbridge", kind: "keyword", signal: "Posted on HubSpot" },
          { name: "Felicia Sandoval", role: "Head of Marketing", company: "Newelstone", kind: "hiring", signal: "HubSpot admin role" },
          { name: "Declan Moreau", role: "COO", company: "Scupper Freight", kind: "keyword", signal: "Posted on lead routing" },
          { name: "Sunita Rao", role: "CRO", company: "Corbelworks", kind: "competitor", signal: "Liked an Ironbark post" },
        ],
        featured: {
          why: "Wainsford Supply is a 140-person US B2B company. Its open sales roles name HubSpot, and Gretchen runs the sales team.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Gretchen, nice to connect. I help sales teams set up their CRM, and every team reads its pipeline differently. Which report do you look at first on Monday?",
      },
      {
        kind: "hiring",
        text: "I fix Salesforce orgs. Find US B2B companies of 100 to 500 people hiring a Salesforce admin.",
        reply: "I’ll watch job posts for Salesforce admin roles and find the VP Sales or COO.",
        proposal: [
          { kind: "hiring", items: ["Salesforce administrator", "Sales operations analyst"] },
          { kind: "stack", items: ["Salesforce", "Gong"] },
          { kind: "keyword", items: ["Salesforce cleanup", "forecast calls"] },
        ],
        leads: [
          { name: "Terrence Whitaker", role: "VP Sales", company: "Tackline", kind: "hiring", signal: "Salesforce admin role" },
          { name: "Ngozi Amadi", role: "COO", company: "Thwartwise", kind: "hiring", signal: "Sales ops analyst role" },
          { name: "Kristen Vollmer", role: "Sales Ops Director", company: "Kedgeline", kind: "stack", signal: "Gong in job posts" },
          { name: "Luis Echeverria", role: "CRO", company: "Stayward", kind: "keyword", signal: "Posted on forecast calls" },
          { name: "Abigail Thorne", role: "Head of RevOps", company: "Mizzenhall", kind: "stack", signal: "Salesforce in job posts" },
        ],
        featured: {
          why: "Tackline, a 230-person US logistics software company, posted a Salesforce administrator role. Terrence leads sales, the team the role supports.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Terrence, thanks for the connection. I spend my days untangling messy CRM setups. Which field in yours does nobody trust?",
      },
      {
        kind: "keyword",
        text: "Find US sales leaders posting about forecast accuracy or a CRM migration. I scope both.",
        reply: "I’ll watch sales leaders’ posts on forecasting or CRM moves and attach each post.",
        proposal: [
          { kind: "keyword", items: ["forecast accuracy", "CRM migration", "pipeline hygiene"] },
          { kind: "influencer", items: ["Imogen Oakes"] },
          { kind: "hiring", items: ["Revenue operations manager"] },
        ],
        leads: [
          { name: "Bianca Morales", role: "VP Sales", company: "Brailwick", kind: "keyword", signal: "Posted on forecasting" },
          { name: "Hamid Karimi", role: "CRO", company: "Sheave Data", kind: "keyword", signal: "Posted on a CRM move" },
          { name: "Joanna Pruitt", role: "Head of Sales", company: "Coamingdale", kind: "influencer", signal: "Liked an Oakes post" },
          { name: "Vikram Sethi", role: "RevOps Lead", company: "Cleatwise", kind: "hiring", signal: "RevOps role posted" },
          { name: "Camille Dufresne", role: "COO", company: "Taffwell", kind: "keyword", signal: "Posted on pipeline" },
        ],
        featured: {
          why: "Brailwick is a 180-person US B2B software company. Bianca leads sales and posted this week about forecast accuracy.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Bianca, spotted your post on forecast accuracy at Brailwick. Do the misses start early in the pipeline or at commit?",
      },
    ],
  },

  signals: {
    h2: "Job posts name the CRM they run.",
    cards: [
      {
        kind: "stack",
        title: "Companies naming your CRM",
        body: "Pancake finds companies whose job posts name HubSpot, Salesforce or the tools you support.",
        watching: ["HubSpot", "Salesforce", "Gong"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Teams hiring ops roles",
        body: "Pancake reads job posts for CRM admin and RevOps roles and finds the sales leader at each company.",
        watching: ["RevOps manager", "Salesforce admin"],
        more: 3,
      },
      {
        kind: "keyword",
        title: "Leaders posting about pipeline",
        body: "A sales leader’s post about forecast accuracy or a CRM move becomes a lead, post included.",
        watching: ["forecast accuracy", "lead routing"],
        more: 3,
      },
      {
        kind: "competitor",
        title: "Fans of rival CRM partners",
        body: "Pancake watches other HubSpot and Salesforce partners’ pages and keeps the sales leaders who engage.",
        watching: ["Ironbark RevOps", "Hawserline Ops"],
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake tell which CRM a company uses?",
      a: "Only when its job posts name it. Stack reads the tools listed in job posts, not a company’s website or code.",
    },
    {
      q: "Does Pancake sync leads into HubSpot or Salesforce?",
      a: "No. There’s no CRM sync and no export. Leads live in Pancake and Slack, where you approve them.",
    },
    {
      q: "Won’t a company hiring a Salesforce admin fix its CRM in-house?",
      a: "Some will. The post still shows the CRM is a priority now. Pitch the cleanup while they hire, or support for the new admin.",
    },
    {
      q: "Can one workspace cover HubSpot and Salesforce clients?",
      a: "Yes. Stack matches any tool you list, so one workspace can watch both. If your two offers differ, a second $99 workspace keeps the messages apart.",
    },
  ],

  related: ["gtm-agencies", "data-consultancies", "martech-startups", "marketing-agencies"],

  cta: { title: "Scope the CRM cleanup." },
};
