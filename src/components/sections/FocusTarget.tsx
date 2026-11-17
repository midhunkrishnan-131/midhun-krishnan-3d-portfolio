"use client";

import type { ReactNode } from "react";
import { useFocusStore } from "@/stores/focusStore";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { cn } from "@/lib/utils/cn";

interface FocusTargetProps {
  kind: "project" | "skillGroup";
  id: string;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps server-rendered content and tells the section scene what is hovered
 * or focused, so the matching 3D object reacts. The pointer tilt / lift is
 * the shared Skills mouse motion (see usePointerTilt) — also used on
 * project cards. Transform-only; off for touch and reduced motion.
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
  const tiltRef = usePointerTilt<HTMLDivElement>(
    kind === "project" ? { rotate: 7, lift: 8 } : { rotate: 4, lift: 5 },
  );
  return (
    <div
      ref={tiltRef}
      className={cn("group/focus", className)}
      onPointerEnter={() => set(id)}
      onPointerLeave={() => set(null)}
      onFocus={() => set(id)}
      onBlur={() => set(null)}
    >
      {children}
    </div>
  );
}
