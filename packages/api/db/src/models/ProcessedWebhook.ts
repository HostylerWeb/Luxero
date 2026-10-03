import { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IProcessedWebhook extends Document {
  provider: string;
  eventId: string;
  processedAt: Date;
}

const ProcessedWebhookSchema = new Schema<IProcessedWebhook>({
  provider: { type: String, required: true },
  eventId: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

ProcessedWebhookSchema.index({ provider: 1, eventId: 1 }, { unique: true });
ProcessedWebhookSchema.index({ processedAt: 1 }, { expireAfterSeconds: 86400 });

export const ProcessedWebhook = m<IProcessedWebhook>("ProcessedWebhook", ProcessedWebhookSchema);
