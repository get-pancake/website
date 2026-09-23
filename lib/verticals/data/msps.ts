// lib/verticals/data/msps.ts — /for/msps.
// Merged in: IT support companies.
// Every person, company, rival MSP, influencer and workspace below is invented.
// Evidence: 3 paying (hosting & cloud; IT support; a video-meeting/ID partner) + ~6 trials incl. a 150-person IT firm.
// Caveat: tiny local offices are sparse on LinkedIn; sourcing is country-level, the service area is an ICP
// check (FAQ says so). Stack = tools named in job posts, never network, DNS or device scans. MSPs post help
// desk jobs themselves, so the ICP check (competing vendor) matters here.
import type { VerticalConfig } from "../types";

export const msps: VerticalConfig = {
  slug: "msps",
  status: "approved",
  category: "IT, cloud & security",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "MSPs",
    title: "MSPs",
    short: "MSP owners",
    badge: "For MSPs",
  },

  meta: { seoTitle: "Pancake for MSPs: Companies Hiring IT Staff" },

  hubLine: "Find companies hiring IT staff and meet the ops lead.",

  hero: {
    title: "Find office managers about to hire in-house IT.",
    h1: ["You keep IT running", "We bring you clients"],
    lede: "Pancake reads Intune job posts, cyber insurance posts and rival MSPs’ pages. Your proposal arrives before their offer letter.",
  },

  workspace: { name: "Cobbold IT", sender: "Nolan Cobbold" },

  demo: {
    h2: "Meet the ops lead before the IT hire.",
    prompts: [
      {
        kind: "hiring",
        text: "We’re a managed IT provider. Find US companies with 30 to 200 staff hiring an IT manager.",
        reply: "I’ll watch job posts for IT roles at US firms that size and skip other IT providers.",
        proposal: [
          { kind: "hiring", items: ["IT manager", "IT support technician", "Systems administrator"] },
          { kind: "stack", items: ["Microsoft 365", "Intune"] },
          { kind: "keyword", items: ["IT outage", "new office"] },
          { kind: "competitor", items: ["Patchbay IT"] },
        ],
        leads: [
          { name: "Gloria Venkatesan", role: "COO", company: "Oxbury Freight", kind: "hiring", signal: "IT manager role open" },
          { name: "Fintan Kilgallen", role: "Office Manager", company: "Varga & Lowe", kind: "hiring", signal: "Sysadmin role open" },
          { name: "Ruthanne Obregon", role: "Controller", company: "Stanwick Supply", kind: "stack", signal: "M365 in job posts" },
          { name: "Tavita Leiataua", role: "VP Operations", company: "Marshgate", kind: "keyword", signal: "Posted on an IT outage" },
          { name: "Ezinne Obasi", role: "Ops Director", company: "Tolliver", kind: "competitor", signal: "Liked a Patchbay post" },
        ],
        featured: {
          why: "Oxbury Freight, a 90-person US freight broker, has an IT manager role open. Gloria runs operations as COO.",
          confidence: 90,
          seniority: "C-level",
        },
        message:
          "Hi Gloria, thanks for connecting. I run managed IT, mostly help desk and after-hours cover. How does your team handle IT today?",
      },
      {
        kind: "stack",
        text: "We manage Microsoft 365. Find US firms with 50 to 250 staff whose job posts name Intune.",
        reply: "I’ll watch job posts at US firms that size for Intune, Entra ID or Microsoft 365.",
        proposal: [
          { kind: "stack", items: ["Intune", "Entra ID", "Microsoft 365"] },
          { kind: "hiring", items: ["Help desk analyst", "IT support technician"] },
          { kind: "keyword", items: ["Microsoft 365 migration"] },
        ],
        leads: [
          { name: "Teodoro Galvan", role: "IT Manager", company: "Wetherby Foods", kind: "stack", signal: "Intune in job posts" },
          { name: "Shirin Hassanpour", role: "Ops Director", company: "Pellingham", kind: "stack", signal: "Entra ID in job posts" },
          { name: "Corwin Aldersey", role: "COO", company: "Sunderby Dental", kind: "hiring", signal: "Help desk analyst role" },
          { name: "Linh Truong", role: "Office Manager", company: "Loxley Law", kind: "hiring", signal: "IT support tech role" },
          { name: "Jerrell Whitmore", role: "VP Operations", company: "Dunstan Title", kind: "keyword", signal: "M365 migration post" },
        ],
        featured: {
          why: "Wetherby Foods, a 180-person US food manufacturer, is hiring for Intune skills. Teodoro is its IT manager.",
          confidence: 87,
          seniority: "Manager",
        },
        message:
          "Hi Teodoro, glad to be connected. We manage devices and user accounts alongside in-house IT. What takes up most of your week right now?",
      },
      {
        kind: "keyword",
        text: "Find US ops and finance leads posting about cyber insurance. We close the gaps insurers flag.",
        reply: "I’ll watch posts about cyber insurance, phishing and MFA from ops and finance leaders.",
        proposal: [
          { kind: "keyword", items: ["cyber insurance renewal", "phishing attempt", "MFA rollout"] },
          { kind: "influencer", items: ["Bettina Harcourt"] },
          { kind: "competitor", items: ["Patchbay IT", "Bluecairn IT"] },
        ],
        leads: [
          { name: "Maureen Dunmore", role: "CFO", company: "Sandhill Civil", kind: "keyword", signal: "Cyber insurance post" },
          { name: "Marcelo Zubiaga", role: "COO", company: "Hartsell & Voss", kind: "keyword", signal: "Posted on phishing" },
          { name: "Beverly Tsukamoto", role: "Ops Director", company: "Pikeridge", kind: "influencer", signal: "Liked a Harcourt post" },
          { name: "Solomon Oyewole", role: "Practice Manager", company: "Aldwick", kind: "competitor", signal: "Liked a Bluecairn post" },
          { name: "Keziah Montgomery", role: "Controller", company: "Garrowby", kind: "keyword", signal: "Posted on MFA rollout" },
        ],
        featured: {
          why: "Sandhill Civil is a 110-person US engineering firm. Maureen, its CFO, posted about the firm’s cyber insurance renewal.",
          confidence: 84,
          seniority: "C-level",
        },
        message:
          "Hi Maureen, I read your post about Sandhill Civil’s cyber insurance renewal. Which question on the form was hardest to answer?",
      },
    ],
  },

  signals: {
    h2: "Small IT teams hire in the open.",
    cards: [
      {
        kind: "hiring",
        title: "Companies hiring IT help",
        body: "Pancake reads job posts for help desk and IT manager roles, then finds who runs operations there.",
        watching: ["IT manager", "Help desk analyst", "Systems administrator"],
        more: 2,
      },
      {
        kind: "stack",
        title: "The tools you already manage",
        body: "Pancake finds companies whose job posts name Intune, Entra ID or any other tool you support.",
        watching: ["Intune", "Entra ID", "Microsoft 365"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "When the network goes down",
        body: "Pancake finds COOs and office managers who post about downtime, phishing or a cyber insurance renewal.",
        watching: ["IT outage", "phishing", "cyber insurance", "new office"],
      },
      {
        kind: "competitor",
        title: "Rival MSPs’ readers",
        body: "Ops leads who like or comment on a rival MSP’s posts show up with that post attached.",
        watching: ["Patchbay IT", "Bluecairn IT"],
      },
    ],
  },

  faq: [
    {
      q: "Most of my clients are 10-person offices. Will Pancake find them?",
      a: "Some. The smallest offices are thin on LinkedIn, so firms of 30 people or more show up more often.",
    },
    {
      q: "Can I keep leads inside my service area?",
      a: "Yes, with a trade-off. Leads are sourced across the US, then checked against the area named in your Brain. A single metro means fewer leads each morning.",
    },
    {
      q: "MSPs post help desk jobs too. Will I get my rivals?",
      a: "Rarely. Each company is checked against your ICP, and other IT providers fail that check. Reject any that slip through and the Brain learns.",
    },
    {
      q: "Can Pancake scan a company’s network or domain?",
      a: "No. Stack reads the tools named in job posts. Pancake never touches a network, a domain or a device.",
    },
  ],

  related: ["cybersecurity-firms", "cloud-consultancies", "data-consultancies", "software-development-agencies"],

  cta: { title: "Back up their IT team." },
};
