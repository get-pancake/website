"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiInfo, FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import { AGENT_PUZZLE_INITIAL, greenTiles, moveAgentPuzzle, pairedTile } from "@/lib/agent-puzzle";
import { useAudience } from "./LpAudience";
import { LpAgentTerminalStream } from "./LpAgentTerminalStream";

export function LpAgentLab() {
  const { audience } = useAudience();
  const active = audience === "agents";
  const [paused, setPaused] = useState(false);
  const [board, setBoard] = useState(AGENT_PUZZLE_INITIAL);
  const [moves, setMoves] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const [changed, setChanged] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [message, setMessage] = useState("");
  const moveTimer = useRef<ReturnType<typeof setTimeout>>();
  const lit = greenTiles(board);

  useEffect(() => () => clearTimeout(moveTimer.current), []);

  const move = (tile: number) => {
    clearTimeout(moveTimer.current);
    const next = moveAgentPuzzle(board, tile);
    setBoard(next);
    setMoves(value => value + 1);
    setChanged(tile);
    setHint(false);
    setMessage("");
    moveTimer.current = setTimeout(() => setChanged(null), 300);
  };

  const reset = () => {
    clearTimeout(moveTimer.current);
    setBoard(AGENT_PUZZLE_INITIAL);
    setMoves(0);
    setAttempts(0);
    setChanged(null);
    setPreview(null);
    setHint(false);
    setMessage("");
  };

  return <section className="lp-agent-lab" id="agent-playground" aria-label="Agent playground" aria-hidden={!active}>
    <LpAgentTerminalStream active={active} paused={paused} />
    <div className="lp-agent-lab__stage">
      <div className="lp-agent-captcha" data-moves={moves}>
        <div className="lp-agent-captcha__header">
          {/* Not a heading (2026-10-07): the humans view ships this section hidden, and an
              H2 "Prove you're not human" opened the homepage outline for crawlers. A div,
              not a <p>: agent-lab.css styles `.lp-agent-captcha__header p` as the task line. */}
          <div className="lp-agent-captcha__title">Prove you’re not human</div>
          <p id="agent-puzzle-task">Turn every tile green.</p>
        </div>
        <div className="lp-agent-captcha__grid" role="group" aria-label="Turn every tile green" aria-describedby="agent-puzzle-task">
          {Array.from({ length: 9 }, (_, tile) => {
            const on = Boolean(board & (1 << tile));
            const highlighted = preview !== null && (tile === preview || tile === pairedTile(preview));
            const updated = changed !== null && (tile === changed || tile === pairedTile(changed));
            return <button
              key={tile} type="button" className="lp-agent-captcha__tile"
              aria-label={`Tile ${tile + 1}, ${on ? "green" : "unlit"}`} aria-pressed={on}
              data-on={on} data-preview={highlighted} data-changed={updated}
              onClick={() => move(tile)}
              onPointerEnter={event => { if (event.pointerType !== "touch") setPreview(tile); }}
              onPointerLeave={() => setPreview(null)}
              onFocus={() => setPreview(tile)} onBlur={() => setPreview(null)}
            >
              <span className="lp-agent-captcha__tile-mark" key={updated ? `${tile}-${moves}` : tile}>
                {on ? <FiCheck aria-hidden="true" /> : <span className="lp-agent-captcha__unlit" aria-hidden="true" />}
              </span>
            </button>;
          })}
        </div>
        <div className="lp-agent-captcha__footer">
          <div className="lp-agent-captcha__tools">
            <button type="button" onClick={reset} aria-label="Reset puzzle" title="Reset puzzle"><FiRotateCcw aria-hidden="true" /></button>
            <button type="button" onClick={() => { setHint(value => !value); setMessage(hint ? "" : "No solution."); }} aria-label="About this puzzle" aria-pressed={hint} title="Every move flips two tiles. Nine green is impossible."><FiInfo aria-hidden="true" /></button>
            <button className="lp-agent-captcha__pause" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "Resume terminal animation" : "Pause terminal animation"} title={paused ? "Resume terminal animation" : "Pause terminal animation"} type="button">
              {paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}
            </button>
          </div>
          <p className="lp-agent-captcha__feedback" role="status" aria-live="polite" aria-atomic="true">{message || <><span>{lit}</span><span aria-hidden="true"> / 9</span><span className="lp-sr-only"> of 9 green</span></>}</p>
          <button className="lp-agent-captcha__verify" type="button" onClick={() => { setHint(false); setAttempts(value => value + 1); setMessage(attempts === 0 ? "Human detected." : "Still human."); }}>Verify</button>
        </div>
      </div>
    </div>
  </section>;
}
