import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface ISelfExclusionOverrideRequest extends Document {
  userId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  userReason: string;
  processedBy: mongoose.Types.ObjectId | null;
  adminNote: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

const SelfExclusionOverrideRequestSchema = new Schema<ISelfExclusionOverrideRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    userReason: { type: String, required: true, minlength: 10 },
    processedBy: { type: Schema.Types.ObjectId, ref: "Profile", default: null },
    adminNote: { type: String, default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

SelfExclusionOverrideRequestSchema.index({ userId: 1, status: 1 });
SelfExclusionOverrideRequestSchema.index({ status: 1, createdAt: -1 });

export const SelfExclusionOverrideRequest = m<ISelfExclusionOverrideRequest>(
  "SelfExclusionOverrideRequest",
  SelfExclusionOverrideRequestSchema
);
