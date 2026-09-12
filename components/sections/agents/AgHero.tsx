import { LpArcCanvas } from "@/components/sections/landing-v3/LpArcCanvas";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpViewportVar } from "@/components/sections/landing-v3/LpViewportVar";
import { AgMarksRow } from "./AgAgentMarks";
import { AgTerminal } from "./AgTerminal";
import { HERO } from "./ag-copy";

/**
 * /agents — Hero. The homepage hero's geometry, class for class (founder
 * 2026-09-11 on the preview: "répartis h1 et cta comme sur la landing page
 * standard"): the rainbow art (LpPancakes DOM rings + LpRainbowGL /
 * LpArcCanvas, positioned by landing-v3/hero.css through `lp-hero-art`),
 * the H1 bottom-anchored on the left 656px column (`lp-hero-title`), and
 * the right column (`lp-hero-col`, center x1211 at 1654) carrying what the
 * homepage's lede + pills carry there: "Give this to your agent" + the five
 * marks, the install terminal, "and watch it become a GTM super hero" (same
 * size as the give line — founder). No mascot ("enlève le pancake monster
 * qui traîne"). Every breakpoint is the homepage's (short-window ladder,
 * ≤1200 edge anchoring, ≤1024 flow, ≤767 fold-filling bottom-anchored
 * stack); agents/hero.css only sizes the column and its three rows.
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
      <div className="lp-hero-inner">
        <h1 id="ag-hero-title" className="lp-hero-title lp-display">
          {/* one colour, like the homepage headline (founder 2026-09-11:
              "pas sûr que AI agent doive être dans une autre couleur") */}
          {HERO.titleBefore}
          {HERO.titleAccent}
          <br />
          {HERO.titleAfter}
        </h1>
        <div className="lp-hero-col ag-hero__col">
          <div className="ag-hero__give">
            <span>{HERO.give}</span>
            <AgMarksRow />
          </div>
          <AgTerminal className="ag-hero__term" />
          <p className="ag-hero__after">{HERO.after}</p>
        </div>
      </div>
    </section>
  );
}
