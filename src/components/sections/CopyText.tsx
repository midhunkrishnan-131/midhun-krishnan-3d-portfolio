import type { Copy } from "@/types/content";
import { cn } from "@/lib/utils/cn";

/** Renders one piece of story copy. Placeholder copy is visually quieter and tagged in the DOM. */
export function CopyText({
  copy,
  className,
}: {
  copy: Copy;
  className?: string;
}) {
  return (
    <p
      className={cn(copy.placeholder && "text-paper-faint italic", className)}
      data-placeholder={copy.placeholder ? "true" : undefined}
    >
      {copy.text}
    </p>
  );
}
