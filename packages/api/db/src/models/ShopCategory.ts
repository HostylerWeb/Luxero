import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface IShopCategory extends Document, ISoftDelete {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopCategorySchema = new Schema<IShopCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    image: String,
    parentId: { type: Schema.Types.ObjectId, ref: "ShopCategory" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ShopCategorySchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);
ShopCategorySchema.index({ parentId: 1 });
ShopCategorySchema.index({ isActive: 1, sortOrder: -1 });

ShopCategorySchema.plugin(softDeletePlugin);

export const ShopCategory = m<IShopCategory>(
  "ShopCategory",
  ShopCategorySchema
) as SoftDeleteModel<IShopCategory>;
