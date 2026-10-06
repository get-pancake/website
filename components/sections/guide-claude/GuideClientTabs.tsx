"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import type { ClientTabId } from "@/components/sections/guide-claude/guide-copy";
import { pushAcquisitionEvent } from "@/lib/analytics/data-layer";

export type GuideTab = {
  id: ClientTabId;
  label: string;
  logo: ReactNode;
  panel: ReactNode;
};

const isTabId = (tabs: readonly GuideTab[], value: string): value is ClientTabId =>
  tabs.some((t) => t.id === value);

/**
 * Step 02's client tabs (Claude · Claude Code · Codex · Other agents). The selected tab lives
 * in the URL hash (#claude, #claude-code, #codex, #other) so a DM can link straight to one;
 * the hash is the tab button's own id, so the browser also scrolls to step 02 on arrival.
 * WAI-ARIA tabs: arrow keys / Home / End move between tabs, every panel is in the server
 * HTML (inactive ones `hidden`), Claude is the default.
 */
export function GuideClientTabs({ tabs, label }: { tabs: readonly GuideTab[]; label: string }) {
  const [active, setActive] = useState<ClientTabId>(tabs[0]!.id);
  const buttons = useRef<Map<ClientTabId, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (isTabId(tabs, hash)) setActive(hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [tabs]);

  const select = useCallback((id: ClientTabId, focus = false) => {
    setActive(id);
    // replaceState: no scroll jump, no history entry per click
    window.history.replaceState(null, "", `#${id}`);
    pushAcquisitionEvent("guide_claude_tab", { tab_id: id });
    const button = buttons.current.get(id);
    if (focus) button?.focus();
    button?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((t) => t.id === active);
    const next =
      e.key === "ArrowRight" ? (index + 1) % tabs.length
      : e.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : e.key === "Home" ? 0
      : e.key === "End" ? tabs.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    select(tabs[next]!.id, true);
  };

  return (
    <div className="gd-tabs">
      <div className="gd-tabs__bar" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((t) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                if (el) buttons.current.set(t.id, el);
                else buttons.current.delete(t.id);
              }}
              id={t.id}
              type="button"
              role="tab"
              className="gd-tab"
              aria-selected={selected}
              aria-controls={`gd-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.id)}
            >
              {t.logo}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          id={`gd-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={t.id}
          className="gd-tabs__panel"
          hidden={t.id !== active}
          tabIndex={0}
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
