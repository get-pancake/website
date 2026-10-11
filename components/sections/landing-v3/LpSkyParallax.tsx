"use client";

import { useEffect } from "react";

import { mountSkyParallax } from "./lp-sky-parallax";

/**
 * Headless: mounts the blue band's cloud parallax (lp-sky-parallax.ts) for every
 * `.lp-sky-cloud` on the page — the deep dive's three and the sky CTA's two. Rendered once, by
 * LpDive (homepage only); the driver finds the CTA's clouds by class, so LpCta (shared by seven
 * routes) ships no extra client code. Owner: blue-band package.
 */
export function LpSkyParallax() {
  useEffect(() => mountSkyParallax(document), []);
  return null;
}
