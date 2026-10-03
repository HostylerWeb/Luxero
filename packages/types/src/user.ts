export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: "user" | "manager" | "admin";
  isAdmin: boolean;
  isVerified: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
}

export const DEFAULT_PROFILE_ADDRESS: ProfileAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "GB",
};

export interface Profile {
  id: string;
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  isAgeVerified?: boolean;
  ageVerifiedAt?: string;
  ageVerificationMethod?: "dob" | "admin" | "provider";
  monthlySpendLimit?: number | null;
  pendingMonthlySpendLimit?: number | null;
  monthlySpendLimitEffectiveAt?: string | null;
  selfExcluded?: boolean;
  selfExcludedUntil?: string | null;
  selfExcludedAt?: string | null;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country: string;
  role?: "user" | "manager" | "admin";
  isAdmin: boolean;
  isVerified: boolean;
  marketingConsent: boolean;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  websiteUrl?: string;
  showLastName: boolean;
  showLocation: boolean;
  showSocials: boolean;
  totalEntries: number;
  totalSpent: number;
  /** @deprecated use competitionWinsCount / instantWinsCount / bonusWinsCount */
  winsCount: number;
  competitionWinsCount: number;
  instantWinsCount: number;
  bonusWinsCount: number;
  referralCode: string | null;
  referredBy?: string;
  referredByEmail?: string;
  referredByProfile?: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  referredByCode?: string;
  referredBySignupCode?: string;
  referredBySignup?: string;
  completedOrderCount?: number;
  referralCount: number;
  referralMultiplier: number;
  referralTierAwardedTickets: number;
  referralTierLastUpdated?: string;
  referralWalletBalance?: number;
  referralWalletPending?: number;
  lastAwardAt?: string;
  subscriptionStatus: "active" | "cancelled" | "none";
  subscriptionTier?: "25" | "50" | "100" | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyStats {
  activeEntries: number;
  totalWins: number;
  competitionWins: number;
  instantWins: number;
  bonusWins: number;
  totalSpent: number;
  totalEntries: number;
}

export interface EntryCompetition {
  id: string;
  title: string;
  status: string;
  prizeValue: number;
  prizeImageUrl?: string;
  imageUrl?: string;
  drawDate?: string;
  endDate?: string;
  maxTickets?: number;
  ticketsSold?: number;
  ticketCount?: number;
}
