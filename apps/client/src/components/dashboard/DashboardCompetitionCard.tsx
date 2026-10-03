"use client";

import type { Competition } from "@luxero/types";
import { cn } from "@luxero/utils";
import { CompetitionCard } from "./CompetitionCard";

interface DashboardCompetitionCardProps {
  competition: Competition;
  className?: string;
}

export function DashboardCompetitionCard({
  competition,
  className,
}: DashboardCompetitionCardProps) {
  return (
    <div className={cn(className)}>
      <CompetitionCard competition={competition} variant="grid" />
    </div>
  );
}
