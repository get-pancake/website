import { LpCta } from "@/components/sections/landing-v3/LpCta";
import { LpFitVars } from "@/components/sections/landing-v3/LpFitVars";
import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import {
  CONNECT_CLIENTS,
  CONNECT_FINAL,
  CONNECT_HERO_PRIMARY,
  CONNECT_HERO_SETUP,
  CONNECT_META_SHARED,
  CONNECT_OTHERS,
  CONNECT_SETUP,
  connectAskGroups,
  connectControlCards,
  connectFinalBody,
  connectOtherRows,
  type ConnectClient,
  type ConnectClientId,
} from "@/components/sections/guide-claude/connect-copy";
import { GuideCopyButton } from "@/components/sections/guide-claude/GuideCopyButton";
import {
  ConnectPanel,
  ControlSection,
  FaqSection,
  Step,
  StepAccount,
  StepAsk,
  StepSkills,
  WhatSection,
} from "@/components/sections/guide-claude/GuidePage";
import { GuideStartFree } from "@/components/sections/guide-claude/GuideStartFree";
import { STEP_CONNECT } from "@/components/sections/guide-claude/guide-copy";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { VxArrow } from "@/components/sections/verticals/VxRelated";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * A connect page (/chatgpt, /codex): the Claude guide narrowed to one AI client, for the footer's
 * Features column (2026-10-17). Same kit and the guide's own sections (GuidePage exports them),
 * so a step, a prompt or a control card changed on /claude changes here too:
 *
 *   nav → hero (Start free · copy what step 02 needs) → What Pancake does → Set it up (#setup:
 *   01 account, 02 this client's steps, 03 skills on /codex, then Ask) → You stay in charge →
 *   Questions → Other agents → final CTA → footer.
 *
 * No tabs and no "Copy as Markdown" card: the page is about one client, and the agent version
 * of the guide (/guides/claude.md) stays the guide's. The Start free links keep the guide's
 * analytics ids (app_guide_claude_hero / _final, allow-listed): page_path tells the pages apart.
 * Structured data: WebPage + BreadcrumbList (Home → this page) + FAQPage, as on the guide.
 */
export function ConnectPage({ id }: { id: ConnectClientId }) {
  const c = CONNECT_CLIENTS[id];
  return (
    <main className="lp lp-vx lp-guide lp-connect">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(connectJsonLd(c)) }} />
      <LpFitVars />
      <LpNav />
      <Hero c={c} />
      <WhatSection />
      <section id="setup" className="vx-sec gd-setup" aria-labelledby="gd-setup-title">
        <div className="vx-col">
          <VxHead id="gd-setup-title" eyebrow={CONNECT_SETUP.eyebrow} title={CONNECT_SETUP.h2} />
          <ol className="gd-steps">
            <StepAccount />
            <Step num="02" title={c.connectTitle}>
              <ConnectPanel id={c.id} />
              <p className="gd-signin">{STEP_CONNECT.signIn}</p>
            </Step>
            {c.skills ? <StepSkills num="03" title={CONNECT_SETUP.skillsTitle} /> : null}
            <StepAsk num={c.skills ? "04" : "03"} groups={connectAskGroups(c.name)} />
          </ol>
        </div>
      </section>
      <ControlSection cards={connectControlCards(c.name)} />
      <FaqSection offer={false} items={c.faq} />
      <OthersSection id={c.id} />
      <LpCta
        title={CONNECT_FINAL.title}
        body={connectFinalBody(c.name)}
        buttons={<GuideStartFree ctaId="app_guide_claude_final">{CONNECT_FINAL.cta}</GuideStartFree>}
      />
      <LpFooter />
    </main>
  );
}

function Hero({ c }: { c: ConnectClient }) {
  return (
    <section id="main-content" tabIndex={-1} className="vx-hero gd-hero" aria-labelledby="gd-hero-title">
      <div className="vx-col">
        <h1 id="gd-hero-title" className="vx-hero__title gd-hero__title">
          {c.hero.title}
        </h1>
        <p className="vx-hero__lede">{vxNoWidow(c.hero.lede)}</p>
        <p className="vx-hero__lede gd-hero__setup">{CONNECT_HERO_SETUP}</p>
        <div className="lp-hero-btns vx-hero__btns gd-hero__btns">
          <GuideStartFree ctaId="app_guide_claude_hero">{CONNECT_HERO_PRIMARY}</GuideStartFree>
          <GuideCopyButton
            text={c.hero.copy.text}
            blockId={c.hero.copy.blockId}
            label={c.hero.copy.label}
            className="gd-copy--pill"
          />
        </div>
      </div>
    </section>
  );
}

/** Every other way in (the /for "Related" rows): Claude, the other connect page, other agents. */
function OthersSection({ id }: { id: ConnectClientId }) {
  const rows = connectOtherRows(id);
  // the named clients only: "Also in Claude and Codex."
  const names = rows.filter((r) => r !== CONNECT_OTHERS.other).map((r) => r.title);
  return (
    <section className="vx-sec vx-related" aria-labelledby="gd-others-title">
      <div className="vx-col">
        <VxHead id="gd-others-title" eyebrow={CONNECT_OTHERS.eyebrow} title={CONNECT_OTHERS.h2(names)} />
        <ul className="vx-rel">
          {rows.map((r) => (
            <li key={r.href}>
              <a className="vx-rel__row" href={r.href}>
                <span className="vx-rel__name lp-display">{r.title}</span>
                <span className="vx-rel__line">{vxNoWidow(r.line)}</span>
                <VxArrow className="vx-rel__arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function connectJsonLd(c: ConnectClient) {
  const url = `${SITE_ORIGIN}${c.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: c.meta.ogTitle,
        description: c.meta.description,
        inLanguage: "en-US",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_ORIGIN}/#website`, name: "Pancake", url: SITE_ORIGIN },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: CONNECT_META_SHARED.crumbHome, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: c.meta.crumbPage, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: c.faq
          .filter((f) => f.inJsonLd !== false)
          .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}
