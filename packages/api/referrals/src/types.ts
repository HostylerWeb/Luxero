export interface ReferralTier {
  threshold: number;
  tickets: number;
  label?: string;
  multiplierOverride?: number | null;
  lifetimeTicketCap?: number | null;
}

export type CalculusMethod = "net" | "gross";

export interface GracePeriod {
  enabled: boolean;
  days: number;
  countsToward: "current_tier" | "next_tier";
}

export interface RefereeReward {
  enabled: boolean;
  discountPercent: number;
  minOrderValue: number;
}

export interface DistributionConfig {
  mode: "wallet" | "all_competitions";
}

export interface Guardrails {
  maxReferralsPerRefereePerDay: number;
  blockSelfReferral: boolean;
  requireEmailVerification: boolean;
}

export interface NewReferralSettings {
  _id: "referral_settings";
  tiers: ReferralTier[];
  calculusMethod: CalculusMethod;
  activityWindowDays: number;
  activityWindowMode: "rolling" | "fixed_day_of_month";
  monthlyCutoffDay: number;
  gracePeriod: GracePeriod;
  minFirstOrderSpend: number;
  refereeReward: RefereeReward;
  distribution: DistributionConfig;
  guardrails: Guardrails;
}

export interface QualificationResult {
  qualifies: boolean;
  reason?:
    | "below_min_spend"
    | "outside_window"
    | "self_referral"
    | "email_unverified"
    | "deferred"
    | "daily_limit";
}

export interface TierGrant {
  tickets: number;
  tier: ReferralTier | null;
  effectiveRate: number;
}

export interface TierPreview {
  threshold: number;
  tickets: number;
  label: string;
  effectiveTickets: number;
  isReached: boolean;
  isCurrent: boolean;
  referralsToReach: number | null;
}

export interface DistributionResult {
  mode: "wallet" | "all_competitions";
  ticketsAdded: number;
  perCompetition?: Array<{ competitionId: string; tickets: number }>;
}

export interface Allocation {
  competitionId: string;
  competitionTitle: string;
  ticketIds: string[];
  numbers: number[];
  qty: number;
}

export interface AwardSummary {
  profilesProcessed: number;
  ticketsGranted: number;
  purchasesCredited: number;
}
