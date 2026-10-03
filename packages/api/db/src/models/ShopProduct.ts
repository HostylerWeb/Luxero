import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IShopProductOptionValue {
  value: string;
  metadata?: Record<string, unknown>;
}

export interface IShopProductOption {
  name: string;
  values: IShopProductOptionValue[];
}

export interface IShopProduct extends Document, ISoftDelete {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  inventory: number;
  inventoryTracked: boolean;
  categoryId?: Types.ObjectId;
  images: string[];
  options: IShopProductOption[];
  lowStockThreshold?: number;
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ShopProductOptionValueSchema = new Schema<IShopProductOptionValue>(
  {
    value: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ShopProductOptionSchema = new Schema<IShopProductOption>(
  {
    name: { type: String, required: true },
    values: { type: [ShopProductOptionValueSchema], default: [] },
  },
  { _id: false }
);

const ShopProductSchema = new Schema<IShopProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true, default: "" },
    shortDescription: String,
    price: { type: Number, required: true },
    compareAtPrice: Number,
    sku: { type: String, required: true },
    inventory: { type: Number, required: true, default: 0 },
    inventoryTracked: { type: Boolean, default: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "ShopCategory" },
    images: { type: [String], default: [] },
    options: { type: [ShopProductOptionSchema], default: [] },
    lowStockThreshold: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ShopProductSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);
ShopProductSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
ShopProductSchema.index({ isActive: 1, categoryId: 1 });
ShopProductSchema.index({ isActive: 1, sortOrder: -1 });
ShopProductSchema.index({ name: "text", description: "text" });

ShopProductSchema.plugin(softDeletePlugin);

export const ShopProduct = m<IShopProduct>(
  "ShopProduct",
  ShopProductSchema
) as SoftDeleteModel<IShopProduct>;
