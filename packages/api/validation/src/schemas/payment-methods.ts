import { z } from "zod";

export const updatePaymentMethodSchema = z.object({
  enabled: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  environment: z.enum(["sandbox", "live"]).optional(),
  checkoutMode: z.enum(["hosted", "popup"]).optional(),
});

export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
