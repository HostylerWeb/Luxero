import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IConversionPostbackLog extends Document {
  eventType: "signup" | "purchase";
  trackerId: string;
  trackerName: string;
  url: string;
  method: "GET" | "POST";
  status: number | null;
  ok: boolean;
  error: string | null;
  clickId: string | null;
  source: string | null;
  userId: string | null;
  email: string | null;
  amount: number | null;
  payout: number | null;
  currency: string | null;
  orderId: string | null;
  transactionId: string | null;
  createdAt: Date;
}

const ConversionPostbackLogSchema = new Schema<IConversionPostbackLog>(
  {
    eventType: { type: String, enum: ["signup", "purchase"], required: true },
    trackerId: { type: String, required: true },
    trackerName: { type: String, default: "" },
    url: { type: String, required: true },
    method: { type: String, enum: ["GET", "POST"], default: "GET" },
    status: { type: Number, default: null },
    ok: { type: Boolean, default: false },
    error: { type: String, default: null },
    clickId: { type: String, default: null },
    source: { type: String, default: null },
    userId: { type: String, default: null },
    email: { type: String, default: null },
    amount: { type: Number, default: null },
    payout: { type: Number, default: null },
    currency: { type: String, default: null },
    orderId: { type: String, default: null },
    transactionId: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ConversionPostbackLogSchema.index({ createdAt: -1 });
ConversionPostbackLogSchema.index({ source: 1, createdAt: -1 });
ConversionPostbackLogSchema.index({ eventType: 1, createdAt: -1 });
ConversionPostbackLogSchema.index({ status: 1, createdAt: -1 });
ConversionPostbackLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const ConversionPostbackLog: Model<IConversionPostbackLog> =
  (mongoose.models.ConversionPostbackLog as Model<IConversionPostbackLog> | undefined) ??
  mongoose.model<IConversionPostbackLog>("ConversionPostbackLog", ConversionPostbackLogSchema);
