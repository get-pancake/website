import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Blog-wide metadata shared by the /blog index, each post and the RSS feed
 * (app/blog/rss.xml/route.ts), so the three never drift apart.
 */

export const BLOG_TITLE = "The Pancake blog";

export const BLOG_DESCRIPTION =
  "Guides and tool comparisons for founders who sell: buying signals, warm leads, outreach and the AI tools that run go-to-market.";

/** RSS 2.0 feed of every post, linked from <head> via `alternates.types`. */
export const BLOG_FEED_URL = `${SITE_ORIGIN}/blog/rss.xml`;

/** `alternates.types` entry for page metadata (2026-10-07, audit 6.12). */
export const BLOG_FEED_ALTERNATE = {
  "application/rss+xml": [{ url: BLOG_FEED_URL, title: BLOG_TITLE }],
};

const ORG_ID = `${SITE_ORIGIN}/#organization`;

type TeamAuthor = { jobTitle: string; sameAs: string[] };

/* Team members who sign posts, as /careers lists them (titles and profile
   links mirror TEAM in app/careers/page.tsx: keep the two in sync). Their
   Person node points at /careers, where the team section lives (2026-10-07,
   audit 6.3: Article authors had a name and nothing else). */
const TEAM_AUTHORS: Record<string, TeamAuthor> = {
  "Guillaume Marquis": {
    jobTitle: "Co-founder & CEO",
    sameAs: ["https://www.linkedin.com/in/marquis-guillaume/"],
  },
  "François de Fitte": {
    jobTitle: "Co-founder & COO",
    sameAs: ["https://www.linkedin.com/in/francoisdefitte/"],
  },
  "Tristan Comte": {
    jobTitle: "Founding GTM",
    sameAs: ["https://www.linkedin.com/in/tristan-comte-7b460b129/"],
  },
  "Zakaria Benhadi": {
    jobTitle: "Founding Engineer",
    sameAs: ["https://www.linkedin.com/in/zakaria-benhadi-13b02288/"],
  },
};

/* Bylines that stand for several team members. */
const SHARED_BYLINES: Record<string, string[]> = {
  "François & Guillaume": ["François de Fitte", "Guillaume Marquis"],
};

/* Bylines that are the company, not a person. */
const ORG_BYLINES = new Set(["Pancake", "Pancake Team"]);

function person(name: string) {
  const team = TEAM_AUTHORS[name];
  // A byline that isn't on /careers keeps its name only: no team page or
  // profile is claimed for someone the site doesn't list.
  if (!team) return { "@type": "Person", name };
  return {
    "@type": "Person",
    name,
    url: `${SITE_ORIGIN}/careers`,
    jobTitle: team.jobTitle,
    worksFor: { "@id": ORG_ID },
    sameAs: team.sameAs,
  };
}

/**
 * Article `author` for a frontmatter byline: one Person, several Persons for a
 * shared byline, or null when the post should credit the organization (no
 * byline, or a company byline like "Pancake Team").
 */
export function articleAuthor(byline: string | undefined) {
  if (!byline || ORG_BYLINES.has(byline)) return null;
  const names = SHARED_BYLINES[byline];
  return names ? names.map(person) : person(byline);
}

/**
 * True when every name behind a byline is on /careers (TEAM_AUTHORS). The
 * Slack unfurl's "Written by" row shows only those (2026-10-07): the other
 * bylines (audit 1.15) wait on François's confirmation.
 */
export function isTeamByline(byline: string | undefined): byline is string {
  if (!byline) return false;
  const names = SHARED_BYLINES[byline] ?? [byline];
  return names.every((n) => n in TEAM_AUTHORS);
}
