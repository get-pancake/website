# /white-glove "Book a demo"

Since November 5, 2026 the White Glove page books its own demos. The hero holds the demo film (left) and a short form (right): a work email, company size, country, whether a GTM team is in place and, since November 8, whether the $3,000 a month works. It replaces the "Talk to sales" buttons that sent visitors to the long `/demo` request. `/demo` and its review flow are unchanged.

The White Glove campaign's own landing page, brain.pancake.ai/white-glove (the separate `pancake-brain` app), shows the same form and posts to the same route from its origin (`lib/white-glove-cors.ts`), so both pages follow one set of rules. Its CRM notes and queue rows name that page.

## Why

- The team running the White Glove LinkedIn campaign asked for it on 2026-11-05. Their spec: keep the page, swap the form for a very simple "Book a demo" (work email plus those three questions) that opens a trackable calendar, and add a video on the left. Every booked demo must create an Attio deal linked to the company (name and website), so that pipeline can be measured and matched to ad engagement. That last part was agreed on the 2026-10-27 call.
- François's rule still holds: a meeting only when there is a fit (Tristan, 2026-11-05). Only a clear fit books straight onto his calendar. Everyone else goes to his review queue or to self-serve.
- November 8, 2026: the calendar also needs the budget, the way `/demo` qualifies White Glove (Tristan: the same bar as `/demo` before a call with François). The question is `/demo`'s, with its three answers.

## Who goes where

`lib/white-glove-demo.ts` (`wgRoute`):

| Answers | Route | What happens |
|---|---|---|
| Personal email (Gmail, Outlook…) | refused | The form asks for a work email. Same list as `/demo`. |
| Company of 1–2 | `self_serve` | "White Glove is built for teams" with Start free. No meeting, nothing stored. |
| Budget: "Not in our budget" | `self_serve` | "Start on self-serve" with Start free. No meeting, nothing stored. |
| Budget: "I need internal approval" | `review` | A row in `demo_requests`, shown at `/demo/review` (François approves, then the invitation email books it). |
| Country outside `WG_INSTANT_MARKETS` | `review` | Same as above. |
| Company of 3–10 with no GTM team | `review` | Same as above. |
| Everyone else (the budget works, and a fit) | `book` | The "Pancake Whiteglove" Calendly event (François, 45 min) opens in the card, prefilled. |

`WG_INSTANT_MARKETS` lists North America, the UK and Ireland, Western and Northern Europe, Israel, Australia, New Zealand and Singapore. Moving a market is one line, and the tests check that every entry is a real country of the list.

The card states the price up front ($3,000 a month, 3 months minimum), which is a filter in itself.

## CRM (Attio)

`lib/attio-white-glove.ts`, with the same `ATTIO_API_KEY` as `/demo`:

- **On submit (`review` and `book`):** Company is asserted by the email's domain (Attio's enrichment adds the name), Person by email (an existing person only gets an empty company filled), and a note holds the answers, the route and the page used.
- **On booking, the site writes nothing.** The CRM's own Calendly integration (outside this repo) opens the deal for every booking on the "Pancake Whiteglove" event, linked to the Company and the Person, in the Sales pipeline's "Meeting booked" stage, owned by François. That covers bookings made on either page, from a `/demo` review invitation, and on calendly.com through the "open in a new tab" fallback. Until November 9, 2026 the site also opened a deal of its own on each booking it saw (`/api/white-glove/booked`, with a signed booking pass). That duplicated the integration's deal, so the route and the pass were removed.
- **Team tests:** addresses on pancake.ai / getpancake.ai get the same screens, but nothing reaches the queue or Attio. The calendar is real, so cancel any test booking.

## Checks

```bash
node --test scripts/white-glove-demo.test.cjs scripts/demo-policy.test.cjs scripts/demo-review.test.cjs
npx tsc --noEmit
```

Attio and Supabase are fakes in the tests. Never submit a real address to production to test. Use a pancake.ai address, and cancel the Calendly booking it makes.
