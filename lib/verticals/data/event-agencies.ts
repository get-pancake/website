// lib/verticals/data/event-agencies.ts — Pancake for event agencies.
// Every person, company, rival agency, expert and workspace below is invented.
// Caveat (brief): country-level targeting only, never city or venue radius. Corporate (B2B) events only.
import type { VerticalConfig } from "../types";

export const eventAgencies: VerticalConfig = {
  slug: "event-agencies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "event agencies",
    title: "Event agencies",
    short: "event agencies",
    badge: "For event agencies",
  },

  meta: { seoTitle: "Pancake for Event Agencies: Teams Planning Offsites" },

  hubLine: "Find People leads posting about offsites or hiring event roles.",

  hero: {
    h1: ["You plan the offsite", "We bring you clients"],
    lede: "Pancake finds People and marketing leads posting about offsites or hiring event roles. Pitch before the venue is booked.",
  },

  workspace: { name: "Linnell Events", sender: "Camille Linnell" },

  demo: {
    h2: "Find who owns the next event.",
    prompts: [
      {
        kind: "keyword",
        text: "We plan corporate retreats. Find US heads of People posting about planning a company offsite.",
        reply: "I'll watch People leaders’ posts about offsites and retreats at US companies.",
        proposal: [
          { kind: "keyword", items: ["company offsite", "team retreat", "in-person week"] },
          { kind: "hiring", items: ["Workplace experience manager"] },
          { kind: "competitor", items: ["Gatherfield Co"] },
        ],
        leads: [
          { name: "Genevieve Park", role: "Head of People", company: "Northloom", kind: "keyword", signal: "Posted about an offsite" },
          { name: "Nathaniel Farrell", role: "VP People", company: "Lindenhall", kind: "keyword", signal: "Posted on team retreats" },
          { name: "Brianna Castillo", role: "People Ops Director", company: "Sproutline", kind: "hiring", signal: "Workplace role open" },
          { name: "Isaac Brandvold", role: "Chief People Officer", company: "Irisfield", kind: "competitor", signal: "Liked a Gatherfield post" },
          { name: "Maya Okorie", role: "Head of Culture", company: "Mossgate", kind: "keyword", signal: "Posted about a retreat" },
        ],
        featured: {
          why: "Northloom is a 180-person remote US software company. Genevieve leads People and posted this week about planning the team’s offsite.",
          confidence: 89,
          seniority: "Head",
        },
        message:
          "Hi Genevieve, saw your post about planning Northloom’s offsite. Getting 180 people to one place is a project on its own. We run retreats for remote teams, from venue search to run of show. Want three venue ideas that fit a group your size?",
      },
      {
        kind: "hiring",
        text: "We produce field events. Find US B2B companies with 200 to 2,000 staff hiring a field marketer.",
        reply: "I'll watch job posts for field marketing and event roles at US B2B companies that size.",
        proposal: [
          { kind: "hiring", items: ["Field marketing manager", "Event manager", "Events coordinator"] },
          { kind: "stack", items: ["Cvent", "Bizzabo"] },
          { kind: "keyword", items: ["customer summit", "roadshow"] },
        ],
        leads: [
          { name: "Lorenzo Batiste", role: "VP Marketing", company: "Ashlar Data", kind: "hiring", signal: "Field marketer role open" },
          { name: "Chloe Rademacher", role: "Head of Events", company: "Harrowfield", kind: "hiring", signal: "Event manager role" },
          { name: "Kiran Mahadevan", role: "Field Marketing Lead", company: "Brassline", kind: "stack", signal: "Cvent in job posts" },
          { name: "Dominique Faulkner", role: "Marketing Director", company: "Aldermoor", kind: "keyword", signal: "Posted about a summit" },
          { name: "Wes Dombrowski", role: "Demand Gen Lead", company: "Saffronly", kind: "stack", signal: "Bizzabo in job posts" },
        ],
        featured: {
          why: "Ashlar Data, a 320-person US B2B software company, opened a field marketing manager role. Lorenzo leads marketing, so the new hire joins his team.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Lorenzo, saw Ashlar Data is hiring a field marketing manager. A new hire still needs a crew on site. We produce field events and roadshows for B2B software teams. Want a rough budget for a three-city roadshow?",
      },
      {
        kind: "competitor",
        text: "I run an offsite agency. Find US chiefs of staff engaging with rival offsite agencies' posts.",
        reply: "I'll watch who engages with rival offsite agencies’ posts and keep chiefs of staff.",
        proposal: [
          { kind: "competitor", items: ["Tallpine Offsites", "Gatherfield Co"] },
          { kind: "keyword", items: ["leadership offsite", "exec retreat"] },
          { kind: "influencer", items: ["Rosa Tenbrook"] },
        ],
        leads: [
          { name: "Nina Kovalenko", role: "Chief of Staff", company: "Kestrelline", kind: "competitor", signal: "Liked a Tallpine post" },
          { name: "Ezra Kingsley", role: "Chief of Staff", company: "Pellwright", kind: "competitor", signal: "Liked a Gatherfield post" },
          { name: "Aisha Rahimi", role: "COO", company: "Zinnia Health", kind: "keyword", signal: "Posted on exec retreats" },
          { name: "Callum Ferrante", role: "Chief of Staff", company: "Tinsmith Labs", kind: "influencer", signal: "Liked Tenbrook’s post" },
          { name: "Anoush Petrosyan", role: "VP Operations", company: "Glassbrook", kind: "competitor", signal: "Liked a Tallpine post" },
        ],
        featured: {
          why: "Kestrelline is a 260-person US fintech. Nina is chief of staff and liked a Tallpine Offsites post about leadership retreats this week.",
          confidence: 86,
          seniority: "Director",
        },
        message:
          "Hi Nina, the leadership offsite often lands on the chief of staff’s desk. We plan exec retreats for fintech teams, facilitation included. Want a sample agenda from a two-day retreat?",
      },
    ],
  },

  signals: {
    h2: "Nobody keeps an offsite quiet.",
    cards: [
      {
        kind: "keyword",
        title: "Offsite posts, before and after",
        body: "Planning posts and recaps both count, since a team that ran one offsite usually plans another.",
        watching: ["offsite", "sales kickoff", "team retreat"],
        more: 2,
      },
      {
        kind: "hiring",
        title: "Teams hiring event roles",
        body: "Pancake watches job posts for event and field marketing roles and names the lead to pitch.",
        watching: ["Event manager", "Field marketer", "Events coordinator"],
        more: 1,
      },
      {
        kind: "competitor",
        title: "Fans of rival event agencies",
        body: "A People or marketing lead who likes or comments on a rival agency’s post becomes your lead.",
        watching: ["Gatherfield Co", "Tallpine Offsites"],
      },
      {
        kind: "stack",
        title: "Event platforms in job posts",
        body: "Pancake spots Cvent, Bizzabo or Splash in job posts, then finds who runs events there.",
        watching: ["Cvent", "Bizzabo", "Splash"],
      },
    ],
  },

  faq: [
    {
      q: "Can I target companies in my city?",
      a: "Not reliably. Pancake targets by country, not by city or venue radius. City-only audiences come back thin.",
    },
    {
      q: "Do you find weddings or private clients?",
      a: "No. Pancake finds people at companies on LinkedIn, not consumers. Aim it at corporate events.",
    },
    {
      q: "Can it find companies with an offsite on the calendar?",
      a: "Only when someone posts about it. Pancake can't see calendars or event budgets.",
    },
    {
      q: "Should I pitch People or marketing?",
      a: "Both, for different events. People leads and chiefs of staff own offsites. Field marketers own summits and roadshows.",
    },
  ],

  related: ["pr-firms", "video-production-companies", "corporate-training-companies", "marketing-agencies"],

  cta: { title: "Plan their next kickoff." },
};
