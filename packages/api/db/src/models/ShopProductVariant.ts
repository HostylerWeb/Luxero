import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IShopProductVariantOptionValue {
  optionName: string;
  value: string;
}

export interface IShopProductVariant extends Document, ISoftDelete {
  productId: Types.ObjectId;
  name: string;
  sku: string;
  price?: number;
  compareAtPrice?: number;
  inventory: number;
  inventoryTracked: boolean;
  images: string[];
  optionValues: IShopProductVariantOptionValue[];
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ShopProductVariantOptionValueSchema = new Schema<IShopProductVariantOptionValue>(
  {
    optionName: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ShopProductVariantSchema = new Schema<IShopProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "ShopProduct", required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    price: Number,
    compareAtPrice: Number,
    inventory: { type: Number, required: true, default: 0 },
    inventoryTracked: { type: Boolean, default: true },
    images: { type: [String], default: [] },
    optionValues: { type: [ShopProductVariantOptionValueSchema], default: [] },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ShopProductVariantSchema.index(
  { sku: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);
ShopProductVariantSchema.index({ productId: 1, isActive: 1 });
ShopProductVariantSchema.index({ productId: 1, sortOrder: 1 });

ShopProductVariantSchema.plugin(softDeletePlugin);

export const ShopProductVariant = m<IShopProductVariant>(
  "ShopProductVariant",
  ShopProductVariantSchema
) as SoftDeleteModel<IShopProductVariant>;
