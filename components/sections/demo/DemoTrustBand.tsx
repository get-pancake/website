import { LpMarquee } from "@/components/sections/landing-v3/LpMarquee";
import { TRUST } from "./demo-copy";

/**
 * "Trusted by dozens of YC companies" + the customer wordmarks, in the copy
 * column like brain's BrainTrustBand. Brain's recipe (plum alpha masks,
 * optical bounds, leftward loop) already lives in LpMarquee (PR #297) with
 * the repo's public/logos/customers/* set, so the band is that component
 * under a label; demo.css removes its strip padding, adds hover-pause and
 * hides the per-logo YC superscripts (brain's optics: the mark once, in the
 * label). Brain's /logos/yc.svg does not exist here: the mark is
 * /logos/customers/yc.svg. PromptLayer (brain's set) is not a customer
 * asset and is not re-added.
 */
export function DemoTrustBand() {
  return (
    <div className="demo-trust">
      <p className="demo-trust__label">
        {TRUST.before}
        <img className="demo-trust__yc" src="/logos/customers/yc.svg" alt={TRUST.ycAlt} width={16} height={16} />
        {TRUST.after}
      </p>
      <LpMarquee />
    </div>
  );
}
