import assert from "node:assert/strict";
import test from "node:test";

import { buildScore, headlineFor, levelFor, movesFor, scoreOf } from "./pancake-score/score.mjs";
import { scoreQuery, statesFromRow } from "./pancake-score/run.mjs";

const nothing = {
  linkedin: false,
  leadDecisions: 0,
  outreach: false,
  article: false,
  brainBuilt: false,
  brainRefined: false,
  slack: false,
  agent: false,
};
const everything = { ...nothing, linkedin: true, leadDecisions: 5, outreach: true, article: true, brainBuilt: true, brainRefined: true, slack: true, agent: true };

test("scores add up to 100 and lead decisions cap at 15 points", () => {
  assert.equal(scoreOf(nothing), 0);
  assert.equal(scoreOf(everything), 100);
  assert.equal(scoreOf({ ...everything, leadDecisions: 40 }), 100);
  assert.equal(scoreOf({ ...nothing, leadDecisions: 2 }), 6);
  assert.equal(scoreOf({ ...nothing, brainBuilt: true, linkedin: true }), 25);
});

test("levels switch at 25, 50 and 80", () => {
  assert.deepEqual(
    [0, 24, 25, 49, 50, 79, 80, 100].map((score) => levelFor(score).level.name),
    ["Batter", "Batter", "Short stack", "Short stack", "Full stack", "Full stack", "GTM machine", "GTM machine"],
  );
  assert.equal(levelFor(62).nextLevel, "GTM machine");
  assert.equal(levelFor(62).pointsToNextLevel, 18);
  assert.equal(levelFor(85).nextLevel, "a perfect score");
  assert.equal(levelFor(85).pointsToNextLevel, 15);
});

test("moves are ordered by points left, then by the spec's table order", () => {
  const moves = movesFor({ ...nothing, brainBuilt: true, leadDecisions: 2 });
  assert.deepEqual(
    moves.map((move) => [move.key, move.points]),
    [
      ["linkedin", 15],
      ["outreach", 15],
      ["article", 15],
      ["leadDecisions", 9],
      ["brainRefined", 10],
      ["slack", 10],
      ["agent", 10],
    ].sort((a, b) => b[1] - a[1]),
  );
  assert.equal(moves.find((move) => move.key === "leadDecisions").label, "Approve or reject 3 more leads");
});

test("headline celebrates progress and points at the next level when it is close", () => {
  const moves = [{ points: 15 }, { points: 10 }];
  assert.equal(
    headlineFor({ score: 65, scoreWeekAgo: 50, moves, nextLevel: "GTM machine", pointsToNextLevel: 15 }),
    "You climbed 15 points this week. One move gets you to GTM machine.",
  );
  assert.equal(
    headlineFor({ score: 55, scoreWeekAgo: 55, moves, nextLevel: "GTM machine", pointsToNextLevel: 25 }),
    "Here is where you stand this week. Two more moves to reach GTM machine.",
  );
  assert.equal(
    headlineFor({ score: 10, scoreWeekAgo: 10, moves, nextLevel: "Short stack", pointsToNextLevel: 40 }),
    "Here is where you stand this week.",
  );
});

test("buildScore fills the three moves and skips the right people", () => {
  const built = buildScore({ state: { ...nothing, brainBuilt: true }, stateWeekAgo: nothing });
  assert.equal(built.skipReason, null);
  assert.equal(built.eventProperties.score, 10);
  assert.equal(built.eventProperties.rec1, "Connect LinkedIn so Pancake can reach out for you");
  assert.equal(built.eventProperties.rec3Points, 15);
  assert.match(built.eventProperties.rec3Url, /^https:\/\/app\.getpancake\.ai\//);

  assert.equal(buildScore({ state: everything, stateWeekAgo: everything }).skipReason, "perfect_score");
  assert.equal(
    buildScore({ state: { ...everything, slack: false }, stateWeekAgo: nothing }).skipReason,
    "fewer_than_3_moves",
  );
  assert.equal(
    buildScore({ state: nothing, stateWeekAgo: nothing, status: "trialing", trialStartedDaysAgo: 1 }).skipReason,
    "trial_first_3_days",
  );
});

test("statesFromRow counts an action this week but not a week ago", () => {
  const now = new Date("2026-09-21T16:00:00Z");
  const { state, stateWeekAgo } = statesFromRow(
    {
      linkedin_at: "2026-09-19T10:00:00Z",
      brain_built_at: "2026-09-01T10:00:00Z",
      lead_decisions: "4",
      lead_decisions_week_ago: 1,
      outreach_at: null,
    },
    now,
  );
  assert.equal(state.linkedin, true);
  assert.equal(stateWeekAgo.linkedin, false);
  assert.equal(stateWeekAgo.brainBuilt, true);
  assert.equal(state.leadDecisions, 4);
  assert.equal(stateWeekAgo.leadDecisions, 1);
  assert.equal(state.outreach, false);
});

test("the query pages safely", () => {
  assert.doesNotMatch(scoreQuery(), /WHERE \(m\.workspace_id/);
  assert.match(scoreQuery({ workspace_id: "w'1", email: "a@b.co" }), /\('w''1', 'a@b\.co'\)/);
});
