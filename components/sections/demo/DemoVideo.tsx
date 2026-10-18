import { DEMO_VIDEO } from "./demo-copy";

/** Shared by self-service and booked visitors; no contact details required. */
export function DemoVideo() {
  return (
    <div className="demo-video">
      <div className="demo-success__video">
        <iframe
          src={DEMO_VIDEO.src}
          title={DEMO_VIDEO.title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <p className="demo-form__help">
        <a href={DEMO_VIDEO.href} target="_blank" rel="noopener noreferrer">
          Watch on YouTube<span className="lp-sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  );
}
