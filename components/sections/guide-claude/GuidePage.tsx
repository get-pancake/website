import { Fragment, type ReactNode } from "react";

import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import { GuideClientTabs, type GuideTab } from "@/components/sections/guide-claude/GuideClientTabs";
import { GuideCopyButton } from "@/components/sections/guide-claude/GuideCopyButton";
import { GuideStartFree } from "@/components/sections/guide-claude/GuideStartFree";
import {
  COPIED,
  CONTROL,
  COUPON,
  FAQ,
  FINAL,
  GUIDE_MD_PATH,
  GUIDE_META,
  GUIDE_PATH,
  HERO,
  LOGO_SRC,
  PROMO_BAR,
  PROMO_CODE,
  SETUP,
  STEP_ACCOUNT,
  STEP_ASK,
  STEP_CONNECT,
  STEP_SKILLS,
  WHAT,
  WHY,
} from "@/components/sections/guide-claude/guide-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * /guides/claude — "Use Pancake in Claude", the destination of the ManyChat DMs (most
 * visitors: a phone, inside Instagram's in-app browser). Built on the /for page kit
 * (.lp-vx: text edge, section rhythm, VxHead, the FAQ accordion) plus the homepage's nav,
 * CTA card and footer; the guide's own pieces (promo bar, coupon, copy blocks, client tabs,
 * the .md card) live in app/_styles/guide-claude.css.
 *
 * Order (brief §3): promo bar → nav → hero (coupon, Start free · Copy setup for your AI) →
 * What Pancake does → Why Claude → Set it up (#setup: the .md card, steps 01–04) →
 * You stay in charge → Questions → final CTA → footer.
 *
 * Client islands: the copy buttons, the step 02 tabs, the two Start free links (utm_*
 * pass-through) — plus the nav/CTA islands every landing page ships.
 *
 * Structured data (audit 7.7, 2026-10-07): WebPage + BreadcrumbList (Home → this guide) +
 * FAQPage, the FAQ's Q/As verbatim (the cost answer stays visible-only, see FAQ in guide-copy).
 */
export function GuidePage({ markdown }: { markdown: string }) {
  const preview = markdown.split("\n").slice(0, 9).join("\n");
  return (
    <main className="lp lp-vx lp-guide">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd()) }} />
      <LpFitVars />
      <PromoBar />
      <LpNav />
      <Hero markdown={markdown} />
      <WhatSection />
      <WhySection />
      <SetupSection markdown={markdown} preview={preview} />
      <ControlSection />
      <FaqSection />
      <LpCta
        title={FINAL.title}
        body={FINAL.body}
        buttons={<GuideStartFree ctaId="app_guide_claude_final">{FINAL.cta}</GuideStartFree>}
        note={FINAL.note}
      />
      <LpFooter />
    </main>
  );
}

