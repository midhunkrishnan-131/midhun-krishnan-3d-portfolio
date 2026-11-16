import Link from "next/link";
import { sectionHref, sections } from "@/data/navigation";
import { site } from "@/data/site";
import { Container } from "@/components/layout/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-16">
      <Container size="wide" className="flex flex-col gap-12">
        <nav aria-label="Footer">
          <ol className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  href={sectionHref(section.id)}
                  className="text-sm text-paper-dim transition-colors duration-(--duration-fast) hover:text-paper"
                >
                  <span className="mr-2 text-paper-faint tabular-nums">
                    {section.number}
                  </span>
                  {section.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col justify-between gap-4 text-micro text-paper-faint uppercase sm:flex-row">
          <p>© {site.name}</p>
          <p>{site.title}</p>
        </div>
      </Container>
    </footer>
  );
}
