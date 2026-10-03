import { describe, expect, test } from "vitest";
import { qualifyPurchaseForTier } from "./qualify-purchase";
import type { NewReferralSettings } from "./types";

const baseSettings: NewReferralSettings = {
  _id: "referral_settings",
  tiers: [],
  calculusMethod: "gross",
  activityWindowDays: 30,
  activityWindowMode: "rolling",
  monthlyCutoffDay: 25,
  gracePeriod: { enabled: false, days: 0, countsToward: "current_tier" },
  minFirstOrderSpend: 1,
  refereeReward: { enabled: true, discountPercent: 20, minOrderValue: 0 },
  distribution: { mode: "wallet" },
  guardrails: {
    maxReferralsPerRefereePerDay: 0,
    blockSelfReferral: true,
    requireEmailVerification: false,
  },
};

const jan1 = new Date("2026-01-01T00:00:00.000Z");
const jan15 = new Date("2026-01-15T00:00:00.000Z");
const feb1 = new Date("2026-02-01T00:00:00.000Z");

function isPurchaseWithinGracePeriod(
  purchase: Date,
  cutoffDay: number,
  graceDays: number
): boolean {
  const purchaseDay = purchase.getUTCDate();
  if (purchaseDay <= cutoffDay) return false;
  return purchaseDay <= cutoffDay + graceDays;
}

function countValidReferees(
  purchases: Array<{ referredUserId: string; purchasedAt: Date }>,
  refereeInfo: Map<string, { createdAt: Date; totalSpent: number; emailVerified: boolean }>,
  settings: NewReferralSettings
): number {
  const validUserIds = new Set<string>();
  for (const purchase of purchases) {
    const info = refereeInfo.get(purchase.referredUserId);
    if (!info) continue;
    const result = qualifyPurchaseForTier({
      purchaseDate: purchase.purchasedAt,
      refereeCreatedAt: info.createdAt,
      refereeTotalSpentOnOrder: info.totalSpent,
      refereeEmailVerified: info.emailVerified,
      referrerId: "referrer",
      buyerUserId: purchase.referredUserId,
      settings,
    });
    if (result.qualifies) {
      validUserIds.add(purchase.referredUserId);
    }
  }
  return validUserIds.size;
}

