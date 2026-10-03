// All new code should import from dedicated modules directly.
// This file only exists for backward compat.

import { qualifyPurchaseForTier } from "./qualify-purchase";
import { findCurrentTier, getReferralActivityWindowEnd } from "./tier-ladder";

export { qualifyPurchaseForTier } from "./qualify-purchase";
export {
  calculateTierGrant,
  DEFAULT_TIERS,
  findCurrentTier,
  findNextTier,
  getReferralActivityWindowEnd,
  previewTierLadder,
  sortTiers,
} from "./tier-ladder";

/** @deprecated Use formatTierLabel — kept for backward compat. */
export function formatReferralTierLabel(
  validCount: number,
  tiers: Array<{ threshold: number; tickets: number }>
): string {
  return formatTierLabel(validCount, tiers as any);
}

export function resolveTierTickets(
  validActiveReferees: number,
  tiers: Array<{ threshold: number; tickets: number }>
): number {
  const tier = findCurrentTier(validActiveReferees, tiers as any);
  return tier?.tickets ?? 0;
}

export function formatTierLabel(
  validActiveReferees: number,
  tiers: Array<{ threshold: number; tickets: number; label?: string }>
): string {
  const tier = findCurrentTier(validActiveReferees, tiers as any);
  if (!tier) return "";
  const label = tier.label ?? `${tier.tickets} tickets tier`;
  return `${label} (${tier.threshold}+ active referrals)`;
}

export type { CalculusMethod, ReferralTier, TierGrant } from "./types";

export function isReferralPurchaseWithinActivityWindow(
  purchasedAt: Date,
  referredUserCreatedAt: Date,
  activityWindowDays: number
): boolean {
  return purchasedAt <= getReferralActivityWindowEnd(referredUserCreatedAt, activityWindowDays);
}

export function isPurchaseWithinMonthlyCutoff(purchasedAt: Date, cutoffDay: number): boolean {
  return purchasedAt.getUTCDate() <= cutoffDay;
}

/** @deprecated Use calculateTierGrant which operates per-tier. */
export function computeReferralTierAward(
  validCount: number,
  tierTickets: number,
  multiplier: number
): number {
  return Math.round(validCount * tierTickets * multiplier);
}

export type ReferredUserQualificationSlice = {
  _id: { toString(): string };
  createdAt: Date;
  totalSpent?: number;
};

export type ReferralQualificationSettings = {
  mode: "rolling" | "fixed_day_of_month";
  rollingDays: number;
  cutoffDay: number;
  graceEnabled: boolean;
  graceDays: number;
  graceCountsToward: "current" | "next";
};

function buildFlatSettings(
  settingsOrRollingDays: ReferralQualificationSettings | number,
  minSpend: number
): {
  activityWindowDays: number;
  activityWindowMode: "rolling" | "fixed_day_of_month";
  monthlyCutoffDay: number;
  minFirstOrderSpend: number;
  gracePeriod: { enabled: boolean; days: number; countsToward: "current_tier" | "next_tier" };
  guardrails: {
    maxReferralsPerRefereePerDay: number;
    blockSelfReferral: boolean;
    requireEmailVerification: boolean;
  };
} {
  if (typeof settingsOrRollingDays === "number") {
    return {
      activityWindowDays: settingsOrRollingDays,
      activityWindowMode: "rolling",
      monthlyCutoffDay: 25,
      minFirstOrderSpend: minSpend,
      gracePeriod: { enabled: false, days: 0, countsToward: "current_tier" },
      guardrails: {
        maxReferralsPerRefereePerDay: 0,
        blockSelfReferral: true,
        requireEmailVerification: false,
      },
    };
  }
  return {
    activityWindowDays: settingsOrRollingDays.rollingDays,
    activityWindowMode: settingsOrRollingDays.mode,
    monthlyCutoffDay: settingsOrRollingDays.cutoffDay,
    minFirstOrderSpend: minSpend,
    gracePeriod: {
      enabled: settingsOrRollingDays.graceEnabled,
      days: settingsOrRollingDays.graceDays,
      countsToward:
        settingsOrRollingDays.graceCountsToward === "next" ? "next_tier" : "current_tier",
    },
    guardrails: {
      maxReferralsPerRefereePerDay: 0,
      blockSelfReferral: true,
      requireEmailVerification: false,
    },
  };
}

export type PurchaseLike = {
  purchasedAt: Date;
  referredUserId: { toString(): string };
  purchaseAmount?: number;
};

export function isQualifyingReferralPurchase(
  purchase: PurchaseLike,
  referredUser: ReferredUserQualificationSlice | undefined,
  settingsOrRollingDays: ReferralQualificationSettings | number,
  minSpend = 1
): boolean {
  if (!referredUser) return false;
  const refereeTotalSpentOnOrder =
    purchase.purchaseAmount !== undefined
      ? purchase.purchaseAmount
      : (referredUser.totalSpent ?? 0);
  return qualifyPurchaseForTier({
    purchaseDate: purchase.purchasedAt,
    refereeCreatedAt: referredUser.createdAt,
    refereeTotalSpentOnOrder,
    refereeEmailVerified: true,
    referrerId: "",
    buyerUserId: purchase.referredUserId.toString(),
    settings: buildFlatSettings(settingsOrRollingDays, minSpend),
  }).qualifies;
}

export function countValidReferredUsers(
  purchases: PurchaseLike[],
  referredUsers: ReferredUserQualificationSlice[],
  settingsOrRollingDays: ReferralQualificationSettings | number,
  minSpend = 1
): number {
  const referredUserMap = new Map(referredUsers.map((u) => [u._id.toString(), u]));
  const validReferredUserIds = new Set<string>();
  for (const purchase of purchases) {
    const referredUser = referredUserMap.get(purchase.referredUserId.toString());
    if (isQualifyingReferralPurchase(purchase, referredUser, settingsOrRollingDays, minSpend)) {
      validReferredUserIds.add(purchase.referredUserId.toString());
    }
  }
  return validReferredUserIds.size;
}
