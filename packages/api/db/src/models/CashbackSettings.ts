import { Schema } from "mongoose";
import { m } from "../db";

export interface ICashbackSettings {
  _id: "cashback_settings";
  addonEnabled: boolean;
  percent: number;
  paymentMethods: Array<"stripe" | "paytriot" | "site_credit">;
  mode: "first_order" | "first_n_orders" | "period" | "all";
  firstOrderCount: number;
  periodDays: number;
}

const CashbackSettingsSchema = new Schema<ICashbackSettings>(
  {
    _id: { type: String, required: true, enum: ["cashback_settings"] },
    addonEnabled: { type: Boolean, default: false },
    percent: { type: Number, default: 0, min: 0, max: 100 },
    paymentMethods: {
      type: [String],
      enum: ["stripe", "paytriot", "site_credit"],
      default: [],
    },
    mode: {
      type: String,
      enum: ["first_order", "first_n_orders", "period", "all"],
      default: "first_order",
    },
    firstOrderCount: { type: Number, default: 1, min: 1 },
    periodDays: { type: Number, default: 30, min: 1 },
  },
  { timestamps: false, versionKey: false }
);

export const DEFAULT_CASHBACK_SETTINGS: ICashbackSettings = {
  _id: "cashback_settings",
  addonEnabled: false,
  percent: 0,
  paymentMethods: [],
  mode: "first_order",
  firstOrderCount: 1,
  periodDays: 30,
};

export const CashbackSettings = m<ICashbackSettings>("CashbackSettings", CashbackSettingsSchema);
