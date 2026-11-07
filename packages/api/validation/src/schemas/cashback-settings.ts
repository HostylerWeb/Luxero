import { z } from "zod";

export const adminCashbackSettingsUpdateSchema = z.object({
  addonEnabled: z.boolean().optional(),
  percent: z.number().min(0).max(100).optional(),
  paymentMethods: z.array(z.enum(["stripe", "paytriot", "site_credit"])).optional(),
  mode: z.enum(["first_order", "first_n_orders", "period", "all"]).optional(),
  firstOrderCount: z.number().int().min(1).max(1000).optional(),
  periodDays: z.number().int().min(1).max(3650).optional(),
});

export type AdminCashbackSettingsUpdateInput = z.infer<typeof adminCashbackSettingsUpdateSchema>;
