import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IAwardLock {
  token: string;
  lockedAt: Date;
}

export interface IProfile extends Document {
  affiliate?: {
    clickId?: string;
    source?: string;
    pubId?: string;
    zone?: string;
    campaignId?: string;
    device?: string;
    country?: string;
    creativeId?: string;
    landedAt?: Date;
  };
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: Date;
  isAgeVerified: boolean;
  ageVerifiedAt?: Date;
  ageVerificationMethod?: "dob" | "admin" | "provider";
  monthlySpendLimit?: number | null;
  pendingMonthlySpendLimit?: number | null;
  monthlySpendLimitEffectiveAt?: Date;
  reservedSpend: number;
  reservedSpendMonth?: string;
  selfExcluded: boolean;
  selfExcludedUntil?: Date | null;
  selfExcludedAt?: Date;
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
  winsCount: number;
  competitionWinsCount: number;
  instantWinsCount: number;
  bonusWinsCount: number;
  referralCode?: string;
  referredByCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  referredBySignup?: mongoose.Types.ObjectId;
  referredBySignupCode?: string;
  referralCount: number;
  referralMultiplier: number;
  referralTierAwardedTickets: number;
  referralTierThresholdsAwarded: number[];
  referralTierLastUpdated?: Date;
  referralWalletBalance?: number;
  referralWalletPending?: number;
  lastAwardAt?: Date;
  subscriptionStatus: "active" | "cancelled" | "none";
  subscriptionTier: "25" | "50" | "100" | null;
  isGuestCheckout?: boolean;
  awardLock?: IAwardLock;
  createdAt: Date;
  updatedAt: Date;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const ProfileSchema = new Schema<IProfile>(
  {
    affiliate: {
      clickId: { type: String },
      source: { type: String },
      pubId: { type: String },
      zone: { type: String },
      campaignId: { type: String },
      device: { type: String },
      country: { type: String },
      creativeId: { type: String },
      landedAt: { type: Date },
    },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    avatarUrl: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    isAgeVerified: { type: Boolean, default: false },
    ageVerifiedAt: { type: Date },
    ageVerificationMethod: { type: String, enum: ["dob", "admin", "provider"] },
    monthlySpendLimit: { type: Number, default: null },
    pendingMonthlySpendLimit: { type: Number, default: null },
    monthlySpendLimitEffectiveAt: { type: Date },
    reservedSpend: { type: Number, default: 0 },
    reservedSpendMonth: { type: String },
    selfExcluded: { type: Boolean, default: false },
    selfExcludedUntil: { type: Date, default: null },
    selfExcludedAt: { type: Date },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    postcode: { type: String },
    country: { type: String, default: "GB" },
    role: { type: String, enum: ["user", "manager", "admin"], default: "user" },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    websiteUrl: { type: String },
    showLastName: { type: Boolean, default: true },
    showLocation: { type: Boolean, default: true },
    showSocials: { type: Boolean, default: true },
    totalEntries: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    winsCount: { type: Number, default: 0 },
    competitionWinsCount: { type: Number, default: 0 },
    instantWinsCount: { type: Number, default: 0 },
    bonusWinsCount: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredByCode: { type: String },
    referredBy: { type: Schema.Types.ObjectId, ref: "Profile" },
    referredBySignup: { type: Schema.Types.ObjectId, ref: "Profile" },
    referredBySignupCode: { type: String },
    referralCount: { type: Number, default: 0 },
    referralMultiplier: { type: Number, default: 1, min: 1 },
    referralTierThresholdsAwarded: { type: [Number], default: [] },
    referralTierAwardedTickets: { type: Number, default: 0 },
    referralTierLastUpdated: { type: Date },
    referralWalletBalance: { type: Number, default: 0 },
    referralWalletPending: { type: Number, default: 0 },
    lastAwardAt: { type: Date },
    subscriptionStatus: { type: String, enum: ["active", "cancelled", "none"], default: "none" },
    subscriptionTier: { type: String, enum: ["25", "50", "100", null], default: null },
    isGuestCheckout: { type: Boolean, default: false },
    awardLock: {
      token: { type: String },
      lockedAt: { type: Date },
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

ProfileSchema.index({ email: 1 }, { unique: true, sparse: true });
ProfileSchema.index({ referredBy: 1 });
ProfileSchema.index({ referredBySignup: 1 });

ProfileSchema.pre("save", async function () {
  if (this.referralCode) return;
  let attempts = 0;
  let code: string;
  do {
    code = generateReferralCode();
    attempts++;
    if (attempts > 10) {
      throw new Error("Unable to generate unique referral code after 10 attempts");
    }
  } while (await mongoose.model("Profile").findOne({ referralCode: code }).lean());
  this.referralCode = code;
});

export const Profile = m<IProfile>("Profile", ProfileSchema);
