import { Fragment, type ReactNode } from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { DEMO_PAGE_PATH } from "@/lib/booking";
import { APP_ORIGIN } from "@/lib/site-config.mjs";

/**
 * Landing v3 — Section 7: CTA "Try Pancake now" (Figma node 4389:4492).
 * Cream 1296px card with two animated rainbow slivers hugging the card edges
 * behind a centered 464px text column. Each sliver div sits exactly where the
 * old pre-clipped composite <img> did (left 560×432 @ card x0 / right 529×432
 * @ right:0 == x767 at the 1296 width); inside, the 1478×2622 rotated group
 * container sits at the group's card offset: right (0, -1019), left
 * (-918, -1019) — sliver-relative. The card's overflow clip crops the rest.
 *
 * Optional `title` / `body` (the /for pages, spec §2.9): omitted, the card
 * renders the homepage copy below, byte for byte. A vertical passes its own
 * one-line title (≤464px at 48px) and two body lines.
 *
 * Optional `buttons` / `note` (/guides/claude, 2026-10-06): a page may swap
 * the CTA pair for its own buttons and add one small line under them; its
 * body may be one sentence instead of two lines.
 */
const CTA_TITLE = "Try Pancake now";
/* "Pancake can’t overspend." retired (founder 2026-09-19); the line after it
   named the flat price until the credit plan (2026-10-13), and now gives the
   entry price ("From": lib/pricing.ts has the higher levels).
   2026-10-07 (founder): "Every lead arrives with its conversation attached."
   cut as filler. Like every competitor's closing band, line one restates the
   promise (the approved ads line) and line two says what the price is per
   (as /pricing since #326) plus what is NOT billed: teammates are free. The
   /for pages pass the same two lines (VX_CTA_BODY). */
const CTA_BODY: readonly [string, string] = [
  "Tell Pancake who to reach. It builds the Play.",
  "From $99 a month per workspace. Your whole team included.",
];

/* One span per sentence, the text and its spaces unchanged. On phones each is
   an inline-block (cta.css, the ≤767 block): a line too long for the card
   breaks between two sentences, not one word before the end of the first
   ("…It builds the / Play." at 402). */
const sentences = (line: string) =>
  (line.match(/\S.*?(?:[.!?](?=\s|$)|$)/g) ?? [line]).map((sentence, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span className="lp-cta__s">{sentence}</span>
    </Fragment>
  ));

/* No JS: no canvas will ever draw the two rainbows and nothing sets
   [data-lp-gl-off], so the static rings are shown (anim.css hides them until a
   script decides). One class more specific than that rule. 2026-10-13. */
const NOSCRIPT_CSS = "<style>.lp-cta__card .lp-cta__art .lp-anim-box{visibility:visible}</style>";

export function LpCta({
  title = CTA_TITLE,
  body = CTA_BODY,
  buttons,
  note,
  sky = false,
}: {
  title?: string;
  body?: readonly [string, string] | string;
  buttons?: ReactNode;
  note?: string;
  /** homepage only (V2 4911:739 "Transition from previous section", owner blue-band): the
      blue sky of the deep dive ending on a cream hill, two clouds around the card, and the
      card's r24. Off (the default), every other surface renders exactly as before. */
  sky?: boolean;
} = {}) {
  const card = (
    <div className="lp-cta__card">
      <div aria-hidden="true" className="lp-cta__art lp-cta__art--left">
        <div className="lp-anim-canvas lp-anim-canvas--cta-left">
          <LpPancakes variant="ctaLeft" />
        </div>
        {/* desktop rotation on one WebGL canvas per sliver (LpRainbowGL) */}
        <LpRainbowGL variant="ctaLeft" />
      </div>
      <div aria-hidden="true" className="lp-cta__art lp-cta__art--right">
        <div className="lp-anim-canvas lp-anim-canvas--cta-right">
          <LpPancakes variant="ctaRight" />
        </div>
        <LpRainbowGL variant="ctaRight" />
        {/* inside an art wrapper: out of the card's flex flow */}
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
      </div>
      <div className="lp-cta__content">
        <div className="lp-cta__text">
          <h2 className="lp-title-card lp-cta__title">{title}</h2>
          <p className="lp-cta__body">
            {typeof body === "string" ? (
              sentences(body)
            ) : (
              <>
                {sentences(body[0])}
                <br />
                {sentences(body[1])}
              </>
            )}
          </p>
        </div>
        {buttons ? (
          <div className="lp-cta__btns">{buttons}</div>
        ) : (
          <div className="lp-cta__btns">
            {/* Primary first, secondary second — the hero's order on every
                surface (founder 2026-09-03). */}
            <LpFxLink href={APP_ORIGIN} data-analytics-id="app_final">
              Start free
            </LpFxLink>
            {/* A same-tab link to /demo (François, 2026-09-16; it opened the
                Calendly sheet before), keeping the call_final id.
                Tinted skin — same as the hero's Talk to sales (founder
                2026-09-01: "bouton book a call différent que dans hero");
                the outline variant is retired here. */}
            <LpFxLink
              href={DEMO_PAGE_PATH}
              className="lp-btn--tinted lp-btn--demo"
              data-analytics-id="call_final"
            >
              Talk to sales
            </LpFxLink>
          </div>
        )}
        {note ? <p className="lp-cta__note">{note}</p> : <p className="lp-cta__note">Sales consultations for companies with more than 50 employees or interest in White Glove.</p>}
      </div>
    </div>
  );
  if (!sky) return <section className="lp-cta">{card}</section>;
  /* DOM order = paint order: cloud B sits behind the card's right edge, cloud A over its
     top-left corner (Figma 4939:3972 / 4939:3456). Phones show A only, over the card's
     top-right corner (mobile artboard 5061:702). Both drift on scroll (LpSkyParallax,
     mounted by LpDive, finds them by class; sky.css holds their depths). */
  return (
    <section className="lp-cta lp-cta--sky">
      <div className="lp-cta__frame">
        <span aria-hidden="true" className="lp-sky-cloud lp-sky-cloud--b" />
        {card}
        <span aria-hidden="true" className="lp-sky-cloud lp-sky-cloud--a" />
      </div>
    </section>
  );
}
