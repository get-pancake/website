import { ClaudeMark } from "@/components/sections/landing-v3/LpAgentMarks";
import { LpAgentsChat } from "@/components/sections/landing-v3/LpInfraAnim";
import { LpSetupLine } from "@/components/sections/landing-v3/LpSetupLine";
import { SL_AVATAR } from "@/components/sections/landing-v3/lp-story-learns-art";

/**
 * Section — "Built for agents. / Anything the app does, your agent can do." (the infra-first
 * landing, 2026-10-21): the page's "how an agent plugs in", the part every infrastructure page
 * has (Crustdata's API and MCP with a real request, Octave's MCP + API + CLI, Landbase's
 * one-line install). Three facts, the one-line setup, and one real example: what Claude does
 * in Pancake when you ask for a Play.
 *
 * Claims, from the codebase teardown of 2026-10-21 (pancake-cmo e78c042e): browser sign-in with
 * no API key, removable in Settings (OAuth 2.1, §3.1); 95 tools served to a workspace, the app's
 * own actions from one registry (§3.1); request receipts, a request that arrives twice runs once
 * (§3.1). The example's steps are real tools (plays_create_from_ask, a run, leads_list,
 * campaign_add_lead: an add waits 10 minutes and can be undone, at most 50 per commit, and the
 * tool tells the agent to add only when the member asks, as the prompt does here).
 *
 * The exchange plays once (LpAgentsChat, lp-infra-timeline.ts): the ask is there, then each
 * Pancake action comes in, spins and checks, then Claude answers. The markup is the end picture.
 */

const FACTS = [
  {
    title: "Plugs in with a sign-in",
    body: "Your agent connects through your browser, like any app you approve. No API key to paste.",
  },
  {
    title: "95 actions",
    body: "Plays, leads, messages, sequences and the Brain: everything the app does.",
  },
  {
    title: "Safe to retry",
    body: "A request sent twice runs once and is billed once.",
  },
] as const;

const ASK = "Find founders who just raised a seed round and are hiring a marketing lead. Add the best 10 to a sequence.";

const CALLS = [
  { action: "Create a Play", result: "" },
  { action: "Run the search", result: "13 leads" },
  { action: "Read the leads", result: "" },
  { action: "Add 10 leads to the sequence", result: "Undo for 10 min" },
] as const;

const REPLY = "Done. The Play found 13 leads and the best 10 are in the sequence. The first messages go out in 10 minutes unless you undo.";

export function LpForAgents() {
  return (
    <section id="for-agents" className="lp-fa" aria-labelledby="lp-fa-title">
      <div className="lp-fa__org">
        <header className="lp-fa__head">
          <p className="lp-fa__kicker">Built for agents.</p>
          <h2 id="lp-fa-title" className="lp-fa__title lp-title-section">
            Anything the app does, your agent can do.
          </h2>
        </header>
        <div className="lp-fa__body">
          <div className="lp-fa__side">
            <ul className="lp-fa__facts">
              {FACTS.map((fact) => (
                <li key={fact.title} className="lp-fa__fact">
                  <h3 className="lp-fa__fact-title">{fact.title}</h3>
                  <p className="lp-fa__fact-body">{fact.body}</p>
                </li>
              ))}
            </ul>
            <LpSetupLine id="home-agents-setup" />
          </div>
          {/* one real example, as Claude shows it: the ask, Pancake's actions, the answer */}
          <LpAgentsChat>
            <figcaption className="lp-fa__chat-head">
              <span className="lp-fa__spark" aria-hidden="true">
                <ClaudeMark />
              </span>
              Claude
            </figcaption>
            <p className="lp-fa__ask">{ASK}</p>
            <ol className="lp-fa__calls" aria-label="Pancake actions Claude used">
              {CALLS.map((call) => (
                <li key={call.action} className="lp-fa__call">
                  <PancakeMark />
                  <span className="lp-fa__call-name">
                    Pancake<span className="lp-fa__sep">·</span>
                    {call.action}
                  </span>
                  {call.result ? <span className="lp-fa__call-result">{call.result}</span> : null}
                  {/* the action's state: a spinner while it runs (the build-up), then the check */}
                  <span className="lp-fa__st">
                    <span className="lp-fa__spin" />
                    <Check />
                  </span>
                </li>
              ))}
            </ol>
            <p className="lp-fa__reply">
              <span className="lp-fa__spark" aria-hidden="true">
                <ClaudeMark />
              </span>
              <span>{REPLY}</span>
            </p>
            <div className="lp-fa__composer" aria-hidden="true">
              <span className="lp-fa__composer-ph">Reply to Claude…</span>
              <span className="lp-fa__chip">
                <PancakeMark />
                Pancake
                <span className="lp-fa__chip-dot" />
              </span>
            </div>
          </LpAgentsChat>
        </div>
      </div>
    </section>
  );
}

/** The Pancake mark, full colour (the deep dive's avatar art, as LpClaudeScene draws it) */
function PancakeMark() {
  return (
    <svg className="lp-fa__pk" viewBox={`0 0 ${SL_AVATAR.size} ${SL_AVATAR.size}`} aria-hidden="true" focusable="false">
      {SL_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

function Check() {
  return (
    <svg className="lp-fa__check" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}
