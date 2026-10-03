import { z } from "zod";

export const createPromoCodeSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((v) => v.trim().toUpperCase()),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.number().positive(),
    minOrderValue: z.number().nonnegative().optional(),
    maxUses: z.number().int().nonnegative().optional(),
    maxUsesPerUser: z.number().int().positive().optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    isActive: z.boolean().optional().default(true),
    guestEligible: z.boolean().optional(),
    competitionId: z.string().optional(),
    minTickets: z.number().int().positive().optional(),
  })
  .refine(
    (v) => {
      if (v.validFrom && v.validUntil) {
        return v.validUntil > v.validFrom;
      }
      return true;
    },
    { path: ["validUntil"], message: "Expiry must be after the start date" }
  );

export const updatePromoCodeSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((v) => v.trim().toUpperCase())
      .optional(),
    discountType: z.enum(["percentage", "fixed"]).optional(),
    discountValue: z.number().positive().optional(),
    minOrderValue: z.number().nonnegative().optional(),
    maxUses: z.number().int().nonnegative().optional(),
    maxUsesPerUser: z.number().int().positive().optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
    guestEligible: z.boolean().optional(),
    competitionId: z.string().optional(),
    minTickets: z.number().int().positive().optional(),
  })
  .refine(
    (v) => {
      if (v.validFrom && v.validUntil) {
        return v.validUntil > v.validFrom;
      }
      return true;
    },
    { path: ["validUntil"], message: "Expiry must be after the start date" }
  );

export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>;
export type UpdatePromoCodeInput = z.infer<typeof updatePromoCodeSchema>;
