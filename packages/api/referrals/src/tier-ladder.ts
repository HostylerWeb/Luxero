import type { CalculusMethod, ReferralTier, TierGrant, TierPreview } from "./types";

export const DEFAULT_TIERS: ReferralTier[] = [
  { threshold: 5, tickets: 2 },
  { threshold: 10, tickets: 5 },
  { threshold: 15, tickets: 10 },
];

export function sortTiers(tiers: ReferralTier[]): ReferralTier[] {
  return [...tiers].sort((a, b) => a.threshold - b.threshold);
}

export function findCurrentTier(
  validActiveReferees: number,
  tiers: ReferralTier[]
): ReferralTier | null {
  const sorted = sortTiers(tiers);
  let current: ReferralTier | null = null;
  for (const tier of sorted) {
    if (validActiveReferees >= tier.threshold) {
      current = tier;
    } else {
      break;
    }
  }
  return current;
}

export function findNextTier(
  validActiveReferees: number,
  tiers: ReferralTier[]
): ReferralTier | null {
  const sorted = sortTiers(tiers);
  for (const tier of sorted) {
    if (validActiveReferees < tier.threshold) {
      return tier;
    }
  }
  return null;
}

export function calculateTierGrant(args: {
  validActiveReferees: number;
  tiers: ReferralTier[];
  profileMultiplier: number;
  calculusMethod: CalculusMethod;
}): TierGrant {
  const { validActiveReferees, tiers, profileMultiplier, calculusMethod } = args;
  const tier = findCurrentTier(validActiveReferees, tiers);
  if (!tier) {
    return { tickets: 0, tier: null, effectiveRate: 0 };
  }

  const current = tier;
  const override = current.multiplierOverride ?? profileMultiplier;

  let baseTickets: number;
  if (calculusMethod === "net") {
    baseTickets = current.tickets;
  } else {
    const sorted = sortTiers(tiers);
    const idx = sorted.findIndex((t) => t.threshold === current.threshold);
    const prevTickets = idx > 0 ? sorted[idx - 1]!.tickets : 0;
    baseTickets = current.tickets - prevTickets;
  }

  const effectiveRate = baseTickets * override;
  const tickets = Math.round(effectiveRate);
  return { tickets, tier, effectiveRate };
}

export function getReferralActivityWindowEnd(
  referredUserCreatedAt: Date,
  activityWindowDays: number
): Date {
  const end = new Date(referredUserCreatedAt);
  end.setUTCDate(end.getUTCDate() + activityWindowDays);
  return end;
}

export function previewTierLadder(
  tiers: ReferralTier[],
  exampleCounts: number[],
  profileMultiplier: number,
  calculusMethod: CalculusMethod
): TierPreview[] {
  const sorted = sortTiers(tiers);
  return exampleCounts.map((count) => {
    const tier = findCurrentTier(count, sorted);
    const next = findNextTier(count, sorted);
    const baseTickets = tier?.tickets ?? 0;

    let effectiveTickets: number;
    if (!tier) {
      effectiveTickets = 0;
    } else if (calculusMethod === "net") {
      effectiveTickets = Math.round(baseTickets * (tier.multiplierOverride ?? profileMultiplier));
    } else {
      const idx = sorted.findIndex((t) => t.threshold === tier!.threshold);
      const prevTickets = idx > 0 ? sorted[idx - 1]!.tickets : 0;
      const diff = baseTickets - prevTickets;
      effectiveTickets = Math.round(diff * (tier.multiplierOverride ?? profileMultiplier));
    }

    const isReached = tier !== null;
    const isCurrent = isReached && (next === null || count < next!.threshold);
    return {
      threshold: tier?.threshold ?? 0,
      tickets: baseTickets,
      label: tier?.label ?? (isReached ? `${baseTickets} tickets` : "No reward"),
      effectiveTickets,
      isReached,
      isCurrent,
      referralsToReach: next ? next.threshold - count : null,
    };
  });
}
