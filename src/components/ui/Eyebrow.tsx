import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EyebrowProps {
  children: ReactNode;
  number?: string;
  className?: string;
}

/** Small uppercase label with an optional chapter number. */
export function Eyebrow({ children, number, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-micro font-medium text-paper-faint uppercase",
        className,
      )}
    >
      {number ? (
        <span className="text-ember tabular-nums" aria-hidden="true">
          {number}
        </span>
      ) : null}
      {number ? <span className="h-px w-8 bg-line" aria-hidden="true" /> : null}
      <span>{children}</span>
    </p>
  );
}
