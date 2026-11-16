export function SkipLink({ targetId = "main" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-pill bg-paper px-5 py-3 text-sm font-medium text-ink-950 transition-transform duration-(--duration-fast) focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  );
}
