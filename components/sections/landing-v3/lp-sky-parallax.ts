"use client";

/**
 * Cloud parallax for the blue band (founder addendum 2026-10-09: "les nuages faut faire du
 * parallax, faire bouger avec des vitesses différentes"; Figma red note 4964:1644). Owner:
 * blue-band package.
 *
 * Every `.lp-sky-cloud` drifts vertically against its section as the page scrolls, each at its
 * own speed (depth layers: far clouds slower than the page, near clouds faster). One shared,
 * passive, rAF-throttled scroll listener for the whole page; it runs only while at least one
 * cloud section is on screen (IntersectionObserver), and writes ONE custom property per cloud:
 *
 *   --lp-sky-d = (anchor − viewport centre) in px, rounded to 0.5
 *
 * sky.css turns that into `translate3d(0, d × k, 0)` with the cloud's depth factor `--lp-sky-k`
 * (k > 0: faster than the page, nearer; k < 0: slower, farther), clamped. The tuning lives in
 * CSS, and a write never restyles more than the cloud itself (a property on the section would
 * restyle its whole subtree).
 *
 * The anchor:
 * - desktop and tablets (≥768): the SECTION's centre. The rest pose — the Figma artboard
 *   position — is exactly the moment the section's centre crosses the viewport's centre, for
 *   all of its clouds at once (the artboard is one picture).
 * - phones (≤767): each CLOUD's own resting centre. The stacked deep dive is more than two
 *   screens tall there, so its centre is a screen away from the heading clouds: measured
 *   against it they would sit on their clamp the whole time they can be seen. Around its own
 *   place a cloud is at rest in the middle of the screen and drifts a few px either side
 *   (sky.css keeps the phone depths small). A cloud more than a screen away is left alone.
 *
 * Phones without clouds: sky.css has ONE switch (decision 2026-10-11 §9 F4) that can remove
 * them at ≤767. A cloud without a box is skipped, and a section with none attaches no listener.
 *
 * No GSAP (clouds must not pull the animation chunk), translate only (no top/left), no
 * will-change. Reduced motion: no listener, the property is removed and sky.css pins
 * `transform: none` — the clouds rest at their Figma positions. Not an LpAnimFreeze member:
 * there is no CSS loop to freeze, and the driver gates itself on the viewport.
 *
 * Paint containment: .lp-dive is `content-visibility: auto` (foundation.css), which clips at the
 * section box. The depth signs keep every cloud inside its box while it can be seen: the two
 * heading clouds (top 91–99 of the section) are fast (k > 0), so they sit LOWER than rest while
 * the section enters and only rise past rest once they are above the viewport; the far cloud C
 * sits mid-section with ±~110 px of room both ways. On phones the heading pair is clamped
 * inside the band above the title (sky.css).
 */

const CLOUD = ".lp-sky-cloud";
/** start a frame or two before a section's clouds can show */
const MARGIN = "25% 0px 25% 0px";
/** the phone anchor (sky.css's ≤767 block) */
const PHONE_MQ = "(max-width: 767px)";

/** layout position in the page (transforms ignored: the parallax's own translate never feeds back) */
const pageTop = (el: HTMLElement) => {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) y += node.offsetTop;
  return y;
};

export function mountSkyParallax(scope: ParentNode = document): () => void {
  const clouds = Array.from(scope.querySelectorAll<HTMLElement>(CLOUD));
  const groups = new Map<HTMLElement, HTMLElement[]>();
  for (const cloud of clouds) {
    const section = cloud.closest<HTMLElement>("section");
    if (!section) continue;
    const list = groups.get(section);
    if (list) list.push(cloud);
    else groups.set(section, [cloud]);
  }
  if (!groups.size) return () => {};

  const motionMq = matchMedia("(prefers-reduced-motion: reduce)");
  const phoneMq = matchMedia(PHONE_MQ);
  const onScreen = new Set<HTMLElement>();
  const lastD = new Map<HTMLElement, number>();
  /** phones: each cloud's resting centre from its section's top; null = no box (hidden) */
  const own = new Map<HTMLElement, number | null>();
  let raf = 0;
  let listening = false;
  let disposed = false;

  const rendered = (cloud: HTMLElement) => cloud.offsetParent !== null; // absolute: null only without a box
  const anyRendered = () => {
    let found = false;
    onScreen.forEach((section) => {
      if (!found) found = (groups.get(section) ?? []).some(rendered);
    });
    return found;
  };
  const ownOffset = (cloud: HTMLElement, section: HTMLElement) => {
    let v = own.get(cloud);
    if (v === undefined) {
      v = rendered(cloud) ? pageTop(cloud) - pageTop(section) + cloud.offsetHeight / 2 : null;
      own.set(cloud, v);
    }
    return v;
  };

  const update = () => {
    raf = 0;
    if (disposed || motionMq.matches) return;
    const vh = window.innerHeight;
    const phone = phoneMq.matches;
    // read everything, then write
    const writes: [HTMLElement, number][] = [];
    onScreen.forEach((section) => {
      const r = section.getBoundingClientRect();
      if (!r.height) return; // display:none (the agents view hides the band)
      const centre = r.top + r.height / 2 - vh / 2;
      for (const cloud of groups.get(section) ?? []) {
        let d = centre;
        if (phone) {
          const offset = ownOffset(cloud, section);
          if (offset === null) continue;
          d = r.top + offset - vh / 2;
          if (Math.abs(d) > vh) continue; // a screen away: it keeps its last pose, unseen
        }
        d = Math.round(d * 2) / 2;
        if (lastD.get(cloud) !== d) writes.push([cloud, d]);
      }
    });
    for (const [cloud, d] of writes) {
      lastD.set(cloud, d);
      cloud.style.setProperty("--lp-sky-d", String(d));
    }
  };
  const schedule = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(update);
  };
  const onResize = () => {
    own.clear(); // the clouds' places (and whether they have one) follow the layout
    refresh();
  };
  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    if (on) window.addEventListener("scroll", schedule, { passive: true });
    else window.removeEventListener("scroll", schedule);
  };
  const rest = () => {
    groups.forEach((list) => {
      for (const cloud of list) cloud.style.removeProperty("--lp-sky-d");
    });
    lastD.clear();
  };
  /** listen while a section with at least one drawn cloud is near the screen, motion allowed */
  const refresh = () => {
    const on = !motionMq.matches && onScreen.size > 0 && anyRendered();
    listen(on);
    if (on) schedule();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const section = e.target as HTMLElement;
        if (e.isIntersecting) onScreen.add(section);
        else onScreen.delete(section);
      }
      refresh();
    },
    { rootMargin: MARGIN },
  );
  groups.forEach((_, section) => io.observe(section));
  window.addEventListener("resize", onResize, { passive: true });

  const onMotion = () => {
    if (motionMq.matches) {
      listen(false);
      rest();
    } else {
      refresh();
    }
  };
  motionMq.addEventListener("change", onMotion);
  // crossing 767 changes the anchor: every cloud gets its new distance on the next frame
  const onPhone = () => {
    own.clear();
    lastD.clear();
    refresh();
  };
  phoneMq.addEventListener("change", onPhone);

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    listen(false);
    window.removeEventListener("resize", onResize);
    motionMq.removeEventListener("change", onMotion);
    phoneMq.removeEventListener("change", onPhone);
    rest();
  };
}
