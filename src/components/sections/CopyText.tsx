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
  const visualReveal = reveal === "words" ? undefined : reveal;
  return (
    <p
      className={cn(copy.placeholder && "text-paper-faint italic", className)}
      data-placeholder={copy.placeholder ? "true" : undefined}
      data-reveal={visualReveal}
    >
      {reveal === "words" ? (
        <>
          <span className="sr-only">{copy.text}</span>
          <span aria-hidden="true" data-reveal="words">
            {copy.text}
          </span>
        </>
      ) : (
        copy.text
      )}
    </p>
  );
}
