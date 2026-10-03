import { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IPendingWebhook extends Document {
  provider: string;
  eventId: string;
  orderId: string | null;
  payload: string;
  signature: string | null;
  processedAt: Date | null;
  createdAt: Date;
}

const PendingWebhookSchema = new Schema<IPendingWebhook>(
  {
    provider: { type: String, required: true, index: true },
    eventId: { type: String, required: true },
    orderId: { type: String, default: null, index: true },
    payload: { type: String, required: true },
    signature: { type: String, default: null },
    processedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

PendingWebhookSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
PendingWebhookSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export const PendingWebhook = m<IPendingWebhook>("PendingWebhook", PendingWebhookSchema);
