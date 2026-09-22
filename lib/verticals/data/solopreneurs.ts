// lib/verticals/data/solopreneurs.ts — solopreneurs (merged: indie hackers, micro-SaaS and bootstrapped founders).
// Every person, company, rival tool, creator and workspace below is invented.
// Caveat (brief): B2B only, consumer-facing solo products won't work. Own brand needs the
// founder's LinkedIn activity. No "while you sleep" results promises. This page owns the
// approval-gate angle (brief review 3b).
import type { VerticalConfig } from "../types";

export const solopreneurs: VerticalConfig = {
  slug: "solopreneurs",
  status: "approved",
  category: "Startups & solo founders",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "solopreneurs",
    title: "Solopreneurs",
    short: "solo founders",
    badge: "For solopreneurs",
  },

  meta: { seoTitle: "Pancake for Solopreneurs: B2B Leads Every Morning" },

  hubLine: "Find B2B buyers each morning without a sales team.",

  hero: {
    h1: ["You build it alone", "We bring you customers"],
    lede: "Pancake finds your buyers on LinkedIn overnight. You pick who gets a message. You keep building.",
  },

  workspace: { name: "Rutherford Labs", sender: "Esme Rutherford" },

  demo: {
    h2: "Brief it once. Then go build.",
    prompts: [
      {
        kind: "own_brand",
        text: "People like my build-in-public posts. Find the US ones who run B2B teams and could buy.",
        reply: "I'll track likes and comments on your posts and keep people running US B2B teams.",
        proposal: [
          { kind: "own_brand", items: ["Esme Rutherford", "Rutherford Labs"] },
          { kind: "influencer", items: ["Anselm Crowder"] },
          { kind: "competitor", items: ["Changemill"] },
        ],
        leads: [
          { name: "Ishaan Varma", role: "Head of Product", company: "Hazelgrove", kind: "own_brand", signal: "Replied to your post" },
          { name: "Clementine Burke", role: "Product Manager", company: "Minnowbrook", kind: "own_brand", signal: "Liked your build log" },
          { name: "Folasade Akintola", role: "Founder & CEO", company: "Tinwhistle", kind: "own_brand", signal: "Liked your demo video" },
          { name: "Mattias Kroll", role: "VP Engineering", company: "Slatehaven", kind: "influencer", signal: "Liked a Crowder post" },
          { name: "Paloma Ibarra", role: "Product Lead", company: "Driftwillow", kind: "competitor", signal: "Liked a Changemill post" },
        ],
        featured: {
          why: "Ishaan leads product at Hazelgrove, a 70-person US software company. He replied to your post about writing release notes.",
          confidence: 87,
          seniority: "Head",
        },
        message:
          "Hi Ishaan, thanks for replying to my release notes post. I built a tool that turns merged pull requests into release notes customers read. Want a look before your next release?",
      },
      {
        kind: "keyword",
        text: "I built a Slack standup bot alone. Find US eng managers posting about async standups.",
        reply: "I'll watch posts about async standups and keep engineering managers at US companies.",
        proposal: [
          { kind: "keyword", items: ["async standups", "standup fatigue", "meeting-free days"] },
          { kind: "hiring", items: ["Engineering manager"] },
          { kind: "stack", items: ["Slack", "Jira"] },
          { kind: "competitor", items: ["Huddlebox"] },
        ],
        leads: [
          { name: "Saoirse Cassidy", role: "Eng Manager", company: "Fernbrook", kind: "keyword", signal: "Posted about standups" },
          { name: "Bao Nguyen", role: "Engineering Lead", company: "Blueshale", kind: "keyword", signal: "Meeting-free days post" },
          { name: "Linnea Bergstrom", role: "CTO", company: "Vellumway", kind: "hiring", signal: "Eng manager role open" },
          { name: "Rocco Santangelo", role: "Team Lead", company: "Winterpeak", kind: "stack", signal: "Jira in job posts" },
          { name: "Keturah Mills", role: "VP Engineering", company: "Owlbridge", kind: "competitor", signal: "Liked a Huddlebox post" },
        ],
        featured: {
          why: "Fernbrook is a 130-person US health records company. Saoirse manages engineering and posted this week about async standups.",
          confidence: 89,
          seniority: "Manager",
        },
        message:
          "Hi Saoirse, saw your post about dropping daily standups. Most teams still want the update, not the meeting. I built a Slack bot that collects updates async and posts one summary. Happy to set it up for your team free for a week?",
      },
      {
        kind: "influencer",
        text: "I sell reporting to small agencies. Find US agency owners who engage with agency coaches.",
        reply: "I'll watch who engages with those coaches’ posts and keep owners of US agencies.",
        proposal: [
          { kind: "influencer", items: ["Delia Kerr", "Kenji Lockard"] },
          { kind: "keyword", items: ["client reporting", "monthly reports"] },
          { kind: "competitor", items: ["Clientglass"] },
        ],
        leads: [
          { name: "Lupe Galindo", role: "Founder", company: "Sweetgrass Digital", kind: "influencer", signal: "Commented on Kerr" },
          { name: "Rufus Kinsella", role: "Partner", company: "Hartwell & Vine", kind: "influencer", signal: "Liked a Lockard post" },
          { name: "Adanna Ilori", role: "Founder", company: "Wildrye Creative", kind: "keyword", signal: "Posted on client reports" },
          { name: "Hugo Lachance", role: "Account Director", company: "Kitewell", kind: "keyword", signal: "Posted on reporting" },
          { name: "Mercedes Oyarzun", role: "COO", company: "Bellbird Media", kind: "competitor", signal: "Liked a Clientglass post" },
        ],
        featured: {
          why: "Sweetgrass Digital is a 14-person US marketing agency. Lupe founded it and commented on a Delia Kerr post about client reporting.",
          confidence: 86,
          seniority: "Founder",
        },
        message:
          "Hi Lupe, saw your comment on Delia Kerr’s post about client reporting. Monthly reports eat whole days at small agencies. I built a tool that turns each client’s numbers into a branded report. Want me to build one for a Sweetgrass client?",
      },
    ],
  },

  signals: {
    h2: "Your audience has buyers in it.",
    cards: [
      {
        kind: "own_brand",
        title: "Readers of your build log",
        body: "Each like or comment on your posts is checked against your buyer, and the fits become leads.",
        watching: ["Esme Rutherford", "Rutherford Labs"],
      },
      {
        kind: "keyword",
        title: "People posting your problem",
        body: "Pancake searches LinkedIn posts for the problem you solve, in the words your buyers use.",
        watching: ["async standups", "client reporting"],
        more: 3,
      },
      {
        kind: "influencer",
        title: "Fans of your niche’s creators",
        body: "People who engage with the creators your buyers follow become leads, filtered to your market.",
        watching: ["Delia Kerr", "Kenji Lockard", "Anselm Crowder"],
      },
      {
        kind: "competitor",
        title: "Fans of the bigger tool",
        body: "People who react to a bigger rival’s posts become leads for the tool you built alone.",
        watching: ["Huddlebox", "Clientglass", "Changemill"],
      },
    ],
  },

  faq: [
    {
      q: "I can't review leads every day. What happens?",
      a: "New leads wait until you get to them. Pancake never contacts a lead you haven’t approved. Approving one from Slack takes a click.",
    },
    {
      q: "Is $99 worth it before I have revenue?",
      a: "You see the first leads Pancake found before your trial starts. After the 3-day trial, it’s $99 a month, flat.",
    },
    {
      q: "My buyers are consumers. Will it work?",
      a: "No. Pancake finds B2B buyers on LinkedIn: people who buy for a team or a company.",
    },
    {
      q: "Do I need a big LinkedIn following?",
      a: "No. Keyword, Competitor and Influencer signals work with zero followers. Your own posts become a fourth source once people engage with them.",
    },
  ],

  related: ["saas-startups", "consultants", "ai-startups", "developer-tools"],

  cta: { title: "You ship. We find buyers." },
};
