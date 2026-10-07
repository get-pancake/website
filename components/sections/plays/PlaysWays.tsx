import { PLAYS_WAYS } from "@/components/sections/plays/plays-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";

/**
 * "More ways Pancake finds people": what the app's lead finders do that no /for prompt shows yet
 * (funding rounds, lookalikes, role match, web evidence with sources, one post's reactions).
 * The /for Signals card recipe (kit badge, Condensed title, one-sentence body, a white panel
 * under it: the vx-sig-card__* / vx-watch parts, on its own .pl-way card so the Signals grid's
 * 4-up / 2 × 2 placement rules never reach it), with an example request in the panel instead of
 * the "Watching" chips. Neutral badges: these are not the six signal kinds and must not borrow
 * their colours. 3 + 2 cards on desktop (plays.css), so no slot stays empty. Server, zero JS.
 */
export function PlaysWays() {
  return (
    <section id={PLAYS_WAYS.id} className="vx-sec pl-ways-sec" aria-labelledby="pl-ways-title">
      <div className="vx-col">
        <VxHead id="pl-ways-title" eyebrow={PLAYS_WAYS.eyebrow} title={PLAYS_WAYS.h2} lede={PLAYS_WAYS.lede} />
        <div className="pl-ways">
          {PLAYS_WAYS.cards.map((c) => (
            <article key={c.id} id={c.id} className="pl-way">
              <span className="vx-badge" data-tone="neutral">
                {c.label}
              </span>
              <h3 className="vx-sig-card__title lp-display">{c.title}</h3>
              <p className="vx-sig-card__body">{vxNoWidow(c.body)}</p>
              <div className="vx-watch">
                <p className="vx-watch__label">{PLAYS_WAYS.exampleLabel}</p>
                <p className="pl-way__prompt">{vxNoWidow(c.example)}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="vx-sig-foot">{vxNoWidow(PLAYS_WAYS.foot)}</p>
      </div>
    </section>
  );
}
