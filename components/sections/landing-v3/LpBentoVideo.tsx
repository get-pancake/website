"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A bento video tile's media (owner: bento package; decision 2026-10-09 §7). Plain data in, no
 * placeholder logic here: LpBento (server) decides what renders.
 *
 *   - Rest picture = the poster <img> (server markup, lazy). No JS, Save-Data, prefers-reduced-data
 *     or a media error: the poster is all there is, and no control shows.
 *   - Approach (one viewport out): the muted <video> is created, preload="metadata", invisible over
 *     the poster. The file is fetched no earlier (reduced motion: not before the visitor's Play).
 *   - ≥ 60 % of the tile on screen (or 60 % of the viewport filled by it), tab visible, not paused
 *     by the visitor: play() muted, looping; it fades in over the poster once it is actually
 *     playing. Below that, tab hidden, or the section hidden (agents view: display:none reports no
 *     intersection): pause(), keeping the frame on screen (never rewinds on screen).
 *   - The play / pause button (WCAG 2.2.2) is shown once JS knows the clip can play. Reduced motion:
 *     nothing autoplays and the button starts in its "Play video" state (a visitor-started clip is
 *     fine). Autoplay refused by the browser (iOS Low Power Mode): same as a visitor pause.
 * Self-gated, so it is not an LpAnimFreeze member: nothing runs off screen.
 */
type Props = {
  mp4: string;
  webm?: string;
  poster: { src: string; srcSet: string; sizes: string; width: number; height: number };
  labels: { pause: string; play: string };
};

/** The share of the tile (or of the viewport, for a tile taller than 1 / 0.6 of it) that counts as
 *  "in view" — the same focus rule as the marquee and the play-once cards' 60 % line. */
const IN_VIEW = 0.6;

export function LpBentoVideo({ mp4, webm, poster, labels }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** the <video> exists (approached, or the visitor pressed Play) */
  const [attached, setAttached] = useState(false);
  /** the clip has played at least one frame: it now covers the poster */
  const [shown, setShown] = useState(false);
  /** JS is up and the clip may play: the control is shown */
  const [available, setAvailable] = useState(false);
  const [paused, setPaused] = useState(false);
  const [src, setSrc] = useState(mp4);

  const pausedRef = useRef(false);
  const inViewRef = useRef(false);

  /** Play or pause to match: in view, tab visible, not paused by the visitor. */
  const sync = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const want = inViewRef.current && !pausedRef.current && document.visibilityState === "visible";
    if (want && v.paused) {
      v.muted = true; // React sets the property, but autoplay policies read it at play()
      const p = v.play();
      if (p) {
        p.catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            pausedRef.current = true;
            setPaused(true);
          }
        });
      }
    } else if (!want && !v.paused) {
      v.pause();
    }
  }, []);

  /** whatever <video> is mounted when the observers go (unmount, a prop change) stops */
  const stop = useCallback(() => videoRef.current?.pause(), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || matchMedia("(prefers-reduced-data: reduce)").matches) return; // poster only

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    pausedRef.current = reduce;
    setPaused(reduce);
    setAvailable(true);
    if (webm && document.createElement("video").canPlayType("video/webm") !== "") setSrc(webm);

    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAttached(true);
          near.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const focus = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const viewport = e.rootBounds?.height ?? window.innerHeight;
          inViewRef.current =
            e.isIntersecting && (e.intersectionRatio >= IN_VIEW || e.intersectionRect.height >= IN_VIEW * viewport);
        }
        sync();
      },
      { threshold: [0, 0.25, 0.5, IN_VIEW, 0.75, 1] },
    );
    if (!reduce) near.observe(root); // reduced motion fetches nothing until the visitor presses Play
    focus.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      near.disconnect();
      focus.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [webm, sync, stop]);

  // a freshly attached <video>: start it if it is already wanted
  useEffect(() => {
    if (attached) sync();
  }, [attached, sync]);

  const toggle = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next && !attached) setAttached(true); // Play pressed before the clip was fetched
    sync();
  };

  return (
    <div ref={rootRef} className="lp-bento__media" data-playing={shown ? "" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- art-directed poster, srcset by hand */}
      <img
        className="lp-bento__poster"
        src={poster.src}
        srcSet={poster.srcSet}
        sizes={poster.sizes}
        width={poster.width}
        height={poster.height}
        alt=""
        loading="lazy"
        decoding="async"
      />
      {attached && (
        <video
          ref={videoRef}
          className="lp-bento__video"
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setShown(true)}
          onError={() => {
            setAvailable(false);
            setShown(false);
          }}
        />
      )}
      <button
        type="button"
        className="lp-bento__pause"
        hidden={!available}
        aria-label={paused ? labels.play : labels.pause}
        onClick={toggle}
      >
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
          {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
        </svg>
      </button>
    </div>
  );
}
