import { pricingPlan as p } from "@/lib/copy";

/**
 * /pricing — "One plan per workspace": what the $99 covers, drawn as the
 * workspace itself (Brain on top, one Play per audience, the accounts each
 * Play sends as, the team), a dashed second workspace beside it, and the four
 * questions customers ask answered next to the picture. Numbered markers tie
 * each answer to its spot on the diagram. Server-rendered, zero JS.
 * Copy and fact sources: `pricingPlan` in lib/copy.ts.
 */

function Marker({ n }: { n: number }) {
  return (
    <span className="lv2-plan-marker" aria-hidden="true">
      {n}
    </span>
  );
}

/* One colour per teammate, the same in the senders and the team row. */
function Avatar({ name }: { name: string }) {
  const tone = Math.max(0, (p.team.members as readonly string[]).indexOf(name));
  return (
    <span className="lv2-plan-avatar" data-tone={tone}>
      {name.charAt(0)}
    </span>
  );
}

export function PlanMap() {
  return (
    <section className="lv2s lv2-plan" aria-labelledby="lv2-plan-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-plan-title" className="lv2-section-title">
            {p.title}
          </h2>
          <p className="lv2-section-lede">{p.lede}</p>
        </header>

        <div className="lv2-plan-grid">
          <div className="lv2-plan-map">
            <div className="lv2-plan-ws">
              <div className="lv2-plan-ws-head">
                <span className="lv2-plan-ws-name">{p.workspace}</span>
                <span className="lv2-plan-ws-price">{p.price}</span>
              </div>

              <div className="lv2-plan-brain">
                <span className="lv2-plan-kicker">{p.brain.name}</span>
                <p>{p.brain.body}</p>
              </div>

              {/* Brain → Plays: the trunk splits into one drop per Play
                  (pure CSS, aligned to the plays grid's columns). */}
              <div className="lv2-plan-link">
                <Marker n={1} />
              </div>
              <ul className="lv2-plan-plays">
                {p.plays.map((play, i) => (
                  <li key={play.name} className="lv2-plan-play">
                    <span className="lv2-plan-kicker">{p.playKicker}</span>
                    <p className="lv2-plan-play-name">{play.name}</p>
                    <p className="lv2-plan-play-meta">{p.playMeta}</p>
                    <div className="lv2-plan-senders">
                      <span className="lv2-plan-senders-label">
                        {i === 1 ? <Marker n={2} /> : null}
                        {p.sendsAs}
                      </span>
                      <span className="lv2-plan-chips">
                        {play.senders.map((s) => (
                          <span key={s} className="lv2-plan-chip">
                            <Avatar name={s} />
                            {s}
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
                <li className="lv2-plan-play lv2-plan-play--new">
                  <span className="lv2-plan-plus" aria-hidden="true">
                    +
                  </span>
                  <p className="lv2-plan-play-name">{p.newPlay.name}</p>
                  <p className="lv2-plan-play-meta">{p.newPlay.body}</p>
                </li>
              </ul>

              <div className="lv2-plan-team">
                <Marker n={3} />
                <span className="lv2-plan-team-faces" aria-hidden="true">
                  {p.team.members.map((m) => (
                    <Avatar key={m} name={m} />
                  ))}
                  <span className="lv2-plan-avatar lv2-plan-avatar--more">+</span>
                </span>
                <p>{p.team.body}</p>
              </div>
            </div>

            <div className="lv2-plan-ws lv2-plan-ws--another">
              <Marker n={4} />
              <div>
                <p className="lv2-plan-another-name">{p.another.name}</p>
                <p className="lv2-plan-another-body">{p.another.body}</p>
              </div>
            </div>
          </div>

          <dl className="lv2-plan-faq">
            {p.faq.map((item) => (
              <div key={item.q} className="lv2-plan-faq-item">
                <dt>
                  <Marker n={item.marker} />
                  {item.q}
                </dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
