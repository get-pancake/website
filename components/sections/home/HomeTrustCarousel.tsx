"use client";

/**
 * Home — trust carousel (founder call 2026-07-02, second rebuild of the
 * merged security + control block).
 *
 * Six 368×448 cards on a 3D drag-rotate cylinder, one trust question each,
 * ordered by buyer anxiety: approvals → reach → accounts → audit → secrets
 * → data isolation. Every card = kit `.badge` kicker + one-line title
 * (the ANSWER, not the question) + dry 3-line body + a product-flavored
 * visual reusing the control-card recipes (approve rows, audit terminal,
 * sandbox ellipses) plus two new ones (owner blobs, secrets vault).
 *
 * Copy decisions from the competitor research (Viktor first):
 *  - concrete irreversibles over abstractions ("money moves, code pushes"),
 *  - mechanisms over adjectives ("agents use them without ever seeing them"),
 *  - SOC 2 stated sober, on its own seal card — the SF norm
 *    (founder: "il faut juste dire SOC 2"),
 *  - no unexplained jargon: "pod"/"sandbox" → "sealed workspace".
 *
 * Carousel mechanics: framer-motion motionValue drives the cylinder's
 * rotateY; pointer drag maps px→deg, release springs to the nearest 60°
 * snap (fling momentum projects the target). Horizontal trackpad scroll
 * rotates it the same way (non-passive wheel listener, snap after a
 * 140ms quiet window); dots + arrow keys as non-drag paths;
 * reduced-motion swaps springs for a 200ms tween.
 * Mobile (<1024px) drops the 3D for the testimonials scroll-snap recipe —
 * both variants are in the DOM, CSS media queries pick one.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { PANCAKE_TINTS } from "@/lib/pancake-palette";
import { SUPPORT_EMAIL_URL } from "@/lib/contact";

/* ─────────────────────────────── geometry ─────────────────────────────── */

const CARD_COUNT = 7;
/** Degrees between adjacent faces on the cylinder. */
const STEP = 360 / CARD_COUNT;
/** Cylinder radius: 368/2 ÷ tan(180°/7) ≈ 382 minimum; 425 keeps air between faces. */
const RADIUS = 425;
/** Drag mapping — ≈273px of pointer travel per card. */
const DEG_PER_PX = 0.22;

/* ─────────────────────────────── icons ────────────────────────────────── */

