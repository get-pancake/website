// lib/verticals/data/video-production-companies.ts — /for/video-production-companies
// (merges photo and animation studios). Every person, company, rival studio, storyteller and
// workspace below is invented.
// Brief caveat: no attachments or reels in outreach; the automatic reply carries a booking link only.
import type { VerticalConfig } from "../types";

export const videoProductionCompanies: VerticalConfig = {
  slug: "video-production-companies",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "video production companies",
    title: "Video production companies",
    short: "video studios",
    badge: "For video studios",
  },

  meta: { seoTitle: "Pancake for Video Production Companies: B2B Clients" },

  hubLine: "Find tech marketers with a launch to film.",

  hero: {
    h1: ["You make videos", "We bring you clients"],
    lede: "Pancake finds tech marketers posting about a launch or hiring a video producer. Each morning brings a story worth filming.",
  },

  workspace: { name: "Halide Films", sender: "Emmett Ferris" },

  demo: {
    h2: "Find marketers with something to film.",
    prompts: [
      {
        kind: "keyword",
        text: "We make explainer videos. Find product marketers at US robotics firms posting about a launch.",
        reply: "I'll watch launch and trade show posts from marketers at US robotics firms.",
        proposal: [
          { kind: "keyword", items: ["product launch", "launch video", "trade show"] },
          { kind: "hiring", items: ["Product marketing manager"] },
          { kind: "competitor", items: ["Framewell Studios"] },
        ],
        leads: [
          { name: "Desmond Harrold", role: "Head of PMM", company: "Servotide", kind: "keyword", signal: "Posted about a launch" },
          { name: "Kirsten Vang", role: "CMO", company: "Gripwell Robotics", kind: "keyword", signal: "Posted on a trade show" },
          { name: "Karim Bensaid", role: "VP Marketing", company: "Axlebright", kind: "hiring", signal: "PMM role open" },
          { name: "Noelle Carrington", role: "Content Lead", company: "Torquelane", kind: "keyword", signal: "Posted on launch video" },
          { name: "Nikhil Vora", role: "Founder & CEO", company: "Palletry", kind: "competitor", signal: "Liked a Framewell post" },
        ],
        featured: {
          why: "Servotide is an 80-person US robotics company. Desmond leads product marketing and posted this week about an upcoming launch.",
          confidence: 88,
          seniority: "Head",
        },
        message:
          "Hi Desmond, saw your post about the upcoming launch at Servotide. Robots are hard to explain in a spec sheet and easy to show in 90 seconds. We make explainer videos for robotics and hardware teams. Open to a short call about the launch film?",
      },
      {
        kind: "hiring",
        text: "Find US B2B tech companies hiring an in-house video producer. We're the studio option.",
        reply: "I'll find B2B tech employers with open video producer and motion designer roles.",
        proposal: [
          { kind: "hiring", items: ["Video producer", "Motion designer", "Videographer"] },
          { kind: "stack", items: ["Premiere Pro", "After Effects"] },
          { kind: "keyword", items: ["customer story", "video series"] },
        ],
        leads: [
          { name: "Georgia Pellham", role: "VP Marketing", company: "Norcaster", kind: "hiring", signal: "Video producer role" },
          { name: "Kojo Oduro", role: "Brand Director", company: "Gatewright", kind: "hiring", signal: "Motion designer role" },
          { name: "Julia Stavridis", role: "Head of Content", company: "Wyncote Data", kind: "stack", signal: "Premiere in job posts" },
          { name: "Varun Bhandarkar", role: "CMO", company: "Latchkey Cloud", kind: "keyword", signal: "Posted on a video series" },
          { name: "Shauna Kilbride", role: "Content Lead", company: "Spurlane", kind: "hiring", signal: "Videographer role" },
        ],
        featured: {
          why: "Norcaster is a 220-person US B2B software company with a video producer role open. Georgia runs marketing and owns that hire.",
          confidence: 91,
          seniority: "VP",
        },
        message:
          "Hi Georgia, saw Norcaster is hiring an in-house video producer. One producer keeps a channel running. Launch films and customer stories need a crew. We're a B2B video studio that works alongside in-house teams your size. Open to a short call?",
      },
      {
        kind: "influencer",
        text: "We film tech brands. Find CMOs at US firms of 50 to 500 people engaging with B2B storytellers.",
        reply: "I'll find tech CMOs who engage with B2B storytellers' posts at firms that size.",
        proposal: [
          { kind: "influencer", items: ["Tess Orr", "Mae Adeyemi", "Rosalie Blythe"] },
          { kind: "keyword", items: ["brand film", "B2B storytelling"] },
          { kind: "competitor", items: ["Matchcut Films"] },
        ],
        leads: [
          { name: "Soren Lindahl", role: "CMO", company: "Ironhedge Cloud", kind: "influencer", signal: "Commented on Tess Orr" },
          { name: "Lakshmi Kesavan", role: "VP Marketing", company: "Vantlow", kind: "influencer", signal: "Liked an Adeyemi post" },
          { name: "Felix Ogunleye", role: "CMO", company: "Quantbrook", kind: "keyword", signal: "Posted on a brand film" },
          { name: "Beth Wasilewski", role: "Brand Director", company: "Kelpwater", kind: "competitor", signal: "Liked a Matchcut post" },
          { name: "Luca Ferrandi", role: "Head of Marketing", company: "Windlass", kind: "influencer", signal: "Liked a Tess Orr post" },
        ],
        featured: {
          why: "Ironhedge Cloud is a 300-person US infrastructure software company. Soren is CMO and commented on a Tess Orr post about brand films.",
          confidence: 85,
          seniority: "C-level",
        },
        message:
          "Hi Soren, saw your comment on Tess Orr's post about B2B brand films. Infrastructure is hard to film, so the story has to carry it. We make brand films for technical software companies. Worth a short call?",
      },
    ],
  },

  signals: {
    h2: "Launch posts come before the shoot.",
    cards: [
      {
        kind: "keyword",
        title: "Marketers with a launch coming",
        body: "Pancake catches marketers posting about a launch, a trade show or a customer story.",
        watching: ["product launch", "trade show", "customer story"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Teams hiring video roles",
        body: "A video producer or motion designer job post shows a team that needs more video than it makes.",
        watching: ["Video producer", "Videographer", "Motion designer"],
      },
      {
        kind: "stack",
        title: "Video tools in job posts",
        body: "Pancake finds tech companies whose job posts name Premiere Pro, After Effects or Wistia.",
        watching: ["Premiere Pro", "After Effects", "Wistia", "Vidyard"],
      },
      {
        kind: "competitor",
        title: "Marketers liking rival reels",
        body: "Marketers who like or comment on another studio's reel become leads, with the post attached.",
        watching: ["Framewell Studios", "Matchcut Films"],
      },
    ],
  },

  faq: [
    {
      q: "Can I send my showreel?",
      a: "Not as an attachment. Messages stay under 500 characters, and a positive reply gets your booking link.",
    },
    {
      q: "Can I target brands, not agencies?",
      a: "Yes. Your Brain says who buys. Pancake skips people at agencies unless agencies are your buyers.",
    },
    {
      q: "Can it find companies booked for a trade show?",
      a: "Only when they post about it. Pancake reads LinkedIn posts and job posts, not exhibitor lists.",
    },
    {
      q: "Does it work for photo and animation studios?",
      a: "Yes. The signals are the same: launches, hiring and the tools named in job posts. Your Brain sets what you sell.",
    },
  ],

  related: ["branding-agencies", "event-agencies", "pr-firms", "marketing-agencies"],

  cta: { title: "Film the next launch." },
};
