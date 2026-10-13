/**
 * The free trial, as the app sells it with the credit plan (pancake-cmo ADR
 * 0078, `package-catalog.ts`: TRIAL_DURATION_DAYS = 7, TRIAL_CREDITS = 15,000,
 * the same for every level; PR #1220). It was 3 days until 2026-10-13.
 * Unchanged since 2026-09-18: signup can begin without a card; starting the
 * trial requires one.
 */
export const TRIAL_DAYS = 7;
export const TRIAL_CREDITS = 15_000;
export const TRIAL_LABEL = `${TRIAL_DAYS}-day free trial`;
/** "15,000 credits": the trial's allowance, formatted once. */
export const TRIAL_CREDITS_LABEL = `${TRIAL_CREDITS.toLocaleString("en-US")} credits`;
/** The trial said as what it is: a credit allowance with a deadline, never
 *  seven days of unlimited searches (pricing spec 2026-09-24, §5). */
export const TRIAL_OFFER = `${TRIAL_CREDITS.toLocaleString("en-US")} free credits, valid for ${TRIAL_DAYS} days`;
export const TRIAL_CARD_REQUIREMENT = "Credit card required to start the trial";
export const TRIAL_NOTICE = `${TRIAL_OFFER}. ${TRIAL_CARD_REQUIREMENT}.`;
