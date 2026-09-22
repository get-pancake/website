// lib/verticals/data/logistics-tech-startups.ts — /for/logistics-tech-startups.
// Buyers: operations and supply-chain leads at 3PLs, carriers and brands shipping at volume.
// Caveat (brief): small carriers and owner-operators are sparse on LinkedIn. No freight, shipment
// or load-board data. Never cite the homepage marquee's logistics logos as proof for this vertical.
// Every person, company, rival vendor, influencer and workspace below is invented; Manhattan WMS,
// Manhattan SCALE, SAP EWM, Samsara and McLeod are real tools named in job posts (Stack signal).
import type { VerticalConfig } from "../types";

export const logisticsTechStartups: VerticalConfig = {
  slug: "logistics-tech-startups",
  status: "approved",
  category: "Vertical software",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "logistics tech startups",
    title: "Logistics tech startups",
    short: "logistics founders",
    badge: "For logistics startups",
  },

  meta: { seoTitle: "Pancake for Logistics Tech Startups: Supply Chain Buyers" },

  hubLine: "Find the ops leaders at 3PLs, carriers and shippers.",

  hero: {
    h1: ["You build for 3PLs", "We bring you customers"],
    lede: "Pancake finds 3PLs hiring dispatchers, then the ops leader behind the hire. You reach them before peak season.",
  },

  workspace: { name: "Lanewright", sender: "Gunnar Thorsby" },

  demo: {
    h2: "Peak season starts in the job posts.",
    prompts: [
      {
        kind: "hiring",
        text: "Our routing tool cuts dispatch work. Find US 3PLs hiring dispatchers or load planners.",
        reply: "I'll watch dispatch job posts at US 3PLs and find the ops leader who owns the team.",
        proposal: [
          { kind: "hiring", items: ["Dispatcher", "Load planner", "Transportation planner"] },
          { kind: "stack", items: ["Samsara", "McLeod"] },
          { kind: "keyword", items: ["empty miles", "dispatch workload"] },
          { kind: "competitor", items: ["Haulbridge TMS"] },
        ],
        leads: [
          { name: "Ray Delgadillo", role: "VP Operations", company: "Tolan Logistics", kind: "hiring", signal: "3 dispatcher roles open" },
          { name: "Shanelle Pickens", role: "Dispatch Manager", company: "Kimber Haul", kind: "hiring", signal: "Load planner role open" },
          { name: "Trent Mazurek", role: "COO", company: "Stellwagen Carriers", kind: "stack", signal: "McLeod in job posts" },
          { name: "Elvira Arambula", role: "Head of Linehaul", company: "Brackman LTL", kind: "keyword", signal: "Posted on empty miles" },
          { name: "Earl Haskins", role: "Branch Manager", company: "Garvey 3PL", kind: "competitor", signal: "Liked a Haulbridge post" },
        ],
        featured: {
          why: "Tolan Logistics is a 400-person 3PL in Memphis with three dispatcher roles open. Ray runs operations and owns the dispatch team.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Ray, saw Tolan Logistics has three dispatcher roles open. Hiring is one way to cover more loads. Our routing tool builds the day’s plan, so each dispatcher runs more trucks. Worth seeing it on one of your lanes?",
      },
      {
        kind: "keyword",
        text: "Our tool cuts late deliveries. Find US heads of logistics posting about peak season.",
        reply: "I'll watch US logistics leaders’ posts about peak season and late deliveries.",
        proposal: [
          { kind: "keyword", items: ["peak season", "on-time delivery"] },
          { kind: "influencer", items: ["Ignatius Wray"] },
          { kind: "hiring", items: ["Transportation manager", "Logistics coordinator"] },
        ],
        leads: [
          { name: "Kiara Vandiver", role: "Head of Logistics", company: "Cragmoor", kind: "keyword", signal: "Posted on peak season" },
          { name: "Wade Pruneda", role: "VP Supply Chain", company: "Ferrin Home", kind: "keyword", signal: "Posted about delays" },
          { name: "Latisha Fairley", role: "Fulfillment Lead", company: "Haverly Tea", kind: "influencer", signal: "Liked a Wray post" },
          { name: "Hamza Siddiqui", role: "Logistics Manager", company: "Deckle", kind: "hiring", signal: "Transport manager role" },
          { name: "Carla Buonocore", role: "COO", company: "Barkwell Pet Co", kind: "keyword", signal: "Posted about peak prep" },
        ],
        featured: {
          why: "Cragmoor is a 350-person US outdoor gear brand. Kiara leads logistics and posted about peak season prep this week.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Kiara, read your post about peak season prep at Cragmoor. Late orders in the holiday rush cost the most goodwill. Our tool flags at-risk shipments while there’s still time to reroute. Worth a short call before the rush?",
      },
      {
        kind: "stack",
        text: "Our slotting tool works with Manhattan WMS. Find US distributors whose job posts name it.",
        reply: "I'll watch job posts that name Manhattan WMS and find who runs the warehouses.",
        proposal: [
          { kind: "stack", items: ["Manhattan WMS", "Manhattan SCALE"] },
          { kind: "hiring", items: ["Warehouse operations manager", "Inventory control manager"] },
          { kind: "keyword", items: ["warehouse automation", "mis-picks"] },
        ],
        leads: [
          { name: "Min-jun Yeom", role: "VP Distribution", company: "Corliss Supply", kind: "stack", signal: "Manhattan in job posts" },
          { name: "Teodora Radu", role: "DC Manager", company: "Halsted Parts", kind: "stack", signal: "SCALE in job posts" },
          { name: "Duane Hovland", role: "Warehouse Manager", company: "Ilex Foods", kind: "hiring", signal: "Warehouse ops role" },
          { name: "Clayton Mercado", role: "VP Operations", company: "Ormsby Paper", kind: "keyword", signal: "Posted about mis-picks" },
          { name: "Araceli Ochoa", role: "COO", company: "Quimby Goods", kind: "hiring", signal: "Inventory control role" },
        ],
        featured: {
          why: "Corliss Supply is a 1,200-person US distributor. Its warehouse job posts name Manhattan WMS, and Min-jun runs distribution.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Min-jun, saw Corliss Supply’s warehouse roles ask for Manhattan WMS experience. We built a slotting layer that works alongside Manhattan and shortens pick paths. Could I show you the math on one of your DCs?",
      },
    ],
  },

  signals: {
    h2: "Freight pain shows up on LinkedIn.",
    cards: [
      {
        kind: "hiring",
        title: "3PLs hiring dispatchers",
        body: "When a carrier or 3PL posts a dispatch or planner job, Pancake finds who runs that team.",
        watching: ["Dispatcher", "Load planner", "Transportation planner"],
        more: 2,
      },
      {
        kind: "stack",
        title: "WMS and TMS in job posts",
        body: "Job posts that ask for your WMS, TMS or telematics tool put the company on your list.",
        watching: ["Manhattan WMS", "SAP EWM", "Samsara", "McLeod"],
      },
      {
        kind: "competitor",
        title: "Fans of the legacy TMS",
        body: "Pancake finds ops leaders reacting to posts from the vendors your product replaces.",
        watching: ["Haulbridge TMS", "Cratewell Systems"],
      },
      {
        kind: "keyword",
        title: "Ops leaders talking peak season",
        body: "Pancake finds supply chain leaders posting about late loads, freight costs or peak prep.",
        watching: ["peak season", "freight costs", "on-time delivery"],
        more: 2,
      },
    ],
  },

  faq: [
    {
      q: "Our buyers rarely post on LinkedIn. Will it work?",
      a: "Partly. Hiring and Stack read job posts, so a 3PL surfaces even if its leaders never post. Keyword and Competitor need people who engage.",
    },
    {
      q: "Can it find small trucking fleets?",
      a: "Rarely. Owner-operators are thin on LinkedIn. Fleets big enough to hire dispatchers and post jobs show up.",
    },
    {
      q: "Do you track shipments or freight data?",
      a: "No. Pancake sees who hires dispatchers and who posts about delivery. It never sees loads, lanes or shipments.",
    },
    {
      q: "Is this only useful around peak season?",
      a: "No. Hiring and Stack run all year. Peak season is one keyword, and you can swap keywords in your Brain any time.",
    },
  ],

  related: ["industrial-tech-startups", "retail-tech-startups", "saas-startups", "ai-startups"],

  cta: { title: "Get in before peak." },
};
