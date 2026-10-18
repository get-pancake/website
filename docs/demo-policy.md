# Sales consultation policy — PAN-2365

François approved retiring group demos on October 18, 2026.

## Visitor paths

- Keep Start free as the primary acquisition path. Sales CTAs lead to `/demo`.
- Ask company headcount and explicit interest in the paid White Glove program before contact details.
- White Glove interest takes precedence at every company size.
- Otherwise only the 51+ employee bucket reaches the enterprise calendar. Exactly 50 belongs to self-service.
- Everyone else gets Start free, the recorded homepage demo, and support.
- The API validates qualification before CRM delivery. A failure, malformed response, or honeypot response cannot open a calendar. Voice answers cannot replace the visitor's qualification choices.
- Existing signup and onboarding behavior is unchanged.

## Calendly and transition

The independent router is `https://calendly.com/d/d3zd-2yc-x2s` (form 402887).
Its required White Glove question routes Yes first, then company size 51+, then self-service.
Both group event types and the unrestricted discovery event were turned off for new bookings.

François explicitly chose to honor the eight already-booked sessions (63 reserved seats).
No attendee cancellations were sent. Calendar hold recurrences were verified to end after the
last large group on October 21 and the last regular group on November 10.

Keep historical event IDs and records. The related pancake-cmo change adds `white_glove` to the
closed analytics/configuration types without relabeling group-demo history. Runtime mapping and
deployment are separate steps, documented in its Calendly runbook.

## Validation and release gates

Run `node --test scripts/demo-policy.test.cjs`, TypeScript, changed-file lint, and the standard build.
Check the self-service, enterprise, and White Glove paths on desktop and mobile before promotion.
Do not make real bookings or send test leads to production CRM.

At preparation time, the 15 policy tests, TypeScript, changed-file lint, and prebuild checks pass.
The full local build reached prerendering but ran out of disk space. Browser verification was
interrupted by loss of the browser connection. Calendly saved the external self-service destination
and its preview selected it, but its editor still displayed an inactive-event warning on that
fallback; resolve or verify this independently before calling the routing cutover complete.
The White Glove prefill question position also needs a live check.

The repository requires preview deployment and manual production promotion by Tristan.
Preparing this branch does not mean the public website has been deployed.
