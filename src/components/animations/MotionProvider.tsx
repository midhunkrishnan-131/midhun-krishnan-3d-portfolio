"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Framer Motion (motion/react) for UI micro-interactions only; honours reduced motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
