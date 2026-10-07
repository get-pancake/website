import { PlaysPlusIcon } from "@/components/sections/plays/PlaysExamples";
import { PLAYS_FAQ } from "@/components/sections/plays/plays-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";

/**
 * /plays FAQ: the /for accordion (native <details>, zero JS, all closed, every answer in the
 * server HTML). Its own Q/As, not VX_FAQ.shared; the FAQPage JSON-LD (plays-jsonld.ts) carries
 * the same items verbatim (vxNoWidow only swaps the last space for a no-break space).
 */
export function PlaysFaq() {
  return (
    <section className="vx-sec vx-faq-sec" aria-labelledby="pl-faq-title">
      <div className="vx-col">
        <VxHead id="pl-faq-title" eyebrow={PLAYS_FAQ.eyebrow} title={PLAYS_FAQ.h2} />
        <div className="vx-faq">
          {PLAYS_FAQ.items.map((f) => (
            <details key={f.q} className="vx-qa">
              <summary>
                <span className="vx-qa__q">{vxNoWidow(f.q, 16)}</span>
                <PlaysPlusIcon className="vx-qa__icon" />
              </summary>
              <p className="vx-qa__a">{vxNoWidow(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
