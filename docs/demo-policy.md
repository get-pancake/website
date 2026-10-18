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

The 15 policy tests, TypeScript, changed-file lint, and prebuild checks pass. Vercel built the
preview successfully; the earlier full local build ran out of disk space during prerendering.
Desktop (1440px) and phone (390px) browser checks confirmed qualification, self-service, the
enterprise calendar, and the White Glove calendar. No horizontal page overflow was observed.
The White Glove details screen correctly prefills the preparation question through `a1`, including
White Glove interest and company size. No test booking was confirmed and local CRM delivery was disabled.

The live public Calendly form was tested with 21-50/No (Pancake login), 51+/No (enterprise),
51+/Yes (White Glove precedence), and 1-2/Yes (White Glove). Its editor had displayed an
inactive-event warning on the external fallback, but actual public submission redirects successfully
to `https://app.pancake.ai/login`; the warning does not describe the observed public behavior.

The repository requires preview deployment and manual production promotion by Tristan.
Preparing this branch does not mean the public website has been deployed.
