import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="font-mono text-micro text-paper-faint uppercase"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last || !item.href ? (
                <span
                  className="text-paper-dim"
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors duration-(--duration-fast) hover:text-paper"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
