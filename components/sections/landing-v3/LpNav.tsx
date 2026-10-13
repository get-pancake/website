import type { CSSProperties, ReactNode } from "react";

import { GUIDE_PATH } from "@/components/sections/guide-claude/guide-copy";
import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNavMenu, type LpNavItem } from "@/components/sections/landing-v3/LpNavMenu";
import { LpNavScroll } from "@/components/sections/landing-v3/LpNavScroll";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { navGroups, verticalPath } from "@/lib/verticals";
import type { VerticalCategory } from "@/lib/verticals/types";

/**
 * Landing v3 — Nav (Figma node 4257:4894, 1654×120; V2 4911:347 for the CTA
 * pair, 2026-10-09).
 * Logo left edge 179px, links dead-center, dark CTA right-anchored at the
 * same 179px margin (= the 1296 content grid's side margin at 1654).
 * Link targets are provisional (not specified in Figma) — flagged in the PR.
 * 2026-10-07: "Pricing" (/pricing) replaces the artboard's "Company" (/#why,
 * the 10x banner, not a company page; About lives in the footer). Returning
 * customers had no way in but "Start free", so "Sign in" joined the bar; its
 * signin_nav id stays out of the acquisition allow-list (no app_cta_clicked).
 * CTA pair, Figma V2 4911:347 (designer red note, 2026-10-09: "Sign in
 * instead of Book a demo"): [Sign in, tinted 73×38] 8 [Start free, dark
 * 110×38], the primary last, right edge on the 179px margin. "Book a demo"
 * (call_nav) left the bar for that pill: it stays in the hero, the final CTA
 * and the phone sheet. Production labels win over V2's ("Start free", not
 * "Get started free"; founder 2026-09-03: "button keep same sizes").
 * ≤767px (Figma mobile node 4389:8182): logo + Start free + burger — the
 * links, Sign in and Book a demo live in LpNavMenu's sheet.
 *
 * Menus (founder 2026-10-07, "inspire-toi de la compet pour rendre accessible
 * les pages que t'as créées"): /plays, /compare and the Claude guide were
 * linked from nowhere but the sitemap. Like Unify and Octave, the bar reads
 * Product ▾ · Industries ▾ · Pricing · Resources ▾; "Blog" moved into
 * Resources, and "Resources" links to /blog. PRODUCT_MENU and RESOURCES_MENU
 * are the one source: the phone sheet gets them as props. No changelog
 * (founder 2026-10-08: a dated feed needs an entry every release) and so no
 * release bar above the nav either; a launch-day bar can come back here.
 *
 * Every ▾ entry is the same disclosure (LpNavDisclosure, born as "Industries",
 * founder 2026-09-22, "do like Origami"): a plain link to the entry's main
 * page, then a caret button that discloses a panel. Server-rendered, so every
 * menu link is in the HTML of every page that carries the nav (crawlable).
 * The panel is a disclosure (not a menu): LpNavMenu's effect — the nav's
 * client island — opens it on a settled hover or on the caret (click / Enter
 * / Space) and closes it on Escape, pointer leave (after a grace), focus
 * leaving, a press outside, or another entry opening (one open at a time);
 * data-open / data-closing on .lp-nav-dd drive nav.css. Closed =
 * visibility:hidden, so its links are out of the Tab order: Tab goes
 * Product → caret → Industries → caret → Pricing → Resources → caret.
 * Touch (hover:none): Product and Resources keep their caret (a tap opens
 * the panel, a tap outside closes it) because their link targets don't list
 * the other pages; Industries drops it, its link is the hub that lists every
 * vertical.
 */
export function LpNav() {
  return (
    <header className="lp-nav">
      <a className="lp-nav-logo" href="/" aria-label="Pancake home">
        <img alt="" src="/lp/lp-nav-logo.svg" width={114.956} height={56} />
      </a>
      <nav className="lp-nav-links" aria-label="Primary">
        <LpNavDisclosure
          name="product"
          label="Product"
          href="/#how-it-works"
          toggleLabel="Show product pages"
          className="lp-nav-dd--menu"
        >
          <LpNavMenuList items={PRODUCT_MENU} />
        </LpNavDisclosure>
        <LpNavIndustries />
        <a href="/pricing">Pricing</a>
        <LpNavDisclosure
          name="resources"
          label="Resources"
          href="/blog"
          toggleLabel="Show resources"
          className="lp-nav-dd--menu"
        >
          <LpNavMenuList items={RESOURCES_MENU} />
        </LpNavDisclosure>
      </nav>
      <div className="lp-nav-ctas">
        {/* Figma V2 4939:2634: the tinted sm pill (73×38, nav.css). Hidden
            ≤767 — the phone bar has room for one pill; the sheet carries
            Sign in as a link. */}
        <LpFxLink
          href={APP_ORIGIN}
          size="sm"
          className="lp-btn--tinted lp-nav-signin"
          data-analytics-id="signin_nav"
        >
          Sign in
        </LpFxLink>
        <LpFxLink
          href={APP_ORIGIN}
          size="sm"
          data-analytics-id="app_nav"
        >
          Start free
        </LpFxLink>
      </div>
      <LpNavMenu product={PRODUCT_MENU} resources={RESOURCES_MENU} />
      <LpNavScroll />
    </header>
  );
}

/**
 * The two compact menus (2026-10-07). Labels ≤ 3 words, one-line
 * descriptions ≤ 8 words (landing voice), each written from what its page
 * says. "Claude and Codex" is the guide's "Pancake in Claude and Codex",
 * shortened to the label budget inside the Product menu.
 */
