"use client";

// LpVideo — the homepage demo film, right under the hero, in the slot the demo window had
// (founder 2026-11-03: the launch's 1:31 demo film there, click to play, drawn "pixel for pixel"
// after his reference: a rounded 16:9 card, the poster, a frosted round play mark).
//
// At rest: ONE button over the whole card, the poster (the film's own frame of the request typed
// in Claude; founder: "the thumbnail should be claude to reflect what we do today") with the play
// mark in its centre. A click (or Enter / Space) removes the button and plays the film in the
// card, with sound and the browser's own controls (no download, no speed menu, no picture in
// picture), and the focus moves onto the film. Phones (under 768 px wide) load the 720p file and
// open it full screen once it plays. The film's end, or closing iOS's full-screen player, brings
// the poster back with the film at 0. preload="none": nothing of the film loads before the click.
//
// The card keeps the demo window's one scroll effect (founder 2026-10-12): from 1025 px wide it
// grows from .94 to 1 as the visitor scrolls to it (lp-demo-scroll.ts; the rule is video.css's),
// and its top edge peeks at the bottom of the first screen (hero.css "Homepage first screen").
// `?still` (captures) draws it at 1.
//
// A direct <section> child of main.lp: the agents view hides it with every human section
// (audience.css). Class block `lp-video` (video.css).

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { mountWindowGrow } from "./lp-demo-scroll";
import { LP_VIDEO } from "./lp-video-data";

/** Phones play the light file, full screen: the width under which video.css draws the card 3:2. */
const PHONE_QUERY = "(max-width: 767px)";

/** The poster's widths on screen (video.css): phones, tablets, desktop. */
const POSTER_SIZES = "(max-width: 767px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 96px), 1136px";

/** No JS: the card at 1 (no grow), no poster button; the film plays from its own controls. */
const NOSCRIPT_CSS =
  "<style>.lp-video .lp-video__card{scale:none!important}.lp-video__poster{display:none!important}" +
  ".lp-video__film{opacity:1!important;pointer-events:auto!important;visibility:visible!important}</style>";

/** iOS Safari's own full-screen player for a <video>. */
type Film = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export function LpVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<Film>(null);
  const posterRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);
  /** the film had the focus when it stopped: the poster button takes it back */
  const refocus = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;
    const grow = mountWindowGrow(section, card);
    if (/[?&]still\b/.test(window.location.search)) grow.lock();
    return () => grow.destroy();
  }, []);

  /** Back to the poster, the film at 0. */
  const reset = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    refocus.current = document.activeElement === film;
    film.pause();
    film.currentTime = 0;
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (playing || !refocus.current) return;
    refocus.current = false;
    posterRef.current?.focus({ preventScroll: true });
  }, [playing]);

  // iOS's full-screen player: closing it is the only way back to the page
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    film.addEventListener("webkitendfullscreen", reset);
    return () => film.removeEventListener("webkitendfullscreen", reset);
  }, [reset]);

  const play = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    const phone = window.matchMedia(PHONE_QUERY).matches;
    // a src attribute wins over the <source> (the full file); set once, kept for a replay
    if (phone && !film.getAttribute("src")) film.src = LP_VIDEO.srcPhone;
    // shown before play() is asked (iOS Safari is strict about a hidden film), not after it
    flushSync(() => setPlaying(true));
    film.play().then(
      () => {
        if (!phone) {
          film.focus({ preventScroll: true });
        } else if (film.webkitEnterFullscreen) {
          film.webkitEnterFullscreen();
        } else {
          film.requestFullscreen?.().catch(() => {});
        }
      },
      // refused or failed: the film stays in the card with its controls, its own play button
      () => {},
    );
  }, []);

  return (
    <section ref={sectionRef} className="lp-video" aria-label={LP_VIDEO.label}>
      <div ref={cardRef} className="lp-video__card">
        {!playing && (
          <button
            ref={posterRef}
            type="button"
            className="lp-video__poster"
            aria-label={LP_VIDEO.play}
            onClick={play}
          >
            {/* eager, not priority (2026-11-03 mobile pass): on a phone only 17 px of the card show
                in the first screen and the headline is the largest paint, so a high-priority
                preload took bandwidth from the page's CSS and fonts on a slow connection; eager
                still fetches it with the page (on a laptop its top third shows). quality 100 keeps
                the UI text crisp (a flat frame: 50 KB of WebP at 1920) */}
            <Image
              src={LP_VIDEO.poster}
              alt=""
              fill
              loading="eager"
              sizes={POSTER_SIZES}
              quality={100}
              className="lp-video__img"
            />
            <span className="lp-video__mark" aria-hidden="true">
              <span className="lp-video__play">
                <svg viewBox="-3 -3 36.19 42.66" fill="none">
                  <path
                    d="M30.19 18.33L0 36.66V0L30.19 18.33Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
          </button>
        )}
        <video
          ref={filmRef}
          className="lp-video__film"
          data-on={playing ? "" : undefined}
          aria-label={LP_VIDEO.label}
          tabIndex={playing ? 0 : -1}
          playsInline
          controls
          preload="none"
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onEnded={reset}
        >
          <source src={LP_VIDEO.src} type="video/mp4" />
        </video>
      </div>
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
    </section>
  );
}
