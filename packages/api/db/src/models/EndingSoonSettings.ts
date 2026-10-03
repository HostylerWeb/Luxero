import { Schema } from "mongoose";
import { m } from "../db";

const EndingSoonSettingsSchema = new Schema(
  {
    _id: { type: String, required: true, enum: ["ending_soon_settings"] },
    endingSoonDaysThreshold: { type: Number, default: 7 },
    endingSoonTicketsThreshold: { type: Number, default: 20 },
    endingSoonCombineMode: { type: String, enum: ["and", "or"], default: "or" },
    endingSoonTimeEnabled: { type: Boolean, default: true },
    endingSoonTicketsEnabled: { type: Boolean, default: true },
    endingSoonTicketsMetric: { type: String, enum: ["remaining", "sold"], default: "remaining" },
  },
  { timestamps: false, _id: false }
);

export interface IEndingSoonSettings {
  _id: "ending_soon_settings";
  endingSoonDaysThreshold: number;
  endingSoonTicketsThreshold: number;
  endingSoonCombineMode: "and" | "or";
  endingSoonTimeEnabled: boolean;
  endingSoonTicketsEnabled: boolean;
  endingSoonTicketsMetric: "remaining" | "sold";
}

export const EndingSoonSettings = m<IEndingSoonSettings>(
  "EndingSoonSettings",
  EndingSoonSettingsSchema
);
