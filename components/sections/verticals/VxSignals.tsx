import { VxHead } from "@/components/sections/verticals/VxHead";
import { SIGNAL_LABEL, VX_SIGNALS } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import type { VerticalConfig } from "@/lib/verticals/types";

/** Phosphor "Eye" (regular), 256 viewBox — the app's icon set. */
function EyeIcon() {
  return (
    <svg className="vx-watch__icon" viewBox="0 0 256 256" width="14" height="14" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M247.31 124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57 61.26 162.88 48 128 48S61.43 61.26 36.34 86.35C17.51 105.18 9 124 8.69 124.76a8 8 0 0 0 0 6.5c.35.79 8.82 19.57 27.65 38.4C61.43 194.74 93.12 208 128 208s66.57-13.26 91.66-38.34c18.83-18.83 27.3-37.61 27.65-38.4a8 8 0 0 0 0-6.5ZM128 192c-30.78 0-57.67-11.19-79.93-33.25A133.47 133.47 0 0 1 25 128a133.33 133.33 0 0 1 23.07-30.75C70.33 75.19 97.22 64 128 64s57.67 11.19 79.93 33.25A133.46 133.46 0 0 1 231.05 128c-7.21 13.46-38.62 64-103.05 64Zm0-112a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48Zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32Z"
      />
    </svg>
  );
}

/**
 * Signals (spec §2.5): which 4 of the 6 real signals matter for this vertical,
 * in its words, with the values Pancake would watch. Server, zero JS.
 * Four pixel-equal cream cards (grid stretch; the title slot is a fixed two
 * lines and the "Watching" panel a fixed two chip rows, so the panels line up
 * too); badge = kit label (page-level), chips = the app's Signals-page item
 * chips. The foot line is derived from the cards (the 2 kinds not shown + the
 * opt-in kinds that are).
 */
export function VxSignals({ v }: { v: VerticalConfig }) {
  return (
    <section className="vx-sec vx-signals" aria-labelledby="vx-signals-title">
      <div className="vx-col">
        <VxHead id="vx-signals-title" eyebrow={VX_SIGNALS.eyebrow} title={v.signals.h2} lede={VX_SIGNALS.lede(v)} />
        <div className="vx-sig-grid">
          {v.signals.cards.map((c) => (
            <article key={c.kind} className="vx-sig-card">
              <span className="vx-badge" data-tone={c.kind}>
                {SIGNAL_LABEL[c.kind]}
              </span>
              <h3 className="vx-sig-card__title lp-display">{c.title}</h3>
              <p className="vx-sig-card__body">{vxNoWidow(c.body)}</p>
              <div className="vx-watch">
                <p className="vx-watch__label">
                  <EyeIcon />
                  {VX_SIGNALS.watching}
                </p>
                <ul className="vx-watch__chips">
                  {c.watching.map((w) => (
                    <li key={w} className="vx-wchip">
                      {c.kind === "keyword" ? `“${w}”` : w}
                    </li>
                  ))}
                  {c.more ? <li className="vx-wmore">{VX_SIGNALS.more(c.more)}</li> : null}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <p className="vx-sig-foot">{vxNoWidow(VX_SIGNALS.foot(v))}</p>
      </div>
    </section>
  );
}
