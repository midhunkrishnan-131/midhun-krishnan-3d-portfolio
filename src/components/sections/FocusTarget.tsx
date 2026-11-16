"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useFocusStore } from "@/stores/focusStore";
import { cn } from "@/lib/utils/cn";

interface FocusTargetProps {
  kind: "project" | "skillGroup";
  id: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps server-rendered content and tells the section scene what is hovered / focused,
 * so the matching 3D object reacts, and lifts slightly on hover (motion/react).
 * Purely an enhancement: content works without it.
 */
export function FocusTarget({
  kind,
  id,
  className,
  children,
}: FocusTargetProps) {
  const set = useFocusStore((s) =>
    kind === "project" ? s.setProject : s.setSkillGroup,
  );
  return (
    <motion.div
      className={cn("group/focus", className)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      onPointerEnter={() => set(id)}
      onPointerLeave={() => set(null)}
      onFocus={() => set(id)}
      onBlur={() => set(null)}
    >
      {children}
    </motion.div>
  );
}
