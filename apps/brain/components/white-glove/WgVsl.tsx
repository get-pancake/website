"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { WG_VSL as c } from "../../lib/white-glove/copy";

/**
 * The film next to the form (campaign ask, 2026-11-06: the video level with
 * the form, playing on arrival). It starts muted, the only autoplay browsers
 * allow, under a "Watch with sound" button; the button starts it over with
 * sound and the native controls. No autoplay under prefers-reduced-motion,
 * or when the browser refuses it (iOS Low Power Mode): the poster and the
 * same button.
 *
 * The film is the main website's homepage film, served from pancake.ai
 * (moov first, so it plays while it loads), until the White Glove Loom is
 * ready: then export its MP4 and swap FILM. Phones load the 720p cut.
 */
const FILM = {
  /** 1920 × 1080, H.264 + AAC, 36.5 MB, 102 s */
  src: "https://pancake.ai/lp/video/pancake-demo-v3.mp4",
  /** 1280 × 720, 7.4 MB: what phones load */
  srcPhone: "https://pancake.ai/lp/video/pancake-demo-v3-phone.mp4",
  poster: "https://pancake.ai/lp/video/pancake-demo-v1-poster-prompt.jpg",
};
const PHONE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** poster: not playing yet · preview: muted autoplay · sound: from the start, with sound and controls */
type Mode = "poster" | "preview" | "sound";

export function WgVsl() {
  const filmRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("poster");

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    // The film's own "playing" event, not play()'s promise: a tab opened in
    // the background may start the film later than the promise settles.
    const onPlaying = () => setMode((m) => (m === "poster" && film.muted ? "preview" : m));
    film.addEventListener("playing", onPlaying);
    film.src = window.matchMedia(PHONE_QUERY).matches ? FILM.srcPhone : FILM.src;
    if (!window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      film.muted = true;
      film.play().catch(() => {}); // refused: the poster and the button stay
    }
    return () => film.removeEventListener("playing", onPlaying);
  }, []);

  const watch = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    setMode("sound");
    film.muted = false;
    film.currentTime = 0;
    film.play().catch(() => {});
    film.focus({ preventScroll: true });
  }, []);

  return (
    <div className="wg-vsl" data-mode={mode}>
      <video
        ref={filmRef}
        className="wg-vsl__film"
        poster={FILM.poster}
        preload="metadata"
        playsInline
        controls={mode === "sound"}
        aria-label={c.label}
        tabIndex={mode === "sound" ? 0 : -1}
      />
      {mode !== "sound" ? (
        <button type="button" className="wg-vsl__sound" onClick={watch}>
          <span className="wg-vsl__pill">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              {mode === "preview" ? (
                <path
                  fill="currentColor"
                  d="M11 5 6.5 8.5H3v7h3.5L11 19V5Zm4.2 2.6-1.1 1.1a4.6 4.6 0 0 1 0 6.6l1.1 1.1a6.1 6.1 0 0 0 0-8.8Zm2.5-2.5-1.1 1.1a8.1 8.1 0 0 1 0 11.6l1.1 1.1a9.6 9.6 0 0 0 0-13.8Z"
                />
              ) : (
                <path fill="currentColor" d="M8 5.5v13l10.5-6.5L8 5.5Z" />
              )}
            </svg>
            {c.sound}
          </span>
        </button>
      ) : null}
    </div>
  );
}
