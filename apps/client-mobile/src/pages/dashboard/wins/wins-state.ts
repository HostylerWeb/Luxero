type WinStatusFilter = "all" | "claimed" | "pending";

export function isWinVisibleByStatus(win: { claimed?: boolean }, statusFilter: WinStatusFilter) {
  const isClaimed = win.claimed ?? false;
  return statusFilter === "all" || (statusFilter === "claimed" ? isClaimed : !isClaimed);
}

export function shouldShowGlobalNoWinsState(params: {
  winsLoading: boolean;
  winsError: boolean;
  instantWinsLoading: boolean;
  instantWinsError: boolean;
  bonusWinsLoading: boolean;
  bonusWinsError: boolean;
  filteredWinsCount: number;
  filteredInstantWinsCount: number;
  filteredBonusWinsCount: number;
}) {
  return (
    !params.winsLoading &&
    !params.winsError &&
    !params.instantWinsLoading &&
    !params.instantWinsError &&
    !params.bonusWinsLoading &&
    !params.bonusWinsError &&
    params.filteredWinsCount === 0 &&
    params.filteredInstantWinsCount === 0 &&
    params.filteredBonusWinsCount === 0
  );
}
