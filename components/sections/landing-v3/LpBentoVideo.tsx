"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";
import { flushSync } from "react-dom";

/**
 * A bento video tile's media (owner: bento package; decisions §7 and §9). Plain data in, no
 * placeholder logic here: LpBento (server) decides what renders and passes the poster <img> as
 * children.
 *
 * Two things, never mixed:
 *   1. The MUTED PREVIEW, in the tile. Rest picture = the poster (server markup, lazy). One
 *      viewport out, a muted <video preload="none"> is created over it; nothing is fetched until
 *      play(). At ≥ 60 % of the tile on screen (or 60 % of the viewport filled by it), tab visible,
 *      not paused by the visitor: it plays from `previewStart` (the speaker's first frame, past the
 *      intro B-roll), fades in over the poster once it really plays, and loops back to
 *      `previewStart`. Below that, tab hidden, section hidden (agents view) or the film open: it
 *      pauses and keeps its frame. A play / pause button stops it (WCAG 2.2.2). It can never make
 *      a sound: the element is muted in markup and again before every play().
 *      Reduced motion: no autoplay, the button starts as "Play preview" and nothing is fetched
 *      before it is pressed. Save-Data, prefers-reduced-data or a media error: the poster only.
 *   2. The FILM WITH SOUND, on demand only. The tile itself is a button ("Watch with sound", a
 *      pill at its bottom-left): it opens a native modal <dialog> with the whole frame, the
 *      browser's own controls (play, seek, volume, full screen) and the sound on. The <video
 *      controls> exists only while the dialog is open; Esc, the Close button or a click on the
 *      scrim closes it and stops it; focus returns to the tile.
 * Self-gated, so it is not an LpAnimFreeze member: nothing runs off screen.
 */
type Props = {
  film: {
    mp4: string;
    mp4Small?: string;
    previewStart: number;
    captions?: { src: string; srcLang: string; label: string };
  };
  /** the sound view's poster (the largest still): no black box while the film loads */
  filmPoster?: string;
  /** who speaks: names the dialog and the tile's button */
  title: string;
  labels: { pause: string; play: string; sound: string; close: string };
  /** the crop custom properties (bento.css reads them on the poster and the preview) */
  style?: CSSProperties;
  /** the poster <img> */
  children: ReactNode;
};

/** The share of the tile (or of the viewport, for a tile taller than 1 / 0.6 of it) that counts as
 *  "in view" — the same focus rule as the marquee and the play-once cards' 60 % line. */
const IN_VIEW = 0.6;
/** A tile drawn taller than this (device px, capped at 2x) previews the full encode; smaller
 *  tiles and phones preview the light one. */
const LARGE_TILE = 520;

