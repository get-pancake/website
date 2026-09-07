import type { ReactNode } from "react";

// Testimonials — "Take it from them" (Figma node 4257:5006, reworked 2026-08-28
// per founder direction: distinct tweets per row, counter-scrolling marquees).
// Two strips of 4 distinct X-post cards each — row 1 scrolls left, row 2 right.
// Each strip's track holds its 4-card set twice (duplicate aria-hidden) and
// slides exactly one set width (2300px) per loop, so the wrap is seamless.
// Double spaces in the row-1 bodies are verbatim from Figma (pre-wrap).
// ≤767 the strips are display:none and .lp-tst-carousel below takes over: all
// 8 tweets once (no marquee duplicates) in a horizontal scroll-snap carousel
// (founder 2026-08-31: smaller cards, horizontal swipe instead of tall stack).

type Card = {
  avatar: string;
  name: string;
  handle: string;
  time: string;
  replies: string;
  reposts: string;
  likes: string;
  body: ReactNode;
};

const ROW_1: Card[] = [
  {
    avatar: "/lp/lp-t-avatar-1.png",
    name: "Dara Osei",
    handle: "@daraships",
    time: "2d",
    replies: "47",
    reposts: "129",
    likes: "1.9k",
    body: "Day 14 of the pancake experiment: my engineering agent has shipped 38  PRs, my recruiter agent screened 412 candidates, and my CFO agent is  actually scary good at modeling.",
  },
  {
    avatar: "/lp/lp-t-avatar-2.png",
    name: "Priya Natarajan",
    handle: "@priyabuilds",
    time: "5h",
    replies: "212",
    reposts: "468",
    likes: "3.1k",
    body: (
      <>
        {"I asked "}
        <span className="lp-tst-mention">@pancake</span>
        {' to "run my entire content engine" and it just… did. Calendar, briefs, drafts, scheduling, analytics. I am the bottleneck now.'}
      </>
    ),
  },
  {
    avatar: "/lp/lp-t-avatar-3.png",
    name: "Marco Delgado",
    handle: "@marcodelg",
    time: "1d",
    replies: "96",
    reposts: "311",
    likes: "2.4k",
    body: "Hired 4 pancake agents on Friday. Came back Monday to a launched landing page, 11 closed deals, and an inbox at zero. I genuinely don't know  what to do with my time.",
  },
  {
    avatar: "/lp/lp-t-avatar-4.png",
    name: "June Park",
    handle: "@junepk",
    time: "3d",
    replies: "158",
    reposts: "84",
    likes: "1.2k",
    body: "The kill switch works. I tested it. My whole org froze mid-sentence,  then resumed exactly where it left off when I un-paused. This is  actually production software.",
  },
];

const ROW_2: Card[] = [
  {
    avatar: "/lp/lp-t-avatar-3.png",
    name: "Theo Lindqvist",
    handle: "@theolq",
    time: "8h",
    replies: "33",
    reposts: "87",
    likes: "941",
    body: "My support agent closed 214 tickets this week and CSAT went up two points. I read every transcript hunting for the one where it broke. Still looking.",
  },
  {
    avatar: "/lp/lp-t-avatar-1.png",
    name: "Amara Boateng",
    handle: "@amarab",
    time: "6d",
    replies: "124",
    reposts: "256",
    likes: "1.8k",
    body: "Told my ops agent to clean up the CRM. It found $18k a year in tools nobody remembered buying. The cleanup also happened, eventually.",
  },
  {
    avatar: "/lp/lp-t-avatar-4.png",
    name: "Renata Fischer",
    handle: "@renataf",
    time: "12h",
    replies: "61",
    reposts: "143",
    likes: "1.1k",
    body: (
      <>
        {"My "}
        <span className="lp-tst-mention">@pancake</span>
        {" org ran its first standup without me. 9am, six agents, no small talk, done in 40 seconds. The notes were better than mine have ever been."}
      </>
    ),
  },
  {
    avatar: "/lp/lp-t-avatar-2.png",
    name: "Sam Whitfield",
    handle: "@samwhit",
    time: "4d",
    replies: "78",
    reposts: "202",
    likes: "1.6k",
    body: "Gave the design agent our brand file at midnight. Woke up to three landing pages, a launch deck, and 40 social banners. I had notes on exactly one of them.",
  },
];

function TestimonialCard({ card }: { card: Card }) {
  return (
    <article className="lp-tst-card">
      <div className="lp-tst-userrow">
        <img alt="" className="lp-tst-avatar" height={48} src={card.avatar} width={48} loading="lazy" decoding="async" />
        <div className="lp-tst-id">
          <p className="lp-tst-name">{card.name}</p>
          <p className="lp-tst-handle">{`${card.handle} · ${card.time}`}</p>
        </div>
        <img alt="" className="lp-tst-x" height={48} src="/lp/lp-t-x-logo.svg" width={48} loading="lazy" decoding="async" />
      </div>
      <p className="lp-tst-body">{card.body}</p>
      <div className="lp-tst-div" />
      <div className="lp-tst-meta">
        <span>{card.replies} replies</span>
        <span>{card.reposts} reposts</span>
        <span>{card.likes} likes</span>
        <span className="lp-tst-spacer" />
        <span className="lp-tst-via">via X</span>
      </div>
    </article>
  );
}

export function LpTestimonials() {
  return (
    <section aria-labelledby="lp-tst-title" className="lp-tst">
      <div className="lp-tst-head">
        <h2 className="lp-title-section lp-tst-title" id="lp-tst-title">
          Take it from them
        </h2>
      </div>
      {/* ONE row (founder 2026-08-31): all 8 tweets in a single marquee.
          Set = 8×(559+16) = 4600px ≥ any supported viewport, so two copies
          cover every width; the keyframe translates exactly one set. */}
      {[[...ROW_1, ...ROW_2]].map((cards, i) => (
        <div className="lp-tst-strip" data-row={i + 1} key={i}>
          <div className="lp-tst-track">
            {(["set", "dupe"] as const).map((copy) => (
              <div
                aria-hidden={copy === "set" ? undefined : true}
                className="lp-tst-row"
                key={copy}
              >
                {cards.map((card, j) => (
                  <TestimonialCard card={card} key={j} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* phone carousel: the 8 originals once, user-swiped (display:none ≥768) */}
      <div
        aria-label="Posts about Pancake"
        className="lp-tst-carousel"
        role="region"
        tabIndex={0}
      >
        {[...ROW_1, ...ROW_2].map((card, j) => (
          <TestimonialCard card={card} key={j} />
        ))}
      </div>
    </section>
  );
}
