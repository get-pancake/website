"use client";

// GSAP's core only. ScrollTrigger and @gsap/react's useGSAP were registered here until
// 2026-10-13 and nothing in app, components or lib used either: registering ScrollTrigger
// alone starts its own endless frame loop, a 250 ms timer and ten global scroll / wheel /
// touch / pointer listeners on every page that loads an animation (measured on the homepage:
// half of the frame callbacks at rest). A page that needs one of them registers it where it
// is used, not here.
import { gsap } from "gsap";

export { gsap };
