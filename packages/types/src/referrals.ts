export interface ReferralTier {
  threshold: number;
  tickets: number;
  label?: string;
  multiplierOverride?: number | null;
  lifetimeTicketCap?: number | null;
}

export type CalculusMethod = "net" | "gross";

export interface ReferralWalletResponse {
  walletBalance: number;
  lifetimeEarned?: number;
  totalTickets: number;
}

export interface RedeemReferralTicketsResponse {
  redeemed: number;
  awardedTickets: number;
  totalEntries: number;
  competitionId: string;
  ticketNumbers: number[];
  entriesCreated: number[];
}

export interface MyReferralsResponse {
  referralCode: string | null;
  totalReferralCount: number;
  activeReferralCount: number;
  pendingReferralCount: number;
  tierTickets: number;
  referralsToNextTier: number;
  totalAwardedTickets: number;
  walletBalance: number;
  referralMultiplier: number;
  recentReferrals: Array<{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
    hasCompletedPurchase: boolean;
  }>;
  leaderboard: Array<{ rank: number; name: string; count: number }>;
}

export interface EndingSoonSettings {
  _id: "ending_soon_settings";
  endingSoonDaysThreshold: number;
  endingSoonTicketsThreshold: number;
  endingSoonCombineMode: "and" | "or";
  endingSoonTimeEnabled: boolean;
  endingSoonTicketsEnabled: boolean;
  endingSoonTicketsMetric: "remaining" | "sold";
}

export interface AdminReferralSummary {
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
}

export interface AdminReferralStats {
  activeReferralCount: number;
  totalReferralCount: number;
  pendingReferralCount: number;
  totalTicketsEarned: number;
  totalTicketValueGBP: number;
  tierTickets: number;
  referralsToNextTier: number;
  nextTierTickets: number;
  currentMultiplier: number;
  totalReferralSpendGBP: number;
  recentReferralUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    isActive: boolean;
  }>;
}

export interface AdminReferralPurchase {
  _id: string;
  referrerId: string;
  referrerEmail: string;
  referredUserId: string;
  referredEmail: string;
  orderId: string;
  orderIds: string[];
  referralPurchaseIds: string[];
  purchaseCount: number;
  activePurchaseCount?: number;
  latestDeletedAt?: string | null;
  commissionAmount: number;
  purchasedAt: string;
  createdAt: string;
  ticketsAwarded?: number;
  ticketsAwardedAt?: string;
  tierAtAward?: number;
  isActive?: boolean;
  referrerReferralCount?: number;
  signupReferrerEmail?: string | null;
  referrerReferralCode?: string | null;
  referrerActiveCount?: number;
  referrerInactiveCount?: number;
  referrerTotalCount?: number;
}

export interface LeaderboardEntry {
  rank: number;
  referrerId: string;
  name: string;
  email: string;
  count: number;
  ticketsAwarded: number;
}
