import { type Document, Schema, Types } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export type DiscountType = "percentage" | "fixed";

export interface IPromoCode extends Document, ISoftDelete {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  currentUses: number;
  maxUsesPerUser: number;
  usedBy: string[];
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
  guestEligible: boolean;
  competitionId?: Types.ObjectId;
  minTickets?: number;
  createdAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number },
    maxUses: { type: Number },
    currentUses: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    usedBy: { type: [String], default: [] },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
    guestEligible: { type: Boolean, default: true },
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition" },
    minTickets: { type: Number },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

PromoCodeSchema.index({ isActive: 1 });
PromoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
PromoCodeSchema.index({ code: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
PromoCodeSchema.index({ competitionId: 1 });

PromoCodeSchema.plugin(softDeletePlugin);

export const PromoCode = m<IPromoCode>("PromoCode", PromoCodeSchema) as SoftDeleteModel<IPromoCode>;
