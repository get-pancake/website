import type { CSSProperties } from "react";

/**
 * "Trusted by dozens of YC companies" — the V1 landing's logo band, static,
 * sitting under the hero copy where the placeholder social proof used to be.
 * Marks come from the shared public/logos/ set, painted as CSS alpha masks
 * over currentColor so every mark shares one ink. Covera has an icon mark
 * only, shown next to its name; Praxis publishes no vector mark at all, so
 * its name is typeset in the same ink.
 */
type TrustLogo = {
  name: string;
  /** Mark artwork; omitted when the company has none and the name stands alone. */
  src?: string;
  /** width / height of the artwork's viewBox — keeps the native aspect. */
  ratio?: number;
  /** Optical height in px at desktop scale, tuned per mark. */
  heightPx?: number;
  /** Icon-only mark: the name is typeset next to it. */
  lockup?: boolean;
};

const LOGOS: TrustLogo[] = [
  { name: "AgentMail", src: "/logos/agentmail.svg", ratio: 1986 / 363, heightPx: 26 },
  { name: "Hyperspell", src: "/logos/hyperspell.svg", ratio: 577 / 91, heightPx: 20 },
  { name: "Praxis", lockup: true },
  { name: "Kinro", src: "/logos/kinro.svg", ratio: 550.16 / 134.94, heightPx: 26 },
  { name: "Covera", src: "/logos/covera-mark.svg", ratio: 1, heightPx: 22, lockup: true },
  { name: "PromptLayer", src: "/logos/promptlayer.svg", ratio: 138.224 / 20.808, heightPx: 18 },
];

function logoStyle(logo: Required<Pick<TrustLogo, "src" | "ratio" | "heightPx">>): CSSProperties {
  return {
    WebkitMaskImage: `url(${logo.src})`,
    maskImage: `url(${logo.src})`,
    width: `calc(var(--brain-trust-scale) * ${Math.round(logo.heightPx * logo.ratio)}px)`,
    height: `calc(var(--brain-trust-scale) * ${logo.heightPx}px)`,
  };
}

export function BrainTrustBand() {
  return (
    <div className="brain-trust">
      <p className="brain-trust__label">Trusted by dozens of YC companies</p>
      <ul className="brain-trust__row">
        {LOGOS.map((logo) => (
          <li key={logo.name} className="brain-trust__item">
            {logo.src && logo.ratio && logo.heightPx ? (
              <span
                className="brain-trust__logo"
                {...(logo.lockup ? { "aria-hidden": true } : { role: "img", "aria-label": logo.name })}
                style={logoStyle({ src: logo.src, ratio: logo.ratio, heightPx: logo.heightPx })}
              />
            ) : null}
            {logo.lockup ? <span className="brain-trust__name">{logo.name}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
