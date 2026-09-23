// lib/verticals/data/industrial-tech-startups.ts — /for/industrial-tech-startups.
// Startups selling software to plants: predictive maintenance on historian data, asset monitoring
// for utilities and solar operators, OT network security. Buyers: operations, plant, controls and
// reliability leaders at manufacturers, utilities and energy operators.
// Every person, company, incumbent vendor, influencer and workspace below is invented.
// Evidence: paying (industrial time-series AI selling to energy and solar operators, OT network
// security, AI order processing for manufacturers, SAP content management).
// Caveat: plant staff post little, so Hiring and Stack carry the page (the FAQ says so). No sensor
// or operational data. Customer meeting counts are internal: never publish them.
import type { VerticalConfig } from "../types";

export const industrialTechStartups: VerticalConfig = {
  slug: "industrial-tech-startups",
  status: "approved",
  category: "Energy & industry",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "industrial tech startups",
    title: "Industrial tech startups",
    short: "industrial founders",
    badge: "For industrial startups",
  },

  meta: { seoTitle: "Pancake for Industrial Tech Startups: Reach Plant Leaders" },

  hubLine: "Find plants whose job posts name the systems you plug into.",

  hero: {
    title: "Find plant leaders who hire for OSIsoft PI skills.",
    h1: ["You sell to factories", "We bring you customers"],
    lede: "Pancake tracks reliability and SCADA openings plus OT security posts, not a trade-show list. Meet the VP who runs the line.",
  },

  workspace: { name: "Tachline", sender: "Anneke Moreland" },

  demo: {
    h2: "Get past the plant gate.",
    prompts: [
      {
        kind: "stack",
        text: "Our AI reads historian data. Find US manufacturers whose job posts name OSIsoft PI.",
        reply: "I’ll find plants whose job posts ask for OSIsoft PI and keep their ops leads.",
        proposal: [
          { kind: "stack", items: ["OSIsoft PI", "AVEVA PI", "Ignition"] },
          { kind: "hiring", items: ["Reliability engineer", "Controls engineer"] },
          { kind: "keyword", items: ["unplanned downtime", "predictive maintenance"] },
          { kind: "competitor", items: ["Brakewell Analytics"] },
        ],
        leads: [
          { name: "Graciela Arvizu", role: "VP Operations", company: "Billetworks", kind: "stack", signal: "OSIsoft PI in job posts" },
          { name: "Kurt Vandersloot", role: "Plant Manager", company: "Quenchfield", kind: "stack", signal: "AVEVA PI in job posts" },
          { name: "Chukwudi Nwankwo", role: "Reliability Lead", company: "Ladlecraft", kind: "hiring", signal: "Reliability role open" },
          { name: "Stacy Brennecke", role: "Maintenance Lead", company: "Sintermoor", kind: "keyword", signal: "Posted on downtime" },
          { name: "Ilya Sorokin", role: "COO", company: "Anvilmark", kind: "competitor", signal: "Liked a Brakewell post" },
        ],
        featured: {
          why: "Billetworks is a 900-person US metals manufacturer whose job posts name OSIsoft PI. Graciela runs operations.",
          confidence: 91,
          seniority: "VP",
        },
        message:
          "Hi Graciela, thanks for the connect. I work on software that reads plant historian data. How does your team find out a machine is about to fail?",
      },
      {
        kind: "hiring",
        text: "We flag failing assets. Find US utilities and solar operators hiring reliability engineers.",
        reply: "I’ll track reliability openings at US utilities and solar operators.",
        proposal: [
          { kind: "hiring", items: ["Reliability engineer", "SCADA engineer", "Maintenance planner"] },
          { kind: "stack", items: ["Maximo", "OSIsoft PI"] },
          { kind: "keyword", items: ["asset performance", "inverter failures"] },
        ],
        leads: [
          { name: "Ramona Whitehorse", role: "Head of Reliability", company: "Sagebluff", kind: "hiring", signal: "2 reliability roles open" },
          { name: "Felipe Villegas", role: "VP Operations", company: "Mesaline", kind: "hiring", signal: "SCADA engineer role" },
          { name: "Dorothy Keel", role: "Asset Manager", company: "Sunpike", kind: "keyword", signal: "Posted on inverters" },
          { name: "Leroy Thibault", role: "Plant Manager", company: "Cinderpeak", kind: "stack", signal: "Maximo in job posts" },
          { name: "Meena Subbarao", role: "VP Engineering", company: "Prairiewell", kind: "hiring", signal: "Planner role open" },
        ],
        featured: {
          why: "Sagebluff is a 450-person US solar operator with two reliability engineer roles open. Ramona leads reliability there.",
          confidence: 89,
          seniority: "Head",
        },
        message:
          "Hi Ramona, glad to connect. We build software that flags failing equipment early. What eats most of your maintenance hours?",
      },
      {
        kind: "keyword",
        text: "We secure plant networks. Find US manufacturing leaders posting about OT security.",
        reply: "I’ll watch OT security posts and keep plant, controls and IT leaders at manufacturers.",
        proposal: [
          { kind: "keyword", items: ["OT security", "IEC 62443", "ICS security"] },
          { kind: "hiring", items: ["OT security engineer", "Controls engineer"] },
          { kind: "influencer", items: ["Luther Voigt"] },
          { kind: "competitor", items: ["Fenwarden Security"] },
        ],
        leads: [
          { name: "Clint Haberman", role: "Controls Manager", company: "Quirewood", kind: "keyword", signal: "Posted on OT security" },
          { name: "Esi Owusu", role: "IT Director", company: "Swarfield", kind: "keyword", signal: "Posted on IEC 62443" },
          { name: "Bogdan Petrescu", role: "VP Manufacturing", company: "Tubewright", kind: "influencer", signal: "Commented on a post" },
          { name: "Tracy Gundlach", role: "CISO", company: "Rivetry", kind: "competitor", signal: "Liked a Fenwarden post" },
          { name: "Hiroshi Tanabe", role: "Plant Manager", company: "Crankmoor", kind: "hiring", signal: "OT security role open" },
        ],
        featured: {
          why: "Quirewood is a 700-person US paper maker. Clint manages its controls team and posted this week about OT security.",
          confidence: 86,
          seniority: "Manager",
        },
        message:
          "Hi Clint, I saw you posted about OT security at Quirewood. What’s the oldest controller still on your network?",
      },
    ],
  },

  signals: {
    h2: "Job posts show what plants run.",
    cards: [
      {
        kind: "stack",
        title: "Plant systems in job posts",
        body: "Pancake finds plants whose job posts name the historians, CMMS and SCADA tools you plug into.",
        watching: ["OSIsoft PI", "Ignition", "SAP PM", "Maximo"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Plants hiring reliability roles",
        body: "A reliability or controls opening flags a plant with a gap, and Pancake finds the person who runs it.",
        watching: ["Reliability engineer", "Controls engineer", "SCADA engineer"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "Plant leaders who post",
        body: "Few plant leaders post, so Pancake catches the ones writing about downtime or OT security, post attached.",
        watching: ["unplanned downtime", "OT security", "predictive maintenance"],
      },
      {
        kind: "competitor",
        title: "The incumbent’s audience",
        body: "Pancake finds plant leaders who react to posts from the vendor you replace.",
        watching: ["Brakewell Analytics", "Fenwarden Security"],
      },
    ],
  },

  faq: [
    {
      q: "Plant managers barely post. Where do leads come from?",
      a: "Mostly from job posts. A plant hiring a reliability engineer or asking for Maximo shows up even if nobody there posts. Each lead still needs a LinkedIn profile, since outreach runs there.",
    },
    {
      q: "Can it read a prospect’s sensor or SCADA data?",
      a: "No. Pancake never sees inside a plant. It reads job posts and what plant leaders post and engage with on LinkedIn.",
    },
    {
      q: "Our sales cycles run nine months. What’s the point?",
      a: "Pancake fills the top of that cycle with new plant contacts each morning. The pilot and the contract stay with your team.",
    },
    {
      q: "Can it find plants that run the system we replace?",
      a: "Yes, when their job posts name it. Add the tool to Stack as Replaces, and Pancake finds companies whose job posts ask for it.",
    },
  ],

  related: ["solar-companies", "logistics-tech-startups", "ai-startups", "sustainability-consultants"],

  cta: { title: "Find your next pilot plant." },
};
