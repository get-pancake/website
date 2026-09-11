import { LpFxLink, LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { AgMarksRow } from "./AgAgentMarks";
import { AgTerminal } from "./AgTerminal";
import { CTA, WORKS_WITH } from "./ag-copy";

/**
 * /agents — final CTA. The homepage's CTA card (cta.css geometry, the two
 * animated rainbow slivers via LpPancakes + LpRainbowGL, same class names so
 * LpFitVars/anim.css/cta.css apply unchanged) with the draft's content: title,
 * one line, the install terminal, the Start free / Book a demo pair, and the
 * quiet "Works with" row as the card's last line (founder 2026-09-11: the
 * draft's standalone strip "traîne en bas" — it lives inside the card now).
 * CTA ids are the allow-listed final-CTA ids (app_final / call_final).
 */
export function AgCta() {
  return (
    <section className="lp-cta ag-cta">
      <div className="lp-cta__card">
        <div aria-hidden="true" className="lp-cta__art lp-cta__art--left">
          <div className="lp-anim-canvas lp-anim-canvas--cta-left">
            <LpPancakes variant="ctaLeft" />
          </div>
          <LpRainbowGL variant="ctaLeft" />
        </div>
        <div aria-hidden="true" className="lp-cta__art lp-cta__art--right">
          <div className="lp-anim-canvas lp-anim-canvas--cta-right">
            <LpPancakes variant="ctaRight" />
          </div>
          <LpRainbowGL variant="ctaRight" />
        </div>
        <div className="lp-cta__content ag-cta__content">
          <div className="lp-cta__text ag-cta__text">
            <h2 className="lp-title-card lp-cta__title">{CTA.title}</h2>
            <p className="lp-cta__body">{CTA.body}</p>
          </div>
          <AgTerminal className="ag-cta__term" />
          <div className="lp-cta__btns">
            <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_final">
              {CTA.primary}
            </LpFxLink>
            <LpFxPill className="lp-btn--tinted lp-btn--demo" data-lv2-open="call" data-analytics-id="call_final">
              {CTA.secondary}
            </LpFxPill>
          </div>
          <div className="ag-cta__works">
            <span className="ag-cta__works-label">{WORKS_WITH.label}</span>
            <AgMarksRow className="ag-cta__marks" />
            <span className="ag-cta__any">{WORKS_WITH.any}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
