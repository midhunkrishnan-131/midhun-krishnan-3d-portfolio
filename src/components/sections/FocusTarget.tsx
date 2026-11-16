"use client";

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
 * so the matching 3D object reacts. Purely an enhancement: content works without it.
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
    <div
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
