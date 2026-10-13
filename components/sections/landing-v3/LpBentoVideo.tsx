"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from "react";
import { flushSync } from "react-dom";

/**
 * A bento video tile's media (owner: bento package; decisions §7 and §9). Plain data in, no
 * placeholder logic here: LpBento (server) decides what renders and passes the poster <img> as
 * children.
 *
 * Two things, never mixed, and two different files:
 *   1. The MUTED PREVIEW, in the tile: `film.preview`, a cut of about 10 s with NO audio track, a
 *      few hundred kB. Never the film (megabytes: verify/motion.md M-02). Rest picture = the
 *      poster (server markup, lazy). One viewport out, a muted <video preload="none" loop> is
 *      created over it; nothing is fetched until play(). At ≥ 60 % of the tile on screen (or 60 %
 *      of the viewport filled by it), tab visible, not paused by the visitor: it plays, fades in
 *      over the poster once it really plays, and loops. Below that, tab hidden, section hidden
 *      (agents view) or a film open (this tile's or the other one's: nothing moves behind the
 *      scrim while a testimonial speaks): it pauses and keeps its frame. It can never make a
 *      sound: the file has no audio, and the element is muted in markup and again before every
 *      play(). It has NO pause control since 2026-10-13 (founder: "retire le bouton pause"): a
 *      visitor who has not asked for reduced motion cannot stop it, which falls short of WCAG
 *      2.2.2; it does stop off screen, in a hidden tab and behind an open film.
 *      Reduced motion, Save-Data, prefers-reduced-data or a media error: the poster only, and
 *      no preview file is fetched.
 *   2. The FILM WITH SOUND, on demand only: `film.mp4`. The tile itself is a button (a small play
 *      disc at its bottom-left is its visible sign): it opens a native modal <dialog> with the whole frame,
 *      the browser's own controls (play, seek, volume, captions, full screen), the sound on and
 *      its captions showing (WCAG 1.2.2: a film cannot be listed without them, see BentoFilm).
 *      The <video controls> exists only while the dialog is open, so the film is not fetched
 *      before that click; Esc, the Close button or a click on the scrim closes it and stops it;
 *      focus returns to the tile. A visitor who asked to save data gets the lighter encode.
 * Self-gated, so it is not an LpAnimFreeze member: nothing runs off screen.
 */
type Props = {
  film: {
    mp4: string;
    mp4Small?: string;
    preview: { mp4: string; mp4Large?: string; portrait?: { mp4: string; mp4Hi?: string } };
    captions: { src: string; srcLang: string; label: string };
  };
  /** the sound view's poster (the largest still): no black box while the film loads */
  filmPoster?: string;
  /** who speaks: names the dialog and the tile's button */
  title: string;
  labels: { open: string; close: string };
  /** the crop custom properties (bento.css reads them on the poster and the preview) */
  style?: CSSProperties;
  /** the poster <img> */
  children: ReactNode;
};

/** The share of the tile (or of the viewport, for a tile taller than 1 / 0.6 of it) that counts as
 *  "in view" — the same focus rule as the marquee and the play-once cards' 60 % line. */
const IN_VIEW = 0.6;
/** A tile drawn taller than this (device px, capped at 2x) plays the larger preview encode;
 *  smaller tiles play the light one. */
const LARGE_TILE = 520;
/** Phones (≤ 767) play the light encode, except in a tile taller than this in CSS px: the stack's
 *  large tile (495 at 402 wide, 439 at 360), where the light clip's 360 lines would be stretched
 *  4 × on a 3x screen and the picture goes soft the moment it replaces the poster. The small tile
 *  (248 at 402) and a 320-wide phone's large one (386) stay light. */
const LARGE_TILE_PHONE = 400;
/** A tile narrower than this (width / height) plays the film's PORTRAIT preview when it has one:
 *  the cut cropped to the window such a tile shows (806 × 1080 of the frame, 0.746), so the tile
 *  gets every pixel of the file instead of the middle of a landscape one (the Kinro tile was soft:
 *  403 × 540 video px over a 560 × 750 card). Centred in the tile (bento.css [data-crop]). */
const PORTRAIT_TILE = 0.8;
/** …and its full-resolution encode on a desktop tile drawn taller than this (device px, capped at
 *  2x): a 750 px tile on a 2x screen. Phones keep the lighter one. */
const PORTRAIT_HI_TILE = 900;
/** Fired on `document` when a tile's film opens or closes, so the OTHER tile's preview follows
 *  (two films share the section since the Kinro cut landed). */
