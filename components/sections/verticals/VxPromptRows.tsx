import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { SIGNAL_LABEL, VX_HERO } from "@/components/sections/verticals/vx-copy";
import type { DemoPrompt } from "@/lib/verticals/types";

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
    <>
      {shown ? (
        <p className="vx-hero__label" id="vx-prompts-label">
          {VX_HERO.promptsLabel}
        </p>
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
    </>
  );
}
