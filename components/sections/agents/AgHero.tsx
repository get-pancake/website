import { LpArcCanvas } from "@/components/sections/landing-v3/LpArcCanvas";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpViewportVar } from "@/components/sections/landing-v3/LpViewportVar";
import { AgMarksRow } from "./AgAgentMarks";
import { AgHeroMascot } from "./AgHeroMascot";
import { AgTerminal } from "./AgTerminal";
import { HERO } from "./ag-copy";

/**
 * /agents — Hero. The homepage's rainbow art, byte for byte (LpPancakes DOM
 * rings + LpRainbowGL / LpArcCanvas renderers, positioned by hero.css via the
 * `lp-hero` / `lp-hero-art` classes), with the draft's CENTERED text stack
 * in the cream bowl under the arc: H1 (pink accent) → "Give this to your
 * agent" + the five marks → install terminal → "and watch it become a GTM
 * super hero" → the mascot (AgHeroMascot: the page's idle bob, in-view
 * gated). Layout in agents/hero.css (.ag-hero*): the section ends a
 * controlled 56px under the mascot on desktop and right after it on phones
 * (founder 2026-09-11 — the draft's dead cream band under the mascot is a
 * bug, not a feature).
 */
export function AgHero() {
  return (
    <section className="lp-hero ag-hero" aria-labelledby="ag-hero-title">
      <LpViewportVar />
      <div className="lp-hero-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--hero">
          <LpPancakes variant="hero" />
        </div>
        <LpArcCanvas />
        <LpRainbowGL variant="hero" />
      </div>
      <div className="ag-hero__inner">
        <h1 id="ag-hero-title" className="lp-display ag-hero__title">
          {HERO.titleBefore}
          <span className="ag-accent">{HERO.titleAccent}</span>
          <br className="ag-hero__br" />
          {/* the space collapses at the line start while the break shows;
              it keeps "agent" and "GTM" apart if hero.css ever hides it */}
          {" "}
          {HERO.titleAfter}
        </h1>
        <div className="ag-hero__give">
          <span>{HERO.give}</span>
          <AgMarksRow />
        </div>
        <AgTerminal className="ag-hero__term" />
        <p className="ag-hero__after">{HERO.after}</p>
        <AgHeroMascot />
      </div>
    </section>
  );
}