function guideJsonLd() {
  const url = `${SITE_ORIGIN}${GUIDE_PATH}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: GUIDE_META.ogTitle,
        description: GUIDE_META.description,
        inLanguage: "en-US",
        isPartOf: { "@type": "WebSite", name: "Pancake", url: SITE_ORIGIN },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: GUIDE_META.crumbHome, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: GUIDE_META.crumbPage, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: FAQ.items
          .filter((f) => !("inJsonLd" in f && f.inJsonLd === false))
          .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}

function PromoBar() {
  return (
    <aside className="gd-promo" aria-label="Offer">
      <p className="gd-promo__text">
        <span className="gd-promo__long">{PROMO_BAR.long}</span>
        <span className="gd-promo__short" aria-hidden="true">
          {PROMO_BAR.short}
        </span>
      </p>
      <GuideCopyButton
        text={PROMO_CODE}
        blockId="promo-code"
        label={PROMO_BAR.copy}
        ariaLabel={`Copy code ${PROMO_CODE}`}
        className="gd-copy--on-dark"
      />
    </aside>
  );
}

function Hero({ markdown }: { markdown: string }) {
  return (
    <section id="main-content" tabIndex={-1} className="vx-hero gd-hero" aria-labelledby="gd-hero-title">
      <div className="vx-col">
        <h1 id="gd-hero-title" className="vx-hero__title gd-hero__title">
          {HERO.title}
        </h1>
        <p className="vx-hero__lede">{vxNoWidow(HERO.lede)}</p>
        <p className="vx-hero__lede gd-hero__setup">{HERO.setup}</p>
        <Coupon />
        <div className="lp-hero-btns vx-hero__btns gd-hero__btns">
          <GuideStartFree ctaId="app_guide_claude_hero">{HERO.primary}</GuideStartFree>
          <GuideCopyButton
            text={markdown}
            blockId="hero-setup-md"
            label={HERO.copySetup}
            copiedLabel={COPIED.mdLabel}
            copiedMs={COPIED.mdMs}
            className="gd-copy--pill"
          />
        </div>
      </div>
    </section>
  );
}

function Coupon() {
  return (
    <div className="gd-coupon">
      <div className="gd-coupon__deal">
        <p className="gd-coupon__big lp-display">{COUPON.big}</p>
        <p className="gd-coupon__sub">{COUPON.sub}</p>
      </div>
      <div className="gd-coupon__use">
        <p className="gd-coupon__line">{COUPON.line}</p>
        <div className="gd-coupon__code">
          <code id="gd-coupon-code">{PROMO_CODE}</code>
          <GuideCopyButton
            text={PROMO_CODE}
            blockId="hero-code"
            label={COUPON.copy}
            ariaLabel={`Copy code ${PROMO_CODE}`}
            selectTargetId="gd-coupon-code"
          />
        </div>
        <p className="gd-coupon__fine">{COUPON.fine}</p>
      </div>
    </div>
  );
}

function WhatSection() {
  return (
    <section className="vx-sec gd-what" aria-labelledby="gd-what-title">
      <div className="vx-col">
        <VxHead id="gd-what-title" eyebrow={WHAT.eyebrow} title={WHAT.h2} />
        <div className="gd-what__grid">
          <div className="gd-prose">
            {WHAT.paragraphs.map((p) => (
              <p key={p}>{vxNoWidow(p)}</p>
            ))}
          </div>
          <div className="gd-card gd-ways">
            <h3 className="gd-card__title lp-display">{WHAT.cardTitle}</h3>
            <ol className="gd-ways__list">
              {WHAT.ways.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="vx-sec gd-why" aria-labelledby="gd-why-title">
      <div className="vx-col">
        <VxHead id="gd-why-title" eyebrow={WHY.eyebrow} title={WHY.h2} />
        <div className="gd-prose gd-prose--lead">
          {WHY.paragraphs.map((p) => (
            <p key={p}>{vxNoWidow(p)}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function SetupSection({ markdown, preview }: { markdown: string; preview: string }) {
  return (
    <section id="setup" className="vx-sec gd-setup" aria-labelledby="gd-setup-title">
      <div className="vx-col">
        <VxHead id="gd-setup-title" eyebrow={SETUP.eyebrow} title={SETUP.h2} />
        <div className="gd-card gd-md">
          <div className="gd-md__text">
            <h3 className="gd-card__title lp-display">{SETUP.aiCard.title}</h3>
            <p className="gd-md__body">{vxNoWidow(SETUP.aiCard.body)}</p>
            <div className="gd-md__btns">
              <GuideCopyButton
                text={markdown}
                blockId="setup-md"
                label={SETUP.aiCard.copy}
                copiedLabel={COPIED.mdLabel}
                copiedMs={COPIED.mdMs}
                className="gd-copy--pill gd-copy--dark"
              />
              <a className="gd-link" href={GUIDE_MD_PATH}>
                {SETUP.aiCard.view}
              </a>
            </div>
          </div>
          <pre className="gd-md__preview" aria-label="First lines of claude.md">
            <code>{preview}</code>
          </pre>
        </div>
        <p className="gd-byhand">{SETUP.byHand}</p>
        <ol className="gd-steps">
          <StepAccount />
          <StepConnect />
          <StepSkills />
          <StepAsk />
        </ol>
      </div>
    </section>
  );
}

function Step({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <li className="gd-step">
      <h3 className="gd-step__title">
        <span className="gd-step__num">{num}</span>
        <span aria-hidden="true"> · </span>
        <span className="vx-sr">. </span>
        {title}
      </h3>
      <div className="gd-step__body">{children}</div>
    </li>
  );
}

function StepAccount() {
  return (
    <Step num={STEP_ACCOUNT.num} title={STEP_ACCOUNT.title}>
      <ol className="gd-list">
        {STEP_ACCOUNT.items.map((item) => (
          <li key={item.before}>
            {item.before}
            {"strong" in item ? <strong>{item.strong}</strong> : null}
            {"after" in item ? item.after : null}
          </li>
        ))}
      </ol>
      <p>{STEP_ACCOUNT.note}</p>
    </Step>
  );
}

function StepConnect() {
  const c = STEP_CONNECT;
  const logos: Record<"claude" | "openai" | "mcp", ReactNode> = {
    claude: <img className="gd-tab__logo" src={LOGO_SRC.claude} alt="" width={18} height={18} />,
    openai: <img className="gd-tab__logo" src={LOGO_SRC.openai} alt="" width={18} height={18} />,
    mcp: <McpGlyph />,
  };
  const panels: Record<GuideTab["id"], ReactNode> = {
    claude: (
      <>
        <p className="gd-caption">{c.claude.caption}</p>
        <ol className="gd-list">
          <li>
            {c.claude.steps.openSettings.before}
            <strong>{c.claude.steps.openSettings.strong}</strong>
            {c.claude.steps.openSettings.mid}
            <strong>{c.claude.steps.openSettings.strong2}</strong>
            {c.claude.steps.openSettings.after}
          </li>
          <li>
            {c.claude.steps.name.before}
            <code>{c.claude.steps.name.code}</code>
            {c.claude.steps.name.after}
            <CopyBlock id="claude-url" text={c.claude.url} />
          </li>
          <li>
            {c.claude.steps.add.before}
            <strong>{c.claude.steps.add.strong}</strong>
            {c.claude.steps.add.after}
          </li>
          <li>
            {c.claude.steps.check}
            <CopyBlock id="claude-check" text={c.claude.checkPrompt} />
          </li>
        </ol>
        <p>{c.claude.after}</p>
      </>
    ),
    "claude-code": (
      <>
        <p>{c.claudeCode.intro}</p>
        <CopyBlock id="claude-code-line" text={c.claudeCode.line} />
        <p>{c.claudeCode.manualIntro}</p>
        <CopyBlock id="claude-code-manual" text={c.claudeCode.manual} code />
        <p>
          {c.claudeCode.after.before}
          <code>{c.claudeCode.after.code}</code>
          {c.claudeCode.after.after}
        </p>
      </>
    ),
    codex: (
      <>
        <p>{c.codex.intro}</p>
        <CopyBlock id="codex-line" text={c.codex.line} />
        <p>{c.codex.manualIntro}</p>
        <CopyBlock id="codex-manual" text={c.codex.manual} code />
      </>
    ),
    other: (
      <>
        <p>{c.other.intro}</p>
        <CopyBlock id="other-line" text={c.other.line} />
      </>
    ),
  };
  const tabs: GuideTab[] = c.tabs.map((t) => ({ id: t.id, label: t.label, logo: logos[t.logo], panel: panels[t.id] }));
  return (
    <Step num={c.num} title={c.title}>
      <GuideClientTabs tabs={tabs} label={c.tabsLabel} />
      <p className="gd-signin">{c.signIn}</p>
    </Step>
  );
}

function StepSkills() {
  const s = STEP_SKILLS;
  return (
    <Step num={s.num} title={s.title}>
      <p>{s.intro}</p>
      <CopyBlock id="skills-line" text={s.line} />
      <p>{s.tableIntro}</p>
      <div className="gd-table-wrap">
        <table className="gd-table">
          <thead>
            <tr>
              <th scope="col">{s.head[0]}</th>
              <th scope="col">{s.head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map(([skill, what]) => (
              <tr key={skill}>
                <td>
                  <code>{skill}</code>
                </td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{s.after}</p>
    </Step>
  );
}

function StepAsk() {
  return (
    <Step num={STEP_ASK.num} title={STEP_ASK.title}>
      <p>{STEP_ASK.intro}</p>
      {STEP_ASK.groups.map((g) => (
        <Fragment key={g.title}>
          <div className="gd-prompts">
            <p className="gd-prompts__title">{g.title}</p>
            {g.prompts.map((p) => (
              <Fragment key={p.id}>
                {"lead" in p && p.lead ? <p className="gd-prompts__lead">{p.lead}</p> : null}
                <CopyBlock id={p.id} text={p.text} />
                {"note" in p && p.note ? <p className="gd-prompts__note">{p.note}</p> : null}
              </Fragment>
            ))}
          </div>
          {/* the group's closing link (2026-10-07: "More ideas: example Plays →" under the
              first-Play prompts): a body paragraph, so the step's own 16px rhythm spaces it and
              the next group keeps its 28px; the link look is .lp-textlink (pricing.css) */}
          {"more" in g && g.more ? (
            <p>
              <a className="lp-textlink" href={g.more.href}>
                {g.more.label}
                <span aria-hidden="true"> →</span>
              </a>
            </p>
          ) : null}
        </Fragment>
      ))}
      <p>{STEP_ASK.outro}</p>
    </Step>
  );
}

function ControlSection() {
  return (
    <section className="vx-sec gd-control" aria-labelledby="gd-control-title">
      <div className="vx-col">
        <VxHead id="gd-control-title" eyebrow={CONTROL.eyebrow} title={CONTROL.h2} />
        <ul className="gd-control__grid">
          {CONTROL.cards.map((c) => (
            <li key={c.title} className="gd-card gd-control__card">
              <h3 className="gd-card__title lp-display">{c.title}</h3>
              <p>{vxNoWidow(c.body)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="vx-sec vx-faq-sec" aria-labelledby="gd-faq-title">
      <div className="vx-col">
        <VxHead id="gd-faq-title" eyebrow={FAQ.eyebrow} title={FAQ.h2} />
        <div className="vx-faq">
          {FAQ.items.map((f) => (
            <details key={f.q} className="vx-qa">
              <summary>
                <span className="vx-qa__q">{vxNoWidow(f.q, 16)}</span>
                <svg className="vx-qa__icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M10 3.5v13M3.5 10h13" />
                </svg>
              </summary>
              <p className="vx-qa__a">{vxNoWidow(f.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One prompt or command with its Copy button. `[bracketed]` parts are highlighted so the
 * reader sees what to replace; the button copies the exact text, brackets included.
 */
function CopyBlock({ id, text, code = false }: { id: string; text: string; code?: boolean }) {
  const textId = `gd-block-${id}`;
  return (
    <div className="gd-block" data-kind={code ? "code" : "prompt"}>
      <pre className="gd-block__text" id={textId}>
        <code>{withPlaceholders(text)}</code>
      </pre>
      <GuideCopyButton text={text} blockId={id} label="Copy" ariaLabel="Copy" selectTargetId={textId} />
    </div>
  );
}

function withPlaceholders(text: string): ReactNode {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="gd-ph">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Model Context Protocol mark, simplified to two strokes on the 24 grid. */
function McpGlyph() {
  return (
    <svg className="gd-tab__logo" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path
        d="M4 11.5 11.6 3.9a2.8 2.8 0 0 1 4 4L9.9 13.6m6.6-5.6a2.8 2.8 0 0 1 4 4l-6.9 6.9a.9.9 0 0 0 0 1.3l1.5 1.5M13.8 5.8 7.2 12.4a2.8 2.8 0 0 0 4 4l6.6-6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
