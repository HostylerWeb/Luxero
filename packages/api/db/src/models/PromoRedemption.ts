import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IPromoRedemption extends Document {
  promoCodeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PromoRedemptionSchema = new Schema<IPromoRedemption>(
  {
    promoCodeId: { type: Schema.Types.ObjectId, ref: "PromoCode", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PromoRedemptionSchema.index({ promoCodeId: 1, userId: 1 });
PromoRedemptionSchema.index({ userId: 1, createdAt: -1 });
PromoRedemptionSchema.index({ orderId: 1 }, { sparse: true });
PromoRedemptionSchema.index(
  { promoCodeId: 1, userId: 1, orderId: 1 },
  { unique: true, sparse: true }
);

export const PromoRedemption = m<IPromoRedemption>("PromoRedemption", PromoRedemptionSchema);
