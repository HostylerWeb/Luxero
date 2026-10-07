import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export type OrderStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type FulfillmentStatus = "pending" | "completed" | "rolled_back";

/** Payment provider that owns this order. Set by the adapter during `createSession`. */
export type OrderProvider = "local" | "stripe" | "paytriot";

export interface IOrder extends Document, ISoftDelete {
  orderNumber: number;
  userId: mongoose.Types.ObjectId;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCodeId?: mongoose.Types.ObjectId;
  referralCode?: string;
  referralBonusTickets: number;
  referralBalanceUsed: number;
  /** True when the order was placed by an anonymous guest user. */
  isGuestCheckout?: boolean;
  /** The real email the customer provided at checkout (for guest orders where the Profile uses a guest fallback). */
  orderEmail?: string;
  /** Provider-agnostic session id. Written by the provider adapter during `createSession`. */
  providerSessionId?: string;
  provider?: OrderProvider;
  paidAt?: Date;
  idempotencyKey?: string;
  competitionIds: string[];
  metadata?: Record<string, unknown>;
  shippingAddress?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: Number, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "completed", "failed", "refunded"],
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "completed", "rolled_back"],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCodeId: { type: Schema.Types.ObjectId, ref: "PromoCode" },
    referralCode: { type: String },
    referralBonusTickets: { type: Number, default: 0 },
    referralBalanceUsed: { type: Number, default: 0 },
    isGuestCheckout: { type: Boolean },
    orderEmail: { type: String },
    providerSessionId: { type: String },
    provider: {
      type: String,
      enum: ["local", "paytriot", "stripe"],
    },
    paidAt: { type: Date },
    idempotencyKey: { type: String, index: true },
    competitionIds: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    shippingAddress: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      postcode: { type: String },
      country: { type: String },
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

OrderSchema.index({ userId: 1, status: 1 });
// Supports the spend-tracking aggregations
// (getUserCreditCardSpendThisMonth, getUserMonthlySpendAllMethods) and the
// getUserCompletedOrderCount helper, all of which filter by userId+status
// with an optional createdAt range. The compound avoids in-memory sorts when
// a date range is applied to a {userId, status} filter.
OrderSchema.index({ userId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paidAt: -1 });
OrderSchema.index({ status: 1, updatedAt: -1 });
OrderSchema.index({ providerSessionId: 1 });
OrderSchema.index({ provider: 1, status: 1 });
OrderSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
OrderSchema.index({ status: 1, createdAt: -1 }, { partialFilterExpression: { deletedAt: null } });
// Order TTL indexes (pending / completed / failed) are applied at startup via
// ensureOrderRetentionIndexes() so retention days are env-configurable.

OrderSchema.plugin(softDeletePlugin);

export const Order = m<IOrder>("Order", OrderSchema) as SoftDeleteModel<IOrder>;
