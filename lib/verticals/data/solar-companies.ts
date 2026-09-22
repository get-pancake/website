// lib/verticals/data/solar-companies.ts — /for/solar-companies.
// Commercial & industrial (C&I) solar installers: rooftop, carport and storage sold to businesses
// (founder 2026-09-22). Buyers are facilities, operations and finance leaders on LinkedIn.
// Every person, company, rival developer, influencer and workspace below is invented.
// Evidence: founder-named ("solar agencies"), zero customers or trials: an SEO bet.
// Caveat: never "solar leads", homeowners, permits, roof or property data, maps. Businesses only.
import type { VerticalConfig } from "../types";

export const solarCompanies: VerticalConfig = {
  slug: "solar-companies",
  status: "approved",
  category: "Energy & industry",
  evidence: "founder",
  updated: "2026-09-22",

  name: {
    plural: "commercial solar companies",
    title: "Commercial solar companies",
    short: "solar installers",
    badge: "For commercial solar",
  },

  meta: { seoTitle: "Pancake for Commercial Solar Companies: Find C&I Buyers" },

  hubLine: "Reach the people who pay a company’s power bill.",

  hero: {
    h1: ["You install solar", "We bring you customers"],
    lede: "Rate hikes get facility leaders posting. Pancake finds them and the companies hiring energy managers. You pitch the roof.",
  },

  workspace: { name: "Sunbarrow Energy", sender: "Lucas Arbogast" },

  demo: {
    h2: "Find who signs for the roof.",
    prompts: [
      {
        kind: "keyword",
        text: "We put solar on factory roofs. Find US facilities directors posting about energy costs.",
        reply: "I'll watch posts about energy costs and keep facilities leaders at US manufacturers.",
        proposal: [
          { kind: "keyword", items: ["energy costs", "demand charges", "utility rate hike"] },
          { kind: "hiring", items: ["Energy manager", "Facilities manager"] },
          { kind: "stack", items: ["Metasys", "EnergyCAP"] },
          { kind: "competitor", items: ["Ampridge Solar"] },
        ],
        leads: [
          { name: "Marisa Kolbeck", role: "VP Facilities", company: "Cobbwell", kind: "keyword", signal: "Posted on energy costs" },
          { name: "Hector Zamarripa", role: "Plant Manager", company: "Drayburn", kind: "keyword", signal: "Posted on rate hikes" },
          { name: "Deepa Krishnamurthy", role: "Facilities Director", company: "Hensworth", kind: "hiring", signal: "Facilities manager role" },
          { name: "Curtis Blanchard", role: "Chief Engineer", company: "Morrowfield", kind: "stack", signal: "Metasys in job posts" },
          { name: "Yesenia Portillo", role: "CFO", company: "Galeworth", kind: "competitor", signal: "Liked an Ampridge post" },
        ],
        featured: {
          why: "Cobbwell is a 420-person US plastics manufacturer. Marisa runs its facilities and posted this week about rising energy costs.",
          confidence: 89,
          seniority: "VP",
        },
        message:
          "Hi Marisa, saw your post about energy costs at Cobbwell. Molding lines draw power all day, and demand charges pile on top. We design and install rooftop solar with storage for manufacturers. Open to a quick look at a year of your bills?",
      },
      {
        kind: "hiring",
        text: "We build on-site solar. Find US cold storage companies hiring an energy manager.",
        reply: "I'll track energy job posts at US cold storage firms and find who runs their sites.",
        proposal: [
          { kind: "hiring", items: ["Energy manager", "Facilities manager", "Refrigeration engineer"] },
          { kind: "keyword", items: ["power costs", "cold storage energy"] },
          { kind: "stack", items: ["EnergyCAP"] },
        ],
        leads: [
          { name: "Tobias Mwangi", role: "VP Operations", company: "Frostvale", kind: "hiring", signal: "Energy manager role" },
          { name: "Laurel Hasegawa", role: "COO", company: "Rimeport", kind: "hiring", signal: "Refrigeration role open" },
          { name: "Warren Lockhart", role: "VP Supply Chain", company: "Coldwick", kind: "keyword", signal: "Posted on power costs" },
          { name: "Nkem Onyekachi", role: "Facilities Lead", company: "Polarbrook", kind: "hiring", signal: "Facilities manager role" },
          { name: "Dale Kowalewski", role: "VP Engineering", company: "Icefern", kind: "stack", signal: "EnergyCAP in job posts" },
        ],
        featured: {
          why: "Frostvale, a 380-person US cold storage company, is hiring an energy manager. Tobias runs operations there.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Tobias, saw Frostvale is hiring an energy manager. Cold storage runs compressors day and night, so power is a top cost. We design and build on-site solar for cold chain sites. Worth checking what one warehouse roof could cover?",
      },
      {
        kind: "influencer",
        text: "We sell solar with storage. Find US food processing CFOs who engage with energy experts.",
        reply: "I'll track who comments on energy experts’ posts and keep food processing CFOs.",
        proposal: [
          { kind: "influencer", items: ["Joan Lasko", "Ravi Mehra"] },
          { kind: "keyword", items: ["power purchase agreement", "energy budget"] },
          { kind: "competitor", items: ["Sunquarry Commercial"] },
        ],
        leads: [
          { name: "Bernadette Fogarty", role: "CFO", company: "Harlowe Creamery", kind: "influencer", signal: "Commented on Lasko" },
          { name: "Juan Medina", role: "VP Finance", company: "Pickwell Foods", kind: "influencer", signal: "Liked a Mehra post" },
          { name: "Thanh Pham", role: "Controller", company: "Oatcastle Mills", kind: "keyword", signal: "Posted about PPAs" },
          { name: "Rhonda Beckwith", role: "CFO", company: "Brinecraft", kind: "competitor", signal: "Liked a Sunquarry post" },
          { name: "Arturo Salgado", role: "Treasurer", company: "Tallgrain Foods", kind: "influencer", signal: "Commented on Mehra" },
        ],
        featured: {
          why: "Harlowe Creamery is a 260-person US dairy processor. Bernadette is the CFO and commented on Joan Lasko’s post about locking in power prices.",
          confidence: 85,
          seniority: "C-level",
        },
        message:
          "Hi Bernadette, saw your comment on Joan Lasko’s post about locking in power prices. A solar PPA fixes the price on part of the bill for 20 years. We build solar with storage for food processors. Want the numbers for one plant?",
      },
    ],
  },

  signals: {
    h2: "Every power bill has an owner.",
    cards: [
      {
        kind: "keyword",
        title: "Posts about the power bill",
        body: "Pancake keeps the facility and finance leaders who write them, and shows you the post.",
        watching: ["energy costs", "demand charges", "utility rate hike"],
        more: 2,
      },
      {
        kind: "hiring",
        title: "Companies hiring energy managers",
        body: "An open energy role means the bill is getting an owner, so Pancake finds the ops or finance leader there.",
        watching: ["Energy manager", "Facilities manager", "Plant engineer"],
        more: 1,
      },
      {
        kind: "influencer",
        title: "Fans of energy voices",
        body: "When a CFO or facility head comments on an energy expert’s post, Pancake brings you that person.",
        watching: ["Joan Lasko", "Ravi Mehra", "Colleen Hartwig"],
      },
      {
        kind: "competitor",
        title: "Your rivals’ audience",
        body: "Pancake finds the buyers among the people reacting to other solar developers’ posts.",
        watching: ["Ampridge Solar", "Sunquarry Commercial", "Heliaport Energy"],
      },
    ],
  },

  faq: [
    {
      q: "Do you find residential customers?",
      a: "No. Pancake finds decision makers at businesses, from what they post on LinkedIn and from job posts. It doesn’t sell lead lists.",
    },
    {
      q: "Can it find buildings by roof size or permits?",
      a: "No. Pancake has no property, permit or map data. It finds the people, and you qualify the site on the first call.",
    },
    {
      q: "Can I target my service area?",
      a: "By country, yes. State or city targeting isn’t reliable, and a company’s buildings can sit far from its head office. Confirm the site before you quote.",
    },
    {
      q: "Many businesses lease. Can it find the building owner?",
      a: "No. Pancake can’t see who owns a building. Add heads of real estate as a buyer role in your Brain, and Pancake checks every lead against it.",
    },
  ],

  related: ["sustainability-consultants", "industrial-tech-startups", "logistics-tech-startups", "consultants"],

  cta: { title: "Cut a plant’s power bill." },
};
