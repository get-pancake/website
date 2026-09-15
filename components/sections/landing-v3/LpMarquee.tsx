import type { CSSProperties } from "react";

/** Customer logos in the founder's order. The brain landing is the source
 * for the plum masks, optical sizing and continuous leftward scroll.
 * Artwork and provenance: public/logos/customers/README.md.
 */
type CustomerLogo = {
  name: string;
  file: string;
  ratio: number;
  /** Letter-body bounds within the artwork; normalizes apparent type size. */
  body: [number, number];
};

const LOGOS: CustomerLogo[] = [
  { name: "Hyperspell", file: "hyperspell.svg", ratio: 577 / 91, body: [0.235, 0.82] },
  { name: "AgentMail", file: "agentmail.svg", ratio: 1986 / 363, body: [0.2, 0.78] },
  { name: "Fleet", file: "fleet.png", ratio: 240 / 91, body: [35 / 91, 70 / 91] },
  { name: "Requesty", file: "requesty.avif", ratio: 1515 / 463, body: [144 / 463, 297 / 463] },
  { name: "Alpic", file: "alpic.svg", ratio: 266.246 / 52.146, body: [0.14, 0.86] },
  { name: "Praxis", file: "praxis.png", ratio: 1392 / 370, body: [0.24, 0.755] },
  { name: "Kinro", file: "kinro.svg", ratio: 1308 / 356, body: [0.25, 0.75] },
  { name: "Covera", file: "covera.png", ratio: 188 / 40, body: [0.32, 0.995] },
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

export function LpMarquee() {
  return (
    <section className="lp-marquee" aria-label="Customers">
      <div className="lp-marquee__band">
        <div aria-hidden="true" className="lp-marquee__track">
          {Array.from({ length: COPY_COUNT }, (_, copy) => (
            <div className="lp-marquee__seq" key={copy}>
              {LOGOS.map((logo) => (
                <span
                  className="lp-marquee__logo"
                  key={logo.name}
                  style={markStyle(logo)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <ul className="lp-sr-only">
        {LOGOS.map((logo) => <li key={logo.name}>{logo.name}</li>)}
      </ul>
    </section>
  );
}
