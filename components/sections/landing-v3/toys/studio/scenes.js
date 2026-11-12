// The six sets, by the name scripts/toy-art.mjs gives their pictures. (The seventh picture, the
// Brain of the 1-2-3, is drawn flat by the page itself: LpToySteps.tsx.)
import engine from "./scene-engine.js";
import journey from "./scene-journey.js";
import merge from "./scene-merge.js";
import ping from "./scene-ping.js";
import radar from "./scene-radar.js";
import sources from "./scene-sources.js";

export const SCENES = { sources, radar, engine, journey, merge, ping };
