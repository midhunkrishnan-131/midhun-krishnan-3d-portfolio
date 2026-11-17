import type { Copy } from "@/types/content";
import { cn } from "@/lib/utils/cn";

/** Renders one piece of story copy. Placeholder copy is visually quieter and tagged in the DOM. */
export function CopyText({
  copy,
  className,
  reveal,
}: {
  copy: Copy;
  className?: string;
  reveal?: "words" | "fade";
}) {
  return (
    <p
      className={cn(copy.placeholder && "text-paper-faint italic", className)}
      data-placeholder={copy.placeholder ? "true" : undefined}
      data-reveal={reveal}
    >
      {copy.text}
    </p>
  );
}