/** Single tick for the pink approve button (from the control card). */
function CheckIcon() {
  return (
    <svg viewBox="0 0 14 11" className="home-landing-control-card__btn-icon" aria-hidden>
      <path
        d="M1 5.5 L5.2 9.5 L13 1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** X for the cream reject button (from the control card). */
function CloseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="home-landing-control-card__btn-icon" aria-hidden>
      <path
        d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Green tick disc for the isolation checklist rows. */
function TickDisc() {
  return (
    <span className="home-landing-trust-check__tick" aria-hidden>
      <svg viewBox="0 0 14 11">
        <path
          d="M1 5.5 L5.2 9.5 L13 1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

/* ─────────────────────── visual 1 — approval rows ─────────────────────── */

type ApprovalRow = {
  id: string;
  dotSrc: string;
  role: string;
  action: string;
  amount?: string;
};

const APPROVAL_ROWS: ApprovalRow[] = [
  { id: "row-1", dotSrc: "/control/dot-1.svg", role: "Ad Manager", action: "Send invoice", amount: "$4,820" },
  { id: "row-2", dotSrc: "/control/dot-2.svg", role: "Full stack Engineer", action: "Push to production" },
  { id: "row-3", dotSrc: "/control/dot-3.svg", role: "Ops", action: "Renew domain", amount: "$12" },
];

function ApproveVisual() {
  return (
    <ul className="home-landing-control-approve-list" aria-hidden>
      {APPROVAL_ROWS.map((row) => (
        <li key={row.id} className="home-landing-control-approve-row">
          <div className="home-landing-control-approve-row__main">
            <p className="home-landing-control-approve-row__role">
              <Image src={row.dotSrc} alt="" width={7} height={7} aria-hidden unoptimized />
              <span>{row.role}</span>
            </p>
            <p className="home-landing-control-approve-row__action">{row.action}</p>
          </div>
          {row.amount ? (
            <span className="home-landing-control-approve-row__amount">{row.amount}</span>
          ) : null}
          <div className="home-landing-control-approve-row__buttons">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className="home-landing-control-card__btn home-landing-control-card__btn--approve"
            >
              <CheckIcon />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className="home-landing-control-card__btn home-landing-control-card__btn--reject"
            >
              <CloseIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────── visual 2 — connected-tool toggles ────────────────── */

type ReachTool = { id: string; src: string; name: string; on: boolean };

const REACH_TOOLS: ReachTool[] = [
  { id: "notion", src: "/integrations/notion.svg", name: "Notion", on: true },
  { id: "stripe", src: "/integrations/stripe.svg", name: "Stripe", on: true },
  { id: "hubspot", src: "/integrations/hubspot.svg", name: "HubSpot", on: false },
];

function ReachVisual() {
  return (
    <ul className="home-landing-control-approve-list" aria-hidden>
      {REACH_TOOLS.map((tool) => (
        <li key={tool.id} className="home-landing-control-approve-row">
          {/* eslint-disable-next-line @next/next/no-img-element -- integration mark */}
          <img className="home-landing-trust-conn__mark" src={tool.src} alt="" />
          <div className="home-landing-control-approve-row__main">
            <p className="home-landing-control-approve-row__role">
              {tool.on ? "Connected" : "Not connected"}
            </p>
            <p className="home-landing-control-approve-row__action">{tool.name}</p>
          </div>
          <span className={`home-trust-toggle${tool.on ? " home-trust-toggle--on" : ""}`}>
            <span className="home-trust-toggle__knob" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────── visual 3 — owner blobs ───────────────────────── */

/** Organic cream chip blob — same path as the integrations cloud chips. */
const BLOB_D =
  "M172.13 77.2048C172.13 125.026 134.869 169.339 87.3369 169.339C63.9016 169.339 38.4144 165.431 22.8941 150.144C6.93551 134.426 0 105.714 0 81.4702C0 54.3473 14.515 36.3508 33.9172 20.4742C48.7239 8.35805 66.7634 0 87.3369 0C134.869 0 172.13 29.3831 172.13 77.2048Z";

type OwnerBlob = {
  id: string;
  /** Blob box: x/y top-left, d = diameter, rotate in deg. */
  x: number;
  y: number;
  d: number;
  rotate: number;
  /** Owner tag chip position. */
  tagX: number;
  tagY: number;
  tag: string;
  logo: { kind: "img"; src: string } | { kind: "linkedin" };
};

const OWNER_BLOBS: OwnerBlob[] = [
  { id: "linkedin", x: 12, y: 14, d: 84, rotate: -8, tagX: 26, tagY: 102, tag: "tristan", logo: { kind: "linkedin" } },
  { id: "gmail", x: 116, y: 76, d: 72, rotate: 6, tagX: 128, tagY: 152, tag: "maya", logo: { kind: "img", src: "/integrations/gmail.svg" } },
  { id: "slack", x: 212, y: 22, d: 78, rotate: -4, tagX: 226, tagY: 104, tag: "you", logo: { kind: "img", src: "/integrations/slack.svg" } },
];

function AccountsVisual() {
  return (
    <div className="home-trust-blobs" aria-hidden>
      <svg viewBox="0 0 304 182" className="home-trust-blobs__svg">
        {/* Dotted connectors between blob rims — the sandbox-ellipse idiom. */}
        <path className="home-trust-blobs__wire" d="M92 66 C 108 84, 116 96, 130 106" />
        <path className="home-trust-blobs__wire" d="M186 108 C 200 96, 208 82, 218 68" />
        {OWNER_BLOBS.map((b) => {
          const s = b.d / 172.13;
          const logoSize = b.d * 0.42;
          const logoOff = (b.d - logoSize) / 2;
          return (
            <g key={b.id} transform={`translate(${b.x} ${b.y}) rotate(${b.rotate} ${b.d / 2} ${b.d / 2})`}>
              <path d={BLOB_D} transform={`scale(${s})`} fill="#FFF7EC" stroke="var(--stroke)" strokeWidth={1 / s} />
              {b.logo.kind === "linkedin" ? (
                <g transform={`translate(${logoOff} ${logoOff}) scale(${logoSize / 24})`}>
                  <rect width="24" height="24" rx="4" fill="#0A66C2" />
                  <path
                    fill="#FFFFFF"
                    d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45z"
                  />
                </g>
              ) : (
                <image href={b.logo.src} x={logoOff} y={logoOff} width={logoSize} height={logoSize} />
              )}
              {/* Active dot on the blob's upper-right rim. */}
              <circle cx={b.d * 0.86} cy={b.d * 0.16} r="4" fill="var(--palette-green-20)" />
            </g>
          );
        })}
      </svg>
      {OWNER_BLOBS.map((b) => (
        <span key={b.id} className="home-trust-blobs__tag" style={{ left: b.tagX, top: b.tagY }}>
          {b.tag}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────── visual 4 — audit terminal ────────────────────── */

type LogLine = { time: string; role: string; text: string };

const AUDIT_LOG: LogLine[] = [
  { time: "04:12:08", role: "growth/copy", text: "drafted post → x.com/pancake" },
  { time: "04:12:14", role: "eng/full-stack", text: "opened PR #1284" },
  { time: "04:12:31", role: "ops/invoice", text: "queued for approval" },
  { time: "04:12:45", role: "ops/support", text: "resolved ticket-9117" },
  { time: "04:12:51", role: "ops/invoice", text: "queued for approval" },
];

function AuditVisual() {
  return (
    <pre className="home-landing-control-audit-log" aria-hidden>
      {AUDIT_LOG.map((line) => (
        <span key={`${line.time}-${line.role}`} className="home-landing-control-audit-log__line">
          <span className="home-landing-control-audit-log__time">{line.time}</span>{" "}
          <span className="home-landing-control-audit-log__role">{line.role}</span>{" "}
          <span className="home-landing-control-audit-log__text">{line.text}</span>
          {"\n"}
        </span>
      ))}
    </pre>
  );
}

/* ─────────────────────── visual 5 — secrets vault ─────────────────────── */

const VAULT_ROWS = [
  "vault://stripe/live",
  "vault://gmail/oauth",
  "vault://aws/deploy-key",
  "vault://linkedin/session",
];

function VaultVisual() {
  return (
    <div className="home-trust-vault" aria-hidden>
      {/* Peach key-pancake overlapping the panel's top-right corner. */}
      <span className="home-trust-vault__pancake">
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma SVG export */}
        <img className="home-trust-vault__pancake-side" src="/features/feature-247-side.svg" alt="" width={64} height={64} />
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma SVG export */}
        <img className="home-trust-vault__pancake-top" src="/features/feature-247-top.svg" alt="" width={61} height={59} />
        {/* eslint-disable-next-line @next/next/no-img-element -- local SVG glyph */}
        <img className="home-trust-vault__pancake-key" src="/features/feature-key.svg" alt="" width={26} height={26} />
      </span>
      <div className="home-trust-vault__panel">
        {VAULT_ROWS.map((path) => (
          <span key={path} className="home-trust-vault__row">
            <span className="home-trust-vault__dot" />
            <span className="home-trust-vault__path">{path}</span>
            <span className="home-trust-vault__mask">••••••••</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────── visual 6 — isolation checks ───────────────────── */

const ISOLATION_CHECKS = [
  "Sealed workspace per company",
  "Memory stays yours",
  "Encrypted in transit and at rest",
  "Nothing shared across customers",
];

function IsolationVisual() {
  return (
    <ul className="home-landing-trust-check-list" aria-hidden>
      {ISOLATION_CHECKS.map((label) => (
        <li key={label} className="home-landing-control-approve-row home-landing-trust-check">
          <TickDisc />
          <span className="home-landing-trust-check__label">{label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────── visual 7 — SOC 2 wax seal ────────────────────── */

/**
 * A rubber-stamp / wax-seal built from kit ingredients only: the dotted-ring
 * idiom, a full circle of curved mono micro-text (the one idiom the carousel
 * didn't use yet), and the shared two-tone pancake silhouette — smiling,
 * because the pancake IS the seal emblem. The whole seal tilts −6° for
 * stamp-hit energy; the green "notary punch" tick sits straight on the ring.
 * Ring text says TYPE II (the get-started page already claims it) so the
 * card copy can stay at plain "SOC 2" — division of labor, no double-claim.
 */
function Soc2SealVisual() {
  const p = PANCAKE_TINTS.pink;
  return (
    <div className="home-trust-seal" aria-hidden>
      <svg viewBox="0 0 304 200" className="home-trust-seal__svg">
        <g transform="rotate(-6 152 100)">
          <circle cx="152" cy="100" r="88" className="home-trust-seal__ring" />
          <path id="home-trust-seal-arc" d="M 152 30 A 70 70 0 1 1 151.99 30" fill="none" />
          <text className="home-trust-seal__ringtext">
            <textPath href="#home-trust-seal-arc" startOffset="47">
              SOC 2 TYPE II • PANCAKE • SOC 2 TYPE II • PANCAKE •&#160;
            </textPath>
          </text>
          <circle cx="152" cy="100" r="52" className="home-trust-seal__disc" />
          <g transform="translate(152 98) scale(1.714) translate(-24.5 -23)">
            <path
              d="M25.9537 42C33.3632 42 39.2879 37.7456 43.3461 33.4449C46.1317 30.4929 47.7828 26.7658 47.8255 22.5904C47.9308 12.2895 37.5877 4 24.9673 4C12.347 4 1.61512 11.2979 0.299682 22.5904C-0.498594 29.4427 3.49706 33.162 8.00699 36.2143C12.4861 39.2458 19.7274 42 25.9537 42Z"
              fill={p.side}
            />
            <path
              d="M25.8326 36C32.779 36 38.3334 32.4173 42.138 28.7957C44.7495 26.3098 46.2973 23.1712 46.3374 19.6551C46.4361 10.9807 36.7394 4 24.9078 4C13.0762 4 3.01515 10.1456 1.78193 19.6551C1.03355 25.4254 4.77947 28.5575 9.00753 31.1278C13.2067 33.6806 19.9955 36 25.8326 36Z"
              fill={p.top}
            />
            <circle cx="17.5" cy="16.5" r="2" className="home-trust-seal__face" />
            <circle cx="30.5" cy="16.5" r="2" className="home-trust-seal__face" />
            <path d="M 18.5 22.5 Q 24 27.5 29.5 22.5" className="home-trust-seal__smile" />
          </g>
        </g>
        {/* Notary punch — outside the rotated group so it sits straight;
            (214,162) is the ring's 45° point, unchanged by the rotation
            since it rotates about the ring's own center. */}
        <circle cx="214" cy="162" r="12" className="home-trust-seal__tickdisc" />
        <path d="M 209.5 162 L 212.6 165 L 218.5 159" className="home-trust-seal__tick" />
      </svg>
    </div>
  );
}

/* ─────────────────────────────── the cards ────────────────────────────── */

type TrustCardDef = {
  id: string;
  badgeVariant?: "brand" | "brand-alt-1" | "brand-alt-2" | "inverted" | "success" | "warning";
  kicker: string;
  title: string;
  /** ReactNode so a body can carry a live link (SOC 2's mailto). */
  body: React.ReactNode;
  Visual: () => JSX.Element;
  /** Matches `.home-landing-control-card[data-card]` recipe hooks. */
  dataCard?: string;
};

const TRUST_CARDS: TrustCardDef[] = [
  {
    id: "approve",
    badgeVariant: "brand",
    kicker: "Your call",
    title: "Approve before it ships",
    body: "Money moves, code pushes, outbound emails. Anything it can't undo waits for your one-tap approval in Slack.",
    Visual: ApproveVisual,
  },
  {
    id: "scope",
    badgeVariant: "brand-alt-1",
    kicker: "What it reaches",
    title: "Only the tools you connect",
    body: "It can't reach anything you haven't connected. Each agent works in a sealed workspace with the tools you allow.",
    Visual: ReachVisual,
  },
  {
    id: "accounts",
    kicker: "Your accounts",
    title: "Your accounts stay yours",
    body: "Each teammate connects their own logins. Your LinkedIn acts as you and no one else. One click disconnects any of them.",
    Visual: AccountsVisual,
  },
  {
    id: "audit",
    badgeVariant: "inverted",
    kicker: "On the record",
    title: "See and undo everything",
    body: "Every tool call and decision lands in a log no one can edit. Replay any agent's work, roll back what you don't like.",
    Visual: AuditVisual,
  },
  {
    id: "vault",
    badgeVariant: "brand-alt-2",
    kicker: "Your secrets",
    title: "Secrets stay sealed",
    body: "Keys live in an encrypted vault. Agents use them without ever seeing them, and nothing sensitive touches the chat.",
    Visual: VaultVisual,
  },
  {
    id: "data",
    badgeVariant: "success",
    kicker: "Your data",
    title: "Never trains a model",
    body: "Your company runs in its own sealed workspace, memory included. None of it is shared with other customers or with model makers.",
    Visual: IsolationVisual,
  },
  {
    /* The compliance receipt closes the deck — for an SF reader SOC 2 is a
       checkbox they scan for, not an argument. Copy stays at plain "SOC 2"
       (the ring text on the seal carries TYPE II); the report is a live
       mailto, not an NDA gate. */
    id: "soc2",
    badgeVariant: "warning",
    kicker: "Not our word",
    title: "SOC 2",
    body: (
      <>
        Audited every year by people we don&rsquo;t employ. Want the report?{" "}
        <a href={SUPPORT_EMAIL_URL} className="home-trust-seal__mail">
          Email us
        </a>
        .
      </>
    ),
    Visual: Soc2SealVisual,
  },
];

function TrustCard({ card }: { card: TrustCardDef }) {
  return (
    <article className="home-landing-control-card" data-card={card.dataCard}>
      <header className="home-landing-control-card__header">
        <span
          className="badge home-landing-control-card__kicker"
          data-variant={card.badgeVariant}
        >
          {card.kicker}
        </span>
        <h3 className="home-landing-control-card__title">{card.title}</h3>
        <p className="home-landing-control-card__body">{card.body}</p>
      </header>
      <card.Visual />
    </article>
  );
}

/* ────────────────────────────── the carousel ──────────────────────────── */

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/** Front-facing card index for a given cylinder rotation. */
function frontIndexFor(rotation: number): number {
  return ((Math.round(-rotation / STEP) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
}

function CarouselFace({
  index,
  rotation,
  front,
  card,
}: {
  index: number;
  rotation: MotionValue<number>;
  front: boolean;
  card: TrustCardDef;
}) {
  /* Exit fade only — no dim/scale/blur on visible side cards (brand rule);
     perspective alone recedes them. Fades out as the face turns away. */
  const opacity = useTransform(rotation, (r) => {
    let a = (index * STEP + r) % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    const abs = Math.abs(a);
    if (abs <= 66) return 1;
    if (abs >= 108) return 0;
    return 1 - (abs - 66) / 42;
  });

  return (
    <motion.div
      className="home-trust-carousel__face"
      data-front={front || undefined}
      aria-hidden={!front}
      style={{
        opacity,
        transform: `rotateY(${index * STEP}deg) translateZ(${RADIUS}px)`,
      }}
    >
      <TrustCard card={card} />
    </motion.div>
  );
}

export function HomeTrustCarousel() {
  const rotation = useMotionValue(0);
  const ringTransform = useTransform(
    rotation,
    (r) => `translateZ(${-RADIUS}px) rotateY(${r}deg)`
  );
  const [frontIndex, setFrontIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);

  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useMotionValueEvent(rotation, "change", (r) => {
    const next = frontIndexFor(r);
    setFrontIndex((prev) => (prev === next ? prev : next));
  });

  const settleTo = useCallback(
    (target: number) => {
      animate(
        rotation,
        target,
        reducedMotion.current
          ? { duration: 0.2, ease: "linear" }
          : { type: "spring", stiffness: 170, damping: 26 }
      );
    },
    [rotation]
  );

  /* Manual pointer drag → rotation. Velocity is sampled per-move; release
     projects the fling and springs to the nearest 60° snap. */
  const drag = useRef({ active: false, startX: 0, startRot: 0, lastX: 0, lastT: 0, vel: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      rotation.stop();
      drag.current = {
        active: true,
        startX: e.clientX,
        startRot: rotation.get(),
        lastX: e.clientX,
        lastT: e.timeStamp,
        vel: 0,
      };
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [rotation]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d.active) return;
      rotation.set(d.startRot + (e.clientX - d.startX) * DEG_PER_PX);
      const dt = e.timeStamp - d.lastT;
      if (dt > 0) {
        /* deg/s, lightly smoothed. */
        const v = ((e.clientX - d.lastX) * DEG_PER_PX * 1000) / dt;
        d.vel = d.vel * 0.6 + v * 0.4;
      }
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
    },
    [rotation]
  );

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    /* Project the momentum ~0.35s out, capped at two faces per fling so a
       hard flick can't send the cylinder spinning through full turns, then
       snap to the nearest face. */
    const here = rotation.get();
    const fling = reducedMotion.current ? 0 : d.vel * 0.35;
    const projected = here + Math.max(-2 * STEP, Math.min(2 * STEP, fling));
    settleTo(Math.round(projected / STEP) * STEP);
  }, [rotation, settleTo]);

  const stepBy = useCallback(
    (dir: 1 | -1) => {
      const snapped = Math.round(rotation.get() / STEP) * STEP;
      settleTo(snapped - dir * STEP);
    },
    [rotation, settleTo]
  );

  const goToIndex = useCallback(
    (i: number) => {
      /* Shortest path on the ring to the target face. */
      const n = -rotation.get() / STEP;
      const k = Math.round(n);
      let delta = (((i - k) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
      if (delta > CARD_COUNT / 2) delta -= CARD_COUNT;
      settleTo(-(k + delta) * STEP);
    },
    [rotation, settleTo]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepBy(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBy(-1);
      }
    },
    [stepBy]
  );

  /* Horizontal scroll (trackpad wheel) rotates the cylinder like a drag;
     a short quiet window then snaps to the nearest face. Native listener
     because wheel must be non-passive for preventDefault to block the
     browser's history swipe. Vertical scroll passes through untouched. */
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelTimer = useRef<number | null>(null);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      rotation.stop();
      rotation.set(rotation.get() - e.deltaX * DEG_PER_PX);
      if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => {
        wheelTimer.current = null;
        settleTo(Math.round(rotation.get() / STEP) * STEP);
      }, 140);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimer.current !== null) window.clearTimeout(wheelTimer.current);
    };
  }, [rotation, settleTo]);

  /* Mobile scroll-snap track — active dot follows scroll position. */
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const onMobileScroll = useCallback(() => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    const next = Math.round((el.scrollLeft / max) * (CARD_COUNT - 1));
    setMobileIndex((prev) => (prev === next ? prev : next));
  }, []);

  const scrollMobileTo = useCallback((i: number) => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (max * i) / (CARD_COUNT - 1), behavior: "smooth" });
  }, []);

  return (
    <div className="home-landing-trust home-trust-carousel">
      {/* Desktop — the 3D cylinder. */}
      <div
        ref={stageRef}
        className="home-trust-carousel__stage"
        role="group"
        aria-roledescription="carousel"
        aria-label="How Pancake keeps you in control"
        tabIndex={0}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <motion.div className="home-trust-carousel__ring" style={{ transform: ringTransform }}>
          {TRUST_CARDS.map((card, i) => (
            <CarouselFace key={card.id} index={i} rotation={rotation} front={i === frontIndex} card={card} />
          ))}
        </motion.div>
      </div>

      {/* Desktop nav — dots only (arrows dropped, founder call 2026-07-03:
          drag + horizontal scroll + dots + arrow keys cover every path). */}
      <div className="home-trust-carousel__nav">
        <div className="home-trust-carousel__dots">
          {TRUST_CARDS.map((card, i) => (
            <button
              key={card.id}
              type="button"
              className={`home-trust-carousel__dot${i === frontIndex ? " home-trust-carousel__dot--active" : ""}`}
              aria-label={card.title}
              aria-current={i === frontIndex}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Mobile — testimonials scroll-snap recipe, same six cards. */}
      <div
        ref={mobileTrackRef}
        className="home-trust-carousel__mobile"
        onScroll={onMobileScroll}
      >
        {TRUST_CARDS.map((card) => (
          <div key={card.id} className="home-trust-carousel__mobile-slide">
            <TrustCard card={card} />
          </div>
        ))}
      </div>
      <div className="home-trust-carousel__dots home-trust-carousel__dots--mobile">
        {TRUST_CARDS.map((card, i) => (
          <button
            key={card.id}
            type="button"
            className={`home-trust-carousel__dot${i === mobileIndex ? " home-trust-carousel__dot--active" : ""}`}
            aria-label={card.title}
            onClick={() => scrollMobileTo(i)}
          />
        ))}
      </div>

      <p aria-live="polite" style={VISUALLY_HIDDEN}>
        {TRUST_CARDS[frontIndex].title}
      </p>
    </div>
  );
}
