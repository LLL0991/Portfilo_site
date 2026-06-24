import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type VerticalCutRevealLineProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  maskClassName?: string;
  revealGroup?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function VerticalCutRevealLine<T extends ElementType = "div">({
  as,
  children,
  className,
  maskClassName,
  revealGroup,
  ...props
}: VerticalCutRevealLineProps<T>) {
  const Component = (as ?? "div") as ElementType;

  return (
    <div className={cn("vertical-cut-reveal-mask", maskClassName)}>
      <Component
        className={cn("vertical-cut-reveal-line", className)}
        data-vertical-cut-line={revealGroup}
        {...props}
      >
        {children}
      </Component>
    </div>
  );
}
