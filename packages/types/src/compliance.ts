export interface ComplianceSettings {
  _id: "compliance_settings";
  masterEnabled: boolean;
  ageVerificationEnabled: boolean;
  ageVerificationMinAge: number;
  ageVerificationProvider?: string;
  creditCardMonthlyLimitEnabled: boolean;
  creditCardMonthlyLimitGBP: number;
  instantWinCreditCardBanEnabled: boolean;

  personalSpendLimitsEnabled: boolean;
  spendLimitIncreaseCooldownHours: number;
  selfExclusionEnabled: boolean;
  selfExclusionMinMonths: number;
  marketingWebhookUrl?: string;
  postalEntryAddress: string;
  postalEntryProminenceEnabled: boolean;
  compliancePageEnabled: boolean;
  guestCheckoutEnabled: boolean;
  allowZeroSubtotalOrders: boolean;
  minimumOrderValue: number;
}

export type PublicComplianceSettings = Pick<
  ComplianceSettings,
  | "masterEnabled"
  | "ageVerificationEnabled"
  | "ageVerificationMinAge"
  | "creditCardMonthlyLimitEnabled"
  | "creditCardMonthlyLimitGBP"
  | "instantWinCreditCardBanEnabled"
  | "personalSpendLimitsEnabled"
  | "spendLimitIncreaseCooldownHours"
  | "selfExclusionEnabled"
  | "selfExclusionMinMonths"
  | "postalEntryAddress"
  | "postalEntryProminenceEnabled"
  | "compliancePageEnabled"
  | "guestCheckoutEnabled"
  | "allowZeroSubtotalOrders"
  | "minimumOrderValue"
>;

export type AgeVerificationMethod = "dob" | "admin" | "provider";

export type SelfExclusionDuration = "6months" | "1year" | "5years" | "permanent";

export interface SaferPlayState {
  monthlySpendLimit: number | null;
  pendingMonthlySpendLimit: number | null;
  monthlySpendLimitEffectiveAt: string | null;
  monthlySpendThisMonth: number;
  creditCardSpendThisMonth: number;
  creditCardMonthlyLimitGBP: number | null;
  creditCardMonthlyLimitEnabled: boolean;
  selfExcluded: boolean;
  /** True when self-exclusion is active (respects expiry). */
  effectiveSelfExcluded: boolean;
  selfExcludedUntil: string | null;
  selfExcludedAt: string | null;
  hasPendingOverrideRequest: boolean;
  personalSpendLimitsEnabled: boolean;
  spendLimitIncreaseCooldownHours: number;
  selfExclusionEnabled: boolean;
  selfExclusionMinMonths: number;
  completedOrderCount: number;
  spendLimitRequired: boolean;
}

export interface AdminUserComplianceState {
  userId: string;
  email: string;
  isAgeVerified: boolean;
  ageVerifiedAt: string | null;
  monthlySpendLimit: number | null;
  pendingMonthlySpendLimit: number | null;
  monthlySpendLimitEffectiveAt: string | null;
  monthlySpendThisMonth: number;
  creditCardSpendThisMonth: number;
  creditCardMonthlyLimitGBP: number | null;
  selfExcluded: boolean;
  effectiveSelfExcluded: boolean;
  selfExcludedPermanent: boolean;
  selfExcludedUntil: string | null;
  selfExcludedAt: string | null;
  spendLimitRequired: boolean;
  completedOrderCount: number;
  featureFlags: {
    enforcementActive: boolean;
    ageVerificationEnabled: boolean;
    personalSpendLimitsEnabled: boolean;
    selfExclusionEnabled: boolean;
    creditCardMonthlyLimitEnabled: boolean;
  };
}

export type AdminComplianceOverrideAction =
  | "set_spend_limit"
  | "clear_pending_spend_limit"
  | "impose_self_exclusion"
  | "lift_self_exclusion"
  | "set_age_verified";

export interface AdminComplianceOverrideRequest {
  action: AdminComplianceOverrideAction;
  reason: string;
  monthlySpendLimit?: number;
  bypassCooldown?: boolean;
  duration?: SelfExclusionDuration;
  acknowledgePermanent?: boolean;
  isAgeVerified?: boolean;
}

export interface ComplianceAuditEntry {
  _id: string;
  actorId: string | null;
  targetUserId: string;
  action: string;
  reason: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  source: "admin" | "user";
  createdAt: string;
}

export interface AdminUserProfilePatch {
  reason: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  marketingConsent?: boolean;
  dateOfBirth?: string;
}

export interface SelfExcludeResponse {
  selfExcluded: boolean;
  selfExcludedUntil: string | null;
  logoutRequired?: boolean;
}

export interface CheckoutComplianceHints {
  instantWinInCart: boolean;
  creditCardSpendThisMonth: number;
  creditCardLimitRemaining: number | null;
  creditCardMonthlyLimitEnabled: boolean;
  instantWinCreditCardBanEnabled: boolean;
  ageVerificationRequired: boolean;
  isAgeVerified: boolean;
}

export interface SelfExcludedUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  selfExcludedAt: string;
  selfExcludedUntil: string | null;
  isPermanent: boolean;
  overrideRequest: {
    _id: string;
    status: "pending" | "approved" | "rejected";
    userReason: string;
    createdAt: string;
  } | null;
}
