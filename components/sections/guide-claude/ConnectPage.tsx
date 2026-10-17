import { Fragment, type ReactNode } from "react";

import { LpFooter } from "@/components/sections/landing-v3/LpFooter";
import { LpNav } from "@/components/sections/landing-v3/LpNav";
import {
  CONNECT_CLIENTS,
  CONNECT_SHARED,
  connectOthers,
  connectPrompts,
  type ConnectClient,
  type ConnectClientId,
  type Inline,
} from "@/components/sections/guide-claude/connect-copy";
import { CopyBlock, Step } from "@/components/sections/guide-claude/GuidePage";
import { GuideStartFree } from "@/components/sections/guide-claude/GuideStartFree";
import { VxHead } from "@/components/sections/verticals/VxHead";
import { vxNoWidow } from "@/components/sections/verticals/vx-text";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * A connect page (/chatgpt, /codex), linked from the footer's Features column (2026-10-17). A
 * how-to, nothing else (founder: "simples et expliquer les guidelines clairement et
 * efficacement"; connect-copy.ts):
 *
 *   nav → H1 + one line → Four steps (#setup: the guide's step rows and copy blocks, Start free
 *   in step 01) → Then ask (five prompts) → Good to know (one-line facts, the other clients)
 *   → footer.
 *
 * The /for kit and the guide's sheet (.lp-vx, .lp-guide: step rows, copy blocks) plus
 * verticals/know.css. Client islands: the copy buttons and the Start free pill, which keeps the
 * guide's allow-listed analytics id (app_guide_claude_hero); page_path tells the pages apart.
 * Structured data: WebPage + BreadcrumbList (Home → this page) + HowTo (the four steps).
 */
export function ConnectPage({ id }: { id: ConnectClientId }) {
  const c = CONNECT_CLIENTS[id];
  return (
    <main className="lp lp-vx lp-guide lp-connect">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(connectJsonLd(c)) }} />
      <LpNav />
      <section id="main-content" tabIndex={-1} className="vx-hero gd-hero" aria-labelledby="gd-hero-title">
        <div className="vx-col">
          <h1 id="gd-hero-title" className="vx-hero__title gd-hero__title">
            {c.h1}
          </h1>
          <p className="vx-hero__lede">{vxNoWidow(c.lede)}</p>
          <p className="vx-hero__lede gd-hero__setup">{CONNECT_SHARED.setup}</p>
        </div>
      </section>
      <section id="setup" className="vx-sec gd-setup" aria-labelledby="gd-setup-title">
        <div className="vx-col">
          <VxHead id="gd-setup-title" eyebrow={CONNECT_SHARED.steps.eyebrow} title={CONNECT_SHARED.steps.h2} />
          <ol className="gd-steps">
            {c.steps.map((s, i) => (
              <Step key={s.title} num={String(i + 1).padStart(2, "0")} title={s.title}>
                <p>{rich(s.body)}</p>
                {s.block ? <CopyBlock id={s.block.id} text={s.block.text} code={s.block.code} /> : null}
                {s.after ? <p>{rich(s.after)}</p> : null}
                {s.startFree ? (
                  <p className="cn-start">
                    <GuideStartFree ctaId="app_guide_claude_hero">{CONNECT_SHARED.startFree}</GuideStartFree>
                  </p>
                ) : null}
              </Step>
            ))}
          </ol>
        </div>
      </section>
      <section className="vx-sec cn-prompts" aria-labelledby="cn-prompts-title">
        <div className="vx-col">
          <VxHead id="cn-prompts-title" eyebrow={CONNECT_SHARED.prompts.eyebrow} title={CONNECT_SHARED.prompts.h2} />
          <div className="cn-prompts__list">
            <p className="cn-prompts__intro">{CONNECT_SHARED.prompts.intro}</p>
            {connectPrompts(c.name).map((p) => (
              <Fragment key={p.id}>
                <CopyBlock id={p.id} text={p.text} />
                {p.note ? <p className="gd-prompts__note">{p.note}</p> : null}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
      <section className="vx-sec cn-know" aria-labelledby="cn-know-title">
        <div className="vx-col">
          <VxHead id="cn-know-title" eyebrow={CONNECT_SHARED.know.eyebrow} title={CONNECT_SHARED.know.h2} />
          <ul className="vx-know">
            {c.know.map((k, i) => (
              <li key={i}>
                {rich(k.text)}
                {k.block ? <CopyBlock id={k.block.id} text={k.block.text} /> : null}
              </li>
            ))}
          </ul>
          <p className="cn-others">
            {CONNECT_SHARED.others.lead}{" "}
            {connectOthers(c.id).map((o, i) => (
              <Fragment key={o.href}>
                {i > 0 ? " · " : null}
                <a className="lp-textlink" href={o.href}>
                  {o.label}
                </a>
              </Fragment>
            ))}
          </p>
        </div>
      </section>
      <LpFooter />
    </main>
  );
}

/** Inline copy → text, <strong> (a button or menu name) and <code> (what you type). */
function rich(parts: Inline[]): ReactNode {
  return parts.map((p, i) =>
    typeof p === "string" ? (
      <Fragment key={i}>{p}</Fragment>
    ) : "b" in p ? (
      <strong key={i}>{p.b}</strong>
    ) : (
      <code key={i}>{p.code}</code>
    ),
  );
}

const plain = (parts: Inline[]) => parts.map((p) => (typeof p === "string" ? p : "b" in p ? p.b : p.code)).join("");

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
        mainEntity: { "@id": `${url}#howto` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: CONNECT_SHARED.crumbHome, item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: c.meta.crumbPage, item: url },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: c.h1,
        description: c.lede,
        step: c.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: [plain(s.body), s.block?.text, s.after ? plain(s.after) : undefined].filter(Boolean).join(" "),
          url: `${url}#setup`,
        })),
      },
    ],
  };
}
