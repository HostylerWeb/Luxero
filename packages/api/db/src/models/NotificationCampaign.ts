import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export type CampaignStatus = "draft" | "active" | "completed" | "cancelled";

export interface INotificationCampaign extends Document {
  name: string;
  description?: string;
  notifications: mongoose.Types.ObjectId[];
  status: CampaignStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationCampaignSchema = new Schema<INotificationCampaign>(
  {
    name: { type: String, required: true },
    description: { type: String },
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  },
  { timestamps: true }
);

NotificationCampaignSchema.index({ status: 1, createdAt: -1 });
NotificationCampaignSchema.index({ createdBy: 1 });

export const NotificationCampaign = m<INotificationCampaign>(
  "NotificationCampaign",
  NotificationCampaignSchema
);
