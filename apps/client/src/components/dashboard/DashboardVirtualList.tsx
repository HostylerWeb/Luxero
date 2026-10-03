"use client";

import { useEffect, useRef, useState } from "react";
import type { ListProps } from "react-window";
import { VirtualGrid } from "@/components/VirtualGrid";
import { VirtualList } from "@/components/VirtualList";
import { useTicketListViewportHeight } from "../shared/useTicketListViewportHeight";
import {
  DASHBOARD_LIST_GAP,
  getDashboardGridColumnCount,
  getDashboardGridRowHeight,
  getDashboardListHeight,
} from "./dashboard-list-heights";
import { dashboardListScrollClass } from "./dashboard-list-styles";
import type { DashboardListViewMode } from "./dashboard-list-view-mode";

type ExcludeForbiddenKeys<Type> = Omit<Type, "ariaAttributes" | "index" | "style">;

interface DashboardVirtualListProps<ListRowProps extends object, GridRowProps extends object> {
  viewMode: DashboardListViewMode;
  itemCount: number;
  listRowComponent: NonNullable<ListProps<ListRowProps>["rowComponent"]>;
  gridRowComponent: NonNullable<ListProps<GridRowProps & { columnCount: number }>["rowComponent"]>;
  listRowProps: ExcludeForbiddenKeys<ListRowProps>;
  gridRowProps: ExcludeForbiddenKeys<GridRowProps>;
  compactRowHeight: number;
  cardRowHeight: number;
  isInfinite?: boolean;
  fetchNextPage?: () => void;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
}

const FALLBACK_WIDTH = 320;

export function DashboardVirtualList<ListRowProps extends object, GridRowProps extends object>({
  viewMode,
  itemCount,
  listRowComponent,
  gridRowComponent,
  listRowProps,
  gridRowProps,
  compactRowHeight,
  cardRowHeight,
  isInfinite,
  fetchNextPage,
  hasMore,
  isFetchingNextPage,
  className,
}: DashboardVirtualListProps<ListRowProps, GridRowProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const viewportCap = useTicketListViewportHeight();

  useEffect(() => {
    setIsMounted(true);
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  if (itemCount <= 0) return null;

  if (!isMounted) {
    return <div ref={containerRef} className={className} />;
  }

  const width = containerWidth || FALLBACK_WIDTH;

  if (viewMode === "grid") {
    const columnCount = getDashboardGridColumnCount(width);
    const rowHeight = getDashboardGridRowHeight(width, columnCount, DASHBOARD_LIST_GAP.grid);
    const rowCount = Math.ceil(itemCount / columnCount);
    const height = getDashboardListHeight(rowCount, rowHeight, viewportCap);

    return (
      <div ref={containerRef} className={className}>
        {width > 0 ? (
          <VirtualGrid
            itemCount={itemCount}
            columnCount={columnCount}
            rowHeight={rowHeight}
            height={height}
            rowComponent={gridRowComponent}
            rowProps={
              { ...gridRowProps, columnCount } as ExcludeForbiddenKeys<
                GridRowProps & { columnCount: number }
              >
            }
            className={dashboardListScrollClass}
            isInfinite={isInfinite}
            fetchNextPage={fetchNextPage}
            hasMore={hasMore}
            isFetchingNextPage={isFetchingNextPage}
          />
        ) : null}
      </div>
    );
  }

  const rowHeight = viewMode === "compact" ? compactRowHeight : cardRowHeight;
  const height = getDashboardListHeight(itemCount, rowHeight, viewportCap);

  return (
    <div ref={containerRef} className={className}>
      {width > 0 ? (
        <VirtualList
          rowCount={itemCount}
          rowHeight={rowHeight}
          height={height}
          rowComponent={listRowComponent}
          rowProps={listRowProps}
          className={dashboardListScrollClass}
          ticketWidth={width}
          ticketGap={0}
          isInfinite={isInfinite}
          fetchNextPage={fetchNextPage}
          hasMore={hasMore}
          isFetchingNextPage={isFetchingNextPage}
        />
      ) : null}
    </div>
  );
}
