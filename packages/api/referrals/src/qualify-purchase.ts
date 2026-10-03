import type { GracePeriod, Guardrails, QualificationResult } from "./types";

interface QualifyArgs {
  purchaseDate: Date;
  refereeCreatedAt: Date;
  refereeTotalSpentOnOrder: number;
  refereeEmailVerified: boolean;
  referrerId: string;
  buyerUserId: string;
  referralsTodayCount?: number;
  settings: {
    activityWindowDays: number;
    activityWindowMode: "rolling" | "fixed_day_of_month";
    monthlyCutoffDay: number;
    minFirstOrderSpend: number;
    gracePeriod: GracePeriod;
    guardrails: Guardrails;
  };
}

export function qualifyPurchaseForTier(args: QualifyArgs): QualificationResult {
  const {
    purchaseDate,
    refereeCreatedAt,
    refereeTotalSpentOnOrder,
    refereeEmailVerified,
    referrerId,
    buyerUserId,
    referralsTodayCount,
    settings,
  } = args;

  if (referrerId === buyerUserId && settings.guardrails.blockSelfReferral !== false) {
    return { qualifies: false, reason: "self_referral" };
  }

  if (
    settings.guardrails.maxReferralsPerRefereePerDay > 0 &&
    (referralsTodayCount ?? 0) >= settings.guardrails.maxReferralsPerRefereePerDay
  ) {
    return { qualifies: false, reason: "daily_limit" };
  }

  if (settings.guardrails.requireEmailVerification && !refereeEmailVerified) {
    return { qualifies: false, reason: "email_unverified" };
  }

  if (refereeTotalSpentOnOrder < settings.minFirstOrderSpend) {
    return { qualifies: false, reason: "below_min_spend" };
  }

  let windowEnd: Date;
  if (settings.activityWindowMode === "fixed_day_of_month") {
    const signupMonth = refereeCreatedAt.getUTCMonth();
    const signupYear = refereeCreatedAt.getUTCFullYear();
    const nextMonth = signupMonth + 1 > 11 ? 0 : signupMonth + 1;
    const nextYear = nextMonth === 0 ? signupYear + 1 : signupYear;
    windowEnd = new Date(Date.UTC(nextYear, nextMonth, settings.monthlyCutoffDay, 23, 59, 59, 999));
  } else {
    windowEnd = new Date(refereeCreatedAt);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + settings.activityWindowDays);
  }

  if (purchaseDate > windowEnd) {
    if (settings.gracePeriod.enabled) {
      const graceEnd = new Date(windowEnd);
      graceEnd.setUTCDate(graceEnd.getUTCDate() + settings.gracePeriod.days);
      if (purchaseDate > graceEnd) {
        return { qualifies: false, reason: "outside_window" };
      }
      if (settings.gracePeriod.countsToward === "current_tier") {
        return { qualifies: true };
      }
      return { qualifies: false, reason: "deferred" };
    }
    return { qualifies: false, reason: "outside_window" };
  }

  return { qualifies: true };
}
