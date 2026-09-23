// components/sections/verticals/vx-text.tsx — render-time typography for config-driven copy.
import type { ReactNode } from "react";

/**
 * Keeps a paragraph's last word off a line of its own (a widow) by gluing the last two words,
 * when they are short enough to fit the narrowest /for column they render in — `maxPair`
 * characters together: 22 for 15–16px body copy (≤ ~190px against a 224px floor, the 4-up
 * Signals card), 16 for the 19.2px FAQ questions (220px beside the + at 320). The glue is a
 * no-break space (no extra element: <main> has a DOM budget; every audit normalises \s, so FAQ
 * JSON-LD parity holds), or a `white-space: nowrap` span (.vx-nw, foundation.css) when the pair
 * holds a hyphen or a dash, which would still break ("C- / level leaders."). `text-wrap: pretty`
 * stays on as well, but Chrome only treats a last word under roughly a quarter of the line as an
 * orphan, so "…on Magento or / BigCommerce?" survived it.
 */
export function vxNoWidow(text: string, maxPair = 22): ReactNode {
  const last = text.lastIndexOf(" ");
  if (last <= 0) return text;
  const start = text.lastIndexOf(" ", last - 1) + 1;
  if (text.length - start > maxPair) return text;
  const pair = text.slice(start);
  if (!/[-‐‑–—]/.test(pair)) return `${text.slice(0, last)} ${text.slice(last + 1)}`;
  return (
    <>
      {text.slice(0, start)}
      <span className="vx-nw">{pair}</span>
    </>
  );
}
