import { VxHead } from "@/components/sections/verticals/VxHead";
import { VX_CONTROL, VX_NOTE } from "@/components/sections/verticals/vx-copy";
import type { VerticalConfig } from "@/lib/verticals/types";

/** 20px check disc (the app's success tone on lp ramps). */
function CheckDisc({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="10" className="vx-check__disc" />
      <path d="M6 10.4l2.6 2.6L14 7.6" className="vx-check__tick" />
    </svg>
  );
}

/**
 * Control (spec §2.6): the agency owner's first objection — my account, my
 * reputation — answered with the product's real human gate. All fixed copy;
 * the only per-vertical data are the names (prompt 0 · lead 0, the
 * workspace's sender). Static, zero JS (one client island per page).
 *
 * Row = the homepage steps-row grammar (656 text card + 464 media card,
 * radius 30, min-height 426, equal heights). The media card is the app's
 * preflight dialog (campaigns/copy.ts `preflight`) with the enrollment toast
 * under it (`enrollment`), parallel, never rotated. Mock buttons are spans
 * inside a role="img" (not focusable); the visible fictional note sits
 * outside the image.
 *
 * Time coherence with the demo: leads land 8:30 AM, the lead is added at
 * 9:32 AM, first action no earlier than 9:42 AM, inside Mon–Fri 9–6.
 */
export function VxControl({ v }: { v: VerticalConfig }) {
  const lead = v.demo.prompts[0].leads[0].name;
  const sender = v.workspace.sender;
  const rows = VX_CONTROL.dialog.rows(sender);
  return (
    <section className="vx-sec vx-control" aria-labelledby="vx-control-title">
      <div className="vx-col">
        <VxHead id="vx-control-title" eyebrow={VX_CONTROL.eyebrow} title={VX_CONTROL.h2} lede={VX_CONTROL.lede} />
        <div className="vx-ctl-row">
          <div className="vx-ctl-text">
            <ul className="vx-ctl-facts">
              {VX_CONTROL.facts.map((f) => (
                <li key={f.title} className="vx-ctl-fact">
                  <div className="vx-ctl-fact__row">
                    <CheckDisc className="vx-check" />
                    <div>
                      <h3 className="vx-ctl-fact__title lp-display">{f.title}</h3>
                      <p className="vx-ctl-fact__body">{f.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="vx-ctl-media">
            <div className="vx-ctl-stage" role="img" aria-label={VX_CONTROL.aria(lead, sender)}>
              <div className="vx-dialog">
                <p className="vx-dialog__title">{VX_CONTROL.dialog.title(lead)}</p>
                <dl className="vx-dialog__rows">
                  {rows.map(([label, value]) => (
                    <div key={label} className="vx-dialog__row" data-row={label}>
                      <dt>{label}</dt>
                      <dd>{label === "Campaign" ? <span className="vx-chip" data-tone="ok">{value}</span> : value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="vx-dialog__btns">
                  <span className="vx-abtn">{VX_CONTROL.dialog.cancel}</span>
                  <span className="vx-abtn vx-abtn--primary">{VX_CONTROL.dialog.confirm}</span>
                </div>
              </div>
              <div className="vx-toast">
                <CheckDisc className="vx-check vx-toast__icon" />
                <div className="vx-toast__text">
                  <p className="vx-toast__title">{VX_CONTROL.toast.title(lead)}</p>
                  <p className="vx-toast__body">{VX_CONTROL.toast.body}</p>
                </div>
                <span className="vx-abtn vx-toast__undo">{VX_CONTROL.toast.undo}</span>
              </div>
            </div>
            <p className="vx-note">{VX_NOTE}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
