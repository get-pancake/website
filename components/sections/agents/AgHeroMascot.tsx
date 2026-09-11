"use client";

import { useInView } from "./useInView";

/**
 * /agents — the hero mascot on the page's idle bob (the same 3.2s keyframes
 * the knowledge cards run; hero.css `ag-hero-bob`). Founder, on the draft
 * (2026-09-11): "the mascot is a static PNG on a page where everything else
 * moves" — so it bobs like the rest of the page, and like the rest of the
 * page it runs only on screen: useInView stamps `data-inview` on this
 * wrapper and hero.css flips `animation-play-state` on it (never under
 * reduced motion — CSS). The wrapper is the gate so the loop stops the
 * moment the mascot scrolls out, not when the whole 900px hero does. That
 * ref is the only reason this is a client component; AgHero stays a server
 * component. The PNG is decorative (alt="") — the wrapper hides the pair
 * from AT in one go, like the knowledge art.
 */
export function AgHeroMascot() {
  const [bobRef] = useInView<HTMLDivElement>();
  return (
    <div ref={bobRef} className="ag-hero__bob" aria-hidden="true">
      <img className="ag-hero__mascot" src="/pancake-monster.png" alt="" width={112} height={116} />
    </div>
  );
}
