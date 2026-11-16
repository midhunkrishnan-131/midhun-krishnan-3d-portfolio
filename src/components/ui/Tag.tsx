import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "accent" | "muted";

const tones: Record<Tone, string> = {
  neutral: "border-line-strong text-paper-dim",
  accent: "border-ember/50 text-ember-soft",
  muted: "border-line text-paper-faint",
};

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-3 py-1 text-micro font-medium uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
