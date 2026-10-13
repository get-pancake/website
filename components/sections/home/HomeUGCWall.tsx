/**
 * "Founders on camera" — UGC video wall. A horizontally scrollable row of
 * vertical 9:16 clips of founders talking about the work they handed off to
 * Pancake. Styles live in `app/_styles/home-ugc.css`, imported below (since
 * 2026-10-13; app/layout.tsx used to load it on every route, where nothing
 * rendered this wall).
 *
 * Content pipeline (zero-config drop-in — contract in `public/ugc/README.md`):
 *   - At build/render time we read `public/ugc/*.mp4` from the filesystem.
 *     Each clip may ship an optional sidecar `<basename>.json`
 *     ({ name, handle, quote }) that powers the caption overlay.
 *   - No clips yet? We render four designed placeholder cards (soft
 *     brand-gradient posters + the two-tone pancake blob + a play affordance)
 *     so the section reads as an intentional empty state, not a broken one.
 *
 * Why an inline <script> instead of a `"use client"` component: the fs read
 * pins this module server-side, and Next's `"use client"` directive is
 * file-scoped — a same-file client component is impossible. The ~1KB vanilla
 * script below is idempotent (window guard) and delegates from `document`,
 * so it keeps working across client-side navigations without hydration.
 */

import fs from "node:fs";
import path from "node:path";

import { HomeUGCMarquee } from "@/components/sections/home/HomeUGCMarquee";
import "@/app/_styles/home-ugc.css";


/* ────────────────────────── Filesystem contract ────────────────────────── */

const UGC_DIR = path.join(process.cwd(), "public", "ugc");

type UgcMeta = { name?: string; handle?: string; quote?: string };
type UgcClip = { src: string; meta: UgcMeta };

/** Read the optional `<basename>.json` sidecar; any malformed/missing file
 *  degrades to an empty overlay instead of crashing the build. */
function readSidecar(jsonPath: string): UgcMeta {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (!parsed || typeof parsed !== "object") return {};
    const rec = parsed as Record<string, unknown>;
    const pick = (key: string): string | undefined =>
      typeof rec[key] === "string" ? (rec[key] as string) : undefined;
    return { name: pick("name"), handle: pick("handle"), quote: pick("quote") };
  } catch {
    return {};
  }
}

/** Scan `public/ugc` for clips. Alphabetical order so editors can sequence
 *  with `01-…`, `02-…` prefixes. Missing dir → `[]` → placeholder mode. */
function readClips(): UgcClip[] {
  try {
    return fs
      .readdirSync(UGC_DIR)
      .filter((file) => /\.mp4$/i.test(file))
      .sort()
      .map((file) => ({
        // Segment-encode the filename so spaces etc. survive as a URL.
        src: `/ugc/${encodeURIComponent(file)}`,
        meta: readSidecar(path.join(UGC_DIR, file.replace(/\.mp4$/i, ".json"))),
      }));
  } catch {
    return [];
  }
}

/* ─────────────────────────── Shared SVG bits ───────────────────────────── */

/** Two-tone pancake silhouette — same side/top paths as
 *  `public/pancake-svgs/angled-1.svg` (duplicated here so the placeholder
 *  poster can tint each path with brand tokens via CSS). */
const PANCAKE_SIDE_PATH =
  "M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z";
const PANCAKE_TOP_PATH =
  "M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z";

/** Centered play chip — always visible on placeholders; on video cards it
 *  only appears for reduced-motion visitors (CSS gates it). */
function PlayChip() {
  return (
    <span className="home-ugc-card__play" aria-hidden>
      <svg viewBox="0 0 16 16" aria-hidden focusable="false">
        <path d="M5.2 3.4v9.2l8-4.6z" fill="currentColor" />
      </svg>
    </span>
  );
}

/* ─────────────────────────────── Cards ─────────────────────────────────── */

