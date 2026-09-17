// Pancake score: turns a workspace's product actions into a 0-100 score, a level and the
// three moves worth the most points. The rules mirror the Notion page "Pancake score: build spec".

const APP_URL = "https://app.getpancake.ai";
const LEVEL_IMAGES = "https://images.vialoops.com/cmo1z83fz0bzu0iygrypig1ux";

// Order matters: it breaks ties between moves worth the same number of points.
export const ACTIONS = [
  {
    key: "linkedin",
    points: 15,
    move: () => "Connect LinkedIn so Pancake can reach out for you",
    url: `${APP_URL}/outbound/campaigns`,
  },
  {
    key: "leadDecisions",
    points: 15,
    pointsPerDecision: 3,
    move: (decisionsLeft) =>
      `Approve or reject ${decisionsLeft} more lead${decisionsLeft === 1 ? "" : "s"}`,
    url: `${APP_URL}/outbound/leads`,
  },
  {
    key: "outreach",
    points: 15,
    move: () => "Start outreach on your warm leads",
    url: `${APP_URL}/outbound/campaigns`,
  },
  {
    key: "article",
    points: 15,
    move: () => "Approve your first article to show up in AI search",
    url: `${APP_URL}/seo/articles`,
  },
  {
    key: "brainBuilt",
    points: 10,
    move: () => "Finish setting up your GTM Brain",
    url: `${APP_URL}/brain`,
  },
  {
    key: "brainRefined",
    points: 10,
    move: () => "Refine your GTM Brain so outreach sounds like you",
    url: `${APP_URL}/brain`,
  },
  {
    key: "slack",
    points: 10,
    move: () => "Connect Slack so warm leads land where you work",
    url: `${APP_URL}/workspace/notifications`,
  },
  {
    key: "agent",
    points: 10,
    move: () => "Connect Pancake to Claude or Codex",
    url: `${APP_URL}/workspace/mcp`,
  },
];

export const LEVELS = [
  { name: "Batter", min: 0, imageUrl: `${LEVEL_IMAGES}/cmu4w6ybrdayq0jzlamo7exkx.png` },
  { name: "Short stack", min: 25, imageUrl: `${LEVEL_IMAGES}/cmu4w6zw53ezd0j2t39zpbbpd.png` },
  { name: "Full stack", min: 50, imageUrl: `${LEVEL_IMAGES}/cmu4w71c6dedv0j1gcx6vf46z.png` },
  { name: "GTM machine", min: 80, imageUrl: `${LEVEL_IMAGES}/cmu4w72sfdeqq0j0v8uc62j0l.png` },
];

const earnedPoints = (action, state) => {
  if (action.pointsPerDecision) {
    const decisions = Math.max(0, Math.floor(Number(state[action.key]) || 0));
    return Math.min(action.points, decisions * action.pointsPerDecision);
  }
  return state[action.key] ? action.points : 0;
};

/** Total score, 0-100. `state` holds a boolean per action plus the `leadDecisions` count. */
export const scoreOf = (state) =>
  ACTIONS.reduce((total, action) => total + earnedPoints(action, state), 0);

/** The current level, the next one, and how many points separate them. */
export const levelFor = (score) => {
  const index = LEVELS.findLastIndex((level) => score >= level.min);
  const level = LEVELS[index];
  const next = LEVELS[index + 1];
  return next
    ? { level, nextLevel: next.name, pointsToNextLevel: next.min - score }
    : { level, nextLevel: "a perfect score", pointsToNextLevel: 100 - score };
};

/** Unfinished actions, worth the most points first (ties keep the ACTIONS order). */
export const movesFor = (state) =>
  ACTIONS.map((action, order) => {
    const pointsLeft = action.points - earnedPoints(action, state);
    if (pointsLeft <= 0) return null;
    const label = action.pointsPerDecision
      ? action.move(Math.ceil(pointsLeft / action.pointsPerDecision))
      : action.move();
    return { key: action.key, label, points: pointsLeft, url: action.url, order };
  })
    .filter(Boolean)
    .sort((a, b) => b.points - a.points || a.order - b.order);

export const headlineFor = ({ score, scoreWeekAgo, moves, nextLevel, pointsToNextLevel }) => {
  const climbed = score - scoreWeekAgo;
  const opening =
    climbed > 0
      ? `You climbed ${climbed} point${climbed === 1 ? "" : "s"} this week.`
      : "Here is where you stand this week.";
  if (moves[0] && moves[0].points >= pointsToNextLevel) {
    return `${opening} One move gets you to ${nextLevel}.`;
  }
  if (moves[1] && moves[0].points + moves[1].points >= pointsToNextLevel) {
    return `${opening} Two more moves to reach ${nextLevel}.`;
  }
  return opening;
};

/**
 * Everything the weekly email needs for one workspace, or the reason it gets no email.
 * `stateWeekAgo` is the same shape as `state`, computed from events older than 7 days.
 */
export const buildScore = ({ state, stateWeekAgo, trialStartedDaysAgo = null, status = null }) => {
  const score = scoreOf(state);
  const scoreWeekAgo = scoreOf(stateWeekAgo);
  const { level, nextLevel, pointsToNextLevel } = levelFor(score);
  const moves = movesFor(state);

  let skipReason = null;
  if (status === "trialing" && trialStartedDaysAgo !== null && trialStartedDaysAgo < 3) {
    skipReason = "trial_first_3_days";
  } else if (score >= 100) {
    skipReason = "perfect_score";
  } else if (moves.length < 3) {
    skipReason = "fewer_than_3_moves";
  }

  const eventProperties = {
    score,
    level: level.name,
    levelImageUrl: level.imageUrl,
    nextLevel,
    pointsToNextLevel,
    headline: headlineFor({ score, scoreWeekAgo, moves, nextLevel, pointsToNextLevel }),
  };
  moves.slice(0, 3).forEach((move, index) => {
    eventProperties[`rec${index + 1}`] = move.label;
    eventProperties[`rec${index + 1}Points`] = move.points;
    eventProperties[`rec${index + 1}Url`] = move.url;
  });

  return { score, level: level.name, skipReason, eventProperties };
};
