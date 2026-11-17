import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Level = 1 | 2 | 3;
type Variant = "display" | "title" | "subtitle";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: Level;
  variant?: Variant;
  id?: string;
  className?: string;
  /** Masked line reveal on scroll (defaults on for h1/h2).
   *  Leave false when the heading wraps a link: data-reveal="lines" plus an
   *  anchor child causes a production hydration mismatch (React #418). */
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
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      id={id}
      data-reveal={(reveal ?? level <= 2) ? "lines" : undefined}
      className={cn("text-balance text-paper", variants[variant], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