export function LpBentoVideo({ film, filmPoster, title, labels, style, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  /** the preview <video> exists (approached, or the visitor pressed Play) */
  const [attached, setAttached] = useState(false);
  /** the preview has played at least one frame: it now covers the poster */
  const [shown, setShown] = useState(false);
  /** JS is up and the preview may play: its play / pause control is shown */
  const [previewable, setPreviewable] = useState(false);
  /** JS is up and <dialog> exists: the film can open */
  const [canOpen, setCanOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [src, setSrc] = useState(film.mp4Small ?? film.mp4);
  /** the dialog is open: its <video controls> is mounted */
  const [filmOpen, setFilmOpen] = useState(false);

  const pausedRef = useRef(false);
  const inViewRef = useRef(false);
  const filmOpenRef = useRef(false);
  const start = film.previewStart;

  /** Play or pause the preview to match: in view, tab visible, not paused, the film closed. */
  const sync = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const want = inViewRef.current && !pausedRef.current && !filmOpenRef.current && document.visibilityState === "visible";
    if (want && v.paused) {
      v.muted = true; // React sets the property, but autoplay policies read it at play()
      const p = v.play();
      if (p) {
        p.catch((err: unknown) => {
          // refused (iOS Low Power Mode): same as a visitor pause
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

  /** Mount the preview with the encode that fits the tile as it is drawn now. */
  const attach = useCallback(() => {
    const root = rootRef.current;
    if (root && film.mp4Small) {
      const phone = matchMedia("(max-width: 767px)").matches;
      const drawn = root.clientHeight * Math.min(window.devicePixelRatio || 1, 2);
      setSrc(!phone && drawn > LARGE_TILE ? film.mp4 : film.mp4Small);
    }
    setAttached(true);
  }, [film.mp4, film.mp4Small]);

  /** whatever is mounted when the observers go (unmount, a prop change) stops */
  const stop = useCallback(() => {
    videoRef.current?.pause();
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setCanOpen(typeof HTMLDialogElement !== "undefined" && typeof HTMLDialogElement.prototype.showModal === "function");
    if (typeof IntersectionObserver === "undefined") return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || matchMedia("(prefers-reduced-data: reduce)").matches) return; // poster, and the film on demand

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    pausedRef.current = reduce;
    setPaused(reduce);
    setPreviewable(true);

    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          attach();
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
  }, [attach, sync, stop]);

  // a freshly attached preview: start it if it is already wanted
  useEffect(() => {
    if (attached) sync();
  }, [attached, sync]);

  /** The preview shows a moving frame: let it cover the poster. On `playing`, and on `timeupdate`
   *  too: WebKit fires no `playing` when play() came before the load and a start-time seek. */
  const reveal = (e: SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (!v.paused && !v.seeking && v.readyState >= 2) setShown(true);
  };

  const toggle = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (!next && !attached) attach(); // Play pressed before the preview was created
    sync();
  };

  /** The dialog closed (Esc, the Close button, the scrim): stop the film, release it, resume the preview. */
  const closed = () => {
    filmRef.current?.pause();
    filmOpenRef.current = false;
    setFilmOpen(false);
    sync();
  };

  /** Open the film with its sound. Everything happens inside the click, so the browser lets it play. */
  const openFilm = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    filmOpenRef.current = true;
    flushSync(() => setFilmOpen(true)); // the <video controls> is in the dialog before it opens
    sync(); // the preview steps aside
    try {
      dialog.showModal();
    } catch {
      closed();
      return;
    }
    // focus the box, not the Close button: a ring on the ✕ the instant the dialog opens reads as
    // a glitch (the booking sheet's rule, LpModals); Tab goes to Close, then to the film's controls
    boxRef.current?.focus();
    filmRef.current?.play().catch(() => {
      /* refused: the native controls are right there */
    });
  };

  return (
    <>
      <div ref={rootRef} className="lp-bento__media" data-playing={shown ? "" : undefined} style={style}>
        {children}
        {attached && (
          <video
            ref={(node) => {
              videoRef.current = node;
              // muted as an attribute too, not only the property React sets: the preview has no sound, ever
              if (node) node.defaultMuted = node.muted = true;
            }}
            className="lp-bento__video"
            // a media fragment: the first frame decoded is the preview's, not the film's intro
            src={`${src}#t=${start}`}
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.currentTime < start - 0.25) v.currentTime = start; // engines that ignore the fragment
            }}
            onEnded={(e) => {
              e.currentTarget.currentTime = start; // loop to the preview's start, never to the intro
              sync();
            }}
            onPlaying={reveal}
            onTimeUpdate={reveal}
            onError={() => {
              setPreviewable(false);
              setShown(false);
            }}
          />
        )}
        {/* the whole tile opens the film; the pill is its visible label */}
        <button
          type="button"
          className="lp-bento__open"
          hidden={!canOpen}
          aria-haspopup="dialog"
          aria-label={`${labels.sound}: ${title}`}
          onClick={openFilm}
        >
          <span className="lp-bento__sound" aria-hidden="true">
            <svg viewBox="0 0 14 14" width="14" height="14" focusable="false">
              <path d="M1.5 5.2h2.2L7 2.4v9.2L3.7 8.8H1.5z" />
              <path className="lp-bento__sound-wave" d="M9.2 4.9a3 3 0 0 1 0 4.2M10.9 3.2a5.4 5.4 0 0 1 0 7.6" />
            </svg>
            <span className="lp-bento__sound-label">{labels.sound}</span>
          </span>
        </button>
        <button
          type="button"
          className="lp-bento__pause"
          hidden={!previewable}
          aria-label={paused ? labels.play : labels.pause}
          onClick={toggle}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
            {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
          </svg>
        </button>
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a click on the scrim closes; the keyboard has Esc (native) and the Close button */}
      <dialog
        ref={dialogRef}
        className="lp-bento__dialog"
        aria-label={title}
        onClose={closed}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        {filmOpen && (
          <div ref={boxRef} className="lp-bento__dialog-box" tabIndex={-1}>
            <div className="lp-bento__dialog-bar">
              <p className="lp-bento__dialog-title">{title}</p>
              <button type="button" className="lp-bento__close" aria-label={labels.close} onClick={() => dialogRef.current?.close()}>
                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
            {/* captions: a <track> only once a transcript was checked by ear (lp-bento-data.ts) */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- no verified transcript of this cut yet; the track mounts as soon as the data carries one */}
            <video ref={filmRef} className="lp-bento__film" src={film.mp4} poster={filmPoster} controls controlsList="nodownload" playsInline preload="none">
              {film.captions && <track kind="captions" src={film.captions.src} srcLang={film.captions.srcLang} label={film.captions.label} default />}
            </video>
          </div>
        )}
      </dialog>
    </>
  );
}
