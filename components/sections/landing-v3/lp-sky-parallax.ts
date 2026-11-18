"use client";

/**
 * The clouds' drift on scroll, for the blue band (founder addendum 2026-10-09: "les nuages faut
 * faire du parallax, faire bouger avec des vitesses différentes"; Figma red note 4964:1644).
 * Owner: blue-band package.
 *
 * Every `.lp-sky-cloud` drifts SIDEWAYS as the page scrolls, each at its own speed, and only
 * sideways (founder, on the preview, 2026-11-12: "ils se déplacent horizontalement, uniquement,
 * comme des vrais nuages"; until that day each cloud also rose or sank with the scroll). One
 * shared, passive, rAF-throttled scroll listener for the whole page; it runs only while at least
 * one cloud section is on screen (IntersectionObserver), and writes ONE custom property per cloud:
 *
 *   --lp-sky-d = (the cloud's resting centre − the viewport's centre) in px, rounded to 0.5
 *
 * sky.css turns that into `translate3d(d × kx, 0, 0)` with the cloud's speed `--lp-sky-kx`,
 * clamped. The tuning lives in CSS, and a write never restyles more than the cloud itself (a
 * property on the section would restyle its whole subtree).
 *
 * The distance is measured from the cloud's OWN place, so a cloud is at its Figma pose as it
 * crosses the middle of the screen and a few tens of px either side of it elsewhere. (Until
 * 2026-11-12 the desktop clouds measured from their section's centre, the artboard's rest; the
 * phones' and the tablets' heading clouds already measured from their own place.) A cloud more
 * than a screen away is left alone.
 *
 * Phones without clouds: sky.css has ONE switch (decision 2026-10-11 §9 F4) that can remove
 * them at ≤767. A cloud without a box is skipped, and a section with none attaches no listener.
 *
 * No GSAP (clouds must not pull the animation chunk), translate only (no top/left), no
 * will-change. Reduced motion: no listener, the property is removed and sky.css pins
 * `transform: none` — the clouds rest at their Figma positions. Not an LpAnimFreeze member:
 * there is no CSS loop to freeze, and the driver gates itself on the viewport.
 *
 * Paint containment: the sections are `content-visibility: auto` (foundation.css), which clips
 * at the section box. A cloud no longer leaves its place up or down, so it is inside its box
 * wherever it rests inside it. On phones the dive's cloud A rests over the banner card, above
 * the section's own top edge (mobile artboard 5061:696): sky.css starts the section's box 72 px
 * higher there (`--lp-sky-room`, a transparent band).
 */

const CLOUD = ".lp-sky-cloud";
/** start a frame or two before a section's clouds can show */
const MARGIN = "25% 0px 25% 0px";

/** layout position in the page (transforms ignored: the drift's own translate never feeds back) */
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
  const onScreen = new Set<HTMLElement>();
  const lastD = new Map<HTMLElement, number>();
  /** per cloud, read once per layout: its resting centre from its section's top; null = no box (hidden) */
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
    // read everything, then write
    const writes: [HTMLElement, number][] = [];
    onScreen.forEach((section) => {
      const r = section.getBoundingClientRect();
      if (!r.height) return; // display:none (the agents view hides the band)
      for (const cloud of groups.get(section) ?? []) {
        const offset = ownOffset(cloud, section);
        if (offset === null) continue;
        let d = r.top + offset - vh / 2;
        if (Math.abs(d) > vh) continue; // a screen away: it keeps its last pose, unseen
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
    // the clouds' places, and whether they have one, follow the layout (sky.css's 1024 and 767
    // blocks): every cloud gets its distance again on the next frame
    own.clear();
    lastD.clear();
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

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    listen(false);
    window.removeEventListener("resize", onResize);
    motionMq.removeEventListener("change", onMotion);
    rest();
  };
}
