// lib/verticals/demo-model.ts — SERVER ONLY. VerticalConfig → DemoModel (spec §4.2, §4.6).
// Flattens one vertical into display-ready strings for the VxDemo panes (server
// components) and a small PlayerModel for the client island. Never import this module
// (or the registry) from a "use client" file: only `DemoModel["player"]` crosses the
// boundary, so the client chunk never carries another vertical's names.

import {
  SIGNAL_EMPTY,
  SIGNAL_GROUPS,
  SIGNAL_LABEL,
  SLACK_SIGNAL_LABEL,
  VX_DEMO,
  VX_NOTE,
} from "@/components/sections/verticals/vx-copy";
import type { DemoLens } from "./demo-timeline";
import type { DemoPrompt, SignalKind, VerticalConfig } from "./types";

export interface DemoLeadView {
  name: string;
  first: string;
  initials: string;
  role: string;
  company: string;
  kind: SignalKind;
  kindLabel: string;
  slackKind: string;
  signal: string;
}

/** A Signals-page card under one prompt. */
export interface DemoSigView {
  kind: SignalKind;
  label: string;
  /** on = static on (own brand); proposed = switches on at approval; empty = "Set up". */
  state: "on" | "proposed" | "empty";
  /** Index among this prompt's proposed kinds, in app order (the `b.sig{i}` swap id). */
  order: number;
  chips: string[];
  more: number;
  empty: string;
}

export interface DemoProposalView {
  kind: SignalKind;
  label: string;
  text: string;
}

export interface DemoPromptView {
  kind: SignalKind;
  kindLabel: string;
  text: string;
  reply: string;
  proposal: DemoProposalView[];
  /** kind → card state, for every kind in app order. */
  sigs: Record<SignalKind, DemoSigView>;
  leads: DemoLeadView[];
  featured: { why: string; confidence: number; seniority: string };
  message: string;
  lens: DemoLens;
}

/** Everything the client island needs — and nothing else. */
export interface PlayerModel {
  prompts: { kind: SignalKind; badge: string; text: string; message: string; lens: DemoLens }[];
  tabs: { num: string; label: string; title: string; body: string }[];
  /** [prompt][tab] role="img" labels. */
  aria: string[][];
  labels: {
    prompts: string;
    promptsAria: string;
    tablist: string;
    note: string;
    pause: string;
    play: string;
    replay: string;
  };
}

export interface DemoModel {
  workspace: { name: string; sender: string; initial: string };
  prompts: DemoPromptView[];
  player: PlayerModel;
}

const APP_ORDER: SignalKind[] = SIGNAL_GROUPS.flatMap((g) => g.kinds);

/** "Dana Whitfield" → "DW"; "Tomás Reyes" → "TR". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

const quote = (s: string) => `“${s}”`;

/** How an item reads inside the app for its kind (keywords are quoted phrases). */
function itemText(kind: SignalKind, item: string): string {
  return kind === "keyword" ? quote(item) : item;
}

function proposalText(kind: SignalKind, items: string[]): string {
  const joined = items.map((i) => itemText(kind, i)).join(" · ");
  return kind === "stack" ? `${joined}${VX_DEMO.app.chat.stackSuffix}` : joined;
}

/** Signals-page cards show at most 2 chips, then "+N more" (fits the mock's card width). */
const CHIP_LIMIT = 2;

function sigsFor(p: DemoPrompt, ws: { name: string; sender: string }): Record<SignalKind, DemoSigView> {
  const proposedKinds = APP_ORDER.filter((k) => p.proposal.some((r) => r.kind === k));
  const out = {} as Record<SignalKind, DemoSigView>;
  for (const kind of APP_ORDER) {
    const row = p.proposal.find((r) => r.kind === kind);
    const base = { kind, label: SIGNAL_LABEL[kind], empty: SIGNAL_EMPTY[kind] };
    if (row) {
      const items = row.items.map((i) => itemText(kind, i));
      out[kind] = {
        ...base,
        state: "proposed",
        order: proposedKinds.indexOf(kind),
        chips: items.slice(0, CHIP_LIMIT),
        more: Math.max(0, items.length - CHIP_LIMIT),
      };
    } else if (kind === "own_brand") {
      out[kind] = { ...base, state: "on", order: -1, chips: [`${ws.name} page`, ws.sender], more: 0 };
    } else {
      out[kind] = { ...base, state: "empty", order: -1, chips: [], more: 0 };
    }
  }
  return out;
}

function fill(tpl: string, prompt: string, lead: string): string {
  return tpl.replace("{prompt}", prompt).replace("{lead}", lead);
}

export function buildDemoModel(v: VerticalConfig): DemoModel {
  const ws = v.workspace;
  const prompts: DemoPromptView[] = v.demo.prompts.map((p) => {
    const leads: DemoLeadView[] = p.leads.map((l) => ({
      name: l.name,
      first: l.name.split(" ")[0],
      initials: initialsOf(l.name),
      role: l.role,
      company: l.company,
      kind: l.kind,
      kindLabel: SIGNAL_LABEL[l.kind],
      slackKind: SLACK_SIGNAL_LABEL[l.kind],
      signal: l.signal,
    }));
    const sigs = sigsFor(p, ws);
    return {
      kind: p.kind,
      kindLabel: SIGNAL_LABEL[p.kind],
      text: p.text,
      reply: p.reply,
      proposal: p.proposal.map((r) => ({ kind: r.kind, label: SIGNAL_LABEL[r.kind], text: proposalText(r.kind, r.items) })),
      sigs,
      leads,
      featured: { why: p.featured.why, confidence: p.featured.confidence, seniority: p.featured.seniority },
      message: p.message,
      lens: {
        typeLen: p.text.length,
        rows: p.proposal.length,
        sigs: APP_ORDER.filter((k) => sigs[k].state === "proposed").length,
        streamLen: p.message.length,
      },
    };
  });

  const A = VX_DEMO.paneAria;
  const player: PlayerModel = {
    prompts: prompts.map((p) => ({
      kind: p.kind,
      badge: p.kindLabel,
      text: p.text,
      message: p.message,
      lens: p.lens,
    })),
    tabs: VX_DEMO.tabs.map((t) => ({ num: t.num, label: t.label, title: t.title, body: t.body })),
    aria: prompts.map((p) =>
      [A.brief, A.leads, A.outreach, A.slack].map((tpl) => fill(tpl, p.text, p.leads[0].name)),
    ),
    labels: {
      prompts: VX_DEMO.promptsLabel,
      promptsAria: VX_DEMO.promptsAria,
      tablist: VX_DEMO.tablistAria,
      note: VX_NOTE,
      pause: VX_DEMO.controls.pause,
      play: VX_DEMO.controls.play,
      replay: VX_DEMO.controls.replay,
    },
  };

  return {
    workspace: { name: ws.name, sender: ws.sender, initial: ws.name.trim()[0]?.toUpperCase() ?? "" },
    prompts,
    player,
  };
}
