// lp-video-data.ts — the homepage demo film under the hero (LpVideo.tsx): its labels and files.
// The labels are read aloud, never shown; homepage-lint reads this file with the other sections'.
//
// The film is the launch's demo (1:42 since v3), with its captions burned in (no text track to add).
// Files in public/lp/video/, versioned in the name: a new cut gets a new name (v2…), never the
// same path, so no browser or CDN keeps the old one.

export const LP_VIDEO = {
  /** the section's accessible name */
  label: "Pancake demo video",
  /** the poster button's accessible name */
  play: "Play the demo video",
  /** 1920 × 1080, 30 fps, H.264 + AAC, 36.5 MB; moov first, so it plays while it loads.
   *  v3 = the film's second cut (team feedback, 2026-11-03): smarter AI columns ("Reached out
   *  before?", "Engaged with a competitor?"), outreach on social media and email, and a last beat
   *  where the Play is deployed and the Plays page shows every live Play. Same site end card as v2:
   *  the logo and "The Vercel for GTM" only (founder 2026-11-03: the subline, "Works with…" and the
   *  "Start free at pancake.ai" button went, the page's real buttons sit next to the film). */
  src: "/lp/video/pancake-demo-v3.mp4",
  /** 1280 × 720: what phones (under 768 px) load, then play full screen */
  srcPhone: "/lp/video/pancake-demo-v3-phone.mp4",
  /** the film's own frame at 3.70 s (the same in v1, v2 and v3), untouched: the request typed in Claude's composer, the
   *  cursor on send, between two captions (founder 2026-11-03: "the thumbnail should be claude
   *  to reflect what we do today", then this frame, "exact frame or adjacent one") */
  poster: "/lp/video/pancake-demo-v1-poster-prompt.jpg",
} as const;
