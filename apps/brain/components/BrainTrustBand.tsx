/**
 * "Trusted by dozens of YC companies" — the V1 landing's logo carousel,
 * under the hero copy where the placeholder social proof used to be. Every
 * wordmark is painted as a CSS alpha mask over the page ink at one shared
 * optical height, and the row scrolls like LpMarquee: the sequence renders
 * COPY_COUNT times and each copy translates by its own width, so the wrap is
 * pixel-identical. Static under prefers-reduced-motion, paused on hover.
 */
type TrustLogo = {
  name: string;
  src: string;
  /** width / height of the artwork's viewBox or pixel box — keeps the aspect. */
  ratio: number;
};

/** One optical height for every mark (founder: same size, black). */
const MARK_HEIGHT_PX = 24;

const LOGOS: TrustLogo[] = [
  { name: "AgentMail", src: "/logos/agentmail.svg", ratio: 1986 / 363 },
  { name: "Hyperspell", src: "/logos/hyperspell.svg", ratio: 577 / 91 },
  { name: "Praxis", src: "/logos/praxis.png", ratio: 1392 / 370 },
  { name: "Kinro", src: "/logos/kinro.svg", ratio: 550.16 / 134.94 },
  { name: "Covera", src: "/logos/covera.png", ratio: 188 / 40 },
  { name: "PromptLayer", src: "/logos/promptlayer.svg", ratio: 138.224 / 20.808 },
];

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
                    style={{
                      WebkitMaskImage: `url(${logo.src})`,
                      maskImage: `url(${logo.src})`,
                      width: `calc(var(--brain-trust-scale) * ${Math.round(MARK_HEIGHT_PX * logo.ratio)}px)`,
                      height: `calc(var(--brain-trust-scale) * ${MARK_HEIGHT_PX}px)`,
                    }}
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
