import { Schema } from "mongoose";
import { m } from "../db";

const AffiliateTrackerEventSchema = new Schema(
  {
    enabled: { type: Boolean, required: true },
    urlTemplate: { type: String, required: true },
    method: { type: String, enum: ["GET", "POST"], default: "GET" },
    payoutOverride: { type: Number, default: null },
    extraParams: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const AffiliateTrackerSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    events: {
      signup: { type: AffiliateTrackerEventSchema, default: null },
      purchase: { type: AffiliateTrackerEventSchema, default: null },
    },
  },
  { _id: false }
);

const GoogleAnalyticsConfigSchema = new Schema(
  {
    measurementId: { type: String, default: "" },
    apiSecret: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    events: {
      signup: { type: Boolean, default: false },
      purchase: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const FacebookPixelConfigSchema = new Schema(
  {
    pixelId: { type: String, default: "" },
    accessToken: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
    events: {
      signup: { type: Boolean, default: false },
      purchase: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const ConversionSettingsSchema = new Schema(
  {
    _id: { type: String, required: true, enum: ["conversion_settings"] },
    enabled: { type: Boolean, default: false },
    defaultPayouts: {
      signup: { type: Number, default: 0 },
      purchase: { type: Number, default: 0 },
    },
    trackers: { type: [AffiliateTrackerSchema], default: [] },
    googleAnalytics: { type: GoogleAnalyticsConfigSchema, default: () => ({}) },
    facebookPixel: { type: FacebookPixelConfigSchema, default: () => ({}) },
  },
  { timestamps: false, _id: false }
);

export interface IFacebookPixelConfig {
  pixelId: string;
  accessToken?: string;
  enabled: boolean;
  events: Record<string, boolean>;
}

export interface IConversionSettings {
  _id: "conversion_settings";
  enabled: boolean;
  defaultPayouts: Record<string, number>;
  trackers: Array<{
    id: string;
    name: string;
    enabled: boolean;
    events: Record<
      string,
      {
        enabled: boolean;
        urlTemplate: string;
        method: "GET" | "POST";
        payoutOverride?: number | null;
        extraParams?: Record<string, string>;
      } | null
    >;
  }>;
  googleAnalytics?: {
    measurementId: string;
    apiSecret?: string;
    enabled: boolean;
    events: Record<string, boolean>;
  };
  facebookPixel?: IFacebookPixelConfig;
  updatedAt?: Date;
}

export const ConversionSettings = m<IConversionSettings>(
  "ConversionSettings",
  ConversionSettingsSchema
);
