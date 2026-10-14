import type { CSSProperties } from "react";

import { LpMarqueePause } from "@/components/sections/landing-v3/LpMarqueePause";

/** Customer logos in the founder's order. The brain landing is the source
 * for the plum masks, optical sizing and continuous leftward scroll.
 * Artwork and provenance: docs/public-assets/logos/customers/README.md.
 * 2026-10-12: a pointer resting on the band slows the loop instead of stopping
 * it (LpMarqueePause). 2026-10-13: the pause button is gone (founder).
 */
type CustomerLogo = {
  name: string;
  file: string;
  ratio: number;
  yc?: boolean;
  /** Letter-body bounds within the artwork; normalizes apparent type size. */
  body: [number, number];
};

const LOGOS: CustomerLogo[] = [
  // Kong Inc. (konghq.com), paying since 2026-09-30; body = its lowercase "ong".
  { name: "Kong", file: "kong.svg", ratio: 126 / 40, body: [14.2 / 40, 31.17 / 40] },
  { name: "Hyperspell", file: "hyperspell.svg", ratio: 577 / 91, body: [0.235, 0.82], yc: true },
  { name: "AgentMail", file: "agentmail.svg", ratio: 1986 / 363, body: [0.2, 0.78], yc: true },
  { name: "Fleet", file: "fleet.png", ratio: 240 / 91, body: [35 / 91, 70 / 91] },
  { name: "Requesty", file: "requesty.avif", ratio: 1515 / 463, body: [144 / 463, 297 / 463] },
  { name: "Alpic", file: "alpic.svg", ratio: 266.246 / 52.146, body: [0.14, 0.86] },
  { name: "Praxis", file: "praxis.png", ratio: 1392 / 370, body: [0.24, 0.755], yc: true },
  { name: "Kinro", file: "kinro.svg", ratio: 1308 / 356, body: [0.25, 0.75], yc: true },
  // Vector Legal (vectorlegal.com, YC W26), founder 2026-10-13. Their header lockup, composed:
  // the site has no wordmark file (docs/public-assets/logos/customers/README.md); body = the capital V.
  { name: "Vector Legal", file: "vector-legal.png", ratio: 1111 / 151, body: [0.079, 0.795], yc: true },
  { name: "Covera", file: "covera.png", ratio: 188 / 40, body: [0.32, 0.995], yc: true },
  { name: "Spacefill", file: "spacefill.svg", ratio: 192 / 33, body: [0.2411, 0.7591] },
  { name: "Kardinal", file: "kardinal.svg", ratio: 152 / 24, body: [0.23, 0.83] },
];

function markStyle(logo: CustomerLogo): CSSProperties {
  const height = 1 / (logo.body[1] - logo.body[0]);
  const nudge = (0.5 - (logo.body[0] + logo.body[1]) / 2) * height;
  return {
    WebkitMaskImage: `url(/logos/customers/${logo.file})`,
    maskImage: `url(/logos/customers/${logo.file})`,
    width: `calc(var(--lp-customer-logo-body) * var(--lp-marquee-scale) * ${height * logo.ratio})`,
    height: `calc(var(--lp-customer-logo-body) * var(--lp-marquee-scale) * ${height})`,
    transform: `translateY(calc(var(--lp-customer-logo-body) * var(--lp-marquee-scale) * ${nudge}))`,
  };
}

// Four copies keep the full-width band filled on 4K monitors throughout a loop.
// Each copy translates by its own width, including its leading gap.
const COPY_COUNT = 4;

/** The homepage's line above the strip (Figma V2 4962:847, red note "swapped position /
    'Trusted by many'", 2026-10-09): Geist Medium 13.333/16 in the subtle text colour. */
const LABEL = "Trusted by many";

/**
 * `labelled` (homepage only, Figma V2 4911:371): the strip moves under the demo window and
 * gains the "Trusted by many" line, in a vertical frame (pad 8, gap 8, label 16 + slot 90 =
 * 130). Opt-in: /demo (DemoTrustBand), /pricing (PricingLogos) and /for (VxPage) keep the
 * bare strip. The `.lp-marquee__slot` wrapper is rendered for every consumer: it is the pause
 * button's containing block (its top: 50% stays the logo row's centre whether or not a label
 * sits above) and an unlabelled slot is a plain relative block, so their layout is unchanged.
 */
export function LpMarquee({ labelled = false }: { labelled?: boolean } = {}) {
  return (
    <section className={labelled ? "lp-marquee lp-marquee--labelled" : "lp-marquee"} aria-label="Customers">
      {labelled && <p className="lp-marquee__label">{LABEL}</p>}
      <div className="lp-marquee__slot">
        <div className="lp-marquee__band">
          <div aria-hidden="true" className="lp-marquee__track">
            {Array.from({ length: COPY_COUNT }, (_, copy) => (
              <div className="lp-marquee__seq" key={copy}>
                {LOGOS.map((logo) => (
                  <div className="lp-marquee__item" key={logo.name}>
                    <div className="lp-marquee__mark">
                      <span className="lp-marquee__logo" style={markStyle(logo)} />
                    </div>
                    {logo.yc && <span className="lp-marquee__yc" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <LpMarqueePause />
      </div>
      <ul className="lp-sr-only">
        {LOGOS.map((logo) => (
          <li key={logo.name}>{logo.name}{logo.yc ? " — Y Combinator" : ""}</li>
        ))}
      </ul>
    </section>
  );
}
