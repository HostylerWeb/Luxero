import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";

export interface IShopCartItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  priceAtAdd: number;
}

export interface IShopCart extends Document {
  userId: Types.ObjectId;
  items: IShopCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ShopCartItemSchema = new Schema<IShopCartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "ShopProduct", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ShopProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
    priceAtAdd: { type: Number, required: true },
  },
  { _id: false }
);

const ShopCartSchema = new Schema<IShopCart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, unique: true },
    items: { type: [ShopCartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const ShopCart = m<IShopCart>("ShopCart", ShopCartSchema);
