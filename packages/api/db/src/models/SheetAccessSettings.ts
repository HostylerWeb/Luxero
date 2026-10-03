import { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface ISheetAccessSettings extends Document {
  whitelistedEmails: string[];
  driveFolderId?: string;
  updatedAt: Date;
}

const SheetAccessSettingsSchema = new Schema<ISheetAccessSettings>(
  {
    whitelistedEmails: { type: [String], default: [] },
    driveFolderId: { type: String, default: "" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const SheetAccessSettings = m<ISheetAccessSettings>(
  "SheetAccessSettings",
  SheetAccessSettingsSchema
);
