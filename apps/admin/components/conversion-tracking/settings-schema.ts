import { z } from "zod";

export const EVENT_LABELS: Record<string, string> = {
  signup: "Sign Up",
  purchase: "Purchase",
};

export const EVENT_KEYS = ["signup", "purchase"] as const;

export interface TrafficSource {
  code: string;
  name: string;
  landingParamHint: string;
}

export const TRAFFIC_SOURCES: TrafficSource[] = [
  { code: "at", name: "Adsterra", landingParamHint: "?source=at&clickid=##SUB_ID_SHORT(action)##" },
  { code: "fb", name: "Meta / Facebook", landingParamHint: "?source=fb&fbclid={fbclid}" },
  { code: "tt", name: "TikTok", landingParamHint: "?source=tt&ttclid={ttclid}" },
  { code: "gg", name: "Google Ads", landingParamHint: "?source=gg&gclid={gclid}" },
];

export function getTrafficSourceLabel(code: string | null | undefined): string {
  if (!code) return "Direct / unknown";
  return TRAFFIC_SOURCES.find((s) => s.code === code)?.name ?? code;
}

export const eventSchema = z.object({
  enabled: z.boolean(),
  urlTemplate: z.string().min(1, "URL template is required"),
  method: z.enum(["GET", "POST"]),
  payoutOverride: z.coerce.number().min(0).optional().nullable(),
  extraParams: z.string().optional(),
});

export const trackerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  enabled: z.boolean(),
  events: z.object({
    signup: eventSchema.optional().nullable(),
    purchase: eventSchema.optional().nullable(),
  }),
});

export const googleAnalyticsSchema = z.object({
  measurementId: z.string(),
  apiSecret: z.string(),
  enabled: z.boolean(),
  events: z.object({
    signup: z.boolean(),
    purchase: z.boolean(),
  }),
});

export const facebookPixelSchema = z.object({
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
    signup: z.coerce.number().min(0),
    purchase: z.coerce.number().min(0),
  }),
  trackers: z.array(trackerSchema),
  googleAnalytics: googleAnalyticsSchema.optional().default({
    measurementId: "",
    apiSecret: "",
    enabled: false,
    events: { signup: false, purchase: false },
  }),
  facebookPixel: facebookPixelSchema.optional().default({
    pixelId: "",
    accessToken: "",
    enabled: false,
    events: { signup: false, purchase: false },
  }),
});

export type ConversionSettingsFormValues = z.infer<typeof conversionSettingsSchema>;

export const DEFAULTS: ConversionSettingsFormValues = {
  enabled: false,
  defaultPayouts: { signup: 0, purchase: 0 },
  trackers: [],
  googleAnalytics: {
    measurementId: "G-2WZB820JXC",
    apiSecret: "",
    enabled: false,
    events: { signup: false, purchase: false },
  },
  facebookPixel: {
    pixelId: "",
    accessToken: "",
    enabled: false,
    events: { signup: false, purchase: false },
  },
};

export function emptyEvent(): z.infer<typeof eventSchema> {
  return { enabled: true, urlTemplate: "", method: "GET", payoutOverride: null, extraParams: "" };
}

export function newTracker(): z.infer<typeof trackerSchema> {
  return {
    id: crypto.randomUUID(),
    name: "",
    enabled: true,
    events: { signup: null, purchase: null },
  };
}

export function mergeWithDefaults(
  dbSettings: Partial<ConversionSettingsFormValues>
): ConversionSettingsFormValues {
  return {
    ...DEFAULTS,
    ...dbSettings,
    googleAnalytics: { ...DEFAULTS.googleAnalytics, ...(dbSettings.googleAnalytics ?? {}) },
    facebookPixel: { ...DEFAULTS.facebookPixel, ...(dbSettings.facebookPixel ?? {}) },
    defaultPayouts: { ...DEFAULTS.defaultPayouts, ...(dbSettings.defaultPayouts ?? {}) },
    trackers: dbSettings.trackers ?? [],
  };
}
