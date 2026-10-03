import { withMongoTransactionOptional } from "@luxero/api-infra/mongo-capabilities";
import type { PaymentMethodCredentials } from "@luxero/types";
import mongoose, { Schema } from "mongoose";

export type PaymentProvider = "local" | "stripe" | "paytriot";

/**
 * Per-provider credentials. Mongoose storage is `Mixed` (any shape), but the
 * TS interface narrows to the per-provider variant from `@luxero/types`. Each
 * `ensure*` / admin route is responsible for writing only the fields its
 * provider uses.
 */
export interface IPaymentMethod {
  provider: PaymentProvider;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  environment: "sandbox" | "live";
  checkoutMode: "hosted" | "popup";
  sandboxCredentials: PaymentMethodCredentials;
  liveCredentials: PaymentMethodCredentials;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    provider: {
      type: String,
      required: true,
      unique: true,
      enum: ["local", "paytriot", "stripe"],
    },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    environment: {
      type: String,
      default: "sandbox",
      enum: ["sandbox", "live"],
    },
    checkoutMode: {
      type: String,
      default: "hosted",
      enum: ["hosted", "popup"],
    },
    sandboxCredentials: {
      type: Schema.Types.Mixed,
      default: {},
    },
    liveCredentials: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const PaymentMethod: mongoose.Model<IPaymentMethod> =
  mongoose.models.PaymentMethod != null
    ? (mongoose.models.PaymentMethod as mongoose.Model<IPaymentMethod>)
    : mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);

export async function setDefaultPaymentMethod(provider: string) {
  await withMongoTransactionOptional(
    async (session) => {
      const sessionOpts = session ? { session } : {};
      await PaymentMethod.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } },
        sessionOpts
      );
      await PaymentMethod.updateOne(
        { provider: provider as PaymentProvider },
        { $set: { isDefault: true } },
        sessionOpts
      );
    },
    { logPrefix: "PaymentMethod" }
  );
}
