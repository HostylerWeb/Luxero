import { z } from "zod";

const affiliateTrackerEventSchema = z.object({
  enabled: z.boolean(),
  urlTemplate: z.string().min(1, "URL template is required"),
  method: z.enum(["GET", "POST"]),
  payoutOverride: z.number().min(0).optional().nullable().catch(null),
  extraParams: z
    .union([z.string(), z.record(z.string(), z.string())])
    .optional()
    .catch(undefined),
});

const affiliateTrackerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Tracker name is required"),
  enabled: z.boolean(),
  events: z.object({
    signup: affiliateTrackerEventSchema.optional().nullable(),
    purchase: affiliateTrackerEventSchema.optional().nullable(),
  }),
});

const googleAnalyticsConfigSchema = z.object({
  measurementId: z.string(),
  apiSecret: z.string(),
  enabled: z.boolean(),
  events: z.object({
    signup: z.boolean(),
    purchase: z.boolean(),
  }),
});

const facebookPixelConfigSchema = z.object({
  pixelId: z.string(),
  accessToken: z.string(),
  enabled: z.boolean(),
  events: z.object({
    signup: z.boolean(),
    purchase: z.boolean(),
  }),
});

export const conversionSettingsSchema = z.object({
  enabled: z.boolean(),
  defaultPayouts: z.object({
    signup: z.number().min(0),
    purchase: z.number().min(0),
  }),
  trackers: z.array(affiliateTrackerSchema),
  googleAnalytics: googleAnalyticsConfigSchema.optional(),
  facebookPixel: facebookPixelConfigSchema.optional(),
});

export type ConversionSettingsInput = z.infer<typeof conversionSettingsSchema>;
