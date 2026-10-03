import { z } from "zod";

export const userReferralReassignSchema = z
  .object({
    userId: z.string().min(1),
    referralCode: z.string().min(1).optional(),
    action: z.enum(["clear"]).optional(),
  })
  .refine((data) => data.referralCode || data.action, {
    message: "Either referralCode or action is required",
  });

export type UserReferralReassignInput = z.infer<typeof userReferralReassignSchema>;
