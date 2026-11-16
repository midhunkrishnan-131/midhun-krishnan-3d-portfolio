import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
  size?: "default" | "wide" | "narrow";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const sizes = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-[96rem]",
} as const;

export function Container<T extends ElementType = "div">({
  as,
  size = "default",
  className,
  ...props
}: ContainerProps<T>) {
  const Component: ElementType = as ?? "div";
  return (
    <Component
      className={cn("mx-auto w-full px-(--gutter)", sizes[size], className)}
      {...props}
    />
  );
}
