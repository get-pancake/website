/**
 * Landing v3 — Logo strip marquee (Figma node 4257:4924, 1654×106).
 * Interim content: the V1 partner wordmarks from public/logos/ stand in
 * until the new set lands (founder 2026-08-31: "reprends les logos de la
 * V1 en attendant qu'on mette les nouveaux"). Per-mark optical heights
 * and aspect ratios mirror components/sections/home/HomeLogoMarquee.tsx
 * (don't edit that file — copy here). The SVGs are all currentColor, so
 * <img> paints them black; marquee.css greys them to the old strip's tone
 * (mix-blend multiply ×0.43 on the track). The 8-logo sequence renders
 * COPY_COUNT times and CSS scrolls the track left by exactly one sequence
 * (translateX(-100%) of each copy (marquee.css: per-copy animations — Gecko will not composite a transform animation on a track wider than 4096 device px)) — every copy is the same width, so the
 * wrap is pixel-identical and seamless. Static under prefers-reduced-motion.
 * Decorative: empty alts + aria-hidden track.
 */

type StripLogo = {
  name: string;
  src: string;
  /** width / height of the artwork's viewBox — keeps the native aspect. */
  ratio: number;
  /** Optical height in px at desktop scale — tuned per mark (HomeLogoMarquee). */
  heightPx: number;
};

// V1 set: "Trusted by" four, then "Powered by" four (HomeLogoMarquee order).
const LOGOS: StripLogo[] = [
  { name: "PromptLayer", src: "/logos/promptlayer.svg", ratio: 138.224 / 20.808, heightPx: 22 },
  { name: "FullEnrich", src: "/logos/fullenrich.svg", ratio: 131.165 / 24, heightPx: 32 },
  { name: "Hexa", src: "/logos/hexa.svg", ratio: 117.345 / 39.468, heightPx: 34 },
  { name: "Kinro", src: "/logos/kinro.svg", ratio: 1308 / 356, heightPx: 30 },
  { name: "Exa", src: "/logos/exa.svg", ratio: 277.273 / 100, heightPx: 32 },
  { name: "Anchor Browser", src: "/logos/anchorbrowser.svg", ratio: 115.674 / 20, heightPx: 27 },
  { name: "AgentMail", src: "/logos/agentmail.svg", ratio: 1986 / 363, heightPx: 30 },
  { name: "LiteLLM", src: "/logos/litellm.svg", ratio: 3538 / 735, heightPx: 24 },
];

/**
 * Copies of the sequence. 4 × 1581px ≈ 6324px of track: coverage holds up to
 * ~4743px-wide viewports (track − one sequence ≥ viewport), comfortably past
 * the 2560px requirement. Keep in sync with the per-copy -100% keyframe in marquee.css.
 */
const COPY_COUNT = 4;

export function LpMarquee() {
  return (
    <section className="lp-marquee">
      <div aria-hidden="true" className="lp-marquee__track">
        {Array.from({ length: COPY_COUNT }, (_, copy) => (
          <div className="lp-marquee__seq" key={copy}>
            {LOGOS.map((logo) => (
              <img
                alt=""
                key={logo.name}
                src={logo.src}
                style={{
                  /* Rounded design width × the breakpoint scale var, so the
                     sequence width scales linearly and the -100%/COPY_COUNT
                     wrap stays exact at every breakpoint. */
                  height: `calc(var(--lp-marquee-scale) * ${logo.heightPx}px)`,
                  width: `calc(var(--lp-marquee-scale) * ${Math.round(logo.heightPx * logo.ratio)}px)`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
