import { type Document, Schema } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export interface ICategory extends Document, ISoftDelete {
  slug: string;
  name: string;
  label: string;
  iconName: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    slug: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    iconName: { type: String, required: true, default: "Trophy" },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

CategorySchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
CategorySchema.index({ isActive: 1, displayOrder: 1 });

CategorySchema.plugin(softDeletePlugin);

export const Category = m<ICategory>("Category", CategorySchema) as SoftDeleteModel<ICategory>;
