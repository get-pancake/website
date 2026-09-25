/**
 * Home — closing CTA finale (founder brief 2026-07-06: reproduce Figma
 * `1892:4502`, the design that was already strong — full-bleed band,
 * concentric dotted arcs grazing the edges, three two-tone pancakes
 * scattered on the arcs, a stacked centered title with a bold tail,
 * one pink button, one quiet note).
 *
 * Text keeps the established direction: the title cashes the hero claim
 * ("Give Pancake its first job"), the note uses the shared trial disclosure.
 * The previous orbit-stage + eye-tracking mascot version is gone per the
 * brief ("do not reinvent" the Figma layout); the decor layer spans the
 * SECTION, not the container — `.home-landing-section--closing` carries
 * `position: relative` for it.
 *
 * Static server component: the arcs and pancakes are plain SVG/CSS (slow
 * float keyframes only), no GSAP, no client hooks.
 */

import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { TRIAL_LABEL } from "@/lib/trial";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";

/** Figma `1892:4502` geometry, verbatim: three dotted orbits concentric
 *  on (960, 374) of the 1920×574 band; each pancake's center sits ON an
 *  orbit (purple r≈533, pink r≈723, orange r≈880 bleeding off the right
 *  edge) with the comp's own tilts. Everything lives in ONE svg so the
 *  `slice` scaling can never separate the pancakes from their arcs
 *  (founder 2026-07-06: "les pancakes ne sont pas sur les orbites"). */
const ORBIT_CX = 960;
const ORBIT_CY = 374;
const ORBIT_RADII = [533, 723, 880];

/* Figma centers snapped onto their circles: the comp's orbits are near-
   circular ellipses, so the raw centers land 8–29px outside our exact
   circles — each point below is the Figma center projected radially onto
   its r (founder 2026-07-07: "mieux centrés par rapport aux orbites"). */
const PANCAKES = [
  { id: "purple", variant: "purple", x: 503.1, y: 99.5, size: 63.5, rotate: 0 },
  { id: "pink", variant: "pink", x: 245.2, y: 482.3, size: 142.9, rotate: -74.27 },
  { id: "orange", variant: "orange", x: 1834.2, y: 273.3, size: 171.2, rotate: 20.86 },
] as const;

const FLOAT_DELAYS = ["0s", "2.3s", "4.1s"];

/** Two-tone pancake paths in their native 49×48 box (same drawing as the
 *  hero orbits) — plain <g> content so it can live inside the arcs svg. */
function PancakeGlyph({ variant }: { variant: keyof typeof PANCAKE_TINTS }) {
  const p = PANCAKE_TINTS[variant];
  return (
    <>
      <path
        d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
        fill={p.side}
      />
      <path
        d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
        fill={p.top}
      />
    </>
  );
}

export function HomeClosingCta() {
  const note = TRIAL_LABEL;

  return (
    <div className="home-closing">
      {/* Full-band decor — one svg carries arcs AND pancakes so they scale
          together; the outer translate positions each pancake on its
          orbit, the middle g floats (CSS, unscaled units), the inner g
          applies the comp's tilt and scale. */}
      <div className="home-closing__decor" aria-hidden>
        <svg className="home-closing__arcs" viewBox="0 0 1920 574">
          {ORBIT_RADII.map((r, i) => (
            <circle
              key={r}
              cx={ORBIT_CX}
              cy={ORBIT_CY}
              r={r}
              className="home-closing__orbit"
              opacity={0.65 - i * 0.12}
            />
          ))}
          {PANCAKES.map((p, i) => (
            <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
              <g className="home-closing-pancake" style={{ animationDelay: FLOAT_DELAYS[i] }}>
                <g transform={`rotate(${p.rotate}) scale(${p.size / 49}) translate(-24.5 -24)`}>
                  <PancakeGlyph variant={p.variant} />
                </g>
              </g>
            </g>
          ))}
        </svg>
      </div>

      <h2 id="home-landing-closing-heading" className="heading home-landing-section__closing-title text-center">
        Give Pancake
        <br />
        its first job
      </h2>
      <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
        Onboards in Slack. Hands back finished work.
      </p>
      <div className="home-landing-closing-cta">
        <a
          href={APP_ORIGIN}
          className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
          data-size="lg"
        >
          Get started for free
        </a>
        <p className="home-landing-closing-cta__note">{note}</p>
      </div>
    </div>
  );
}
