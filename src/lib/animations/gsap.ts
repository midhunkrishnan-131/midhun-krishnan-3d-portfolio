"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

/** House easing: a long, decisive in-out (cubic-bezier(.77,0,.18,1)). */
export const STORY_EASE = CustomEase.create("story", "0.77,0,0.18,1");

/** Numeric scrub: playhead eases toward scroll position (~seconds of catch-up). */
export const SCRUB = 0.65;

gsap.defaults({ ease: STORY_EASE, duration: 1.1 });

// Address-bar show/hide on mobile would otherwise refresh every trigger and hitch the scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
