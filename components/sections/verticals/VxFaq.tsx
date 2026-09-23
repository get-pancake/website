import { VxHead } from "@/components/sections/verticals/VxHead";
import { VX_FAQ } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { faqItems } from "@/lib/verticals";
import type { VerticalConfig } from "@/lib/verticals/types";

/**
 * FAQ (spec §2.7): the vertical's 3–4 objections, then the 5 shared Q/As.
 * Native <details> — zero JS, all closed by default, every answer in the
 * server HTML. The FAQPage JSON-LD (vx-jsonld.ts) carries the vertical's
 * own v.faq only — the first items of this same list, verbatim — never the
 * 5 shared Q/As (SEO-JSONLD-05; audit gate: scripts/verticals-audit.mjs).
 * No links inside answers (tap-target rule; the CTA card follows).
 */
export function VxFaq({ v }: { v: VerticalConfig }) {
  return (
    <section className="vx-sec vx-faq-sec" aria-labelledby="vx-faq-title">
      <div className="vx-col">
        <VxHead id="vx-faq-title" eyebrow={VX_FAQ.eyebrow} title={VX_FAQ.h2(v)} />
        <div className="vx-faq">
          {faqItems(v).map((f) => (
            <details key={f.q} className="vx-qa">
              <summary>
                <span className="vx-qa__q">{vxNoWidow(f.q, 16)}</span>
                <svg className="vx-qa__icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M10 3.5v13M3.5 10h13" />
                </svg>
              </summary>
              <p className="vx-qa__a">{vxNoWidow(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
