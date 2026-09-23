// lib/verticals/data/cloud-consultancies.ts — /for/cloud-consultancies.
// Merged in: DevOps consultancies, AWS partners, Azure partners.
// Every person, company, rival cloud partner, influencer and workspace below is invented.
// Evidence: trials (DevOps-as-a-service, a SharePoint & Power Apps consultancy, a 150-person IT-services firm,
// a 900-person software house). Best fit for Stack: infrastructure tools are what job posts name.
// Caveat: Stack = technologies named in job posts, never infrastructure scans, contracts or cloud-account data.
// A job post naming VMware is not intent to leave VMware: never "moving off VMware" or renewal timing.
// Buyers are CTOs / IT and platform heads, not engineers.
import type { VerticalConfig } from "../types";

export const cloudConsultancies: VerticalConfig = {
  slug: "cloud-consultancies",
  status: "approved",
  category: "IT, cloud & security",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "cloud consultancies",
    title: "Cloud consultancies",
    short: "cloud consultants",
    badge: "For cloud consultancies",
  },

  meta: { seoTitle: "Pancake for Cloud Consultancies: Find Migration Clients" },

  hubLine: "Find companies hiring DevOps or asking for VMware skills.",

  hero: {
    title: "Find IT directors with VMware in their job posts.",
    h1: ["You run the migration", "We bring you clients"],
    lede: "DevOps and SRE openings, plus CTOs writing on cloud costs, not a stale database. You pitch the migration with proof in hand.",
  },

  workspace: { name: "Hsieh Cloud", sender: "Vivian Hsieh" },

  demo: {
    h2: "Three ways into a cloud project.",
    prompts: [
      {
        kind: "stack",
        text: "We move VMware estates to Azure. Find US companies whose job posts name VMware or vSphere.",
        reply: "I’ll track VMware and vSphere in US job posts, then find the infrastructure lead.",
        proposal: [
          { kind: "stack", items: ["VMware", "vSphere"] },
          { kind: "keyword", items: ["VMware licensing", "data center exit"] },
          { kind: "hiring", items: ["Cloud architect", "Azure administrator"] },
          { kind: "competitor", items: ["Skyfold Cloud"] },
        ],
        leads: [
          { name: "Gustavo Mireles", role: "VP of IT", company: "Brantmoor Mutual", kind: "stack", signal: "VMware in job posts" },
          { name: "Oksana Bilyk", role: "IT Director", company: "Ollerton Savings", kind: "stack", signal: "vSphere in job posts" },
          { name: "Tejas Wadhwa", role: "CIO", company: "Glenhaven Health", kind: "keyword", signal: "VMware licensing post" },
          { name: "Selma Idrissi", role: "Head of IT", company: "Tamsworth", kind: "hiring", signal: "Cloud architect role" },
          { name: "Rhett Galloway", role: "CTO", company: "Wendham", kind: "competitor", signal: "Liked a Skyfold post" },
        ],
        featured: {
          why: "Brantmoor Mutual, a 600-person US insurer, asks for VMware skills in its job posts. Gustavo is VP of IT there.",
          confidence: 89,
          seniority: "VP",
        },
        message:
          "Hi Gustavo, good to be connected. My team moves on-prem servers to the cloud. What’s the next big infrastructure decision on your plate?",
      },
      {
        kind: "hiring",
        text: "We run DevOps as a service. Find US firms with 100 to 1,000 staff hiring a DevOps engineer.",
        reply: "I’ll watch job posts for DevOps and SRE roles and skip listings posted by recruiters.",
        proposal: [
          { kind: "hiring", items: ["DevOps engineer", "Site reliability engineer", "Platform engineer"] },
          { kind: "stack", items: ["Terraform", "Kubernetes"] },
          { kind: "keyword", items: ["on-call rotation"] },
          { kind: "influencer", items: ["Joss Ferrier"] },
        ],
        leads: [
          { name: "Xiomara Quintero", role: "Head of Platform", company: "Tarlton Health", kind: "hiring", signal: "DevOps engineer role" },
          { name: "Conrad Vishnevsky", role: "VP Engineering", company: "Quenby", kind: "hiring", signal: "SRE role open" },
          { name: "Florence Ogundipe", role: "CTO", company: "Kessock", kind: "stack", signal: "Terraform in job posts" },
          { name: "Dario Montesano", role: "Eng Director", company: "Brisbeck Labs", kind: "keyword", signal: "Posted about on-call" },
          { name: "Shondra Pressley", role: "CTO", company: "Wexcombe", kind: "influencer", signal: "Liked a Ferrier post" },
        ],
        featured: {
          why: "Xiomara heads the platform team at Tarlton Health, a 320-person US health-tech company. Its DevOps engineer role is open.",
          confidence: 91,
          seniority: "Head",
        },
        message:
          "Hi Xiomara, thanks for accepting. We run DevOps as a service, mostly infrastructure as code and on-call cover. How does your team split its time between new work and upkeep?",
      },
      {
        kind: "keyword",
        text: "Find tech and finance leaders at US firms with 50 to 500 staff posting about cloud costs.",
        reply: "I’ll watch tech and finance leaders’ posts about cloud bills at US firms that size.",
        proposal: [
          { kind: "keyword", items: ["cloud costs", "AWS bill", "FinOps"] },
          { kind: "influencer", items: ["Nandini Sarangi", "Joss Ferrier"] },
          { kind: "competitor", items: ["Vantora Cloud", "Skyfold Cloud"] },
          { kind: "hiring", items: ["FinOps analyst"] },
        ],
        leads: [
          { name: "Navid Esfandiari", role: "CTO", company: "Sprywell", kind: "keyword", signal: "Posted on cloud costs" },
          { name: "Justyna Kowal", role: "VP Engineering", company: "Ulvern", kind: "keyword", signal: "Posted about AWS bill" },
          { name: "Hemant Sabharwal", role: "CTO", company: "Fallowfield", kind: "influencer", signal: "Liked a Sarangi post" },
          { name: "Annika Klug", role: "Head of IT", company: "Wellsby", kind: "competitor", signal: "Liked a Vantora post" },
          { name: "Bolanle Fashola", role: "CFO", company: "Ternbury", kind: "hiring", signal: "FinOps analyst role" },
        ],
        featured: {
          why: "Sprywell is a 190-person US SaaS company, and Navid is its CTO. His recent post says cloud spend is growing faster than revenue.",
          confidence: 86,
          seniority: "C-level",
        },
        message:
          "Hi Navid, you posted that cloud spend is growing faster than revenue at Sprywell. Did you find where most of the growth came from?",
      },
    ],
  },

  signals: {
    h2: "The migration starts in a job post.",
    cards: [
      {
        kind: "stack",
        title: "VMware in their job posts",
        body: "Pancake finds job posts that ask for VMware, vSphere or Hyper-V skills, then the company behind them.",
        watching: ["VMware", "vSphere", "Hyper-V"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Companies hiring DevOps",
        body: "Pancake reads job posts for DevOps, SRE and cloud architect roles, then finds the CTO.",
        watching: ["DevOps engineer", "Cloud architect"],
        more: 3,
      },
      {
        kind: "keyword",
        title: "CTOs posting about the bill",
        body: "Pancake finds tech leaders writing about cloud costs, FinOps or the last outage.",
        watching: ["cloud costs", "FinOps", "downtime"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Who engages with FinOps voices",
        body: "People who react to the cloud architects and FinOps writers you name become leads.",
        watching: ["Joss Ferrier", "Nandini Sarangi"],
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake tell who is up for a VMware renewal?",
      a: "No. Renewal dates live in contracts, and Pancake never sees those. It finds job posts naming VMware and leaders posting about licensing.",
    },
    {
      q: "Can it pull leads from AWS or Azure partner portals?",
      a: "No. Pancake works from LinkedIn and job posts. Leads from partner portals stay in your portal.",
    },
    {
      q: "Will it bring me engineers instead of CTOs?",
      a: "Your Brain sets the buyer roles, like CTO or head of infrastructure. Leads outside them are rejected. Reject any miss and the Brain learns.",
    },
    {
      q: "We sell migrations, DevOps and FinOps. Can one workspace do all three?",
      a: "Yes, with one ICP and one campaign across them. To pitch each offer to a different buyer, run one workspace per offer, each on its own $99 plan.",
    },
  ],

  related: ["msps", "cybersecurity-firms", "data-consultancies", "developer-tools"],

  cta: { title: "Be first on the migration." },
};
