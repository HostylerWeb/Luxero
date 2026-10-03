import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IReferralPurchase extends Document, ISoftDelete {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  purchaseAmount: number;
  purchasedAt: Date;
  createdAt: Date;
  referrerEmail: string;
  referredEmail: string;
  commissionAmount: number;
  ticketsAwarded: number;
  ticketsAwardedAt?: Date;
  tierAtAward?: number;
  signupReferrerId?: mongoose.Types.ObjectId;
  deferredUntilNextWindow?: boolean;
  tierReachedAt?: Date;
}

const ReferralPurchaseSchema = new Schema<IReferralPurchase>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    purchaseAmount: { type: Number, default: 0 },
    purchasedAt: { type: Date, default: Date.now },
    referrerEmail: { type: String, required: true },
    referredEmail: { type: String, required: true },
    commissionAmount: { type: Number, default: 0 },
    ticketsAwarded: { type: Number, default: 0 },
    ticketsAwardedAt: { type: Date },
    tierAtAward: { type: Number },
    signupReferrerId: { type: Schema.Types.ObjectId, ref: "Profile" },
    deferredUntilNextWindow: { type: Boolean, default: false },
    tierReachedAt: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

ReferralPurchaseSchema.index({ referrerId: 1, purchasedAt: 1 });
ReferralPurchaseSchema.index({ referredUserId: 1 });
ReferralPurchaseSchema.index({ referredUserId: 1, purchasedAt: 1 });
ReferralPurchaseSchema.index({ orderId: 1 }, { unique: true });

ReferralPurchaseSchema.plugin(softDeletePlugin);

export const ReferralPurchase = m<IReferralPurchase>(
  "ReferralPurchase",
  ReferralPurchaseSchema
) as SoftDeleteModel<IReferralPurchase>;
