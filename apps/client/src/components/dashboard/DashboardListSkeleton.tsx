"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  DASHBOARD_LIST_GAP,
  DASHBOARD_LIST_HEIGHTS,
  type DashboardListEntity,
} from "./dashboard-list-heights";
import type { DashboardListViewMode } from "./dashboard-list-view-mode";
import { dashboardListLayoutClass } from "./dashboard-list-view-mode";

interface DashboardListSkeletonProps {
  viewMode: DashboardListViewMode;
  count?: number;
  entity?: DashboardListEntity;
}

export function DashboardListSkeleton({
  viewMode,
  count = 3,
  entity = "order",
}: DashboardListSkeletonProps) {
  const layoutClass = dashboardListLayoutClass(viewMode);
  const heights = DASHBOARD_LIST_HEIGHTS[entity];

  if (viewMode === "compact") {
    return (
      <div className={layoutClass} style={{ gap: DASHBOARD_LIST_GAP.compact }}>
        {[...Array(count)].map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-xl"
            style={{ height: heights.compact }}
            shimmer
          />
        ))}
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className={layoutClass} style={{ gap: DASHBOARD_LIST_GAP.grid }}>
        {[...Array(count)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-xl" shimmer />
        ))}
      </div>
    );
  }

  return (
    <div className={layoutClass} style={{ gap: DASHBOARD_LIST_GAP.card }}>
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="w-full rounded-xl" style={{ height: heights.card }} shimmer />
      ))}
    </div>
  );
}
