// lib/verticals/demo-model.ts — SERVER ONLY. DemoSource (a VerticalConfig, or the homepage demo) →
// DemoModel (spec §4.2, §4.6).
// Flattens one vertical into display-ready strings for the VxDemo panes (server
// components) and a small PlayerModel for the client island. Never import this module
// (or the registry) from a "use client" file: only `DemoModel["player"]` crosses the
// boundary, so the client chunk never carries another vertical's names.

import { SIGNAL_LABEL, SLACK_SIGNAL_LABEL, VX_DEMO } from "@/components/sections/verticals/vx-copy";
import type { DemoLens } from "./demo-timeline";
import type { DemoPrompt, DemoSource, SignalKind } from "./types";

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

/** The lead sheet's TIMELINE (leads/lead-timeline.tsx), newest first after "Qualified as a lead". */
export interface DemoTimelineView {
  /** The engagement that surfaced the lead, or null (hiring / stack, or an authored post). */
  sighting: { kind: "comment" | "reaction"; source: string } | null;
  /** The cold-lead note (hiring / stack leads), or null. */
  cold: string | null;
}

export interface DemoProposalView {
  kind: SignalKind;
  label: string;
  text: string;
}

/** Tab 01's Play card ("New play · Draft", the app's play-draft-panel.tsx) and the created Play's page. */
export interface DemoPlayView {
  /** The Play's name (config `play`). */
  name: string;
  /** "Who": the leads' job titles, two then "+N more". */
  who: string;
  /** "How we find them": the request's first source (proposal row 0), kind chip + items. */
  how: DemoProposalView;
  /** "The steps it will run" (play-funnel.ts planSteps): title, line, icon. */
  steps: { title: string; body: string; ico: string }[];
}

export interface DemoPromptView {
  kind: SignalKind;
  kindLabel: string;
  text: string;
  reply: string;
  play: DemoPlayView;
  leads: DemoLeadView[];
  featured: { why: string; confidence: number; seniority: string };
  message: string;
  /** Lead 0's sheet timeline. */
  timeline: DemoTimelineView;
  /** The Outreach message footnote (campaigns/copy.ts sheet.writtenFrom / writtenInVoice). */
  written: string;
  lens: DemoLens;
}

/** Everything the client island needs — and nothing else. */
export interface PlayerModel {
  /** The prompt rows live in the hero (server HTML); the island only types and streams. */
  prompts: { text: string; message: string; lens: DemoLens }[];
  tabs: { num: string; label: string; title: string; body: string }[];
  /** [prompt][tab] role="img" labels. */
  aria: string[][];
  labels: {
    tablist: string;
    pause: string;
    play: string;
  };
}

export interface DemoModel {
  workspace: { name: string; sender: string; initial: string };
  prompts: DemoPromptView[];
  player: PlayerModel;
}

const C = VX_DEMO.app;

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

const COLD_KINDS: SignalKind[] = ["hiring", "stack"];

/** "Who" on the Play card: the leads' job titles in order, two then "+N more". */
function whoOf(p: DemoPrompt): string {
  const roles = p.leads.map((l) => l.role).filter((r, i, all) => all.indexOf(r) === i);
  const more = roles.length > 2 ? ` ${C.chat.play.more(roles.length - 2)}` : "";
  return roles.slice(0, 2).join(", ") + more;
}

/** The steps a Play runs (play-funnel.ts planSteps): a company source finds the people next. */
function stepsOf(kind: SignalKind): DemoPlayView["steps"] {
  const S = C.plays;
  return [
    { title: S.step.discover, body: S.discoverBy[kind], ico: "search" },
    ...(COLD_KINDS.includes(kind) ? [{ title: S.step.people, body: S.findPeople, ico: "users" }] : []),
    { title: S.step.enrich, body: S.enrich, ico: "sparkle" },
    { title: S.step.qualify, body: S.qualify, ico: "check" },
  ];
}

/** The sighting behind an engagement lead, read from its signal line ("Commented on …", "Liked …"). */
function sightingOf(kind: SignalKind, signal: string): DemoTimelineView["sighting"] {
  if (COLD_KINDS.includes(kind)) return null;
  if (/\b(comment(ed)?|repl(y|ied))\b/i.test(signal)) return { kind: "comment", source: SIGNAL_LABEL[kind] };
  if (/\b(liked?|reacted)\b/i.test(signal)) return { kind: "reaction", source: SIGNAL_LABEL[kind] };
  return null; // an authored post: the app's timeline has no entry for it
}

function fill(tpl: string, prompt: string, lead: string): string {
  return tpl.replace("{prompt}", prompt).replace("{lead}", lead);
}

export function buildDemoModel(v: DemoSource): DemoModel {
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
    const lead0 = p.leads[0];
    const proposal = p.proposal.map((r) => ({ kind: r.kind, label: SIGNAL_LABEL[r.kind], text: proposalText(r.kind, r.items) }));
    return {
      kind: p.kind,
      kindLabel: SIGNAL_LABEL[p.kind],
      text: p.text,
      reply: p.reply,
      play: { name: p.play, who: whoOf(p), how: proposal[0], steps: stepsOf(p.kind) },
      leads,
      featured: { why: p.featured.why, confidence: p.featured.confidence, seniority: p.featured.seniority },
      message: p.message,
      timeline: {
        sighting: sightingOf(lead0.kind, lead0.signal),
        cold: COLD_KINDS.includes(lead0.kind) ? C.drawer.cold(SIGNAL_LABEL[lead0.kind]) : null,
      },
      // the app's footnote: evidence > 0 → "Written from n signals", none → "Written in your Brain voice"
      written: COLD_KINDS.includes(lead0.kind) ? C.campaign.writtenInVoice : C.campaign.writtenFrom(1),
      lens: {
        typeLen: p.text.length,
        rows: 3,
        streamLen: p.message.length,
      },
    };
  });

  const A = VX_DEMO.paneAria;
  const player: PlayerModel = {
    prompts: prompts.map((p) => ({
      text: p.text,
      message: p.message,
      lens: p.lens,
    })),
    tabs: VX_DEMO.tabs.map((t) => ({ num: t.num, label: t.label, title: t.title, body: t.body })),
    aria: prompts.map((p) =>
      [A.brief, A.leads, A.outreach, A.slack].map((tpl) => fill(tpl, p.text, p.leads[0].name)),
    ),
    labels: {
      tablist: VX_DEMO.tablistAria,
      pause: VX_DEMO.controls.pause,
      play: VX_DEMO.controls.play,
    },
  };

  return {
    workspace: { name: ws.name, sender: ws.sender, initial: ws.name.trim()[0]?.toUpperCase() ?? "" },
    prompts,
    player,
  };
}
