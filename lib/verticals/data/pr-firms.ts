// lib/verticals/data/pr-firms.ts — Pancake for PR firms.
// Every person, company, rival firm, expert and workspace below is invented.
// Caveat (brief): no funding, news or announcement signals. "Press coverage" is only a keyword people post.
import type { VerticalConfig } from "../types";

export const prFirms: VerticalConfig = {
  slug: "pr-firms",
  status: "approved",
  category: "Marketing & creative agencies",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "PR firms",
    title: "PR firms",
    short: "PR firms",
    badge: "For PR firms",
  },

  meta: { seoTitle: "Pancake for PR Firms: Founders Who Want Coverage" },

  hubLine: "Find founders asking for press and teams hiring comms.",

  hero: {
    h1: ["You pitch the press", "We bring you clients"],
    lede: "Pancake finds founders posting about press and companies hiring comms roles. Your pitch arrives before the referrals do.",
  },

  workspace: { name: "Quintrell PR", sender: "Ivy Quintrell" },

  demo: {
    h2: "Get in before the agency search.",
    prompts: [
      {
        kind: "hiring",
        text: "We're a tech PR firm. Find US software companies with 25 to 250 staff hiring a comms manager.",
        reply: "I'll watch job posts for comms and PR roles at US software companies that size.",
        proposal: [
          { kind: "hiring", items: ["Communications manager", "PR manager", "Head of Communications"] },
          { kind: "stack", items: ["Cision", "Muck Rack"] },
          { kind: "keyword", items: ["media relations", "earned media"] },
        ],
        leads: [
          { name: "Harriet Sakamoto", role: "VP Marketing", company: "Wingspar Labs", kind: "hiring", signal: "Comms manager role" },
          { name: "Marcel Fontenot", role: "Founder & CEO", company: "Tallyforge", kind: "hiring", signal: "PR manager role open" },
          { name: "Yasmin Farouk", role: "Chief of Staff", company: "Orchardline", kind: "keyword", signal: "Posted on earned media" },
          { name: "Pierce Ashworth", role: "Head of Marketing", company: "Pinemark", kind: "stack", signal: "Cision in job posts" },
          { name: "Esperanza Villalobos", role: "CMO", company: "Gildwater", kind: "hiring", signal: "Head of Comms role" },
        ],
        featured: {
          why: "Wingspar Labs, a 120-person US software company, opened a communications manager role. Harriet runs marketing, the team the role joins.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Harriet, saw Wingspar Labs is hiring a communications manager. Reporter relationships take years to build. We bring ours to software companies your size and work alongside in-house comms. Would a short intro before your new hire starts be useful?",
      },
      {
        kind: "keyword",
        text: "I run a tech PR firm. Find US B2B founders posting that they want more press coverage.",
        reply: "I'll watch B2B founders’ posts about press, coverage and telling their story.",
        proposal: [
          { kind: "keyword", items: ["press coverage", "founder story", "how to get press"] },
          { kind: "competitor", items: ["Wickline PR", "Signalhouse Comms"] },
          { kind: "influencer", items: ["Noor Khalidi"] },
        ],
        leads: [
          { name: "Kojo Amankwah", role: "Founder & CEO", company: "Parcelwise", kind: "keyword", signal: "Asked how to get press" },
          { name: "Lucia Benedetti", role: "Co-founder", company: "Quartzline", kind: "keyword", signal: "Posted on founder story" },
          { name: "Rohan Iyengar", role: "CEO", company: "Meridel", kind: "competitor", signal: "Liked a Wickline post" },
          { name: "Josephine Kurtz", role: "Founder", company: "Quillstone", kind: "keyword", signal: "Posted about coverage" },
          { name: "Byron Achebe", role: "Co-founder", company: "Kindling Robotics", kind: "influencer", signal: "Liked Khalidi’s post" },
        ],
        featured: {
          why: "Parcelwise is a 40-person US logistics software company. Kojo founded it and asked in a post this week how startups get press.",
          confidence: 87,
          seniority: "Founder",
        },
        message:
          "Hi Kojo, saw your post asking how startups get press. In logistics tech, trade reporters usually want a customer story more than a launch. We run PR for B2B software companies and help founders find that angle. Want a few story angles for Parcelwise?",
      },
      {
        kind: "influencer",
        text: "We pitch tech press. Find US heads of comms engaging with media relations experts' posts.",
        reply: "I'll watch who engages with the comms experts you name and keep US tech companies.",
        proposal: [
          { kind: "influencer", items: ["Noor Khalidi", "Grant Esterhaus"] },
          { kind: "keyword", items: ["media relations", "trade press"] },
          { kind: "hiring", items: ["PR manager", "Comms and content lead"] },
        ],
        leads: [
          { name: "Toni Sutherland", role: "Head of Comms", company: "Veritrail", kind: "influencer", signal: "Replied to Noor Khalidi" },
          { name: "Garrett Oberlin", role: "VP Comms", company: "Weyburn Health", kind: "influencer", signal: "Liked Esterhaus’s post" },
          { name: "Anjali Raman", role: "Comms Director", company: "Beaconrise", kind: "keyword", signal: "Posted on pitching press" },
          { name: "Emilio Zavala", role: "Head of Brand", company: "Sablecrest", kind: "hiring", signal: "Comms lead role open" },
          { name: "Efua Ansah", role: "Director of Comms", company: "Northgale", kind: "influencer", signal: "Replied to Esterhaus" },
        ],
        featured: {
          why: "Veritrail is a 210-person US software company. Toni leads communications and commented on Noor Khalidi’s trade press post this week.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Toni, saw your comment on Noor Khalidi’s post about trade press. Trade and business press for B2B software companies is most of what we do. If Veritrail ever needs extra reach there, I’d be glad to compare notes.",
      },
    ],
  },

  signals: {
    h2: "Founders say when they want press.",
    cards: [
      {
        kind: "keyword",
        title: "Founders who ask for press",
        body: "Pancake finds founders posting about coverage, earned media or their story, with the post attached.",
        watching: ["press coverage", "earned media"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Companies hiring comms",
        body: "Pancake reads job posts for comms and PR roles, then finds the founder or marketing lead there.",
        watching: ["Communications manager", "PR manager"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Fans of media relations pros",
        body: "Heads of comms who react or reply to the media relations voices you name become leads.",
        watching: ["Noor Khalidi", "Grant Esterhaus"],
      },
      {
        kind: "stack",
        title: "Media tools in job posts",
        body: "Job posts naming Cision or Muck Rack point to a company that works the press.",
        watching: ["Cision", "Muck Rack", "Meltwater"],
      },
    ],
  },

  faq: [
    {
      q: "Can you tell me which startups raised money?",
      a: "No. There's no funding signal. Pancake reads LinkedIn posts, engagement and job posts, so you see who talks about press, not who raised.",
    },
    {
      q: "Will it pitch journalists for me?",
      a: "No. Pancake finds your clients: the founders and comms leads who hire PR. Media outreach stays with your team.",
    },
    {
      q: "Can Pancake tell which founders have a story?",
      a: "No. It finds founders talking about press or hiring comms. The story is your call.",
    },
    {
      q: "Does it work for consumer and lifestyle PR?",
      a: "Less well. Pancake works from LinkedIn, where B2B tech founders and comms leads post. Consumer and lifestyle brands post less there.",
    },
  ],

  related: ["event-agencies", "video-production-companies", "marketing-agencies", "branding-agencies"],

  cta: { title: "Be the firm they call." },
};
