import { Schema } from "mongoose";
import { m } from "../db";

const ReferralTierSubSchema = new Schema(
  {
    threshold: { type: Number, required: true },
    tickets: { type: Number, required: true },
    label: { type: String },
    multiplierOverride: { type: Number, default: null },
    lifetimeTicketCap: { type: Number, default: null },
  },
  { _id: false }
);

const ReferralSettingsSchema = new Schema(
  {
    _id: { type: String, required: true, enum: ["referral_settings"] },

    tiers: {
      type: [ReferralTierSubSchema],
      default: [
        { threshold: 5, tickets: 2 },
        { threshold: 10, tickets: 5 },
        { threshold: 15, tickets: 10 },
      ],
    },

    calculusMethod: {
      type: String,
      enum: ["net", "gross"],
      default: "gross",
    },

    activityWindowDays: { type: Number, default: 30 },
    activityWindowMode: {
      type: String,
      enum: ["rolling", "fixed_day_of_month"],
      default: "rolling",
    },
    monthlyCutoffDay: { type: Number, default: 25 },

    gracePeriod: {
      enabled: { type: Boolean, default: false },
      days: { type: Number, default: 3 },
      countsToward: { type: String, enum: ["current_tier", "next_tier"], default: "current_tier" },
    },
    minFirstOrderSpend: { type: Number, default: 1 },
    refereeReward: {
      enabled: { type: Boolean, default: true },
      discountPercent: { type: Number, default: 20 },
      minOrderValue: { type: Number, default: 0 },
    },
    distribution: {
      mode: { type: String, enum: ["wallet", "all_competitions"], default: "wallet" },
    },
    guardrails: {
      maxReferralsPerRefereePerDay: { type: Number, default: 0 },
      blockSelfReferral: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
    },
  },
  { timestamps: false, _id: false, versionKey: false }
);

export interface IReferralSettings {
  _id: "referral_settings";
  tiers: Array<{
    threshold: number;
    tickets: number;
    label?: string;
    multiplierOverride?: number | null;
    lifetimeTicketCap?: number | null;
  }>;
  calculusMethod: "net" | "gross";
  activityWindowDays: number;
  activityWindowMode: "rolling" | "fixed_day_of_month";
  monthlyCutoffDay: number;
  gracePeriod: { enabled: boolean; days: number; countsToward: "current_tier" | "next_tier" };
  minFirstOrderSpend: number;
  refereeReward: { enabled: boolean; discountPercent: number; minOrderValue: number };
  distribution: { mode: "wallet" | "all_competitions" };
  guardrails: {
    maxReferralsPerRefereePerDay: number;
    blockSelfReferral: boolean;
    requireEmailVerification: boolean;
  };
}

export const ReferralSettings = m<IReferralSettings>("ReferralSettings", ReferralSettingsSchema);
