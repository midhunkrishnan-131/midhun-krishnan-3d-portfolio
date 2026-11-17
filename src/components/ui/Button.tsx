import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const LINK_ONLY_PROPS = [
  "as",
  "replace",
  "scroll",
  "shallow",
  "passHref",
  "prefetch",
  "locale",
  "legacyBehavior",
  "onNavigate",
  "transitionTypes",
  "unstable_dynamicOnHover",
] as const;

type Variant = "primary" | "ghost" | "text";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-pill text-sm font-medium tracking-wide transition-[background-color,color,border-color,transform] duration-(--duration-base) ease-out-expo focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-paper px-6 py-3 text-ink-950 hover:bg-ember motion-safe:active:scale-[0.98]",
  ghost:
    "border border-line-strong px-6 py-3 text-paper hover:border-paper hover:bg-paper/5 motion-safe:active:scale-[0.98]",
  text: "px-0 py-1 text-paper underline decoration-line-strong underline-offset-[6px] hover:decoration-ember",
};

export const buttonClasses = (
  variant: Variant = "primary",
  className?: string,
): string => cn(base, variants[variant], className);

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  /** Mark links that leave the site; adds rel and a visually-hidden hint. */
  external?: boolean;
  "data-cursor"?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "children">;

function externalAnchorProps(
  props: Omit<
    ButtonLinkProps,
    "href" | "variant" | "external" | "className" | "children"
  >,
): ComponentPropsWithoutRef<"a"> {
  const next: Record<string, unknown> = { ...props };
  for (const key of LINK_ONLY_PROPS) delete next[key];
  return next as ComponentPropsWithoutRef<"a">;
}

export function ButtonLink({
  href,
  variant = "primary",
  external = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  if (external) {
    const cursor =
      typeof props["data-cursor"] === "string" &&
      props["data-cursor"].length > 0
        ? props["data-cursor"]
        : "Open";
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses(variant, className)}
        {...externalAnchorProps(props)}
        data-cursor={cursor}
      >
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
        <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, className)} {...props}>
      {children}
    </Link>
  );
}

type ButtonProps = { variant?: Variant } & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    />
  );
}
