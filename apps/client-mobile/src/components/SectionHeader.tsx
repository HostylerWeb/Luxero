import type * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  /** Section title (h2 by default). Use `as` to change the heading level. */
  title: React.ReactNode;
  /** Optional supporting copy rendered under the title in muted foreground. */
  description?: React.ReactNode;
  /** Optional right-aligned action area (e.g. a button, tabs). */
  action?: React.ReactNode;
  /** Optional icon to render before the title. */
  icon?: React.ReactNode;
  /** Override the rendered heading level. Defaults to `h2`. */
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

/**
 * Reusable `<SectionHeader>` for the repeated
 *   `<h2>Title</h2><p>description</p>[<actions>]`
 * pattern that appears in 15+ pages. Centralises the spacing and typography
 * so a single tweak updates every section header in the apps.
 */
export function SectionHeader({
  title,
  description,
  action,
  icon,
  as = "h2",
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Heading
          className={cn(
            "flex items-center gap-2 text-base font-semibold tracking-tight text-foreground",
            titleClassName
          )}
        >
          {icon}
          <span>{title}</span>
        </Heading>
        {description ? (
          <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}
