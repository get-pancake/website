// lp-video-data.ts — the homepage demo film under the hero (LpVideo.tsx): its labels and files.
// The labels are read aloud, never shown; homepage-lint reads this file with the other sections'.
//
// The film is the launch's 1:31 demo, with its captions burned in (no text track to add).
// Files in public/lp/video/, versioned in the name: a new cut gets a new name (v2…), never the
// same path, so no browser or CDN keeps the old one.

export const LP_VIDEO = {
  /** the section's accessible name */
  label: "Pancake demo video",
  /** the poster button's accessible name */
  play: "Play the demo video",
  /** 1920 × 1080, 30 fps, H.264 + AAC, 27.9 MB; moov first, so it plays while it loads */
  src: "/lp/video/pancake-demo-v1.mp4",
  /** 1280 × 720, 6.1 MB: what phones (under 768 px) load, then play full screen */
  srcPhone: "/lp/video/pancake-demo-v1-phone.mp4",
  /** the film's own frame at 3.70 s, untouched: the request typed in Claude's composer, the
   *  cursor on send, between two captions (founder 2026-11-03: "the thumbnail should be claude
   *  to reflect what we do today", then this frame, "exact frame or adjacent one") */
  poster: "/lp/video/pancake-demo-v1-poster-prompt.jpg",
} as const;
