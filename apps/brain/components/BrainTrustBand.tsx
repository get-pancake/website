/**
 * "Trusted by dozens of YC companies" — the V1 landing's logo carousel,
 * under the hero copy where the placeholder social proof used to be. Every
 * wordmark is painted as a CSS alpha mask in the button plum, sized and
 * shifted so their letter bodies match (see BODY_PX), and the row scrolls
 * like LpMarquee: the sequence renders
 * COPY_COUNT times and each copy translates by its own width, so the wrap is
 * pixel-identical. Static under prefers-reduced-motion, paused on hover.
 */
type TrustLogo = {
  name: string;
  src: string;
  /** width / height of the artwork's viewBox or pixel box — keeps the aspect. */
  ratio: number;
  /** Top and bottom of the letter body (x-height band) as fractions of the
      artwork height — measured by row ink coverage (≥30% of the densest
      row), so caps, ascenders and descenders fall outside it. */
  body: [number, number];
};

/** The letter body of every mark renders this tall, and sits on one line —
    the same size to the eye, whatever each wordmark's caps and descenders. */
const BODY_PX = 14;

const LOGOS: TrustLogo[] = [
  /* AgentMail's icon inflates the measured band; the letters alone span this. */
  { name: "AgentMail", src: "/logos/agentmail.svg", ratio: 1986 / 363, body: [0.2, 0.78] },
  { name: "Hyperspell", src: "/logos/hyperspell.svg", ratio: 577 / 91, body: [0.235, 0.82] },
  { name: "Praxis", src: "/logos/praxis.png", ratio: 1392 / 370, body: [0.24, 0.755] },
  /* Kinro's 2026 mark: jaguar + KINRO caps (kinro.com/brand/logos, graphite
     file). All caps, so the band is narrowed: its caps match the others' cap
     height (~19px) rather than their x-height. */
  { name: "Kinro", src: "/logos/kinro.svg", ratio: 1308 / 356, body: [0.25, 0.75] },
  { name: "Covera", src: "/logos/covera.png", ratio: 188 / 40, body: [0.32, 0.995] },
  { name: "PromptLayer", src: "/logos/promptlayer.svg", ratio: 138.224 / 20.808, body: [0.18, 0.78] },
];

function markStyle(logo: TrustLogo) {
  const heightPx = BODY_PX / (logo.body[1] - logo.body[0]);
  const nudgePx = (0.5 - (logo.body[0] + logo.body[1]) / 2) * heightPx;
  return {
    WebkitMaskImage: `url(${logo.src})`,
    maskImage: `url(${logo.src})`,
    width: `calc(var(--brain-trust-scale) * ${(heightPx * logo.ratio).toFixed(1)}px)`,
    height: `calc(var(--brain-trust-scale) * ${heightPx.toFixed(1)}px)`,
    transform: `translateY(calc(var(--brain-trust-scale) * ${nudgePx.toFixed(1)}px))`,
  };
}

/** Two copies cover a column up to one sequence wide (≈1100px at desktop). */
const COPY_COUNT = 2;

export function BrainTrustBand() {
  return (
    <div className="brain-trust">
      <p className="brain-trust__label">
        Trusted by dozens of <img className="brain-trust__yc" src="/logos/yc.svg" alt="YC" width={16} height={16} /> companies
      </p>
      <div className="brain-trust__band">
        <div className="brain-trust__track" aria-hidden="true">
          {Array.from({ length: COPY_COUNT }, (_, copy) => (
            <ul className="brain-trust__seq" key={copy}>
              {LOGOS.map((logo) => (
                <li key={logo.name} className="brain-trust__item">
                  <span
                    className="brain-trust__logo"
                    role="img"
                    aria-label={logo.name}
                    style={markStyle(logo)}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <ul className="brain-trust__sr">
        {LOGOS.map((logo) => <li key={logo.name}>{logo.name}</li>)}
      </ul>
    </div>
  );
}
