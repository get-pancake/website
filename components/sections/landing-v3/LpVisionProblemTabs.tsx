"use client";

import { useId, useState, type KeyboardEvent } from "react";

import { VisionProblemGlyph } from "./LpVisionGlyphs";
import { VISION_PROBLEMS, VISION_PROBLEMS_LIST_LABEL } from "./lp-vision-data";

/**
 * The six hard problems as a list with the open one beside it (the reference page's list and the
 * card of the item selected). Vertical tabs: arrow keys move, the picked tab opens its card. Nothing advances on its own. Without JavaScript the first problem stays open and the
 * list still names all six.
 */
export function LpVisionProblemTabs() {
  const [active, setActive] = useState(0);
  const id = useId();
  const problem = VISION_PROBLEMS[active];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + VISION_PROBLEMS.length) % VISION_PROBLEMS.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return (
    <div className="lp-vtabs">
      <div className="lp-vtabs__list" role="tablist" aria-orientation="vertical" aria-label={VISION_PROBLEMS_LIST_LABEL} onKeyDown={onKeyDown}>
        {VISION_PROBLEMS.map((item, i) => (
          <button
            key={item.id}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="lp-vtabs__tab"
            data-tone={item.tone}
            onClick={() => setActive(i)}
          >
            <i className="lp-vtabs__dot" aria-hidden="true" />
            <span className="lp-vtabs__name">{item.name}</span>
            <span className="lp-vtabs__short">{item.short}</span>
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="lp-vtabs__panel" data-tone={problem.tone}>
        <p className="lp-vtabs__head">
          <i className="lp-vtabs__dot" aria-hidden="true" />
          <b>{problem.name}</b>
          <span>{problem.short}</span>
        </p>
        <div className="lp-vtabs__pic" aria-hidden="true">
          <VisionProblemGlyph id={problem.id} />
        </div>
        <div className="lp-vtabs__answer">
          <p className="lp-vtabs__line">{problem.line}</p>
          <p className="lp-vtabs__body">{problem.body}</p>
        </div>
      </div>
    </div>
  );
}
