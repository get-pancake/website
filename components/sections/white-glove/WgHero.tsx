import { LpVideo } from "@/components/sections/landing-v3/LpVideo";
import { WgBookDemo } from "./WgBookDemo";
import { WG_HERO as h } from "./white-glove-copy";

/**
 * The /white-glove hero. The H1 and the lede are François's (October 18,
 * 2026). Since November 5, 2026 (the White Glove campaign's ask): the demo
 * film under them, left, and the "Book a demo" card on the right, where the
 * order ticket was. The film is the homepage's (LpVideo, without its scroll
 * effect). One column under 960px: the copy, the film, then the card.
 * Styles: app/white-glove/white-glove.css (".wg-hero", ".wg-video",
 * ".wg-book").
 */
export function WgHero() {
  return (
    <section id="main-content" tabIndex={-1} className="wg-hero" aria-labelledby="wg-hero-title">
      <div className="wg-wrap wg-hero__grid">
        <div className="wg-hero__copy">
          <h1 id="wg-hero-title" className="lp-display wg-hero__title">
            <span>{h.lines[0]}</span> <span>{h.lines[1]}</span>
          </h1>
          <p className="wg-hero__lede">{h.lede}</p>
          <LpVideo grow={false} className="wg-video" />
        </div>
        <WgBookDemo />
      </div>
    </section>
  );
}
