import Link from "next/link";
import { primaryLinks, sectionHref } from "@/data/navigation";
import { site } from "@/data/site";
import { SiteMenu } from "@/components/navigation/SiteMenu";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[55] h-(--header-height) bg-ink-950">
      <div
        className="pointer-events-none absolute inset-0 bg-ink-950"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex h-full max-w-[96rem] items-center justify-between gap-6 px-(--gutter)">
        <Link
          href={sectionHref("hero")}
          className="group relative z-[60] flex items-baseline gap-3"
        >
          <span className="font-display text-2xl leading-none">
            {site.name}
          </span>
          <span className="hidden font-mono text-micro text-paper-faint uppercase sm:inline">
            Portfolio
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-6">
              {primaryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-micro font-medium text-paper-dim uppercase transition-colors duration-(--duration-fast) ease-cinematic hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <SiteMenu />
        </div>
      </div>
    </header>
  );
}
