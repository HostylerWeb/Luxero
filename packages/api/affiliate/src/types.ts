export type AffiliateEventType = "signup" | "purchase";

export interface AffiliateTrackerEvent {
  enabled: boolean;
  urlTemplate: string;
  method: "GET" | "POST";
  payoutOverride?: number | null;
  extraParams?: string | Record<string, string>;
}

export interface AffiliateTracker {
  id: string;
  name: string;
  enabled: boolean;
  events: Partial<Record<AffiliateEventType, AffiliateTrackerEvent>>;
}

export interface GoogleAnalyticsConfig {
  measurementId: string;
  apiSecret?: string;
  enabled: boolean;
  events: Partial<Record<AffiliateEventType, boolean>>;
}

export interface FacebookPixelConfig {
  pixelId: string;
  accessToken: string;
  enabled: boolean;
  events: Partial<Record<AffiliateEventType, boolean>>;
}

export interface ConversionSettingsData {
  _id: "conversion_settings";
  enabled: boolean;
  defaultPayouts: Record<AffiliateEventType, number>;
  trackers: AffiliateTracker[];
  googleAnalytics?: GoogleAnalyticsConfig;
  facebookPixel?: FacebookPixelConfig;
  updatedAt?: Date;
}

export interface AffiliateConversionData {
  clickId: string | null;
  userId: string;
  email?: string;
  source?: string;
  amount?: number;
  currency?: string;
  orderId?: string;
  transactionId?: string;
  pubId?: string;
  zone?: string;
  campaignId?: string;
  device?: string;
  country?: string;
  creativeId?: string;
}
