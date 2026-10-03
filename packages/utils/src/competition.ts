export interface TicketAvailabilityFields {
  maxTickets?: number;
  totalTickets?: number;
  ticketsSold?: number;
  soldTickets?: number;
  ticketsHeld?: number;
  availableTickets?: number;
}

export interface TicketQuantityLimits {
  liveAvailable: number;
  maxPerUser: number;
  userOwned: number;
  currentInCart: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type { TimeLeft };

export function getTicketsSold(comp: TicketAvailabilityFields): number {
  return comp.ticketsSold ?? comp.soldTickets ?? 0;
}

export function getMaxTickets(comp: TicketAvailabilityFields): number {
  return comp.maxTickets ?? comp.totalTickets ?? 0;
}

/** Sold plus held (reserved) tickets — pool consumption, not sold-only. */
export function getTicketsTaken(comp: TicketAvailabilityFields): number {
  return getTicketsSold(comp) + (comp.ticketsHeld ?? 0);
}

/** Pickable tickets left; prefers API-enriched availableTickets when present. */
export function getAvailableTickets(comp: TicketAvailabilityFields): number {
  if (comp.availableTickets != null) return comp.availableTickets;
  return Math.max(0, getMaxTickets(comp) - getTicketsTaken(comp));
}

export function formatTimeLeft(endDate: string | undefined | null): TimeLeft | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function getProgress(sold: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((sold / total) * 100, 100);
}

/** Prefer grantedTicketIds; fall back to deprecated grantedEntryIds. */
export function getGrantedTicketIds(win: {
  grantedTicketIds?: string[];
  grantedEntryIds?: string[];
}): string[] {
  return win.grantedTicketIds ?? win.grantedEntryIds ?? [];
}

export function formatCurrency(amount: number, currency = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Human-readable reason why no more tickets can be purchased.
 */
export function formatMaxTicketsReason(userOwned: number, maxPerUser: number): string {
  if (maxPerUser > 0 && userOwned >= maxPerUser) {
    return `You've reached the maximum of ${maxPerUser} ticket${maxPerUser !== 1 ? "s" : ""} per person for this competition.`;
  }
  return "No more tickets available.";
}

/**
 * Maximum absolute ticket quantity the user may hold in cart for one competition.
 * Accounts for pool availability, per-user limits, tickets already owned, and
 * tickets already reserved in the cart line.
 */
export function getMaxCartQuantity({
  liveAvailable,
  maxPerUser,
  userOwned,
  currentInCart,
}: TicketQuantityLimits): number {
  const poolCap = currentInCart + Math.max(0, liveAvailable);
  if (maxPerUser <= 0) return poolCap;
  return Math.min(poolCap, Math.max(0, maxPerUser - userOwned));
}

/**
 * Additional tickets the user can still add beyond currentInCart.
 */
export function getMaxPurchasable(limits: TicketQuantityLimits): number {
  return Math.max(0, getMaxCartQuantity(limits) - limits.currentInCart);
}

/** Toast copy when the user tries to exceed their ticket limit. */
export function formatTicketLimitWarning(
  limits: TicketQuantityLimits,
  maxCartQuantity: number
): string {
  const { liveAvailable, maxPerUser, userOwned } = limits;
  if (liveAvailable <= 0 && maxCartQuantity <= limits.currentInCart) {
    return "This competition is sold out";
  }
  if (maxPerUser > 0 && userOwned >= maxPerUser) {
    return formatMaxTicketsReason(userOwned, maxPerUser);
  }
  const personalRemaining = maxPerUser > 0 ? maxPerUser - userOwned : null;
  if (personalRemaining != null && maxCartQuantity === personalRemaining) {
    return `Maximum ${personalRemaining.toLocaleString("en-GB")} ticket${personalRemaining !== 1 ? "s" : ""} per person for this competition`;
  }
  return `Only ${maxCartQuantity.toLocaleString("en-GB")} ticket${maxCartQuantity !== 1 ? "s" : ""} available`;
}

/**
 * Clamp a requested cart-line quantity to the allowed maximum (minimum 1 when allowed).
 */
export function clampCartQuantity(
  requested: number,
  limits: TicketQuantityLimits
): { quantity: number; wasClamped: boolean; maxCartQuantity: number } {
  const maxCartQuantity = getMaxCartQuantity(limits);
  if (maxCartQuantity <= 0) {
    return { quantity: 0, wasClamped: requested > 0, maxCartQuantity: 0 };
  }
  const clamped = Math.max(1, Math.min(maxCartQuantity, requested));
  return {
    quantity: clamped,
    wasClamped: requested > maxCartQuantity,
    maxCartQuantity,
  };
}

/** Public countdown target — earliest of endDate and drawDate when both exist. */
export function getCompetitionCountdownTarget(comp: {
  drawDate?: string | Date | null;
  endDate?: string | Date | null;
}): string | undefined {
  const times: number[] = [];
  if (comp.endDate) times.push(new Date(comp.endDate).getTime());
  if (comp.drawDate) times.push(new Date(comp.drawDate).getTime());
  if (times.length === 0) {
    const fallback = comp.drawDate ?? comp.endDate;
    return fallback != null ? String(fallback) : undefined;
  }
  return new Date(Math.min(...times)).toISOString();
}
