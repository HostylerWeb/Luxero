import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IBalance extends Document {
  userId: mongoose.Types.ObjectId;
  available: number;
  pending: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const BalanceSchema = new Schema<IBalance>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "Profile" },
    available: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    currency: { type: String, default: "GBP" },
  },
  { timestamps: true }
);

BalanceSchema.index({ userId: 1 }, { unique: true });

export const Balance = m<IBalance>("Balance", BalanceSchema);
