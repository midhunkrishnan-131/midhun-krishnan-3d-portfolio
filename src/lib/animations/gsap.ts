"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

/** House easing: a long, decisive in-out (cubic-bezier(.77,0,.18,1)). */
export const STORY_EASE = CustomEase.create("story", "0.77,0,0.18,1");

gsap.defaults({ ease: STORY_EASE, duration: 1.1 });

export { gsap, ScrollTrigger, SplitText };