const PRODUCT_MENU: LpNavItem[] = [
  {
    label: "How it works",
    href: "/#how-it-works",
    description: "Three steps from your website to outreach.",
  },
  {
    label: "Example Plays",
    href: "/plays",
    description: "Start from an example, or write your own.",
  },
  {
    label: "Claude and Codex",
    href: GUIDE_PATH,
    description: "Connect Pancake to Claude, Claude Code or Codex.",
  },
];

const RESOURCES_MENU: LpNavItem[] = [
  {
    label: "Blog",
    href: "/blog",
    description: "Guides and notes on finding B2B customers.",
  },
  {
    label: "Compare",
    href: "/compare",
    description: "Pancake side by side with other tools.",
  },
  {
    label: "Support",
    href: "/support",
    description: "Help with your account, billing and setup.",
  },
];

/**
 * One ▾ entry: the link to the entry's main page (works without JS and on
 * touch), the caret button that owns the panel (aria-expanded, driven by
 * LpNavMenu's effect), and the panel. `name` keys the panel id.
 */
function LpNavDisclosure({
  name,
  label,
  href,
  toggleLabel,
  className,
  panelClassName,
  cardClassName,
  children,
}: {
  name: string;
  label: string;
  href: string;
  toggleLabel: string;
  className?: string;
  panelClassName?: string;
  cardClassName?: string;
  children: ReactNode;
}) {
  const panelId = `lp-nav-${name}-panel`;
  const cx = (base: string, extra?: string) => (extra ? `${base} ${extra}` : base);
  return (
    <div className={cx("lp-nav-dd", className)}>
      <a className="lp-nav-dd__trigger" href={href}>
        {label}
      </a>
      <button
        type="button"
        className="lp-nav-dd__toggle"
        aria-expanded="false"
        aria-controls={panelId}
        aria-label={toggleLabel}
      >
        <svg className="lp-nav-dd__caret" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" focusable="false">
          <path d="M2 3.75 5 6.75l3-3" />
        </svg>
      </button>
      <div className={cx("lp-nav-dd__panel", panelClassName)} id={panelId}>
        <div className={cx("lp-nav-dd__card", cardClassName)}>{children}</div>
      </div>
    </div>
  );
}

/** A compact menu: one row per page, label over a one-line description. */
function LpNavMenuList({ items }: { items: LpNavItem[] }) {
  return (
    <ul className="lp-nav-dd__list">
      {items.map((item) => (
        <li key={item.href}>
          <a className="lp-nav-dd__item" href={item.href}>
            <span className="lp-nav-dd__label">{item.label}</span>
            <span className="lp-nav-dd__desc">{item.description}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Panel layout, column by column (founder parallelism rule): each column
 * stacks a short category over a long one, so the two rows share their
 * heading baselines — row 1 Sales | Tech | IT | Energy (4/3/4/3 links),
 * row 2 Marketing | Consultants | Startups | Vertical software (9/6/5/6).
 * ≤1024 the four columns fold into two (columns 1–2 → left, 3–4 → right),
 * keeping every pair. The /for hub keeps CATEGORY_ORDER; this is nav-only.
 */
const NAV_COLUMNS = [
  ["Sales, GTM & recruiting", "Marketing & creative agencies"],
  ["Tech & build agencies", "Consultants & advisors"],
  ["IT, cloud & security", "Startups & solo founders"],
  ["Energy & industry", "Vertical software"],
] as const satisfies readonly (readonly VerticalCategory[])[];

// Compile-time guard: a new VerticalCategory must be placed in NAV_COLUMNS,
// or its pages would silently drop out of the nav.
type Unplaced = Exclude<VerticalCategory, (typeof NAV_COLUMNS)[number][number]>;
const everyCategoryPlaced: [Unplaced] extends [never] ? true : Unplaced = true;
void everyCategoryPlaced;

const catId = (category: string) =>
  `lp-nav-ind-cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/** The Industries entry: hub link + caret toggle + the category grid panel. */
function LpNavIndustries() {
  const groups = navGroups();
  const cells = NAV_COLUMNS.flatMap((column, c) =>
    column.flatMap((category, r) => {
      const group = groups.find((g) => g.category === category);
      if (!group) return [];
      const place = {
        "--lp-ind-col": c + 1,
        "--lp-ind-row": r + 1,
        "--lp-ind-col-sm": Math.floor(c / 2) + 1,
        "--lp-ind-row-sm": (c % 2) * 2 + r + 1,
      } as CSSProperties;
      return [{ group, place }];
    }),
  );
  // No approved vertical yet: a plain link to the hub, no caret, no panel.
  if (!cells.length) {
    return (
      <div className="lp-nav-dd lp-nav-ind">
        <a className="lp-nav-dd__trigger" href="/for">
          Industries
        </a>
      </div>
    );
  }
  return (
    <LpNavDisclosure
      name="ind"
      label="Industries"
      href="/for"
      toggleLabel="Show industries"
      className="lp-nav-ind"
      panelClassName="lp-nav-ind__panel"
      cardClassName="lp-nav-ind__card"
    >
      <div className="lp-nav-ind__cols">
        {cells.map(({ group, place }) => (
          <div key={group.category} className="lp-nav-ind__col" style={place}>
            <p className="lp-nav-ind__cat" id={catId(group.category)}>
              {group.category}
            </p>
            <ul aria-labelledby={catId(group.category)}>
              {group.items.map((v) => (
                <li key={v.slug}>
                  <a href={verticalPath(v)}>{v.name.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <a className="lp-nav-ind__all" href="/for">
        All industries
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
          <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
        </svg>
      </a>
    </LpNavDisclosure>
  );
}
