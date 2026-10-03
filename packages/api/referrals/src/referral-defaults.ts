import type { NewReferralSettings } from "./types";

export const DEFAULT_REFERRAL_SETTINGS: NewReferralSettings = {
  _id: "referral_settings",
  tiers: [
    { threshold: 5, tickets: 2 },
    { threshold: 10, tickets: 5 },
    { threshold: 15, tickets: 10 },
  ],
  calculusMethod: "gross",
  activityWindowDays: 30,
  activityWindowMode: "rolling",
  monthlyCutoffDay: 25,
  gracePeriod: { enabled: false, days: 3, countsToward: "current_tier" },
  minFirstOrderSpend: 1,
  refereeReward: { enabled: true, discountPercent: 20, minOrderValue: 0 },
  distribution: { mode: "wallet" },
  guardrails: {
    maxReferralsPerRefereePerDay: 0,
    blockSelfReferral: true,
    requireEmailVerification: false,
  },
};
