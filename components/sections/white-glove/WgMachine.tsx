import type { CSSProperties } from "react";

import { WG_MACHINE as m } from "./white-glove-copy";

/**
 * The hero's art: the outbound machine as a pancake stack (the kit's
 * canonical composition, _design-kit/pancake-stack.html: pink under, purple
 * middle offset, yellow top), built bottom-up. The GTM Brain is the
 * foundation, the Plays sit on it, the sequences on top; unlimited credits
 * are the plate it stands on and the payoff, "You close the deals", sits
 * above in plum. A bracket names who builds it; the office hour loops beside it.
 *
 * Real text, not an image: the list reads in build order (an <ol>, drawn
 * bottom-up with column-reverse), so a screen reader hears the same machine.
 * Plates settle in once on load; nothing moves under reduced motion
 * (white-glove.css). No product screenshot, no figures.
 */
export function WgMachine() {
  return (
    <figure className="wg-machine" aria-labelledby="wg-machine-label">
      <figcaption id="wg-machine-label" className="wg-machine__label">
        {m.label}
      </figcaption>
      <div className="wg-machine__stage">
        <p className="wg-machine__close">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {m.close}
        </p>
        <span className="wg-machine__flow" aria-hidden="true" />
        <div className="wg-machine__build">
          <p className="wg-machine__rail">
            <span>{m.engineer}</span>
          </p>
          <ol className="wg-machine__stack">
            {m.layers.map((layer, i) => (
              <li key={layer.key} className="wg-plate" data-layer={layer.key} style={{ "--wg-i": i } as CSSProperties}>
                <span className="wg-plate__step" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="wg-plate__name">{layer.name}</span>
                <span className="wg-plate__note">{layer.note}</span>
              </li>
            ))}
          </ol>
          <p className="wg-machine__loop">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12a7 7 0 1 1-2.05-4.95M19 4.5V8h-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {m.officeHour}
          </p>
        </div>
        <p className="wg-machine__base">{m.credits}</p>
      </div>
    </figure>
  );
}