const FILM_EVENT = "lp-bento-film";
/** A bento film is open in its dialog, whichever tile it belongs to. */
const anyFilmOpen = () => document.querySelector(".lp-bento__dialog[open]") !== null;

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
  /** JS is up and <dialog> exists: the film can open */
  const [canOpen, setCanOpen] = useState(false);
  const [src, setSrc] = useState(film.preview.mp4);
  /** the mounted preview is the portrait crop (its own framing: centred) */
  const [portrait, setPortrait] = useState(false);
  /** the sound view's encode: the film, or its lighter cut for a visitor who asked to save data */
  const [filmSrc, setFilmSrc] = useState(film.mp4);
  /** the dialog is open: its <video controls> is mounted */
  const [filmOpen, setFilmOpen] = useState(false);

  /** the preview must not play: the visitor asked for reduced motion, or the browser refused */
  const pausedRef = useRef(false);
  const inViewRef = useRef(false);
  const filmOpenRef = useRef(false);

  /** Play or pause the preview to match: in view, tab visible, allowed to play, no film open. */
  const sync = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    // filmOpenRef: this tile's film is about to open (set before showModal, so the preview stops
    // first); anyFilmOpen: the other tile's film is open
    const want =
      inViewRef.current && !pausedRef.current && !filmOpenRef.current && !anyFilmOpen() && document.visibilityState === "visible";
    if (want && v.paused) {
      v.muted = true; // React sets the property, but autoplay policies read it at play()
      const p = v.play();
      if (p) {
        p.catch((err: unknown) => {
          // refused (iOS Low Power Mode): the poster stands, and nothing asks again
          if (err instanceof DOMException && err.name === "NotAllowedError") pausedRef.current = true;
        });
      }
    } else if (!want && !v.paused) {
      v.pause();
    }
  }, []);

  /** Mount the preview with the encode that fits the tile as it is drawn now. */
  const attach = useCallback(() => {
    const root = rootRef.current;
    const crop = film.preview.portrait;
    if (root && root.clientHeight > 0) {
      const phone = matchMedia("(max-width: 767px)").matches;
      const drawn = root.clientHeight * Math.min(window.devicePixelRatio || 1, 2);
      if (crop && root.clientWidth / root.clientHeight < PORTRAIT_TILE) {
        setSrc(!phone && crop.mp4Hi && drawn > PORTRAIT_HI_TILE ? crop.mp4Hi : crop.mp4);
        setPortrait(true);
      } else if (film.preview.mp4Large) {
        const large = phone ? root.clientHeight > LARGE_TILE_PHONE : drawn > LARGE_TILE;
        setSrc(large ? film.preview.mp4Large : film.preview.mp4);
      }
    }
    setAttached(true);
  }, [film.preview.mp4, film.preview.mp4Large, film.preview.portrait]);

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
    if (conn?.saveData || matchMedia("(prefers-reduced-data: reduce)").matches) {
      // the poster only, and the film on demand in its lighter encode
      if (film.mp4Small) setFilmSrc(film.mp4Small);
      return;
    }

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    pausedRef.current = reduce;

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
    if (!reduce) near.observe(root); // reduced motion fetches no preview: the poster stands
    focus.observe(root);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener(FILM_EVENT, sync);
    return () => {
      near.disconnect();
      focus.disconnect();
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener(FILM_EVENT, sync);
      stop();
    };
  }, [attach, sync, stop, film.mp4Small]);

  // a freshly attached preview: start it if it is already wanted
  useEffect(() => {
    if (attached) sync();
  }, [attached, sync]);

  /** The preview shows a moving frame: let it cover the poster. On `playing`, and on `timeupdate`
   *  too, as a safety net: WebKit fired no `playing` when play() came before the load and a seek
   *  (the build that played the film from a start time). */
  const reveal = (e: SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (!v.paused && !v.seeking && v.readyState >= 2) setShown(true);
  };

  /** The dialog closed (Esc, the Close button, the scrim): stop the film, release it, resume the preview. */
  const closed = () => {
    filmRef.current?.pause();
    filmOpenRef.current = false;
    setFilmOpen(false);
    sync();
    document.dispatchEvent(new Event(FILM_EVENT)); // the other tile's preview may play again
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
    document.dispatchEvent(new Event(FILM_EVENT)); // the other tile's preview steps aside too
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
            data-crop={portrait ? "portrait" : undefined}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={reveal}
            onTimeUpdate={reveal}
            onError={() => setShown(false)}
          />
        )}
        {/* the whole tile opens the film in the player; the play disc is its visible sign */}
        <button
          type="button"
          className="lp-bento__open"
          hidden={!canOpen}
          aria-haspopup="dialog"
          aria-label={`${labels.open}: ${title}`}
          onClick={openFilm}
        >
          <span className="lp-bento__play" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="14" height="14" focusable="false">
              <path d="M3.4 1.6v8.8L10.6 6z" />
            </svg>
          </span>
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
            {/* captions show from the start (`default`); the browser's own control turns them off */}
            <video ref={filmRef} className="lp-bento__film" src={filmSrc} poster={filmPoster} controls controlsList="nodownload" playsInline preload="none">
              <track kind="captions" src={film.captions.src} srcLang={film.captions.srcLang} label={film.captions.label} default />
            </video>
          </div>
        )}
      </dialog>
    </>
  );
}
