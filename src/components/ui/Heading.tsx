import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Level = 1 | 2 | 3;
type Variant = "display" | "title" | "subtitle";

interface HeadingProps {
  level: Level;
  variant?: Variant;
  id?: string;
  className?: string;
  /** Masked line reveal on scroll (defaults on for h1/h2). */
  reveal?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  display: "font-display text-display font-normal",
  title: "font-display text-title font-normal",
  subtitle: "font-sans text-lead font-medium tracking-tight",
};

/** Semantic heading whose visual size is decoupled from its level. */
export function Heading({
  level,
  variant = "title",
  id,
  className,
  reveal,
  children,
}: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      id={id}
      data-reveal={(reveal ?? level <= 2) ? "lines" : undefined}
      className={cn("text-balance text-paper", variants[variant], className)}
    >
      {children}
    </Tag>
  );
}
