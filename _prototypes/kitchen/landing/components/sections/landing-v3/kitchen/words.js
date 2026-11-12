// Every word the kitchen section shows: its two titles, its switch, the badges of the scene and
// the description of the picture. One file, so that the page's copy check reads all of it
// (scripts/homepage-lint.mjs, FILES) and nothing is said in two places. LpKitchen.tsx and the
// scene both read it.
//
// The two titles are the request's own words (2026-11-12): "Anyone can cook" against "Always
// overcooked". Rules kept (the landing-voice skill): a title is one claim that ends with a
// period; a badge holds three words at most; a signal is something the homepage already names
// (an event, a lost deal, funding, hiring, headcount) or a count from a tool the visitor owns;
// no person is named and no result is promised.
//
// An `icon` is a logo of logos.js or a glyph of overlay.js. It is never copy.

export const WORDS = {
  // the switch above the picture, for a screen reader
  switchLabel: "The kitchen",
  with: {
    option: "With Pancake",
    title: "Anyone can cook.",
    // what the picture shows, for someone who cannot see it
    alt: "A small kitchen runs by itself. Signals from your tools ride in on three belts as ingredients. Three chefs mix, flip and plate. Stacks of pancakes leave as new leads.",
  },
  without: {
    option: "Without Pancake",
    title: "Always overcooked.",
    alt: "The same kitchen without Pancake. A belt is down. Every ingredient waits in one slow tank. Pancakes burn. The one plate that leaves is two weeks late.",
  },

  // the badges that pop over each tunnel: one list per belt (left, corner, back)
  signals: [
    [
      { icon: "posthog", text: "New sign-up" },
      { icon: "hubspot", text: "Email opened" },
      { icon: "luma", text: "Event attended" },
      { icon: "hubspot", text: "Deal lost" },
    ],
    [
      { icon: "crunchbase", text: "Just funded" },
      { icon: "jobs", text: "Hiring SDRs" },
      { icon: "crunchbase", text: "New VP Sales" },
      { icon: "jobs", text: "Headcount up" },
    ],
    [
      { icon: "ga", text: "Pricing views up" },
      { icon: "posthog", text: "Feature used" },
      { icon: "ga", text: "Traffic spike" },
    ],
  ],
  // with Pancake: what a plate that leaves becomes, in turn
  results: [
    { icon: "lead", text: "Lead to contact" },
    { icon: "play", text: "Next best Play" },
    { icon: "message", text: "Message drafted" },
  ],

  // without Pancake: a belt gave way, the pipe out of the tank leaks
  beltDown: "Pipeline down",
  pipeLeak: "Sync failed",
  // without Pancake: the tank loads (a percentage follows), then starts again from nothing
  tankLoading: "Loading…",
  tankRebuilding: "Rebuilding the tables…",
  // without Pancake: what the one plate that leaves becomes, in turn
  late: [
    { icon: "late", text: "2-week-old signals" },
    { icon: "lead", text: "2 weeks late" },
  ],
};
