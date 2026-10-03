import { type Document, Schema, type Types } from "mongoose";
import { m } from "../db";
import { type ISoftDelete, SoftDeleteModel, softDeletePlugin } from "../plugins/soft-delete";

export type InstantPrizeType = "prize" | "competition_ticket";

export interface IInstantPrize extends Document, ISoftDelete {
  title: string;
  description?: string;
  value?: number;
  images: string[];
  isActive: boolean;
  type: InstantPrizeType;
  linkedCompetitionId?: Types.ObjectId;
  ticketCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InstantPrizeSchema = new Schema<IInstantPrize>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [1, "Title cannot be empty"],
    },
    description: { type: String },
    value: { type: Number, min: [0, "Value cannot be negative"] },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    type: {
      type: String,
      enum: {
        values: ["prize", "competition_ticket"],
        message: "Type must be 'prize' or 'competition_ticket'",
      },
      default: "prize",
    },
    linkedCompetitionId: { type: Schema.Types.ObjectId, ref: "Competition" },
    ticketCount: { type: Number, default: 1, min: [1, "Ticket count must be at least 1"] },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

InstantPrizeSchema.index({ isActive: 1 });
InstantPrizeSchema.index({ type: 1, isActive: 1 });
InstantPrizeSchema.index({ linkedCompetitionId: 1 });

InstantPrizeSchema.plugin(softDeletePlugin);

export const InstantPrize = m<IInstantPrize>(
  "InstantPrize",
  InstantPrizeSchema
) as SoftDeleteModel<IInstantPrize>;
