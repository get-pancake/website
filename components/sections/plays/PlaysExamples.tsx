import { PLAYS_GROUPS, PLAYS_HEAD, PLAYS_MORE, PLAYS_VISIBLE } from "@/components/sections/plays/plays-copy";
import type { PlayExample, PlayGroup } from "@/components/sections/plays/plays-data";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { SIGNAL_LABEL } from "@/components/sections/verticals/vx-copy";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";

/** The FAQ's plus (turns into × when open), reused on the "Show more" disclosure. */
export function PlaysPlusIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M10 3.5v13M3.5 10h13" />
    </svg>
  );
}

/**
 * One card per example: the prompt (verbatim from its /for config), then "Pancake for {plural}"
 * and a right arrow, because the whole card links to that /for page (it leaves this page, unlike
 * the /for hero's rows, whose arrow points down at the demo). The <li> carries the anchor id
 * the ItemList JSON-LD points at.
 */
function ExampleGrid({ examples }: { examples: PlayExample[] }) {
  return (
    <ul className="pl-ex-grid">
      {examples.map((e) => (
        <li key={e.id} id={e.id}>
          <a className="pl-ex" href={e.href}>
            <span className="pl-ex__text">{vxNoWidow(e.text)}</span>
            <span className="pl-ex__for">
              <span className="pl-ex__label">{e.forLabel}</span>
              <VxArrow className="pl-ex__arrow" />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The gallery: one block per signal kind (app order), each a head (kit badge + count, the group's
 * title as an H2, one line on how the Play finds people) and its examples. The first
 * PLAYS_VISIBLE show; the rest sit in a native <details> ("Show N more"), so every example is in
 * the server HTML (crawlable, anchor-linkable: Chrome opens a closed <details> for a #fragment or
 * find-in-page) with zero JS.
 */
export function PlaysExamples({ groups }: { groups: PlayGroup[] }) {
  return (
    <div className="vx-sec pl-groups">
      <div className="vx-col">
        {groups.map((g) => {
          const copy = PLAYS_GROUPS[g.kind];
          const shown = g.examples.slice(0, PLAYS_VISIBLE);
          const rest = g.examples.slice(PLAYS_VISIBLE);
          return (
            <section key={g.id} id={g.id} className="pl-group" aria-labelledby={`${g.id}-title`}>
              <p className="pl-group__top">
                <span className="vx-badge" data-tone={g.kind}>
                  {SIGNAL_LABEL[g.kind]}
                </span>
                <span className="vx-sr">, </span>
                <span className="pl-group__count">{PLAYS_HEAD.count(g.examples.length)}</span>
              </p>
              <div className="pl-group__head">
                <h2 id={`${g.id}-title`} className="pl-group__title lp-display">
                  {copy.title}
                </h2>
                <p className="pl-group__line">{vxNoWidow(copy.line)}</p>
              </div>
              <ExampleGrid examples={shown} />
              {rest.length > 0 ? (
                <details className="pl-more">
                  <summary>
                    <span className="pl-more__show">{PLAYS_MORE.show(rest.length)}</span>
                    <span className="pl-more__hide">{PLAYS_MORE.hide}</span>
                    <PlaysPlusIcon className="pl-more__icon" />
                  </summary>
                  <ExampleGrid examples={rest} />
                </details>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
