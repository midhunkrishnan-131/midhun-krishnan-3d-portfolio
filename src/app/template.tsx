import { ScrollAnimations } from "@/components/animations/ScrollAnimations";

/**
 * Route-level wrapper so scroll typography (SplitText / GSAP) only mounts
 * in the same segment as the page markup it mutates. Keeping it in the root
 * layout let those effects run after the shell hydrated but before the page
 * did, which produced hydration mismatches on headings and hero styles.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ScrollAnimations />
    </>
  );
}
