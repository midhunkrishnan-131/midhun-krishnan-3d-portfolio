import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge taught about our custom @theme font sizes so they don't clash with text colours. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "body", "lead", "title", "display"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