describe("qualifyPurchaseForTier", () => {
  test("qualifies a purchase within the activity window", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: jan15,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings: baseSettings,
    });
    expect(result.qualifies).toBe(true);
  });

  test("denies a purchase below min spend", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: jan15,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 0.5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings: baseSettings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("below_min_spend");
  });

  test("denies a purchase outside the activity window", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: feb1,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings: baseSettings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("outside_window");
  });

  test("qualifies a purchase in grace period when grace is enabled and countsToward current_tier", () => {
    const settings: NewReferralSettings = {
      ...baseSettings,
      gracePeriod: { enabled: true, days: 5, countsToward: "current_tier" },
    };
    const result = qualifyPurchaseForTier({
      purchaseDate: feb1,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings,
    });
    expect(result.qualifies).toBe(true);
  });

  test("marks as deferred when grace countsToward next_tier", () => {
    const settings: NewReferralSettings = {
      ...baseSettings,
      gracePeriod: { enabled: true, days: 5, countsToward: "next_tier" },
    };
    const result = qualifyPurchaseForTier({
      purchaseDate: feb1,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("deferred");
  });

  test("blocks self-referral", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: jan15,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "user-1",
      buyerUserId: "user-1",
      settings: baseSettings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("self_referral");
  });

  test("blocks when email unverified and guardrail enabled", () => {
    const settings: NewReferralSettings = {
      ...baseSettings,
      guardrails: { ...baseSettings.guardrails, requireEmailVerification: true },
    };
    const result = qualifyPurchaseForTier({
      purchaseDate: jan15,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: false,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("email_unverified");
  });

  test("boundary: purchase exactly on window end qualifies", () => {
    const windowEnd = new Date("2026-01-31T00:00:00.000Z");
    const result = qualifyPurchaseForTier({
      purchaseDate: windowEnd,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings: baseSettings,
    });
    expect(result.qualifies).toBe(true);
  });

  test("boundary: 1ms past grace end is denied", () => {
    const settings: NewReferralSettings = {
      ...baseSettings,
      gracePeriod: { enabled: true, days: 3, countsToward: "current_tier" },
    };
    const pastGrace = new Date("2026-02-03T00:00:01.000Z");
    const result = qualifyPurchaseForTier({
      purchaseDate: pastGrace,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 5,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings,
    });
    expect(result.qualifies).toBe(false);
  });

  test("zero min spend accepts any positive order", () => {
    const settings: NewReferralSettings = { ...baseSettings, minFirstOrderSpend: 0 };
    const result = qualifyPurchaseForTier({
      purchaseDate: jan15,
      refereeCreatedAt: jan1,
      refereeTotalSpentOnOrder: 0.01,
      refereeEmailVerified: true,
      referrerId: "referrer-1",
      buyerUserId: "buyer-1",
      settings,
    });
    expect(result.qualifies).toBe(true);
  });
});

describe("fixed_day_of_month mode", () => {
  const fixedSettings: NewReferralSettings = {
    ...baseSettings,
    activityWindowMode: "fixed_day_of_month",
  };

  test("purchase on cutoff day qualifies", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2026-02-25T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-01-15T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: fixedSettings,
    });
    expect(result.qualifies).toBe(true);
  });

  test("purchase day after cutoff day is outside window", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2026-02-26T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-01-15T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: fixedSettings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("outside_window");
  });

  test("purchase before cutoff day qualifies", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2026-02-20T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-01-15T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: fixedSettings,
    });
    expect(result.qualifies).toBe(true);
  });

  test("year rollover: Dec signup, Jan cutoff", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2027-01-25T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-12-31T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: fixedSettings,
    });
    expect(result.qualifies).toBe(true);
  });

  test("year rollover: Dec signup, purchase after Jan cutoff", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2027-01-26T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-12-31T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: fixedSettings,
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("outside_window");
  });

  test("grace period with current_tier qualifies", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2026-02-27T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-01-15T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: {
        ...fixedSettings,
        gracePeriod: { enabled: true, days: 3, countsToward: "current_tier" },
      },
    });
    expect(result.qualifies).toBe(true);
  });

  test("grace period with next_tier is deferred", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2026-02-27T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-01-15T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: {
        ...fixedSettings,
        gracePeriod: { enabled: true, days: 3, countsToward: "next_tier" },
      },
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("deferred");
  });

  test("beyond grace period is outside window", () => {
    const result = qualifyPurchaseForTier({
      purchaseDate: new Date("2026-03-01T00:00:00.000Z"),
      refereeCreatedAt: new Date("2026-01-15T00:00:00.000Z"),
      refereeTotalSpentOnOrder: 10,
      refereeEmailVerified: true,
      referrerId: "refA",
      buyerUserId: "buyerB",
      settings: {
        ...fixedSettings,
        gracePeriod: { enabled: true, days: 3, countsToward: "current_tier" },
      },
    });
    expect(result.qualifies).toBe(false);
    expect(result.reason).toBe("outside_window");
  });
});

describe("isPurchaseWithinGracePeriod", () => {
  test("returns true when purchase day is within grace", () => {
    const purchase = new Date("2026-01-28T00:00:00.000Z");
    expect(isPurchaseWithinGracePeriod(purchase, 25, 3)).toBe(true);
  });

  test("returns false when purchase day is before cutoff", () => {
    const purchase = new Date("2026-01-24T00:00:00.000Z");
    expect(isPurchaseWithinGracePeriod(purchase, 25, 3)).toBe(false);
  });

  test("returns false when purchase day is past grace end", () => {
    const purchase = new Date("2026-01-29T00:00:00.000Z");
    expect(isPurchaseWithinGracePeriod(purchase, 25, 3)).toBe(false);
  });
});

describe("countValidReferees", () => {
  const refereeCreated = new Map([
    ["u1", { createdAt: jan1, totalSpent: 50, emailVerified: true }],
    ["u2", { createdAt: jan1, totalSpent: 0, emailVerified: true }],
    ["u3", { createdAt: jan1, totalSpent: 200, emailVerified: true }],
  ]);

  test("counts unique qualifying users and deduplicates", () => {
    const purchases = [
      { referredUserId: "u1", purchasedAt: jan15 },
      { referredUserId: "u1", purchasedAt: jan15 },
      { referredUserId: "u2", purchasedAt: jan15 },
      { referredUserId: "u3", purchasedAt: feb1 },
    ];
    expect(countValidReferees(purchases, refereeCreated, baseSettings)).toBe(1);
  });

  test("returns 0 for empty purchases", () => {
    expect(countValidReferees([], refereeCreated, baseSettings)).toBe(0);
  });

  test("returns 0 when no referees qualify (all below min spend)", () => {
    const settings: NewReferralSettings = { ...baseSettings, minFirstOrderSpend: 100 };
    const purchases = [{ referredUserId: "u1", purchasedAt: jan15 }];
    expect(countValidReferees(purchases, refereeCreated, settings)).toBe(0);
  });
});
