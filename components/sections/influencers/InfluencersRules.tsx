"use client";

import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiX } from "react-icons/si";

/**
 * Rules block with an X / LinkedIn toggle. Most rules are shared; the
 * cadence ones differ (X tolerates more frequent posts than LinkedIn,
 * matching the relative half-life of each feed).
 */
type Platform = "x" | "linkedin";

const CADENCE: Record<Platform, { perMonth: string; between: string }> = {
  x: { perMonth: "12 posts per month", between: "2 days between posts" },
  linkedin: { perMonth: "4 posts per month", between: "5 days between posts" },
};

const REQUIREMENTS = [
  "Tag @pancakegtm in the post",
  "Include a screenshot or screen recording of Pancake's actual output",
  "Organic reach only — no boosts, no promoted posts",
  "Real Pancake output from your real workspace",
];

const CONTENT = [
  "Blur anything sensitive — customer names, money, private messages",
  "Your own content from your own Pancake",
  "No staged, mocked, or fabricated output",
  "No pre-approval needed — post first, submit later",
  "By accepting payout, you agree Pancake may run your post as a paid ad — the added reach can't be billed back to Pancake",
];

export function InfluencersRules() {
  const [platform, setPlatform] = useState<Platform>("x");
  const cadence = CADENCE[platform];

  const limits = [
    cadence.perMonth,
    cadence.between,
    "$2,250 tokens / $1,500 cash cap per post",
    "Pancake should be the subject, not part of a tool roundup",
  ];

  return (
    <div className="influencers-rules-block" role="region" aria-label="House rules">
      <div className="influencers-toggle" role="tablist" aria-label="Platform">
        <button
          type="button"
          role="tab"
          aria-selected={platform === "x"}
          data-active={platform === "x" ? "" : undefined}
          className="influencers-toggle__btn"
          onClick={() => setPlatform("x")}
        >
          <SiX size={14} aria-hidden />
          <span>X</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={platform === "linkedin"}
          data-active={platform === "linkedin" ? "" : undefined}
          className="influencers-toggle__btn"
          onClick={() => setPlatform("linkedin")}
        >
          <FaLinkedin size={14} aria-hidden />
          <span>LinkedIn</span>
        </button>
      </div>

      <div className="influencers-rules-grid">
        <RuleColumn title="Requirements" tone="brand-alt-1" items={REQUIREMENTS} />
        <RuleColumn title="Limits" tone="brand" items={limits} highlightFirstTwo />
        <RuleColumn title="Content" tone="brand-alt-2" items={CONTENT} />
      </div>
    </div>
  );
}

function RuleColumn({
  title,
  tone,
  items,
  highlightFirstTwo,
}: {
  title: string;
  tone: "brand" | "brand-alt-1" | "brand-alt-2";
  items: string[];
  highlightFirstTwo?: boolean;
}) {
  return (
    <div className="influencers-rules-col">
      <span className="influencers-rules-col__chip" data-tone={tone}>
        {title}
      </span>
      <ul className="influencers-rules-col__list">
        {items.map((item, i) => {
          const highlighted = highlightFirstTwo && i < 2;
          return (
            <li
              key={item}
              className="influencers-rules-col__item"
              data-highlight={highlighted ? "" : undefined}
            >
              <span aria-hidden className="influencers-rules-col__dot" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
