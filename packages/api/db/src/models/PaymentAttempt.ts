import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export type PaymentAttemptStatus = "captured" | "declined" | "errored";

export interface IPaymentAttempt extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: string;
  providerSessionId?: string;
  providerTransactionId?: string;
  transactionUnique?: string;
  attemptNumber: number;
  status: PaymentAttemptStatus;
  responseCode: number;
  responseMessage?: string;
  category?: string;
  wasCharged: boolean;
  errorTitle?: string;
  errorUserMessage?: string;
  errorRecommendedAction?: string;
  rawBody?: string;
  receivedAt: Date;
  finalizedAt?: Date;
  fulfillmentFailed: boolean;
  fulfillmentErrorMessage?: string;
}

const PaymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    provider: { type: String, required: true },
    providerSessionId: { type: String },
    providerTransactionId: { type: String },
    transactionUnique: { type: String },
    attemptNumber: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["captured", "declined", "errored"],
    },
    responseCode: { type: Number, required: true },
    responseMessage: { type: String },
    category: { type: String },
    wasCharged: { type: Boolean, required: true },
    errorTitle: { type: String },
    errorUserMessage: { type: String },
    errorRecommendedAction: { type: String },
    rawBody: { type: String, maxlength: 2000 },
    receivedAt: { type: Date, default: Date.now },
    finalizedAt: { type: Date },
    fulfillmentFailed: { type: Boolean, default: false },
    fulfillmentErrorMessage: { type: String },
  },
  { timestamps: false }
);

// Lookup by order ID + attempt number (descending for latest-first)
PaymentAttemptSchema.index({ orderId: 1, attemptNumber: -1 });
// Lookup by provider session ID (webhook path)
PaymentAttemptSchema.index({ providerSessionId: 1 });
// Lookup by transaction unique (retry / idempotency)
PaymentAttemptSchema.index({ transactionUnique: 1 });
// Lookup by user
PaymentAttemptSchema.index({ userId: 1, status: 1 });
// TTL: retain attempts for chargeback/dispute forensics (~18 months)
PaymentAttemptSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 548 * 24 * 60 * 60 });

export const PaymentAttempt = m<IPaymentAttempt>("PaymentAttempt", PaymentAttemptSchema);
