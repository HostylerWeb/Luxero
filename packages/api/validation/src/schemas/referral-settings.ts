import { z } from "zod";

const tierSchema = z.object({
  threshold: z.number().int().min(0),
  tickets: z.number().int().min(0),
  label: z.string().optional(),
  multiplierOverride: z.number().min(0).nullable().optional(),
  lifetimeTicketCap: z.number().int().min(0).nullable().optional(),
});

const gracePeriodSchema = z.object({
  enabled: z.boolean(),
  days: z.number().int().min(1).max(28),
  countsToward: z.enum(["current_tier", "next_tier"]),
});

const refereeRewardSchema = z.object({
  enabled: z.boolean(),
  discountPercent: z.number().min(0).max(100),
  minOrderValue: z.number().min(0),
});

const distributionSchema = z.object({
  mode: z.enum(["wallet", "all_competitions"]),
});

const guardrailsSchema = z.object({
  maxReferralsPerRefereePerDay: z.number().int().min(0),
  blockSelfReferral: z.boolean(),
  requireEmailVerification: z.boolean(),
});

export const referralSettingsUpdateSchema = z.object({
  tiers: z.array(tierSchema).optional(),
  calculusMethod: z.enum(["net", "gross"]).optional(),
  activityWindowDays: z.number().int().min(1).optional(),
  activityWindowMode: z.enum(["rolling", "fixed_day_of_month"]).optional(),
  monthlyCutoffDay: z.number().int().min(1).max(28).optional(),
  gracePeriod: gracePeriodSchema.optional(),
  minFirstOrderSpend: z.number().min(0).optional(),
  refereeReward: refereeRewardSchema.optional(),
  distribution: distributionSchema.optional(),
  guardrails: guardrailsSchema.optional(),
});

export type ReferralSettingsUpdateInput = z.infer<typeof referralSettingsUpdateSchema>;
