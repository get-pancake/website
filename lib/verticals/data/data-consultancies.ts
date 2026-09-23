// lib/verticals/data/data-consultancies.ts — /for/data-consultancies.
// Merged in: BI consultancies, analytics consultancies, data-platform partners.
// Every person, company, rival consultancy, influencer and workspace below is invented.
// Evidence: 1 paying product-analytics consultancy (+ an e-commerce data consultancy counted under consultants).
// Caveat: Stack names are job-post mentions, not verified usage; Stack matches any listed tool (OR).
// No reply-rate numbers on the page.
import type { VerticalConfig } from "../types";

export const dataConsultancies: VerticalConfig = {
  slug: "data-consultancies",
  status: "approved",
  category: "IT, cloud & security",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "data consultancies",
    title: "Data consultancies",
    short: "data consultants",
    badge: "For data consultancies",
  },

  meta: { seoTitle: "Pancake for Data Consultancies: Teams Hiring Data Roles" },

  hubLine: "Find CFOs posting about bad data and teams hiring data roles.",

  hero: {
    title: "Find CFOs who say their dashboards disagree.",
    lede: "Pancake reads data engineer openings, Snowflake job ads and who likes your posts. Sell them one set of numbers.",
  },

  workspace: { name: "Okoye Analytics", sender: "Nneka Okoye" },

  demo: {
    h2: "Find the team that outgrew spreadsheets.",
    prompts: [
      {
        kind: "hiring",
        text: "We build data stacks. Find US online retailers with 100 to 500 staff hiring a data engineer.",
        reply: "I’ll flag data roles at US online retailers that size and find who leads data.",
        proposal: [
          { kind: "hiring", items: ["Data engineer", "Analytics engineer", "BI developer"] },
          { kind: "stack", items: ["Snowflake", "dbt"] },
          { kind: "keyword", items: ["single source of truth", "data warehouse"] },
          { kind: "competitor", items: ["Merganser Analytics"] },
        ],
        leads: [
          { name: "Talin Sarkissian", role: "Head of Data", company: "Pomfret Goods", kind: "hiring", signal: "Data engineer role" },
          { name: "Porter Alcaraz", role: "VP Analytics", company: "Saltmarsh Co", kind: "hiring", signal: "Analytics engineer role" },
          { name: "Agata Pruszynski", role: "BI Manager", company: "Ashgill", kind: "stack", signal: "dbt in job posts" },
          { name: "Venkat Ramaswamy", role: "CFO", company: "Tessford", kind: "keyword", signal: "Source of truth post" },
          { name: "Greta Holmquist", role: "Head of BI", company: "Vellmar", kind: "competitor", signal: "Liked a Merganser post" },
        ],
        featured: {
          why: "Pomfret Goods, a 230-person US online retailer, is hiring a data engineer. Talin heads its data team.",
          confidence: 92,
          seniority: "Head",
        },
        message:
          "Hi Talin, I build data stacks, usually starting with the pipelines. Which report does everyone ask your team for first?",
      },
      {
        kind: "stack",
        text: "We’re a Snowflake partner. Find US companies whose job posts mention Snowflake or Power BI.",
        reply: "I’ll find US companies hiring for Snowflake or Power BI skills, then their data lead.",
        proposal: [
          { kind: "stack", items: ["Snowflake", "Power BI"] },
          { kind: "hiring", items: ["Head of Data", "Power BI developer"] },
          { kind: "own_brand", items: ["Okoye Analytics", "Nneka Okoye"] },
        ],
        leads: [
          { name: "Dorothea Blankenship", role: "VP Data", company: "Pembury Supply", kind: "stack", signal: "Snowflake in job posts" },
          { name: "Octavio Barragan", role: "CTO", company: "Wrenhurst", kind: "stack", signal: "Power BI in job posts" },
          { name: "Hyun-woo Jang", role: "COO", company: "Marrick", kind: "hiring", signal: "Head of Data role" },
          { name: "Nomvula Dlamini", role: "BI Lead", company: "Castlemont", kind: "hiring", signal: "Power BI developer role" },
          { name: "Ellis Brockway", role: "CFO", company: "Sedgemoor", kind: "own_brand", signal: "Liked your post" },
        ],
        featured: {
          why: "Dorothea runs data at Pembury Supply, a 400-person US distributor. Snowflake shows up in its open job posts.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Dorothea, glad to be connected. My team builds data models alongside in-house analysts. What’s next on your data roadmap?",
      },
      {
        kind: "keyword",
        text: "Find CFOs at US companies posting about data quality or dashboard sprawl. We fix reporting.",
        reply: "I’ll watch posts about data quality and dashboard sprawl, and keep US finance leaders.",
        proposal: [
          { kind: "keyword", items: ["data quality", "dashboard sprawl", "month-end reporting"] },
          { kind: "competitor", items: ["Merganser Analytics", "Ormond Data"] },
          { kind: "influencer", items: ["Odalys Brennan"] },
        ],
        leads: [
          { name: "Lamont Whitacre", role: "CFO", company: "Keelby Materials", kind: "keyword", signal: "Posted on data quality" },
          { name: "Faisal Rahimtoola", role: "Controller", company: "Coltmoor", kind: "keyword", signal: "Posted on dashboards" },
          { name: "Winifred Asante", role: "VP Finance", company: "Tallbrook", kind: "competitor", signal: "Liked an Ormond post" },
          { name: "Mateus Coelho", role: "Head of Data", company: "Lindmoor", kind: "influencer", signal: "Liked a Brennan post" },
          { name: "Priscila Monteiro", role: "CFO", company: "Harwick", kind: "keyword", signal: "Posted on month-end" },
        ],
        featured: {
          why: "Lamont is CFO at Keelby Materials, a 210-person US building-products maker. His post says no two reports agree on revenue.",
          confidence: 85,
          seniority: "C-level",
        },
        message:
          "Hi Lamont, you wrote that no two reports at Keelby agree on revenue. Which two drift apart the most?",
      },
    ],
  },

  signals: {
    h2: "A data job post is a project brief.",
    cards: [
      {
        kind: "hiring",
        title: "Companies hiring data roles",
        body: "Pancake reads data and BI job posts, then finds the head of data or CFO above the role.",
        watching: ["Data engineer", "Analytics engineer"],
        more: 3,
      },
      {
        kind: "stack",
        title: "Snowflake, dbt, Power BI",
        body: "Pancake matches job posts that name the warehouse and BI tools you build on.",
        watching: ["Snowflake", "dbt", "Power BI", "Tableau"],
        more: 3,
      },
      {
        kind: "keyword",
        title: "Numbers nobody trusts",
        body: "CFOs and data leads who post about data quality, dashboard sprawl or month-end close become leads.",
        watching: ["data quality", "dashboard sprawl"],
        more: 2,
      },
      {
        kind: "own_brand",
        title: "People engaging with you",
        body: "Heads of data who like or comment on your team’s posts become leads, checked against your ICP.",
        watching: ["Okoye Analytics", "Nneka Okoye"],
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake tell which companies run Snowflake?",
      a: "Only through job posts. When a company’s open roles name Snowflake, it matches. Pancake never sees inside their warehouse.",
    },
    {
      q: "Snowflake is in lots of job posts. Won’t I drown in leads?",
      a: "No. Pancake sends 5 to 15 leads a day, each checked against your ICP. Narrow the size or industry and the list gets sharper.",
    },
    {
      q: "Can I target finance buyers, not data teams?",
      a: "Yes. List CFOs and controllers as buyers in your Brain. Leads in other roles get rejected.",
    },
    {
      q: "We only do Power BI. Will I get Tableau shops?",
      a: "Not through Stack unless you add Tableau. Stack matches any tool on your list, so leave off the ones you don’t serve.",
    },
  ],

  related: ["cloud-consultancies", "consultants", "revops-consultants", "msps"],

  cta: { title: "Their numbers need you." },
};
