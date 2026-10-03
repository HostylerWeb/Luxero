/** When ticket sales close for a competition (earliest relevant date wins). */
export function getTicketSalesCloseTime(competition: {
  endDate?: Date | string | null;
  drawDate?: Date | string | null;
}): Date | null {
  const times: number[] = [];
  if (competition.endDate) times.push(new Date(competition.endDate).getTime());
  if (competition.drawDate) times.push(new Date(competition.drawDate).getTime());
  if (times.length === 0) return null;
  return new Date(Math.min(...times));
}

export function isOpenForTicketSales(
  competition: {
    status: string;
    endDate?: Date | string | null;
    drawDate?: Date | string | null;
  },
  now: Date = new Date()
): boolean {
  if (competition.status !== "active") return false;
  const closeAt = getTicketSalesCloseTime(competition);
  return closeAt == null || closeAt.getTime() > now.getTime();
}

/** Countdown / display target — same instant as sales close when both dates exist. */
export function getPublicCountdownTarget(competition: {
  drawDate?: Date | string | null;
  endDate?: Date | string | null;
}): string | undefined {
  const closeAt = getTicketSalesCloseTime(competition);
  if (closeAt) return closeAt.toISOString();
  const fallback = competition.drawDate ?? competition.endDate;
  if (fallback == null) return undefined;
  return typeof fallback === "string" ? fallback : fallback.toISOString();
}
