import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IPushSubscription extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: mongoose.Types.ObjectId;
  userAgent?: string;
  active: boolean;
  preferences?: {
    marketing: boolean;
    system: boolean;
    draw_result: boolean;
    promotional: boolean;
    reminder: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: { type: Schema.Types.ObjectId, ref: "Profile" },
    userAgent: { type: String },
    active: { type: Boolean, default: true },
    preferences: {
      marketing: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      draw_result: { type: Boolean, default: true },
      promotional: { type: Boolean, default: true },
      reminder: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const PushSubscription = m<IPushSubscription>("PushSubscription", PushSubscriptionSchema);