function VideoCard({ clip }: { clip: UgcClip }) {
  const { name, handle, quote } = clip.meta;
  const label = name ? `Toggle sound on ${name}’s clip` : "Toggle sound on this clip";
  return (
    <li className="home-ugc-card home-ugc-card--video" data-ugc-card data-ugc-sound="off">
      {/*
        React 18 drops the `muted` attribute when server-rendering <video>
        (facebook/react#10389) and browsers refuse to autoplay unmuted video —
        so the tag is emitted as raw HTML to keep `muted` in the payload.
        `clip.src` is encodeURIComponent-safe (no quotes can survive encoding).
      */}
      <div
        className="home-ugc-card__media"
        dangerouslySetInnerHTML={{
          __html: `<video class="home-ugc-card__video" src="${clip.src}" autoplay muted loop playsinline preload="metadata"></video>`,
        }}
      />

      {/* Caption overlay (scrim sits over arbitrary footage, so it uses the
          inverted-surface scrim + on-inverted text, not branded tokens). */}
      {(quote || name || handle) && (
        <div className="home-ugc-card__meta">
          {quote && <p className="home-ugc-card__quote">&ldquo;{quote}&rdquo;</p>}
          {(name || handle) && (
            <p className="home-ugc-card__byline">
              {name}
              {handle && <span className="home-ugc-card__handle"> {handle}</span>}
            </p>
          )}
        </div>
      )}

      <PlayChip />

      {/* Sound state indicator — CSS swaps the glyph off `data-ugc-sound`.
          Until the visitor's first tap (`data-ugc-consent`), the chip
          carries a "Tap for sound" label: the bare 32px speaker-off chip
          never told anyone these clips HAVE audio (mobile QA 2026-08-26). */}
      <span className="home-ugc-card__sound" aria-hidden>
        <svg className="home-ugc-card__sound-off" viewBox="0 0 16 16" aria-hidden focusable="false">
          <path d="M8.5 2.8 4.9 5.6H2.4v4.8h2.5l3.6 2.8z" fill="currentColor" />
          <path d="m10.8 6.2 3.4 3.4M14.2 6.2l-3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <svg className="home-ugc-card__sound-on" viewBox="0 0 16 16" aria-hidden focusable="false">
          <path d="M8.5 2.8 4.9 5.6H2.4v4.8h2.5l3.6 2.8z" fill="currentColor" />
          <path d="M10.8 5.4c1.5 1.4 1.5 3.8 0 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M12.9 3.6c2.4 2.4 2.4 6.4 0 8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
        <span className="home-ugc-card__sound-hint">Tap for sound</span>
      </span>

      {/* Full-card hit target. A <button>, not an <a> — this is a media
          control, not a signup CTA, so the anchor-analytics rule is moot. */}
      <button type="button" className="home-ugc-card__toggle" aria-label={label} />
    </li>
  );
}

/** Designed empty state: pink → purple → yellow → pink rotation, so a wall
 *  with zero clips still looks like a stack worth flipping. */
const PLACEHOLDER_VARIANTS = ["pink", "purple", "yellow", "pink"] as const;

function PlaceholderCard({ variant }: { variant: (typeof PLACEHOLDER_VARIANTS)[number] }) {
  return (
    <li className={`home-ugc-card home-ugc-card--placeholder home-ugc-card--${variant}`}>
      <div className="home-ugc-card__poster" aria-hidden>
        <svg className="home-ugc-blob" viewBox="0 0 49 48" aria-hidden focusable="false">
          <path className="home-ugc-blob__side" d={PANCAKE_SIDE_PATH} />
          <path className="home-ugc-blob__top" d={PANCAKE_TOP_PATH} />
        </svg>
      </div>
      <div className="home-ugc-card__caption">
        <p className="home-ugc-card__caption-title">Clip coming soon</p>
      </div>
    </li>
  );
}

/* ─────────────────────── Inline interaction script ─────────────────────── */

/**
 * Click-to-unmute + reduced-motion autoplay guard.
 *   - Click a card: unmute + restart it, re-mute every other card, flip the
 *     `data-ugc-sound` indicator. Click again: mute it back.
 *   - `prefers-reduced-motion: reduce`: previews must not autoplay. CSS can't
 *     pause a video, so the script sweeps on init (covers clips that started
 *     before it ran) and a capture-phase `play` listener re-pauses any
 *     non-consented preview that starts later (`play` doesn't bubble).
 *     Cards the visitor explicitly tapped carry `data-ugc-consent="true"`.
 */
