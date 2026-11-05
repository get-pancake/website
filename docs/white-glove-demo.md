# /white-glove "Book a demo"

Since November 5, 2026 the White Glove page books its own demos. The hero holds the demo film (left) and a short form (right): a work email, company size, country, and whether a GTM team is in place. It replaces the "Talk to sales" buttons that sent visitors to the long `/demo` request. `/demo` and its review flow are unchanged.

## Why

- The team running the White Glove LinkedIn campaign asked for it on 2026-11-05. Their spec: keep the page, swap the form for a very simple "Book a demo" (work email plus those three questions) that opens a trackable calendar, and add a video on the left. Every booked demo must create an Attio deal linked to the company (name and website), so that pipeline can be measured and matched to ad engagement. That last part was agreed on the 2026-10-27 call.
- François's rule still holds: a meeting only when there is a fit (Tristan, 2026-11-05). Only a clear fit books straight onto his calendar. Everyone else goes to his review queue or to self-serve.

## Who goes where

`lib/white-glove-demo.ts` (`wgRoute`):

| Answers | Route | What happens |
|---|---|---|
| Personal email (Gmail, Outlook…) | refused | The form asks for a work email. Same list as `/demo`. |
| Company of 1–2 | `self_serve` | "White Glove is built for teams" with Start free. No meeting, nothing stored. |
| Country outside `WG_INSTANT_MARKETS` | `review` | A row in `demo_requests`, shown at `/demo/review` (François approves, then the invitation email books it). |
| Company of 3–10 with no GTM team | `review` | Same as above. |
| Everyone else | `book` | The "Pancake Whiteglove" Calendly event (François, 45 min) opens in the card, prefilled. |

`WG_INSTANT_MARKETS` lists North America, the UK and Ireland, Western and Northern Europe, Israel, Australia, New Zealand and Singapore. Moving a market is one line, and the tests check that every entry is a real country of the list.

The card states the price up front ($3,000 a month, 3 months minimum), which is a filter in itself.

## CRM (Attio)

`lib/attio-white-glove.ts`, with the same `ATTIO_API_KEY` as `/demo`:

- **On submit (`review` and `book`):** Company is asserted by the email's domain (Attio's enrichment adds the name), Person by email (an existing person only gets an empty company filled), and a note holds the answers and the route.
- **On booking (`book` only):** the page sees Calendly's `calendly.event_scheduled` and posts the signed booking pass to `/api/white-glove/booked`. That opens one Deal named `<domain> · White Glove demo`, linked to the Company and the Person, in the "Meeting booked" stage (or `ATTIO_WHITE_GLOVE_DEAL_STAGE`; if the stage doesn't exist, the pipeline's first). A note on the deal holds the answers and the Calendly event URI. A second booking from the same domain within 30 days adds a note to that deal instead of opening a new one.
- **Not covered:**
  - Bookings made from a `/demo` review invitation, or from the "open in a new tab" fallback, happen on calendly.com, so they open no deal. A Calendly webhook (`invitee.created`, needs a Calendly admin token) would cover every booking.
  - If an Attio workflow already opens a deal on Calendly bookings, turn one of the two off.
- **Team tests:** addresses on pancake.ai / getpancake.ai get the same screens, but nothing reaches the queue or Attio. The calendar is real, so cancel any test booking.

## The booking pass

`lib/white-glove-booking-token.ts`: HMAC-SHA256 over the qualified answers, keyed on the Attio token (domain-separated), valid for 24 hours. A deal therefore needs a request that passed the server's rules, with answers no one edited in the browser. The pass does not prove that a booking happened: Calendly's message isn't signed. A replay only adds a note to the deal it already opened.

## Checks

```bash
node --test scripts/white-glove-demo.test.cjs scripts/demo-policy.test.cjs scripts/demo-review.test.cjs
npx tsc --noEmit
```

Attio and Supabase are fakes in the tests. Never submit a real address to production to test. Use a pancake.ai address, and cancel the Calendly booking it makes.
