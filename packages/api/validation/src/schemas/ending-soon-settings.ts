import { z } from "zod";

export const endingSoonSettingsUpdateSchema = z
  .object({
    endingSoonDaysThreshold: z.number().int().min(1),
    endingSoonTicketsThreshold: z.number().min(0).max(100),
    endingSoonCombineMode: z.enum(["and", "or"]),
    endingSoonTimeEnabled: z.boolean(),
    endingSoonTicketsEnabled: z.boolean(),
    endingSoonTicketsMetric: z.enum(["remaining", "sold"]),
  })
  .refine((data) => data.endingSoonTimeEnabled || data.endingSoonTicketsEnabled, {
    message: "At least one condition must be enabled",
    path: ["endingSoonTimeEnabled"],
  })
  .refine((data) => !data.endingSoonTimeEnabled || data.endingSoonDaysThreshold >= 1, {
    message: "Days threshold must be at least 1 when the time condition is enabled",
    path: ["endingSoonDaysThreshold"],
  })
  .refine(
    (data) =>
      !data.endingSoonTicketsEnabled ||
      (data.endingSoonTicketsThreshold >= 0 && data.endingSoonTicketsThreshold <= 100),
    {
      message: "Tickets threshold must be between 0 and 100 when the tickets condition is enabled",
      path: ["endingSoonTicketsThreshold"],
    }
  );

export type EndingSoonSettingsUpdateInput = z.infer<typeof endingSoonSettingsUpdateSchema>;
