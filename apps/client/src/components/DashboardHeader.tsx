"use client";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

function DashboardHeader({ title, subtitle, action, className }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateLabel = formatDate(now);

  return (
    <header
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="text-base text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action}
        <Badge
          variant="outline"
          className="h-8 gap-2 border-border/60 bg-transparent px-3 font-normal text-muted-foreground shadow-none"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">{t("dashboard.liveBadge")}</span>
          {mounted ? (
            <>
              <span className="hidden text-border sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="hidden text-sm sm:inline">{dateLabel}</span>
              <span className="hidden text-border sm:inline" aria-hidden="true">
                ·
              </span>
              <span className="font-mono text-sm tabular-nums">{timeLabel}</span>
            </>
          ) : null}
        </Badge>
      </div>
    </header>
  );
}

export type { DashboardHeaderProps };
export { DashboardHeader };
