import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export type NotificationType = "marketing" | "system" | "draw_result" | "promotional" | "reminder";
export type NotificationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export interface INotification extends Document {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  url?: string;
  type: NotificationType;
  status: NotificationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  sentCount: number;
  failedCount: number;
  targetFilter?: {
    userIds?: mongoose.Types.ObjectId[];
    roles?: string[];
    allUsers?: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    icon: { type: String, default: "/icons/icon-192x192.svg" },
    badge: { type: String },
    image: { type: String },
    data: { type: Schema.Types.Mixed },
    url: { type: String, default: "/" },
    type: {
      type: String,
      enum: ["marketing", "system", "draw_result", "promotional", "reminder"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed", "cancelled"],
      default: "draft",
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    targetFilter: {
      userIds: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
      roles: [String],
      allUsers: { type: Boolean, default: false },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledAt: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ scheduledAt: 1 }, { sparse: true });

export const Notification = m<INotification>("Notification", NotificationSchema);
