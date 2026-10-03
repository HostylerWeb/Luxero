import mongoose, { type Document, Schema } from "mongoose";
import { m } from "../db";

export interface IDrawSheet extends Document {
  competitionId: mongoose.Types.ObjectId;
  sheetId: string;
  sheetUrl: string;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DrawSheetSchema = new Schema<IDrawSheet>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    sheetId: { type: String, required: true },
    sheetUrl: { type: String, required: true },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

DrawSheetSchema.index({ competitionId: 1 }, { unique: true });

export const DrawSheet = m<IDrawSheet>("DrawSheet", DrawSheetSchema);
