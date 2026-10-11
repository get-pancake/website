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
 *   --lp-sky-d = (section centre − viewport centre) in px, rounded to 0.5
 *
 * sky.css turns that into `translate3d(0, d × k, 0)` with the cloud's depth factor `--lp-sky-k`
 * (k > 0: faster than the page, nearer; k < 0: slower, farther; halved on phones), clamped.
 * So the rest pose — the Figma artboard position — is exactly the moment the section's centre
 * crosses the viewport's centre, the tuning lives in CSS, and a write never restyles more than
 * the cloud itself (a property on the section would restyle its whole subtree).
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
 * sits mid-section with ±~110 px of room both ways.
 */

const CLOUD = ".lp-sky-cloud";
/** start a frame or two before a section's clouds can show */
const MARGIN = "25% 0px 25% 0px";

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
  let raf = 0;
  let listening = false;
  let disposed = false;

  const update = () => {
    raf = 0;
    if (disposed || motionMq.matches) return;
    const vh = window.innerHeight;
    onScreen.forEach((section) => {
      const r = section.getBoundingClientRect();
      if (!r.height) return; // display:none (the agents view hides the band)
      const d = Math.round((r.top + r.height / 2 - vh / 2) * 2) / 2;
      if (lastD.get(section) === d) return;
      lastD.set(section, d);
      const value = String(d);
      for (const cloud of groups.get(section) ?? []) cloud.style.setProperty("--lp-sky-d", value);
    });
  };
  const schedule = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(update);
  };
  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    if (on) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
    } else {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    }
  };
  const rest = () => {
    groups.forEach((list) => {
      for (const cloud of list) cloud.style.removeProperty("--lp-sky-d");
    });
    lastD.clear();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const section = e.target as HTMLElement;
        if (e.isIntersecting) onScreen.add(section);
        else onScreen.delete(section);
      }
      listen(onScreen.size > 0 && !motionMq.matches);
      schedule();
    },
    { rootMargin: MARGIN },
  );
  groups.forEach((_, section) => io.observe(section));

  const onMotion = () => {
    if (motionMq.matches) {
      listen(false);
      rest();
    } else {
      listen(onScreen.size > 0);
      schedule();
    }
  };
  motionMq.addEventListener("change", onMotion);

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    listen(false);
    motionMq.removeEventListener("change", onMotion);
    rest();
  };
}
