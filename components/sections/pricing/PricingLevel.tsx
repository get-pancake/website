"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { BASE_LEVEL, CREDIT_LEVELS, appHrefForLevel, type CreditLevel } from "@/lib/pricing";

/**
 * /pricing — the level picked in the plan card, shared with the page's other
 * Start free (the closing band), so both open the app on it: the FAQ says
 * "Pick your level at the top of this page and Start free opens Pancake on
 * it". The state starts on the first level, so the server HTML of every
 * reader is the first level's link before hydration and without JavaScript.
 */
type LevelKey = CreditLevel["key"];
type LevelState = { level: LevelKey; setLevel: Dispatch<SetStateAction<LevelKey>> };

const PricingLevelContext = createContext<LevelState | null>(null);

export const isLevelKey = (value: string): value is LevelKey =>
  CREDIT_LEVELS.some((level) => level.key === value);

export function PricingLevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<LevelKey>(BASE_LEVEL.key);
  const state = useMemo(() => ({ level, setLevel }), [level]);
  return <PricingLevelContext.Provider value={state}>{children}</PricingLevelContext.Provider>;
}

/** The picked level and its setter. Outside a provider the level is local to the caller. */
export function usePricingLevel(): LevelState {
  const shared = useContext(PricingLevelContext);
  const [level, setLevel] = useState<LevelKey>(BASE_LEVEL.key);
  return shared ?? { level, setLevel };
}

/** Start free on the picked level, for a reader outside the plan card: the
    homepage's dark pill, which pushes the same app_cta_clicked event. */
export function StartFreeOnLevel({ children, ...rest }: { children: string; "data-analytics-id": string }) {
  const { level } = usePricingLevel();
  return (
    <LpFxLink href={appHrefForLevel(level)} {...rest}>
      {children}
    </LpFxLink>
  );
}
