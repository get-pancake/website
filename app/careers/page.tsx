import type { Metadata, Viewport } from "next";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import "@/app/_styles/landing-v3.css";
import "@/app/_styles/landing-v3/careers.css";

/**
 * Careers — the standout.work company-page format (founder, 2026-08-24 round
 * 7: dense, no viewport-filling bands, no mascot) rebuilt in the landing-v3
 * design system (2026-08-28): Aeonik Condensed display headings, #fbf6f1 page,
 * cream cards, pastel `.lp-chip` quick facts, left-justified copy. Facts
 * sourced from linkedin.com/company/get-pancake; ROLES stays empty until real
 * postings exist. careers.css is imported here (not in the landing-v3.css
 * manifest) so the homepage bundle doesn't carry it.
 */


/* Status-bar zone matches the lp cream (Dynamic Island fix, 2026-08-31) */
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title: "Careers — Pancake",
  description:
    "Pancake is five people in San Francisco building the AI agents that bring small businesses customers. See open roles, meet the team, or send a note.",
  alternates: { canonical: `${SITE_ORIGIN}/careers` },
};

type Role = {
  title: string;
  department: string;
  blurb: string;
  type: string;
  location: string;
  href: string;
};

type TeamMember = {
  name: string;
  role: string;
  photo?: string;
  linkedin?: string;
};

type Fact = {
  label: string;
  tone: "purple" | "yellow" | "green" | "pink" | "blue" | "orange";
  href?: string;
};

const ROLES: Role[] = [];

const FACTS: Fact[] = [
  { label: "5 people", tone: "purple" },
  { label: "San Francisco, CA", tone: "yellow" },
  { label: "$5M seed", tone: "green" },
  { label: "Founded 2026", tone: "pink" },
  { label: "LinkedIn", tone: "blue", href: "https://www.linkedin.com/company/get-pancake" },
  { label: "X", tone: "orange", href: "https://x.com/getpancake_ai" },
];

/* Titles as each person states them publicly (LinkedIn headlines / funding
   announcements, researched 2026-08-24). Photos are their public avatars in
   /public/team. */
const TEAM: TeamMember[] = [
  {
    name: "Guillaume Marquis",
    role: "Co-founder & CEO",
    photo: "/team/guillaume.jpg",
    linkedin: "https://www.linkedin.com/in/marquis-guillaume/",
  },
  {
    name: "François de Fitte",
    role: "Co-founder & COO",
    photo: "/team/francois.jpg",
    linkedin: "https://www.linkedin.com/in/francoisdefitte/",
  },
  {
    name: "Tristan Comte",
    role: "Founding GTM",
    photo: "/team/tristan.jpg",
    linkedin: "https://www.linkedin.com/in/tristan-comte-7b460b129/",
  },
  {
    name: "Zakaria Benhadi",
    role: "Founding Engineer",
    photo: "/team/zakaria.jpg",
    linkedin: "https://www.linkedin.com/in/zakaria-benhadi-13b02288/",
  },
  {
    name: "Théophile Cousin",
    role: "Founding Engineer",
    photo: "/team/theophile.jpg",
    linkedin: "https://www.linkedin.com/in/theocousin/",
  },
];

const APPLY_EMAIL = "guillaume@getpancake.ai";

export default function CareersPage() {
  return (
    <main id="main-content" className="lp">
      <LpNav />

      {/* Hero + quick facts */}
      <section className="lp-crs-hero" aria-labelledby="careers-heading">
        <div className="lp-content lp-crs-hero__inner">
          <h1 id="careers-heading" className="lp-crs-hero__title lp-title-section">
            Build the autonomous GTM team.
          </h1>
          <p className="lp-crs-lede lp-crs-hero__lede">
            Pancake&rsquo;s agents find warm leads and grow AI search visibility for small
            businesses, on their own. We are five people in San Francisco, and every hire
            shapes the company.
          </p>
          <ul className="lp-crs-facts" aria-label="Company facts">
            {FACTS.map((fact) => (
              <li key={fact.label}>
                {fact.href ? (
                  <a
                    className="lp-chip lp-crs-fact"
                    data-tone={fact.tone}
                    href={fact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fact.label}
                    <span aria-hidden="true" className="lp-crs-fact__mark">
                      &#8599;
                    </span>
                  </a>
                ) : (
                  <span className="lp-chip lp-crs-fact" data-tone={fact.tone}>
                    {fact.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Open roles */}
      <section className="lp-crs-section" aria-labelledby="careers-roles-heading">
        <div className="lp-content lp-crs-section__inner">
          <h2 id="careers-roles-heading" className="lp-crs-h2">
            Open roles
          </h2>
          {ROLES.length === 0 ? (
            <p className="lp-crs-empty">
              None right now.{" "}
              <span className="lp-crs-empty__sub">New roles land on this page first.</span>
            </p>
          ) : (
            <ul className="lp-crs-roles">
              {ROLES.map((role) => (
                <li key={role.title}>
                  <a className="lp-crs-role" href={role.href}>
                    <span className="lp-crs-role__main">
                      <span className="lp-crs-role__title lp-display">
                        {role.title}
                        <span className="lp-chip lp-crs-role__chip">{role.department}</span>
                      </span>
                      <span className="lp-crs-role__blurb">{role.blurb}</span>
                    </span>
                    <span className="lp-crs-role__meta">
                      {role.type} &middot; {role.location}
                      <span aria-hidden="true" className="lp-crs-role__arrow">
                        &rarr;
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* The team */}
      {TEAM.length > 0 && (
        <section id="team" className="lp-crs-section" aria-labelledby="careers-team-heading">
          <div className="lp-content lp-crs-section__inner">
            <h2 id="careers-team-heading" className="lp-crs-h2">
              The team
            </h2>
            <ul className="lp-crs-team">
              {TEAM.map((member) => (
                <li key={member.name} className="lp-crs-member">
                  {member.photo && (
                    // eslint-disable-next-line @next/next/no-img-element -- small static portraits
                    <img
                      className="lp-crs-member__photo"
                      src={member.photo}
                      alt=""
                      width={400}
                      height={400}
                      loading="lazy"
                    />
                  )}
                  <span className="lp-crs-member__name lp-display">{member.name}</span>
                  <span className="lp-crs-member__role">{member.role}</span>
                  {member.linkedin && (
                    <a
                      className="lp-crs-member__link"
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      LinkedIn{" "}
                      <span aria-hidden="true" className="lp-crs-fact__mark">
                        &#8599;
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Always-hiring note */}
      <section className="lp-crs-note" aria-labelledby="careers-note-heading">
        <div className="lp-content">
          <div className="lp-crs-note__card">
            <div className="lp-crs-note__text">
              <h2 id="careers-note-heading" className="lp-crs-note__title lp-display">
                Don&rsquo;t see your role?
              </h2>
              {/* Founder 2026-09-01: keep the full sentence but on ONE line —
                  the wrap came from the text column's width, fixed in
                  careers.css, not by trimming copy. */}
              <p className="lp-crs-lede">
                We&rsquo;re always interested in exceptional people. Send a note to{" "}
                <a className="lp-crs-mail" href={`mailto:${APPLY_EMAIL}`}>
                  {APPLY_EMAIL}
                </a>
                .
              </p>
            </div>
            {/* No data-analytics-id: mailto isn't an allow-listed app CTA — must not
                fire app_cta_clicked (isAppCtaId(null) is false). */}
            <LpFxLink href={`mailto:${APPLY_EMAIL}`} className="lp-crs-note__btn">
              Send a note
            </LpFxLink>
          </div>
        </div>
      </section>

      <LpFooter />
    </main>
  );
}
