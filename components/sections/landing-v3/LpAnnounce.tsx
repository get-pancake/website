"use client";

import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Announcement bar — one thin plum line above the nav, on every page that
 * renders LpNav (2026-10-07, the Octave / Alta / Unify pattern: "Octave is now
 * at home in Claude…"). It links the release on /changelog and closes for
 * good with its ✕. Styles: app/_styles/landing-v3/announce.css.
 *
 * To announce the next release, change ANNOUNCEMENT (LpNav.tsx): a new id
 * shows the bar again to visitors who closed the previous one.
 *
 * Dismissal is per browser (localStorage, every access in try/catch; storage
 * can throw in a private window or with site data blocked, and the bar then
 * stays closed for the page view). The server always renders the bar (pages
 * are static). For a visitor who closed it, the inline script right after
 * the bar runs while the HTML is parsed, before the first paint, and marks it
 * data-dismissed (display: none): no flash, no layout shift. The bar carries
 * suppressHydrationWarning for that one attribute; once hydrated, the store
 * below removes it. Client-side navigations mount it already closed.
 *
 * Hidden on its own target (/changelog) and, in CSS, on /guides/claude (its
 * own promo bar) and in the homepage's agents view.
 *
 * The announcement itself is ANNOUNCEMENT in LpNav.tsx (server), passed down
 * as a prop (2026-10-07): there it reads CHANGELOG_PATH and is checked against
 * the newest changelog entry without shipping changelog-data to the client.
 */
export type Announcement = {
  /** = the changelog entry id it announces (LATEST_CHANGELOG_ENTRY.id). */
  id: string;
  text: string;
  /** ≤561px: the long line would be cut mid-word; this one fits whole. */
  short: string;
  cta: string;
  href: string;
};

const STORAGE_KEY = "lp-announce-dismissed";
const CHANGE_EVENT = "lp-announce-change";

/** Closed in this page view, whether or not storage took the write. */
let closedHere = false;

function subscribe(onChange: () => void) {
  // Another tab closing it hides it here too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const serverSnapshot = () => false;

/** Before the first paint: the bar is this script's previous sibling. */
const prepaint = (id: string) =>
  `try{if(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})===${JSON.stringify(
    id,
  )})document.currentScript.previousElementSibling.setAttribute("data-dismissed","")}catch(e){}`;

function dismiss(id: string) {
  closedHere = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // storage unavailable: closed for this page view only
  }
  // The ✕ leaves the page with the bar; a keyboard user's focus moves on to
  // the nav's first link instead of dropping to <body>.
  const bar = document.querySelector(".lp-announce");
  if (bar?.contains(document.activeElement)) {
    document.querySelector<HTMLElement>(".lp-nav-logo")?.focus({ preventScroll: true });
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function LpAnnounce({ announcement }: { announcement: Announcement }) {
  const { id, href } = announcement;
  const readDismissed = useCallback(() => {
    if (closedHere) return true;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === id;
    } catch {
      return false;
    }
  }, [id]);
  const dismissed = useSyncExternalStore(subscribe, readDismissed, serverSnapshot);
  const pathname = usePathname();
  if (dismissed || pathname === href) return null;
  // A labelled region, not <aside>: the bar renders inside <main> (LpNav sits
  // in every page's main), where a complementary landmark would be nested.
  return (
    <>
      <div className="lp-announce" role="region" aria-label="Announcement" suppressHydrationWarning>
        <a className="lp-announce__link" href={href} data-analytics-id="nav_announce">
          <span className="lp-announce__text">{announcement.text}</span>
          <span className="lp-announce__text lp-announce__text--short" aria-hidden="true">
            {announcement.short}
          </span>
          <span className="lp-announce__cta">
            <span className="lp-announce__cta-label">{announcement.cta}</span>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" />
            </svg>
          </span>
        </a>
        <button
          type="button"
          className="lp-announce__close"
          aria-label="Dismiss announcement"
          onClick={() => dismiss(id)}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
      <script dangerouslySetInnerHTML={{ __html: prepaint(id) }} />
    </>
  );
}
