import { DemoArtwork } from "./DemoArtwork";
import { DemoForm } from "./DemoForm";
import { DemoTrustBand } from "./DemoTrustBand";
import { HERO } from "./demo-copy";

/**
 * The ElevenLabs split (founder, 2026-09-15): brain's hero copy and trust
 * band on the left, straight on the cream page; the white conversion card
 * on the right, holding the demo form where brain had "Start free".
 */
export function DemoHero() {
  return (
    <section className="demo-hero" aria-labelledby="demo-title">
      <div className="demo-hero__content">
        <div className="demo-left">
          <div className="demo-pitch">
            <p className="demo-eyebrow">{HERO.eyebrow}</p>
            <h1 id="demo-title" className="lp-display demo-title">
              {HERO.titleLine1}
              <br />
              {HERO.titleLine2}
            </h1>
            <p className="demo-lede">
              {HERO.ledeBefore}
              <span className="demo-nowrap">{HERO.ledeNowrap}</span>
              {HERO.ledeAfter}
            </p>
          </div>
          <DemoTrustBand />
        </div>
        {/* White card with the CTA card's right rainbow sliver (brain's
            "cartouche", founder 2026-09-14). The artwork is a sibling of the
            body so idle → success → idle never remounts it: LpFitVars
            queries the DOM once at mount, and a remounted art would get no
            --lp-fit and stay blank. */}
        <section className="demo-card" id="demo" aria-labelledby="demo-card-title">
          <DemoArtwork />
          <div className="demo-card__body">
            <DemoForm />
          </div>
        </section>
      </div>
    </section>
  );
}
