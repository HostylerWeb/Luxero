import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";

export type ShopOrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type ShopOrderProvider = "local" | "stripe" | "paytriot";

export interface IShopOrderLineItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  productSnapshot: {
    name: string;
    sku: string;
    price: number;
    image?: string;
    variantName?: string;
  };
  quantity: number;
  unitPrice: number;
}

export interface IShopOrderShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface IShopOrder extends Document {
  orderNumber: number;
  userId: Types.ObjectId;
  status: ShopOrderStatus;
  isGuestCheckout?: boolean;
  items: IShopOrderLineItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: string;
  provider?: ShopOrderProvider;
  providerSessionId?: string;
  paidAt?: Date;
  shippingAddress: IShopOrderShippingAddress;
  email: string;
  idempotencyKey?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ShopOrderLineItemSchema = new Schema<IShopOrderLineItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "ShopProduct", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ShopProductVariant" },
    productSnapshot: {
      name: { type: String, required: true },
      sku: { type: String, required: true },
      price: { type: Number, required: true },
      image: String,
      variantName: String,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const ShopOrderShippingAddressSchema = new Schema<IShopOrderShippingAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const ShopOrderSchema = new Schema<IShopOrder>(
  {
    orderNumber: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    isGuestCheckout: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    items: { type: [ShopOrderLineItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "GBP" },
    provider: {
      type: String,
      enum: ["local", "stripe", "paytriot"],
    },
    providerSessionId: String,
    paidAt: Date,
    shippingAddress: { type: ShopOrderShippingAddressSchema, required: true },
    email: { type: String, required: true },
    idempotencyKey: String,
    notes: String,
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ShopOrderSchema.index({ orderNumber: 1 }, { unique: true });
ShopOrderSchema.index({ userId: 1, status: 1 });
ShopOrderSchema.index({ userId: 1, createdAt: -1 });
ShopOrderSchema.index({ providerSessionId: 1 }, { sparse: true });
ShopOrderSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });
ShopOrderSchema.index({ status: 1, createdAt: -1 });

export const ShopOrder = m<IShopOrder>("ShopOrder", ShopOrderSchema);