const UGC_SCRIPT = `(function () {
  if (window.__pancakeUgcWall) return; window.__pancakeUgcWall = true;
  var prm = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Center the overflowing full-bleed strip on the page axis so cards crop
  // symmetrically at both edges (the resting composition; snap alignment
  // keeps scrolled positions symmetric too). Card layout is CSS-fixed
  // (aspect-ratio), so one pass at parse time is layout-stable.
  document.querySelectorAll("[data-ugc-wall] .home-ugc-track").forEach(function (track) {
    var overflow = track.scrollWidth - track.clientWidth;
    if (overflow > 0) track.scrollLeft = overflow / 2;
  });
  function sweep() {
    if (!prm.matches) return;
    document.querySelectorAll("[data-ugc-card] video").forEach(function (v) {
      var card = v.closest("[data-ugc-card]");
      if (card && card.getAttribute("data-ugc-consent") !== "true") v.pause();
    });
  }
  sweep();
  if (prm.addEventListener) prm.addEventListener("change", sweep);
  document.addEventListener("play", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var card = t.closest("[data-ugc-card]");
    if (card && prm.matches && card.getAttribute("data-ugc-consent") !== "true") t.pause();
  }, true);
  // Founder rule: sound never keeps playing off-screen. When a sound-on
  // card leaves the viewport (page scroll OR the strip's own horizontal
  // scroll), mute it back — and pause the loop itself (mobile review
  // 2026-07-07: five looping videos decoding for the whole visit is a
  // battery drain; they resume as soon as the card scrolls back in, and
  // the document-level play handler still enforces the PRM gate).
  if ("IntersectionObserver" in window) {
    var muteOffscreen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target.querySelector("video");
        if (!v) return;
        if (entry.isIntersecting) {
          if (v.paused) {
            var resumed = v.play();
            if (resumed && resumed.catch) resumed.catch(function () {});
          }
          return;
        }
        if (!v.muted) {
          v.muted = true;
          entry.target.setAttribute("data-ugc-sound", "off");
        }
        v.pause();
      });
    }, { threshold: 0.3 });
    document.querySelectorAll("[data-ugc-card]").forEach(function (card) {
      muteOffscreen.observe(card);
    });
  }
  document.addEventListener("click", function (e) {
    var card = e.target && e.target.closest ? e.target.closest("[data-ugc-card]") : null;
    if (!card) return;
    var video = card.querySelector("video");
    if (!video) return;
    var wall = card.closest("[data-ugc-wall]") || document;
    wall.querySelectorAll("[data-ugc-card]").forEach(function (other) {
      if (other === card) return;
      var v = other.querySelector("video");
      if (v && !v.muted) { v.muted = true; other.setAttribute("data-ugc-sound", "off"); }
    });
    if (video.muted) {
      card.setAttribute("data-ugc-consent", "true");
      card.setAttribute("data-ugc-sound", "on");
      video.muted = false;
      video.currentTime = 0;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      video.muted = true;
      card.setAttribute("data-ugc-sound", "off");
    }
  });
})();`;

/* ─────────────────────────────── Section ───────────────────────────────── */

export function HomeUGCWall({ alt = false }: { alt?: boolean } = {}) {
  const clips = readClips();
  const hasClips = clips.length > 0;

  // A proof section must not ship without proof: on the production build the
  // section renders ONLY once real clips exist in public/ugc/. Dev and Vercel
  // preview builds show the designed placeholder cards so the layout can be
  // reviewed before the clips land (VERCEL_ENV is "preview" on PR deploys).
  const showPlaceholders =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
  if (!hasClips && !showPlaceholders) return null;

  return (
    /* No visible header (founder call 2026-07-03: "Founders on camera, real
       workloads handed off" read as AI slop) — the wall rides under the
       X-posts' "Take it from them", so the two proof formats literally share
       one title. aria-label keeps the landmark named for screen readers. */
    <section
      className={`home-landing-section${alt ? " home-landing-section--alt" : ""} home-ugc`}
      aria-label="Founders on camera"
      data-ugc-wall
    >
      {/* Full-bleed band OUTSIDE the page container — same recipe as the
          X-posts and org bands. The strip is centered on the page axis by
          the init script when it overflows (symmetric crops both edges);
          `role="list"` restated because `list-style: none` strips list
          semantics in Safari/VoiceOver. */}
      <ul className="home-ugc-track" role="list">
        {hasClips
          ? clips.map((clip) => <VideoCard key={clip.src} clip={clip} />)
          : PLACEHOLDER_VARIANTS.map((variant, i) => <PlaceholderCard key={`${variant}-${i}`} variant={variant} />)}
      </ul>

      {/* Interactivity only matters once real clips exist. */}
      {hasClips && <script dangerouslySetInnerHTML={{ __html: UGC_SCRIPT }} />}
      {/* Mobile-only counter-drift (client island in this server component). */}
      <HomeUGCMarquee />
    </section>
  );
}
