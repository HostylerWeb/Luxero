"use client";

import type * as React from "react";
import { Breadcrumbs } from "@/components/shell/Breadcrumbs";
import { cn } from "@/lib/utils";

export interface PageShellProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** When provided, replaces the default <Breadcrumbs /> chain (e.g. on detail pages). */
  breadcrumbs?: React.ReactNode;
  /** Pass `false` to hide the breadcrumb row entirely (e.g. on a fullscreen surface). */
  showBreadcrumbs?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function PageShell({
  title,
  description,
  breadcrumbs,
  showBreadcrumbs = true,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
}: PageShellProps) {
  const hasHeader = title || description || actions || breadcrumbs !== undefined;

  return (
    <div className={cn("flex flex-1 flex-col gap-5 p-4 md:p-6 lg:p-8", className)}>
      {hasHeader ? (
        <header className={cn("flex flex-col gap-3", headerClassName)}>
          {showBreadcrumbs ? (breadcrumbs ?? <Breadcrumbs />) : null}
          {title || actions ? (
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                {title ? (
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                ) : null}
                {description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          ) : null}
        </header>
      ) : null}

      <div className={cn("flex flex-1 flex-col gap-5", contentClassName)}>{children}</div>
    </div>
  );
}
