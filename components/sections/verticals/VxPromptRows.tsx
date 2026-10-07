import { PLAYS_PATH } from "@/components/sections/plays/plays-copy";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { SIGNAL_LABEL, VX_HERO } from "@/components/sections/verticals/vx-copy";
import type { DemoPrompt } from "@/lib/verticals/types";

/** The route to /plays on the label's line (see below). Kept here, not in VX_HERO, while
 *  vx-copy.ts belongs to another change; it can move there with the next copy pass. */
const PROMPTS_MORE = "See all example Plays";

/**
 * "Example prompts": the demo's three prompts as rows, right above the demo. On /for pages they
 * close the hero (VxHero); on the homepage they sit under the demo section's head (LpDemoTour).
 * SERVER component, zero JS: each row is a real link to #vx-demo (crawlable, works without JS);
 * the demo island (VxDemoPlayer) takes the clicks over (document listener on [data-vx-prompt]),
 * plays that prompt from the Brief tab and marks the row it is showing (data-active +
 * aria-current). Server HTML = prompt 0 active, which is what the demo renders before JS.
 * One demo per page: the ids (vx-prompts-label, #vx-demo) are fixed.
 *
 * Styles: app/_styles/verticals/prompts.css (the label keeps its historical `vx-hero__label`
 * class so the /for HTML did not change when the rows moved out of VxHero; its margin-top
 * belongs to the context: hero.css / landing-v3/demo-tour.css).
 *
 * `label="hidden"` (the homepage, whose lede already says "pick one of its prompts"): no visible
 * caps label; the list keeps the same accessible name through aria-label.
 *
 * 2026-10-07 (founder: "inspire-toi de la compet pour rendre accessible les pages que t'as
 * créées"; Origami's "Explore buyer examples" under its plays carousel is the model): the label
 * shares its line with "See all example Plays →" (/plays, the 120 /for prompts in one gallery),
 * right-aligned on the rows' edge, a quiet .lp-textlink (pricing.css). On the label's line, not
 * under the rows: the hero's height is tuned so the fold never cuts the demo's tab bar
 * (hero.css), and the shared line adds no height ≥768. Phones too narrow for both wrap the
 * link under the label. Only with the visible label: the homepage has its own links. The link
 * sits before the rows in the DOM as on screen, so focus order matches what is seen.
 */
export function VxPromptRows({
  prompts,
  label = "visible",
}: {
  prompts: readonly DemoPrompt[];
  label?: "visible" | "hidden";
}) {
  const shown = label === "visible";
  return (
    // the wrapper hugs the rows (fit-content), so the link on the label's line ends on their edge
    <div className="vx-hp-wrap">
      {shown ? (
        <div className="vx-hp-head">
          <p className="vx-hero__label" id="vx-prompts-label">
            {VX_HERO.promptsLabel}
          </p>
          <a className="lp-textlink vx-hp-more" href={PLAYS_PATH}>
            {PROMPTS_MORE}
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      ) : null}
      {/* one grid, rows on a subgrid: the badges share one column, so every prompt starts
          on the same x and every arrow ends on the same x (equal rows, not ragged pills) */}
      <ul
        className="vx-hp-list"
        aria-labelledby={shown ? "vx-prompts-label" : undefined}
        aria-label={shown ? undefined : VX_HERO.promptsLabel}
      >
        {prompts.map((p, i) => (
          <li key={i}>
            <a
              className="vx-hp"
              href="#vx-demo"
              data-vx-prompt={i}
              data-active={i === 0 ? "" : undefined}
              aria-current={i === 0 ? "true" : undefined}
            >
              {/* display: contents on desktop (the badge and the text stay subgrid cells); on
                  phones the badge leads the prompt's first line (the full prompt is in the HTML
                  and is typed in full in the demo) */}
              <span className="vx-hp__body">
                <span className="vx-badge" data-tone={p.kind}>
                  {SIGNAL_LABEL[p.kind]}
                </span>
                <span className="vx-hp__text">
                  {p.text}
                  <span className="vx-sr"> {VX_HERO.promptHint}</span>
                </span>
              </span>
              {/* points DOWN: the row plays the prompt in the demo right below (it never leaves the page) */}
              <VxArrow className="vx-hp__arrow" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
