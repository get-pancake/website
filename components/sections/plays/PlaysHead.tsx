import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { PLAYS_HEAD, PLAYS_WAYS } from "@/components/sections/plays/plays-copy";
import type { PlayGroup } from "@/components/sections/plays/plays-data";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { SIGNAL_LABEL, VX_CTA_LABELS } from "@/components/sections/verticals/vx-copy";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * /plays head: the /for hub's head pattern (VxHead as the page's H1 at H2 scale: eyebrow, title,
 * lede in the right column), then the CTA pair (Start free · Book a demo, the founder's order on
 * every surface; ids app_plays_hero / call_plays_hero, allow-listed in lib/analytics/data-layer.ts)
 * and one jump link per group (kit badge + its example count) down to "More ways". Server, zero JS:
 * the jump links are plain #anchors.
 */
export function PlaysHead({ groups }: { groups: PlayGroup[] }) {
  return (
    <section id="main-content" tabIndex={-1} className="vx-sec pl-head" aria-labelledby="pl-title">
      <div className="vx-col">
        <VxHead as="h1" id="pl-title" eyebrow={PLAYS_HEAD.eyebrow} title={PLAYS_HEAD.h1} lede={PLAYS_HEAD.lede} />
        <div className="lp-hero-btns pl-head__btns">
          <LpFxLink href={APP_ORIGIN} data-analytics-id="app_plays_hero">
            {VX_CTA_LABELS.primary}
          </LpFxLink>
          <LpFxLink href={DEMO_PAGE_PATH} className="lp-btn--tinted lp-btn--demo" data-analytics-id="call_plays_hero">
            {VX_CTA_LABELS.secondary}
          </LpFxLink>
        </div>
        <nav className="pl-jump" aria-labelledby="pl-jump-label">
          <p id="pl-jump-label" className="pl-jump__label">
            {PLAYS_HEAD.jumpLabel}
          </p>
          <ul className="pl-jump__list">
            {groups.map((g) => (
              <li key={g.id}>
                <a className="pl-jump__link" href={`#${g.id}`}>
                  <span className="vx-badge" data-tone={g.kind}>
                    {SIGNAL_LABEL[g.kind]}
                  </span>
                  {/* the number shows; read as "Hiring, 37 examples", never "Hiring37" */}
                  <span className="vx-sr">, </span>
                  <span className="pl-jump__n">
                    {g.examples.length}
                    <span className="vx-sr"> {PLAYS_HEAD.examples(g.examples.length)}</span>
                  </span>
                </a>
              </li>
            ))}
            <li>
              <a className="pl-jump__link" href={`#${PLAYS_WAYS.id}`}>
                <span className="vx-badge" data-tone="neutral">
                  {PLAYS_WAYS.jump}
                </span>
                <span className="vx-sr">, </span>
                <span className="pl-jump__n">
                  {PLAYS_WAYS.cards.length}
                  <span className="vx-sr"> {PLAYS_HEAD.examples(PLAYS_WAYS.cards.length)}</span>
                </span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
