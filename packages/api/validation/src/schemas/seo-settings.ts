import { z } from "zod";

export const seoSettingsSchema = z.object({
  defaultOgImageUrl: z.string().url().optional().or(z.literal("")),
  referralOgImageUrl: z.string().url().optional().or(z.literal("")),
  defaultTitle: z.string().min(1, "Default title is required"),
  defaultDescription: z.string().min(1, "Default description is required"),
});

export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;
