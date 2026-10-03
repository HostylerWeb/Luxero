import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface ICartItem {
  competitionId: mongoose.Types.ObjectId;
  quantity: number;
  answerIndex: number;
  maxTicketsPerUser: number;
}

export interface ICartWalletTicket {
  competitionId: mongoose.Types.ObjectId | string;
  quantity: number;
}

export interface ICart extends Document, ISoftDelete {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  walletTicketsByCompetition?: ICartWalletTicket[];
  promoCode?: string;
  promoCodeId?: mongoose.Types.ObjectId;
  referralCode?: string;
  referralDiscountAmount?: number;
  referralDiscountPercent?: number;
  discountAmount: number;
  discountType: "percentage" | "fixed" | null;
  promoDiscountPercent?: number;
  promoCodeGuestEligible?: boolean;
  /** Cached marker for the last time the cart was finalised (sanitize + auto-adjust + wallet-reclamp). */
  lastFinalizedAt?: Date;
  /** Timestamp of the last user activity on this cart (used for abandoned-cart cleanup). */
  lastActivityAt?: Date;
  /** Monotonically increasing version counter incremented on every cart mutation (add/remove/update/discount/wallet). */
  cartVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    quantity: { type: Number, required: true, min: 1 },
    answerIndex: { type: Number, default: 0 },
    maxTicketsPerUser: { type: Number, default: 10 },
  },
  { _id: false }
);

const CartWalletTicketSchema = new Schema<ICartWalletTicket>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    items: { type: [CartItemSchema], default: [] },
    walletTicketsByCompetition: { type: [CartWalletTicketSchema], default: [] },
    promoCode: { type: String },
    promoCodeId: { type: Schema.Types.ObjectId, ref: "PromoCode" },
    referralCode: { type: String },
    referralDiscountAmount: { type: Number },
    referralDiscountPercent: { type: Number },
    discountAmount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["percentage", "fixed", null], default: null },
    promoDiscountPercent: { type: Number },
    promoCodeGuestEligible: { type: Boolean },
    lastFinalizedAt: { type: Date },
    lastActivityAt: { type: Date, default: () => Date.now() },
    cartVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CartSchema.index({ userId: 1 }, { unique: true });
CartSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: 2592000 });
CartSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { "items.0": { $exists: false } },
  }
);

CartSchema.plugin(softDeletePlugin);

export const Cart = m<ICart>("Cart", CartSchema) as SoftDeleteModel<ICart>;
