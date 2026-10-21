/**
 * Landing v3 — Footer (Figma node 4258:253, 1654×515, bg #000).
 * Brand block at x259; right-aligned link columns (the artboard had three,
 * right edges at frame x1011/1203/1395). Internal targets use relative hrefs
 * (same tab); external targets open in a new tab. Contact opens the support
 * page so visitors can reach us without a configured desktop mail client.
 * "Affiliate program" is a founder addition (2026-09-03: "Affiliate should
 * appear in the footer of the landing page") — the artboard's Company column
 * has four links; don't drop it to match Figma.
 * 2026-10-07: four columns instead of three. Product gains Industries,
 * Pancake in Claude and "Sign in" (was "Open the app": same app link, same
 * tab, signin_footer id); a Resources column links the Blog, Support and the
 * agent setup; "About" points at the team on /careers
 * instead of the /#why banner. The bottom line reads "© 2026 Pancake".
 * 2026-10-07 (founder: "inspire-toi de la compet pour rendre accessible les
 * pages que t'as créées"): the fat footer Unify and Origami run. Product links
 * the example Plays, Resources the /compare hub, and a
 * Compare column lists the GTM-tool comparison pages plus "All comparisons".
 * This reverses the 2026-09-03 call to keep the comparison pages out of the
 * link tree, and drops this header's "No Compare column (D13)" note. The
 * column reads compare-data.ts (the hub's own list), so a page added to the
 * "GTM tools" group shows up here too; the "AI agents" pages (Claude Tag,
 * Viktor, OpenClaw, Paperclip) are live but listed nowhere since 2026-10-13
 * (founder: not competitors any more; COMPARE_HUB_GROUPS in compare-data.ts).
 * footer.css lays the columns out in flow (no fixed height), so a longer list
 * or another column never overflows. Social is unchanged ("LinkedIn" label:
 * open founder decision D23).
 * 2026-10-17 (founder: a "Features" column "like Gojiberry's", whose column
 * lists one connect page per assistant and a recently-funded-startups page):
 * Features = the three connect pages (/claude, /chatgpt, /codex) and the three
 * signal pages under /plays (funding, hiring, tech stack), every entry a real
 * page. It takes the Resources column's place: six columns need ~1,050px beside
 * the brand block and the ≥1200 band leaves 863. Resources' four links all
 * still have a home: Blog moved to Company, "Comparisons" was a second
 * "All comparisons" (/compare), "Support" a second "Contact" (/support), and
 * "Connect your agent" (/claude#setup) is what the connect entries are now.
 * "Pancake in Claude" left Product for the same reason: it is "Connect Claude".
 * Labels stay ≤ 153px at 16px ("Gojiberry vs Pancake", the widest), so none
 * wraps in the phone sheet's 155px columns at 375.
 */

import { COMPARE_PATH, COMPARISONS, compareName, comparePath } from "@/components/sections/compare/compare-data";
import { CONNECT_PATHS } from "@/components/sections/guide-claude/connect-copy";
import { GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import { PLAYS_PATH } from "@/components/sections/plays/plays-copy";
import { SIGNAL_PAGE_ORDER, SIGNAL_PAGES } from "@/components/sections/plays/plays-signals";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { SUPPORT_PATH } from "@/lib/contact";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

type FootLink = { label: string; href: string; external?: boolean; analyticsId?: string };

const COLUMNS: { id: string; title: string; links: FootLink[] }[] = [
  {
    id: "product",
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Example Plays", href: PLAYS_PATH },
      { label: "Pricing", href: "/pricing" },
      { label: "Industries", href: "/for" },
      { label: "Sign in", href: APP_ORIGIN, analyticsId: "signin_footer" },
    ],
  },
  {
    id: "features",
    title: "Features",
    links: [
      // one page per AI client (Claude's is the guide, which covers Claude Code too)
      { label: "Connect Claude", href: GUIDE_PATH },
      { label: "Connect ChatGPT", href: CONNECT_PATHS.chatgpt },
      { label: "Connect Codex", href: CONNECT_PATHS.codex },
      // one page per way a Play finds companies (plays-signals.ts)
      ...SIGNAL_PAGE_ORDER.map((id) => ({ label: SIGNAL_PAGES[id].footerLabel, href: SIGNAL_PAGES[id].path })),
    ],
  },
  {
    id: "compare",
    title: "Compare",
    links: [
      // Origami, Unify, Octave, Alta, Lemlist, Gojiberry today, in hub order.
      // Each label is the page's H1 ("Origami vs Pancake").
      ...COMPARISONS.filter((c) => c.group === "GTM tools").map((c) => ({
        label: compareName(c),
        href: comparePath(c),
      })),
      { label: "All comparisons", href: COMPARE_PATH },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      // The team and the company facts live on /careers until /about exists.
      { label: "About", href: "/careers#team" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Affiliate program", href: "https://partners.dub.co/pancake-ai", external: true },
      // Same tab: /demo (François, 2026-09-16), no longer the Calendly form.
      { label: "Talk to sales", href: DEMO_PAGE_PATH },
      { label: "Contact", href: SUPPORT_PATH },
    ],
  },
  {
    id: "social",
    title: "Social",
    links: [
      { label: "X", href: "https://x.com/getpancake_ai", external: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/get-pancake", external: true },
      { label: "Discord", href: "https://discord.gg/brJ99Up6ym", external: true },
      { label: "YouTube", href: "https://www.youtube.com/@trypancake", external: true },
      { label: "TikTok", href: "https://www.tiktok.com/@getpancake", external: true },
      { label: "Instagram", href: "https://www.instagram.com/get.pancake", external: true },
    ],
  },
];

export function LpFooter() {
  return (
    <footer className="lp-foot">
      <div className="lp-foot-frame">
        <div className="lp-foot-brand">
          <img
            className="lp-foot-logo"
            src="/lp/lp-footer-logo.svg"
            alt=""
            width={239.672}
            height={116.755}
          />
          <p className="lp-foot-lines">
            © 2026 Pancake
            <br />
            San Francisco, CA
          </p>
          <p className="lp-foot-legal">
            <a href="/privacy">Privacy</a> • <a href="/terms">Terms</a>
          </p>
        </div>
        <nav className="lp-foot-cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            /* labelled groups (2026-10-07), like the phone sheet's: a screen
               reader hears which column a link belongs to */
            <div
              key={col.id}
              className="lp-foot-col"
              data-col={col.id}
              role="group"
              aria-labelledby={`lp-foot-h-${col.id}`}
            >
              <p className="lp-foot-head" id={`lp-foot-h-${col.id}`}>
                {col.title}
              </p>
              <div className="lp-foot-links">
                {col.links.map((link) =>
                  link.external ? (
                    <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <a key={link.label} href={link.href} data-analytics-id={link.analyticsId}>
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>
        {/* ≤767 only (CSS-gated): compact meta line replacing lines + legal. */}
        <p className="lp-foot-line">
          {"© 2026 Pancake · San Francisco, CA · "}
          <a href="/privacy">Privacy</a>
          {" · "}
          <a href="/terms">Terms</a>
        </p>
      </div>
    </footer>
  );
}
