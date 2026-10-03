export type DashboardListEntity = "order" | "win" | "competition";

export const DASHBOARD_LIST_GAP = {
  compact: 8,
  card: 12,
  grid: 10,
} as const;

export const DASHBOARD_LIST_HEIGHTS = {
  order: {
    compact: 76,
    card: 272,
  },
  win: {
    compact: 76,
    card: 284,
  },
  competition: {
    compact: 76,
    card: 272,
  },
} as const;

export function getDashboardCompactRowHeight(entity: DashboardListEntity): number {
  return DASHBOARD_LIST_HEIGHTS[entity].compact;
}

export function getDashboardCardRowHeight(entity: DashboardListEntity): number {
  return DASHBOARD_LIST_HEIGHTS[entity].card;
}

export function getDashboardCompactRowHeightWithGap(entity: DashboardListEntity): number {
  return DASHBOARD_LIST_HEIGHTS[entity].compact + DASHBOARD_LIST_GAP.compact;
}

export function getDashboardCardRowHeightWithGap(entity: DashboardListEntity): number {
  return DASHBOARD_LIST_HEIGHTS[entity].card + DASHBOARD_LIST_GAP.card;
}

export function getDashboardGridColumnCount(containerWidth: number): number {
  if (containerWidth >= 768) return 4;
  if (containerWidth >= 640) return 3;
  return 2;
}

export function getDashboardGridRowHeight(
  containerWidth: number,
  columnCount: number,
  gap = DASHBOARD_LIST_GAP.grid
): number {
  if (containerWidth <= 0 || columnCount <= 0) return 168;
  const cellWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
  return cellWidth + gap;
}

export function getDashboardListHeight(
  rowCount: number,
  rowHeightWithGap: number,
  viewportCap: number
): number {
  if (rowCount <= 0) return rowHeightWithGap;
  return Math.min(rowCount * rowHeightWithGap, viewportCap);
}

export const DASHBOARD_COMPACT_ROW_HEIGHT_WITH_GAP = getDashboardCompactRowHeightWithGap("order");
export const DASHBOARD_ORDER_CARD_ROW_HEIGHT_WITH_GAP = getDashboardCardRowHeightWithGap("order");
export const DASHBOARD_WIN_CARD_ROW_HEIGHT_WITH_GAP = getDashboardCardRowHeightWithGap("win");
