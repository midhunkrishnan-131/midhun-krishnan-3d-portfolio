import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  number?: string;
  className?: string;
}

/** Small uppercase monospace label with an optional chapter number. */
export function Eyebrow({
  children,
  number,
  className,
  ...rest
}: EyebrowProps) {
  return (
    <p
      data-reveal="eyebrow"
      className={cn(
        "flex items-center gap-3 font-mono text-micro font-medium text-paper-faint uppercase",
        className,
      )}
      {...rest}
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
